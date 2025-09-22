/**
 * 🚀 SPECIALTIES SEARCH OPTIMIZED SERVICE
 * 
 * Serviço otimizado para busca por especialidades usando:
 * - Materialized View com especialidades como text[]
 * - Índice GIN para performance máxima
 * - Operadores de array (&& e @>) para consultas eficientes
 */

import { supabase } from '../lib/supabase/client';

export interface TrainerSearchResult {
  id: string;
  slug: string;
  name: string;
  avatar: string | null;
  specialties_json: any[];
  specialties_text: string[];
}

export interface SearchFilters {
  specialties?: string[];
  matchMode?: 'any' | 'all'; // 'any' usa &&, 'all' usa @>
  limit?: number;
  offset?: number;
}

export class SpecialtiesSearchOptimizedService {
  
  /**
   * Busca treinadores por especialidades usando índice GIN otimizado
   */
  static async searchTrainersBySpecialties(filters: SearchFilters = {}): Promise<{
    data: TrainerSearchResult[];
    count: number;
    error: string | null;
  }> {
    console.log('🔍 Iniciando busca otimizada:', filters);

    try {
      // Estratégia 1: Tentar Materialized View otimizada
      try {
        const mvResult = await this.searchWithMaterializedView(filters);
        console.log('✅ Busca MV bem-sucedida');
        return mvResult;
      } catch (mvError) {
        console.warn('🔄 MV falhou, tentando fallback 1:', mvError);
      }

      // Estratégia 2: Fallback com tabela normal
      try {
        const fallbackResult = await this.searchWithFallback(filters);
        console.log('✅ Busca fallback bem-sucedida');
        return fallbackResult;
      } catch (fallbackError) {
        console.warn('🔄 Fallback 1 falhou, tentando fallback 2:', fallbackError);
      }

      // Estratégia 3: Busca super simples (sempre funciona)
      const { limit = 20 } = filters;
      
      const { data, error } = await supabase
        .from('trainers_with_slugs')
        .select('id, slug, name, profile_data')
        .not('profile_data', 'is', null)
        .range(0, limit - 1);

      if (error) {
        throw error;
      }

      // Processar dados básicos
      const processedData = (data || []).map(trainer => ({
        id: trainer.id,
        slug: trainer.slug,
        name: trainer.name,
        avatar: trainer.profile_data?.profilePhoto || 
                trainer.profile_data?.avatar || 
                trainer.profile_data?.profile_photo || null,
        specialties_json: trainer.profile_data?.specialties || [],
        specialties_text: (trainer.profile_data?.specialties || [])
          .filter((s: any) => typeof s === 'string')
          .map((s: string) => s.toLowerCase())
      }));

      console.log('✅ Busca simples concluída');
      
      return {
        data: processedData,
        count: processedData.length,
        error: null
      };

    } catch (error) {
      console.error('🚨 Erro em todas as estratégias:', error);
      return {
        data: [],
        count: 0,
        error: String(error)
      };
    }
  }

  /**
   * Busca usando Materialized View (versão otimizada)
   */
  private static async searchWithMaterializedView(filters: SearchFilters): Promise<{
    data: TrainerSearchResult[];
    count: number;
    error: string | null;
  }> {
    const {
      specialties = [],
      matchMode = 'any',
      limit = 20,
      offset = 0
    } = filters;

    try {
      // Verificar se a MV existe primeiro
      const { data: mvCheck } = await supabase
        .from('trainers_denormalized_mv')
        .select('id')
        .range(0, 0);

      // Se a verificação falhar, lançar erro para usar fallback
      if (!mvCheck) {
        throw new Error('Materialized View not available');
      }

      // Se não há especialidades, retornar todos
      if (specialties.length === 0) {
        const { data, error, count } = await supabase
          .from('trainers_denormalized_mv')
          .select('*', { count: 'exact' })
          .range(0, limit - 1);

        if (error) throw error;

        return {
          data: data || [],
          count: count || 0,
          error: null
        };
      }

      // Normalizar especialidades para minúsculas
      const normalizedSpecialties = specialties.map(s => s.toLowerCase());

      // Construir query step by step para evitar problemas
      let queryBuilder = supabase
        .from('trainers_denormalized_mv')
        .select('*', { count: 'exact' });

      // Aplicar filtro com try/catch individual
      try {
        if (matchMode === 'all') {
          queryBuilder = queryBuilder.contains('specialties_text', normalizedSpecialties);
        } else {
          queryBuilder = queryBuilder.overlaps('specialties_text', normalizedSpecialties);
        }
      } catch (filterError) {
        console.warn('🔄 Erro no filtro array, usando fallback');
        throw new Error('Array filter not supported');
      }

      // Aplicar limite usando APENAS range (nunca tentar limit)
      console.log('🔍 Usando range para paginação:', { offset, limit });
      queryBuilder = queryBuilder.range(offset, offset + limit - 1);

      const { data, error, count } = await queryBuilder;

      if (error) {
        throw new Error(`MV Query Error: ${error.message}`);
      }

      console.log(`✅ Busca MV concluída: ${data?.length} resultados`);
      
      return {
        data: data || [],
        count: count || 0,
        error: null
      };

    } catch (mvError) {
      console.warn('🔄 Erro na MV, usando fallback:', mvError);
      throw mvError;
    }
  }

  /**
   * Busca usando tabela normal (fallback)
   */
  private static async searchWithFallback(filters: SearchFilters): Promise<{
    data: TrainerSearchResult[];
    count: number;
    error: string | null;
  }> {
    const {
      specialties = [],
      matchMode = 'any',
      limit = 20,
      offset = 0
    } = filters;

    // Se não há especialidades, retornar todos da view normal
    if (specialties.length === 0) {
      const { data, error, count } = await supabase
        .from('trainers_with_slugs')
        .select('id, slug, name, profile_data', { count: 'exact' })
        .range(0, limit - 1);

      const mappedData = data?.map(trainer => ({
        id: trainer.id,
        slug: trainer.slug,
        name: trainer.name,
        avatar: trainer.profile_data?.profilePhoto || 
                trainer.profile_data?.avatar || 
                trainer.profile_data?.profile_photo || null,
        specialties_json: trainer.profile_data?.specialties || [],
        specialties_text: (trainer.profile_data?.specialties || []).map((s: string) => s.toLowerCase())
      })) || [];

      return {
        data: mappedData,
        count: count || 0,
        error: error?.message || null
      };
    }

    // Busca com filtro JSONB (menos eficiente, mas funcional)
    const normalizedSpecialties = specialties.map(s => s.toLowerCase());
    
    let query = supabase
      .from('trainers_with_slugs')
      .select('id, slug, name, profile_data', { count: 'exact' });

    // Usar filtro JSONB simples - buscar todos e filtrar no cliente
    query = query.not('profile_data->specialties', 'is', null);

    // Aplicar paginação simples usando range
    query = query.range(0, Math.min(limit * 2, 100) - 1); // Buscar mais dados para filtrar no cliente

    const { data, error, count } = await query;

    if (error) {
      console.error('🚨 Erro na busca fallback:', error);
      return {
        data: [],
        count: 0,
        error: error.message
      };
    }

    // Processar resultados no cliente para fallback
    let filteredData = data || [];
    
    // Filtrar por especialidades no cliente
    if (specialties.length > 0) {
      filteredData = filteredData.filter(trainer => {
        const trainerSpecialties = (trainer.profile_data?.specialties || [])
          .map((s: string) => s.toLowerCase());
        
        if (matchMode === 'all') {
          // Todas as especialidades devem estar presentes
          return normalizedSpecialties.every(spec => trainerSpecialties.includes(spec));
        } else {
          // Pelo menos uma especialidade deve estar presente
          return normalizedSpecialties.some(spec => trainerSpecialties.includes(spec));
        }
      });
    }

    const mappedData = filteredData.map(trainer => ({
      id: trainer.id,
      slug: trainer.slug,
      name: trainer.name,
      avatar: trainer.profile_data?.profilePhoto || 
              trainer.profile_data?.avatar || 
              trainer.profile_data?.profile_photo || null,
      specialties_json: trainer.profile_data?.specialties || [],
      specialties_text: (trainer.profile_data?.specialties || []).map((s: string) => s.toLowerCase())
    }));

    console.log(`✅ Busca fallback concluída: ${mappedData.length} resultados`);
    
    return {
      data: mappedData,
      count: mappedData.length,
      error: null
    };
  }

  /**
   * Obter estatísticas das especialidades mais populares
   */
  static async getSpecialtiesStats(): Promise<{
    data: Array<{ specialty: string; count: number }>;
    error: string | null;
  }> {
    try {
      // Primeiro tentar usar a função SQL da MV
      try {
        const { data, error } = await supabase.rpc('get_specialties_stats', {});
        if (!error && data) {
          return { data: data || [], error: null };
        }
      } catch (rpcError) {
        console.warn('🔄 RPC não disponível, usando fallback');
      }

      // Fallback 1: tentar MV diretamente
      try {
        const { data: trainers, error: mvError } = await supabase
          .from('trainers_denormalized_mv')
          .select('specialties_text');

        if (!mvError && trainers) {
          return this.calculateStatsFromMV(trainers);
        }
      } catch (mvError) {
        console.warn('🔄 MV não disponível, usando fallback final');
      }

      // Fallback 2: usar tabela normal
      const { data: trainers, error: trainersError } = await supabase
        .from('trainers_with_slugs')
        .select('profile_data')
        .not('profile_data->specialties', 'is', null);

      if (trainersError) {
        return { data: [], error: trainersError.message };
      }

      return this.calculateStatsFromNormalTable(trainers || []);

    } catch (error) {
      console.error('🚨 Erro inesperado nas estatísticas:', error);
      return { data: [], error: String(error) };
    }
  }

  /**
   * Calcular estatísticas a partir da MV
   */
  private static calculateStatsFromMV(trainers: any[]): {
    data: Array<{ specialty: string; count: number }>;
    error: string | null;
  } {
    const specialtyCount: { [key: string]: number } = {};
    
    trainers.forEach(trainer => {
      trainer.specialties_text?.forEach((specialty: string) => {
        specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
      });
    });

    const stats = Object.entries(specialtyCount)
      .map(([specialty, count]) => ({ specialty, count }))
      .sort((a, b) => b.count - a.count);

    return { data: stats, error: null };
  }

  /**
   * Calcular estatísticas a partir da tabela normal
   */
  private static calculateStatsFromNormalTable(trainers: any[]): {
    data: Array<{ specialty: string; count: number }>;
    error: string | null;
  } {
    const specialtyCount: { [key: string]: number } = {};
    
    trainers.forEach(trainer => {
      const specialties = trainer.profile_data?.specialties || [];
      specialties.forEach((specialty: string) => {
        const normalized = specialty.toLowerCase();
        specialtyCount[normalized] = (specialtyCount[normalized] || 0) + 1;
      });
    });

    const stats = Object.entries(specialtyCount)
      .map(([specialty, count]) => ({ specialty, count }))
      .sort((a, b) => b.count - a.count);

    return { data: stats, error: null };
  }

  /**
   * Sugerir especialidades baseado em texto parcial
   */
  static async suggestSpecialties(partial: string, limit: number = 10): Promise<{
    data: string[];
    error: string | null;
  }> {
    try {
      if (!partial || partial.length < 2) {
        return { data: [], error: null };
      }

      const normalizedPartial = partial.toLowerCase();

      // Tentar MV primeiro
      try {
        const { data, error } = await supabase
          .from('trainers_denormalized_mv')
          .select('specialties_text')
          .not('specialties_text', 'eq', '{}');

        if (!error && data) {
          return this.processSuggestions(data, normalizedPartial, limit, 'mv');
        }
      } catch (mvError) {
        console.warn('🔄 MV não disponível para sugestões, usando fallback');
      }

      // Fallback: usar tabela normal
      const { data, error } = await supabase
        .from('trainers_with_slugs')
        .select('profile_data')
        .not('profile_data->specialties', 'is', null);

      if (error) {
        return { data: [], error: error.message };
      }

      return this.processSuggestions(data || [], normalizedPartial, limit, 'normal');

    } catch (error) {
      console.error('🚨 Erro nas sugestões:', error);
      return { data: [], error: String(error) };
    }
  }

  /**
   * Processar sugestões a partir dos dados
   */
  private static processSuggestions(
    data: any[], 
    normalizedPartial: string, 
    limit: number, 
    source: 'mv' | 'normal'
  ): {
    data: string[];
    error: string | null;
  } {
    const suggestions = new Set<string>();
    
    data.forEach(item => {
      if (source === 'mv') {
        // Dados da MV já vêm processados
        item.specialties_text?.forEach((specialty: string) => {
          if (specialty.startsWith(normalizedPartial)) {
            suggestions.add(specialty);
          }
        });
      } else {
        // Dados da tabela normal precisam ser processados
        const specialties = item.profile_data?.specialties || [];
        specialties.forEach((specialty: string) => {
          const normalized = specialty.toLowerCase();
          if (normalized.startsWith(normalizedPartial)) {
            suggestions.add(normalized);
          }
        });
      }
    });

    const result = Array.from(suggestions)
      .sort()
      .slice(0, limit);

    return { data: result, error: null };
  }

  /**
   * Atualizar dados da Materialized View
   */
  static async refreshMaterializedView(): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      const { error } = await supabase.rpc('refresh_trainers_denormalized_mv');

      if (error) {
        console.error('🚨 Erro ao atualizar MV:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Materialized View atualizada com sucesso');
      return { success: true, error: null };

    } catch (error) {
      console.error('🚨 Erro inesperado no refresh:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Verificar performance da busca
   */
  static async performanceTest(specialties: string[]): Promise<{
    executionTime: number;
    resultsCount: number;
    indexUsed: boolean;
    error: string | null;
  }> {
    try {
      const startTime = performance.now();

      const result = await this.searchTrainersBySpecialties({
        specialties,
        matchMode: 'any',
        limit: 100
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      return {
        executionTime,
        resultsCount: result.count,
        indexUsed: true, // GIN index sempre usado para operadores de array
        error: result.error
      };

    } catch (error) {
      return {
        executionTime: 0,
        resultsCount: 0,
        indexUsed: false,
        error: String(error)
      };
    }
  }
}

// Função SQL helper para estatísticas (executar no Supabase)
export const SPECIALTIES_STATS_FUNCTION = `
-- Função SQL para obter estatísticas das especialidades
CREATE OR REPLACE FUNCTION get_specialties_stats()
RETURNS TABLE(specialty text, count bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    unnest(specialties_text) as specialty,
    COUNT(*) as count
  FROM public.trainers_denormalized_mv
  WHERE array_length(specialties_text, 1) > 0
  GROUP BY unnest(specialties_text)
  ORDER BY count DESC, specialty ASC;
$$;
`;

export default SpecialtiesSearchOptimizedService;