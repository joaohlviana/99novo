/**
 * 🎯 PROGRAMS SERVICE UNIFICADO - FASE 2 CONSOLIDAÇÃO
 * ===================================================
 * Service único consolidando todas as funcionalidades de programas
 * Substitui: programs.service.ts, training-programs.service.ts, published-programs.service.ts
 */

import { createClient } from '../lib/supabase/client';
import { projectId, publicAnonKey, apiBaseUrl } from '../utils/supabase/info';
import { 
  TrainingProgramRecord, 
  TrainingProgramJsonbData,
  programDataToJsonb,
  jsonbToProgramData,
  ProgramData,
  extractJsonbField
} from '../types/training-program';
import { ServiceResponse, FilterParams, PaginatedResponse, PaginationParams } from './index';
import { Program, ProgramLevel, ProgramType, ServiceMode } from '../types/entities';

// ===============================================
// TIPOS UNIFICADOS
// ===============================================

export interface UnifiedProgramFilters extends FilterParams {
  trainer_id?: string;
  trainerId?: string; // Alias para compatibilidade
  is_published?: boolean;
  status?: 'draft' | 'published' | 'archived' | 'suspended';
  category?: string;
  modality?: string;
  level?: ProgramLevel | ProgramLevel[];
  type?: ProgramType | ProgramType[];
  serviceMode?: ServiceMode | ServiceMode[];
  priceRange?: [number, number];
  min_price?: number;
  max_price?: number;
  duration?: {
    min?: number;
    max?: number;
  };
  duration_min?: number;
  duration_max?: number;
  rating?: number;
  featured?: boolean;
  trending?: boolean;
  hasDiscount?: boolean;
  language?: string[];
  certificateOffered?: boolean;
  tags?: string[];
  search?: string;
}

export interface CreateProgramInput extends ProgramData {
  trainer_id?: string;
}

export interface UpdateProgramData {
  is_published?: boolean;
  status?: 'draft' | 'published' | 'archived' | 'suspended';
  program_data?: Partial<TrainingProgramJsonbData>;
}

// ===============================================
// SERVICE CONSOLIDADO
// ===============================================

class ProgramsUnifiedService {
  private supabase = createClient();
  private readonly tableName = '99_training_programs';

  // ===============================================
  // MÉTODOS AUXILIARES
  // ===============================================

  private normalizeStatus(status: string | null | undefined): string {
    if (!status) return '';
    return status.trim().toLowerCase();
  }

  private shouldApproveProgram(isPublished: boolean, status: string | null | undefined): boolean {
    if (!isPublished) return false;
    
    const normalizedStatus = this.normalizeStatus(status);
    const rejectedStatuses = ['archived', 'draft'];
    
    return !rejectedStatuses.includes(normalizedStatus);
  }

  private transformHybridToProgram(hybridData: any): Program {
    const programData = hybridData.program_data || {};
    
    return {
      id: hybridData.id,
      title: programData.basic_info?.title || hybridData.title || 'Programa de Treinamento',
      description: programData.description?.overview || 'Programa completo de treinamento.',
      shortDescription: programData.description?.short_description || programData.description?.overview?.substring(0, 150) + '...',
      trainer: {
        id: hybridData.trainer_id,
        name: programData.trainer?.name || 'Treinador Especialista',
        avatar: programData.trainer?.avatar,
        isVerified: true,
        title: 'Personal Trainer Certificado',
        rating: programData.trainer?.rating || 4.5,
        reviewCount: programData.stats?.reviewCount || 0,
        specialties: programData.trainer?.specialties || []
      },
      category: programData.basic_info?.category || hybridData.category || 'Fitness',
      subcategory: programData.basic_info?.subcategory || 'Geral',
      level: (programData.basic_info?.level || hybridData.level || 'intermediate') as ProgramLevel,
      type: (programData.basic_info?.type || 'course') as ProgramType,
      duration: {
        weeks: programData.basic_info?.duration || hybridData.duration || 12,
        sessions: programData.structure?.total_sessions || (hybridData.frequency || 3) * (hybridData.duration || 12),
        hoursPerWeek: programData.structure?.session_duration || hybridData.frequency || 4,
        totalHours: (hybridData.duration || 12) * (hybridData.frequency || 4),
        flexible: programData.settings?.flexible || true
      },
      pricing: {
        type: 'one_time',
        amount: programData.basic_info?.base_price || hybridData.base_price || 0,
        currency: 'BRL',
        originalPrice: programData.pricing?.originalPrice || (hybridData.base_price || 0) * 1.2,
        discountPercentage: programData.pricing?.discount_percentage || 0,
        paymentPlans: programData.pricing?.packages || [],
        freeTrialDays: programData.pricing?.free_trial_days || 0
      },
      content: programData.content || [],
      requirements: programData.description?.requirements || [],
      features: programData.description?.what_you_get || [],
      stats: {
        enrollments: programData.analytics?.enrollments || 0,
        activeStudents: programData.analytics?.active_students || 0,
        completionRate: programData.analytics?.completion_rate || 0.75,
        averageRating: programData.analytics?.average_rating || 4.5,
        reviewCount: programData.analytics?.reviews_count || 0,
        totalRevenue: programData.analytics?.total_revenue || 0,
        conversionRate: programData.analytics?.conversion_rate || 0.12
      },
      media: programData.gallery?.images ? 
        programData.gallery.images.map((img: any, index: number) => ({
          id: `${hybridData.id}_image_${index}`,
          type: 'image',
          url: img.url,
          thumbnail: img.url,
          title: img.alt || `Imagem ${index + 1}`,
          alt: img.alt || hybridData.title
        })) : [{
          id: `${hybridData.id}_cover`,
          type: 'image',
          url: programData.gallery?.cover_image?.url || 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
          thumbnail: programData.gallery?.cover_image?.url || 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
          title: 'Imagem de capa',
          alt: programData.basic_info?.title || 'Programa de treinamento'
        }],
      reviews: programData.reviews || [],
      tags: programData.basic_info?.tags || [],
      isPublished: hybridData.is_published || false,
      isActive: hybridData.is_published || false,
      publishedAt: hybridData.created_at,
      metadata: {
        difficulty: programData.settings?.difficulty_level || 6,
        intensity: programData.metadata?.intensity || 7,
        popularity: programData.analytics?.popularity || 50,
        trending: programData.metadata?.trending || false,
        featured: programData.metadata?.featured || false,
        certificateOffered: programData.settings?.certificate_offered || false,
        languagesAvailable: ['pt-BR'],
        accessDuration: programData.settings?.access_duration || 365,
        supportIncluded: programData.settings?.support_included || true
      },
      createdAt: hybridData.created_at,
      updatedAt: hybridData.updated_at
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===============================================
  // MÉTODOS PRINCIPAIS - BUSCA
  // ===============================================

  /**
   * Buscar todos os programas publicados com paginação
   */
  async getAllPrograms(params?: PaginationParams): Promise<ServiceResponse<PaginatedResponse<Program>>> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;
      
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Erro ao buscar programas:', error);
        throw error;
      }

      const programs = (data || []).map(item => this.transformHybridToProgram(item));
      const total = count || 0;

      return {
        success: true,
        data: {
          data: programs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: (page * limit) < total,
            hasPrev: page > 1
          }
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase_hybrid',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      console.error('❌ Erro em getAllPrograms:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Erro ao buscar programas'
        }
      };
    }
  }

  /**
   * Buscar programa por ID
   */
  async getProgramById(id: string): Promise<ServiceResponse<Program>> {
    try {
      if (!id || id.trim() === '' || id === 'undefined') {
        return {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID do programa é obrigatório e deve ser válido'
          }
        };
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: {
              code: 'PROGRAM_NOT_FOUND',
              message: `Programa com ID '${id}' não encontrado`
            }
          };
        }
        throw error;
      }

      const program = this.transformHybridToProgram(data);

      return {
        success: true,
        data: program,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase_hybrid',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      console.error('❌ Erro em getProgramById:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Erro ao buscar programa'
        }
      };
    }
  }

  /**
   * Buscar programas por trainer ID
   */
  async getProgramsByTrainer(trainerId: string, params?: PaginationParams): Promise<ServiceResponse<PaginatedResponse<Program>>> {
    try {
      if (!trainerId || trainerId.trim() === '' || trainerId === 'undefined') {
        return {
          success: false,
          error: {
            code: 'INVALID_TRAINER_ID',
            message: 'ID do treinador é obrigatório e deve ser válido'
          }
        };
      }

      // 🎯 VALIDAÇÃO UUID: verificar se trainerId é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(trainerId)) {
        console.warn('⚠️ TrainerId não é um UUID válido:', trainerId);
        return {
          success: true,
          data: {
            data: [],
            pagination: {
              page: 1,
              limit: params?.limit || 20,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false
            }
          },
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'validation_fallback',
            requestId: this.generateRequestId()
          }
        };
      }

      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;

      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('trainer_id', trainerId)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Erro ao buscar programas do trainer:', error);
        throw error;
      }

      const programs = (data || []).map(item => this.transformHybridToProgram(item));
      const total = count || 0;

      return {
        success: true,
        data: {
          data: programs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: (page * limit) < total,
            hasPrev: page > 1
          }
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase_hybrid',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      console.error('❌ Erro em getProgramsByTrainer:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Erro ao buscar programas do treinador'
        }
      };
    }
  }

  /**
   * Buscar programas com filtros avançados
   */
  async searchPrograms(filters: UnifiedProgramFilters, params?: PaginationParams): Promise<ServiceResponse<PaginatedResponse<Program>>> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;

      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Aplicar filtros
      if (filters.trainer_id || filters.trainerId) {
        query = query.eq('trainer_id', filters.trainer_id || filters.trainerId);
      }

      if (filters.category) {
        query = query.eq('program_data->>basic_info->>category', filters.category);
      }

      if (filters.level) {
        const levels = Array.isArray(filters.level) ? filters.level : [filters.level];
        if (levels.length === 1) {
          query = query.eq('program_data->>basic_info->>level', levels[0]);
        } else {
          query = query.in('program_data->>basic_info->>level', levels);
        }
      }

      if (filters.min_price !== undefined) {
        query = query.gte('program_data->>basic_info->>base_price::numeric', filters.min_price);
      }

      if (filters.max_price !== undefined) {
        query = query.lte('program_data->>basic_info->>base_price::numeric', filters.max_price);
      }

      if (filters.search) {
        query = query.or(`
          program_data->'basic_info'->>'title'.ilike.%${filters.search}%,
          program_data->'description'->>'overview'.ilike.%${filters.search}%,
          program_data->'basic_info'->'tags'::text.ilike.%${filters.search}%
        `);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Erro na busca com filtros:', error);
        throw error;
      }

      const programs = (data || []).map(item => this.transformHybridToProgram(item));
      const total = count || 0;

      return {
        success: true,
        data: {
          data: programs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: (page * limit) < total,
            hasPrev: page > 1
          }
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase_hybrid',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      console.error('❌ Erro em searchPrograms:', error);
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: 'Erro na busca de programas'
        }
      };
    }
  }

  /**
   * Buscar programas em destaque
   */
  async getFeaturedPrograms(limit = 8): Promise<ServiceResponse<Program[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      const programs = (data || []).map(item => this.transformHybridToProgram(item));

      return {
        success: true,
        data: programs,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase_hybrid',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      console.error('❌ Erro em getFeaturedPrograms:', error);
      return {
        success: true, // Retornar sucesso com array vazio para não quebrar UI
        data: [],
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase_hybrid_fallback',
          requestId: this.generateRequestId()
        }
      };
    }
  }

  // ===============================================
  // MÉTODOS DE COMPATIBILIDADE (LEGADO)
  // ===============================================

  /**
   * Método de compatibilidade com training-programs.service.ts
   */
  async getByTrainerId(trainerId: string): Promise<ProgramData[]> {
    try {
      // 🎯 VALIDAÇÃO UUID: verificar se trainerId é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(trainerId)) {
        console.warn('⚠️ TrainerId não é um UUID válido no método de compatibilidade:', trainerId);
        return [];
      }

      const response = await this.getProgramsByTrainer(trainerId, { limit: 100 });
      
      if (response.success && response.data) {
        // Converter Program[] para ProgramData[]
        return response.data.data.map(program => ({
          id: program.id,
          trainerId: program.trainer.id,
          title: program.title,
          category: program.category,
          modality: program.type,
          level: program.level,
          tags: program.tags,
          description: program.description,
          objectives: program.content?.map(c => c.title) || [],
          requirements: program.requirements,
          whatYouGet: program.features,
          duration: program.duration.weeks || 12,
          durationType: 'weeks' as const,
          frequency: program.duration.hoursPerWeek || 3,
          sessionDuration: 60,
          schedule: [],
          packages: [{
            name: 'Pacote Completo',
            price: program.pricing.amount,
            description: program.shortDescription || program.description,
            features: program.features,
            deliveryTime: 7,
            revisions: 'unlimited' as const
          }],
          addOns: [],
          coverImage: program.media[0]?.url || '',
          gallery: program.media.map(m => m.url),
          videos: [],
          isPublished: program.isPublished,
          status: program.isActive ? 'published' as const : 'draft' as const,
          createdAt: program.createdAt,
          updatedAt: program.updatedAt,
          _rawRecord: undefined
        }));
      }
      
      return [];
    } catch (error) {
      console.error('❌ Erro em getByTrainerId (compatibilidade):', error);
      return [];
    }
  }
}

// ===============================================
// INSTÂNCIA SINGLETON
// ===============================================

export const programsUnifiedService = new ProgramsUnifiedService();
export default programsUnifiedService;

// ===============================================
// EXPORTS
// ===============================================

export type {
  UnifiedProgramFilters,
  CreateProgramInput,
  UpdateProgramData
};