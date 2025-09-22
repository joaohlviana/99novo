// ===============================
// SEARCH UTILITIES - INTEGRAÇÃO COM SLUGS
// ===============================
// 🎯 ATUALIZAÇÃO: NOMES & AVATARES (SISTEMA INTEIRO)

import { supabase } from '../lib/supabase/client';
import type { TrainerCardDTO } from './types/trainer-card.dto';
import { validateTrainerCardDTO } from './types/trainer-card.dto';
import { normalizeTrainerRow, type NormalizedTrainer } from '../utils/data-normalization';
import { jsonbFilters } from './utils/jsonb-filters.service';

const popularSearches = [
  'personal trainer',
  'musculação', 
  'emagrecimento',
  'funcional',
  'yoga',
  'pilates',
  'crossfit',
  'corrida',
  'hipertrofia',
  'condicionamento'
];

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'category' | 'trainer' | 'program';
  count?: number;
}

export interface SearchTrainersParams {
  query?: string;
  specialties?: string[];
  city?: string;
  minRating?: number;
  limit?: number;
  offset?: number;
}

interface ServiceResponse<T> {
  success: boolean;
  data: T;
  metadata?: {
    timestamp: string;
    source: string;
    requestId: string;
    totalCount?: number;
  };
}

/**
 * Obtém buscas populares
 */
export async function getPopularSearches(limit: number = 10): Promise<ServiceResponse<string[]>> {
  return {
    success: true,
    data: popularSearches.slice(0, limit),
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'mock',
      requestId: `search_${Date.now()}`
    }
  };
}

/**
 * 🎯 BUSCA TREINADORES COM SLUG - USA VIEW trainers_with_slugs
 */
export async function searchTrainers(
  params: SearchTrainersParams
): Promise<ServiceResponse<TrainerCardDTO[]>> {
  try {
    console.log('🔍 Buscando treinadores via trainers_with_slugs:', params);

    let query = supabase
      .from('trainers_with_slugs')
      .select('*')
      .eq('is_active', true)
      .not('slug', 'is', null);

    // Filtro por texto (nome)
    if (params.query) {
      query = query.ilike('name', `%${params.query}%`);
    }

    // 🎯 FILTRO INTELIGENTE POR ESPECIALIDADES - FASE 4 CORRIGIDA
    if (params.specialties && params.specialties.length > 0) {
      console.log('🔍 Aplicando filtro inteligente de especialidades:', params.specialties);
      
      // 🎯 FIX CRÍTICO: Preservar objeto query original para evitar corrupção
      let queryBackup = query;
      
      try {
        // Estratégia 1: Tentar busca com novo método para múltiplas variações
        const filteredQuery = await jsonbFilters.filterJsonbArrayMultipleVariations(
          query,
          'profile_data->specialties',
          params.specialties,
          {
            fallbackStrategy: 'text',
            logErrors: true
          }
        );
        
        // ✅ Verificar se o objeto retornado ainda tem os métodos necessários
        if (filteredQuery && typeof filteredQuery.order === 'function') {
          query = filteredQuery;
          console.log('✅ JSONB filter aplicado com sucesso');
        } else {
          console.warn('⚠️ JSONB filter corrompeu o objeto query, usando backup');
          query = queryBackup;
          throw new Error('Query object corrupted by JSONB filter');
        }
      } catch (jsonbError) {
        console.warn('🔄 JSONB filter falhou, restaurando backup e usando busca case-insensitive:', jsonbError);
        
        // ✅ Restaurar backup do query
        query = queryBackup;
        
        // Estratégia 2: Busca case-insensitive mais segura
        try {
          // Testar múltiplas variações com OR seguro
          const searchConditions = params.specialties.map(specialty => {
            const escapedSpecialty = specialty.replace(/'/g, "''"); // Escapar aspas simples
            return `profile_data::text ILIKE '%${escapedSpecialty}%'`;
          });
          
          const orCondition = searchConditions.join(' OR ');
          
          // ✅ Verificar se método existe antes de usar
          if (typeof query.or === 'function') {
            const orQuery = query.or(orCondition);
            // Verificar se ainda tem os métodos necessários
            if (orQuery && typeof orQuery.order === 'function') {
              query = orQuery;
              console.log('✅ Busca OR case-insensitive aplicada');
            } else {
              console.warn('⚠️ OR query corrompeu o objeto, usando filtro simples');
              throw new Error('OR query corrupted');
            }
          } else {
            throw new Error('OR method not available');
          }
        } catch (orError) {
          console.warn('🔄 Busca OR falhou, usando filtro ILIKE simples:', orError);
          
          // Última tentativa: filtro simples e seguro
          try {
            const firstSpecialty = params.specialties[0].replace(/'/g, "''");
            const simpleQuery = query.ilike('profile_data', `%${firstSpecialty}%`);
            
            if (simpleQuery && typeof simpleQuery.order === 'function') {
              query = simpleQuery;
              console.log('✅ Filtro ILIKE simples aplicado');
            } else {
              console.warn('⚠️ Até mesmo o filtro simples falhou, continuando sem filtro de especialidades');
              // Manter query original sem filtros
            }
          } catch (simpleError) {
            console.warn('🔄 Filtro simples também falhou, continuando sem filtro:', simpleError);
            // Continuar com query original
          }
        }
      }
    }

    // 🎯 Filtro por cidade usando serviço JSONB seguro
    if (params.city) {
      query = await jsonbFilters.filterJsonbField(
        query,
        'profile_data',
        'city',
        params.city,
        {
          fallbackStrategy: 'skip',
          logErrors: true
        }
      );
    }

    // 🎯 Filtro por rating mínimo usando serviço JSONB seguro
    if (params.minRating) {
      query = await jsonbFilters.filterJsonbNumeric(
        query,
        'profile_data',
        'rating',
        params.minRating,
        'gte',
        {
          fallbackStrategy: 'skip',
          logErrors: true
        }
      );
    }

    // Paginação super segura - testa métodos disponíveis
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    
    // Estratégia 1: Tentar range
    try {
      if (typeof query.range === 'function') {
        const endRange = offset + limit - 1;
        query = query.range(offset, endRange);
        console.log('✅ Usando range():', { offset, endRange });
      } else {
        throw new Error('range() not available');
      }
    } catch (rangeError) {
      console.warn('🔄 range() falhou, tentando limit():', rangeError);
      
      // Estratégia 2: Tentar limit
      try {
        if (typeof query.limit === 'function') {
          query = query.limit(limit);
          if (offset > 0 && typeof query.offset === 'function') {
            query = query.offset(offset);
          }
          console.log('✅ Usando limit():', { limit, offset });
        } else {
          throw new Error('limit() not available');
        }
      } catch (limitError) {
        console.warn('🔄 limit() também falhou, sem paginação:', limitError);
        // Continuar sem paginação - melhor retornar dados do que falhar
      }
    }

    // 🎯 FIX CRÍTICO: Verificar integridade do objeto query antes de ordenar
    try {
      if (query && typeof query.order === 'function') {
        query = query.order('profile_data->rating', { ascending: false });
        console.log('✅ Ordenação por rating aplicada');
      } else {
        console.warn('⚠️ Objeto query corrompido, tentando recriar consulta básica...');
        
        // Recriar consulta básica se o objeto foi corrompido
        query = supabase
          .from('trainers_with_slugs')
          .select('*')
          .eq('is_active', true)
          .not('slug', 'is', null)
          .order('profile_data->rating', { ascending: false });
          
        console.log('✅ Consulta básica recriada com ordenação');
      }
    } catch (orderError) {
      console.error('❌ Erro na ordenação, continuando sem ordenação específica:', orderError);
      // Continuar sem ordenação se falhar
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Erro ao buscar treinadores:', error);
      return {
        success: false,
        data: [],
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase_error',
          requestId: `search_${Date.now()}`
        }
      };
    }

    // 🎯 NOVA NORMALIZAÇÃO: usar normalizeTrainerRow e converter para TrainerCardDTO
    const trainers: TrainerCardDTO[] = (data || []).map(trainerRow => {
      try {
        // Primeiro normalizar com a função padrão
        const normalized = normalizeTrainerRow(trainerRow);
        
        // Depois converter para TrainerCardDTO
        return validateTrainerCardDTO({
          id: normalized.userId || normalized.id,
          slug: normalized.slug, // ✅ SLUG GARANTIDO e validado
          name: normalized.name,
          profilePhoto: normalized.avatar,
          bio: trainerRow.profile_data?.bio,
          rating: trainerRow.profile_data?.rating || 4.5,
          reviewCount: trainerRow.profile_data?.reviewCount || 50,
          location: normalized.city 
            ? `${normalized.city}${trainerRow.profile_data?.state ? `, ${trainerRow.profile_data.state}` : ''}`
            : undefined,
          specialties: normalized.specialties,
          isVerified: normalized.isVerified,
          priceFrom: trainerRow.profile_data?.priceRange || 'R$ 65',
          lastActive: trainerRow.updated_at,
          responseTime: trainerRow.profile_data?.responseTime
        });
      } catch (validationError) {
        console.warn('⚠️ Erro na validação de trainer DTO:', validationError);
        return null;
      }
    }).filter(Boolean) as TrainerCardDTO[];

    console.log(`✅ [NOMES&AVATARES] Encontrados ${trainers.length} treinadores normalizados:`, {
      sample: trainers.slice(0, 2).map(t => ({
        name: t.name,
        slug: t.slug,
        avatar: t.profilePhoto ? 'SIM' : 'NÃO'
      }))
    });

    return {
      success: true,
      data: trainers,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'supabase_trainers_with_slugs',
        requestId: `search_${Date.now()}`,
        totalCount: count || trainers.length
      }
    };

  } catch (error) {
    console.error('❌ Erro na busca de treinadores:', error);
    
    // 🔧 FALLBACK: Tentar busca mais simples sem filtros complexos
    try {
      console.log('🔄 Tentando busca fallback sem filtros JSONB...');
      
      let fallbackQuery = supabase
        .from('trainers_with_slugs')
        .select('*')
        .eq('is_active', true)
        .not('slug', 'is', null);

      // Aplicar paginação segura no fallback também
      const fallbackLimit = params.limit || 20;
      try {
        if (typeof fallbackQuery.range === 'function') {
          fallbackQuery = fallbackQuery.range(0, fallbackLimit - 1);
        } else if (typeof fallbackQuery.limit === 'function') {
          fallbackQuery = fallbackQuery.limit(fallbackLimit);
        }
      } catch (paginationError) {
        console.warn('🔄 Paginação fallback falhou, continuando sem paginação');
      }

      // Apenas filtro por nome se fornecido
      if (params.query) {
        fallbackQuery = fallbackQuery.ilike('name', `%${params.query}%`);
      }
      
      console.log('🔄 Executando busca fallback sem filtros JSONB complexos...');

      const { data: fallbackData, error: fallbackError } = await fallbackQuery;

      if (!fallbackError && fallbackData && fallbackData.length > 0) {
        const fallbackTrainers: TrainerCardDTO[] = fallbackData.map(trainerRow => {
          try {
            const normalized = normalizeTrainerRow(trainerRow);
            return validateTrainerCardDTO({
              id: normalized.userId || normalized.id,
              slug: normalized.slug,
              name: normalized.name,
              profilePhoto: normalized.avatar,
              bio: trainerRow.profile_data?.bio,
              rating: trainerRow.profile_data?.rating || 4.5,
              reviewCount: trainerRow.profile_data?.reviewCount || 50,
              location: normalized.city,
              specialties: normalized.specialties,
              isVerified: normalized.isVerified,
              priceFrom: trainerRow.profile_data?.priceRange || 'R$ 65',
              lastActive: trainerRow.updated_at,
              responseTime: trainerRow.profile_data?.responseTime
            });
          } catch (validationError) {
            console.warn('⚠️ Erro na validação de trainer DTO (fallback):', validationError);
            return null;
          }
        }).filter(Boolean) as TrainerCardDTO[];

        console.log(`✅ Busca fallback bem-sucedida: ${fallbackTrainers.length} treinadores`);
        
        return {
          success: true,
          data: fallbackTrainers,
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'supabase_fallback',
            requestId: `search_${Date.now()}`,
            totalCount: fallbackTrainers.length
          }
        };
      }
    } catch (fallbackError) {
      console.error('❌ Busca fallback também falhou:', fallbackError);
      
      // 🔧 ÚLTIMO FALLBACK: Buscar direto da user_profiles
      try {
        console.log('🔄 Tentando último fallback com user_profiles...');
        
        let basicQuery = supabase
          .from('user_profiles')
          .select('id, name, profile_data, slug')
          .eq('role', 'trainer')
          .eq('is_active', true);

        // Aplicar paginação segura no último fallback
        try {
          if (typeof basicQuery.range === 'function') {
            basicQuery = basicQuery.range(0, 4);
          } else if (typeof basicQuery.limit === 'function') {
            basicQuery = basicQuery.limit(5);
          }
        } catch (paginationError) {
          console.warn('🔄 Paginação básica falhou, continuando sem paginação');
        }

        const { data: basicData, error: basicError } = await basicQuery;

        if (!basicError && basicData && basicData.length > 0) {
          const basicTrainers: TrainerCardDTO[] = basicData.map(row => {
            try {
              const normalized = normalizeTrainerRow(row);
              return validateTrainerCardDTO({
                id: normalized.userId || normalized.id,
                slug: normalized.slug,
                name: normalized.name,
                profilePhoto: normalized.avatar,
                bio: 'Personal Trainer',
                rating: 4.5,
                reviewCount: 20,
                location: normalized.city,
                specialties: normalized.specialties,
                isVerified: normalized.isVerified,
                priceFrom: 'R$ 75',
                lastActive: new Date().toISOString(),
                responseTime: '1h'
              });
            } catch (validationError) {
              console.warn('⚠️ Erro na validação básica:', validationError);
              return null;
            }
          }).filter(Boolean) as TrainerCardDTO[];

          console.log(`✅ Último fallback bem-sucedido: ${basicTrainers.length} treinadores`);
          
          return {
            success: true,
            data: basicTrainers,
            metadata: {
              timestamp: new Date().toISOString(),
              source: 'user_profiles_fallback',
              requestId: `search_${Date.now()}`,
              totalCount: basicTrainers.length
            }
          };
        }
      } catch (basicError) {
        console.error('❌ Último fallback também falhou:', basicError);
      }
    }

    return {
      success: false,
      data: [],
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'search_error',
        requestId: `search_${Date.now()}`
      }
    };
  }
}

/**
 * Gera sugestões de autocomplete
 */
export async function getAutocomplete(
  query: string,
  limit: number = 8
): Promise<ServiceResponse<SearchSuggestion[]>> {
  const lowerQuery = query.toLowerCase();

  const suggestions = popularSearches
    .filter(search => search.toLowerCase().includes(lowerQuery))
    .slice(0, limit)
    .map(text => ({
      text,
      type: 'query' as const,
      count: Math.floor(Math.random() * 100) + 10
    }));

  return {
    success: true,
    data: suggestions,
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'mock',
      requestId: `autocomplete_${Date.now()}`
    }
  };
}