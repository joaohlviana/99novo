/**
 * 🔧 SPECIALTIES SEARCH FIXED SERVICE
 * 
 * Versão corrigida que resolve o erro "Query não tem método limit"
 * usando uma abordagem mais robusta e compatível com o Supabase JS v2
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
  matchMode?: 'any' | 'all';
  limit?: number;
  offset?: number;
}

export class SpecialtiesSearchFixedService {
  
  /**
   * Busca principal com correção do erro de limit
   */
  static async searchTrainersBySpecialties(filters: SearchFilters = {}): Promise<{
    data: TrainerSearchResult[];
    count: number;
    error: string | null;
  }> {
    console.log('🔍 Iniciando busca corrigida:', filters);

    try {
      // Estratégia 1: Busca mais robusta com query builder corrigido
      const result = await this.executeRobustSearch(filters);
      if (result.success) {
        console.log('✅ Busca robusta bem-sucedida');
        return result.data;
      }

      // Estratégia 2: Busca simples sem operadores complexos  
      const simpleResult = await this.executeSimpleSearch(filters);
      console.log('✅ Busca simples concluída');
      return simpleResult;

    } catch (error) {
      console.error('🚨 Erro em todas as estratégias:', error);
      return {
        data: [],
        count: 0,
        error: `Erro na busca: ${String(error)}`
      };
    }
  }

  /**
   * Estratégia 1: Busca robusta com verificação de métodos
   */
  private static async executeRobustSearch(filters: SearchFilters): Promise<{
    success: boolean;
    data: { data: TrainerSearchResult[]; count: number; error: string | null };
  }> {
    try {
      const { specialties = [], matchMode = 'any', limit = 20 } = filters;

      console.log('🔍 Tentando busca robusta com:', { specialties, matchMode, limit });

      // Primeiro, tentar a Materialized View
      try {
        const mvResult = await this.tryMaterializedView(specialties, matchMode, limit);
        if (mvResult.success) {
          return mvResult;
        }
      } catch (mvError) {
        console.warn('🔄 MV falhou:', mvError);
      }

      // Fallback: usar tabela normal
      return await this.tryNormalTable(specialties, matchMode, limit);

    } catch (error) {
      console.warn('🔄 Busca robusta falhou:', error);
      return {
        success: false,
        data: { data: [], count: 0, error: String(error) }
      };
    }
  }

  /**
   * Tentar Materialized View com cuidado extra
   */
  private static async tryMaterializedView(
    specialties: string[], 
    matchMode: string, 
    limit: number
  ): Promise<{
    success: boolean;
    data: { data: TrainerSearchResult[]; count: number; error: string | null };
  }> {
    try {
      // Verificar se a MV existe fazendo uma query simples primeiro
      const { data: checkData, error: checkError } = await supabase
        .from('trainers_denormalized_mv')
        .select('id')
        .limit(1);

      if (checkError) {
        throw new Error(`MV não disponível: ${checkError.message}`);
      }

      // Construir query passo a passo
      const query = supabase
        .from('trainers_denormalized_mv')
        .select('*', { count: 'exact' });

      // Aplicar filtros se houver especialidades
      let finalQuery = query;
      if (specialties.length > 0) {
        const normalizedSpecialties = specialties.map(s => s.toLowerCase());
        
        if (matchMode === 'all') {
          finalQuery = query.contains('specialties_text', normalizedSpecialties);
        } else {
          finalQuery = query.overlaps('specialties_text', normalizedSpecialties);
        }
      }

      // Aplicar limite de forma segura
      const limitedQuery = finalQuery.range(0, limit - 1);
      
      const { data, error, count } = await limitedQuery;

      if (error) {
        throw new Error(`Erro na query MV: ${error.message}`);
      }

      console.log(`✅ MV query bem-sucedida: ${data?.length} resultados`);

      return {
        success: true,
        data: {
          data: data || [],
          count: count || 0,
          error: null
        }
      };

    } catch (error) {
      console.warn('🔄 Erro na MV:', error);
      throw error;
    }
  }

  /**
   * Tentar tabela normal como fallback
   */
  private static async tryNormalTable(
    specialties: string[], 
    matchMode: string, 
    limit: number
  ): Promise<{
    success: boolean;
    data: { data: TrainerSearchResult[]; count: number; error: string | null };
  }> {
    try {
      console.log('🔍 Usando tabela normal como fallback');

      // Query mais simples usando range ao invés de limit
      const { data, error, count } = await supabase
        .from('trainers_with_slugs')
        .select('id, slug, name, profile_data', { count: 'exact' })
        .not('profile_data', 'is', null)
        .range(0, limit - 1);

      if (error) {
        throw new Error(`Erro na tabela normal: ${error.message}`);
      }

      // Processar dados
      let processedData = (data || []).map(trainer => ({
        id: trainer.id,
        slug: trainer.slug,
        name: trainer.name,
        avatar: this.extractAvatar(trainer.profile_data),
        specialties_json: trainer.profile_data?.specialties || [],
        specialties_text: this.extractSpecialties(trainer.profile_data?.specialties)
      }));

      // Filtrar no cliente se necessário
      if (specialties.length > 0) {
        const normalizedSpecialties = specialties.map(s => s.toLowerCase());
        
        processedData = processedData.filter(trainer => {
          if (matchMode === 'all') {
            return normalizedSpecialties.every(spec => 
              trainer.specialties_text.includes(spec)
            );
          } else {
            return normalizedSpecialties.some(spec => 
              trainer.specialties_text.includes(spec)
            );
          }
        });
      }

      console.log(`✅ Tabela normal bem-sucedida: ${processedData.length} resultados`);

      return {
        success: true,
        data: {
          data: processedData,
          count: processedData.length,
          error: null
        }
      };

    } catch (error) {
      console.warn('🔄 Erro na tabela normal:', error);
      throw error;
    }
  }

  /**
   * Estratégia 2: Busca ultra simples
   */
  private static async executeSimpleSearch(filters: SearchFilters): Promise<{
    data: TrainerSearchResult[];
    count: number;
    error: string | null;
  }> {
    try {
      const { limit = 20 } = filters;

      console.log('🔍 Executando busca ultra simples');

      // Query mais básica possível usando range
      const { data, error } = await supabase
        .from('trainers_with_slugs')
        .select('id, slug, name, profile_data')
        .not('profile_data', 'is', null)
        .range(0, limit - 1);

      if (error) {
        return {
          data: [],
          count: 0,
          error: `Erro na busca simples: ${error.message}`
        };
      }

      // Processar dados básicos
      const processedData = (data || []).map(trainer => ({
        id: trainer.id,
        slug: trainer.slug,
        name: trainer.name,
        avatar: this.extractAvatar(trainer.profile_data),
        specialties_json: trainer.profile_data?.specialties || [],
        specialties_text: this.extractSpecialties(trainer.profile_data?.specialties)
      }));

      console.log(`✅ Busca simples concluída: ${processedData.length} resultados`);

      return {
        data: processedData,
        count: processedData.length,
        error: null
      };

    } catch (error) {
      return {
        data: [],
        count: 0,
        error: `Erro na busca simples: ${String(error)}`
      };
    }
  }

  /**
   * Extrair avatar de forma segura
   */
  private static extractAvatar(profileData: any): string | null {
    if (!profileData) return null;
    
    return profileData.profilePhoto || 
           profileData.avatar || 
           profileData.profile_photo || 
           null;
  }

  /**
   * Extrair especialidades de forma segura
   */
  private static extractSpecialties(specialties: any): string[] {
    if (!Array.isArray(specialties)) return [];
    
    return specialties
      .filter(s => typeof s === 'string')
      .map(s => s.toLowerCase());
  }

  /**
   * Teste de conectividade
   */
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      // Usar range ao invés de limit
      const { data, error } = await supabase
        .from('trainers_with_slugs')
        .select('id')
        .range(0, 0);

      if (error) {
        return {
          success: false,
          message: 'Erro na conexão com banco',
          details: error
        };
      }

      return {
        success: true,
        message: 'Conexão funcionando perfeitamente',
        details: { recordsFound: data?.length || 0 }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Erro de conectividade',
        details: error
      };
    }
  }

  /**
   * Buscar programas de um esporte específico
   */
  static async searchProgramsBySport(sportSlug: string, limit: number = 10): Promise<{
    data: any[];
    count: number;
    error: string | null;
  }> {
    try {
      console.log('🔍 Buscando programas do esporte:', sportSlug);

      // Estratégia 1: Tentar a view de programas
      try {
        const { data, error, count } = await supabase
          .from('training_programs_view')
          .select('*', { count: 'exact' })
          .contains('sports', [sportSlug])
          .eq('is_published', true)
          .range(0, limit - 1);

        if (!error && data) {
          console.log(`✅ Encontrados ${data.length} programas na view do esporte ${sportSlug}`);
          return {
            data: data || [],
            count: count || 0,
            error: null
          };
        }
      } catch (viewError) {
        console.warn('🔄 View de programas falhou, tentando tabela principal:', viewError);
      }

      // Estratégia 2: Usar tabela principal de programas
      try {
        const { data, error, count } = await supabase
          .from('training_programs')
          .select('*', { count: 'exact' })
          .contains('sports', [sportSlug])
          .eq('is_published', true)
          .range(0, limit - 1);

        if (!error && data) {
          console.log(`✅ Encontrados ${data.length} programas na tabela principal do esporte ${sportSlug}`);
          return {
            data: data || [],
            count: count || 0,
            error: null
          };
        }
      } catch (tableError) {
        console.warn('🔄 Tabela principal falhou, tentando busca híbrida:', tableError);
      }

      // Estratégia 3: Busca híbrida com JSONB
      try {
        const { data, error, count } = await supabase
          .from('training_programs')
          .select('*', { count: 'exact' })
          .contains('program_data->sports', [sportSlug])
          .eq('is_published', true)
          .range(0, limit - 1);

        if (!error && data) {
          console.log(`✅ Encontrados ${data.length} programas via JSONB do esporte ${sportSlug}`);
          return {
            data: data || [],
            count: count || 0,
            error: null
          };
        }
      } catch (jsonbError) {
        console.warn('🔄 Busca JSONB falhou, tentando busca simples:', jsonbError);
      }

      // Estratégia 4: Busca super simples
      const { data, error, count } = await supabase
        .from('training_programs')
        .select('*', { count: 'exact' })
        .eq('is_published', true)
        .range(0, limit - 1);

      // Filtrar no cliente se necessário
      let filteredData = data || [];
      if (data && sportSlug) {
        filteredData = data.filter(program => {
          // Verificar se o esporte está em sports array
          if (Array.isArray(program.sports) && program.sports.includes(sportSlug)) {
            return true;
          }
          // Verificar se o esporte está em program_data.sports
          if (program.program_data?.sports && Array.isArray(program.program_data.sports) && program.program_data.sports.includes(sportSlug)) {
            return true;
          }
          return false;
        });
      }

      console.log(`✅ Encontrados ${filteredData.length} programas (filtrados no cliente) do esporte ${sportSlug}`);

      return {
        data: filteredData,
        count: filteredData.length,
        error: error?.message || null
      };

    } catch (error) {
      console.error('🚨 Erro inesperado na busca de programas:', error);
      return {
        data: [],
        count: 0,
        error: String(error)
      };
    }
  }
}

export default SpecialtiesSearchFixedService;