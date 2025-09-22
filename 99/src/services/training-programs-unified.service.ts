/**
 * SERVIÇO UNIFICADO PARA TRAINING PROGRAMS - VERSÃO CONSOLIDADA
 * =============================================================
 * Consolidação dos serviços training-programs duplicados em uma única implementação robusta
 * GARANTIA CRÍTICA: USA EXCLUSIVAMENTE dados do Supabase via tabelas relacionais
 * Segue padrão híbrido: campos críticos estruturados + dados JSONB flexíveis
 */

import { supabase } from '../lib/supabase/client';
import { apiBaseUrl } from '../utils/supabase/info';

// ============================================
// TIPOS E INTERFACES CONSOLIDADAS
// ============================================

export interface ProgramData {
  // Seleção de esportes
  sports?: {
    primary: {
      id: string;
      name: string;
      slug: string;
      icon_url?: string;
    } | null;
    secondary: Array<{
      id: string;
      name: string;
      slug: string;
      icon_url?: string;
    }>;
  };
  
  // Informações básicas adicionais
  tags?: string[];
  search_keywords?: string[];
  
  // Modalidade de entrega (separada da modalidade de treinamento)
  delivery_mode?: 'PDF' | 'Consultoria' | 'Video' | 'Presencial' | 'Online';
  
  // Descrições
  shortDescription?: string;
  fullDescription?: string;
  overview?: string;
  whatYouWillLearn?: string[];
  prerequisites?: string[];
  targetAudience?: string[];
  
  // Estrutura do programa
  sessionDuration?: string;
  programType?: string;
  modules?: Array<{
    title: string;
    description: string;
    lessons?: Array<{
      title: string;
      duration: string;
      type: string;
    }>;
  }>;
  
  // Preços adicionais
  originalPrice?: number;
  discount?: number;
  paymentPlans?: Array<{
    name: string;
    installments: number;
    pricePerMonth: number;
  }>;
  hasFreeTrial?: boolean;
  trialDuration?: number;
  
  // Mídia
  coverImage?: string;
  galleryImages?: string[];
  videoUrl?: string;
  videoThumbnail?: string;
  
  // Analytics
  analytics?: {
    views?: number;
    inquiries?: number;
    conversions?: number;
    clicks?: number;
    favorites?: number;
  };
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  
  // Configurações avançadas
  isActive?: boolean;
  publishedAt?: string;
  
  // Informações básicas estruturadas (duplicadas para compatibilidade)
  basic_info?: {
    title?: string;
    category?: string;
    modality?: string;
    level?: string;
    duration?: number;
    frequency?: number;
    base_price?: number;
  };
  
  // Descrição estruturada (para compatibilidade)
  description?: {
    overview?: string;
    details?: string;
  };
  
  // Metadados
  lastUpdated?: string;
  
  // Dados dinâmicos (para futuras expansões)
  [key: string]: any;
}

export interface TrainingProgram {
  id: string;
  trainer_id: string;
  // Campos estruturados críticos
  title: string;
  category: string;
  modality: string;
  level: string;
  duration: number;
  duration_type: string;
  frequency: number;
  base_price: number;
  is_published: boolean;
  status: 'draft' | 'published' | 'archived' | 'suspended';
  // Campo JSONB para dados flexíveis
  program_data: ProgramData;
  created_at: string;
  updated_at: string;
}

export interface CreateTrainingProgramInput {
  trainer_id?: string; // será injetado pelo service se não fornecido
  // Campos estruturados obrigatórios
  title: string;
  category: string;
  modality: string;
  level: string;
  duration: number;
  duration_type?: string;
  frequency: number;
  base_price: number;
  // Dados flexíveis no JSONB
  program_data?: ProgramData;
}

export interface UpdateTrainingProgramInput {
  // Campos estruturados
  title?: string;
  category?: string;
  modality?: string;
  level?: string;
  duration?: number;
  duration_type?: string;
  frequency?: number;
  base_price?: number;
  is_published?: boolean;
  status?: 'draft' | 'published' | 'archived' | 'suspended';
  // Dados flexíveis no JSONB (merge automático)
  program_data?: Partial<ProgramData>;
}

export interface ProgramFilters {
  trainer_id?: string;
  is_published?: boolean;
  status?: 'draft' | 'published' | 'archived' | 'suspended';
  category?: string;
  modality?: string;
  level?: string;
  min_price?: number;
  max_price?: number;
  duration_min?: number;
  duration_max?: number;
  tags?: string[];
  search?: string;
}

// ============================================
// CLASSE DO SERVIÇO CONSOLIDADO
// ============================================

class TrainingProgramsUnifiedService {
  private readonly tableName = '99_training_programs';

  /**
   * CRÍTICO: Buscar programas APENAS do Supabase para um trainer específico
   */
  async getByTrainerId(trainerId: string): Promise<TrainingProgram[]> {
    if (!trainerId?.trim()) {
      console.error('❌ TrainingPrograms: trainer_id é obrigatório');
      return [];
    }

    try {
      console.log('🔍 TrainingProgramsUnified: Buscando programas do Supabase para trainer:', trainerId);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('trainer_id', trainerId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar training programs do Supabase:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log(`ℹ️ Nenhum training program encontrado no Supabase para trainer: ${trainerId}`);
        return [];
      }

      // Aplicar filtro de aprovação baseado em critérios flexíveis
      const approvedPrograms = data.filter(record => {
        const shouldApprove = this.shouldApproveProgram(record.is_published, record.status);
        
        console.log(`📋 Programa ${record.id}: is_published=${record.is_published}, status="${record.status}" -> aprovado=${shouldApprove}`);
        
        return shouldApprove;
      });

      console.log(`✅ ${approvedPrograms.length} training programs aprovados do Supabase após filtro`);

      // Normalizar e garantir estrutura consistente
      const normalizedPrograms = approvedPrograms.map(program => this.normalizeProgram(program));

      return normalizedPrograms;

    } catch (error) {
      console.error('❌ Erro crítico ao buscar training programs do Supabase:', error);
      return [];
    }
  }

  /**
   * CRÍTICO: Buscar programa por ID APENAS do Supabase
   */
  async getById(id: string): Promise<TrainingProgram | null> {
    if (!id?.trim()) {
      console.error('❌ TrainingPrograms: ID é obrigatório');
      return null;
    }

    try {
      console.log('🔍 TrainingProgramsUnified: Buscando programa por ID no Supabase:', id);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`ℹ️ Training program não encontrado no Supabase para ID: ${id}`);
          return null;
        }
        console.error('❌ Erro ao buscar training program por ID no Supabase:', error);
        return null;
      }

      if (!data) {
        console.log(`ℹ️ Training program não encontrado no Supabase para ID: ${id}`);
        return null;
      }

      console.log('✅ Training program encontrado no Supabase:', data.title);
      return this.normalizeProgram(data);

    } catch (error) {
      console.error(`❌ Erro crítico ao buscar training program por ID no Supabase: ${id}`, error);
      return null;
    }
  }

  /**
   * CRÍTICO: Criar programa APENAS no Supabase
   */
  async create(input: CreateTrainingProgramInput): Promise<TrainingProgram | null> {
    try {
      console.log('➕ TrainingProgramsUnified: Criando programa no Supabase:', input.title);

      // Obter trainer_id do contexto de auth se não fornecido
      let trainerId = input.trainer_id;
      if (!trainerId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('❌ Usuário não autenticado para criar programa');
          return null;
        }
        trainerId = user.id;
      }

      const programData = this.ensureDataStructure(input.program_data || {});

      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          trainer_id: trainerId,
          title: input.title,
          category: input.category,
          modality: input.modality,
          level: input.level,
          duration: input.duration,
          duration_type: input.duration_type || 'weeks',
          frequency: input.frequency,
          base_price: input.base_price,
          is_published: false,
          status: 'draft',
          program_data: programData
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar training program no Supabase:', error);
        return null;
      }

      if (!data) {
        console.error('❌ Nenhum training program foi criado no Supabase');
        return null;
      }

      console.log('✅ Training program criado no Supabase:', data.id);
      return this.normalizeProgram(data);

    } catch (error) {
      console.error('❌ Erro crítico ao criar training program no Supabase:', error);
      return null;
    }
  }

  /**
   * CRÍTICO: Atualizar programa APENAS no Supabase
   */
  async update(id: string, input: UpdateTrainingProgramInput): Promise<TrainingProgram | null> {
    if (!id?.trim()) {
      console.error('❌ TrainingPrograms: ID é obrigatório para update');
      return null;
    }

    try {
      console.log('💾 TrainingProgramsUnified: Atualizando programa no Supabase:', id);

      // Buscar programa atual para merge dos dados JSONB
      const currentProgram = await this.getById(id);
      if (!currentProgram) {
        console.error('❌ Training program não encontrado para atualização:', id);
        return null;
      }

      // Fazer merge dos dados JSONB
      const updatedProgramData: ProgramData = {
        ...currentProgram.program_data,
        ...input.program_data,
        lastUpdated: new Date().toISOString()
      };

      const updateData: any = {
        program_data: updatedProgramData,
        updated_at: new Date().toISOString()
      };

      // Adicionar campos estruturados se fornecidos
      if (input.title !== undefined) updateData.title = input.title;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.modality !== undefined) updateData.modality = input.modality;
      if (input.level !== undefined) updateData.level = input.level;
      if (input.duration !== undefined) updateData.duration = input.duration;
      if (input.duration_type !== undefined) updateData.duration_type = input.duration_type;
      if (input.frequency !== undefined) updateData.frequency = input.frequency;
      if (input.base_price !== undefined) updateData.base_price = input.base_price;
      if (input.is_published !== undefined) updateData.is_published = input.is_published;
      if (input.status !== undefined) updateData.status = input.status;

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar training program no Supabase:', error);
        return null;
      }

      if (!data) {
        console.error('❌ Nenhum training program foi atualizado no Supabase');
        return null;
      }

      console.log('✅ Training program atualizado no Supabase:', id);
      return this.normalizeProgram(data);

    } catch (error) {
      console.error('❌ Erro crítico ao atualizar training program no Supabase:', error);
      return null;
    }
  }

  /**
   * Buscar programas públicos APENAS do Supabase
   */
  async getPublicPrograms(
    filters?: ProgramFilters,
    limit = 20,
    offset = 0
  ): Promise<TrainingProgram[]> {
    try {
      console.log('📋 Buscando training programs públicos no Supabase');

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      // Aplicar filtros se fornecidos
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.modality) {
        query = query.eq('modality', filters.modality);
      }
      if (filters?.level) {
        query = query.eq('level', filters.level);
      }
      if (filters?.min_price !== undefined) {
        query = query.gte('base_price', filters.min_price);
      }
      if (filters?.max_price !== undefined) {
        query = query.lte('base_price', filters.max_price);
      }

      // Filtros JSONB
      if (filters?.search) {
        query = query.or(`
          title.ilike.%${filters.search}%,
          program_data->>overview.ilike.%${filters.search}%,
          program_data->>shortDescription.ilike.%${filters.search}%
        `);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar training programs públicos no Supabase:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ Nenhum training program público encontrado no Supabase');
        return [];
      }

      console.log(`✅ Encontrados ${data.length} training programs públicos no Supabase`);
      return data.map(program => this.normalizeProgram(program));

    } catch (error) {
      console.error('❌ Erro ao buscar training programs públicos no Supabase:', error);
      return [];
    }
  }

  /**
   * Publicar programa
   */
  async publish(id: string): Promise<TrainingProgram | null> {
    return this.update(id, {
      is_published: true,
      status: 'published',
      program_data: {
        publishedAt: new Date().toISOString(),
        isActive: true
      }
    });
  }

  /**
   * Despublicar programa
   */
  async unpublish(id: string): Promise<TrainingProgram | null> {
    return this.update(id, {
      is_published: false,
      status: 'draft',
      program_data: {
        isActive: false
      }
    });
  }

  /**
   * Deletar programa
   */
  async delete(id: string): Promise<boolean> {
    if (!id?.trim()) {
      console.error('❌ TrainingPrograms: ID é obrigatório para delete');
      return false;
    }

    try {
      console.log('🗑️ Deletando training program do Supabase:', id);

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao deletar training program do Supabase:', error);
        return false;
      }

      console.log('✅ Training program deletado do Supabase:', id);
      return true;

    } catch (error) {
      console.error('❌ Erro crítico ao deletar training program do Supabase:', error);
      return false;
    }
  }

  /**
   * Obter estatísticas do trainer APENAS do Supabase
   */
  async getTrainerStats(trainerId: string): Promise<{
    total_programs: number;
    published_programs: number;
    draft_programs: number;
    archived_programs: number;
    total_views: number;
    total_inquiries: number;
    total_conversions: number;
  }> {
    // Fallback seguro
    const safeFallback = {
      total_programs: 0,
      published_programs: 0,
      draft_programs: 0,
      archived_programs: 0,
      total_views: 0,
      total_inquiries: 0,
      total_conversions: 0
    };

    if (!trainerId?.trim()) {
      console.error('❌ TrainingPrograms: trainer_id é obrigatório para stats');
      return safeFallback;
    }

    try {
      console.log('📊 Buscando estatísticas de training programs no Supabase para trainer:', trainerId);

      const { data: programs, error } = await supabase
        .from(this.tableName)
        .select('is_published, status, program_data')
        .eq('trainer_id', trainerId)
        .limit(50); // Limitar para evitar timeout

      if (error) {
        console.error('❌ Erro ao buscar estatísticas no Supabase:', error);
        return safeFallback;
      }

      if (!programs || programs.length === 0) {
        console.log('ℹ️ Nenhum training program encontrado para estatísticas');
        return safeFallback;
      }

      const stats = {
        total_programs: programs.length,
        published_programs: programs.filter(p => p.is_published).length,
        draft_programs: programs.filter(p => p.status === 'draft').length,
        archived_programs: programs.filter(p => p.status === 'archived').length,
        total_views: programs.reduce((sum, p) => {
          const views = p.program_data?.analytics?.views || 0;
          return sum + views;
        }, 0),
        total_inquiries: programs.reduce((sum, p) => {
          const inquiries = p.program_data?.analytics?.inquiries || 0;
          return sum + inquiries;
        }, 0),
        total_conversions: programs.reduce((sum, p) => {
          const conversions = p.program_data?.analytics?.conversions || 0;
          return sum + conversions;
        }, 0)
      };

      console.log('✅ Estatísticas calculadas do Supabase:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas no Supabase:', error);
      return safeFallback;
    }
  }

  /**
   * Verificar se programa deve ser aprovado baseado em critérios flexíveis
   */
  private shouldApproveProgram(isPublished: boolean, status: string | null | undefined): boolean {
    if (!isPublished) return false;
    
    const normalizedStatus = this.normalizeStatus(status);
    const rejectedStatuses = ['archived', 'draft'];
    
    // Aceita: 'published', '', 'active', etc.
    // Rejeita apenas: 'draft' e 'archived'
    return !rejectedStatuses.includes(normalizedStatus);
  }

  /**
   * Normalizar status removendo espaços e quebras de linha
   */
  private normalizeStatus(status: string | null | undefined): string {
    if (!status) return '';
    return status.trim().toLowerCase();
  }

  /**
   * Normalizar programa garantindo estrutura consistente
   */
  private normalizeProgram(program: any): TrainingProgram {
    if (!program) {
      throw new Error('Program é obrigatório para normalização');
    }

    const normalized: TrainingProgram = {
      id: program.id,
      trainer_id: program.trainer_id,
      title: program.title || 'Programa sem título',
      category: program.category || '',
      modality: program.modality || '',
      level: program.level || '',
      duration: program.duration || 0,
      duration_type: program.duration_type || 'weeks',
      frequency: program.frequency || 0,
      base_price: program.base_price || 0,
      is_published: program.is_published ?? false,
      status: program.status || 'draft',
      program_data: this.ensureDataStructure(program.program_data || {}),
      created_at: program.created_at,
      updated_at: program.updated_at
    };

    return normalized;
  }

  /**
   * Garantir estrutura básica dos dados JSONB
   */
  private ensureDataStructure(data: Partial<ProgramData>): ProgramData {
    const now = new Date().toISOString();
    
    return {
      // Arrays obrigatórios
      tags: data.tags || [],
      search_keywords: data.search_keywords || [],
      whatYouWillLearn: data.whatYouWillLearn || [],
      prerequisites: data.prerequisites || [],
      targetAudience: data.targetAudience || [],
      galleryImages: data.galleryImages || [],
      seoKeywords: data.seoKeywords || [],
      modules: data.modules || [],
      
      // Objetos obrigatórios
      sports: data.sports || { primary: null, secondary: [] },
      analytics: {
        views: 0,
        inquiries: 0,
        conversions: 0,
        clicks: 0,
        favorites: 0,
        ...data.analytics
      },
      
      // Strings obrigatórias
      delivery_mode: data.delivery_mode || 'Online',
      shortDescription: data.shortDescription || '',
      fullDescription: data.fullDescription || '',
      overview: data.overview || '',
      sessionDuration: data.sessionDuration || '',
      programType: data.programType || '',
      coverImage: data.coverImage || '',
      videoUrl: data.videoUrl || '',
      videoThumbnail: data.videoThumbnail || '',
      seoTitle: data.seoTitle || '',
      seoDescription: data.seoDescription || '',
      
      // Numéricos
      originalPrice: data.originalPrice || 0,
      discount: data.discount || 0,
      trialDuration: data.trialDuration || 0,
      
      // Booleanos
      hasFreeTrial: data.hasFreeTrial ?? false,
      isActive: data.isActive ?? false,
      
      // Timestamps
      publishedAt: data.publishedAt || '',
      lastUpdated: now,
      
      // Manter outros campos existentes
      ...data
    };
  }
}

// ============================================
// INSTÂNCIA SINGLETON CONSOLIDADA
// ============================================

export const trainingProgramsUnifiedService = new TrainingProgramsUnifiedService();
export default trainingProgramsUnifiedService;

// Re-exports para compatibilidade
export { trainingProgramsUnifiedService as trainingProgramsService };
export type {
  TrainingProgram,
  ProgramData,
  CreateTrainingProgramInput,
  UpdateTrainingProgramInput,
  ProgramFilters
};