/**
 * 🚀 HOOK UNIFICADO DA PLATAFORMA
 * 
 * Hook principal que aproveita toda a estrutura SQL otimizada.
 * Performance máxima com cache inteligente e eliminação de N+1 queries.
 * 
 * Ideal para:
 * - ProgramCard, ModernProgramCard
 * - TrainerCard, TrainerGridCard  
 * - CatalogPage, TrainersCatalog
 * - Sistema de busca unificado
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  unifiedPlatformService,
  type UnifiedProgramCard,
  type UnifiedTrainerCard,
  type ProgramDetailsComplete,
  type SearchFilters
} from '../services/unified-platform.service';

// ============================================
// TIPOS DO HOOK
// ============================================

interface UseProgramCardsReturn {
  programs: UnifiedProgramCard[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  searchPrograms: (filters: SearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  resetSearch: () => void;
}

interface UseTrainerCardsReturn {
  trainers: UnifiedTrainerCard[];
  loading: boolean;
  error: string | null;
  searchTrainers: (filters: { specialties?: string[]; cities?: string[] }) => Promise<void>;
  resetSearch: () => void;
}

interface UseProgramDetailsReturn {
  program: ProgramDetailsComplete | null;
  relatedPrograms: UnifiedProgramCard[];
  loading: boolean;
  error: string | null;
}

interface UseUnifiedSearchReturn {
  results: {
    programs: UnifiedProgramCard[];
    trainers: UnifiedTrainerCard[];
  };
  loading: boolean;
  error: string | null;
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  clearResults: () => void;
}

// ============================================
// HOOK PARA CARDS DE PROGRAMAS
// ============================================

function useProgramCards(initialFilters: SearchFilters = {}): UseProgramCardsReturn {
  const [programs, setPrograms] = useState<UnifiedProgramCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(initialFilters);
  const [offset, setOffset] = useState(0);

  // Executar busca inicial se houver filtros
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      searchPrograms(initialFilters);
    }
  }, []); // Executar apenas uma vez na inicialização

  const searchPrograms = useCallback(async (filters: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);
      setOffset(0);

      console.log('🔍 Buscando programas com filtros:', filters);

      const result = await unifiedPlatformService.getProgramCards({
        ...filters,
        offset: 0
      });

      setPrograms(result.programs);
      setHasMore(result.hasMore);
      setOffset(result.programs.length);

      console.log(`✅ Encontrados ${result.programs.length} programas`);

    } catch (err) {
      console.error('❌ Erro na busca de programas:', err);
      setError(err.message || 'Erro na busca de programas');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);

      const result = await unifiedPlatformService.getProgramCards({
        ...currentFilters,
        offset
      });

      setPrograms(prev => [...prev, ...result.programs]);
      setHasMore(result.hasMore);
      setOffset(prev => prev + result.programs.length);

      console.log(`✅ Carregados mais ${result.programs.length} programas`);

    } catch (err) {
      console.error('❌ Erro ao carregar mais programas:', err);
      setError(err.message || 'Erro ao carregar mais programas');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, currentFilters, offset]);

  const resetSearch = useCallback(() => {
    setPrograms([]);
    setError(null);
    setHasMore(true);
    setOffset(0);
    setCurrentFilters({});
  }, []);

  return {
    programs,
    loading,
    error,
    hasMore,
    searchPrograms,
    loadMore,
    resetSearch
  };
}

// ============================================
// HOOK PARA CARDS DE TREINADORES
// ============================================

function useTrainerCards(initialFilters: { specialties?: string[]; cities?: string[]; limit?: number } = {}): UseTrainerCardsReturn {
  const [trainers, setTrainers] = useState<UnifiedTrainerCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Executar busca inicial se houver filtros
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      searchTrainers(initialFilters);
    }
  }, []); // Executar apenas uma vez na inicialização

  const searchTrainers = useCallback(async (filters: { specialties?: string[]; cities?: string[] }) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Buscando treinadores:', filters);

      const result = await unifiedPlatformService.getTrainerCards(filters);

      setTrainers(result);

      console.log(`✅ Encontrados ${result.length} treinadores`);

    } catch (err) {
      console.error('❌ Erro na busca de treinadores:', err);
      setError(err.message || 'Erro na busca de treinadores');
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetSearch = useCallback(() => {
    setTrainers([]);
    setError(null);
  }, []);

  return {
    trainers,
    loading,
    error,
    searchTrainers,
    resetSearch
  };
}

// ============================================
// HOOK PARA DETALHES DO PROGRAMA
// ============================================

function useProgramDetails(programId: string): UseProgramDetailsReturn {
  const {
    data: program,
    isLoading: programLoading,
    error: programError
  } = useQuery({
    queryKey: ['program-details', programId],
    queryFn: () => unifiedPlatformService.getProgramDetails(programId),
    enabled: !!programId,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    cacheTime: 10 * 60 * 1000,
    retry: 2
  });

  const {
    data: relatedPrograms = [],
    isLoading: relatedLoading
  } = useQuery({
    queryKey: ['related-programs', programId],
    queryFn: () => unifiedPlatformService.getRelatedPrograms(programId),
    enabled: !!programId && !!program,
    staleTime: 10 * 60 * 1000, // Cache por mais tempo (relacionados mudam menos)
    retry: 1
  });

  const loading = programLoading || relatedLoading;
  const error = programError?.message || null;

  return {
    program: program || null,
    relatedPrograms,
    loading,
    error
  };
}

// ============================================
// HOOK PARA PROGRAMAS EM DESTAQUE
// ============================================

function useFeaturedPrograms(limit = 8) {
  return useQuery({
    queryKey: ['featured-programs', limit],
    queryFn: () => unifiedPlatformService.getFeaturedPrograms(limit),
    staleTime: 15 * 60 * 1000, // Cache por 15 minutos (featured mudam menos)
    cacheTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log(`✅ Carregados ${data.length} programas em destaque`);
    },
    onError: (error) => {
      console.error('❌ Erro ao carregar programas em destaque:', error);
    }
  });
}

// ============================================
// HOOK PARA BUSCA UNIFICADA
// ============================================

function useUnifiedSearch(): UseUnifiedSearchReturn {
  const [results, setResults] = useState<{
    programs: UnifiedProgramCard[];
    trainers: UnifiedTrainerCard[];
  }>({
    programs: [],
    trainers: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, filters: SearchFilters = {}) => {
    if (!query.trim()) {
      setResults({ programs: [], trainers: [] });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Busca unificada:', { query, filters });

      const result = await unifiedPlatformService.unifiedSearch(query, filters);
      setResults(result);

      console.log(`✅ Encontrados ${result.programs.length} programas e ${result.trainers.length} treinadores`);

    } catch (err) {
      console.error('❌ Erro na busca unificada:', err);
      setError(err.message || 'Erro na busca');
      setResults({ programs: [], trainers: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults({ programs: [], trainers: [] });
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults
  };
}

// ============================================
// HOOK PARA ESTATÍSTICAS DA PLATAFORMA
// ============================================

function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => unifiedPlatformService.getPlatformStats(),
    staleTime: 30 * 60 * 1000, // Cache por 30 minutos
    cacheTime: 60 * 60 * 1000, // 1 hora
    retry: 1,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log('✅ Estatísticas da plataforma carregadas:', data);
    }
  });
}

// ============================================
// HOOK PARA CLIENTES COMPATÍVEIS (Dashboard Trainer)
// ============================================

function useCompatibleClients(
  trainerSpecialties: string[],
  trainerCity?: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['compatible-clients', trainerSpecialties, trainerCity],
    queryFn: () => unifiedPlatformService.getCompatibleClients(
      trainerSpecialties,
      trainerCity
    ),
    enabled: enabled && trainerSpecialties.length > 0,
    staleTime: 10 * 60 * 1000,
    retry: 1,
    onSuccess: (data) => {
      console.log(`✅ Encontrados ${data.length} clientes compatíveis`);
    }
  });
}

// ============================================
// HOOK COMBINADO PARA PÁGINAS PRINCIPAIS
// ============================================

/**
 * Hook otimizado para páginas que precisam de múltiplos dados
 * Ex: HomePage, CatalogPage
 */
function useMainPageData() {
  const featuredProgramsQuery = useFeaturedPrograms(8);
  const platformStatsQuery = usePlatformStats();

  // Query paralela para treinadores em destaque
  const featuredTrainersQuery = useQuery({
    queryKey: ['featured-trainers'],
    queryFn: () => unifiedPlatformService.getTrainerCards({ limit: 6 }),
    staleTime: 15 * 60 * 1000
  });

  const loading = featuredProgramsQuery.isLoading || 
                 platformStatsQuery.isLoading || 
                 featuredTrainersQuery.isLoading;

  const error = featuredProgramsQuery.error?.message ||
               platformStatsQuery.error?.message ||
               featuredTrainersQuery.error?.message ||
               null;

  return {
    featuredPrograms: featuredProgramsQuery.data || [],
    featuredTrainers: featuredTrainersQuery.data || [],
    platformStats: platformStatsQuery.data || {
      totalPrograms: 0,
      totalTrainers: 0,
      totalClients: 0,
      avgRating: 0
    },
    loading,
    error,
    refetchAll: () => {
      featuredProgramsQuery.refetch();
      platformStatsQuery.refetch();
      featuredTrainersQuery.refetch();
    }
  };
}

// ============================================
// EXPORTS PRINCIPAIS
// ============================================

export {
  useProgramCards,
  useTrainerCards,
  useProgramDetails,
  useFeaturedPrograms,
  useUnifiedSearch,
  usePlatformStats,
  useCompatibleClients,
  useMainPageData
};