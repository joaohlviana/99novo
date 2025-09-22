/**
 * 👤 USER PROFILE HOOK
 * 
 * Hook para buscar dados do perfil do usuário da tabela user_profiles
 * Baseado no padrão do useTrainerProfileHybrid.ts
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface UserProfile {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // BUSCAR PERFIL DO USUÁRIO
  // ============================================

  const fetchUserProfile = async (userId: string) => {
    if (!userId) {
      console.log('⚠️ useUserProfile: userId não fornecido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 useUserProfile: Buscando perfil para user_id:', userId);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado
          console.log('ℹ️ Nenhum perfil encontrado na tabela user_profiles para:', userId);
          setProfile(null);
          return;
        }
        throw error;
      }

      console.log('✅ Perfil encontrado na user_profiles:', data?.name || data?.email || 'Sem nome');
      setProfile(data as UserProfile);

    } catch (error: any) {
      console.error('❌ Erro ao buscar perfil user_profiles:', error);
      setError(error.message || 'Erro ao buscar perfil do usuário');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CARREGAR PERFIL AUTOMATICAMENTE
  // ============================================

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile(user.id);
    } else {
      setProfile(null);
      setLoading(false);
      setError(null);
    }
  }, [user?.id]);

  // ============================================
  // REFRESH MANUAL
  // ============================================

  const refresh = () => {
    if (user?.id) {
      fetchUserProfile(user.id);
    }
  };

  // ============================================
  // DADOS CONSOLIDADOS
  // ============================================

  const getAvatarUrl = () => {
    return profile?.avatar_url || user?.user_metadata?.avatar_url || user?.avatar_url || null;
  };

  const getName = () => {
    return profile?.name || user?.user_metadata?.name || user?.name || user?.email?.split('@')[0] || 'Usuário';
  };

  const getInitials = () => {
    const name = getName();
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // ============================================
  // RETORNO DO HOOK
  // ============================================

  return {
    // Estado
    profile,
    loading,
    error,
    
    // Ações
    refresh,
    fetchUserProfile,
    
    // Dados consolidados
    avatarUrl: getAvatarUrl(),
    name: getName(),
    initials: getInitials(),
    
    // Flags de estado
    hasProfile: !!profile,
    isReady: !loading && user?.id,
  };
}

export default useUserProfile;