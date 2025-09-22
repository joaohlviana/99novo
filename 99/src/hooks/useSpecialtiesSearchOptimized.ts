/**
 * 🚀 USE SPECIALTIES SEARCH OPTIMIZED HOOK
 * 
 * Hook React para busca otimizada por especialidades usando:
 * - Materialized View com índice GIN
 * - Debounce para performance
 * - Cache de resultados
 * - Estados de loading e error
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import SpecialtiesSearchOptimizedService from '../services/specialties-search-optimized.service';

// Redefinir tipos aqui para evitar problemas de importação
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

interface UseSpecialtiesSearchOptions {
  enabled?: boolean;
  debounceMs?: number;
  cacheResults?: boolean;
}

interface UseSpecialtiesSearchResult {
  // Dados
  trainers: TrainerSearchResult[];
  totalCount: number;
  
  // Estados
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  
  // Métodos
  search: (filters: SearchFilters) => Promise<void>;
  clearResults: () => void;
  refreshMV: () => Promise<void>;
  
  // Performance
  lastExecutionTime: number;
  cacheHits: number;
}

// Cache simples em memória
const searchCache = new Map<string, {
  data: TrainerSearchResult[];
  count: number;
  timestamp: number;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export function useSpecialtiesSearchOptimized(
  initialFilters: SearchFilters = {},
  options: UseSpecialtiesSearchOptions = {}
): UseSpecialtiesSearchResult {
  
  const {
    enabled = true,
    debounceMs = 300,
    cacheResults = true
  } = options;

  // Estados
  const [trainers, setTrainers] = useState<TrainerSearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExecutionTime, setLastExecutionTime] = useState(0);
  const [cacheHits, setCacheHits] = useState(0);

  // Debounce dos filtros para evitar muitas requisições
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const debouncedFilters = useDebounce(filters, debounceMs);

  // Gerar chave do cache
  const getCacheKey = useCallback((searchFilters: SearchFilters): string => {
    return JSON.stringify({
      specialties: searchFilters.specialties?.sort(),
      matchMode: searchFilters.matchMode,
      limit: searchFilters.limit,
      offset: searchFilters.offset
    });
  }, []);

  // Verificar cache
  const getFromCache = useCallback((cacheKey: string) => {
    if (!cacheResults) return null;
    
    const cached = searchCache.get(cacheKey);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
    if (isExpired) {
      searchCache.delete(cacheKey);
      return null;
    }
    
    return cached;
  }, [cacheResults]);

  // Salvar no cache
  const saveToCache = useCallback((
    cacheKey: string,
    data: TrainerSearchResult[],
    count: number
  ) => {
    if (!cacheResults) return;
    
    searchCache.set(cacheKey, {
      data,
      count,
      timestamp: Date.now()
    });
  }, [cacheResults]);

  // Função de busca principal
  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    if (!enabled) return;

    const cacheKey = getCacheKey(searchFilters);
    
    // Verificar cache primeiro
    const cached = getFromCache(cacheKey);
    if (cached) {
      setTrainers(cached.data);
      setTotalCount(cached.count);
      setCacheHits(prev => prev + 1);
      setError(null);
      console.log('✅ Resultado do cache usado');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const startTime = performance.now();
      
      const result = await SpecialtiesSearchOptimizedService.searchTrainersBySpecialties(searchFilters);
      
      const endTime = performance.now();
      setLastExecutionTime(endTime - startTime);

      if (result.error) {
        setError(result.error);
        setTrainers([]);
        setTotalCount(0);
      } else {
        setTrainers(result.data);
        setTotalCount(result.count);
        
        // Salvar no cache
        saveToCache(cacheKey, result.data, result.count);
        
        console.log(`✅ Busca concluída: ${result.data.length} resultados em ${(endTime - startTime).toFixed(2)}ms`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setTrainers([]);
      setTotalCount(0);
      console.error('🚨 Erro na busca:', err);
    } finally {
      setIsSearching(false);
    }
  }, [enabled, getCacheKey, getFromCache, saveToCache]);

  // Método público de busca
  const search = useCallback(async (newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  // Limpar resultados
  const clearResults = useCallback(() => {
    setTrainers([]);
    setTotalCount(0);
    setError(null);
    setFilters({});
  }, []);

  // Atualizar Materialized View
  const refreshMV = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await SpecialtiesSearchOptimizedService.refreshMaterializedView();
      if (result.error) {
        setError(result.error);
      } else {
        // Limpar cache após refresh
        searchCache.clear();
        console.log('✅ Materialized View atualizada');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Executar busca quando filtros mudam (com debounce)
  useEffect(() => {
    if (!enabled) return;
    
    // Se não há filtros significativos, não buscar
    const hasFilters = debouncedFilters.specialties && debouncedFilters.specialties.length > 0;
    
    if (hasFilters || Object.keys(debouncedFilters).length > 0) {
      performSearch(debouncedFilters);
    }
  }, [debouncedFilters, enabled, performSearch]);

  // Busca inicial se habilitada
  useEffect(() => {
    if (enabled && Object.keys(initialFilters).length > 0) {
      setIsLoading(true);
      performSearch(initialFilters).finally(() => setIsLoading(false));
    }
  }, [enabled, initialFilters, performSearch]);

  // Memoizar resultado para evitar re-renders desnecessários
  const result = useMemo((): UseSpecialtiesSearchResult => ({
    trainers,
    totalCount,
    isLoading,
    isSearching,
    error,
    search,
    clearResults,
    refreshMV,
    lastExecutionTime,
    cacheHits
  }), [
    trainers,
    totalCount,
    isLoading,
    isSearching,
    error,
    search,
    clearResults,
    refreshMV,
    lastExecutionTime,
    cacheHits
  ]);

  return result;
}

// Hook para sugestões de especialidades
export function useSpecialtiesSuggestions(query: string, limit: number = 10) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    SpecialtiesSearchOptimizedService.suggestSpecialties(debouncedQuery, limit)
      .then(result => {
        if (result.error) {
          setError(result.error);
          setSuggestions([]);
        } else {
          setSuggestions(result.data);
        }
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : String(err));
        setSuggestions([]);
      })
      .finally(() => setIsLoading(false));

  }, [debouncedQuery, limit]);

  return {
    suggestions,
    isLoading,
    error
  };
}

// Hook para estatísticas de especialidades
export function useSpecialtiesStats() {
  const [stats, setStats] = useState<Array<{ specialty: string; count: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await SpecialtiesSearchOptimizedService.getSpecialtiesStats();
      
      if (result.error) {
        setError(result.error);
        setStats([]);
      } else {
        setStats(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStats([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    isLoading,
    error,
    reload: loadStats
  };
}

export default useSpecialtiesSearchOptimized;