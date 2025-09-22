/**
 * HOOK PARA NOTIFICAÇÕES DO CLIENTE
 * ================================
 * GARANTIA CRÍTICA: USA EXCLUSIVAMENTE dados do Supabase via tabelas relacionais
 * Nunca retorna mock data - essencial para CLIENT-DASHBOARD
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clientDashboardService, ClientNotification } from '../services/client-dashboard.service';

export function useClientNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!user?.id) {
      console.log('ℹ️ [useClientNotifications] Usuário não logado');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔔 [useClientNotifications] Carregando notificações via Supabase service');

      // ✅ USAR EXCLUSIVAMENTE O SERVIÇO SUPABASE - NUNCA MOCK DATA
      const clientNotifications = await clientDashboardService.getNotifications(user.id);

      setNotifications(clientNotifications);
      console.log(`✅ [useClientNotifications] ${clientNotifications.length} notificações carregadas do Supabase`);

    } catch (error: any) {
      console.error('❌ [useClientNotifications] Erro ao carregar notificações:', error);
      setError('Erro ao carregar notificações');
      setNotifications([]); // Array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const success = await clientDashboardService.markNotificationAsRead(user.id, notificationId);
      if (success) {
        // Atualizar estado local
        setNotifications(prev => 
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, unread: false }
              : notification
          )
        );
      }
      return success;
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
      return false;
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const success = await clientDashboardService.markAllNotificationsAsRead(user.id);
      if (success) {
        // Atualizar estado local
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, unread: false }))
        );
      }
      return success;
    } catch (error) {
      console.error('❌ Erro ao marcar todas as notificações como lidas:', error);
      return false;
    }
  };

  const getUnreadCount = (): number => {
    return notifications.filter(n => n.unread).length;
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  return {
    notifications,
    loading,
    error,
    unreadCount: getUnreadCount(),
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}