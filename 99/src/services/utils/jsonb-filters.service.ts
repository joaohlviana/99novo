/**
 * 🎯 SERVIÇO UTILITÁRIO PARA FILTROS JSONB
 * ========================================
 * Corrige problemas de "invalid input syntax for type json"
 * Fornece métodos seguros para buscar em campos JSONB do PostgreSQL
 * 
 * PROBLEMA RESOLVIDO:
 * - Erro ao passar strings simples como "Musculação" para campos JSONB
 * - Sintaxe incorreta de operadores JSONB (@>, contains, etc.)
 * - Validação de dados JSON antes de enviar queries
 */

import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export interface JsonbFilterOptions {
  /**
   * Estratégia de fallback se a query JSONB falhar
   * - 'text': Busca textual simples
   * - 'skip': Remove o filtro
   * - 'throw': Lança o erro
   */
  fallbackStrategy?: 'text' | 'skip' | 'throw';
  
  /**
   * Se deve fazer log dos erros de filtro
   */
  logErrors?: boolean;
  
  /**
   * Timeout para queries complexas (ms)
   */
  queryTimeout?: number;
}

/**
 * Classe para gerenciar filtros JSONB seguros
 */
export class JsonbFiltersService {
  private defaultOptions: JsonbFilterOptions = {
    fallbackStrategy: 'text',
    logErrors: true,
    queryTimeout: 5000
  };

  /**
   * Filtra um array JSONB contendo valores específicos
   * Exemplo: specialties = ["Musculação", "Crossfit"]
   */
  async filterJsonbArrayContains<T>(
    query: PostgrestFilterBuilder<any, T, any>,
    column: string,
    values: string[],
    options: JsonbFilterOptions = {}
  ): Promise<PostgrestFilterBuilder<any, T, any>> {
    const opts = { ...this.defaultOptions, ...options };
    
    if (!values || values.length === 0) {
      return query;
    }

    // Filtrar valores válidos
    const validValues = values.filter(v => 
      v && 
      typeof v === 'string' && 
      v.trim().length > 0
    ).map(v => v.trim());

    if (validValues.length === 0) {
      return query;
    }

    try {
      // 🎯 ESTRATÉGIA 1: Usar operador @> (contains) com sintaxe PostgreSQL
      const searchValue = validValues[0]; // Por simplicidade, usar apenas o primeiro valor
      const jsonArray = JSON.stringify([searchValue]);
      
      if (opts.logErrors) {
        console.log(`🔍 Aplicando filtro JSONB @> em ${column}:`, jsonArray);
      }

      // Usar filter com operador cs (contains) que mapeia para @>  
      return query.filter(column, 'cs', jsonArray);

    } catch (error) {
      if (opts.logErrors) {
        console.warn(`⚠️ Erro no filtro JSONB @> para ${column}:`, error);
      }

      return this.handleFilterError(query, column, validValues, opts, error);
    }
  }

  /**
   * 🎯 NOVO MÉTODO FASE 4: Filtra por múltiplas variações de especialidades
   * Otimizado para o SportMappingService que retorna múltiplas variações
   */
  async filterJsonbArrayMultipleVariations<T>(
    query: PostgrestFilterBuilder<any, T, any>,
    column: string,
    variations: string[],
    options: JsonbFilterOptions = {}
  ): Promise<PostgrestFilterBuilder<any, T, any>> {
    const opts = { ...this.defaultOptions, ...options };
    
    if (!variations || variations.length === 0) {
      return query;
    }

    const validVariations = this.sanitizeStringArray(variations);
    if (validVariations.length === 0) {
      return query;
    }

    try {
      if (opts.logErrors) {
        console.log(`🔍 Aplicando filtro JSONB múltiplas variações em ${column}:`, validVariations);
      }

      if (validVariations.length === 1) {
        // Caso simples: apenas uma variação
        const jsonArray = JSON.stringify([validVariations[0]]);
        return query.filter(column, 'cs', jsonArray);
      } else {
        // Múltiplas variações: construir OR conditions
        const orConditions = validVariations.map(variation => {
          const jsonArray = JSON.stringify([variation]);
          return `${column} @> '${jsonArray}'`;
        }).join(' OR ');

        // Usar método or() se disponível
        if (typeof query.or === 'function') {
          return query.or(orConditions);
        } else {
          // Fallback: busca textual por qualquer uma das variações
          const textConditions = validVariations.map(variation => 
            `${column}::text ILIKE '%"${variation}"%'`
          ).join(' OR ');
          
          if (typeof query.or === 'function') {
            return query.or(textConditions);
          } else {
            // Último fallback: usar apenas a primeira variação
            const jsonArray = JSON.stringify([validVariations[0]]);
            return query.filter(column, 'cs', jsonArray);
          }
        }
      }

    } catch (error) {
      if (opts.logErrors) {
        console.warn(`⚠️ Erro no filtro JSONB múltiplas variações para ${column}:`, error);
      }

      return this.handleFilterError(query, column, validVariations, opts, error);
    }
  }

  /**
   * Filtra por valor específico em um campo JSONB
   * Exemplo: profile_data->>'city' = 'São Paulo'
   */
  async filterJsonbField<T>(
    query: PostgrestFilterBuilder<any, T, any>,
    column: string,
    field: string,
    value: string,
    options: JsonbFilterOptions = {}
  ): Promise<PostgrestFilterBuilder<any, T, any>> {
    const opts = { ...this.defaultOptions, ...options };
    
    if (!value || typeof value !== 'string' || !value.trim()) {
      return query;
    }

    const cleanValue = value.trim();
    const jsonbPath = `${column}->>${field}`;

    try {
      if (opts.logErrors) {
        console.log(`🔍 Aplicando filtro JSONB field ${jsonbPath}:`, cleanValue);
      }

      return query.eq(jsonbPath, cleanValue);

    } catch (error) {
      if (opts.logErrors) {
        console.warn(`⚠️ Erro no filtro JSONB field ${jsonbPath}:`, error);
      }

      return this.handleFilterError(query, jsonbPath, [cleanValue], opts, error);
    }
  }

  /**
   * Filtra por valor numérico em campo JSONB
   * Exemplo: profile_data->>'rating' >= 4.0
   */
  async filterJsonbNumeric<T>(
    query: PostgrestFilterBuilder<any, T, any>,
    column: string,
    field: string,
    value: number,
    operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' = 'gte',
    options: JsonbFilterOptions = {}
  ): Promise<PostgrestFilterBuilder<any, T, any>> {
    const opts = { ...this.defaultOptions, ...options };
    
    if (typeof value !== 'number' || isNaN(value)) {
      return query;
    }

    const jsonbPath = `${column}->>${field}`;

    try {
      if (opts.logErrors) {
        console.log(`🔍 Aplicando filtro JSONB numeric ${jsonbPath} ${operator}:`, value);
      }

      switch (operator) {
        case 'eq':
          return query.eq(jsonbPath, value);
        case 'gt':
          return query.gt(jsonbPath, value);
        case 'gte':
          return query.gte(jsonbPath, value);
        case 'lt':
          return query.lt(jsonbPath, value);
        case 'lte':
          return query.lte(jsonbPath, value);
        default:
          return query.gte(jsonbPath, value);
      }

    } catch (error) {
      if (opts.logErrors) {
        console.warn(`⚠️ Erro no filtro JSONB numeric ${jsonbPath}:`, error);
      }

      return this.handleFilterError(query, jsonbPath, [value.toString()], opts, error);
    }
  }

  /**
   * Busca textual dentro de arrays JSONB
   * Para casos onde contains não funciona
   */
  async filterJsonbArrayTextSearch<T>(
    query: PostgrestFilterBuilder<any, T, any>,
    column: string,
    searchTerm: string,
    options: JsonbFilterOptions = {}
  ): Promise<PostgrestFilterBuilder<any, T, any>> {
    const opts = { ...this.defaultOptions, ...options };
    
    if (!searchTerm || typeof searchTerm !== 'string' || !searchTerm.trim()) {
      return query;
    }

    const cleanTerm = searchTerm.trim();

    try {
      if (opts.logErrors) {
        console.log(`🔍 Aplicando busca textual JSONB em ${column}:`, cleanTerm);
      }

      // Buscar pela string dentro do JSON serializado
      return query.filter(column, 'ilike', `%"${cleanTerm}"%`);

    } catch (error) {
      if (opts.logErrors) {
        console.warn(`⚠️ Erro na busca textual JSONB ${column}:`, error);
      }

      if (opts.fallbackStrategy === 'throw') {
        throw error;
      }

      return query; // Skip filter
    }
  }

  /**
   * Tratamento de erros com fallbacks
   */
  private async handleFilterError<T>(
    query: PostgrestFilterBuilder<any, T, any>,
    column: string,
    values: string[],
    options: JsonbFilterOptions,
    error: any
  ): Promise<PostgrestFilterBuilder<any, T, any>> {
    
    switch (options.fallbackStrategy) {
      case 'text':
        // Tentar busca textual como fallback
        if (values.length > 0) {
          try {
            if (options.logErrors) {
              console.log(`🔄 Usando fallback textual para ${column}:`, values[0]);
            }
            return query.filter(column, 'ilike', `%"${values[0]}"%`);
          } catch (textError) {
            if (options.logErrors) {
              console.warn(`❌ Fallback textual também falhou:`, textError);
            }
            return query; // Skip filter
          }
        }
        return query;

      case 'skip':
        if (options.logErrors) {
          console.log(`⏭️ Pulando filtro ${column} devido a erro`);
        }
        return query;

      case 'throw':
        throw error;

      default:
        return query;
    }
  }

  /**
   * Valida se um valor pode ser usado em filtro JSONB
   */
  validateJsonbValue(value: any): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    if (typeof value === 'number') {
      return !isNaN(value);
    }

    if (Array.isArray(value)) {
      return value.length > 0 && value.every(v => this.validateJsonbValue(v));
    }

    return false;
  }

  /**
   * Sanitiza array de strings para uso em JSONB
   */
  sanitizeStringArray(values: string[]): string[] {
    if (!Array.isArray(values)) {
      return [];
    }

    return values
      .filter(v => v && typeof v === 'string')
      .map(v => v.trim())
      .filter(v => v.length > 0);
  }
}

// Singleton export
export const jsonbFilters = new JsonbFiltersService();
export default jsonbFilters;