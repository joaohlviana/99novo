/**
 * 🚫 RANGE-ONLY SERVICE
 * 
 * Serviço que usa EXCLUSIVAMENTE o método range() para evitar problemas com limit()
 * Solução definitiva para os erros "Query não tem método limit"
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

export class RangeOnlyService {
  
  /**
   * Busca treinadores usando APENAS range()
   */
  static async searchTrainersBySpecialties(filters: SearchFilters = {}): Promise<{
    data: TrainerSearchResult[];
    count: number;
    error: string | null;
  }> {
    console.log('🔍 Iniciando busca usando APENAS range:', filters);

    try {
      const { specialties = [], matchMode = 'any', limit = 20, offset = 0 } = filters;
      
      // Calcular range baseado em limit e offset
      const startRange = offset;
      const endRange = offset + limit - 1;

      console.log(`📐 Range calculado: ${startRange} até ${endRange}`);

      // Estratégia 1: Tentar Materialized View
      try {
        console.log('🔍 Tentando Materialized View...');
        
        let query = supabase
          .from('trainers_denormalized_mv')
          .select('*', { count: 'exact' });

        // Aplicar filtros se houver especialidades
        if (specialties.length > 0) {
          const normalizedSpecialties = specialties.map(s => s.toLowerCase());
          
          if (matchMode === 'all') {
            query = query.contains('specialties_text', normalizedSpecialties);
          } else {
            query = query.overlaps('specialties_text', normalizedSpecialties);
          }
        }

        // SEMPRE usar range - NUNCA limit
        query = query.range(startRange, endRange);

        const { data, error, count } = await query;

        if (!error && data) {
          console.log(`✅ MV bem-sucedida: ${data.length} resultados`);
          return {
            data: data || [],
            count: count || 0,
            error: null
          };
        }

        console.warn('🔄 MV falhou ou sem dados, tentando tabela normal');
      } catch (mvError) {
        console.warn('🔄 Erro na MV:', mvError);
      }

      // Estratégia 2: Tabela normal com range
      console.log('🔍 Tentando tabela normal...');
      
      const { data, error, count } = await supabase
        .from('trainers_with_slugs')
        .select('id, slug, name, profile_data', { count: 'exact' })
        .not('profile_data', 'is', null)
        .range(startRange, endRange);

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

      // Filtrar por especialidades se necessário
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
   * Buscar programas por esporte usando APENAS range()
   */
  static async searchProgramsBySport(sportSlug: string, limit: number = 10): Promise<{
    data: any[];
    count: number;
    error: string | null;
  }> {
    try {
      console.log('🔍 Buscando programas com range:', { sportSlug, limit });

      const endRange = limit - 1;

      // Estratégia 1: View de programas
      try {
        const { data, error, count } = await supabase
          .from('training_programs_view')
          .select('*', { count: 'exact' })
          .contains('sports', [sportSlug])
          .eq('is_published', true)
          .range(0, endRange);

        if (!error && data && data.length > 0) {
          console.log(`✅ View de programas: ${data.length} resultados`);
          return {
            data: data || [],
            count: count || 0,
            error: null
          };
        }
      } catch (viewError) {
        console.warn('🔄 View falhou:', viewError);
      }

      // Estratégia 2: Tabela principal
      try {
        const { data, error, count } = await supabase
          .from('training_programs')
          .select('*', { count: 'exact' })
          .eq('is_published', true)
          .range(0, endRange);

        if (!error && data) {
          // Filtrar no cliente
          const filteredData = data.filter(program => {
            // Verificar múltiplos campos onde o esporte pode estar
            if (Array.isArray(program.sports) && program.sports.includes(sportSlug)) {
              return true;
            }
            if (program.program_data?.sports && Array.isArray(program.program_data.sports) && program.program_data.sports.includes(sportSlug)) {
              return true;
            }
            if (program.sport === sportSlug) {
              return true;
            }
            return false;
          });

          console.log(`✅ Tabela principal: ${filteredData.length} resultados filtrados`);
          return {
            data: filteredData,
            count: filteredData.length,
            error: null
          };
        }
      } catch (tableError) {
        console.warn('🔄 Tabela principal falhou:', tableError);
      }

      // Se chegou até aqui, não encontrou nada
      console.log('⚠️ Nenhum programa encontrado para o esporte:', sportSlug);
      return {
        data: [],
        count: 0,
        error: null
      };

    } catch (error) {
      console.error('🚨 Erro na busca de programas:', error);
      return {
        data: [],
        count: 0,
        error: String(error)
      };
    }
  }

  /**
   * Teste de conectividade usando APENAS range()
   */
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      console.log('🔍 Testando conexão com range...');

      const { data, error } = await supabase
        .from('trainers_with_slugs')
        .select('id')
        .range(0, 0); // Buscar apenas 1 registro

      if (error) {
        return {
          success: false,
          message: 'Erro na conexão com banco',
          details: error
        };
      }

      console.log('✅ Conexão funcionando com range');
      return {
        success: true,
        message: 'Conexão funcionando perfeitamente com range',
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
   * Buscar todos os treinadores usando APENAS range()
   */
  static async getAllTrainers(limit: number = 20): Promise<{
    data: TrainerSearchResult[];
    count: number;
    error: string | null;
  }> {
    try {
      console.log('🔍 Buscando todos os treinadores com range...');

      const endRange = limit - 1;

      const { data, error, count } = await supabase
        .from('trainers_with_slugs')
        .select('id, slug, name, profile_data', { count: 'exact' })
        .not('profile_data', 'is', null)
        .range(0, endRange);

      if (error) {
        throw new Error(`Erro na busca: ${error.message}`);
      }

      const processedData = (data || []).map(trainer => ({
        id: trainer.id,
        slug: trainer.slug,
        name: trainer.name,
        avatar: this.extractAvatar(trainer.profile_data),
        specialties_json: trainer.profile_data?.specialties || [],
        specialties_text: this.extractSpecialties(trainer.profile_data?.specialties)
      }));

      console.log(`✅ Todos os treinadores: ${processedData.length} resultados`);

      return {
        data: processedData,
        count: count || processedData.length,
        error: null
      };

    } catch (error) {
      console.error('🚨 Erro na busca de todos os treinadores:', error);
      return {
        data: [],
        count: 0,
        error: String(error)
      };
    }
  }

  /**
   * Obter estatísticas usando APENAS range()
   */
  static async getSpecialtiesStats(): Promise<{
    data: Array<{ specialty: string; count: number }>;
    error: string | null;
  }> {
    try {
      console.log('🔍 Buscando estatísticas com range...');

      const { data, error } = await supabase
        .from('trainers_with_slugs')
        .select('profile_data')
        .not('profile_data->specialties', 'is', null)
        .range(0, 99); // 100 registros

      if (error) {
        return { data: [], error: error.message };
      }

      // Processar estatísticas no cliente
      const specialtyCount: { [key: string]: number } = {};
      
      (data || []).forEach(trainer => {
        const specialties = this.extractSpecialties(trainer.profile_data?.specialties);
        specialties.forEach(specialty => {
          specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
        });
      });

      const stats = Object.entries(specialtyCount)
        .map(([specialty, count]) => ({ specialty, count }))
        .sort((a, b) => b.count - a.count);

      console.log(`✅ Estatísticas: ${stats.length} especialidades encontradas`);

      return { data: stats, error: null };

    } catch (error) {
      return { data: [], error: String(error) };
    }
  }
}

export default RangeOnlyService;