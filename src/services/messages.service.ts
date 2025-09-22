import { ChatMessage, Conversation, MessageAttachment, MessageStatus } from '../types/entities';

export interface CreateMessageRequest {
  conversationId: string;
  content: string;
  attachments?: File[];
  type?: 'text' | 'image' | 'file' | 'workout' | 'payment';
  metadata?: Record<string, any>;
}

export interface ConversationFilters {
  status?: 'active' | 'archived' | 'unread';
  participantId?: string;
  programId?: string;
  search?: string;
  fromDate?: Date;
  toDate?: Date;
}

// Mock data para conversas
const mockConversations: Conversation[] = [
  {
    id: 'conv_1',
    participants: [
      {
        id: 'trainer_1',
        name: 'Carlos Silva',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        role: 'trainer',
        isOnline: true
      },
      {
        id: 'client_1', 
        name: 'Maria Santos',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        role: 'client',
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
      }
    ],
    lastMessage: {
      id: 'msg_latest_1',
      content: 'Perfeito! Vou preparar o treino personalizado para você. Em breve envio os detalhes.',
      senderId: 'trainer_1',
      timestamp: new Date(Date.now() - 1800000), // 30 min ago
      status: 'delivered',
      type: 'text'
    },
    programId: 'program_1',
    unreadCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
    updatedAt: new Date(Date.now() - 1800000),
    status: 'active',
    metadata: {
      program: 'Treino Funcional Avançado',
      trainerSpecialty: 'Musculação'
    }
  },
  {
    id: 'conv_2',
    participants: [
      {
        id: 'trainer_2',
        name: 'Ana Costa',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        role: 'trainer',
        isOnline: true
      },
      {
        id: 'client_2',
        name: 'João Pedro',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        role: 'client', 
        isOnline: true
      }
    ],
    lastMessage: {
      id: 'msg_latest_2',
      content: 'Oi Ana! Quando podemos marcar uma aula experimental?',
      senderId: 'client_2',
      timestamp: new Date(Date.now() - 900000), // 15 min ago
      status: 'delivered',
      type: 'text'
    },
    programId: 'program_2',
    unreadCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
    updatedAt: new Date(Date.now() - 900000),
    status: 'active',
    metadata: {
      program: 'Personal Training',
      trainerSpecialty: 'Yoga'
    }
  },
  {
    id: 'conv_3',
    participants: [
      {
        id: 'trainer_3',
        name: 'Roberto Lima',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150',
        role: 'trainer',
        isOnline: false,
        lastSeen: new Date(Date.now() - 7200000) // 2 hours ago
      },
      {
        id: 'client_3',
        name: 'Fernanda Silva',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        role: 'client',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1800000) // 30 min ago
      }
    ],
    lastMessage: {
      id: 'msg_latest_3',
      content: 'Obrigada pelo feedback! A evolução tem sido incrível mesmo 💪',
      senderId: 'client_3', 
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      status: 'read',
      type: 'text'
    },
    programId: 'program_3',
    unreadCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 14), // 2 weeks ago
    updatedAt: new Date(Date.now() - 3600000),
    status: 'active',
    metadata: {
      program: 'Crossfit Iniciante',
      trainerSpecialty: 'Crossfit'
    }
  }
];

// Mock data para mensagens detalhadas
const mockMessages: Record<string, ChatMessage[]> = {
  'conv_1': [
    {
      id: 'msg_1_1',
      content: 'Oi Carlos! Tudo bem? Gostaria de saber mais detalhes sobre o treino funcional.',
      senderId: 'client_1',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      status: 'read',
      type: 'text'
    },
    {
      id: 'msg_1_2', 
      content: 'Oi Maria! Tudo ótimo, obrigado. Claro, vou te explicar tudo sobre o programa.',
      senderId: 'trainer_1',
      timestamp: new Date(Date.now() - 86000000), // 23h ago
      status: 'read',
      type: 'text'
    },
    {
      id: 'msg_1_3',
      content: 'O treino funcional trabalha movimentos naturais do corpo. É perfeito para quem quer melhorar a capacidade física geral.',
      senderId: 'trainer_1', 
      timestamp: new Date(Date.now() - 85800000), // 23h50m ago
      status: 'read',
      type: 'text'
    },
    {
      id: 'msg_1_4',
      content: 'Que interessante! Posso ver alguns exercícios de exemplo?',
      senderId: 'client_1',
      timestamp: new Date(Date.now() - 85200000), // 23h40m ago  
      status: 'read',
      type: 'text'
    },
    {
      id: 'msg_1_5',
      content: 'Claro! Vou enviar um vídeo demonstrativo.',
      senderId: 'trainer_1',
      timestamp: new Date(Date.now() - 84600000), // 23h30m ago
      status: 'read',
      type: 'text',
      attachments: [
        {
          id: 'att_1',
          type: 'video',
          url: 'https://example.com/video1.mp4',
          name: 'treino_funcional_demo.mp4',
          size: 15728640,
          thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300'
        }
      ]
    },
    {
      id: 'msg_1_6',
      content: 'Perfeito! Vou preparar o treino personalizado para você. Em breve envio os detalhes.',
      senderId: 'trainer_1',
      timestamp: new Date(Date.now() - 1800000), // 30 min ago
      status: 'delivered',
      type: 'text'
    }
  ],
  'conv_2': [
    {
      id: 'msg_2_1',
      content: 'Olá Ana! Vi seu perfil e me interessei pelas aulas de yoga.',
      senderId: 'client_2',
      timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
      status: 'read',
      type: 'text'
    },
    {
      id: 'msg_2_2',
      content: 'Oi João! Que bom! O yoga é transformador. Qual seu nível de experiência?',
      senderId: 'trainer_2',
      timestamp: new Date(Date.now() - 86000000 * 2), // ~2 days ago
      status: 'read',
      type: 'text'
    },
    {
      id: 'msg_2_3',
      content: 'Sou completamente iniciante. Nunca pratiquei antes.',
      senderId: 'client_2',
      timestamp: new Date(Date.now() - 85000000 * 2),
      status: 'read', 
      type: 'text'
    },
    {
      id: 'msg_2_4',
      content: 'Perfeito! Tenho um programa específico para iniciantes. Muito cuidadoso e progressivo.',
      senderId: 'trainer_2',
      timestamp: new Date(Date.now() - 84000000 * 2),
      status: 'read',
      type: 'text'
    },
    {
      id: 'msg_2_5',
      content: 'Oi Ana! Quando podemos marcar uma aula experimental?',
      senderId: 'client_2',
      timestamp: new Date(Date.now() - 900000), // 15 min ago
      status: 'delivered',
      type: 'text'
    }
  ]
};

class MessagesService {
  private static instance: MessagesService;
  private conversations: Conversation[] = [...mockConversations];
  private messages: Record<string, ChatMessage[]> = { ...mockMessages };

  private constructor() {}

  public static getInstance(): MessagesService {
    if (!MessagesService.instance) {
      MessagesService.instance = new MessagesService();
    }
    return MessagesService.instance;
  }

  // Simulação de delay de rede
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Conversas
  async getConversations(filters?: ConversationFilters): Promise<Conversation[]> {
    await this.delay(300);
    
    let filtered = [...this.conversations];

    if (filters?.status) {
      filtered = filtered.filter(conv => conv.status === filters.status);
    }

    if (filters?.participantId) {
      filtered = filtered.filter(conv => 
        conv.participants.some(p => p.id === filters.participantId)
      );
    }

    if (filters?.programId) {
      filtered = filtered.filter(conv => conv.programId === filters.programId);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.participants.some(p => p.name.toLowerCase().includes(searchLower)) ||
        conv.lastMessage?.content.toLowerCase().includes(searchLower) ||
        conv.metadata?.program?.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.fromDate || filters?.toDate) {
      filtered = filtered.filter(conv => {
        const date = conv.updatedAt;
        if (filters.fromDate && date < filters.fromDate) return false;
        if (filters.toDate && date > filters.toDate) return false;
        return true;
      });
    }

    // Ordenar por última atualização
    filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return filtered;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    await this.delay(200);
    return this.conversations.find(conv => conv.id === conversationId) || null;
  }

  async createConversation(participantIds: string[], programId?: string): Promise<Conversation> {
    await this.delay(400);

    // Verificar se conversa já existe
    const existing = this.conversations.find(conv => 
      conv.participants.length === participantIds.length &&
      participantIds.every(id => conv.participants.some(p => p.id === id))
    );

    if (existing) {
      return existing;
    }

    // Criar nova conversa (mock - em produção viria do backend)
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      participants: participantIds.map(id => ({
        id,
        name: `User ${id}`,
        role: id.startsWith('trainer') ? 'trainer' : 'client',
        isOnline: Math.random() > 0.5
      })),
      lastMessage: undefined,
      programId,
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      metadata: {}
    };

    this.conversations.unshift(newConv);
    this.messages[newConv.id] = [];

    return newConv;
  }

  // Mensagens
  async getMessages(conversationId: string, limit: number = 50, before?: string): Promise<ChatMessage[]> {
    await this.delay(300);
    
    const messages = this.messages[conversationId] || [];
    
    if (before) {
      const beforeIndex = messages.findIndex(msg => msg.id === before);
      if (beforeIndex > 0) {
        return messages.slice(Math.max(0, beforeIndex - limit), beforeIndex);
      }
    }

    return messages.slice(-limit);
  }

  async sendMessage(request: CreateMessageRequest): Promise<ChatMessage> {
    await this.delay(600);

    // Processar anexos (mock)
    let attachments: MessageAttachment[] = [];
    if (request.attachments && request.attachments.length > 0) {
      attachments = request.attachments.map((file, index) => ({
        id: `att_${Date.now()}_${index}`,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'file',
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }));
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      content: request.content,
      senderId: 'current_user', // Em produção viria do contexto de auth
      timestamp: new Date(),
      status: 'sent',
      type: request.type || 'text',
      attachments: attachments.length > 0 ? attachments : undefined,
      metadata: request.metadata
    };

    // Adicionar à conversa
    if (!this.messages[request.conversationId]) {
      this.messages[request.conversationId] = [];
    }
    this.messages[request.conversationId].push(newMessage);

    // Atualizar conversa
    const convIndex = this.conversations.findIndex(c => c.id === request.conversationId);
    if (convIndex !== -1) {
      this.conversations[convIndex].lastMessage = newMessage;
      this.conversations[convIndex].updatedAt = new Date();
      
      // Mover para o topo
      const conv = this.conversations.splice(convIndex, 1)[0];
      this.conversations.unshift(conv);
    }

    // Simular entrega após delay
    setTimeout(() => {
      newMessage.status = 'delivered';
    }, 1000);

    return newMessage;
  }

  async markAsRead(conversationId: string, messageIds?: string[]): Promise<void> {
    await this.delay(200);

    const messages = this.messages[conversationId];
    if (!messages) return;

    if (messageIds) {
      messageIds.forEach(id => {
        const message = messages.find(m => m.id === id);
        if (message) message.status = 'read';
      });
    } else {
      // Marcar todas como lidas
      messages.forEach(msg => {
        if (msg.status !== 'read') msg.status = 'read';
      });
    }

    // Zerar contador não lidas
    const convIndex = this.conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      this.conversations[convIndex].unreadCount = 0;
    }
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    await this.delay(300);

    const messages = this.messages[conversationId];
    if (!messages) return;

    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      messages.splice(messageIndex, 1);

      // Se era a última mensagem, atualizar conversa
      const conv = this.conversations.find(c => c.id === conversationId);
      if (conv && conv.lastMessage?.id === messageId) {
        conv.lastMessage = messages[messages.length - 1];
        conv.updatedAt = new Date();
      }
    }
  }

  async archiveConversation(conversationId: string): Promise<void> {
    await this.delay(300);

    const convIndex = this.conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      this.conversations[convIndex].status = 'archived';
      this.conversations[convIndex].updatedAt = new Date();
    }
  }

  async unarchiveConversation(conversationId: string): Promise<void> {
    await this.delay(300);

    const convIndex = this.conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      this.conversations[convIndex].status = 'active';
      this.conversations[convIndex].updatedAt = new Date();
    }
  }

  // Utilitários
  async getUnreadCount(userId?: string): Promise<number> {
    await this.delay(100);
    
    if (userId) {
      return this.conversations
        .filter(conv => conv.participants.some(p => p.id === userId))
        .reduce((total, conv) => total + conv.unreadCount, 0);
    }

    return this.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }

  async searchMessages(query: string, conversationId?: string): Promise<ChatMessage[]> {
    await this.delay(400);

    const searchLower = query.toLowerCase();
    const results: ChatMessage[] = [];

    const conversationsToSearch = conversationId 
      ? [conversationId]
      : Object.keys(this.messages);

    conversationsToSearch.forEach(convId => {
      const messages = this.messages[convId] || [];
      const matching = messages.filter(msg => 
        msg.content.toLowerCase().includes(searchLower)
      );
      results.push(...matching);
    });

    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Real-time simulation (em produção seria WebSocket)
  onMessageReceived(callback: (message: ChatMessage, conversationId: string) => void): () => void {
    // Simular mensagens recebidas ocasionalmente
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance a cada intervalo
        const conversationIds = Object.keys(this.messages);
        if (conversationIds.length > 0) {
          const randomConvId = conversationIds[Math.floor(Math.random() * conversationIds.length)];
          const mockMessage: ChatMessage = {
            id: `msg_received_${Date.now()}`,
            content: 'Mensagem simulada recebida em tempo real!',
            senderId: 'other_user',
            timestamp: new Date(),
            status: 'delivered',
            type: 'text'
          };

          this.messages[randomConvId].push(mockMessage);
          
          // Atualizar conversa
          const convIndex = this.conversations.findIndex(c => c.id === randomConvId);
          if (convIndex !== -1) {
            this.conversations[convIndex].lastMessage = mockMessage;
            this.conversations[convIndex].unreadCount += 1;
            this.conversations[convIndex].updatedAt = new Date();
          }

          callback(mockMessage, randomConvId);
        }
      }
    }, 10000); // Verificar a cada 10 segundos

    return () => clearInterval(interval);
  }
}

export const messagesService = MessagesService.getInstance();