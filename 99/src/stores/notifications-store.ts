import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  notificationsService,
  Notification,
  NotificationPreferences,
  NotificationStats
} from '../services/notifications.service';

interface NotificationsState {
  // Data
  notifications: Notification[];
  preferences: NotificationPreferences | null;
  stats: NotificationStats | null;
  
  // UI State
  loading: {
    notifications: boolean;
    preferences: boolean;
    stats: boolean;
    marking: boolean;
    sending: boolean;
  };
  errors: {
    notifications?: string;
    preferences?: string;
    stats?: string;
    marking?: string;
    sending?: string;
  };
  
  // Filters & State
  filters: {
    category?: Notification['category'][];
    status?: Notification['status'][];
    unreadOnly?: boolean;
  };
  
  // Real-time state
  unreadCount: number;
  lastNotificationId: string | null;
  
  // UI preferences
  showNotificationCenter: boolean;
  soundEnabled: boolean;
  desktopPermission: 'default' | 'granted' | 'denied';
}

interface NotificationsActions {
  // Core operations
  loadNotifications: (userId: string, refresh?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  sendNotification: (notification: Partial<Notification>) => Promise<void>;
  
  // Preferences
  loadPreferences: (userId: string) => Promise<void>;
  updatePreferences: (userId: string, updates: Partial<NotificationPreferences>) => Promise<void>;
  
  // Stats
  loadStats: (userId: string) => Promise<void>;
  
  // Filters
  setFilters: (filters: Partial<NotificationsState['filters']>) => void;
  clearFilters: () => void;
  
  // UI state
  setShowNotificationCenter: (show: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  
  // Real-time
  addNotification: (notification: Notification) => void;
  updateNotification: (notificationId: string, updates: Partial<Notification>) => void;
  removeNotification: (notificationId: string) => void;
  
  // Desktop notifications
  requestDesktopPermission: () => Promise<void>;
  showDesktopNotification: (notification: Notification) => void;
  
  // Utilities
  getUnreadCount: () => number;
  getNotificationsByCategory: (category: Notification['category']) => Notification[];
  clearErrors: () => void;
  resetState: () => void;
}

const initialState: NotificationsState = {
  notifications: [],
  preferences: null,
  stats: null,
  loading: {
    notifications: false,
    preferences: false,
    stats: false,
    marking: false,
    sending: false,
  },
  errors: {},
  filters: {},
  unreadCount: 0,
  lastNotificationId: null,
  showNotificationCenter: false,
  soundEnabled: true,
  desktopPermission: 'default',
};

export const useNotificationsStore = create<NotificationsState & NotificationsActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Core operations
    loadNotifications: async (userId: string, refresh: boolean = false) => {
      // Don't reload if already loaded and not refreshing
      if (!refresh && get().notifications.length > 0) return;

      set(state => ({ 
        ...state, 
        loading: { ...state.loading, notifications: true },
        errors: { ...state.errors, notifications: undefined }
      }));

      try {
        const response = await notificationsService.getUserNotifications(userId, get().filters);
        
        if (response.success && response.data) {
          const notifications = response.data.data;
          const unreadCount = notifications.filter(n => !n.readAt).length;
          
          set(state => ({ 
            ...state, 
            notifications,
            unreadCount,
            lastNotificationId: notifications[0]?.id || null,
            loading: { ...state.loading, notifications: false }
          }));
        } else {
          throw new Error(response.error?.message || 'Erro ao carregar notificações');
        }
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, notifications: false },
          errors: { ...state.errors, notifications: error instanceof Error ? error.message : 'Erro ao carregar notificações' }
        }));
      }
    },

    markAsRead: async (notificationId: string) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, marking: true },
        errors: { ...state.errors, marking: undefined }
      }));

      try {
        const response = await notificationsService.markAsRead(notificationId);
        
        if (response.success && response.data) {
          set(state => ({
            ...state,
            notifications: state.notifications.map(n =>
              n.id === notificationId 
                ? { ...n, status: 'read', readAt: response.data!.readAt }
                : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
            loading: { ...state.loading, marking: false }
          }));
        } else {
          throw new Error(response.error?.message || 'Erro ao marcar como lida');
        }
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, marking: false },
          errors: { ...state.errors, marking: error instanceof Error ? error.message : 'Erro ao marcar como lida' }
        }));
      }
    },

    markAllAsRead: async (userId: string) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, marking: true },
        errors: { ...state.errors, marking: undefined }
      }));

      try {
        const response = await notificationsService.markAllAsRead(userId);
        
        if (response.success) {
          const now = new Date().toISOString();
          
          set(state => ({
            ...state,
            notifications: state.notifications.map(n =>
              !n.readAt ? { ...n, status: 'read', readAt: now } : n
            ),
            unreadCount: 0,
            loading: { ...state.loading, marking: false }
          }));
        } else {
          throw new Error(response.error?.message || 'Erro ao marcar todas como lidas');
        }
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, marking: false },
          errors: { ...state.errors, marking: error instanceof Error ? error.message : 'Erro ao marcar todas como lidas' }
        }));
      }
    },

    sendNotification: async (notification: Partial<Notification>) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, sending: true },
        errors: { ...state.errors, sending: undefined }
      }));

      try {
        const response = await notificationsService.sendNotification(notification);
        
        if (response.success && response.data) {
          set(state => ({
            ...state,
            notifications: [response.data!, ...state.notifications],
            loading: { ...state.loading, sending: false }
          }));
        } else {
          throw new Error(response.error?.message || 'Erro ao enviar notificação');
        }
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, sending: false },
          errors: { ...state.errors, sending: error instanceof Error ? error.message : 'Erro ao enviar notificação' }
        }));
      }
    },

    // Preferences
    loadPreferences: async (userId: string) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, preferences: true },
        errors: { ...state.errors, preferences: undefined }
      }));

      try {
        const response = await notificationsService.getUserPreferences(userId);
        
        if (response.success && response.data) {
          set(state => ({ 
            ...state, 
            preferences: response.data!,
            loading: { ...state.loading, preferences: false }
          }));
        } else {
          throw new Error(response.error?.message || 'Erro ao carregar preferências');
        }
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, preferences: false },
          errors: { ...state.errors, preferences: error instanceof Error ? error.message : 'Erro ao carregar preferências' }
        }));
      }
    },

    updatePreferences: async (userId: string, updates: Partial<NotificationPreferences>) => {
      try {
        const response = await notificationsService.updateUserPreferences(userId, updates);
        
        if (response.success && response.data) {
          set(state => ({ 
            ...state, 
            preferences: response.data!
          }));
        } else {
          throw new Error(response.error?.message || 'Erro ao atualizar preferências');
        }
      } catch (error) {
        set(state => ({ 
          ...state, 
          errors: { ...state.errors, preferences: error instanceof Error ? error.message : 'Erro ao atualizar preferências' }
        }));
      }
    },

    // Stats
    loadStats: async (userId: string) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, stats: true },
        errors: { ...state.errors, stats: undefined }
      }));

      try {
        const response = await notificationsService.getNotificationStats(userId);
        
        if (response.success && response.data) {
          set(state => ({ 
            ...state, 
            stats: response.data!,
            loading: { ...state.loading, stats: false }
          }));
        } else {
          throw new Error(response.error?.message || 'Erro ao carregar estatísticas');
        }
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, stats: false },
          errors: { ...state.errors, stats: error instanceof Error ? error.message : 'Erro ao carregar estatísticas' }
        }));
      }
    },

    // Filters
    setFilters: (filters: Partial<NotificationsState['filters']>) => {
      set(state => ({
        ...state,
        filters: { ...state.filters, ...filters }
      }));
    },

    clearFilters: () => {
      set(state => ({ ...state, filters: {} }));
    },

    // UI state
    setShowNotificationCenter: (show: boolean) => {
      set({ showNotificationCenter: show });
    },

    setSoundEnabled: (enabled: boolean) => {
      set({ soundEnabled: enabled });
      // Save to localStorage
      localStorage.setItem('notifications-sound', String(enabled));
    },

    // Real-time
    addNotification: (notification: Notification) => {
      set(state => {
        const isUnread = !notification.readAt;
        const { soundEnabled, desktopPermission } = state;
        
        // Play sound if enabled
        if (soundEnabled && isUnread) {
          // You would implement actual sound playing here
          console.log('🔔 New notification sound');
        }
        
        // Show desktop notification if permitted
        if (desktopPermission === 'granted' && isUnread) {
          get().showDesktopNotification(notification);
        }
        
        return {
          ...state,
          notifications: [notification, ...state.notifications],
          unreadCount: isUnread ? state.unreadCount + 1 : state.unreadCount,
          lastNotificationId: notification.id
        };
      });
    },

    updateNotification: (notificationId: string, updates: Partial<Notification>) => {
      set(state => ({
        ...state,
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, ...updates } : n
        )
      }));
    },

    removeNotification: (notificationId: string) => {
      set(state => {
        const notification = state.notifications.find(n => n.id === notificationId);
        const wasUnread = notification && !notification.readAt;
        
        return {
          ...state,
          notifications: state.notifications.filter(n => n.id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
      });
    },

    // Desktop notifications
    requestDesktopPermission: async () => {
      if (!('Notification' in window)) {
        console.log('Browser does not support desktop notifications');
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        set({ desktopPermission: permission });
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    },

    showDesktopNotification: (notification: Notification) => {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
      }

      try {
        const desktopNotification = new Notification(notification.title, {
          body: notification.shortMessage || notification.message,
          icon: '/icon-192.png', // Your app icon
          badge: '/badge-72.png', // Optional badge
          tag: notification.id, // Prevents duplicate notifications
          requireInteraction: notification.priority === 'urgent',
          silent: !get().soundEnabled,
        });

        // Auto close after 5 seconds unless urgent
        if (notification.priority !== 'urgent') {
          setTimeout(() => {
            desktopNotification.close();
          }, 5000);
        }

        // Handle click
        desktopNotification.onclick = () => {
          window.focus();
          get().setShowNotificationCenter(true);
          get().markAsRead(notification.id);
          desktopNotification.close();
        };
      } catch (error) {
        console.error('Error showing desktop notification:', error);
      }
    },

    // Utilities
    getUnreadCount: () => {
      return get().notifications.filter(n => !n.readAt).length;
    },

    getNotificationsByCategory: (category: Notification['category']) => {
      return get().notifications.filter(n => n.category === category);
    },

    clearErrors: () => {
      set(state => ({ ...state, errors: {} }));
    },

    resetState: () => {
      set(initialState);
    },
  }))
);

// Initialize desktop permission and sound preference from localStorage
if (typeof window !== 'undefined') {
  const soundEnabled = localStorage.getItem('notifications-sound');
  if (soundEnabled !== null) {
    useNotificationsStore.getState().setSoundEnabled(soundEnabled === 'true');
  }
  
  if ('Notification' in window) {
    useNotificationsStore.setState({ 
      desktopPermission: Notification.permission 
    });
  }
}

// Selectors for performance optimization
export const useNotifications = () => useNotificationsStore(state => state.notifications);
export const useUnreadNotifications = () => useNotificationsStore(state => 
  state.notifications.filter(n => !n.readAt)
);
export const useNotificationPreferences = () => useNotificationsStore(state => state.preferences);
export const useNotificationStats = () => useNotificationsStore(state => state.stats);
export const useNotificationsLoading = () => useNotificationsStore(state => state.loading);
export const useNotificationsErrors = () => useNotificationsStore(state => state.errors);
export const useNotificationUnreadCount = () => useNotificationsStore(state => state.unreadCount);
export const useNotificationCenter = () => useNotificationsStore(state => ({
  show: state.showNotificationCenter,
  setShow: state.setShowNotificationCenter
}));