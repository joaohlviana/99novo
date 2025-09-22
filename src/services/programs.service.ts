/**
 * 📚 PROGRAMS SERVICE
 * 
 * Gerencia todos os programas de treinamento da plataforma.
 * Centraliza dados de programas, cursos, consultorias e workshops.
 */

import { ServiceResponse, FilterParams, PaginatedResponse, PaginationParams } from './index';
import { Program, ProgramLevel, ProgramType, ServiceMode, ProgramSummary, SearchFilters } from '../types/entities';

export interface ProgramFilters extends FilterParams {
  trainerId?: string;
  level?: ProgramLevel[];
  type?: ProgramType[];
  serviceMode?: ServiceMode[];
  priceRange?: [number, number];
  duration?: {
    min?: number; // semanas
    max?: number; // semanas
  };
  rating?: number; // mínimo
  featured?: boolean;
  trending?: boolean;
  hasDiscount?: boolean;
  language?: string[];
  certificateOffered?: boolean;
}

export interface ProgramsService {
  getAllPrograms(params?: PaginationParams): Promise<ServiceResponse<PaginatedResponse<Program>>>;
  getProgramById(id: string): Promise<ServiceResponse<Program>>;
  getProgramsByTrainer(trainerId: string, params?: PaginationParams): Promise<ServiceResponse<PaginatedResponse<Program>>>;
  searchPrograms(filters: ProgramFilters, params?: PaginationParams): Promise<ServiceResponse<PaginatedResponse<Program>>>;
  getFeaturedPrograms(limit?: number): Promise<ServiceResponse<Program[]>>;
  getTrendingPrograms(limit?: number): Promise<ServiceResponse<Program[]>>;
  getPopularPrograms(limit?: number): Promise<ServiceResponse<Program[]>>;
  getRecommendedPrograms(userId?: string, limit?: number): Promise<ServiceResponse<Program[]>>;
  getProgramsBySport(sportId: string, params?: PaginationParams): Promise<ServiceResponse<PaginatedResponse<Program>>>;
  createProgram(program: Partial<Program>): Promise<ServiceResponse<Program>>;
  updateProgram(id: string, updates: Partial<Program>): Promise<ServiceResponse<Program>>;
  deleteProgram(id: string): Promise<ServiceResponse<boolean>>;
  publishProgram(id: string): Promise<ServiceResponse<Program>>;
  unpublishProgram(id: string): Promise<ServiceResponse<Program>>;
}

// Implementação com dados reais do Supabase usando arquitetura híbrida
import { supabase } from '../lib/supabase/client';

export class ProgramsServiceImpl implements ProgramsService {
  private readonly tableName = '99_training_programs';
  private programs: Program[] = [];
  private initialized = false;

  constructor() {
    // Inicialização não necessária com dados reais
  }

  /**
   * Transforma dados do banco (híbrido) para o tipo Program
   */
  private transformHybridToProgram(hybridData: any): Program {
    const programData = hybridData.program_data || {};
    
    return {
      id: hybridData.id,
      title: hybridData.title,
      description: programData.description || 'Programa completo de treinamento.',
      shortDescription: programData.shortDescription || programData.description?.substring(0, 150) + '...',
      trainer: {
        id: hybridData.trainer_id,
        name: programData.trainerName || 'Treinador Especialista',
        avatar: programData.trainerAvatar,
        isVerified: true,
        title: 'Personal Trainer Certificado',
        rating: programData.trainerRating || 4.5,
        reviewCount: programData.reviewCount || 0,
        specialties: programData.trainerSpecialties || []
      },
      category: hybridData.category || programData.category || 'Fitness',
      subcategory: programData.subcategory || 'Geral',
      level: hybridData.level || programData.level || 'intermediate',
      type: programData.type || 'course',
      duration: {
        weeks: hybridData.duration || this.parseDuration(programData.duration).weeks,
        sessions: hybridData.frequency * (hybridData.duration || 12) || this.parseDuration(programData.duration).sessions,
        hoursPerWeek: programData.hoursPerWeek || hybridData.frequency || 4,
        totalHours: (hybridData.duration || 12) * (programData.hoursPerWeek || hybridData.frequency || 4),
        flexible: programData.flexible || true
      },
      pricing: {
        type: 'one_time',
        amount: hybridData.base_price || 0,
        currency: 'BRL',
        originalPrice: programData.originalPrice || hybridData.base_price * 1.2,
        discountPercentage: programData.discountPercentage || 0,
        paymentPlans: this.generatePaymentPlans(hybridData.base_price || 0),
        freeTrialDays: programData.freeTrialDays || 0
      },
      content: programData.content || this.generateDefaultContent(),
      requirements: programData.requirements || this.generateDefaultRequirements(),
      features: programData.features || [],
      stats: {
        enrollments: programData.enrollments || 0,
        activeStudents: programData.activeStudents || 0,
        completionRate: programData.completionRate || 0.75,
        averageRating: programData.averageRating || 4.5,
        reviewCount: programData.reviewCount || 0,
        totalRevenue: programData.totalRevenue || 0,
        conversionRate: programData.conversionRate || 0.12
      },
      media: programData.galleryImages ? 
        programData.galleryImages.map((url: string, index: number) => ({
          id: `${hybridData.id}_image_${index}`,
          type: 'image',
          url,
          thumbnail: url,
          title: `Imagem ${index + 1}`,
          alt: hybridData.title
        })) : [],
      reviews: programData.reviews || [],
      tags: programData.tags || [],
      isPublished: hybridData.is_published || hybridData.status === 'published',
      isActive: hybridData.is_published || hybridData.status === 'published',
      publishedAt: hybridData.created_at,
      metadata: {
        difficulty: programData.difficulty || 6,
        intensity: programData.intensity || 7,
        popularity: programData.popularity || 50,
        trending: programData.trending || false,
        featured: programData.featured || false,
        certificateOffered: programData.certificateOffered || false,
        languagesAvailable: ['pt-BR'],
        accessDuration: programData.accessDuration || 365,
        supportIncluded: programData.supportIncluded || true
      },
      createdAt: hybridData.created_at,
      updatedAt: hybridData.updated_at
    };
  }

  private async getPublishedPrograms(params?: PaginationParams): Promise<any[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      // Aplicar paginação se fornecida
      if (params?.page && params?.limit) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar programas híbridos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro na query de programas:', error);
      return [];
    }
  }

  // Métodos auxiliares para fallback com dados mock
  private async initializeData(): Promise<void> {
    if (this.initialized) return;
    
    // Dados mock para fallback
    const consolidatedPrograms = [
      {
        id: "1",
        title: "Treino Funcional Completo",
        description: "Programa focado em movimentos funcionais para melhorar força, resistência e mobilidade no dia a dia.",
        category: "Funcional",
        duration: "12 semanas",
        level: "Intermediário" as const,
        price: "R$ 297",
        students: "45 alunos",
        rating: 4.9,
        trainer: {
          id: "trainer-1",
          name: "João Silva",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
          initials: "JS"
        },
        features: [
          "3 treinos por semana",
          "Plano nutricional básico", 
          "Acompanhamento semanal",
          "Exercícios em vídeo",
          "Suporte via WhatsApp"
        ],
        image: "https://images.unsplash.com/photo-1734188341701-5a0b7575efbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdW5jdGlvbmFsJTIwdHJhaW5pbmclMjB3b3Jrb3V0fGVufDF8fHx8MTc1NjEzMTY1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      }
    ];
    
    this.programs = consolidatedPrograms.map((program, index) => this.transformToFullProgram(program, index));
    
    this.initialized = true;
  }

  private transformToFullProgram(mockProgram: any, index: number): Program {
    const baseId = mockProgram.id || `program_${index + 1}`;
    
    return {
      id: baseId,
      title: mockProgram.title,
      description: mockProgram.description || 'Programa completo de treinamento personalizado.',
      shortDescription: mockProgram.description?.substring(0, 150) + '...',
      trainer: {
        id: mockProgram.trainer?.id || `trainer_${index + 1}`,
        name: mockProgram.trainer?.name || 'Treinador Especialista',
        avatar: mockProgram.trainer?.avatar,
        isVerified: true,
        title: 'Personal Trainer Certificado',
        rating: mockProgram.rating || 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 100) + 10,
        specialties: [mockProgram.category || 'Fitness']
      },
      category: mockProgram.category || 'Fitness',
      subcategory: this.getSubcategory(mockProgram.category),
      level: mockProgram.level || 'intermediate',
      type: this.getProgramType(mockProgram),
      duration: {
        weeks: this.parseDuration(mockProgram.duration).weeks,
        sessions: this.parseDuration(mockProgram.duration).sessions,
        hoursPerWeek: 4,
        totalHours: this.parseDuration(mockProgram.duration).weeks * 4,
        flexible: true
      },
      pricing: {
        type: 'one_time',
        amount: this.parsePrice(mockProgram.price),
        currency: 'BRL',
        originalPrice: this.parsePrice(mockProgram.price) * 1.2,
        discountPercentage: 17,
        paymentPlans: this.generatePaymentPlans(this.parsePrice(mockProgram.price)),
        freeTrialDays: 7
      },
      content: this.generateProgramContent(mockProgram),
      requirements: this.generateRequirements(mockProgram),
      features: mockProgram.features || this.generateFeatures(),
      stats: {
        enrollments: parseInt(mockProgram.students?.replace(/\D/g, '') || '0') || Math.floor(Math.random() * 200) + 20,
        activeStudents: Math.floor(Math.random() * 50) + 10,
        completionRate: 0.75 + Math.random() * 0.2,
        averageRating: mockProgram.rating || 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 100) + 5,
        totalRevenue: this.parsePrice(mockProgram.price) * (Math.floor(Math.random() * 100) + 20),
        conversionRate: 0.12 + Math.random() * 0.08
      },
      media: [
        {
          id: `${baseId}_main_image`,
          type: 'image',
          url: mockProgram.image || `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80`,
          thumbnail: mockProgram.image || `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80`,
          title: 'Imagem principal do programa',
          alt: mockProgram.title
        }
      ],
      reviews: this.generateReviews(baseId),
      tags: this.generateTags(mockProgram),
      isPublished: true,
      isActive: true,
      publishedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        difficulty: Math.floor(Math.random() * 4) + 5, // 5-8
        intensity: Math.floor(Math.random() * 4) + 6, // 6-9
        popularity: Math.floor(Math.random() * 50) + 50,
        trending: Math.random() > 0.8,
        featured: Math.random() > 0.7,
        certificateOffered: Math.random() > 0.6,
        languagesAvailable: ['pt-BR'],
        accessDuration: 365,
        supportIncluded: true
      },
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async getAllPrograms(params?: PaginationParams): Promise<ServiceResponse<PaginatedResponse<Program>>> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      
      // Buscar programas híbridos publicados
      const hybridData = await this.getPublishedPrograms(params);
      
      // Transformar para o tipo Program
      const programs = hybridData.map(data => this.transformHybridToProgram(data));
      
      // Aplicar ordenação se necessário
      let sortedPrograms = [...programs];
      if (params?.sortBy) {
        sortedPrograms = this.sortPrograms(sortedPrograms, params.sortBy, params.sortOrder);
      }

      // Obter contagem total para paginação (sem limite)
      const { count } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      const total = count || 0;

      return {
        success: true,
        data: {
          data: sortedPrograms,
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
      console.error('❌ Erro ao buscar todos os programas:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Erro ao buscar programas'
        }
      };
    }
  }

  async getProgramById(id: string): Promise<ServiceResponse<Program>> {
    try {
      // Validação de entrada - previne erro de UUID "undefined"
      if (!id || id.trim() === '' || id === 'undefined') {
        console.warn('⚠️ getProgramById chamado com ID inválido:', id);
        return {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID do programa é obrigatório e deve ser válido'
          }
        };
      }

      console.log('🔍 Buscando programa por ID:', id);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('❌ Erro na busca por ID:', error);
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

      if (!data) {
        return {
          success: false,
          error: {
            code: 'PROGRAM_NOT_FOUND',
            message: `Programa com ID '${id}' não encontrado`
          }
        };
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
      console.error('❌ Erro ao buscar programa por ID:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Erro ao buscar programa'
        }
      };
    }
  }

  async getProgramsByTrainer(trainerId: string, params?: PaginationParams): Promise<ServiceResponse<PaginatedResponse<Program>>> {
    try {
      // Validação de entrada
      if (!trainerId || trainerId.trim() === '' || trainerId === 'undefined') {
        console.warn('⚠️ getProgramsByTrainer chamado com Trainer ID inválido:', trainerId);
        return {
          success: false,
          error: {
            code: 'INVALID_TRAINER_ID',
            message: 'ID do treinador é obrigatório e deve ser válido'
          }
        };
      }

      console.log('🔍 Buscando programas do treinador:', trainerId);

      // Tentar buscar no Supabase primeiro
      try {
        const { data: hybridData, error } = await supabase
          .from(this.tableName)
          .select('*')
          .eq('trainer_id', trainerId)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (!error && hybridData && hybridData.length > 0) {
          const programs = hybridData.map(data => this.transformHybridToProgram(data));
          
          const page = params?.page || 1;
          const limit = params?.limit || 20;
          const total = programs.length;
          
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedPrograms = programs.slice(startIndex, endIndex);

          return {
            success: true,
            data: {
              data: paginatedPrograms,
              pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: endIndex < total,
                hasPrev: page > 1
              }
            },
            metadata: {
              timestamp: new Date().toISOString(),
              source: 'supabase_hybrid',
              requestId: this.generateRequestId()
            }
          };
        }
      } catch (supabaseError) {
        console.warn('⚠️ Erro no Supabase, usando fallback:', supabaseError);
      }

      // Fallback para dados mock
      await this.initializeData();
      
      const trainerPrograms = this.programs.filter(p => p.trainer.id === trainerId && p.isPublished);
      
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const total = trainerPrograms.length;
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPrograms = trainerPrograms.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          data: paginatedPrograms,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: endIndex < total,
            hasPrev: page > 1
          }
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      console.error('❌ Erro ao buscar programas do treinador:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Erro ao buscar programas do treinador'
        }
      };
    }
  }

  async searchPrograms(filters: ProgramFilters, params?: PaginationParams): Promise<ServiceResponse<PaginatedResponse<Program>>> {
    await this.initializeData();
    
    let results = this.programs.filter(p => p.isPublished && p.isActive);

    // Aplicar filtros
    if (filters.search) {
      const query = filters.search.toLowerCase();
      results = results.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filters.category) {
      results = results.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.level && filters.level.length > 0) {
      results = results.filter(p => filters.level!.includes(p.level));
    }

    if (filters.type && filters.type.length > 0) {
      results = results.filter(p => filters.type!.includes(p.type));
    }

    if (filters.priceRange && filters.priceRange.length === 2) {
      const [min, max] = filters.priceRange;
      results = results.filter(p => p.pricing.amount >= min && p.pricing.amount <= max);
    }

    if (filters.rating) {
      results = results.filter(p => p.stats.averageRating >= filters.rating!);
    }

    if (filters.featured) {
      results = results.filter(p => p.metadata.featured);
    }

    if (filters.trending) {
      results = results.filter(p => p.metadata.trending);
    }

    if (filters.trainerId) {
      results = results.filter(p => p.trainer.id === filters.trainerId);
    }

    if (filters.duration) {
      if (filters.duration.min) {
        results = results.filter(p => (p.duration.weeks || 0) >= filters.duration!.min!);
      }
      if (filters.duration.max) {
        results = results.filter(p => (p.duration.weeks || 0) <= filters.duration!.max!);
      }
    }

    // Ordenação
    if (params?.sortBy) {
      results = this.sortPrograms(results, params.sortBy, params.sortOrder);
    } else if (filters.search) {
      // Ordenar por relevância quando há busca
      results = this.sortByRelevance(results, filters.search);
    }

    // Paginação
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const total = results.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        data: paginatedResults,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: endIndex < total,
          hasPrev: page > 1
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }

  async getFeaturedPrograms(limit = 8): Promise<ServiceResponse<Program[]>> {
    try {
      console.log('🔍 ProgramsService: Buscando programas em destaque...');
      console.log('📋 Query params:', {
        tableName: this.tableName,
        limit,
        filter: 'is_published = true'
      });

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(0, limit - 1);

      console.log('📊 Supabase response:', {
        hasError: !!error,
        error: error?.message,
        dataLength: data?.length,
        rawData: data
      });

      if (error) {
        throw error;
      }

      console.log('🔄 Transformando programas...');
      const programs = (data || []).map(item => {
        console.log('🔄 Transformando programa:', item.title);
        return this.transformHybridToProgram(item);
      });

      console.log('✅ Programas transformados:', programs.length);

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
      console.error('❌ Erro ao buscar programas em destaque:', error);
      return {
        success: true,
        data: [],
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase_hybrid_fallback',
          requestId: this.generateRequestId()
        }
      };
    }
  }

  async getTrendingPrograms(limit = 8): Promise<ServiceResponse<Program[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_published', true)
        .order('updated_at', { ascending: false })
        .range(0, limit - 1);

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
      console.error('❌ Erro ao buscar programas trending:', error);
      return {
        success: true,
        data: [],
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase_hybrid_fallback',
          requestId: this.generateRequestId()
        }
      };
    }
  }

  async getPopularPrograms(limit = 8): Promise<ServiceResponse<Program[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_published', true)
        .order('base_price', { ascending: false })
        .range(0, limit - 1);

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
      console.error('❌ Erro ao buscar programas populares:', error);
      return {
        success: true,
        data: [],
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase_hybrid_fallback',
          requestId: this.generateRequestId()
        }
      };
    }
  }

  async getRecommendedPrograms(userId?: string, limit = 6): Promise<ServiceResponse<Program[]>> {
    await this.initializeData();
    
    // Mock de recomendações - em produção seria baseado em ML/preferências
    const recommended = this.programs
      .filter(p => p.isPublished)
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);

    return {
      success: true,
      data: recommended,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }

  async getProgramsBySport(sportId: string, params?: PaginationParams): Promise<ServiceResponse<PaginatedResponse<Program>>> {
    await this.initializeData();
    
    // Mapear sport IDs para categorias de programa
    const sportCategoryMap: Record<string, string[]> = {
      'musculacao': ['Musculação', 'Fitness'],
      'corrida': ['Corrida', 'Cardio'],
      'yoga': ['Yoga', 'Bem-estar'],
      'funcionais': ['Funcional', 'Fitness'],
      'natacao': ['Natação', 'Aquático']
    };

    const categories = sportCategoryMap[sportId] || [sportId];
    const sportPrograms = this.programs.filter(p => 
      p.isPublished && categories.some(cat => 
        p.category.toLowerCase().includes(cat.toLowerCase())
      )
    );

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const total = sportPrograms.length;
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPrograms = sportPrograms.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        data: paginatedPrograms,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: endIndex < total,
          hasPrev: page > 1
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }

  // Métodos de gestão (para treinadores/admin)
  async createProgram(program: Partial<Program>): Promise<ServiceResponse<Program>> {
    await this.initializeData();
    const newProgram = this.transformToFullProgram(program, this.programs.length);
    this.programs.push(newProgram);

    return {
      success: true,
      data: newProgram,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }

  async updateProgram(id: string, updates: Partial<Program>): Promise<ServiceResponse<Program>> {
    await this.initializeData();
    const programIndex = this.programs.findIndex(p => p.id === id);
    
    if (programIndex === -1) {
      return {
        success: false,
        error: {
          code: 'PROGRAM_NOT_FOUND',
          message: `Programa com ID '${id}' não encontrado`
        }
      };
    }

    this.programs[programIndex] = { ...this.programs[programIndex], ...updates, updatedAt: new Date().toISOString() };

    return {
      success: true,
      data: this.programs[programIndex],
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }

  async deleteProgram(id: string): Promise<ServiceResponse<boolean>> {
    await this.initializeData();
    const programIndex = this.programs.findIndex(p => p.id === id);
    
    if (programIndex === -1) {
      return {
        success: false,
        error: {
          code: 'PROGRAM_NOT_FOUND',
          message: `Programa com ID '${id}' não encontrado`
        }
      };
    }

    this.programs.splice(programIndex, 1);

    return {
      success: true,
      data: true,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }

  async publishProgram(id: string): Promise<ServiceResponse<Program>> {
    return this.updateProgram(id, { isPublished: true, isActive: true });
  }

  async unpublishProgram(id: string): Promise<ServiceResponse<Program>> {
    return this.updateProgram(id, { isPublished: false, isActive: false });
  }

  // Métodos auxiliares privados
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private parseDuration(duration: string): { weeks: number; sessions: number } {
    if (!duration) return { weeks: 12, sessions: 36 };
    
    const weekMatch = duration.match(/(\d+)\s*semanas?/i);
    const weeks = weekMatch ? parseInt(weekMatch[1]) : 12;
    
    return {
      weeks,
      sessions: weeks * 3 // Assume 3 sessões por semana
    };
  }

  private parsePrice(price: string | number): number {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    
    const numericPrice = price.toString().replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(numericPrice) || 0;
  }

  private getSubcategory(category: string): string {
    const subcategoryMap: Record<string, string> = {
      'Funcional': 'Treinamento Funcional',
      'Musculação': 'Hipertrofia',
      'Corrida': 'Endurance',
      'Yoga': 'Bem-estar',
      'Pilates': 'Fortalecimento',
      'Natação': 'Aquático'
    };
    
    return subcategoryMap[category] || 'Geral';
  }

  private getProgramType(program: any): ProgramType {
    const title = program.title?.toLowerCase() || '';
    
    if (title.includes('consultoria') || title.includes('mentoria')) return 'consultation';
    if (title.includes('workshop') || title.includes('evento')) return 'workshop';
    
    return 'course';
  }

  private generatePaymentPlans(amount: number) {
    return [
      { installments: 1, amount, discount: 0 },
      { installments: 3, amount: amount * 0.35, discount: 0 },
      { installments: 6, amount: amount * 0.18, discount: 0 },
      { installments: 12, amount: amount * 0.095, discount: 0 }
    ];
  }

  private generateDefaultContent() {
    return {
      modules: [
        { id: '1', title: 'Introdução', lessons: 3, duration: 45 },
        { id: '2', title: 'Fundamentos', lessons: 5, duration: 120 },
        { id: '3', title: 'Prática', lessons: 8, duration: 200 }
      ],
      totalLessons: 16,
      totalDuration: 365
    };
  }

  private generateDefaultRequirements(): string[] {
    return [
      'Liberação médica para atividade física',
      'Equipamentos básicos de treino',
      'Disponibilidade de 3-4 horas semanais'
    ];
  }

  private generateFeatures(): string[] {
    return [
      'Acompanhamento personalizado',
      'Exercícios em vídeo HD',
      'Plano nutricional básico',
      'Suporte via WhatsApp',
      'Certificado de conclusão'
    ];
  }

  private generateProgramContent(program: any) {
    const baseModules = [
      { id: '1', title: 'Aquecimento e Preparação', lessons: 2, duration: 30 },
      { id: '2', title: 'Técnicas Fundamentais', lessons: 4, duration: 90 },
      { id: '3', title: 'Desenvolvimento', lessons: 6, duration: 150 },
      { id: '4', title: 'Aperfeiçoamento', lessons: 4, duration: 100 }
    ];

    return {
      modules: baseModules,
      totalLessons: 16,
      totalDuration: 370
    };
  }

  private generateRequirements(program: any): string[] {
    const base = ['Liberação médica para atividade física'];
    
    if (program.category === 'Musculação') {
      base.push('Acesso a academia ou equipamentos de musculação');
    }
    
    if (program.category === 'Corrida') {
      base.push('Tênis apropriado para corrida');
    }
    
    base.push('Disponibilidade de 3-4 horas semanais');
    
    return base;
  }

  private generateReviews(programId: string) {
    return [
      {
        id: `${programId}_review_1`,
        userId: 'user_1',
        userName: 'Ana Silva',
        rating: 5,
        comment: 'Excelente programa! Resultados visíveis em poucas semanas.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private generateTags(program: any): string[] {
    const tags = [program.category?.toLowerCase(), program.level?.toLowerCase()];
    
    if (program.category === 'Funcional') tags.push('movimento', 'mobilidade');
    if (program.category === 'Musculação') tags.push('força', 'hipertrofia');
    if (program.category === 'Corrida') tags.push('cardio', 'resistência');
    
    return tags.filter(Boolean);
  }

  private sortPrograms(programs: Program[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): Program[] {
    return programs.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'price':
          aValue = a.pricing.amount;
          bValue = b.pricing.amount;
          break;
        case 'rating':
          aValue = a.stats.averageRating;
          bValue = b.stats.averageRating;
          break;
        case 'enrollments':
          aValue = a.stats.enrollments;
          bValue = b.stats.enrollments;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  private sortByRelevance(programs: Program[], query: string): Program[] {
    return programs.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, query);
      const bScore = this.calculateRelevanceScore(b, query);
      return bScore - aScore;
    });
  }

  private calculateRelevanceScore(program: Program, query: string): number {
    const lowerQuery = query.toLowerCase();
    let score = 0;
    
    // Título tem peso maior
    if (program.title.toLowerCase().includes(lowerQuery)) score += 10;
    
    // Descrição tem peso médio
    if (program.description.toLowerCase().includes(lowerQuery)) score += 5;
    
    // Tags têm peso menor
    program.tags.forEach(tag => {
      if (tag.toLowerCase().includes(lowerQuery)) score += 2;
    });
    
    return score;
  }
}

// Instância padrão para uso direto
export const programsService = new ProgramsServiceImpl();