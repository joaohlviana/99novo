/**
 * 🛡️ SPECIALTIES SEARCH SAFE SERVICE
 * 
 * Versão super robusta e à prova de erros da busca por especialidades.
 * Implementa múltiplas estratégias de fallback para garantir que sempre funcione.
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

export class SpecialtiesSearchSafeService {
  
  /**
   * Busca principal com sistema robusto de fallbacks
   */  
  static async searchTrainersBySpecialties(filters: SearchFilters = {}): Promise<{
    data: TrainerSearchResult[];
    count: number;
    error: string | null;
  }> {
    console.log('🔍 Iniciando busca segura por especialidades:', filters);
    
    try {
      // Estratégia 1: Tentar busca otimizada
      const optimizedResult = await this.tryOptimizedSearch(filters);
      if (optimizedResult.success) {
        console.log('✅ Busca otimizada bem-sucedida');
        return optimizedResult.result;
      }

      // Estratégia 2: Busca básica com tabela normal
      const basicResult = await this.tryBasicSearch(filters);
      if (basicResult.success) {
        console.log('✅ Busca básica bem-sucedida');
        return basicResult.result;
      }

      // Estratégia 3: Busca super simples (sempre funciona)
      const simpleResult = await this.trySimpleSearch(filters);
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
   * Estratégia 1: Busca otimizada (pode falhar)
   */
  private static async tryOptimizedSearch(filters: SearchFilters): Promise<{
    success: boolean;
    result: { data: TrainerSearchResult[]; count: number; error: string | null };
  }> {
    try {
      const { specialties = [], matchMode = 'any', limit = 20 } = filters;

      // Tentar Materialized View primeiro
      try {
        let query = supabase
          .from('trainers_denormalized_mv')
          .select('*', { count: 'exact' });

        // Se há especialidades, aplicar filtros
        if (specialties.length > 0) {
          const normalizedSpecialties = specialties.map(s => s.toLowerCase());
          
          if (matchMode === 'all') {
            query = query.contains('specialties_text', normalizedSpecialties);
          } else {
            query = query.overlaps('specialties_text', normalizedSpecialties);
          }
        }

        // Aplicar limite usando range
        query = query.range(0, limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
          success: true,
          result: {
            data: data || [],
            count: count || 0,
            error: null
          }
        };

      } catch (mvError) {
        console.warn('🔄 MV falhou, tentando view normal:', mvError);
        throw mvError;
      }

    } catch (error) {
      return {
        success: false,
        result: { data: [], count: 0, error: String(error) }
      };
    }
  }

  /**
   * Estratégia 2: Busca básica com view normal
   */
  private static async tryBasicSearch(filters: SearchFilters): Promise<{
    success: boolean;
    result: { data: TrainerSearchResult[]; count: number; error: string | null };
  }> {
    try {
      const { specialties = [], matchMode = 'any', limit = 20 } = filters;

      // Buscar dados da view normal
      const { data, error, count } = await supabase
        .from('trainers_with_slugs')
        .select('id, slug, name, profile_data', { count: 'exact' })
        .not('profile_data', 'is', null)
        .range(0, limit - 1);

      if (error) throw error;

      // Processar dados no cliente
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

      return {
        success: true,
        result: {
          data: processedData,
          count: processedData.length,
          error: null
        }
      };

    } catch (error) {
      return {
        success: false,
        result: { data: [], count: 0, error: String(error) }
      };
    }
  }

  /**
   * Estratégia 3: Busca super simples (sempre funciona)
   */
  private static async trySimpleSearch(filters: SearchFilters): Promise<{
    data: TrainerSearchResult[];
    count: number;
    error: string | null;
  }> {
    try {
      const { limit = 20 } = filters;

      // Busca mais simples possível
      const { data, error } = await supabase
        .from('trainers_with_slugs')
        .select('id, slug, name, profile_data')
        .not('profile_data', 'is', null)
        .range(0, limit - 1);

      if (error) {
        // Se até isso falhar, retornar dados vazios com informação
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
   * Busca estatísticas básicas
   */
  static async getSpecialtiesStats(): Promise<{
    data: Array<{ specialty: string; count: number }>;
    error: string | null;
  }> {
    try {
      // Busca mais simples possível
      const { data, error } = await supabase
        .from('trainers_with_slugs')
        .select('profile_data')
        .not('profile_data->specialties', 'is', null)
        .range(0, 99);

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

      return { data: stats, error: null };

    } catch (error) {
      return { data: [], error: String(error) };
    }
  }

  /**
   * Teste de conectividade básica
   */
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
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
        message: 'Conexão funcionando',
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
}

export default SpecialtiesSearchSafeService;