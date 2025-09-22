/**
 * 🗄️ SUPABASE ADAPTER
 * 
 * Implementação do adapter para Supabase seguindo as melhores práticas:
 * - Anon key para leituras
 * - Service key para escritas (apenas em funções server/edge)
 * - Views versionadas para UI
 * - Políticas RLS seguras
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BaseAdapter } from './base-adapter';
import { appConfig } from '../config';
import { errorHandler, ErrorCode } from '../error-handler';

export class SupabaseAdapter extends BaseAdapter {
  private clientSupabase: SupabaseClient | null = null;
  private serviceSupabase: SupabaseClient | null = null;
  
  constructor() {
    super();
    this.initializeClients();
  }

  private initializeClients() {
    if (!appConfig.supabase?.url || !appConfig.supabase?.anonKey) {
      throw new Error('Supabase URL and anon key are required');
    }

    // Cliente para leituras (browser) - apenas anon key
    this.clientSupabase = createClient(
      appConfig.supabase.url,
      appConfig.supabase.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      }
    );

    // Cliente para escritas (server/edge) - service key
    // ⚠️ Service key deve vir de variável de ambiente do servidor apenas
    const serverServiceKey = this.isServerEnvironment() ? 
      (globalThis as any).process?.env?.SUPABASE_SERVICE_ROLE_KEY : 
      undefined;
      
    if (serverServiceKey && this.isServerEnvironment()) {
      this.serviceSupabase = createClient(
        appConfig.supabase.url,
        serverServiceKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );
    }
  }

  private isServerEnvironment(): boolean {
    return typeof window === 'undefined';
  }

  private getReadClient(): SupabaseClient {
    if (!this.clientSupabase) {
      throw new Error('Supabase client not initialized');
    }
    return this.clientSupabase;
  }

  private getWriteClient(): SupabaseClient {
    // Em produção, escritas devem ser feitas via funções edge/server
    if (!this.serviceSupabase) {
      // Fallback para desenvolvimento
      if (appConfig.development?.enableMocks) {
        return this.getReadClient();
      }
      throw new Error('Service client not available. Use edge functions for writes.');
    }
    return this.serviceSupabase;
  }

  // ===============================
  // TRAINERS - Views Versionadas
  // ===============================

  async getTrainers(filters?: any, pagination?: any) {
    try {
      const startTime = performance.now();
      const requestId = crypto.randomUUID();
      
      let query = this.getReadClient()
        .from('99_v_trainers_v1') // View versionada
        .select('*');
      
      // Aplicar filtros
      if (filters?.query) {
        query = query.textSearch('search_vector', filters.query);
      }
      
      if (filters?.categories?.length) {
        query = query.in('specialties', filters.categories);
      }
      
      if (filters?.serviceModes?.length) {
        query = query.overlaps('service_modes', filters.serviceModes);
      }
      
      if (filters?.rating) {
        query = query.gte('rating', filters.rating);
      }
      
      if (filters?.verified !== undefined) {
        query = query.eq('is_verified', filters.verified);
      }
      
      // Paginação
      if (pagination?.page && pagination?.limit) {
        const start = (pagination.page - 1) * pagination.limit;
        const end = start + pagination.limit - 1;
        query = query.range(start, end);
      }
      
      // Ordenação
      const sortBy = filters?.sortBy || 'relevance_score';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      const { data, error, count } = await query;
      const duration = performance.now() - startTime;
      
      if (error) {
        throw errorHandler.createError(
          ErrorCode.API_ERROR,
          error.message,
          'Erro ao buscar treinadores',
          {
            adapter: 'supabase',
            method: 'getTrainers',
            requestId,
            duration,
            metadata: { filters, pagination }
          }
        );
      }
      
      return {
        success: true,
        data: {
          data: data || [],
          pagination: pagination ? {
            page: pagination.page,
            limit: pagination.limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / pagination.limit),
            hasNext: pagination.page * pagination.limit < (count || 0),
            hasPrev: pagination.page > 1
          } : undefined
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase' as const,
          requestId,
          duration
        }
      };
    } catch (error) {
      return this.handleError(error, 'getTrainers');
    }
  }

  async getTrainerById(id: string) {
    try {
      const startTime = performance.now();
      const requestId = crypto.randomUUID();
      
      const { data, error } = await this.getReadClient()
        .from('99_v_trainers_v1')
        .select('*')
        .eq('id', id)
        .single();
      
      const duration = performance.now() - startTime;
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw errorHandler.createError(
            ErrorCode.NOT_FOUND,
            `Trainer ${id} not found`,
            'Treinador não encontrado',
            { adapter: 'supabase', method: 'getTrainerById', requestId, duration }
          );
        }
        
        throw errorHandler.createError(
          ErrorCode.API_ERROR,
          error.message,
          'Erro ao buscar treinador',
          { adapter: 'supabase', method: 'getTrainerById', requestId, duration }
        );
      }
      
      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase' as const,
          requestId,
          duration
        }
      };
    } catch (error) {
      return this.handleError(error, 'getTrainerById');
    }
  }

  // ===============================
  // PROGRAMS - Views Versionadas
  // ===============================

  async getPrograms(filters?: any, pagination?: any) {
    try {
      const startTime = performance.now();
      const requestId = crypto.randomUUID();
      
      let query = this.getReadClient()
        .from('99_v_programs_v1') // View versionada
        .select('*');
      
      // Aplicar filtros
      if (filters?.trainerId) {
        query = query.eq('trainer_id', filters.trainerId);
      }
      
      if (filters?.level?.length) {
        query = query.in('level', filters.level);
      }
      
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters?.priceRange) {
        query = query.gte('price', filters.priceRange[0])
                    .lte('price', filters.priceRange[1]);
      }
      
      // Paginação
      if (pagination?.page && pagination?.limit) {
        const start = (pagination.page - 1) * pagination.limit;
        const end = start + pagination.limit - 1;
        query = query.range(start, end);
      }
      
      const { data, error, count } = await query;
      const duration = performance.now() - startTime;
      
      if (error) {
        throw errorHandler.createError(
          ErrorCode.API_ERROR,
          error.message,
          'Erro ao buscar programas',
          {
            adapter: 'supabase',
            method: 'getPrograms',
            requestId,
            duration,
            metadata: { filters, pagination }
          }
        );
      }
      
      return {
        success: true,
        data: {
          data: data || [],
          pagination: pagination ? {
            page: pagination.page,
            limit: pagination.limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / pagination.limit),
            hasNext: pagination.page * pagination.limit < (count || 0),
            hasPrev: pagination.page > 1
          } : undefined
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase' as const,
          requestId,
          duration
        }
      };
    } catch (error) {
      return this.handleError(error, 'getPrograms');
    }
  }

  // ===============================
  // WRITE OPERATIONS (Server/Edge only)
  // ===============================

  async createTrainer(trainerData: any) {
    try {
      const startTime = performance.now();
      const requestId = crypto.randomUUID();
      
      // Validar que estamos em ambiente server/edge
      if (!this.serviceSupabase && !appConfig.development?.enableMocks) {
        throw new Error('Write operations must be performed via edge functions');
      }
      
      const { data, error } = await this.getWriteClient()
        .from('trainers') // Tabela real, não view
        .insert(trainerData)
        .select()
        .single();
      
      const duration = performance.now() - startTime;
      
      if (error) {
        throw errorHandler.createError(
          ErrorCode.API_ERROR,
          error.message,
          'Erro ao criar treinador',
          { adapter: 'supabase', method: 'createTrainer', requestId, duration }
        );
      }
      
      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase' as const,
          requestId,
          duration
        }
      };
    } catch (error) {
      return this.handleError(error, 'createTrainer');
    }
  }

  async updateTrainer(id: string, updates: any) {
    try {
      const startTime = performance.now();
      const requestId = crypto.randomUUID();
      
      const { data, error } = await this.getWriteClient()
        .from('trainers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      const duration = performance.now() - startTime;
      
      if (error) {
        throw errorHandler.createError(
          ErrorCode.API_ERROR,
          error.message,
          'Erro ao atualizar treinador',
          { adapter: 'supabase', method: 'updateTrainer', requestId, duration }
        );
      }
      
      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase' as const,
          requestId,
          duration
        }
      };
    } catch (error) {
      return this.handleError(error, 'updateTrainer');
    }
  }

  // ===============================
  // HELPER METHODS
  // ===============================

  private handleError(error: any, method: string) {
    if (error.name === 'AppError') {
      return { success: false, error };
    }
    
    return {
      success: false,
      error: errorHandler.createError(
        ErrorCode.ADAPTER_ERROR,
        error.message || 'Unknown adapter error',
        'Erro interno do sistema',
        {
          adapter: 'supabase',
          method,
          requestId: crypto.randomUUID(),
          metadata: { originalError: error }
        }
      )
    };
  }

  async testConnection() {
    try {
      const { data, error } = await this.getReadClient()
        .from('99_v_trainers_v1')
        .select('count')
        .limit(1);
      
      return { success: !error, error };
    } catch (error) {
      return { success: false, error };
    }
  }
}