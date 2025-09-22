/**
 * 🔌 BASE ADAPTER PATTERN
 * 
 * Interface base para todos os adapters de dados.
 * Permite alternar entre diferentes backends (in-memory, Supabase, etc.)
 * sem mudanças na UI ou nos services.
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { ErrorCode, type AppError, errorHandler } from '../error-handler';
import type { 
  PaginationParams, 
  FilterParams, 
  PaginatedResponse, 
  ServiceResponse 
} from '../schemas';

export interface AdapterConfig {
  name: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

export interface AdapterContext {
  requestId: string;
  startTime: number;
  adapter: string;
  method: string;
  userId?: string;
}

/**
 * Interface base que todos os adapters devem implementar
 */
export abstract class BaseAdapter<T, CreateT = Omit<T, 'id' | 'createdAt' | 'updatedAt'>, UpdateT = Partial<CreateT>> {
  protected config: AdapterConfig;
  protected schema: z.ZodSchema<T>;
  protected createSchema: z.ZodSchema<CreateT>;
  protected updateSchema: z.ZodSchema<UpdateT>;

  constructor(
    config: AdapterConfig,
    schema: z.ZodSchema<T>,
    createSchema: z.ZodSchema<CreateT>,
    updateSchema: z.ZodSchema<UpdateT>
  ) {
    this.config = config;
    this.schema = schema;
    this.createSchema = createSchema;
    this.updateSchema = updateSchema;
  }

  /**
   * Cria contexto para rastreamento de operações
   */
  protected createContext(method: string, userId?: string): AdapterContext {
    return {
      requestId: uuidv4(),
      startTime: Date.now(),
      adapter: this.config.name,
      method,
      userId
    };
  }

  /**
   * Valida dados de entrada
   */
  protected validateInput<S>(schema: z.ZodSchema<S>, data: unknown): S {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      throw errorHandler.createError(
        ErrorCode.VALIDATION_ERROR,
        `Validation failed: ${result.error.message}`,
        'Dados inválidos fornecidos.',
        { adapter: this.config.name }
      );
    }
    
    return result.data;
  }

  /**
   * Valida dados de saída
   */
  protected validateOutput(data: unknown): T {
    const result = this.schema.safeParse(data);
    
    if (!result.success) {
      throw errorHandler.createError(
        ErrorCode.SCHEMA_ERROR,
        `Schema validation failed: ${result.error.message}`,
        'Erro interno do sistema.',
        { adapter: this.config.name }
      );
    }
    
    return result.data;
  }

  /**
   * Wrapper para operações com error handling e logging
   */
  protected async executeOperation<R>(
    context: AdapterContext,
    operation: () => Promise<R>
  ): Promise<ServiceResponse<R>> {
    try {
      const result = await operation();
      
      const duration = Date.now() - context.startTime;
      
      // Log de sucesso em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ ${context.adapter}.${context.method} (${duration}ms)`, {
          requestId: context.requestId
        });
      }

      return {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          source: this.config.name === 'memory' ? 'mock' : 'api',
          requestId: context.requestId
        }
      };
    } catch (error) {
      const duration = Date.now() - context.startTime;
      
      const appError = error instanceof AppError 
        ? error 
        : errorHandler.handleUnknownError(error, {
            ...context,
            duration
          });

      return {
        success: false,
        error: {
          code: appError.code,
          message: appError.userMessage,
          details: process.env.NODE_ENV === 'development' ? appError.message : undefined
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: this.config.name === 'memory' ? 'mock' : 'api',
          requestId: context.requestId
        }
      };
    }
  }

  // ==============================
  // MÉTODOS ABSTRATOS - CRUD
  // ==============================

  /**
   * Lista entidades com filtros e paginação
   */
  abstract list(
    pagination: PaginationParams,
    filters?: FilterParams,
    userId?: string
  ): Promise<ServiceResponse<PaginatedResponse<T>>>;

  /**
   * Busca entidade por ID
   */
  abstract get(id: string, userId?: string): Promise<ServiceResponse<T | null>>;

  /**
   * Cria nova entidade
   */
  abstract create(data: CreateT, userId?: string): Promise<ServiceResponse<T>>;

  /**
   * Atualiza entidade existente
   */
  abstract update(id: string, data: UpdateT, userId?: string): Promise<ServiceResponse<T>>;

  /**
   * Remove entidade
   */
  abstract delete(id: string, userId?: string): Promise<ServiceResponse<boolean>>;

  /**
   * Conta total de entidades com filtros
   */
  abstract count(filters?: FilterParams, userId?: string): Promise<ServiceResponse<number>>;

  // ==============================
  // MÉTODOS OPCIONAIS
  // ==============================

  /**
   * Busca por múltiplos IDs
   */
  async getMany(ids: string[], userId?: string): Promise<ServiceResponse<T[]>> {
    const context = this.createContext('getMany', userId);
    
    return this.executeOperation(context, async () => {
      const results: T[] = [];
      
      for (const id of ids) {
        const response = await this.get(id, userId);
        if (response.success && response.data) {
          results.push(response.data);
        }
      }
      
      return results;
    });
  }

  /**
   * Busca com filtros personalizados
   */
  async search(query: string, filters?: FilterParams, userId?: string): Promise<ServiceResponse<T[]>> {
    const searchFilters = { ...filters, search: query };
    const response = await this.list(
      { page: 1, limit: 50 },
      searchFilters,
      userId
    );
    
    return {
      ...response,
      data: response.data?.data || []
    };
  }

  /**
   * Verifica se adapter está funcionando
   */
  async healthCheck(): Promise<ServiceResponse<{ status: string; timestamp: string }>> {
    const context = this.createContext('healthCheck');
    
    return this.executeOperation(context, async () => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    });
  }
}

/**
 * Factory para criar adapters
 */
export interface AdapterFactory<T, CreateT, UpdateT> {
  create(config: AdapterConfig): BaseAdapter<T, CreateT, UpdateT>;
}

/**
 * Registry para gerenciar adapters
 */
export class AdapterRegistry {
  private static instance: AdapterRegistry;
  private adapters = new Map<string, BaseAdapter<any, any, any>>();
  
  static getInstance(): AdapterRegistry {
    if (!AdapterRegistry.instance) {
      AdapterRegistry.instance = new AdapterRegistry();
    }
    return AdapterRegistry.instance;
  }

  register<T, CreateT, UpdateT>(
    name: string,
    adapter: BaseAdapter<T, CreateT, UpdateT>
  ): void {
    this.adapters.set(name, adapter);
  }

  get<T, CreateT, UpdateT>(name: string): BaseAdapter<T, CreateT, UpdateT> {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      throw errorHandler.createError(
        ErrorCode.ADAPTER_ERROR,
        `Adapter ${name} not found`,
        'Erro de configuração do sistema.',
        { adapter: name }
      );
    }
    return adapter;
  }

  has(name: string): boolean {
    return this.adapters.has(name);
  }

  list(): string[] {
    return Array.from(this.adapters.keys());
  }

  async healthCheckAll(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    for (const [name, adapter] of this.adapters) {
      try {
        const result = await adapter.healthCheck();
        results[name] = result;
      } catch (error) {
        results[name] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
    
    return results;
  }
}

export const adapterRegistry = AdapterRegistry.getInstance();