/**
 * HOOK PARA TREINADORES FAVORITOS E SEGUIDOS DO CLIENTE
 * ====================================================
 * GARANTIA CRÍTICA: USA EXCLUSIVAMENTE dados do Supabase via tabelas relacionais
 * Nunca retorna mock data - essencial para CLIENT-DASHBOARD
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clientDashboardService, ClientFavoriteTrainer } from '../services/client-dashboard.service';

export function useClientFavoriteTrainers() {
  const { user } = useAuth();
  const [favoriteTrainers, setFavoriteTrainers] = useState<ClientFavoriteTrainer[]>([]);
  const [followingTrainers, setFollowingTrainers] = useState<ClientFavoriteTrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainers = async () => {
    if (!user?.id) {
      console.log('ℹ️ [useClientFavoriteTrainers] Usuário não logado');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('❤️ [useClientFavoriteTrainers] Carregando treinadores via Supabase service');

      // ✅ USAR EXCLUSIVAMENTE O SERVIÇO SUPABASE - NUNCA MOCK DATA
      const [favorites, following] = await Promise.all([
        clientDashboardService.getFavoriteTrainers(user.id),
        clientDashboardService.getFollowingTrainers(user.id)
      ]);

      setFavoriteTrainers(favorites);
      setFollowingTrainers(following);
      
      console.log(`✅ [useClientFavoriteTrainers] Carregados ${favorites.length} favoritos e ${following.length} seguindo do Supabase`);

    } catch (error: any) {
      console.error('❌ [useClientFavoriteTrainers] Erro ao carregar treinadores:', error);
      setError('Erro ao carregar treinadores');
      setFavoriteTrainers([]);
      setFollowingTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (trainerId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const success = await clientDashboardService.addTrainerToFavorites(user.id, trainerId);
      if (success) {
        // Atualizar estado local otimisticamente ou refetch
        await fetchTrainers();
      }
      return success;
    } catch (error) {
      console.error('❌ Erro ao adicionar aos favoritos:', error);
      return false;
    }
  };

  const removeFromFavorites = async (trainerId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const success = await clientDashboardService.removeTrainerFromFavorites(user.id, trainerId);
      if (success) {
        // Atualizar estado local otimisticamente ou refetch
        await fetchTrainers();
      }
      return success;
    } catch (error) {
      console.error('❌ Erro ao remover dos favoritos:', error);
      return false;
    }
  };

  const followTrainer = async (trainerId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const success = await clientDashboardService.followTrainer(user.id, trainerId);
      if (success) {
        // Atualizar estado local otimisticamente ou refetch
        await fetchTrainers();
      }
      return success;
    } catch (error) {
      console.error('❌ Erro ao seguir treinador:', error);
      return false;
    }
  };

  const unfollowTrainer = async (trainerId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const success = await clientDashboardService.unfollowTrainer(user.id, trainerId);
      if (success) {
        // Atualizar estado local otimisticamente ou refetch
        await fetchTrainers();
      }
      return success;
    } catch (error) {
      console.error('❌ Erro ao deixar de seguir treinador:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [user?.id]);

  return {
    favoriteTrainers,
    followingTrainers,
    loading,
    error,
    refetch: fetchTrainers,
    addToFavorites,
    removeFromFavorites,
    followTrainer,
    unfollowTrainer
  };
}