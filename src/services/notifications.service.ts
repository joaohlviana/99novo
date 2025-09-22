/**
 * 🔔 NOTIFICATIONS SERVICE
 * 
 * Gerencia notificações em tempo real, push notifications e emails.
 * Centraliza toda a comunicação com usuários.
 */

import { ServiceResponse, PaginatedResponse, PaginationParams } from '../types';

// ===============================
// INTERFACES
// ===============================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  category: 'booking' | 'payment' | 'program' | 'message' | 'system' | 'promotion';
  title: string;
  message: string;
  shortMessage?: string;
  data?: Record<string, any>;
  recipient: {
    id: string;
    type: 'client' | 'trainer' | 'admin';
  };
  sender?: {
    id: string;
    name: string;
    avatar?: string;
    type: 'user' | 'system';
  };
  channels: NotificationChannel[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  actionButton?: {
    text: string;
    action: string;
    url?: string;
  };
  expiresAt?: string;
  readAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    deviceId?: string;
    platform?: string;
    version?: string;
    [key: string]: any;
  };
}

export interface NotificationChannel {
  type: 'push' | 'email' | 'sms' | 'in_app';
  enabled: boolean;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  error?: string;
  sentAt?: string;
  deliveredAt?: string;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };
  categories: {
    booking: boolean;
    payment: boolean;
    program: boolean;
    message: boolean;
    system: boolean;
    promotion: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string;   // HH:mm
    timezone: string;
  };
  frequency: {
    digest: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
    reminders: boolean;
    marketing: boolean;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: Notification['type'];
  category: Notification['category'];
  title: string;
  message: string;
  shortMessage?: string;
  channels: NotificationChannel['type'][];
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Array<{
    category: string;
    count: number;
    unread: number;
  }>;
  byType: Array<{
    type: string;
    count: number;
  }>;
  deliveryStats: {
    sent: number;
    delivered: number;
    failed: number;
    read: number;
  };
}

// ===============================
// MOCK DATA
// ===============================

const mockNotifications: Notification[] = [
  {
    id: "notif_001",
    type: "success",
    category: "payment",
    title: "Pagamento confirmado!",
    message: "Seu pagamento do programa 'Treino Funcional Completo' foi processado com sucesso. O acesso já está liberado em sua conta.",
    shortMessage: "Pagamento confirmado - Treino Funcional",
    data: {
      programId: "program_1",
      transactionId: "txn_001",
      amount: 297.00
    },
    recipient: {
      id: "client_001",
      type: "client"
    },
    sender: {
      id: "system",
      name: "99Coach",
      type: "system"
    },
    channels: [
      {
        type: "push",
        enabled: true,
        status: "delivered",
        sentAt: "2024-01-15T10:33:00Z",
        deliveredAt: "2024-01-15T10:33:15Z"
      },
      {
        type: "email",
        enabled: true,
        status: "delivered",
        sentAt: "2024-01-15T10:33:00Z",
        deliveredAt: "2024-01-15T10:33:45Z"
      },
      {
        type: "in_app",
        enabled: true,
        status: "read",
        sentAt: "2024-01-15T10:33:00Z",
        deliveredAt: "2024-01-15T10:33:00Z"
      }
    ],
    priority: "high",
    status: "read",
    actionButton: {
      text: "Acessar programa",
      action: "navigate",
      url: "/programs/program_1"
    },
    readAt: "2024-01-15T11:45:00Z",
    sentAt: "2024-01-15T10:33:00Z",
    deliveredAt: "2024-01-15T10:33:15Z",
    createdAt: "2024-01-15T10:32:30Z",
    updatedAt: "2024-01-15T11:45:00Z",
    metadata: {
      deviceId: "device_abc123",
      platform: "web"
    }
  },
  {
    id: "notif_002",
    type: "info",
    category: "booking",
    title: "Nova sessão agendada",
    message: "Sua sessão de Personal Training com João Silva foi agendada para amanhã às 08:00. Lembre-se de chegar 10 minutos antes.",
    shortMessage: "Sessão agendada - João Silva",
    data: {
      sessionId: "session_001",
      trainerId: "trainer_001",
      date: "2024-01-20T08:00:00Z"
    },
    recipient: {
      id: "client_001",
      type: "client"
    },
    sender: {
      id: "trainer_001",
      name: "João Silva",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      type: "user"
    },
    channels: [
      {
        type: "push",
        enabled: true,
        status: "delivered",
        sentAt: "2024-01-19T15:30:00Z",
        deliveredAt: "2024-01-19T15:30:12Z"
      },
      {
        type: "in_app",
        enabled: true,
        status: "delivered",
        sentAt: "2024-01-19T15:30:00Z",
        deliveredAt: "2024-01-19T15:30:00Z"
      }
    ],
    priority: "medium",
    status: "delivered",
    actionButton: {
      text: "Ver detalhes",
      action: "navigate",
      url: "/sessions/session_001"
    },
    sentAt: "2024-01-19T15:30:00Z",
    deliveredAt: "2024-01-19T15:30:12Z",
    createdAt: "2024-01-19T15:29:45Z",
    updatedAt: "2024-01-19T15:30:12Z",
    metadata: {
      deviceId: "device_abc123",
      platform: "mobile"
    }
  },
  {
    id: "notif_003",
    type: "reminder",
    category: "booking",
    title: "Lembrete: Sessão em 1 hora",
    message: "Sua sessão de Personal Training com João Silva começa em 1 hora (08:00). Local: Academia Central.",
    shortMessage: "Sessão em 1h - João Silva",
    data: {
      sessionId: "session_001",
      trainerId: "trainer_001",
      date: "2024-01-20T08:00:00Z",
      location: "Academia Central"
    },
    recipient: {
      id: "client_001",
      type: "client"
    },
    sender: {
      id: "system",
      name: "99Coach",
      type: "system"
    },
    channels: [
      {
        type: "push",
        enabled: true,
        status: "sent",
        sentAt: "2024-01-20T07:00:00Z"
      },
      {
        type: "in_app",
        enabled: true,
        status: "sent",
        sentAt: "2024-01-20T07:00:00Z"
      }
    ],
    priority: "high",
    status: "sent",
    actionButton: {
      text: "Ver localização",
      action: "navigate",
      url: "/sessions/session_001/location"
    },
    sentAt: "2024-01-20T07:00:00Z",
    createdAt: "2024-01-20T07:00:00Z",
    updatedAt: "2024-01-20T07:00:00Z",
    metadata: {
      automated: true,
      reminderType: "session_1h_before"
    }
  },
  {
    id: "notif_004",
    type: "info",
    category: "program",
    title: "Nova aula disponível",
    message: "A aula 'Aquecimento Dinâmico' do seu programa 'Treino Funcional Completo' já está disponível!",
    shortMessage: "Nova aula - Aquecimento Dinâmico",
    data: {
      programId: "program_1",
      lessonId: "lesson_005",
      moduleId: "module_2"
    },
    recipient: {
      id: "client_001",
      type: "client"
    },
    sender: {
      id: "trainer_001",
      name: "João Silva",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      type: "user"
    },
    channels: [
      {
        type: "push",
        enabled: true,
        status: "delivered",
        sentAt: "2024-01-18T16:00:00Z",
        deliveredAt: "2024-01-18T16:00:08Z"
      },
      {
        type: "in_app",
        enabled: true,
        status: "delivered",
        sentAt: "2024-01-18T16:00:00Z",
        deliveredAt: "2024-01-18T16:00:00Z"
      }
    ],
    priority: "low",
    status: "delivered",
    actionButton: {
      text: "Assistir agora",
      action: "navigate",
      url: "/programs/program_1/lessons/lesson_005"
    },
    sentAt: "2024-01-18T16:00:00Z",
    deliveredAt: "2024-01-18T16:00:08Z",
    createdAt: "2024-01-18T15:59:30Z",
    updatedAt: "2024-01-18T16:00:08Z",
    metadata: {
      deviceId: "device_abc123",
      platform: "web"
    }
  }
];

const mockPreferences: Record<string, NotificationPreferences> = {
  "client_001": {
    userId: "client_001",
    channels: {
      push: true,
      email: true,
      sms: false,
      in_app: true
    },
    categories: {
      booking: true,
      payment: true,
      program: true,
      message: true,
      system: true,
      promotion: false
    },
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "08:00",
      timezone: "America/Sao_Paulo"
    },
    frequency: {
      digest: "daily",
      reminders: true,
      marketing: false
    }
  }
};

// ===============================
// SERVICE IMPLEMENTATION
// ===============================

export class NotificationsService {
  private static instance: NotificationsService;

  static getInstance(): NotificationsService {
    if (!NotificationsService.instance) {
      NotificationsService.instance = new NotificationsService();
    }
    return NotificationsService.instance;
  }

  /**
   * Busca notificações do usuário
   */
  async getUserNotifications(
    userId: string,
    filters: {
      category?: Notification['category'][];
      status?: Notification['status'][];
      unreadOnly?: boolean;
    } = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<ServiceResponse<PaginatedResponse<Notification>>> {
    try {
      await this.simulateDelay();

      let userNotifications = mockNotifications.filter(n => n.recipient.id === userId);

      // Aplicar filtros
      if (filters.category && filters.category.length > 0) {
        userNotifications = userNotifications.filter(n => 
          filters.category!.includes(n.category)
        );
      }

      if (filters.status && filters.status.length > 0) {
        userNotifications = userNotifications.filter(n => 
          filters.status!.includes(n.status)
        );
      }

      if (filters.unreadOnly) {
        userNotifications = userNotifications.filter(n => !n.readAt);
      }

      // Ordenação por data de criação (mais recentes primeiro)
      userNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Paginação
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedData = userNotifications.slice(startIndex, endIndex);

      const totalPages = Math.ceil(userNotifications.length / pagination.limit);

      return {
        success: true,
        data: {
          data: paginatedData,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: userNotifications.length,
            totalPages,
            hasNext: pagination.page < totalPages,
            hasPrev: pagination.page > 1
          }
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string): Promise<ServiceResponse<Notification>> {
    try {
      await this.simulateDelay(100);

      const notification = mockNotifications.find(n => n.id === notificationId);
      
      if (!notification) {
        return {
          success: false,
          error: {
            code: 'NOTIFICATION_NOT_FOUND',
            message: 'Notificação não encontrada'
          }
        };
      }

      notification.status = 'read';
      notification.readAt = new Date().toISOString();
      notification.updatedAt = new Date().toISOString();

      return {
        success: true,
        data: notification,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(userId: string): Promise<ServiceResponse<number>> {
    try {
      await this.simulateDelay();

      const userNotifications = mockNotifications.filter(n => 
        n.recipient.id === userId && !n.readAt
      );

      const count = userNotifications.length;
      const now = new Date().toISOString();

      userNotifications.forEach(notification => {
        notification.status = 'read';
        notification.readAt = now;
        notification.updatedAt = now;
      });

      return {
        success: true,
        data: count,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Obtém estatísticas de notificações
   */
  async getNotificationStats(userId: string): Promise<ServiceResponse<NotificationStats>> {
    try {
      await this.simulateDelay(100);

      const userNotifications = mockNotifications.filter(n => n.recipient.id === userId);
      
      const total = userNotifications.length;
      const unread = userNotifications.filter(n => !n.readAt).length;

      // Por categoria
      const categoryMap = new Map<string, { count: number; unread: number }>();
      userNotifications.forEach(n => {
        const existing = categoryMap.get(n.category) || { count: 0, unread: 0 };
        categoryMap.set(n.category, {
          count: existing.count + 1,
          unread: existing.unread + (n.readAt ? 0 : 1)
        });
      });

      const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        count: data.count,
        unread: data.unread
      }));

      // Por tipo
      const typeMap = new Map<string, number>();
      userNotifications.forEach(n => {
        typeMap.set(n.type, (typeMap.get(n.type) || 0) + 1);
      });

      const byType = Array.from(typeMap.entries()).map(([type, count]) => ({
        type,
        count
      }));

      // Estatísticas de entrega
      const deliveryStats = {
        sent: userNotifications.filter(n => n.sentAt).length,
        delivered: userNotifications.filter(n => n.deliveredAt).length,
        failed: userNotifications.filter(n => n.status === 'failed').length,
        read: userNotifications.filter(n => n.readAt).length
      };

      return {
        success: true,
        data: {
          total,
          unread,
          byCategory,
          byType,
          deliveryStats
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Envia uma nova notificação
   */
  async sendNotification(data: Partial<Notification>): Promise<ServiceResponse<Notification>> {
    try {
      await this.simulateDelay();

      const now = new Date().toISOString();
      const notification: Notification = {
        id: `notif_${Date.now()}`,
        type: data.type || 'info',
        category: data.category || 'system',
        title: data.title || '',
        message: data.message || '',
        shortMessage: data.shortMessage,
        data: data.data,
        recipient: data.recipient!,
        sender: data.sender,
        channels: data.channels || [
          { type: 'in_app', enabled: true, status: 'pending' },
          { type: 'push', enabled: true, status: 'pending' }
        ],
        priority: data.priority || 'medium',
        status: 'pending',
        actionButton: data.actionButton,
        expiresAt: data.expiresAt,
        createdAt: now,
        updatedAt: now,
        metadata: data.metadata || {}
      };

      // Simular envio
      notification.status = 'sent';
      notification.sentAt = now;
      notification.deliveredAt = now;
      
      notification.channels.forEach(channel => {
        channel.status = 'delivered';
        channel.sentAt = now;
        channel.deliveredAt = now;
      });

      mockNotifications.unshift(notification);

      return {
        success: true,
        data: notification,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Obtém preferências de notificação do usuário
   */
  async getUserPreferences(userId: string): Promise<ServiceResponse<NotificationPreferences>> {
    try {
      await this.simulateDelay(100);

      const preferences = mockPreferences[userId] || this.createDefaultPreferences(userId);

      return {
        success: true,
        data: preferences,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Atualiza preferências de notificação
   */
  async updateUserPreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<ServiceResponse<NotificationPreferences>> {
    try {
      await this.simulateDelay();

      const existing = mockPreferences[userId] || this.createDefaultPreferences(userId);
      const updated = { ...existing, ...updates };
      
      mockPreferences[userId] = updated;

      return {
        success: true,
        data: updated,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===============================
  // MÉTODOS PRIVADOS
  // ===============================

  private createDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      channels: {
        push: true,
        email: true,
        sms: false,
        in_app: true
      },
      categories: {
        booking: true,
        payment: true,
        program: true,
        message: true,
        system: true,
        promotion: true
      },
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
        timezone: "America/Sao_Paulo"
      },
      frequency: {
        digest: "immediate",
        reminders: true,
        marketing: true
      }
    };
  }

  private async simulateDelay(ms: number = 200): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private handleError(error: any): ServiceResponse<any> {
    console.error('NotificationsService Error:', error);
    return {
      success: false,
      error: {
        code: 'NOTIFICATION_ERROR',
        message: 'Erro interno no sistema de notificações',
        details: error.message
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }
}

// Export singleton instance
export const notificationsService = NotificationsService.getInstance();