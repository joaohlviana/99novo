/**
 * HOOK PARA PROGRAMAS COMPRADOS DO CLIENTE
 * =======================================
 * GARANTIA CRÍTICA: USA EXCLUSIVAMENTE dados do Supabase via tabelas relacionais
 * Nunca retorna mock data - essencial para CLIENT-DASHBOARD
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clientDashboardService, ClientPurchasedProgram } from '../services/client-dashboard.service';

export function useClientPurchasedPrograms() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<ClientPurchasedProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = async () => {
    if (!user?.id) {
      console.log('ℹ️ [useClientPurchasedPrograms] Usuário não logado');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📚 [useClientPurchasedPrograms] Carregando programas comprados via Supabase service');

      // ✅ USAR EXCLUSIVAMENTE O SERVIÇO SUPABASE - NUNCA MOCK DATA
      const purchasedPrograms = await clientDashboardService.getPurchasedPrograms(user.id);

      setPrograms(purchasedPrograms);
      console.log(`✅ [useClientPurchasedPrograms] ${purchasedPrograms.length} programas carregados do Supabase`);

    } catch (error: any) {
      console.error('❌ [useClientPurchasedPrograms] Erro ao carregar programas:', error);
      setError('Erro ao carregar programas comprados');
      setPrograms([]); // Array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [user?.id]);

  return {
    programs,
    loading,
    error,
    refetch: fetchPrograms
  };
}