/**
 * HOOK PARA PERFIL DO CLIENTE HÍBRIDO
 * ====================================
 * Hook para gerenciar perfis de clientes usando tabela híbrida
 * Baseado no padrão do useTrainerProfileHybrid.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase/client';
import { toast } from 'sonner@2.0.3';

// ============================================
// TIPOS LOCAIS PARA O HOOK
// ============================================

interface ClientProfileData {
  // Esportes
  sportsInterest?: string[];
  sportsTrained?: string[];
  sportsCurious?: string[];
  
  // Objetivos
  primaryGoals?: string[];
  secondaryGoals?: string[];
  searchTags?: string[];
  
  // Fitness
  fitnessLevel?: string;
  experience?: string;
  frequency?: string;
  budget?: string;
  
  // Localização
  city?: string;
  state?: string;
  region?: string;
  willingToTravel?: boolean;
  maxDistanceKm?: number;
  
  // Preferências
  trainingTime?: string[];
  trainingDuration?: string;
  modality?: string[];
  trainerGender?: string;
  groupOrIndividual?: string;
  
  // Saúde
  medicalConditions?: string;
  injuries?: string[];
  limitations?: string[];
  doctorClearance?: boolean;
  
  // Pessoal
  ageRange?: string;
  gender?: string;
  occupation?: string;
  lifestyle?: string;
  motivation?: string;
  
  // Disponibilidade
  daysOfWeek?: string[];
  timePeriods?: string[];
  flexibleSchedule?: boolean;
  
  // Biografia
  bio?: string;
  phone?: string;
  
  // Metas específicas
  weightGoal?: string;
  timeline?: string;
  priorityAreas?: string[];
  specificTargets?: string[];
  
  // Metadata
  completionPercentage?: number;
  lastUpdated?: string;
  onboardingCompleted?: boolean;
}

interface ClientProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'draft' | 'active' | 'inactive' | 'suspended';
  is_active: boolean;
  is_verified: boolean;
  profile_data: ClientProfileData;
  created_at: string;
  updated_at: string;
}

// ============================================
// TIPOS DO HOOK
// ============================================

interface UseClientProfileReturn {
  // Estado dos dados
  profileData: ClientProfile | null;
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

  // Utilitários
  calculateProfileCompletion: (data: ClientProfileData) => number;
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useClientProfileHybrid(): UseClientProfileReturn {
  const { user, isAuthenticated } = useAuth();
  
  // Estados
  const [profileData, setProfileData] = useState<ClientProfile | null>(null);
  const [originalData, setOriginalData] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================

  const calculateProfileCompletion = useCallback((data: ClientProfileData): number => {
    const requiredFields = ['sportsInterest', 'primaryGoals', 'fitnessLevel', 'city'];
    const filledFields = requiredFields.filter(field => {
      const value = data[field as keyof ClientProfileData];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0);
    });
    return Math.round((filledFields.length / requiredFields.length) * 100);
  }, []);

  // ============================================
  // CARREGAR DADOS INICIAIS
  // ============================================

  const loadProfile = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      console.log('👤 useClientProfileHybrid: Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 useClientProfileHybrid: Carregando perfil para user:', user.id);

      // Buscar perfil existente
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'client')
        .single();

      if (profile) {
        console.log('✅ Perfil encontrado:', profile.name || 'Sem nome');
        setProfileData(profile);
        setOriginalData(profile);
      } else {
        console.log('➕ Nenhum perfil encontrado - criando estrutura inicial');
        
        // Criar estrutura inicial baseada nos dados do usuário
        const initialProfile: ClientProfile = {
          id: '', // Será gerado no servidor
          user_id: user.id,
          name: user.name || '',
          email: user.email || '',
          phone: '',
          status: 'draft',
          is_active: true,
          is_verified: false,
          profile_data: {
            // Esportes
            sportsInterest: [],
            sportsTrained: [],
            sportsCurious: [],
            
            // Objetivos
            primaryGoals: [],
            secondaryGoals: [],
            searchTags: [],
            
            // Fitness
            fitnessLevel: '',
            experience: '',
            frequency: '',
            budget: '',
            
            // Localização
            city: '',
            state: '',
            region: '',
            willingToTravel: false,
            maxDistanceKm: 0,
            
            // Preferências
            trainingTime: [],
            trainingDuration: '',
            modality: [],
            trainerGender: '',
            groupOrIndividual: '',
            
            // Saúde
            medicalConditions: '',
            injuries: [],
            limitations: [],
            doctorClearance: false,
            
            // Pessoal
            ageRange: '',
            gender: '',
            occupation: '',
            lifestyle: '',
            motivation: '',
            
            // Disponibilidade
            daysOfWeek: [],
            timePeriods: [],
            flexibleSchedule: false,
            
            // Biografia
            bio: '',
            phone: '',
            
            // Metas específicas
            weightGoal: '',
            timeline: '',
            priorityAreas: [],
            specificTargets: [],
            
            // Metadata
            completionPercentage: 0,
            lastUpdated: new Date().toISOString(),
            onboardingCompleted: false
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setProfileData(initialProfile);
        setOriginalData(null); // Marca como novo perfil
      }

    } catch (err) {
      console.error('❌ Erro ao carregar perfil:', err);
      setError(err.message || 'Erro ao carregar perfil');
      toast.error('Erro ao carregar perfil do cliente');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.name, user?.email, isAuthenticated]);

  // ============================================
  // ATUALIZAR DADOS
  // ============================================

  const updateProfileData = useCallback((newData: Partial<ClientProfileData>) => {
    if (!profileData) return;

    console.log('📝 useClientProfileHybrid: Atualizando dados locais (padrão trainer)');

    // ✅ LÓGICA SIMPLIFICADA (mesmo padrão do trainer)
    const updatedProfileData = {
      ...profileData.profile_data,
      ...newData,
      lastUpdated: new Date().toISOString()
    };

    const updatedProfile: ClientProfile = {
      ...profileData,
      profile_data: updatedProfileData,
      updated_at: new Date().toISOString()
    };

    // ✅ CAMPOS ESTRUTURADOS (mesmo padrão do trainer)
    if (newData.phone !== undefined) {
      updatedProfile.phone = newData.phone;
    }
    if (newData.name !== undefined) {
      updatedProfile.name = newData.name;
    }
    if (newData.email !== undefined) {
      updatedProfile.email = newData.email;
    }

    setProfileData(updatedProfile);
  }, [profileData]);

  // ============================================
  // SALVAR PERFIL
  // ============================================

  const saveProfile = useCallback(async (additionalData?: Partial<ClientProfileData>) => {
    if (!user?.id || !profileData) {
      toast.error('Dados insuficientes para salvar');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      console.log('💾 useClientProfileHybrid: Salvando perfil');

      // Combinar dados atuais com dados adicionais
      const dataToSave: ClientProfileData = {
        ...profileData.profile_data,
        ...additionalData,
        lastUpdated: new Date().toISOString()
      };

      // Calcular completude
      const completion = calculateProfileCompletion(dataToSave);
      dataToSave.completionPercentage = completion;

      let savedProfile: ClientProfile;

      // Usar upsert para criar ou atualizar
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          role: 'client',
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          profile_data: dataToSave,
          is_active: true,
          status: 'draft',
          updated_at: new Date().toISOString()
        }, {
          onConflict: ['user_id', 'role']
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      savedProfile = data as ClientProfile;
      console.log(originalData ? '✅ Perfil atualizado com sucesso' : '✅ Perfil criado com sucesso');
      toast.success(originalData ? 'Perfil atualizado com sucesso!' : 'Perfil criado com sucesso!');

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
  }, [user?.id, profileData, originalData, calculateProfileCompletion]);

  // ============================================
  // RESETAR DADOS
  // ============================================

  const reset = useCallback(() => {
    console.log('🔄 useClientProfileHybrid: Resetando dados');
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
    console.log('🔄 useClientProfileHybrid: Fazendo refresh');
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
    false;

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
// HOOK PARA BUSCAR OUTROS CLIENTES
// ============================================

export function useClientSearch() {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchClients = useCallback(async (filters: {
    city?: string;
    fitnessLevel?: string;
    interests?: string[];
    limit?: number;
    offset?: number;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'client')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(filters.limit || 20);

      if (filters.city) {
        query = query.eq('profile_data->>city', filters.city);
      }
      if (filters.fitnessLevel) {
        query = query.eq('profile_data->>fitnessLevel', filters.fitnessLevel);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setClients(data as ClientProfile[] || []);

    } catch (err: any) {
      console.error('❌ Erro na busca de clientes:', err);
      setError(err.message || 'Erro na busca');
    } finally {
      setLoading(false);
    }
  }, []);

  const findCompatibleClients = useCallback(async (
    trainerSpecialties: string[],
    trainerCity?: string,
    limit = 10
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'client')
        .eq('is_active', true)
        .limit(limit);

      if (error) throw error;
      
      return data || [];

    } catch (err: any) {
      console.error('❌ Erro na busca de compatibilidade:', err);
      setError(err.message || 'Erro na busca de compatibilidade');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    clients,
    loading,
    error,
    searchClients,
    findCompatibleClients
  };
}

export default useClientProfileHybrid;