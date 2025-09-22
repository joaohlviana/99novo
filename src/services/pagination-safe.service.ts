/**
 * 🛡️ PAGINATION SAFE SERVICE
 * 
 * Solução definitiva para problemas de paginação no Supabase
 * Funciona independente de limit() ou range() estarem disponíveis
 */

import { supabase } from '../lib/supabase/client';

export class PaginationSafeService {
  
  /**
   * Aplica paginação de forma super segura - testa todos os métodos disponíveis
   */
  static async applyPagination(
    query: any, 
    limit: number = 20, 
    offset: number = 0
  ): Promise<{ query: any; method: string }> {
    console.log('🔧 Aplicando paginação segura:', { limit, offset });

    // Estratégia 1: Tentar range primeiro
    if (typeof query.range === 'function') {
      try {
        const endRange = offset + limit - 1;
        const paginatedQuery = query.range(offset, endRange);
        console.log('✅ Usando range():', { offset, endRange });
        return { query: paginatedQuery, method: 'range' };
      } catch (rangeError) {
        console.warn('🔄 range() falhou:', rangeError);
      }
    } else {
      console.warn('🔄 range() não está disponível');
    }

    // Estratégia 2: Tentar limit + offset se disponíveis
    if (typeof query.limit === 'function') {
      try {
        let paginatedQuery = query.limit(limit);
        
        // Aplicar offset se disponível e maior que 0
        if (offset > 0 && typeof paginatedQuery.offset === 'function') {
          paginatedQuery = paginatedQuery.offset(offset);
          console.log('✅ Usando limit() + offset():', { limit, offset });
          return { query: paginatedQuery, method: 'limit+offset' };
        } else {
          console.log('✅ Usando apenas limit():', { limit });
          return { query: paginatedQuery, method: 'limit' };
        }
      } catch (limitError) {
        console.warn('🔄 limit() falhou:', limitError);
      }
    } else {
      console.warn('🔄 limit() não está disponível');
    }

    // Estratégia 3: Sem paginação - retornar query original
    console.warn('⚠️ Nenhum método de paginação disponível, retornando query sem paginação');
    return { query, method: 'none' };
  }

  /**
   * Busca dados com paginação super segura
   */
  static async safeSelect(
    tableName: string,
    selectFields: string = '*',
    filters: Record<string, any> = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    data: any[];
    error: string | null;
    method: string;
    total?: number;
  }> {
    try {
      console.log('🔍 Executando busca segura:', { tableName, selectFields, filters, limit, offset });

      // Construir query base
      let query = supabase.from(tableName).select(selectFields);

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && value.operator) {
            // Filtros complexos como { operator: 'eq', value: 'something' }
            query = query[value.operator](key, value.value);
          } else {
            // Filtros simples
            query = query.eq(key, value);
          }
        }
      });

      // Aplicar paginação segura
      const { query: paginatedQuery, method } = await this.applyPagination(query, limit, offset);

      // Executar query
      const { data, error } = await paginatedQuery;

      if (error) {
        console.error('❌ Erro na busca segura:', error);
        return {
          data: [],
          error: error.message,
          method
        };
      }

      console.log(`✅ Busca segura concluída via ${method}:`, data?.length || 0, 'registros');

      return {
        data: data || [],
        error: null,
        method
      };

    } catch (error) {
      console.error('🚨 Erro inesperado na busca segura:', error);
      return {
        data: [],
        error: String(error),
        method: 'error'
      };
    }
  }

  /**
   * Busca treinadores de forma super segura
   */
  static async searchTrainersSafe(params: {
    query?: string;
    specialties?: string[];
    city?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    data: any[];
    error: string | null;
    method: string;
  }> {
    try {
      const { query: searchQuery, specialties, city, limit = 20, offset = 0 } = params;

      console.log('🔍 Busca segura de treinadores:', params);

      // Estratégia 1: Tentar trainers_with_slugs
      try {
        const filters: Record<string, any> = {
          is_active: true,
          slug: { operator: 'not', value: { operator: 'is', value: null } }
        };

        // Filtro por nome se fornecido
        if (searchQuery) {
          // Para busca de texto, usar uma abordagem diferente
          let baseQuery = supabase
            .from('trainers_with_slugs')
            .select('*')
            .eq('is_active', true)
            .not('slug', 'is', null)
            .ilike('name', `%${searchQuery}%`);

          const { query: paginatedQuery, method } = await this.applyPagination(baseQuery, limit, offset);
          const { data, error } = await paginatedQuery;

          if (!error && data) {
            console.log(`✅ Busca por nome bem-sucedida via ${method}:`, data.length);
            return { data, error: null, method };
          }
        } else {
          // Busca sem filtro de texto
          const result = await this.safeSelect(
            'trainers_with_slugs',
            '*',
            filters,
            limit,
            offset
          );

          if (!result.error && result.data.length > 0) {
            console.log(`✅ Busca básica bem-sucedida via ${result.method}:`, result.data.length);
            return result;
          }
        }
      } catch (viewError) {
        console.warn('🔄 trainers_with_slugs falhou:', viewError);
      }

      // Estratégia 2: Tentar user_profiles como fallback
      try {
        console.log('🔄 Tentando fallback com user_profiles...');

        const result = await this.safeSelect(
          'user_profiles',
          'id, name, profile_data, slug',
          {
            role: 'trainer',
            is_active: true
          },
          Math.min(limit, 10), // Limitar para evitar sobrecarga
          0 // Reset offset para fallback
        );

        if (!result.error) {
          console.log(`✅ Fallback bem-sucedido via ${result.method}:`, result.data.length);
          return result;
        }
      } catch (fallbackError) {
        console.warn('🔄 Fallback user_profiles falhou:', fallbackError);
      }

      // Estratégia 3: Retornar dados vazios se tudo falhar
      console.warn('⚠️ Todas as estratégias falharam, retornando vazio');
      return {
        data: [],
        error: null,
        method: 'empty_fallback'
      };

    } catch (error) {
      console.error('🚨 Erro na busca segura de treinadores:', error);
      return {
        data: [],
        error: String(error),
        method: 'error'
      };
    }
  }

  /**
   * Teste de conectividade básica
   */
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
    method: string;
    details?: any;
  }> {
    try {
      console.log('🔍 Testando conectividade com paginação segura...');

      const result = await this.safeSelect(
        'trainers_with_slugs',
        'id',
        { is_active: true },
        1,
        0
      );

      if (!result.error) {
        return {
          success: true,
          message: `Conexão funcionando via ${result.method}`,
          method: result.method,
          details: { recordsFound: result.data.length }
        };
      } else {
        return {
          success: false,
          message: `Erro na conexão: ${result.error}`,
          method: result.method,
          details: { error: result.error }
        };
      }

    } catch (error) {
      return {
        success: false,
        message: `Erro inesperado: ${String(error)}`,
        method: 'error',
        details: { error }
      };
    }
  }
}

export default PaginationSafeService;