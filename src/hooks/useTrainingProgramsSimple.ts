/**
 * 🏋️ HOOK PARA TRAINING PROGRAMS SIMPLES
 * 
 * Hook simples para gerenciar programas de treinamento
 * Arquitetura inspirada no useTrainerProfileHybrid.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  trainingProgramsSimpleService, 
  type TrainingProgram, 
  type ProgramData, 
  type CreateProgramInput,
  type UpdateProgramInput 
} from '../services/training-programs-simple.service';
import { toast } from 'sonner@2.0.3';

// ============================================
// TIPOS DO HOOK
// ============================================

interface UseTrainingProgramsReturn {
  // Estado dos dados
  programs: TrainingProgram[];
  currentProgram: TrainingProgram | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isDirty: boolean;

  // Ações
  loadPrograms: () => Promise<void>;
  loadProgram: (id: string) => Promise<void>;
  createProgram: (data?: Partial<ProgramData>) => Promise<TrainingProgram>;
  updateProgram: (id: string, data: Partial<ProgramData>) => Promise<void>;
  publishProgram: (id: string) => Promise<void>;
  unpublishProgram: (id: string) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  
  // Estado local
  updateCurrentProgram: (data: Partial<ProgramData>) => void;
  saveCurrentProgram: () => Promise<void>;
  setCurrentProgram: (program: TrainingProgram | null) => void;
  
  // Utilitários
  refresh: () => Promise<void>;
  reset: () => void;
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useTrainingProgramsSimple(): UseTrainingProgramsReturn {
  const { user, isAuthenticated } = useAuth();
  
  // Estados
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [currentProgram, setCurrentProgram] = useState<TrainingProgram | null>(null);
  const [originalProgram, setOriginalProgram] = useState<TrainingProgram | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // CARREGAR PROGRAMAS
  // ============================================

  const loadPrograms = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      console.log('👤 useTrainingPrograms: Usuário não autenticado');
      setPrograms([]); // Limpar programas se não autenticado
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Carregando programas para trainer:', user.id);

      const data = await trainingProgramsSimpleService.getByTrainerId(user.id);
      setPrograms(data);
      console.log(`✅ Carregados ${data.length} programas`);

    } catch (err) {
      console.error('❌ Erro ao carregar programas:', err);
      
      // Verificar se é erro de permissão
      if (err.message?.includes('permission denied') || err.message?.includes('42501')) {
        setError('Erro de permissão. Verifique se você está logado corretamente.');
        toast.error('Erro de permissão. Faça login novamente.');
      } else {
        setError(err.message || 'Erro ao carregar programas');
        toast.error('Erro ao carregar programas');
      }
      
      setPrograms([]); // Limpar programas em caso de erro
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  // ============================================
  // CARREGAR PROGRAMA ESPECÍFICO
  // ============================================

  const loadProgram = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Carregando programa:', id);

      const data = await trainingProgramsSimpleService.getById(id);
      if (data) {
        setCurrentProgram(data);
        setOriginalProgram(data);
        console.log('✅ Programa carregado:', data.title || 'Sem título');
      } else {
        throw new Error('Programa não encontrado');
      }

    } catch (err) {
      console.error('❌ Erro ao carregar programa:', err);
      setError(err.message || 'Erro ao carregar programa');
      toast.error('Programa não encontrado');
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // CRIAR PROGRAMA
  // ============================================

  const createProgram = useCallback(async (programInput?: any): Promise<TrainingProgram> => {
    if (!user?.id) {
      console.warn('⚠️ Criando programa sem usuário - usando ID temporário');
      
      // Criar programa temporário para demonstração
      const tempProgram: TrainingProgram = {
        id: `temp-${Date.now()}`,
        trainer_id: 'temp-user',
        title: programInput?.title || 'Novo Programa',
        category: programInput?.category || 'Geral',
        modality: programInput?.modality || 'Presencial',
        level: programInput?.level || 'Iniciante',
        duration: programInput?.duration || 4,
        duration_type: programInput?.duration_type || 'weeks',
        frequency: programInput?.frequency || 3,
        base_price: programInput?.base_price || 0,
        is_published: false,
        status: 'draft',
        program_data: {
          lastUpdated: new Date().toISOString(),
          ...programInput?.program_data
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setCurrentProgram(tempProgram);
      setOriginalProgram(tempProgram);
      toast.info('Programa temporário criado (faça login para salvar)');
      return tempProgram;
    }

    try {
      setSaving(true);
      setError(null);
      console.log('➕ Criando novo programa');

      const input: CreateProgramInput = {
        trainer_id: user.id,
        title: programInput?.title || 'Novo Programa',
        category: programInput?.category || 'Geral',
        modality: programInput?.modality || 'Presencial',
        level: programInput?.level || 'Iniciante',
        duration: programInput?.duration || 4,
        duration_type: programInput?.duration_type || 'weeks',
        frequency: programInput?.frequency || 3,
        base_price: programInput?.base_price || 0,
        program_data: {
          lastUpdated: new Date().toISOString(),
          ...programInput?.program_data
        }
      };

      const newProgram = await trainingProgramsSimpleService.create(input);
      
      // Atualizar lista de programas
      setPrograms(prev => [newProgram, ...prev]);
      
      // Definir como programa atual
      setCurrentProgram(newProgram);
      setOriginalProgram(newProgram);
      
      toast.success('Programa criado com sucesso!');
      return newProgram;

    } catch (err) {
      console.error('❌ Erro ao criar programa:', err);
      
      // Verificar se é erro de permissão
      if (err.message?.includes('permission denied') || err.message?.includes('42501')) {
        setError('Erro de permissão. Verifique se você está logado.');
        toast.error('Erro de permissão. Faça login para criar programas.');
      } else {
        setError(err.message || 'Erro ao criar programa');
        toast.error('Erro ao criar programa');
      }
      
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user?.id]);

  // ============================================
  // ATUALIZAR PROGRAMA
  // ============================================

  const updateProgram = useCallback(async (id: string, data: Partial<ProgramData>) => {
    try {
      setSaving(true);
      setError(null);
      console.log('💾 Atualizando programa:', id, 'com dados:', Object.keys(data));

      // Separar campos estruturados dos campos JSONB
      const structuredFields = ['title', 'category', 'modality', 'level', 'duration', 'frequency', 'base_price'];
      
      const structuredData: any = {};
      const jsonbData: any = {};
      
      Object.keys(data).forEach(key => {
        if (structuredFields.includes(key)) {
          structuredData[key] = data[key as keyof ProgramData];
        } else {
          jsonbData[key] = data[key as keyof ProgramData];
        }
      });

      const input: UpdateProgramInput = {
        ...structuredData, // Campos estruturados no nível raiz
        program_data: jsonbData // Apenas campos JSONB
      };

      console.log('💾 Input para serviço:', {
        structuredFields: Object.keys(structuredData),
        jsonbFields: Object.keys(jsonbData)
      });

      const updatedProgram = await trainingProgramsSimpleService.update(id, input);
      
      // Atualizar lista de programas
      setPrograms(prev => prev.map(p => p.id === id ? updatedProgram : p));
      
      // Atualizar programa atual se for o mesmo
      if (currentProgram?.id === id) {
        setCurrentProgram(updatedProgram);
        setOriginalProgram(updatedProgram);
      }
      
      toast.success('Programa salvo com sucesso!');

    } catch (err) {
      console.error('❌ Erro ao atualizar programa:', err);
      setError(err.message || 'Erro ao atualizar programa');
      toast.error('Erro ao salvar programa');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [currentProgram?.id]);

  // ============================================
  // PUBLICAR PROGRAMA
  // ============================================

  const publishProgram = useCallback(async (id: string) => {
    try {
      setSaving(true);
      const updatedProgram = await trainingProgramsSimpleService.publish(id);
      
      setPrograms(prev => prev.map(p => p.id === id ? updatedProgram : p));
      if (currentProgram?.id === id) {
        setCurrentProgram(updatedProgram);
        setOriginalProgram(updatedProgram);
      }
      
      toast.success('Programa publicado com sucesso!');

    } catch (err) {
      console.error('❌ Erro ao publicar programa:', err);
      toast.error('Erro ao publicar programa');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [currentProgram?.id]);

  // ============================================
  // DESPUBLICAR PROGRAMA
  // ============================================

  const unpublishProgram = useCallback(async (id: string) => {
    try {
      setSaving(true);
      const updatedProgram = await trainingProgramsSimpleService.unpublish(id);
      
      setPrograms(prev => prev.map(p => p.id === id ? updatedProgram : p));
      if (currentProgram?.id === id) {
        setCurrentProgram(updatedProgram);
        setOriginalProgram(updatedProgram);
      }
      
      toast.success('Programa despublicado');

    } catch (err) {
      console.error('❌ Erro ao despublicar programa:', err);
      toast.error('Erro ao despublicar programa');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [currentProgram?.id]);

  // ============================================
  // DELETAR PROGRAMA
  // ============================================

  const deleteProgram = useCallback(async (id: string) => {
    try {
      setSaving(true);
      await trainingProgramsSimpleService.delete(id);
      
      setPrograms(prev => prev.filter(p => p.id !== id));
      if (currentProgram?.id === id) {
        setCurrentProgram(null);
        setOriginalProgram(null);
      }
      
      toast.success('Programa deletado');

    } catch (err) {
      console.error('❌ Erro ao deletar programa:', err);
      toast.error('Erro ao deletar programa');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [currentProgram?.id]);

  // ============================================
  // ATUALIZAR PROGRAMA ATUAL (LOCAL)
  // ============================================

  const updateCurrentProgram = useCallback((data: Partial<ProgramData>) => {
    if (!currentProgram) return;

    console.log('📝 Atualizando programa local:', Object.keys(data));

    // Separar campos estruturados dos campos JSONB
    const structuredFields = ['title', 'category', 'modality', 'level', 'duration', 'frequency', 'base_price'];
    
    const structuredData: any = {};
    const jsonbData: any = {};
    
    Object.keys(data).forEach(key => {
      if (structuredFields.includes(key)) {
        structuredData[key] = data[key as keyof ProgramData];
      } else {
        jsonbData[key] = data[key as keyof ProgramData];
      }
    });

    // Atualizar program_data com dados JSONB + timestamp
    const updatedProgramData = {
      ...currentProgram.program_data,
      ...jsonbData,
      lastUpdated: new Date().toISOString()
    };

    // Criar programa atualizado com campos estruturados + JSONB
    const updatedProgram: TrainingProgram = {
      ...currentProgram,
      ...structuredData, // Campos estruturados no nível raiz
      program_data: updatedProgramData, // Campos JSONB
      updated_at: new Date().toISOString()
    };

    console.log('📝 Programa atualizado localmente:', {
      structuredFields: Object.keys(structuredData),
      jsonbFields: Object.keys(jsonbData),
      title: updatedProgram.title,
      category: updatedProgram.category
    });

    setCurrentProgram(updatedProgram);
  }, [currentProgram]);

  // ============================================
  // SALVAR PROGRAMA ATUAL
  // ============================================

  const saveCurrentProgram = useCallback(async () => {
    if (!currentProgram) {
      toast.error('Nenhum programa selecionado');
      return;
    }

    // Combinar campos estruturados e JSONB para enviar como update
    const dataToSave: Partial<ProgramData> = {
      // Campos estruturados
      title: currentProgram.title,
      category: currentProgram.category,
      modality: currentProgram.modality,
      level: currentProgram.level,
      duration: currentProgram.duration,
      frequency: currentProgram.frequency,
      base_price: currentProgram.base_price,
      // Campos JSONB
      ...currentProgram.program_data
    };

    await updateProgram(currentProgram.id, dataToSave);
  }, [currentProgram, updateProgram]);

  // ============================================
  // REFRESH
  // ============================================

  const refresh = useCallback(async () => {
    console.log('🔄 Fazendo refresh dos programas');
    await loadPrograms();
  }, [loadPrograms]);

  // ============================================
  // RESET
  // ============================================

  const reset = useCallback(() => {
    console.log('🔄 Resetando estado');
    if (originalProgram) {
      setCurrentProgram(originalProgram);
    }
    setError(null);
  }, [originalProgram]);

  // ============================================
  // EFEITOS
  // ============================================

  // Carregar programas iniciais
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadPrograms();
    }
  }, [isAuthenticated, user?.id, loadPrograms]);

  // ============================================
  // VALORES COMPUTADOS
  // ============================================

  const isDirty = originalProgram && currentProgram ? 
    JSON.stringify(currentProgram) !== JSON.stringify(originalProgram) : 
    false;

  // ============================================
  // RETORNO DO HOOK
  // ============================================

  return {
    // Estado dos dados
    programs,
    currentProgram,
    loading,
    saving,
    error,
    isDirty,

    // Ações
    loadPrograms,
    loadProgram,
    createProgram,
    updateProgram,
    publishProgram,
    unpublishProgram,
    deleteProgram,
    
    // Estado local
    updateCurrentProgram,
    saveCurrentProgram,
    setCurrentProgram,
    
    // Utilitários
    refresh,
    reset
  };
}

export default useTrainingProgramsSimple;