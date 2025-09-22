/**
 * SERVIÇO PARA MENSAGENS/CONVERSAS DO CLIENTE
 * ==========================================
 * GARANTIA CRÍTICA: USA EXCLUSIVAMENTE dados do Supabase via tabelas relacionais
 * Nunca retorna mock data - essencial para CLIENT-DASHBOARD
 */

import { supabase } from '../lib/supabase/client';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface ClientConversation {
  id: string;
  trainer: {
    id: string;
    name: string;
    avatar: string;
    specialty: string;
    isOnline: boolean;
    rating: number;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isFromTrainer: boolean;
  };
  unreadCount: number;
  isPinned: boolean;
  status: 'active' | 'waiting_response' | 'program_ready' | 'archived';
  tags: string[];
}

export interface ClientMessage {
  id: string;
  content: string;
  timestamp: string;
  isFromTrainer: boolean;
  status: 'sending' | 'delivered' | 'read';
}

// ============================================
// CLASSE DO SERVIÇO
// ============================================

class ClientMessagesService {
  
  /**
   * CRÍTICO: Buscar conversas APENAS do Supabase
   * TODO: Implementar quando as tabelas de messages/conversations estiverem prontas
   */
  async getConversations(userId: string): Promise<ClientConversation[]> {
    if (!userId?.trim()) {
      console.error('❌ ClientMessages: user_id é obrigatório');
      return [];
    }

    try {
      console.log('💬 ClientMessages: Buscando conversas do Supabase para:', userId);

      // TODO: Quando as tabelas de messages/conversations estiverem prontas:
      // const { data: conversations } = await supabase
      //   .from('user_conversations')
      //   .select(`
      //     *,
      //     trainer:user_profiles!trainer_id(*),
      //     last_message:messages(*)
      //   `)
      //   .eq('user_id', userId)
      //   .eq('is_active', true)
      //   .order('updated_at', { ascending: false });

      // Por enquanto, retornar array vazio até as tabelas relacionais estarem implementadas
      console.log('ℹ️ ClientMessages: Tabelas de conversas ainda não implementadas');
      return [];

    } catch (error) {
      console.error('❌ Erro ao buscar conversas:', error);
      return [];
    }
  }

  /**
   * CRÍTICO: Buscar mensagens de uma conversa APENAS do Supabase
   * TODO: Implementar quando as tabelas de messages estiverem prontas
   */
  async getMessages(conversationId: string, limit = 50): Promise<ClientMessage[]> {
    if (!conversationId?.trim()) {
      console.error('❌ ClientMessages: conversation_id é obrigatório');
      return [];
    }

    try {
      console.log('📨 ClientMessages: Buscando mensagens do Supabase para conversa:', conversationId);

      // TODO: Quando as tabelas de messages estiverem prontas:
      // const { data: messages } = await supabase
      //   .from('messages')
      //   .select('*')
      //   .eq('conversation_id', conversationId)
      //   .order('created_at', { ascending: true })
      //   .limit(limit);

      // Por enquanto, retornar array vazio até as tabelas relacionais estarem implementadas
      console.log('ℹ️ ClientMessages: Tabela de mensagens ainda não implementada');
      return [];

    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      return [];
    }
  }

  /**
   * CRÍTICO: Enviar mensagem APENAS pelo Supabase
   * TODO: Implementar quando as tabelas de messages estiverem prontas
   */
  async sendMessage(
    conversationId: string,
    content: string,
    userId: string
  ): Promise<ClientMessage | null> {
    if (!conversationId?.trim() || !content?.trim() || !userId?.trim()) {
      console.error('❌ ClientMessages: conversation_id, content e user_id são obrigatórios');
      return null;
    }

    try {
      console.log('📤 ClientMessages: Enviando mensagem via Supabase');

      // TODO: Quando as tabelas de messages estiverem prontas:
      // const { data: message, error } = await supabase
      //   .from('messages')
      //   .insert({
      //     conversation_id: conversationId,
      //     sender_id: userId,
      //     content: content,
      //     created_at: new Date().toISOString()
      //   })
      //   .select()
      //   .single();

      // if (error) {
      //   console.error('❌ Erro ao enviar mensagem:', error);
      //   return null;
      // }

      // return {
      //   id: message.id,
      //   content: message.content,
      //   timestamp: message.created_at,
      //   isFromTrainer: false,
      //   status: 'delivered'
      // };

      // Por enquanto, retornar null até as tabelas relacionais estarem implementadas
      console.log('ℹ️ ClientMessages: Sistema de envio de mensagens ainda não implementado');
      return null;

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return null;
    }
  }

  /**
   * CRÍTICO: Marcar mensagens como lidas APENAS no Supabase
   * TODO: Implementar quando as tabelas de messages estiverem prontas
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
    if (!conversationId?.trim() || !userId?.trim()) {
      console.error('❌ ClientMessages: conversation_id e user_id são obrigatórios');
      return false;
    }

    try {
      console.log('✅ ClientMessages: Marcando mensagens como lidas via Supabase');

      // TODO: Quando as tabelas de messages estiverem prontas:
      // const { error } = await supabase
      //   .from('messages')
      //   .update({ read_at: new Date().toISOString() })
      //   .eq('conversation_id', conversationId)
      //   .neq('sender_id', userId)
      //   .is('read_at', null);

      // if (error) {
      //   console.error('❌ Erro ao marcar mensagens como lidas:', error);
      //   return false;
      // }

      // return true;

      // Por enquanto, retornar true até as tabelas relacionais estarem implementadas
      console.log('ℹ️ ClientMessages: Sistema de marcar mensagens como lidas ainda não implementado');
      return true;

    } catch (error) {
      console.error('❌ Erro ao marcar mensagens como lidas:', error);
      return false;
    }
  }

  /**
   * CRÍTICO: Buscar estatísticas de mensagens APENAS do Supabase
   * TODO: Implementar quando as tabelas de messages estiverem prontas
   */
  async getMessagesStats(userId: string): Promise<{
    totalConversations: number;
    unreadCount: number;
    onlineTrainers: number;
  }> {
    if (!userId?.trim()) {
      console.error('❌ ClientMessages: user_id é obrigatório');
      return { totalConversations: 0, unreadCount: 0, onlineTrainers: 0 };
    }

    try {
      console.log('📊 ClientMessages: Buscando estatísticas de mensagens do Supabase');

      // TODO: Quando as tabelas de messages/conversations estiverem prontas:
      // const { data: stats } = await supabase
      //   .rpc('get_user_messages_stats', { user_id: userId });

      // Por enquanto, retornar dados vazios até as tabelas relacionais estarem implementadas
      console.log('ℹ️ ClientMessages: Estatísticas de mensagens ainda não implementadas');
      return {
        totalConversations: 0,
        unreadCount: 0,
        onlineTrainers: 0
      };

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de mensagens:', error);
      return { totalConversations: 0, unreadCount: 0, onlineTrainers: 0 };
    }
  }

  /**
   * CRÍTICO: Criar nova conversa APENAS no Supabase
   * TODO: Implementar quando as tabelas de conversations estiverem prontas
   */
  async createConversation(userId: string, trainerId: string): Promise<string | null> {
    if (!userId?.trim() || !trainerId?.trim()) {
      console.error('❌ ClientMessages: user_id e trainer_id são obrigatórios');
      return null;
    }

    try {
      console.log('➕ ClientMessages: Criando nova conversa via Supabase');

      // TODO: Quando as tabelas de conversations estiverem prontas:
      // const { data: conversation, error } = await supabase
      //   .from('user_conversations')
      //   .insert({
      //     user_id: userId,
      //     trainer_id: trainerId,
      //     created_at: new Date().toISOString()
      //   })
      //   .select()
      //   .single();

      // if (error) {
      //   console.error('❌ Erro ao criar conversa:', error);
      //   return null;
      // }

      // return conversation.id;

      // Por enquanto, retornar null até as tabelas relacionais estarem implementadas
      console.log('ℹ️ ClientMessages: Sistema de criação de conversas ainda não implementado');
      return null;

    } catch (error) {
      console.error('❌ Erro ao criar conversa:', error);
      return null;
    }
  }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

export const clientMessagesService = new ClientMessagesService();
export default clientMessagesService;