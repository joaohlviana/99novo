import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  messagesService, 
  ChatMessage, 
  Conversation, 
  CreateMessageRequest, 
  ConversationFilters 
} from '../services/messages.service';

interface MessagesState {
  // Data
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  activeConversation: string | null;
  
  // UI State
  loading: {
    conversations: boolean;
    messages: boolean;
    sending: boolean;
  };
  errors: {
    conversations?: string;
    messages?: string;
    sending?: string;
  };
  
  // Filters & Search
  conversationFilters: ConversationFilters;
  messageSearch: string;
  
  // Real-time state
  typingUsers: Record<string, string[]>; // conversationId -> userIds
  onlineUsers: Set<string>;
  unreadCount: number;
}

interface MessagesActions {
  // Conversations
  loadConversations: (filters?: ConversationFilters) => Promise<void>;
  createConversation: (participantIds: string[], programId?: string) => Promise<Conversation | null>;
  setActiveConversation: (conversationId: string | null) => void;
  archiveConversation: (conversationId: string) => Promise<void>;
  
  // Messages
  loadMessages: (conversationId: string, limit?: number, before?: string) => Promise<void>;
  sendMessage: (request: CreateMessageRequest) => Promise<ChatMessage | null>;
  markAsRead: (conversationId: string, messageIds?: string[]) => Promise<void>;
  deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
  
  // Search & Filters
  setConversationFilters: (filters: Partial<ConversationFilters>) => void;
  searchMessages: (query: string, conversationId?: string) => Promise<ChatMessage[]>;
  setMessageSearch: (query: string) => void;
  
  // Real-time
  setUserTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  
  // Utilities
  getUnreadCount: (userId?: string) => Promise<void>;
  clearErrors: () => void;
  resetState: () => void;
}

const initialState: MessagesState = {
  conversations: [],
  messages: {},
  activeConversation: null,
  loading: {
    conversations: false,
    messages: false,
    sending: false,
  },
  errors: {},
  conversationFilters: {},
  messageSearch: '',
  typingUsers: {},
  onlineUsers: new Set(),
  unreadCount: 0,
};

export const useMessagesStore = create<MessagesState & MessagesActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Conversations
    loadConversations: async (filters?: ConversationFilters) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, conversations: true },
        errors: { ...state.errors, conversations: undefined }
      }));

      try {
        const conversations = await messagesService.getConversations(filters);
        set(state => ({ 
          ...state, 
          conversations,
          loading: { ...state.loading, conversations: false }
        }));
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, conversations: false },
          errors: { ...state.errors, conversations: error instanceof Error ? error.message : 'Erro ao carregar conversas' }
        }));
      }
    },

    createConversation: async (participantIds: string[], programId?: string) => {
      try {
        const conversation = await messagesService.createConversation(participantIds, programId);
        
        set(state => ({
          ...state,
          conversations: [conversation, ...state.conversations.filter(c => c.id !== conversation.id)]
        }));
        
        return conversation;
      } catch (error) {
        console.error('Error creating conversation:', error);
        return null;
      }
    },

    setActiveConversation: (conversationId: string | null) => {
      set({ activeConversation: conversationId });
      
      // Load messages if conversation selected and not already loaded
      if (conversationId && !get().messages[conversationId]) {
        get().loadMessages(conversationId);
      }
    },

    archiveConversation: async (conversationId: string) => {
      try {
        await messagesService.archiveConversation(conversationId);
        
        set(state => ({
          ...state,
          conversations: state.conversations.map(conv =>
            conv.id === conversationId 
              ? { ...conv, status: 'archived' }
              : conv
          )
        }));
      } catch (error) {
        console.error('Error archiving conversation:', error);
      }
    },

    // Messages
    loadMessages: async (conversationId: string, limit?: number, before?: string) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, messages: true },
        errors: { ...state.errors, messages: undefined }
      }));

      try {
        const messages = await messagesService.getMessages(conversationId, limit, before);
        
        set(state => ({
          ...state,
          messages: {
            ...state.messages,
            [conversationId]: before 
              ? [...messages, ...state.messages[conversationId] || []]
              : messages
          },
          loading: { ...state.loading, messages: false }
        }));
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, messages: false },
          errors: { ...state.errors, messages: error instanceof Error ? error.message : 'Erro ao carregar mensagens' }
        }));
      }
    },

    sendMessage: async (request: CreateMessageRequest) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, sending: true },
        errors: { ...state.errors, sending: undefined }
      }));

      try {
        const message = await messagesService.sendMessage(request);
        
        set(state => ({
          ...state,
          messages: {
            ...state.messages,
            [request.conversationId]: [
              ...(state.messages[request.conversationId] || []),
              message
            ]
          },
          conversations: state.conversations.map(conv =>
            conv.id === request.conversationId
              ? { ...conv, lastMessage: message, updatedAt: new Date() }
              : conv
          ),
          loading: { ...state.loading, sending: false }
        }));
        
        return message;
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, sending: false },
          errors: { ...state.errors, sending: error instanceof Error ? error.message : 'Erro ao enviar mensagem' }
        }));
        return null;
      }
    },

    markAsRead: async (conversationId: string, messageIds?: string[]) => {
      try {
        await messagesService.markAsRead(conversationId, messageIds);
        
        set(state => ({
          ...state,
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId]?.map(msg =>
              !messageIds || messageIds.includes(msg.id)
                ? { ...msg, status: 'read' }
                : msg
            ) || []
          },
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        }));
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    },

    deleteMessage: async (conversationId: string, messageId: string) => {
      try {
        await messagesService.deleteMessage(conversationId, messageId);
        
        set(state => ({
          ...state,
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId]?.filter(msg => msg.id !== messageId) || []
          }
        }));
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    },

    // Search & Filters
    setConversationFilters: (filters: Partial<ConversationFilters>) => {
      set(state => ({
        ...state,
        conversationFilters: { ...state.conversationFilters, ...filters }
      }));
    },

    searchMessages: async (query: string, conversationId?: string) => {
      try {
        return await messagesService.searchMessages(query, conversationId);
      } catch (error) {
        console.error('Error searching messages:', error);
        return [];
      }
    },

    setMessageSearch: (query: string) => {
      set({ messageSearch: query });
    },

    // Real-time
    setUserTyping: (conversationId: string, userId: string, isTyping: boolean) => {
      set(state => {
        const currentTyping = state.typingUsers[conversationId] || [];
        
        return {
          ...state,
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: isTyping
              ? [...currentTyping.filter(id => id !== userId), userId]
              : currentTyping.filter(id => id !== userId)
          }
        };
      });
    },

    setUserOnline: (userId: string, isOnline: boolean) => {
      set(state => {
        const newOnlineUsers = new Set(state.onlineUsers);
        if (isOnline) {
          newOnlineUsers.add(userId);
        } else {
          newOnlineUsers.delete(userId);
        }
        
        return {
          ...state,
          onlineUsers: newOnlineUsers,
          conversations: state.conversations.map(conv => ({
            ...conv,
            participants: conv.participants.map(p =>
              p.id === userId ? { ...p, isOnline } : p
            )
          }))
        };
      });
    },

    addMessage: (conversationId: string, message: ChatMessage) => {
      set(state => ({
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: [...(state.messages[conversationId] || []), message]
        },
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? { 
                ...conv, 
                lastMessage: message, 
                updatedAt: new Date(),
                unreadCount: conv.unreadCount + 1
              }
            : conv
        )
      }));
    },

    updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => {
      set(state => ({
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId]?.map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ) || []
        }
      }));
    },

    // Utilities
    getUnreadCount: async (userId?: string) => {
      try {
        const count = await messagesService.getUnreadCount(userId);
        set({ unreadCount: count });
      } catch (error) {
        console.error('Error getting unread count:', error);
      }
    },

    clearErrors: () => {
      set(state => ({ ...state, errors: {} }));
    },

    resetState: () => {
      set(initialState);
    },
  }))
);

// Selectors for performance optimization
export const useConversations = () => useMessagesStore(state => state.conversations);
export const useActiveConversation = () => {
  const { activeConversation, conversations } = useMessagesStore();
  return conversations.find(c => c.id === activeConversation);
};
export const useMessages = (conversationId?: string) => {
  const { messages, activeConversation } = useMessagesStore();
  const targetId = conversationId || activeConversation;
  return targetId ? messages[targetId] || [] : [];
};
export const useMessagesLoading = () => useMessagesStore(state => state.loading);
export const useMessagesErrors = () => useMessagesStore(state => state.errors);
export const useUnreadCount = () => useMessagesStore(state => state.unreadCount);