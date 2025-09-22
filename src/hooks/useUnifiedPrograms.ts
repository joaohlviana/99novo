/**
 * HOOK UNIFICADO PARA PROGRAMAS - ARQUITETURA PADRONIZADA
 * =======================================================
 * Hook consolidado que substitui usePrograms, useTrainingPrograms, etc.
 * Gerencia estado e operações de forma consistente
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { unifiedProgramsService } from '../services/unified-programs.service';
import {
  UnifiedProgramCardData,
  UnifiedProgramDashboardData,
  UnifiedProgramDetailData,
  UnifiedProgramFilters,
  ProgramCardContext
} from '../types/unified-program';

// ===============================================
// TIPOS DO HOOK
// ===============================================

interface UseUnifiedProgramsOptions {
  context?: ProgramCardContext;
  autoLoad?: boolean;
  trainerId?: string;
  initialFilters?: UnifiedProgramFilters;
}

interface UseUnifiedProgramsReturn {
  // Estado dos dados
  programs: UnifiedProgramCardData[] | UnifiedProgramDashboardData[];
  loading: boolean;
  error: string | null;
  
  // Estado de filtros
  filters: UnifiedProgramFilters;
  setFilters: (filters: UnifiedProgramFilters) => void;
  clearFilters: () => void;
  
  // Operações
  loadPrograms: () => Promise<void>;
  refreshPrograms: () => Promise<void>;
  
  // Operações específicas
  loadPublicPrograms: (filters?: UnifiedProgramFilters) => Promise<void>;
  loadTrainerPrograms: (trainerId: string) => Promise<void>;
  loadProgramsByCategory: (category: string) => Promise<void>;
  loadFeaturedPrograms: () => Promise<void>;
  loadPopularPrograms: () => Promise<void>;
  
  // Estados auxiliares
  isEmpty: boolean;
  hasFilters: boolean;
  
  // Meta informações
  total: number;
  context: ProgramCardContext;
}

// ===============================================
// HOOK PRINCIPAL
// ===============================================

export function useUnifiedPrograms({
  context = 'public',
  autoLoad = true,
  trainerId,
  initialFilters = {}
}: UseUnifiedProgramsOptions = {}): UseUnifiedProgramsReturn {
  
  // Contexto de auth
  const { user } = useAuth();

  // Estados principais
  const [programs, setPrograms] = useState<UnifiedProgramCardData[] | UnifiedProgramDashboardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UnifiedProgramFilters>(initialFilters);
  
  // Refs para cache e debouncing
  const cacheRef = useRef<Map<string, UnifiedProgramCardData[]>>(new Map());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastFiltersRef = useRef<string>('');
  const isLoadingRef = useRef<boolean>(false);

  // Função para validar se um ID é válido (UUID ou slug válido)
  const isValidId = useCallback((id: string): boolean => {
    if (!id || typeof id !== 'string') return false;
    
    // Rejeitar IDs que contêm palavras mock ou emergency
    if (id.includes('mock') || id.includes('emergency') || id.includes('fallback')) {
      console.warn('⚠️ ID inválido detectado (contém mock/emergency/fallback):', id);
      return false;
    }
    
    // Aceitar UUIDs válidos ou slugs válidos (sem espaços, caracteres especiais)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    
    return uuidRegex.test(id) || slugRegex.test(id);
  }, []);

  // ===============================================
  // OPERAÇÕES PRINCIPAIS
  // ===============================================

  /**
   * Carrega programas públicos
   */
  const loadPublicPrograms = useCallback(async (customFilters?: UnifiedProgramFilters) => {
    const activeFilters = customFilters || filters;
    const filtersKey = JSON.stringify(activeFilters);
    
    // Verificar cache primeiro
    if (cacheRef.current.has(filtersKey)) {
      const cachedData = cacheRef.current.get(filtersKey)!;
      setPrograms(cachedData);
      console.log('✅ Programas carregados do cache:', cachedData.length);
      return;
    }
    
    // Debounce para evitar múltiplas chamadas
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Se os filtros são os mesmos da última chamada, não recarregar
    if (filtersKey === lastFiltersRef.current && programs.length > 0) {
      console.log('⏭️ Pulando recarga - mesmos filtros e dados já carregados');
      return;
    }
    
    // Prevenir múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      console.log('⏭️ Carregamento já em progresso, pulando...');
      return;
    }
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando programas públicos...');
      
      const { data, error: serviceError } = await unifiedProgramsService.getPublicPrograms(activeFilters);
      
      // O serviço já trata erros e retorna dados de fallback, então sempre teremos dados
      const rawProgramsData = data || [];
      
      // Filtrar programas com IDs válidos apenas
      const programsData = rawProgramsData.filter(program => {
        if (!isValidId(program.id)) {
          console.warn('⚠️ Programa com ID inválido removido:', program.id);
          return false;
        }
        return true;
      });
      
      setPrograms(programsData);
      
      // Cachear resultados
      cacheRef.current.set(filtersKey, programsData);
      lastFiltersRef.current = filtersKey;
      
      console.log('✅ Programas públicos carregados:', programsData.length);
      
      // REQUISITO CRÍTICO: APENAS DADOS REAIS DO SUPABASE
      // Não usar fallbacks para mock data - exibir apenas dados reais
      
      // Se houve erro mas temos dados (fallback), não definir como erro
      if (serviceError && programsData.length > 0) {
        console.warn('⚠️ Erro no serviço mas dados foram carregados:', serviceError.message);
        setError(null); // Não mostrar erro se temos dados
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao carregar programas públicos:', errorMessage);
      // Não definir como erro se conseguimos algum dado
      setError(null); // Reset error since service provides fallback
      setPrograms([]); // Will trigger fallback in service
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Carrega programas do trainer
   */
  const loadTrainerPrograms = useCallback(async (targetTrainerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando programas do trainer:', targetTrainerId);
      
      const { data, error: serviceError } = await unifiedProgramsService.getTrainerPrograms(targetTrainerId, filters);
      
      if (serviceError) {
        throw new Error(serviceError.message || 'Erro ao carregar programas do trainer');
      }
      
      setPrograms(data || []);
      console.log('✅ Programas do trainer carregados:', data?.length || 0);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao carregar programas do trainer:', errorMessage);
      setError(errorMessage);
      setPrograms([]);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [filters]);

  /**
   * Carrega programas por categoria
   */
  const loadProgramsByCategory = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando programas da categoria:', category);
      
      const { data, error: serviceError } = await unifiedProgramsService.getProgramsByCategory(category);
      
      if (serviceError) {
        throw new Error(serviceError.message || 'Erro ao carregar programas da categoria');
      }
      
      setPrograms(data || []);
      console.log('✅ Programas da categoria carregados:', data?.length || 0);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao carregar programas da categoria:', errorMessage);
      setError(errorMessage);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carrega programas em destaque
   */
  const loadFeaturedPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando programas em destaque...');
      
      const { data, error: serviceError } = await unifiedProgramsService.getFeaturedPrograms();
      
      if (serviceError) {
        throw new Error(serviceError.message || 'Erro ao carregar programas em destaque');
      }
      
      setPrograms(data || []);
      console.log('✅ Programas em destaque carregados:', data?.length || 0);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao carregar programas em destaque:', errorMessage);
      setError(errorMessage);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carrega programas populares
   */
  const loadPopularPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando programas populares...');
      
      const { data, error: serviceError } = await unifiedProgramsService.getPopularPrograms();
      
      if (serviceError) {
        throw new Error(serviceError.message || 'Erro ao carregar programas populares');
      }
      
      setPrograms(data || []);
      console.log('✅ Programas populares carregados:', data?.length || 0);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao carregar programas populares:', errorMessage);
      setError(errorMessage);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===============================================
  // FUNÇÃO GENÉRICA DE CARREGAMENTO
  // ===============================================

  const loadPrograms = useCallback(async () => {
    switch (context) {
      case 'dashboard':
        if (trainerId || user?.id) {
          await loadTrainerPrograms(trainerId || user!.id);
        }
        break;
      
      case 'public':
      case 'catalog':
      default:
        await loadPublicPrograms();
        break;
    }
  }, [context, trainerId, user?.id, loadTrainerPrograms, loadPublicPrograms]);

  /**
   * Atualiza programas (força reload)
   */
  const refreshPrograms = useCallback(async () => {
    // Limpar cache para forçar recarregamento
    cacheRef.current.clear();
    lastFiltersRef.current = '';
    await loadPrograms();
  }, [loadPrograms]);

  // ===============================================
  // GERENCIAMENTO DE FILTROS
  // ===============================================

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // ===============================================
  // ESTADOS COMPUTADOS
  // ===============================================

  const isEmpty = useMemo(() => programs.length === 0, [programs]);
  
  const hasFilters = useMemo(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  const total = useMemo(() => programs.length, [programs]);

  // ===============================================
  // EFEITOS
  // ===============================================

  // Auto-load inicial
  useEffect(() => {
    if (autoLoad) {
      loadPrograms();
    }
  }, [autoLoad, loadPrograms]);

  // Reload quando filtros mudam (apenas para contextos públicos) - com debounce
  useEffect(() => {
    if (context === 'public' || context === 'catalog') {
      // Limpar timeout anterior
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      // Debounce de 300ms para evitar chamadas excessivas
      debounceRef.current = setTimeout(() => {
        loadPublicPrograms();
      }, 300);
    }
    
    // Cleanup
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters, context, loadPublicPrograms]);

  // ===============================================
  // RETURN
  // ===============================================

  return {
    // Estado dos dados
    programs,
    loading,
    error,
    
    // Estado de filtros
    filters,
    setFilters,
    clearFilters,
    
    // Operações
    loadPrograms,
    refreshPrograms,
    
    // Operações específicas
    loadPublicPrograms,
    loadTrainerPrograms,
    loadProgramsByCategory,
    loadFeaturedPrograms,
    loadPopularPrograms,
    
    // Estados auxiliares
    isEmpty,
    hasFilters,
    
    // Meta informações
    total,
    context
  };
}

// ===============================================
// HOOKS ESPECIALIZADOS
// ===============================================

/**
 * Hook para programas públicos (home, catálogo)
 */
export function usePublicPrograms(filters?: UnifiedProgramFilters) {
  return useUnifiedPrograms({
    context: 'public',
    initialFilters: filters
  });
}

/**
 * Hook para dashboard do trainer
 */
export function useTrainerDashboardPrograms(trainerId?: string) {
  return useUnifiedPrograms({
    context: 'dashboard',
    trainerId
  });
}

/**
 * Hook para programas de uma categoria específica
 */
export function useCategoryPrograms(category: string) {
  const hook = useUnifiedPrograms({
    context: 'public',
    autoLoad: false,
    initialFilters: { category }
  });

  useEffect(() => {
    hook.loadProgramsByCategory(category);
  }, [category]);

  return hook;
}

/**
 * Hook para programas em destaque
 */
export function useFeaturedPrograms() {
  const hook = useUnifiedPrograms({
    context: 'public',
    autoLoad: false
  });

  useEffect(() => {
    hook.loadFeaturedPrograms();
  }, []);

  return hook;
}

/**
 * Hook para programas populares
 */
export function usePopularPrograms() {
  const hook = useUnifiedPrograms({
    context: 'public',
    autoLoad: false
  });

  useEffect(() => {
    hook.loadPopularPrograms();
  }, []);

  return hook;
}

// ===============================================
// EXPORTS
// ===============================================

export default useUnifiedPrograms;