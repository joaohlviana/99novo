/**
 * HOOK: useTrainingPrograms - VERSÃO JSONB REESTRUTURADA
 * ======================================================
 * Hook React para gerenciar programas de treino na estrutura JSONB otimizada
 * Fornece operações CRUD e estado otimizado para UI
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  trainingProgramsService,
  CreateTrainingProgramInput,
  UpdateTrainingProgramData,
  ProgramFilters
} from '../services/training-programs.service';
import { ProgramData } from '../types/training-program';

// ===============================================
// TIPOS
// ===============================================

interface UseTrainingProgramsState {
  programs: ProgramData[];
  loading: boolean;
  error: string | null;
  stats: {
    total_programs: number;
    published_programs: number;
    draft_programs: number;
    total_views: number;
    total_inquiries: number;
    total_conversions: number;
  } | null;
}

interface UseTrainingProgramsActions {
  // CRUD Operations
  createProgram: (data: CreateTrainingProgramInput) => Promise<ProgramData | null>;
  updateProgram: (id: string, data: ProgramData) => Promise<ProgramData | null>;
  updateProgramPartial: (id: string, updates: UpdateTrainingProgramData) => Promise<ProgramData | null>;
  deleteProgram: (id: string) => Promise<boolean>;
  publishProgram: (id: string) => Promise<boolean>;
  unpublishProgram: (id: string) => Promise<boolean>;
  
  // Data Loading
  refreshPrograms: () => Promise<void>;
  loadProgram: (id: string) => Promise<ProgramData | null>;
  loadPublicPrograms: (filters?: ProgramFilters) => Promise<ProgramData[]>;
  
  // Analytics
  incrementViews: (id: string) => Promise<void>;
  refreshStats: () => Promise<void>;
  
  // Utility
  clearError: () => void;
  resetState: () => void;
}

interface UseTrainingProgramsReturn extends UseTrainingProgramsState, UseTrainingProgramsActions {
  // Computed values
  publishedPrograms: ProgramData[];
  draftPrograms: ProgramData[];
  archivedPrograms: ProgramData[];
  programsById: Record<string, ProgramData>;
}

// ===============================================
// HOOK PRINCIPAL
// ===============================================

export function useTrainingPrograms(): UseTrainingProgramsReturn {
  const { user } = useAuth();
  
  // ===============================================
  // ESTADO
  // ===============================================
  
  const [state, setState] = useState<UseTrainingProgramsState>({
    programs: [],
    loading: false,
    error: null,
    stats: null
  });

  // ===============================================
  // COMPUTED VALUES
  // ===============================================
  
  const publishedPrograms = useMemo(
    () => state.programs.filter(p => p.isPublished && p.status === 'published'),
    [state.programs]
  );
  
  const draftPrograms = useMemo(
    () => state.programs.filter(p => !p.isPublished || p.status === 'draft'),
    [state.programs]
  );
  
  const archivedPrograms = useMemo(
    () => state.programs.filter(p => p.status === 'archived'),
    [state.programs]
  );
  
  const programsById = useMemo(
    () => {
      const result: Record<string, ProgramData> = {};
      state.programs.forEach((program, index) => {
        // Usar createdAt como ID único, com fallback para index
        const id = program.createdAt || `program-${index}`;
        result[id] = program;
      });
      return result;
    },
    [state.programs]
  );

  // ===============================================
  // UTILITY FUNCTIONS
  // ===============================================
  
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);
  
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const updateProgramInState = useCallback((updatedProgram: ProgramData) => {
    setState(prev => ({
      ...prev,
      programs: prev.programs.map(p => 
        p.createdAt === updatedProgram.createdAt ? updatedProgram : p
      )
    }));
  }, []);

  const addProgramToState = useCallback((newProgram: ProgramData) => {
    setState(prev => {
      // Evitar duplicatas
      const exists = prev.programs.some(p => p.createdAt === newProgram.createdAt);
      if (exists) {
        return prev;
      }
      return {
        ...prev,
        programs: [newProgram, ...prev.programs]
      };
    });
  }, []);

  const removeProgramFromState = useCallback((programId: string) => {
    setState(prev => ({
      ...prev,
      programs: prev.programs.filter(p => p.createdAt !== programId)
    }));
  }, []);

  // ===============================================
  // CRUD OPERATIONS
  // ===============================================
  
  const createProgram = useCallback(async (data: CreateTrainingProgramInput): Promise<ProgramData | null> => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    }

    try {
      setLoading(true);
      clearError();

      const { data: newProgram, error } = await trainingProgramsService.createProgram({
        ...data,
        trainer_id: user.id
      });

      if (error) {
        setError('Erro ao criar programa: ' + (error.message || JSON.stringify(error)));
        return null;
      }

      if (newProgram) {
        addProgramToState(newProgram);
      }

      return newProgram;
    } catch (error) {
      console.error('Erro ao criar programa:', error);
      setError('Erro inesperado ao criar programa');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, addProgramToState, setLoading, setError, clearError]);

  const updateProgram = useCallback(async (
    id: string, 
    programData: ProgramData
  ): Promise<ProgramData | null> => {
    try {
      setLoading(true);
      clearError();

      const { data: updatedProgram, error } = await trainingProgramsService.updateProgram(id, programData);

      if (error) {
        setError('Erro ao atualizar programa: ' + (error.message || JSON.stringify(error)));
        return null;
      }

      if (updatedProgram) {
        updateProgramInState(updatedProgram);
      }

      return updatedProgram;
    } catch (error) {
      console.error('Erro ao atualizar programa:', error);
      setError('Erro inesperado ao atualizar programa');
      return null;
    } finally {
      setLoading(false);
    }
  }, [updateProgramInState, setLoading, setError, clearError]);

  const updateProgramPartial = useCallback(async (
    id: string, 
    updates: UpdateTrainingProgramData
  ): Promise<ProgramData | null> => {
    try {
      setLoading(true);
      clearError();

      const { data: updatedProgram, error } = await trainingProgramsService.updateProgramPartial(id, updates);

      if (error) {
        setError('Erro ao atualizar programa: ' + (error.message || JSON.stringify(error)));
        return null;
      }

      if (updatedProgram) {
        updateProgramInState(updatedProgram);
      }

      return updatedProgram;
    } catch (error) {
      console.error('Erro ao atualizar programa:', error);
      setError('Erro inesperado ao atualizar programa');
      return null;
    } finally {
      setLoading(false);
    }
  }, [updateProgramInState, setLoading, setError, clearError]);

  const deleteProgram = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      clearError();

      const { error } = await trainingProgramsService.deleteProgram(id);

      if (error) {
        setError('Erro ao deletar programa: ' + error.message);
        return false;
      }

      removeProgramFromState(id);
      return true;
    } catch (error) {
      console.error('Erro ao deletar programa:', error);
      setError('Erro inesperado ao deletar programa');
      return false;
    } finally {
      setLoading(false);
    }
  }, [removeProgramFromState, setLoading, setError, clearError]);

  const publishProgram = useCallback(async (id: string): Promise<boolean> => {
    const result = await updateProgramPartial(id, { is_published: true, status: 'published' });
    return result !== null;
  }, [updateProgramPartial]);

  const unpublishProgram = useCallback(async (id: string): Promise<boolean> => {
    const result = await updateProgramPartial(id, { is_published: false, status: 'draft' });
    return result !== null;
  }, [updateProgramPartial]);

  // ===============================================
  // DATA LOADING
  // ===============================================
  
  const refreshPrograms = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      clearError();

      const { data: programs, error } = await trainingProgramsService.getTrainerPrograms(user.id);

      if (error) {
        setError('Erro ao carregar programas: ' + error.message);
        return;
      }

      setState(prev => ({
        ...prev,
        programs: programs || []
      }));
    } catch (error) {
      console.error('Erro ao carregar programas:', error);
      setError('Erro inesperado ao carregar programas');
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setError, clearError]);

  const loadProgram = useCallback(async (id: string): Promise<ProgramData | null> => {
    try {
      const { data: program, error } = await trainingProgramsService.getProgramById(id);

      if (error) {
        setError('Erro ao carregar programa: ' + (error.message || JSON.stringify(error)));
        return null;
      }

      // Se o programa não está no estado, adiciona
      const programId = program?.createdAt || 'unknown';
      if (program && !programsById[programId]) {
        addProgramToState(program);
      }

      return program;
    } catch (error) {
      console.error('Erro ao carregar programa:', error);
      setError('Erro inesperado ao carregar programa');
      return null;
    }
  }, [programsById, addProgramToState, setError]);

  const loadPublicPrograms = useCallback(async (
    filters?: ProgramFilters
  ): Promise<ProgramData[]> => {
    try {
      const { data: programs, error } = await trainingProgramsService.getPublicPrograms(filters);

      if (error) {
        console.error('Erro ao carregar programas públicos:', error);
        return [];
      }

      return programs || [];
    } catch (error) {
      console.error('Erro ao carregar programas públicos:', error);
      return [];
    }
  }, []);

  // ===============================================
  // ANALYTICS
  // ===============================================
  
  const incrementViews = useCallback(async (id: string): Promise<void> => {
    try {
      await trainingProgramsService.incrementViews(id);
      
      // Atualizar localmente se o programa está no estado
      const program = Object.values(programsById).find(p => p.createdAt === id);
      if (program) {
        // Recarregar o programa do servidor para obter dados atualizados
        try {
          const { data: updatedProgram } = await trainingProgramsService.getProgramById(id);
          if (updatedProgram) {
            updateProgramInState(updatedProgram);
          }
        } catch (error) {
          console.error('Erro ao recarregar programa após incrementar views:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao incrementar views:', error);
    }
  }, [programsById, updateProgramInState]);

  const refreshStats = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const { data: stats, error } = await trainingProgramsService.getTrainerStats(user.id);

      if (error) {
        console.error('Erro ao carregar estatísticas:', error);
        return;
      }

      setState(prev => ({
        ...prev,
        stats: stats || null
      }));
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, [user]);

  // ===============================================
  // UTILITY
  // ===============================================
  
  const resetState = useCallback(() => {
    setState({
      programs: [],
      loading: false,
      error: null,
      stats: null
    });
  }, []);

  // ===============================================
  // EFFECTS
  // ===============================================
  
  // Carregar programas quando user mudar
  useEffect(() => {
    if (user) {
      refreshPrograms();
      refreshStats();
    } else {
      resetState();
    }
  }, [user, refreshPrograms, refreshStats, resetState]);

  // ===============================================
  // RETURN
  // ===============================================
  
  return {
    // State
    ...state,
    
    // Computed values
    publishedPrograms,
    draftPrograms,
    archivedPrograms,
    programsById,
    
    // Actions
    createProgram,
    updateProgram,
    updateProgramPartial,
    deleteProgram,
    publishProgram,
    unpublishProgram,
    refreshPrograms,
    loadProgram,
    loadPublicPrograms,
    incrementViews,
    refreshStats,
    clearError,
    resetState
  };
}

// ===============================================
// HOOK PARA PROGRAMA ESPECÍFICO
// ===============================================

export function useTrainingProgram(id: string | null) {
  const [program, setProgram] = useState<ProgramData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProgram = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: loadError } = await trainingProgramsService.getProgramById(id);

      if (loadError) {
        setError('Erro ao carregar programa: ' + (loadError.message || JSON.stringify(loadError)));
        return;
      }

      setProgram(data);
    } catch (error) {
      console.error('Erro ao carregar programa:', error);
      setError('Erro inesperado ao carregar programa');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  return {
    program,
    loading,
    error,
    refresh: loadProgram
  };
}

// ===============================================
// EXPORTS
// ===============================================

export default useTrainingPrograms;