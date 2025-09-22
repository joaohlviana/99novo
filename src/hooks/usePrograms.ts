/**
 * 📚 PROGRAMS HOOKS
 * 
 * Hooks customizados para gerenciar dados de programas
 * usando TanStack Query para cache e estados de requisição.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateQueries, mutationOptions } from '../lib/query-client';
import { programsService } from '../services/programs.instance';
import { Program, PaginationParams } from '../types';
import { ProgramFilters } from '../services/programs.service';

/**
 * Hook para buscar todos os programas
 */
export const usePrograms = (params?: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.programs.list(params),
    queryFn: () => programsService.getAllPrograms(params),
    select: (data) => data.success ? data.data : null
  });
};

/**
 * Hook para buscar um programa específico por ID
 */
export const useProgram = (programId: string | undefined, enabled = true) => {
  // Validação extra para prevenir chamadas com undefined
  const isValidId = programId && programId.trim() !== '' && programId !== 'undefined';
  
  return useQuery({
    queryKey: queryKeys.programs.detail(programId || 'invalid'),
    queryFn: () => {
      if (!isValidId) {
        console.warn('⚠️ useProgram: ID inválido fornecido:', programId);
        return Promise.resolve({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID do programa é obrigatório'
          }
        });
      }
      return programsService.getProgramById(programId);
    },
    select: (data) => data.success ? data.data : null,
    enabled: enabled && isValidId
  });
};

/**
 * Hook para buscar programas com filtros
 */
export const useProgramsSearch = (
  filters: ProgramFilters,
  params?: PaginationParams
) => {
  return useQuery({
    queryKey: queryKeys.programs.list({ filters, params }),
    queryFn: () => programsService.searchPrograms(filters, params),
    select: (data) => data.success ? data.data : null
  });
};

/**
 * Hook para buscar programas em destaque
 */
export const useFeaturedPrograms = (limit = 6) => {
  return useQuery({
    queryKey: queryKeys.programs.featured(),
    queryFn: () => programsService.getFeaturedPrograms(limit),
    select: (data) => data.success ? data.data : [],
    staleTime: 10 * 60 * 1000 // 10 minutos
  });
};

/**
 * Hook para buscar programas em trending
 */
export const useTrendingPrograms = (limit = 6) => {
  return useQuery({
    queryKey: queryKeys.programs.trending(),
    queryFn: () => programsService.getTrendingPrograms(limit),
    select: (data) => data.success ? data.data : [],
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
};

/**
 * Hook para buscar programas populares
 */
export const usePopularPrograms = (limit = 6) => {
  return useQuery({
    queryKey: queryKeys.programs.popular(),
    queryFn: () => programsService.getPopularPrograms(limit),
    select: (data) => data.success ? data.data : [],
    staleTime: 15 * 60 * 1000 // 15 minutos
  });
};

/**
 * Hook para buscar programas recomendados
 */
export const useRecommendedPrograms = (userId?: string, limit = 6) => {
  return useQuery({
    queryKey: queryKeys.programs.recommended(userId),
    queryFn: () => programsService.getRecommendedPrograms(userId, limit),
    select: (data) => data.success ? data.data : [],
    enabled: !!userId
  });
};

/**
 * Hook para buscar programas de um treinador
 */
export const useProgramsByTrainer = (
  trainerId: string | undefined,
  params?: PaginationParams,
  enabled = true
) => {
  const isValidId = trainerId && trainerId.trim() !== '' && trainerId !== 'undefined';
  
  return useQuery({
    queryKey: queryKeys.programs.byTrainer(trainerId || 'invalid'),
    queryFn: () => {
      if (!isValidId) {
        console.warn('⚠️ useProgramsByTrainer: Trainer ID inválido:', trainerId);
        return Promise.resolve({
          success: false,
          error: {
            code: 'INVALID_TRAINER_ID',
            message: 'ID do treinador é obrigatório'
          }
        });
      }
      return programsService.getProgramsByTrainer(trainerId, params);
    },
    select: (data) => data.success ? data.data : null,
    enabled: enabled && isValidId
  });
};

/**
 * Hook para buscar programas de um esporte
 */
export const useProgramsBySport = (
  sportId: string | undefined,
  params?: PaginationParams,
  enabled = true
) => {
  const isValidId = sportId && sportId.trim() !== '' && sportId !== 'undefined';
  
  return useQuery({
    queryKey: queryKeys.programs.bySport(sportId || 'invalid'),
    queryFn: () => {
      if (!isValidId) {
        console.warn('⚠️ useProgramsBySport: Sport ID inválido:', sportId);
        return Promise.resolve({
          success: false,
          error: {
            code: 'INVALID_SPORT_ID',
            message: 'ID do esporte é obrigatório'
          }
        });
      }
      return programsService.getProgramsBySport(sportId, params);
    },
    select: (data) => data.success ? data.data : null,
    enabled: enabled && isValidId
  });
};

/**
 * Hook para criar um novo programa
 */
export const useCreateProgram = () => {
  return useMutation({
    mutationFn: (program: Partial<Program>) => programsService.createProgram(program),
    ...mutationOptions.createProgram,
    onSuccess: (data) => {
      if (data.success) {
        // Invalidar listas de programas
        invalidateQueries.programLists();
        invalidateQueries.allPrograms();
      }
    }
  });
};

/**
 * Hook para atualizar um programa
 */
export const useUpdateProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Program> }) =>
      programsService.updateProgram(id, updates),
    onSuccess: (data, variables) => {
      if (data.success && data.data) {
        // Atualizar cache local
        queryClient.setQueryData(
          queryKeys.programs.detail(variables.id),
          { success: true, data: data.data }
        );
        
        // Invalidar queries relacionadas
        invalidateQueries.program(variables.id);
        invalidateQueries.programLists();
      }
    }
  });
};

/**
 * Hook para deletar um programa
 */
export const useDeleteProgram = () => {
  return useMutation({
    mutationFn: (programId: string) => programsService.deleteProgram(programId),
    onSuccess: (data, programId) => {
      if (data.success) {
        // Remover do cache
        invalidateQueries.program(programId);
        invalidateQueries.programLists();
      }
    }
  });
};

/**
 * Hook para publicar um programa
 */
export const usePublishProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (programId: string) => programsService.publishProgram(programId),
    onSuccess: (data, programId) => {
      if (data.success && data.data) {
        // Atualizar cache
        queryClient.setQueryData(
          queryKeys.programs.detail(programId),
          { success: true, data: data.data }
        );
        
        invalidateQueries.programLists();
      }
    }
  });
};

/**
 * Hook para despublicar um programa
 */
export const useUnpublishProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (programId: string) => programsService.unpublishProgram(programId),
    onSuccess: (data, programId) => {
      if (data.success && data.data) {
        // Atualizar cache
        queryClient.setQueryData(
          queryKeys.programs.detail(programId),
          { success: true, data: data.data }
        );
        
        invalidateQueries.programLists();
      }
    }
  });
};

/**
 * Hook para prefetch de programas (otimização)
 */
export const usePrefetchProgram = () => {
  const queryClient = useQueryClient();
  
  const prefetchProgram = (programId: string | undefined) => {
    // Validação para prevenir prefetch com ID inválido
    if (!programId || programId.trim() === '' || programId === 'undefined') {
      console.warn('⚠️ usePrefetchProgram: ID inválido fornecido:', programId);
      return;
    }

    queryClient.prefetchQuery({
      queryKey: queryKeys.programs.detail(programId),
      queryFn: () => programsService.getProgramById(programId),
      staleTime: 5 * 60 * 1000 // 5 minutos
    });
  };
  
  return { prefetchProgram };
};