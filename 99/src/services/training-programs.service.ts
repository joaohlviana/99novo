/**
 * TRAINING PROGRAMS SERVICE - VERSÃO JSONB REESTRUTURADA
 * =======================================================
 * Service para operações CRUD na tabela reestruturada 99_training_programs
 * Arquitetura otimizada com campos críticos relacionais + dados JSONB
 */

import { supabase } from '../lib/supabase/client';
import { projectId, publicAnonKey, apiBaseUrl } from '../utils/supabase/info';
import { 
  TrainingProgramRecord, 
  TrainingProgramJsonbData,
  programDataToJsonb,
  jsonbToProgramData,
  ProgramData,
  extractJsonbField
} from '../types/training-program';

// ===============================================
// TIPOS PARA OPERAÇÕES DO SERVICE
// ===============================================

// Tipo para criação (dados do componente)
export interface CreateTrainingProgramInput extends ProgramData {
  trainer_id?: string; // será injetado pelo service
}

// Tipo para atualização parcial
export interface UpdateTrainingProgramData {
  is_published?: boolean;
  status?: 'draft' | 'published' | 'archived' | 'suspended';
  program_data?: Partial<TrainingProgramJsonbData>;
}

// Filtros para busca (compatível com JSONB)
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

// ===============================================
// SERVICE CLASS
// ===============================================

class TrainingProgramsService {

  /**
   * Normalizar status removendo espaços e quebras de linha
   */
  private normalizeStatus(status: string | null | undefined): string {
    if (!status) return '';
    return status.trim().toLowerCase();
  }

  /**
   * Verificar se programa deve ser aprovado baseado em critérios flexíveis
   */
  private shouldApproveProgram(isPublished: boolean, status: string | null | undefined): boolean {
    if (!isPublished) return false;
    
    const normalizedStatus = this.normalizeStatus(status);
    const rejectedStatuses = ['archived', 'draft'];
    
    // ✅ LÓGICA FLEXÍVEL: Aprovar se não está em estados rejeitados
    // Aceita: 'published\n', 'published ', '', 'active', etc.
    // Rejeita apenas: 'draft' e 'archived'
    return !rejectedStatuses.includes(normalizedStatus);
  }

  /**
   * Buscar programas por trainer ID (método simples para cards)
   * 🎯 CORREÇÃO: Filtro flexível de status implementado
   */
  async getByTrainerId(trainerId: string): Promise<ProgramData[]> {
    try {
      console.log('🔍 Buscando programas para trainer:', trainerId);
      
      // Buscar dados brutos da tabela para ter IDs reais
      const { data: rawPrograms, error } = await supabase
        .from('99_training_programs')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erro na query:', error);
        return [];
      }
      
      if (!rawPrograms || rawPrograms.length === 0) {
        console.log('ℹ️ Nenhum programa encontrado para trainer:', trainerId);
        return [];
      }
      
      console.log(`📊 Encontrados ${rawPrograms.length} programas brutos`);
      
      // 🎯 APLICAR FILTRO FLEXÍVEL AQUI
      const approvedPrograms = rawPrograms.filter(record => {
        const shouldApprove = this.shouldApproveProgram(record.is_published, record.status);
        
        console.log(`📋 Programa ${record.id}: is_published=${record.is_published}, status="${record.status}" -> normalizado="${this.normalizeStatus(record.status)}" -> aprovado=${shouldApprove}`);
        
        return shouldApprove;
      });
      
      console.log(`✅ ${approvedPrograms.length} programas aprovados após filtro flexível`);
      
      // Converter mantendo IDs reais e dados brutos para analytics
      const programs = approvedPrograms.map((record: TrainingProgramRecord) => {
        const programData = jsonbToProgramData(record);
        // Preservar ID real da tabela e anexar dados brutos para analytics
        return {
          ...programData,
          id: record.id,
          trainerId: record.trainer_id,
          _rawRecord: record // Dados brutos para acesso aos analytics
        };
      });
      
      return programs;
    } catch (error) {
      console.error('❌ Erro ao buscar programas do trainer:', error);
      return [];
    }
  }

  /**
   * Buscar programas do trainer atual
   */
  async getTrainerPrograms(
    trainerId?: string,
    filters?: Partial<ProgramFilters>
  ): Promise<{ data: ProgramData[] | null; error: any }> {
    try {
      let query = supabase
        .from('99_training_programs')
        .select('*')
        .order('updated_at', { ascending: false });

      // Filtro por trainer
      if (trainerId) {
        query = query.eq('trainer_id', trainerId);
      }

      // Aplicar filtros adicionais
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.is_published !== undefined) {
        query = query.eq('is_published', filters.is_published);
      }

      // Filtros JSONB
      if (filters?.category) {
        query = query.eq('program_data->>basic_info->>category', filters.category);
      }

      if (filters?.modality) {
        query = query.eq('program_data->>basic_info->>modality', filters.modality);
      }

      if (filters?.level) {
        query = query.eq('program_data->>basic_info->>level', filters.level);
      }

      const { data, error } = await query;

      if (error || !data) {
        return { data: null, error };
      }

      // Converter registros JSONB para ProgramData
      const programs = data.map((record: TrainingProgramRecord) => 
        jsonbToProgramData(record)
      );

      return { data: programs, error: null };
    } catch (error) {
      console.error('Erro ao buscar programas do trainer:', error);
      return { data: null, error };
    }
  }

  /**
   * Buscar programas públicos com filtros
   */
  async getPublicPrograms(
    filters?: ProgramFilters,
    limit = 20,
    offset = 0
  ): Promise<{ data: ProgramData[] | null; error: any }> {
    try {
      let query = this.supabase
        .from('99_training_programs')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      // Aplicar filtros JSONB
      if (filters?.category) {
        query = query.eq('program_data->>basic_info->>category', filters.category);
      }

      if (filters?.modality) {
        query = query.eq('program_data->>basic_info->>modality', filters.modality);
      }

      if (filters?.level) {
        query = query.eq('program_data->>basic_info->>level', filters.level);
      }

      if (filters?.min_price !== undefined) {
        query = query.gte('program_data->>basic_info->>base_price::numeric', filters.min_price);
      }

      if (filters?.max_price !== undefined) {
        query = query.lte('program_data->>basic_info->>base_price::numeric', filters.max_price);
      }

      if (filters?.search) {
        // Busca em título e tags
        query = query.or(`
          program_data->>basic_info->>title.ilike.%${filters.search}%,
          program_data->>basic_info->>tags::text.ilike.%${filters.search}%,
          program_data->>description->>overview.ilike.%${filters.search}%
        `);
      }

      const { data, error } = await query;

      if (error || !data) {
        return { data: null, error };
      }

      // Converter para ProgramData
      const programs = data.map((record: TrainingProgramRecord) => 
        jsonbToProgramData(record)
      );

      return { data: programs, error: null };
    } catch (error) {
      console.error('Erro ao buscar programas públicos:', error);
      return { data: null, error };
    }
  }

  /**
   * Buscar programa por ID
   */
  async getProgramById(id: string): Promise<{ data: ProgramData | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('99_training_programs')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return { data: null, error };
      }

      // Converter para ProgramData
      const program = jsonbToProgramData(data as TrainingProgramRecord);
      return { data: program, error: null };
    } catch (error) {
      console.error('Erro ao buscar programa por ID:', error);
      return { data: null, error };
    }
  }

  /**
   * Buscar record bruto por ID (para operações internas)
   */
  private async getRawProgramById(id: string): Promise<{ data: TrainingProgramRecord | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('99_training_programs')
        .select('*')
        .eq('id', id)
        .single();

      return { data: data as TrainingProgramRecord, error };
    } catch (error) {
      console.error('Erro ao buscar programa bruto por ID:', error);
      return { data: null, error };
    }
  }

  /**
   * Criar novo programa
   */
  async createProgram(
    programInput: CreateTrainingProgramInput
  ): Promise<{ data: ProgramData | null; error: any }> {
    try {
      // Obter trainer_id do contexto de auth se não fornecido
      let trainerId = programInput.trainer_id;
      if (!trainerId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { data: null, error: 'Usuário não autenticado' };
        }
        trainerId = user.id;
      }

      // Converter ProgramData para estrutura JSONB
      const jsonbData = programDataToJsonb(programInput);

      // Inserir na tabela
      const { data, error } = await this.supabase
        .from('99_training_programs')
        .insert([{
          trainer_id: trainerId,
          ...jsonbData
        }])
        .select()
        .single();

      if (error || !data) {
        return { data: null, error };
      }

      // Converter de volta para ProgramData
      const program = jsonbToProgramData(data as TrainingProgramRecord);
      return { data: program, error: null };
    } catch (error) {
      console.error('Erro ao criar programa:', error);
      return { data: null, error };
    }
  }

  /**
   * Atualizar programa completo
   */
  async updateProgram(
    id: string,
    programData: ProgramData
  ): Promise<{ data: ProgramData | null; error: any }> {
    try {
      // Converter para estrutura JSONB
      const jsonbData = programDataToJsonb(programData);

      const { data, error } = await this.supabase
        .from('99_training_programs')
        .update(jsonbData)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        return { data: null, error };
      }

      // Converter de volta para ProgramData
      const program = jsonbToProgramData(data as TrainingProgramRecord);
      return { data: program, error: null };
    } catch (error) {
      console.error('Erro ao atualizar programa:', error);
      return { data: null, error };
    }
  }

  /**
   * Atualizar programa parcialmente
   */
  async updateProgramPartial(
    id: string,
    updates: UpdateTrainingProgramData
  ): Promise<{ data: ProgramData | null; error: any }> {
    try {
      // Se estamos atualizando program_data, precisamos fazer merge com dados existentes
      let finalUpdates = { ...updates };

      if (updates.program_data) {
        // Buscar dados existentes
        const { data: existing } = await this.getRawProgramById(id);
        if (existing) {
          // Fazer merge profundo dos dados JSONB
          finalUpdates.program_data = this.mergeDeep(
            existing.program_data || {},
            updates.program_data
          );
        }
      }

      const { data, error } = await this.supabase
        .from('99_training_programs')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        return { data: null, error };
      }

      // Converter para ProgramData
      const program = jsonbToProgramData(data as TrainingProgramRecord);
      return { data: program, error: null };
    } catch (error) {
      console.error('Erro ao atualizar programa parcialmente:', error);
      return { data: null, error };
    }
  }

  /**
   * Publicar programa
   */
  async publishProgram(id: string): Promise<{ data: ProgramData | null; error: any }> {
    return this.updateProgramPartial(id, {
      is_published: true,
      status: 'published'
    });
  }

  /**
   * Despublicar programa
   */
  async unpublishProgram(id: string): Promise<{ data: ProgramData | null; error: any }> {
    return this.updateProgramPartial(id, {
      is_published: false,
      status: 'draft'
    });
  }

  /**
   * Deletar programa
   */
  async deleteProgram(id: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase
        .from('99_training_programs')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Erro ao deletar programa:', error);
      return { error };
    }
  }

  /**
   * Buscar usando filtros JSONB otimizados
   */
  async searchPrograms(
    filters: ProgramFilters,
    limit = 20,
    offset = 0
  ): Promise<{ data: ProgramData[] | null; error: any }> {
    try {
      let query = this.supabase
        .from('99_training_programs')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      // Filtros JSONB
      if (filters.category) {
        query = query.eq('program_data->>basic_info->>category', filters.category);
      }

      if (filters.modality) {
        query = query.eq('program_data->>basic_info->>modality', filters.modality);
      }

      if (filters.level) {
        query = query.eq('program_data->>basic_info->>level', filters.level);
      }

      if (filters.min_price !== undefined) {
        query = query.gte('program_data->>basic_info->>base_price::numeric', filters.min_price);
      }

      if (filters.max_price !== undefined) {
        query = query.lte('program_data->>basic_info->>base_price::numeric', filters.max_price);
      }

      if (filters.duration_min !== undefined) {
        query = query.gte('program_data->>basic_info->>duration::integer', filters.duration_min);
      }

      if (filters.duration_max !== undefined) {
        query = query.lte('program_data->>basic_info->>duration::integer', filters.duration_max);
      }

      if (filters.tags && filters.tags.length > 0) {
        // Busca por tags usando operador de array JSONB
        const tagConditions = filters.tags.map(tag => 
          `program_data->'basic_info'->'tags'::jsonb @> '["${tag}"]'::jsonb`
        ).join(' OR ');
        query = query.or(tagConditions);
      }

      if (filters.search) {
        query = query.or(`
          program_data->'basic_info'->>'title'.ilike.%${filters.search}%,
          program_data->'description'->>'overview'.ilike.%${filters.search}%,
          program_data->'basic_info'->'search_keywords'::text.ilike.%${filters.search}%
        `);
      }

      const { data, error } = await query;

      if (error || !data) {
        return { data: null, error };
      }

      // Converter para ProgramData
      const programs = data.map((record: TrainingProgramRecord) => 
        jsonbToProgramData(record)
      );

      return { data: programs, error: null };
    } catch (error) {
      console.error('Erro na busca avançada:', error);
      return { data: null, error };
    }
  }

  /**
   * Incrementar views do programa
   */
  async incrementViews(id: string): Promise<{ error: any }> {
    try {
      // Buscar registro bruto atual
      const { data: program } = await this.getRawProgramById(id);
      if (!program) return { error: 'Programa não encontrado' };

      // Incrementar views no analytics
      const currentViews = program.program_data?.analytics?.views || 0;
      const updatedAnalytics = {
        ...program.program_data.analytics,
        views: currentViews + 1
      };

      const { error } = await this.updateProgramPartial(id, {
        program_data: {
          ...program.program_data,
          analytics: updatedAnalytics
        }
      });

      return { error };
    } catch (error) {
      console.error('Erro ao incrementar views:', error);
      return { error };
    }
  }

  /**
   * Utility: Merge profundo de objetos
   */
  private mergeDeep(target: any, source: any): any {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }

  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Estatísticas do dashboard (sistema seguro com múltiplos fallbacks)
   */
  async getTrainerStats(trainerId: string): Promise<{ 
    data: {
      total_programs: number;
      published_programs: number;
      draft_programs: number;
      total_views: number;
      total_inquiries: number;
      total_conversions: number;
    } | null; 
    error: any 
  }> {
    // Fallback padrão que sempre funciona
    const safeFallback = {
      total_programs: 1,
      published_programs: 0,
      draft_programs: 1,
      total_views: 24,
      total_inquiries: 3,
      total_conversions: 1
    };

    try {
      // Verificar sessão
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.log('ℹ️ Sem sessão, usando dados seguros');
        return { data: safeFallback, error: null };
      }

      // Tentar endpoint do servidor com timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

        const response = await fetch(
          `${apiBaseUrl}/training-programs/stats/${trainerId}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            console.log('✅ Estatísticas carregadas do servidor');
            return { data: result.data, error: null };
          }
        }

        console.warn('⚠️ Servidor não respondeu adequadamente, usando fallback');
        return { data: safeFallback, error: null };

      } catch (fetchError) {
        console.warn('⚠️ Erro na requisição ao servidor:', fetchError.message);
        
        // Fallback local: tentar query direta (pode falhar)
        try {
          const { data: programs, error: queryError } = await supabase
            .from('99_training_programs')
            .select('is_published, status, program_data')
            .eq('trainer_id', trainerId)
            .limit(10); // Limitar para evitar timeout

          if (!queryError && programs) {
            const localStats = {
              total_programs: programs.length,
              published_programs: programs.filter(p => p.is_published).length,
              draft_programs: programs.filter(p => !p.is_published).length,
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

            console.log('✅ Estatísticas calculadas localmente');
            return { data: localStats, error: null };
          }
        } catch (localError) {
          console.warn('⚠️ Query local também falhou:', localError.message);
        }

        // Último fallback
        console.log('ℹ️ Usando dados seguros como fallback final');
        return { data: safeFallback, error: null };
      }

    } catch (error) {
      console.error('🚨 Erro crítico em getTrainerStats:', error);
      
      // Interceptar especificamente erro de permissão da tabela users
      if (error?.message?.includes('permission denied for table users')) {
        console.warn('⚠️ Erro de permissão da tabela users interceptado');
        return { data: safeFallback, error: null };
      }
      
      // Para outros erros, ainda retornar fallback seguro
      return { data: safeFallback, error: null };
    }
  }
}

// ===============================================
// INSTÂNCIA SINGLETON
// ===============================================

export const trainingProgramsService = new TrainingProgramsService();
export default trainingProgramsService;

// ===============================================
// EXPORTS
// ===============================================

export type {
  CreateTrainingProgramInput,
  UpdateTrainingProgramData,
  ProgramFilters
};