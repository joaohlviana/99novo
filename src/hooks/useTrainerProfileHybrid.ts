/**
 * 🏋️ HOOK PARA TRAINER PROFILE HÍBRIDO
 * 
 * Hook para gerenciar perfis de treinadores usando tabela híbrida 99_trainer_profile
 * Integrado com sistema de autenticação
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  trainerProfileService, 
  type TrainerProfile, 
  type TrainerProfileData, 
  type CreateTrainerProfileInput,
  type UpdateTrainerProfileInput 
} from '../services/trainer-profile.service';
import { toast } from 'sonner@2.0.3';

// ============================================
// TIPOS DO HOOK
// ============================================

interface UseTrainerProfileReturn {
  // Estado dos dados
  profileData: TrainerProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isDirty: boolean;

  // Ações
  saveProfile: (data?: Partial<TrainerProfileData>) => Promise<void>;
  updateProfileData: (data: Partial<TrainerProfileData>) => void;
  reset: () => void;
  refresh: () => Promise<void>;

  // Status
  isNewProfile: boolean;
  completionPercentage: number;

  // Utilitários
  calculateProfileCompletion: (data: TrainerProfileData) => number;
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useTrainerProfileHybrid(): UseTrainerProfileReturn {
  const { user, isAuthenticated } = useAuth();
  
  // Estados
  const [profileData, setProfileData] = useState<TrainerProfile | null>(null);
  const [originalData, setOriginalData] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================

  const calculateProfileCompletion = useCallback((data: TrainerProfileData): number => {
    const requiredFields = [
      'bio', 'phone', 'experienceYears', 'responseTime', 
      'studentsCount', 'modalities', 'cities'
    ];
    
    const optionalFields = [
      'instagram', 'credential', 'specialties', 'universities', 
      'courses', 'galleryImages', 'profilePhoto'
    ];

    let score = 0;
    let maxScore = 0;

    // Campos obrigatórios (peso 10)
    requiredFields.forEach(field => {
      maxScore += 10;
      if (data[field] && 
          (Array.isArray(data[field]) 
            ? data[field].length > 0 
            : data[field].toString().trim().length > 0)) {
        score += 10;
      }
    });

    // Campos opcionais (peso 5)
    optionalFields.forEach(field => {
      maxScore += 5;
      if (data[field] && 
          (Array.isArray(data[field]) 
            ? data[field].length > 0 
            : data[field].toString().trim().length > 0)) {
        score += 5;
      }
    });

    return Math.round((score / maxScore) * 100);
  }, []);

  // ============================================
  // CARREGAR DADOS INICIAIS
  // ============================================

  const loadProfile = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      console.log('👤 useTrainerProfileHybrid: Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 useTrainerProfileHybrid: Carregando perfil para user:', user.id);

      // Buscar perfil existente
      const profile = await trainerProfileService.getByUserId(user.id);

      if (profile && profile.id) {
        console.log('✅ Perfil existente encontrado:', profile.name || 'Sem nome', 'ID:', profile.id);
        setProfileData(profile);
        setOriginalData(profile);
      } else {
        console.log('➕ Nenhum perfil encontrado - criando estrutura inicial local');
        
        // Criar estrutura inicial local (não no servidor ainda)
        const initialProfile: Partial<TrainerProfile> = {
          id: '', // Vazio indica que ainda não foi salvo
          user_id: user.id,
          name: user.name || '',
          email: user.email || '',
          phone: '',
          status: 'draft',
          is_active: true,
          is_verified: false,
          profile_data: {
            bio: '',
            phone: '',
            instagram: '',
            experienceYears: '',
            responseTime: '',
            studentsCount: '',
            credential: '',
            specialties: [],
            modalities: [],
            cities: [],
            address: '',
            cep: '',
            number: '',
            complement: '',
            city: '',
            universities: [],
            courses: [],
            galleryImages: [],
            stories: [],
            profilePhoto: null,
            completionPercentage: 0,
            lastUpdated: new Date().toISOString()
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setProfileData(initialProfile as TrainerProfile);
        setOriginalData(null); // null = novo perfil (nunca foi salvo)
      }

    } catch (err) {
      console.error('❌ Erro ao carregar perfil:', err);
      setError(err.message || 'Erro ao carregar perfil');
      toast.error('Erro ao carregar perfil do treinador');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.name, user?.email, isAuthenticated]);

  // ============================================
  // ATUALIZAR DADOS
  // ============================================

  const updateProfileData = useCallback((newData: Partial<TrainerProfileData>) => {
    if (!profileData) return;

    console.log('📝 useTrainerProfileHybrid: Atualizando dados locais');

    const updatedProfileData = {
      ...profileData.profile_data,
      ...newData,
      lastUpdated: new Date().toISOString()
    };

    const updatedProfile: TrainerProfile = {
      ...profileData,
      profile_data: updatedProfileData,
      updated_at: new Date().toISOString()
    };

    // Atualizar campos estruturados se necessário
    if (newData.phone !== undefined) {
      updatedProfile.phone = newData.phone;
    }

    setProfileData(updatedProfile);
  }, [profileData]);

  // ============================================
  // SALVAR PERFIL
  // ============================================

  const saveProfile = useCallback(async (additionalData?: Partial<TrainerProfileData>) => {
    if (!user?.id || !profileData) {
      toast.error('Dados insuficientes para salvar');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const isExistingProfile = originalData && originalData.id;
      console.log(`💾 useTrainerProfileHybrid: ${isExistingProfile ? 'Atualizando' : 'Criando'} perfil para user:`, user.id);

      // Combinar dados atuais com dados adicionais
      const dataToSave: TrainerProfileData = {
        ...profileData.profile_data,
        ...additionalData,
        lastUpdated: new Date().toISOString()
      };

      // Usar upsert que tem fallbacks robustos
      const upsertInput = {
        user_id: user.id,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        profile_data: dataToSave
      };

      console.log('📊 Dados para salvar:', {
        user_id: upsertInput.user_id,
        name: upsertInput.name,
        hasProfileData: !!upsertInput.profile_data,
        isExistingProfile
      });

      const savedProfile = await trainerProfileService.upsert(upsertInput);
      
      console.log('✅ Perfil salvo com sucesso:', savedProfile.id);
      toast.success(isExistingProfile ? 'Perfil atualizado com sucesso!' : 'Perfil criado com sucesso!');

      // Atualizar estados
      setProfileData(savedProfile);
      setOriginalData(savedProfile);

    } catch (err) {
      console.error('❌ Erro ao salvar perfil:', err);
      setError(err.message || 'Erro ao salvar perfil');
      toast.error('Erro ao salvar perfil');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user?.id, profileData, originalData]);

  // ============================================
  // RESETAR DADOS
  // ============================================

  const reset = useCallback(() => {
    console.log('🔄 useTrainerProfileHybrid: Resetando dados');
    if (originalData) {
      setProfileData(originalData);
    } else {
      loadProfile();
    }
    setError(null);
  }, [originalData, loadProfile]);

  // ============================================
  // REFRESH
  // ============================================

  const refresh = useCallback(async () => {
    console.log('🔄 useTrainerProfileHybrid: Fazendo refresh');
    await loadProfile();
  }, [loadProfile]);

  // ============================================
  // EFEITOS
  // ============================================

  // Carregar dados iniciais
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ============================================
  // VALORES COMPUTADOS
  // ============================================

  const isDirty = originalData ? 
    JSON.stringify(profileData) !== JSON.stringify(originalData) : 
    !!(profileData && (
      profileData.profile_data?.bio ||
      profileData.profile_data?.phone ||
      profileData.profile_data?.cities?.length ||
      profileData.profile_data?.modalities?.length ||
      profileData.profile_data?.specialties?.length
    ));

  const isNewProfile = !originalData;
  
  const completionPercentage = profileData ? 
    calculateProfileCompletion(profileData.profile_data) : 
    0;

  // ============================================
  // RETORNO DO HOOK
  // ============================================

  return {
    // Estado dos dados
    profileData,
    loading,
    saving,
    error,
    isDirty,

    // Ações
    saveProfile,
    updateProfileData,
    reset,
    refresh,

    // Status
    isNewProfile,
    completionPercentage,

    // Utilitários
    calculateProfileCompletion
  };
}

// ============================================
// HOOK PARA BUSCAR OUTROS TRAINERS
// ============================================

export function useTrainerSearch() {
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTrainers = useCallback(async (filters: {
    specialty?: string;
    city?: string;
    modality?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const results = await trainerProfileService.searchTrainers(filters);
      setTrainers(results);

    } catch (err) {
      console.error('❌ Erro na busca de trainers:', err);
      setError(err.message || 'Erro na busca');
    } finally {
      setLoading(false);
    }
  }, []);

  const listActive = useCallback(async (limit = 50, offset = 0) => {
    try {
      setLoading(true);
      setError(null);

      const results = await trainerProfileService.listActive(limit, offset);
      setTrainers(results);

    } catch (err) {
      console.error('❌ Erro ao listar trainers:', err);
      setError(err.message || 'Erro ao listar trainers');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trainers,
    loading,
    error,
    searchTrainers,
    listActive
  };
}

export default useTrainerProfileHybrid;