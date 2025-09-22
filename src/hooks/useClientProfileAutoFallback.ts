/**
 * HOOK AUTO-FALLBACK PARA PERFIL DO CLIENTE
 * ==========================================
 * Detecta automaticamente problemas de permissão e alterna para modo offline
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

// Serviços
import { clientProfileService, type ClientProfile, type ClientProfileData } from '../services/client-profile.service';
import { clientProfileOfflineService, type OfflineClientProfile } from '../services/client-profile-offline.service';

// Tipos unificados
type UnifiedProfile = ClientProfile | OfflineClientProfile;

interface UseClientProfileAutoFallbackReturn {
  // Estado dos dados
  profileData: UnifiedProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isDirty: boolean;

  // Ações
  saveProfile: (data?: Partial<ClientProfileData>) => Promise<void>;
  updateProfileData: (data: Partial<ClientProfileData>) => void;
  reset: () => void;
  refresh: () => Promise<void>;

  // Status
  isNewProfile: boolean;
  completionPercentage: number;
  isOfflineMode: boolean;

  // Utilitários
  calculateProfileCompletion: (data: ClientProfileData) => number;
}

export function useClientProfileAutoFallback(): UseClientProfileAutoFallbackReturn {
  const { user, isAuthenticated } = useAuth();
  
  // Estados
  const [profileData, setProfileData] = useState<UnifiedProfile | null>(null);
  const [originalData, setOriginalData] = useState<UnifiedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Detectar se deve usar modo offline
  const shouldUseOfflineMode = useCallback((errorMessage: string): boolean => {
    return errorMessage.includes('permission denied') || 
           errorMessage.includes('42501') ||
           errorMessage.includes('table users');
  }, []);

  // Calcular completude
  const calculateProfileCompletion = useCallback((data: ClientProfileData): number => {
    if (isOfflineMode) {
      return clientProfileOfflineService.calculateProfileCompletion(data);
    }
    return clientProfileService.calculateProfileCompletion(data);
  }, [isOfflineMode]);

  // Carregar dados
  const loadProfile = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      console.log('👤 useClientProfileAutoFallback: Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 useClientProfileAutoFallback: Tentando carregar perfil para user:', user.id);

      // Primeiro tentar serviço normal
      if (!isOfflineMode) {
        try {
          const profile = await clientProfileService.getByUserId(user.id);
          
          if (profile) {
            console.log('✅ Perfil carregado via serviço normal:', profile.name);
            setProfileData(profile);
            setOriginalData(profile);
            setIsOfflineMode(false);
            return;
          }
        } catch (serviceError) {
          console.error('❌ Erro no serviço normal:', serviceError);
          
          if (shouldUseOfflineMode(serviceError.message)) {
            console.log('🔧 Alternando para modo offline devido a erro de permissão');
            setIsOfflineMode(true);
            toast.warning('Modo offline ativado - dados serão salvos localmente');
          } else {
            throw serviceError;
          }
        }
      }

      // Usar serviço offline
      if (isOfflineMode) {
        console.log('🔧 Usando modo offline');
        
        let offlineProfile = await clientProfileOfflineService.getByUserId(user.id);
        
        if (!offlineProfile) {
          // Criar perfil inicial offline
          console.log('➕ Criando perfil inicial offline');
          offlineProfile = await clientProfileOfflineService.create({
            user_id: user.id,
            name: user.name || '',
            email: user.email || '',
            phone: '',
            profile_data: {}
          });
        }

        setProfileData(offlineProfile);
        setOriginalData(offlineProfile);
      }

      // Se não tem perfil em lugar nenhum, criar inicial
      if (!profileData) {
        console.log('➕ Criando estrutura inicial');
        
        const initialProfile: UnifiedProfile = {
          id: `temp-${Date.now()}`,
          user_id: user.id,
          name: user.name || '',
          email: user.email || '',
          phone: '',
          profile_data: {
            sportsInterest: [],
            sportsTrained: [],
            sportsCurious: [],
            primaryGoals: [],
            secondaryGoals: [],
            searchTags: [],
            fitnessLevel: '',
            city: '',
            state: '',
            bio: '',
            budget: '',
            trainingTime: [],
            modality: [],
            medicalConditions: '',
            ageRange: '',
            gender: ''
          },
          status: 'draft',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setProfileData(initialProfile);
        setOriginalData(null); // Marca como novo
      }

    } catch (err) {
      console.error('❌ Erro ao carregar perfil:', err);
      
      if (shouldUseOfflineMode(err.message)) {
        console.log('🔧 Forçando modo offline devido a erro persistente');
        setIsOfflineMode(true);
        toast.error('Problema de conexão - usando modo offline');
        
        // Tentar carregar ou criar offline
        try {
          let offlineProfile = await clientProfileOfflineService.getByUserId(user.id);
          if (!offlineProfile) {
            offlineProfile = await clientProfileOfflineService.create({
              user_id: user.id,
              name: user.name || '',
              email: user.email || '',
              phone: '',
              profile_data: {}
            });
          }
          setProfileData(offlineProfile);
          setOriginalData(offlineProfile);
        } catch (offlineError) {
          setError('Erro crítico - não foi possível carregar perfil');
        }
      } else {
        setError(err.message || 'Erro ao carregar perfil');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.name, user?.email, isAuthenticated, isOfflineMode, shouldUseOfflineMode]);

  // Atualizar dados
  const updateProfileData = useCallback((newData: Partial<ClientProfileData>) => {
    if (!profileData) return;

    console.log('📝 useClientProfileAutoFallback: Atualizando dados locais');

    const updatedProfileData = {
      ...profileData.profile_data,
      ...newData,
      lastUpdated: new Date().toISOString()
    };

    const updatedProfile: UnifiedProfile = {
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

  // Salvar perfil
  const saveProfile = useCallback(async (additionalData?: Partial<ClientProfileData>) => {
    if (!user?.id || !profileData) {
      toast.error('Dados insuficientes para salvar');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      console.log(`💾 useClientProfileAutoFallback: Salvando perfil (modo: ${isOfflineMode ? 'offline' : 'online'})`);

      // Combinar dados
      const dataToSave = {
        ...profileData.profile_data,
        ...additionalData,
        lastUpdated: new Date().toISOString()
      };

      let savedProfile: UnifiedProfile;

      if (isOfflineMode) {
        // Salvar offline
        if (originalData) {
          savedProfile = await clientProfileOfflineService.update(user.id, {
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            profile_data: dataToSave
          });
        } else {
          savedProfile = await clientProfileOfflineService.create({
            user_id: user.id,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            profile_data: dataToSave
          });
        }
        
        toast.success('Perfil salvo localmente!');
      } else {
        // Tentar salvar online
        try {
          const completion = calculateProfileCompletion(dataToSave);
          dataToSave.completionPercentage = completion;

          if (originalData) {
            savedProfile = await clientProfileService.update(user.id, {
              name: profileData.name,
              email: profileData.email,
              phone: profileData.phone,
              profile_data: dataToSave
            });
          } else {
            savedProfile = await clientProfileService.create({
              user_id: user.id,
              name: profileData.name,
              email: profileData.email,
              phone: profileData.phone,
              profile_data: dataToSave
            });
          }
          
          toast.success('Perfil salvo com sucesso!');
        } catch (saveError) {
          if (shouldUseOfflineMode(saveError.message)) {
            console.log('🔧 Erro ao salvar online, alternando para offline');
            setIsOfflineMode(true);
            
            // Salvar offline
            savedProfile = await clientProfileOfflineService.create({
              user_id: user.id,
              name: profileData.name,
              email: profileData.email,
              phone: profileData.phone,
              profile_data: dataToSave
            });
            
            toast.warning('Salvo localmente - será sincronizado quando possível');
          } else {
            throw saveError;
          }
        }
      }

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
  }, [user?.id, profileData, originalData, isOfflineMode, calculateProfileCompletion, shouldUseOfflineMode]);

  // Reset
  const reset = useCallback(() => {
    console.log('🔄 useClientProfileAutoFallback: Resetando dados');
    if (originalData) {
      setProfileData(originalData);
    } else {
      loadProfile();
    }
    setError(null);
  }, [originalData, loadProfile]);

  // Refresh
  const refresh = useCallback(async () => {
    console.log('🔄 useClientProfileAutoFallback: Fazendo refresh');
    await loadProfile();
  }, [loadProfile]);

  // Efeito inicial
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Valores computados
  const isDirty = originalData ? 
    JSON.stringify(profileData) !== JSON.stringify(originalData) : 
    false;

  const isNewProfile = !originalData;
  
  const completionPercentage = profileData ? 
    calculateProfileCompletion(profileData.profile_data) : 
    0;

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
    isOfflineMode,

    // Utilitários
    calculateProfileCompletion
  };
}

export default useClientProfileAutoFallback;