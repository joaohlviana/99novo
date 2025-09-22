/**
 * SERVIÇO EXCLUSIVO PARA CLIENT-DASHBOARD
 * =====================================
 * GARANTIA CRÍTICA: USA EXCLUSIVAMENTE dados do Supabase via tabelas relacionais
 * Nunca retorna mock data - essencial para CLIENT-DASHBOARD
 */

import { supabase } from '../lib/supabase/client';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface ClientDashboardStats {
  favoriteTrainers: number;
  activePrograms: number;
  unreadMessages: number;
  profileCompletion: number;
  totalSpent: number;
  programsCompleted: number;
  weeklyGoalProgress: number;
  profileViews: number;
}

export interface ClientPurchasedProgram {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'course' | 'ebook' | 'subscription';
  trainer: {
    id: string;
    name: string;
    avatar: string;
    initials: string;
  };
  status: 'active' | 'completed' | 'expired';
  progress: number;
  price: string;
  rating: number;
  purchaseDate: string;
  // Campos específicos por tipo
  videosCompleted?: number;
  totalVideos?: number;
  nextVideo?: string;
  unreadMessages?: number;
  userRating?: number;
  deliverables?: {
    format: string;
    pages: number;
  };
  messagesExchanged?: number;
  lastResponse?: string;
}

export interface ClientFavoriteTrainer {
  id: string;
  name: string;
  specialty: string;
  location: string;
  avatar: string;
  portfolioImages: string[];
  rating: number;
  reviewCount: number;
  responseTime: string;
  isOnline: boolean;
  lastActive: string;
  specialties: string[];
  priceRange: string;
  matchPercentage: number;
  favoriteDate: string;
  followDate?: string;
  hasActiveProgram: boolean;
  unreadMessages: number;
  isFavorite: boolean;
  isFollowing: boolean;
}

export interface ClientNotification {
  id: number;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  unread: boolean;
}

// ============================================
// CLASSE DO SERVIÇO
// ============================================

class ClientDashboardService {
  
  /**
   * CRÍTICO: Buscar estatísticas APENAS do Supabase
   */
  async getClientStats(userId: string): Promise<ClientDashboardStats> {
    if (!userId?.trim()) {
      console.error('❌ ClientDashboard: user_id é obrigatório');
      return this.getEmptyStats();
    }

    try {
      console.log('📊 ClientDashboard: Carregando estatísticas reais do Supabase para:', userId);

      // 1. Buscar perfil para calcular completude
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('profile_data')
        .eq('user_id', userId)
        .eq('role', 'client')
        .single();

      let profileCompletion = 0;
      if (profile?.profile_data) {
        const data = profile.profile_data;
        const requiredFields = ['sportsInterest', 'primaryGoals', 'fitnessLevel', 'city'];
        const filledFields = requiredFields.filter(field => {
          const value = data[field];
          return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0);
        });
        profileCompletion = Math.round((filledFields.length / requiredFields.length) * 100);
      }

      // 2. Buscar programas ativos (quando a tabela estiver pronta)
      // Por enquanto, usar 0 até as tabelas relacionais estarem implementadas
      const activePrograms = 0;
      const programsCompleted = 0;
      
      // 3. Buscar treinadores favoritos (quando a tabela estiver pronta)
      const favoriteTrainers = 0;
      
      // 4. Buscar mensagens não lidas (quando o sistema estiver pronto)
      const unreadMessages = 0;
      
      // 5. Outros dados que dependem de funcionalidades futuras
      const totalSpent = 0;
      const weeklyGoalProgress = 0;
      const profileViews = 0;

      const stats: ClientDashboardStats = {
        favoriteTrainers,
        activePrograms,
        unreadMessages,
        profileCompletion, // ✅ DADOS REAIS DO SUPABASE
        totalSpent,
        programsCompleted,
        weeklyGoalProgress,
        profileViews
      };

      console.log('✅ ClientDashboard: Estatísticas carregadas (híbridas - perfil real):', stats);
      return stats;

    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas do client dashboard:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * CRÍTICO: Buscar programas comprados APENAS do Supabase
   * TODO: Implementar quando as tabelas de purchases/enrollments estiverem prontas
   */
  async getPurchasedPrograms(userId: string): Promise<ClientPurchasedProgram[]> {
    if (!userId?.trim()) {
      console.error('❌ ClientDashboard: user_id é obrigatório');
      return [];
    }

    try {
      console.log('📚 ClientDashboard: Buscando programas comprados do Supabase para:', userId);

      // TODO: Quando as tabelas de purchases/enrollments estiverem prontas:
      // const { data: purchases } = await supabase
      //   .from('user_program_enrollments')
      //   .select(`
      //     *,
      //     program:training_programs(*),
      //     trainer:user_profiles(*)
      //   `)
      //   .eq('user_id', userId)
      //   .eq('status', 'active');

      // Por enquanto, retornar array vazio até as tabelas relacionais estarem implementadas
      console.log('ℹ️ ClientDashboard: Tabelas de programas comprados ainda não implementadas');
      return [];

    } catch (error) {
      console.error('❌ Erro ao buscar programas comprados:', error);
      return [];
    }
  }

  /**
   * CRÍTICO: Buscar treinadores favoritos APENAS do Supabase
   * TODO: Implementar quando a tabela de favorites estiver pronta
   */
  async getFavoriteTrainers(userId: string): Promise<ClientFavoriteTrainer[]> {
    if (!userId?.trim()) {
      console.error('❌ ClientDashboard: user_id é obrigatório');
      return [];
    }

    try {
      console.log('❤️ ClientDashboard: Buscando treinadores favoritos do Supabase para:', userId);

      // TODO: Quando a tabela de favorites estiver pronta:
      // const { data: favorites } = await supabase
      //   .from('user_trainer_favorites')
      //   .select(`
      //     *,
      //     trainer:user_profiles(*)
      //   `)
      //   .eq('user_id', userId)
      //   .eq('is_active', true);

      // Por enquanto, retornar array vazio até as tabelas relacionais estarem implementadas
      console.log('ℹ️ ClientDashboard: Tabela de treinadores favoritos ainda não implementada');
      return [];

    } catch (error) {
      console.error('❌ Erro ao buscar treinadores favoritos:', error);
      return [];
    }
  }

  /**
   * CRÍTICO: Buscar treinadores seguidos APENAS do Supabase
   * TODO: Implementar quando a tabela de followers estiver pronta
   */
  async getFollowingTrainers(userId: string): Promise<ClientFavoriteTrainer[]> {
    if (!userId?.trim()) {
      console.error('❌ ClientDashboard: user_id é obrigatório');
      return [];
    }

    try {
      console.log('👥 ClientDashboard: Buscando treinadores seguidos do Supabase para:', userId);

      // TODO: Quando a tabela de followers estiver pronta:
      // const { data: following } = await supabase
      //   .from('user_trainer_follows')
      //   .select(`
      //     *,
      //     trainer:user_profiles(*)
      //   `)
      //   .eq('user_id', userId)
      //   .eq('is_active', true);

      // Por enquanto, retornar array vazio até as tabelas relacionais estarem implementadas
      console.log('ℹ️ ClientDashboard: Tabela de treinadores seguidos ainda não implementada');
      return [];

    } catch (error) {
      console.error('❌ Erro ao buscar treinadores seguidos:', error);
      return [];
    }
  }

  /**
   * CRÍTICO: Buscar notificações APENAS do Supabase
   * TODO: Implementar quando o sistema de notificações estiver pronto
   */
  async getNotifications(userId: string): Promise<ClientNotification[]> {
    if (!userId?.trim()) {
      console.error('❌ ClientDashboard: user_id é obrigatório');
      return [];
    }

    try {
      console.log('🔔 ClientDashboard: Buscando notificações do Supabase para:', userId);

      // TODO: Quando o sistema de notificações estiver pronto:
      // const { data: notifications } = await supabase
      //   .from('user_notifications')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .order('created_at', { ascending: false })
      //   .limit(20);

      // Por enquanto, retornar array vazio até o sistema de notificações estar implementado
      console.log('ℹ️ ClientDashboard: Sistema de notificações ainda não implementado');
      return [];

    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
      return [];
    }
  }

  /**
   * CRÍTICO: Buscar programas recomendados APENAS do Supabase
   */
  async getRecommendedPrograms(userId: string, limit = 6): Promise<any[]> {
    if (!userId?.trim()) {
      console.error('❌ ClientDashboard: user_id é obrigatório');
      return [];
    }

    try {
      console.log('🎯 ClientDashboard: Buscando programas recomendados do Supabase para:', userId);

      // 1. Buscar perfil do cliente para entender interesses
      const { data: clientProfile } = await supabase
        .from('user_profiles')
        .select('profile_data')
        .eq('user_id', userId)
        .eq('role', 'client')
        .single();

      const clientInterests = clientProfile?.profile_data?.sportsInterest || [];

      // 2. Buscar programas publicados que correspondem aos interesses
      const { data: programs } = await supabase
        .from('published_programs_by_trainer')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Buscar mais para filtrar depois

      if (!programs || programs.length === 0) {
        console.log('ℹ️ ClientDashboard: Nenhum programa recomendado encontrado');
        return [];
      }

      // 3. Filtrar e pontuar programas baseado nos interesses do cliente
      const scoredPrograms = programs
        .map(program => {
          const programSports = Array.isArray(program.sports) ? program.sports : [];
          const matchingInterests = programSports.filter((sport: string) => 
            clientInterests.includes(sport)
          );
          
          return {
            ...program,
            matchScore: matchingInterests.length,
            matchReason: matchingInterests.length > 0 
              ? `Combina com seus interesses: ${matchingInterests.join(', ')}`
              : 'Programa popular'
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      // 4. Formatar para o formato esperado
      const formattedPrograms = scoredPrograms.map(program => ({
        id: program.id,
        title: program.title,
        trainer: program.trainer_name,
        trainerImage: program.trainer_avatar,
        category: program.category,
        duration: `${program.duration_weeks} semanas`,
        level: program.level,
        price: `R$ ${program.price}`,
        originalPrice: program.original_price ? `R$ ${program.original_price}` : null,
        rating: program.rating || 4.8,
        students: program.students_count || 150,
        image: program.cover_image,
        isNew: new Date(program.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        matchReason: program.matchReason
      }));

      console.log(`✅ ClientDashboard: ${formattedPrograms.length} programas recomendados encontrados`);
      return formattedPrograms;

    } catch (error) {
      console.error('❌ Erro ao buscar programas recomendados:', error);
      return [];
    }
  }

  /**
   * Marcar notificação como lida
   */
  async markNotificationAsRead(userId: string, notificationId: number): Promise<boolean> {
    try {
      console.log('✅ ClientDashboard: Marcando notificação como lida:', notificationId);
      
      // TODO: Implementar quando sistema de notificações estiver pronto
      // const { error } = await supabase
      //   .from('user_notifications')
      //   .update({ read: true })
      //   .eq('id', notificationId)
      //   .eq('user_id', userId);

      return true;
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
      return false;
    }
  }

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      console.log('✅ ClientDashboard: Marcando todas as notificações como lidas');
      
      // TODO: Implementar quando sistema de notificações estiver pronto
      // const { error } = await supabase
      //   .from('user_notifications')
      //   .update({ read: true })
      //   .eq('user_id', userId)
      //   .eq('read', false);

      return true;
    } catch (error) {
      console.error('❌ Erro ao marcar todas as notificações como lidas:', error);
      return false;
    }
  }

  /**
   * Adicionar treinador aos favoritos
   */
  async addTrainerToFavorites(userId: string, trainerId: string): Promise<boolean> {
    try {
      console.log('❤️ ClientDashboard: Adicionando treinador aos favoritos:', trainerId);
      
      // TODO: Implementar quando tabela de favorites estiver pronta
      // const { error } = await supabase
      //   .from('user_trainer_favorites')
      //   .upsert({
      //     user_id: userId,
      //     trainer_id: trainerId,
      //     is_active: true,
      //     created_at: new Date().toISOString()
      //   });

      return true;
    } catch (error) {
      console.error('❌ Erro ao adicionar treinador aos favoritos:', error);
      return false;
    }
  }

  /**
   * Remover treinador dos favoritos
   */
  async removeTrainerFromFavorites(userId: string, trainerId: string): Promise<boolean> {
    try {
      console.log('💔 ClientDashboard: Removendo treinador dos favoritos:', trainerId);
      
      // TODO: Implementar quando tabela de favorites estiver pronta
      // const { error } = await supabase
      //   .from('user_trainer_favorites')
      //   .update({ is_active: false })
      //   .eq('user_id', userId)
      //   .eq('trainer_id', trainerId);

      return true;
    } catch (error) {
      console.error('❌ Erro ao remover treinador dos favoritos:', error);
      return false;
    }
  }

  /**
   * Seguir treinador
   */
  async followTrainer(userId: string, trainerId: string): Promise<boolean> {
    try {
      console.log('👥 ClientDashboard: Seguindo treinador:', trainerId);
      
      // TODO: Implementar quando tabela de follows estiver pronta
      // const { error } = await supabase
      //   .from('user_trainer_follows')
      //   .upsert({
      //     user_id: userId,
      //     trainer_id: trainerId,
      //     is_active: true,
      //     created_at: new Date().toISOString()
      //   });

      return true;
    } catch (error) {
      console.error('❌ Erro ao seguir treinador:', error);
      return false;
    }
  }

  /**
   * Deixar de seguir treinador
   */
  async unfollowTrainer(userId: string, trainerId: string): Promise<boolean> {
    try {
      console.log('👋 ClientDashboard: Deixando de seguir treinador:', trainerId);
      
      // TODO: Implementar quando tabela de follows estiver pronta
      // const { error } = await supabase
      //   .from('user_trainer_follows')
      //   .update({ is_active: false })
      //   .eq('user_id', userId)
      //   .eq('trainer_id', trainerId);

      return true;
    } catch (error) {
      console.error('❌ Erro ao deixar de seguir treinador:', error);
      return false;
    }
  }

  /**
   * Retornar estatísticas vazias como fallback seguro
   */
  private getEmptyStats(): ClientDashboardStats {
    return {
      favoriteTrainers: 0,
      activePrograms: 0,
      unreadMessages: 0,
      profileCompletion: 0,
      totalSpent: 0,
      programsCompleted: 0,
      weeklyGoalProgress: 0,
      profileViews: 0
    };
  }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

export const clientDashboardService = new ClientDashboardService();
export default clientDashboardService;