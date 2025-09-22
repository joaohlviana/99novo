/**
 * 🔄 TANSTACK QUERY CONFIGURATION
 * 
 * Configuração centralizada do React Query para cache, invalidação
 * e gerenciamento de estados de requisição.
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Configuração do QueryClient com defaults otimizados
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache mais curto para evitar problemas
      staleTime: 30 * 1000, // 30 segundos
      
      // Cache mais agressivo para performance
      gcTime: 5 * 60 * 1000, // 5 minutos
      
      // Retry simples para evitar timeouts
      retry: 1,
      
      // Delay mais curto
      retryDelay: 1000,
      
      // Desabilitar refetch automático para evitar sobrecarga
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      
      // Timeout para queries
      networkMode: 'online',
      
      // Error handler simplificado
      throwOnError: false
    },
    mutations: {
      // Sem retry para mutations para evitar duplicação
      retry: 0,
      
      // Error handler simplificado
      onError: (error: any) => {
        console.warn('Mutation error:', error);
      }
    }
  }
});

/**
 * Query Keys Factory - Chaves padronizadas para cache
 */
export const queryKeys = {
  // Trainers
  trainers: {
    all: ['trainers'] as const,
    lists: () => [...queryKeys.trainers.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.trainers.lists(), filters] as const,
    details: () => [...queryKeys.trainers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.trainers.details(), id] as const,
    search: (query: string, filters?: Record<string, any>) => [...queryKeys.trainers.all, 'search', query, filters] as const,
    featured: () => [...queryKeys.trainers.all, 'featured'] as const,
    nearby: (coordinates: { lat: number; lng: number }, radius: number) => 
      [...queryKeys.trainers.all, 'nearby', coordinates, radius] as const,
    reviews: (trainerId: string) => [...queryKeys.trainers.detail(trainerId), 'reviews'] as const,
    stories: (trainerId: string) => [...queryKeys.trainers.detail(trainerId), 'stories'] as const,
    pricing: (trainerId: string) => [...queryKeys.trainers.detail(trainerId), 'pricing'] as const,
    stats: () => [...queryKeys.trainers.all, 'stats'] as const
  },
  
  // Programs
  programs: {
    all: ['programs'] as const,
    lists: () => [...queryKeys.programs.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.programs.lists(), filters] as const,
    details: () => [...queryKeys.programs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.programs.details(), id] as const,
    search: (query: string, filters?: Record<string, any>) => [...queryKeys.programs.all, 'search', query, filters] as const,
    featured: () => [...queryKeys.programs.all, 'featured'] as const,
    trending: () => [...queryKeys.programs.all, 'trending'] as const,
    popular: () => [...queryKeys.programs.all, 'popular'] as const,
    recommended: (userId?: string) => [...queryKeys.programs.all, 'recommended', userId] as const,
    byTrainer: (trainerId: string) => [...queryKeys.programs.all, 'trainer', trainerId] as const,
    bySport: (sportId: string) => [...queryKeys.programs.all, 'sport', sportId] as const
  },
  
  // Sports
  sports: {
    all: ['sports'] as const,
    lists: () => [...queryKeys.sports.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.sports.lists(), filters] as const,
    details: () => [...queryKeys.sports.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.sports.details(), id] as const,
    categories: () => [...queryKeys.sports.all, 'categories'] as const,
    byCategory: (category: string) => [...queryKeys.sports.all, 'category', category] as const
  },
  
  // Users
  users: {
    all: ['users'] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const
  },
  
  // Financial
  financial: {
    all: ['financial'] as const,
    revenue: (trainerId: string, period?: string) => [...queryKeys.financial.all, 'revenue', trainerId, period] as const,
    transactions: (trainerId: string, filters?: Record<string, any>) => 
      [...queryKeys.financial.all, 'transactions', trainerId, filters] as const,
    analytics: (trainerId: string, period?: string) => 
      [...queryKeys.financial.all, 'analytics', trainerId, period] as const
  },
  
  // Messages/Notifications
  messages: {
    all: ['messages'] as const,
    conversations: (userId: string) => [...queryKeys.messages.all, 'conversations', userId] as const,
    conversation: (conversationId: string) => [...queryKeys.messages.all, 'conversation', conversationId] as const
  },
  
  notifications: {
    all: ['notifications'] as const,
    list: (userId: string) => [...queryKeys.notifications.all, 'list', userId] as const,
    unread: (userId: string) => [...queryKeys.notifications.all, 'unread', userId] as const
  }
} as const;

/**
 * Invalidation helpers - Facilitam invalidação de cache
 */
export const invalidateQueries = {
  // Invalidar todos os dados de trainers
  allTrainers: () => queryClient.invalidateQueries({ queryKey: queryKeys.trainers.all }),
  
  // Invalidar dados específicos de um trainer
  trainer: (trainerId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.trainers.detail(trainerId) }),
  
  // Invalidar listas de trainers (após criar/editar)
  trainerLists: () => queryClient.invalidateQueries({ queryKey: queryKeys.trainers.lists() }),
  
  // Invalidar todos os dados de programs
  allPrograms: () => queryClient.invalidateQueries({ queryKey: queryKeys.programs.all }),
  
  // Invalidar dados específicos de um program
  program: (programId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.programs.detail(programId) }),
  
  // Invalidar listas de programs
  programLists: () => queryClient.invalidateQueries({ queryKey: queryKeys.programs.lists() }),
  
  // Invalidar dados financeiros
  financial: (trainerId: string) => queryClient.invalidateQueries({ 
    queryKey: [...queryKeys.financial.all, trainerId] 
  }),
  
  // Invalidar notificações
  notifications: (userId: string) => queryClient.invalidateQueries({ 
    queryKey: queryKeys.notifications.list(userId) 
  })
};

/**
 * Prefetch helpers - Para pré-carregar dados importantes
 */
export const prefetchQueries = {
  // Pré-carregar trainer details ao fazer hover
  trainerDetails: (trainerId: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.trainers.detail(trainerId),
      queryFn: () => import('../services/trainers.service').then(s => s.trainersService.getTrainerById(trainerId)),
      staleTime: 30 * 1000 // 30 segundos
    });
  },
  
  // Pré-carregar program details
  programDetails: (programId: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.programs.detail(programId),
      queryFn: () => import('../services/programs.service').then(s => s.programsService.getProgramById(programId)),
      staleTime: 30 * 1000
    });
  }
};

/**
 * Mutation helpers - Para facilitar operações de escrita
 */
export const mutationOptions = {
  // Criar trainer
  createTrainer: {
    onSuccess: () => {
      invalidateQueries.trainerLists();
      invalidateQueries.allTrainers();
    }
  },
  
  // Atualizar trainer
  updateTrainer: (trainerId: string) => ({
    onSuccess: () => {
      invalidateQueries.trainer(trainerId);
      invalidateQueries.trainerLists();
    }
  }),
  
  // Criar program
  createProgram: {
    onSuccess: () => {
      invalidateQueries.programLists();
      invalidateQueries.allPrograms();
    }
  },
  
  // Atualizar program
  updateProgram: (programId: string) => ({
    onSuccess: () => {
      invalidateQueries.program(programId);
      invalidateQueries.programLists();
    }
  })
};

/**
 * Hook para debug de queries (desenvolvimento)
 */
export const useQueryDevtools = () => {
  let isDev = false;
  try {
    isDev = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('dev')
    );
  } catch {
    isDev = false;
  }

  if (isDev) {
    return {
      queryClient,
      invalidateAll: () => queryClient.invalidateQueries(),
      clearCache: () => queryClient.clear(),
      getCache: () => queryClient.getQueryCache().getAll(),
      getQueries: () => queryClient.getQueryCache().getAll().map(query => ({
        queryKey: query.queryKey,
        state: query.state,
        observers: query.getObserversCount()
      }))
    };
  }
  return null;
};