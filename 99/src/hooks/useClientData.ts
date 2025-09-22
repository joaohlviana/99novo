import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clientDashboardService, ClientDashboardStats } from '../services/client-dashboard.service';

export interface ClientStats {
  favoriteTrainers: number;
  activePrograms: number;
  unreadMessages: number;
  profileCompletion: number;
  totalSpent: number;
  programsCompleted: number;
  weeklyGoalProgress: number;
  profileViews: number;
}

export function useClientData() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStats>({
    favoriteTrainers: 0,
    activePrograms: 0,
    unreadMessages: 0,
    profileCompletion: 0,
    totalSpent: 0,
    programsCompleted: 0,
    weeklyGoalProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📊 [useClientData] Carregando estatísticas usando clientDashboardService');

      // ✅ USAR EXCLUSIVAMENTE O SERVIÇO SUPABASE - NUNCA MOCK DATA
      const dashboardStats: ClientDashboardStats = await clientDashboardService.getClientStats(user.id);

      const clientStats: ClientStats = {
        favoriteTrainers: dashboardStats.favoriteTrainers,
        activePrograms: dashboardStats.activePrograms,
        unreadMessages: dashboardStats.unreadMessages,
        profileCompletion: dashboardStats.profileCompletion, // ✅ Dados reais do Supabase
        totalSpent: dashboardStats.totalSpent,
        programsCompleted: dashboardStats.programsCompleted,
        weeklyGoalProgress: dashboardStats.weeklyGoalProgress,
        profileViews: dashboardStats.profileViews
      };

      setStats(clientStats);
      console.log('✅ [useClientData] Estatísticas carregadas do Supabase via service:', clientStats);

    } catch (error: any) {
      console.error('❌ [useClientData] Erro ao carregar estatísticas:', error);
      setError('Erro ao carregar dados do dashboard');
      
      // Fallback para dados vazios em caso de erro
      setStats({
        favoriteTrainers: 0,
        activePrograms: 0,
        unreadMessages: 0,
        profileCompletion: 0,
        totalSpent: 0,
        programsCompleted: 0,
        weeklyGoalProgress: 0,
        profileViews: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}