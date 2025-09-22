import { useState, useEffect } from 'react';
import { clientProfileResilientService } from '../services/client-profile-resilient.service';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

export interface ClientStats {
  favoriteTrainers: number;
  activePrograms: number;
  unreadMessages: number;
  profileCompletion: number;
  totalSpent: number;
  programsCompleted: number;
}

export function useClientDataFixed() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStats>({
    favoriteTrainers: 0,
    activePrograms: 0,
    unreadMessages: 0,
    profileCompletion: 0,
    totalSpent: 0,
    programsCompleted: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientStats = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📊 Carregando estatísticas do cliente (modo resiliente):', user.id);

      // Buscar perfil usando serviço resiliente
      const profile = await clientProfileResilientService.getByUserId(user.id);
      
      let profileCompletion = 0;
      if (profile?.profile_data) {
        profileCompletion = clientProfileResilientService.calculateProfileCompletion(profile.profile_data);
      }

      // Estatísticas fixas por enquanto (até tabelas estarem funcionando)
      const newStats: ClientStats = {
        favoriteTrainers: 0, // TODO: implementar quando tabelas estiverem funcionando
        activePrograms: 0, // TODO: implementar quando tabelas estiverem funcionando
        unreadMessages: 0, // TODO: implementar sistema de mensagens
        profileCompletion,
        totalSpent: 0, // TODO: implementar sistema de pagamentos
        programsCompleted: 0 // TODO: implementar quando tabelas estiverem funcionando
      };

      setStats(newStats);
      console.log('✅ Estatísticas carregadas (modo resiliente):', newStats);

      // Verificar conectividade
      const connectivity = await clientProfileResilientService.getConnectivityStatus();
      console.log('📡 Status de conectividade:', connectivity);

      if (!connectivity.isConnected) {
        console.log('⚠️ Sistema funcionando em modo offline');
        toast.info('Funcionando em modo offline - dados locais sendo utilizados');
      }

    } catch (error: any) {
      console.error('❌ Erro ao carregar estatísticas (modo resiliente):', error);
      setError('Erro ao carregar dados do dashboard');
      
      // Não mostrar toast de erro para manter UX fluida
      console.log('🔧 Continuando com dados padrão para manter funcionalidade');
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientStats();
  }, [user?.id]);

  return {
    stats,
    loading,
    error,
    refetch: fetchClientStats
  };
}