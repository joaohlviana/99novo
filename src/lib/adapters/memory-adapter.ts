/**
 * 💾 MEMORY ADAPTER
 * 
 * Implementação in-memory do adapter para dados mock.
 * Simula operações de banco de dados em memória para desenvolvimento e testes.
 */

import { z } from 'zod';
import { BaseAdapter, type AdapterConfig } from './base-adapter';
import { ErrorCode, errorHandler } from '../error-handler';
import type { 
  PaginationParams, 
  FilterParams, 
  PaginatedResponse, 
  ServiceResponse 
} from '../schemas';

export class MemoryAdapter<T extends { id: string; createdAt: string; updatedAt: string }, CreateT, UpdateT> extends BaseAdapter<T, CreateT, UpdateT> {
  private data: Map<string, T> = new Map();
  private initialized = false;

  constructor(
    config: AdapterConfig,
    schema: z.ZodSchema<T>,
    createSchema: z.ZodSchema<CreateT>,
    updateSchema: z.ZodSchema<UpdateT>,
    private initialData: T[] = []
  ) {
    super(config, schema, createSchema, updateSchema);
    this.init();
  }

  /**
   * Inicializa dados mock
   */
  private init(): void {
    if (this.initialized) return;
    
    this.initialData.forEach(item => {
      this.data.set(item.id, item);
    });
    
    this.initialized = true;
  }

  /**
   * Gera ID único
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Aplica filtros aos dados
   */
  private applyFilters(items: T[], filters?: FilterParams): T[] {
    if (!filters) return items;

    return items.filter(item => {
      // Filtro de busca genérica
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const itemStr = JSON.stringify(item).toLowerCase();
        if (!itemStr.includes(searchTerm)) return false;
      }

      // Filtros específicos podem ser implementados por domínio
      // Esta é uma implementação genérica básica
      for (const [key, value] of Object.entries(filters)) {
        if (key === 'search') continue;
        
        if (value !== undefined && value !== null) {
          const itemValue = (item as any)[key];
          
          if (Array.isArray(value)) {
            // Range filters (ex: priceRange)
            if (key.includes('Range') && value.length === 2) {
              const numericValue = Number(itemValue);
              if (!isNaN(numericValue)) {
                if (numericValue < value[0] || numericValue > value[1]) return false;
              }
            }
          } else if (typeof value === 'string' && itemValue) {
            if (itemValue.toString().toLowerCase() !== value.toLowerCase()) return false;
          } else if (typeof value === 'number' && itemValue) {
            if (Number(itemValue) !== value) return false;
          }
        }
      }

      return true;
    });
  }

  /**
   * Aplica ordenação aos dados
   */
  private applySorting(items: T[], sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): T[] {
    if (!sortBy) {
      // Ordenação padrão por data de criação
      return items.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    return items.sort((a, b) => {
      const valueA = (a as any)[sortBy];
      const valueB = (b as any)[sortBy];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const comparison = valueA.localeCompare(valueB);
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }

      // Para outros tipos, converter para string
      const strA = String(valueA || '');
      const strB = String(valueB || '');
      const comparison = strA.localeCompare(strB);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Lista entidades com filtros e paginação
   */
  async list(
    pagination: PaginationParams,
    filters?: FilterParams,
    userId?: string
  ): Promise<ServiceResponse<PaginatedResponse<T>>> {
    const context = this.createContext('list', userId);
    
    return this.executeOperation(context, async () => {
      // Valida parâmetros de paginação
      const validPagination = this.validateInput(
        z.object({
          page: z.number().min(1),
          limit: z.number().min(1).max(100),
          sortBy: z.string().optional(),
          sortOrder: z.enum(['asc', 'desc']).optional()
        }),
        pagination
      );

      const allItems = Array.from(this.data.values());
      
      // Aplica filtros
      const filteredItems = this.applyFilters(allItems, filters);
      
      // Aplica ordenação
      const sortedItems = this.applySorting(
        filteredItems, 
        validPagination.sortBy, 
        validPagination.sortOrder
      );

      // Calcula paginação
      const total = sortedItems.length;
      const totalPages = Math.ceil(total / validPagination.limit);
      const offset = (validPagination.page - 1) * validPagination.limit;
      const paginatedItems = sortedItems.slice(offset, offset + validPagination.limit);

      return {
        data: paginatedItems,
        pagination: {
          page: validPagination.page,
          limit: validPagination.limit,
          total,
          totalPages,
          hasNext: validPagination.page < totalPages,
          hasPrev: validPagination.page > 1
        }
      };
    });
  }

  /**
   * Busca entidade por ID
   */
  async get(id: string, userId?: string): Promise<ServiceResponse<T | null>> {
    const context = this.createContext('get', userId);
    
    return this.executeOperation(context, async () => {
      const item = this.data.get(id);
      return item || null;
    });
  }

  /**
   * Cria nova entidade
   */
  async create(data: CreateT, userId?: string): Promise<ServiceResponse<T>> {
    const context = this.createContext('create', userId);
    
    return this.executeOperation(context, async () => {
      // Valida dados de entrada
      const validData = this.validateInput(this.createSchema, data);
      
      // Cria novo item com timestamps
      const now = new Date().toISOString();
      const newItem = {
        id: this.generateId(),
        ...validData,
        createdAt: now,
        updatedAt: now
      } as T;

      // Valida dados de saída
      const validatedItem = this.validateOutput(newItem);
      
      // Armazena em memória
      this.data.set(validatedItem.id, validatedItem);
      
      return validatedItem;
    });
  }

  /**
   * Atualiza entidade existente
   */
  async update(id: string, data: UpdateT, userId?: string): Promise<ServiceResponse<T>> {
    const context = this.createContext('update', userId);
    
    return this.executeOperation(context, async () => {
      const existingItem = this.data.get(id);
      
      if (!existingItem) {
        throw errorHandler.createError(
          ErrorCode.NOT_FOUND,
          `Item with id ${id} not found`,
          'Item não encontrado.',
          context
        );
      }

      // Valida dados de entrada
      const validData = this.validateInput(this.updateSchema, data);
      
      // Atualiza item
      const updatedItem = {
        ...existingItem,
        ...validData,
        updatedAt: new Date().toISOString()
      } as T;

      // Valida dados de saída
      const validatedItem = this.validateOutput(updatedItem);
      
      // Armazena em memória
      this.data.set(id, validatedItem);
      
      return validatedItem;
    });
  }

  /**
   * Remove entidade
   */
  async delete(id: string, userId?: string): Promise<ServiceResponse<boolean>> {
    const context = this.createContext('delete', userId);
    
    return this.executeOperation(context, async () => {
      const existed = this.data.has(id);
      
      if (!existed) {
        throw errorHandler.createError(
          ErrorCode.NOT_FOUND,
          `Item with id ${id} not found`,
          'Item não encontrado.',
          context
        );
      }

      this.data.delete(id);
      return true;
    });
  }

  /**
   * Conta total de entidades com filtros
   */
  async count(filters?: FilterParams, userId?: string): Promise<ServiceResponse<number>> {
    const context = this.createContext('count', userId);
    
    return this.executeOperation(context, async () => {
      const allItems = Array.from(this.data.values());
      const filteredItems = this.applyFilters(allItems, filters);
      return filteredItems.length;
    });
  }

  /**
   * Limpa todos os dados (útil para testes)
   */
  async clear(): Promise<void> {
    this.data.clear();
    this.initialized = false;
    this.init();
  }

  /**
   * Exporta todos os dados (útil para debug)
   */
  exportData(): T[] {
    return Array.from(this.data.values());
  }

  /**
   * Importa dados (útil para testes e seeds)
   */
  importData(items: T[]): void {
    this.data.clear();
    items.forEach(item => {
      this.data.set(item.id, item);
    });
  }

  /**
   * Health check específico do memory adapter
   */
  async healthCheck(): Promise<ServiceResponse<{ status: string; timestamp: string; itemCount: number }>> {
    const context = this.createContext('healthCheck');
    
    return this.executeOperation(context, async () => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        itemCount: this.data.size
      };
    });
  }
}

/**
 * Factory para criar memory adapters
 */
export class MemoryAdapterFactory<T extends { id: string; createdAt: string; updatedAt: string }, CreateT, UpdateT> {
  constructor(
    private schema: z.ZodSchema<T>,
    private createSchema: z.ZodSchema<CreateT>,
    private updateSchema: z.ZodSchema<UpdateT>,
    private initialData: T[] = []
  ) {}

  create(config: AdapterConfig): MemoryAdapter<T, CreateT, UpdateT> {
    return new MemoryAdapter(
      config,
      this.schema,
      this.createSchema,
      this.updateSchema,
      this.initialData
    );
  }
}