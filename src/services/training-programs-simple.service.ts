/**
 * 🏋️ TRAINING PROGRAMS HYBRID SERVICE
 * 
 * Serviço para gerenciar programas de treinamento na tabela híbrida 99_training_programs
 * Usa campos estruturados + JSONB para máxima flexibilidade e performance
 * Segue o padrão exato do trainer-profile.service.ts
 */

import { supabase } from '../lib/supabase/client';

// ============================================
// TIPOS E INTERFACES
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
  
  // Informações básicas adicionais (não estruturadas)
  tags?: string[];
  search_keywords?: string[];
  
  // Modalidade de entrega (separada da modalidade de treinamento)
  delivery_mode?: 'PDF' | 'Consultoria' | 'Video';
  
  // Descrições
  shortDescription?: string;
  fullDescription?: string;
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
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  
  // Configurações avançadas
  isActive?: boolean;
  publishedAt?: string;
  
  // Metadados
  lastUpdated?: string;
  
  // Dados dinâmicos (para futuras expansões)
  [key: string]: any;
}

export interface TrainingProgram {
  id: string;
  trainer_id: string;
  // Campos estruturados
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
  // Campo JSONB
  program_data: ProgramData;
  created_at: string;
  updated_at: string;
}

export interface CreateProgramInput {
  trainer_id: string;
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

export interface UpdateProgramInput {
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
  // Dados flexíveis no JSONB
  program_data?: Partial<ProgramData>;
}

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

class TrainingProgramsSimpleService {
  private readonly tableName = '99_training_programs';

  /**
   * Buscar programas do trainer
   */
  async getByTrainerId(trainerId: string): Promise<TrainingProgram[]> {
    try {
      console.log('🔍 Buscando programas para trainer:', trainerId);

      // Verificar se a tabela existe primeiro
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('trainer_id', trainerId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Erro na query:', error);
        
        // Se é erro de permissão, retornar array vazio ao invés de erro
        if (error.code === '42501' || error.message?.includes('permission denied')) {
          console.log('⚠️ Erro de permissão - retornando array vazio');
          return [];
        }
        
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} programas`);
      return data as TrainingProgram[] || [];

    } catch (error) {
      console.error('❌ Erro ao buscar programas:', error);
      
      // Se é erro de permissão, retornar array vazio
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        console.log('⚠️ Erro de permissão na busca - retornando array vazio');
        return [];
      }
      
      throw new Error(`Erro ao buscar programas: ${error.message}`);
    }
  }

  /**
   * Buscar programa por ID
   */
  async getById(id: string): Promise<TrainingProgram | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as TrainingProgram;

    } catch (error) {
      console.error('❌ Erro ao buscar programa por ID:', error);
      throw new Error(`Erro ao buscar programa: ${error.message}`);
    }
  }

  /**
   * Criar novo programa
   */
  async create(input: CreateProgramInput): Promise<TrainingProgram> {
    try {
      console.log('➕ TrainingProgramsService: Criando novo programa:', input.title);

      const programData: ProgramData = {
        ...input.program_data,
        isActive: false,
        lastUpdated: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          trainer_id: input.trainer_id,
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
        console.error('❌ Erro na criação:', error);
        throw error;
      }

      console.log('✅ Programa criado com sucesso:', data.id);
      return data as TrainingProgram;

    } catch (error) {
      console.error('❌ Erro ao criar programa:', error);
      throw new Error(`Erro ao criar programa: ${error.message}`);
    }
  }

  /**
   * Atualizar programa existente
   */
  async update(id: string, input: UpdateProgramInput): Promise<TrainingProgram> {
    try {
      console.log('💾 TrainingProgramsService: Atualizando programa:', id);

      // Buscar programa atual para merge dos dados JSON
      const currentProgram = await this.getById(id);
      if (!currentProgram) {
        throw new Error('Programa não encontrado');
      }

      // Fazer merge dos dados JSON
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
        throw error;
      }

      console.log('✅ Programa atualizado com sucesso');
      return data as TrainingProgram;

    } catch (error) {
      console.error('❌ Erro ao atualizar programa:', error);
      throw new Error(`Erro ao atualizar programa: ${error.message}`);
    }
  }

  /**
   * Publicar programa
   */
  async publish(id: string): Promise<TrainingProgram> {
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
  async unpublish(id: string): Promise<TrainingProgram> {
    return this.update(id, {
      is_published: false,
      status: 'draft',
      program_data: {
        isActive: false
      }
    });
  }

  /**
   * Criar ou atualizar programa (upsert)
   */
  async upsert(input: CreateProgramInput & UpdateProgramInput): Promise<TrainingProgram> {
    try {
      if (input.trainer_id && input.title) {
        // Verificar se já existe um programa com mesmo título para este trainer
        const { data: existingPrograms } = await supabase
          .from(this.tableName)
          .select('id')
          .eq('trainer_id', input.trainer_id)
          .eq('title', input.title)
          .limit(1);

        if (existingPrograms && existingPrograms.length > 0) {
          return await this.update(existingPrograms[0].id, input);
        } else {
          return await this.create(input as CreateProgramInput);
        }
      } else {
        throw new Error('trainer_id e title são obrigatórios para upsert');
      }
    } catch (error) {
      console.error('❌ Erro no upsert:', error);
      throw error;
    }
  }

  /**
   * Deletar programa
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log('✅ Programa deletado');

    } catch (error) {
      console.error('❌ Erro ao deletar programa:', error);
      throw new Error(`Erro ao deletar programa: ${error.message}`);
    }
  }

  /**
   * Buscar programas públicos
   */
  async getPublic(limit = 20, offset = 0): Promise<TrainingProgram[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data as TrainingProgram[];

    } catch (error) {
      console.error('❌ Erro ao buscar programas públicos:', error);
      throw new Error(`Erro ao buscar programas: ${error.message}`);
    }
  }

  /**
   * Estatísticas do trainer
   */
  async getTrainerStats(trainerId: string): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
  }> {
    try {
      const programs = await this.getByTrainerId(trainerId);
      
      const stats = {
        total: programs.length,
        published: programs.filter(p => p.is_published).length,
        draft: programs.filter(p => p.status === 'draft').length,
        archived: programs.filter(p => p.status === 'archived').length
      };

      return stats;

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }
  }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

export const trainingProgramsSimpleService = new TrainingProgramsSimpleService();
export default trainingProgramsSimpleService;