/**
 * 🚀 HOOK UNIFICADO OTIMIZADO - PÓS AUDITORIA
 * 
 * Hook que aproveita todas as otimizações implementadas:
 * - Queries sem N+1
 * - Índices JSONB otimizados
 * - Cache inteligente
 * - Performance máxima
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { 
  unifiedProfileOptimizedService,
  type UnifiedProfile,
  type UserRole,
  type TrainerWithStats,
  type ClientWithCompatibility,
  type CreateProfileInput,
  type UpdateProfileInput,
  type TrainerSearchFilters
} from '../services/unified-profile-optimized.service';
import { toast } from 'sonner@2.0.3';

// ============================================
// TIPOS DO HOOK
// ============================================

interface UseUnifiedProfileOptimizedReturn {
  // Estado dos dados
  profiles: Record<UserRole, UnifiedProfile | null>;
  loading: boolean;
  saving: boolean;
  error: string | null;

  // Ações otimizadas
  getProfile: (role: UserRole) => UnifiedProfile | null;
  saveProfile: (role: UserRole, data: Partial<Record<string, any>>) => Promise<void>;
  updateProfileData: (role: UserRole, data: Record<string, any>) => void;
  refresh: () => Promise<void>;

  // Status
  hasProfile: (role: UserRole) => boolean;
  isComplete: (role: UserRole) => boolean;
  getCompletionPercentage: (role: UserRole) => number;

  // Estatísticas
  stats: {
    client: { total: number; active: number; completionAvg: number; } | null;
    trainer: { total: number; active: number; completionAvg: number; } | null;
  };
}

interface UseTrainerSearchReturn {
  trainers: TrainerWithStats[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  searchTrainers: (filters: TrainerSearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

interface UseClientCompatibilityReturn {
  compatibleClients: ClientWithCompatibility[];
  loading: boolean;
  error: string | null;
  findCompatibleClients: (specialties: string[], city?: string) => Promise<void>;
}

// ============================================
// HOOK PRINCIPAL OTIMIZADO
// ============================================

export function useUnifiedProfileOptimized(): UseUnifiedProfileOptimizedReturn {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // Estados locais
  const [profiles, setProfiles] = useState<Record<UserRole, UnifiedProfile | null>>({
    client: null,
    trainer: null
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // QUERY OTIMIZADA PARA PERFIS DO USUÁRIO
  // ============================================

  const {
    data: userProfiles,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['user-profiles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await unifiedProfileOptimizedService.getAllByUserId(user.id);
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    cacheTime: 10 * 60 * 1000, // Manter em cache por 10 minutos
    retry: (failureCount, error) => {
      // Não retry em erros de auth
      if (error.message?.includes('auth') || error.message?.includes('permission')) {
        return false;
      }
      return failureCount < 2;
    },
    onSuccess: (data) => {
      console.log('✅ Perfis carregados via useQuery:', data.length);
    },
    onError: (err) => {
      console.error('❌ Erro ao carregar perfis:', err);
      setError(err.message || 'Erro ao carregar perfis');
    }
  });

  // ============================================
  // QUERY PARA ESTATÍSTICAS (SEPARADA PARA PERFORMANCE)
  // ============================================

  const { data: stats } = useQuery({
    queryKey: ['profile-stats'],
    queryFn: async () => {
      const [clientStats, trainerStats] = await Promise.all([
        unifiedProfileOptimizedService.getStatsByRole('client'),
        unifiedProfileOptimizedService.getStatsByRole('trainer')
      ]);
      return { client: clientStats, trainer: trainerStats };
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 10 * 60 * 1000, // Cache por 10 minutos (stats mudam menos)
    cacheTime: 15 * 60 * 1000,
    retry: 1 // Stats são menos críticas
  });

  // ============================================
  // MUTATION OTIMIZADA PARA SALVAR PERFIL
  // ============================================

  const saveMutation = useMutation({
    mutationFn: async ({ role, data }: { role: UserRole; data: Partial<Record<string, any>> }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const existingProfile = profiles[role];
      
      const upsertInput: CreateProfileInput & UpdateProfileInput = {
        user_id: user.id,
        role,
        name: existingProfile?.name || user.name,
        email: existingProfile?.email || user.email,
        profile_data: {
          ...existingProfile?.profile_data,
          ...data,
          lastUpdated: new Date().toISOString()
        }
      };

      return await unifiedProfileOptimizedService.upsert(upsertInput);
    },
    onMutate: async ({ role, data }) => {
      // Otimistic update para UX instantânea
      await queryClient.cancelQueries(['user-profiles', user?.id]);
      
      const existingProfile = profiles[role];
      if (existingProfile) {
        const optimisticProfile = {
          ...existingProfile,
          profile_data: {
            ...existingProfile.profile_data,
            ...data,
            lastUpdated: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        };
        
        setProfiles(prev => ({
          ...prev,
          [role]: optimisticProfile
        }));
      }
    },
    onSuccess: (savedProfile, { role }) => {
      // Atualizar cache com dados reais
      setProfiles(prev => ({
        ...prev,
        [role]: savedProfile
      }));

      // Invalidar queries relacionadas
      queryClient.invalidateQueries(['user-profiles', user?.id]);
      queryClient.invalidateQueries(['profile-stats']);
      
      const roleLabel = role === 'trainer' ? 'treinador' : 'cliente';
      toast.success(`Perfil de ${roleLabel} salvo com sucesso!`);
      
      console.log(`✅ Perfil ${role} salvo com sucesso via mutation:`, savedProfile.id);
    },
    onError: (error, { role }) => {
      // Reverter optimistic update em caso de erro
      refetch();
      setError(error.message || 'Erro ao salvar perfil');
      toast.error('Erro ao salvar perfil');
      console.error(`❌ Erro ao salvar perfil ${role}:`, error);
    }
  });

  // ============================================
  // EFEITOS E SINCRONIZAÇÃO
  // ============================================

  // Sincronizar dados quando chegam da query
  useEffect(() => {
    if (userProfiles) {
      const profilesByRole: Record<UserRole, UnifiedProfile | null> = {
        client: null,
        trainer: null
      };

      userProfiles.forEach(profile => {
        profilesByRole[profile.role] = profile;
      });

      setProfiles(profilesByRole);
      
      console.log('🔄 Perfis sincronizados:', {
        client: !!profilesByRole.client,
        trainer: !!profilesByRole.trainer
      });
    }
  }, [userProfiles]);

  // Sincronizar erros
  useEffect(() => {
    if (queryError) {
      setError(queryError.message || 'Erro ao carregar perfis');
    } else {
      setError(null);
    }
  }, [queryError]);

  // ============================================
  // AÇÕES DO HOOK
  // ============================================

  const saveProfile = useCallback(async (role: UserRole, data: Partial<Record<string, any>>) => {
    setSaving(true);
    setError(null);
    
    try {
      await saveMutation.mutateAsync({ role, data });
    } catch (err) {
      // Erro já tratado na mutation
      throw err;
    } finally {
      setSaving(false);
    }
  }, [saveMutation]);

  const updateProfileData = useCallback((role: UserRole, data: Record<string, any>) => {
    setProfiles(prev => {
      const existingProfile = prev[role];
      if (!existingProfile) return prev;

      return {
        ...prev,
        [role]: {
          ...existingProfile,
          profile_data: {
            ...existingProfile.profile_data,
            ...data,
            lastUpdated: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        }
      };
    });
  }, []);

  const refresh = useCallback(async () => {
    console.log('🔄 Fazendo refresh dos perfis');
    await refetch();
  }, [refetch]);

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================

  const getProfile = useCallback((role: UserRole) => profiles[role], [profiles]);
  const hasProfile = useCallback((role: UserRole) => !!profiles[role], [profiles]);
  
  const isComplete = useCallback((role: UserRole) => {
    const profile = profiles[role];
    if (!profile) return false;
    
    const completionPercentage = profile.profile_data?.completionPercentage || 0;
    return completionPercentage >= 75; // Considerar completo se >= 75%
  }, [profiles]);

  const getCompletionPercentage = useCallback((role: UserRole) => {
    const profile = profiles[role];
    return profile?.profile_data?.completionPercentage || 0;
  }, [profiles]);

  // ============================================
  // RETORNO DO HOOK
  // ============================================

  return {
    // Estado dos dados
    profiles,
    loading,
    saving: saving || saveMutation.isLoading,
    error,

    // Ações
    getProfile,
    saveProfile,
    updateProfileData,
    refresh,

    // Status
    hasProfile,
    isComplete,
    getCompletionPercentage,

    // Estatísticas
    stats: stats || { client: null, trainer: null }
  };
}

// ============================================
// HOOK PARA BUSCA OTIMIZADA DE TREINADORES
// ============================================

export function useTrainerSearchOptimized(): UseTrainerSearchReturn {
  const [trainers, setTrainers] = useState<TrainerWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<TrainerSearchFilters>({});
  const [offset, setOffset] = useState(0);

  const searchTrainers = useCallback(async (filters: TrainerSearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);
      setOffset(0);

      console.log('🔍 Buscando treinadores otimizado:', filters);

      const results = await unifiedProfileOptimizedService.searchTrainersWithStats({
        ...filters,
        offset: 0
      });

      setTrainers(results);
      setHasMore(results.length === (filters.limit || 20));
      setOffset(results.length);

      console.log(`✅ Encontrados ${results.length} treinadores (primeira página)`);

    } catch (err) {
      console.error('❌ Erro na busca de treinadores:', err);
      setError(err.message || 'Erro na busca de treinadores');
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);

      const results = await unifiedProfileOptimizedService.searchTrainersWithStats({
        ...currentFilters,
        offset
      });

      setTrainers(prev => [...prev, ...results]);
      setHasMore(results.length === (currentFilters.limit || 20));
      setOffset(prev => prev + results.length);

      console.log(`✅ Carregados mais ${results.length} treinadores`);

    } catch (err) {
      console.error('❌ Erro ao carregar mais treinadores:', err);
      setError(err.message || 'Erro ao carregar mais treinadores');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, currentFilters, offset]);

  const reset = useCallback(() => {
    setTrainers([]);
    setError(null);
    setHasMore(true);
    setOffset(0);
    setCurrentFilters({});
  }, []);

  return {
    trainers,
    loading,
    error,
    hasMore,
    searchTrainers,
    loadMore,
    reset
  };
}

// ============================================
// HOOK PARA COMPATIBILIDADE DE CLIENTES
// ============================================

export function useClientCompatibilityOptimized(): UseClientCompatibilityReturn {
  const [compatibleClients, setCompatibleClients] = useState<ClientWithCompatibility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findCompatibleClients = useCallback(async (specialties: string[], city?: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎯 Buscando clientes compatíveis:', { specialties, city });

      const results = await unifiedProfileOptimizedService.findCompatibleClients(
        specialties,
        city
      );

      setCompatibleClients(results);

      console.log(`✅ Encontrados ${results.length} clientes compatíveis`);

    } catch (err) {
      console.error('❌ Erro na busca de clientes compatíveis:', err);
      setError(err.message || 'Erro na busca de clientes compatíveis');
      setCompatibleClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    compatibleClients,
    loading,
    error,
    findCompatibleClients
  };
}

// ============================================
// EXPORTS
// ============================================

export default useUnifiedProfileOptimized;