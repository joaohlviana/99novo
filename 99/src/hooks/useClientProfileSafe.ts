/**
 * HOOK SEGURO PARA PERFIL DO CLIENTE
 * ==================================
 * Versão simplificada que funciona mesmo com problemas de permissão
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

// Tipos simplificados
interface SafeClientProfile {
  id?: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  sportsInterest?: string[];
  primaryGoals?: string[];
  fitnessLevel?: string;
  city?: string;
  state?: string;
  isNewProfile: boolean;
}

interface UseSafeClientProfileReturn {
  profileData: SafeClientProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isDirty: boolean;
  updateProfileData: (data: Partial<SafeClientProfile>) => void;
  saveProfile: () => Promise<void>;
  reset: () => void;
  completionPercentage: number;
}

export function useClientProfileSafe(): UseSafeClientProfileReturn {
  const { user, isAuthenticated } = useAuth();
  
  // Estados
  const [profileData, setProfileData] = useState<SafeClientProfile | null>(null);
  const [originalData, setOriginalData] = useState<SafeClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados locais ou criar perfil vazio
  const loadProfile = useCallback(() => {
    if (!user?.id || !isAuthenticated) {
      setLoading(false);
      return;
    }

    console.log('🔄 useClientProfileSafe: Criando perfil local para user:', user.id);
    
    // Criar estrutura local baseada nos dados do usuário
    const localProfile: SafeClientProfile = {
      user_id: user.id,
      name: user.name || '',
      email: user.email || '',
      phone: '',
      bio: '',
      sportsInterest: [],
      primaryGoals: [],
      fitnessLevel: '',
      city: '',
      state: '',
      isNewProfile: true
    };

    setProfileData(localProfile);
    setOriginalData(localProfile);
    setLoading(false);
    setError(null);
    
    console.log('✅ Perfil local criado com sucesso');
  }, [user?.id, user?.name, user?.email, isAuthenticated]);

  // Atualizar dados locais
  const updateProfileData = useCallback((newData: Partial<SafeClientProfile>) => {
    if (!profileData) return;

    console.log('📝 useClientProfileSafe: Atualizando dados locais');
    
    const updatedProfile = {
      ...profileData,
      ...newData
    };

    setProfileData(updatedProfile);
  }, [profileData]);

  // Salvar perfil (simulado)
  const saveProfile = useCallback(async () => {
    if (!user?.id || !profileData) {
      toast.error('Dados insuficientes para salvar');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      console.log('💾 useClientProfileSafe: Simulando salvamento...');

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Marcar como salvo
      const savedProfile = {
        ...profileData,
        isNewProfile: false
      };

      setProfileData(savedProfile);
      setOriginalData(savedProfile);
      
      toast.success('Perfil salvo localmente!');
      console.log('✅ Perfil salvo com sucesso (local)');

    } catch (err) {
      console.error('❌ Erro ao salvar perfil:', err);
      setError(err.message || 'Erro ao salvar perfil');
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  }, [user?.id, profileData]);

  // Reset
  const reset = useCallback(() => {
    console.log('🔄 useClientProfileSafe: Resetando dados');
    if (originalData) {
      setProfileData(originalData);
    } else {
      loadProfile();
    }
    setError(null);
  }, [originalData, loadProfile]);

  // Calcular completude
  const calculateCompletion = useCallback((data: SafeClientProfile): number => {
    if (!data) return 0;

    const fields = [
      data.name,
      data.email,
      data.bio,
      data.city,
      data.fitnessLevel,
      data.sportsInterest?.length > 0,
      data.primaryGoals?.length > 0
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, []);

  // Efeitos
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Valores computados
  const isDirty = originalData ? 
    JSON.stringify(profileData) !== JSON.stringify(originalData) : 
    false;

  const completionPercentage = profileData ? 
    calculateCompletion(profileData) : 
    0;

  return {
    profileData,
    loading,
    saving,
    error,
    isDirty,
    updateProfileData,
    saveProfile,
    reset,
    completionPercentage
  };
}

export default useClientProfileSafe;