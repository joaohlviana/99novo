/**
 * HOOK PARA MENSAGENS/CONVERSAS DO CLIENTE
 * =======================================
 * GARANTIA CRÍTICA: USA EXCLUSIVAMENTE dados do Supabase via tabelas relacionais
 * Nunca retorna mock data - essencial para CLIENT-DASHBOARD
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clientMessagesService, ClientConversation, ClientMessage } from '../services/client-messages.service';

export function useClientMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ClientConversation[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalConversations: 0,
    unreadCount: 0,
    onlineTrainers: 0
  });

  const fetchConversations = async () => {
    if (!user?.id) {
      console.log('ℹ️ [useClientMessages] Usuário não logado');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💬 [useClientMessages] Carregando conversas via Supabase service');

      // ✅ USAR EXCLUSIVAMENTE O SERVIÇO SUPABASE - NUNCA MOCK DATA
      const [conversationsData, statsData] = await Promise.all([
        clientMessagesService.getConversations(user.id),
        clientMessagesService.getMessagesStats(user.id)
      ]);

      setConversations(conversationsData);
      setStats(statsData);
      
      // Se há conversas e nenhuma está selecionada, selecionar a primeira
      if (conversationsData.length > 0 && !selectedConversationId) {
        setSelectedConversationId(conversationsData[0].id);
      }

      console.log(`✅ [useClientMessages] ${conversationsData.length} conversas carregadas do Supabase`);

    } catch (error: any) {
      console.error('❌ [useClientMessages] Erro ao carregar conversas:', error);
      setError('Erro ao carregar conversas');
      setConversations([]);
      setStats({ totalConversations: 0, unreadCount: 0, onlineTrainers: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!conversationId) return;

    try {
      console.log('📨 [useClientMessages] Carregando mensagens para conversa:', conversationId);

      // ✅ USAR EXCLUSIVAMENTE O SERVIÇO SUPABASE - NUNCA MOCK DATA
      const messagesData = await clientMessagesService.getMessages(conversationId);
      setMessages(messagesData);

      // Marcar mensagens como lidas
      if (user?.id) {
        await clientMessagesService.markMessagesAsRead(conversationId, user.id);
      }

      console.log(`✅ [useClientMessages] ${messagesData.length} mensagens carregadas do Supabase`);

    } catch (error) {
      console.error('❌ [useClientMessages] Erro ao carregar mensagens:', error);
      setMessages([]);
    }
  };

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!user?.id || !selectedConversationId || !content.trim()) {
      return false;
    }

    try {
      console.log('📤 [useClientMessages] Enviando mensagem via Supabase service');

      const message = await clientMessagesService.sendMessage(
        selectedConversationId,
        content,
        user.id
      );

      if (message) {
        // Adicionar mensagem otimisticamente à lista local
        setMessages(prev => [...prev, message]);
        
        // Atualizar última mensagem da conversa
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversationId 
            ? { 
                ...conv, 
                lastMessage: {
                  content: message.content,
                  timestamp: message.timestamp,
                  isFromTrainer: false
                }
              }
            : conv
        ));

        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ [useClientMessages] Erro ao enviar mensagem:', error);
      return false;
    }
  };

  const selectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    fetchMessages(conversationId);
  };

  const createConversation = async (trainerId: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      console.log('➕ [useClientMessages] Criando nova conversa via Supabase service');

      const conversationId = await clientMessagesService.createConversation(user.id, trainerId);
      
      if (conversationId) {
        // Recarregar conversas para incluir a nova
        await fetchConversations();
        setSelectedConversationId(conversationId);
      }

      return conversationId;

    } catch (error) {
      console.error('❌ [useClientMessages] Erro ao criar conversa:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user?.id]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;

  return {
    conversations,
    messages,
    selectedConversation,
    selectedConversationId,
    loading,
    error,
    stats,
    refetch: fetchConversations,
    sendMessage,
    selectConversation,
    createConversation
  };
}