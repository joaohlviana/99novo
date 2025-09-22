import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AppState, LoadingState, AppError, ModalState, NotificationState } from '../types';

interface AppStore extends AppState {
  // Actions
  setInitialized: (initialized: boolean) => void;
  setOnline: (online: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  setRegion: (region: string) => void;
  
  // Loading states
  setLoading: (key: string, loading: boolean) => void;
  getLoading: (key: string) => boolean;
  clearLoading: () => void;
  
  // Error handling
  setError: (key: string, error: string) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  
  // Modals
  openModal: (modal: Omit<ModalState, 'isOpen'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  isModalOpen: (id: string) => boolean;
  
  // Notifications
  addNotification: (notification: Omit<NotificationState, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  getUnreadCount: () => number;
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isInitialized: false,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        theme: 'system',
        language: 'pt-BR',
        region: 'BR',
        notifications: [],
        modals: [],
        loading: {},
        errors: {},

        // Actions
        setInitialized: (initialized) => 
          set({ isInitialized: initialized }, false, 'setInitialized'),

        setOnline: (online) => 
          set({ isOnline: online }, false, 'setOnline'),

        setTheme: (theme) => 
          set({ theme }, false, 'setTheme'),

        setLanguage: (language) => 
          set({ language }, false, 'setLanguage'),

        setRegion: (region) => 
          set({ region }, false, 'setRegion'),

        // Loading states
        setLoading: (key, loading) =>
          set(
            (state) => ({
              loading: { ...state.loading, [key]: loading }
            }),
            false,
            'setLoading'
          ),

        getLoading: (key) => get().loading[key] || false,

        clearLoading: () => 
          set({ loading: {} }, false, 'clearLoading'),

        // Error handling
        setError: (key, error) =>
          set(
            (state) => ({
              errors: { ...state.errors, [key]: error }
            }),
            false,
            'setError'
          ),

        clearError: (key) =>
          set(
            (state) => {
              const { [key]: removed, ...rest } = state.errors;
              return { errors: rest };
            },
            false,
            'clearError'
          ),

        clearAllErrors: () => 
          set({ errors: {} }, false, 'clearAllErrors'),

        // Modals
        openModal: (modal) =>
          set(
            (state) => ({
              modals: [
                ...state.modals.filter(m => m.id !== modal.id),
                { ...modal, isOpen: true }
              ]
            }),
            false,
            'openModal'
          ),

        closeModal: (id) =>
          set(
            (state) => ({
              modals: state.modals.map(modal =>
                modal.id === id ? { ...modal, isOpen: false } : modal
              )
            }),
            false,
            'closeModal'
          ),

        closeAllModals: () =>
          set(
            (state) => ({
              modals: state.modals.map(modal => ({ ...modal, isOpen: false }))
            }),
            false,
            'closeAllModals'
          ),

        isModalOpen: (id) => {
          const modal = get().modals.find(m => m.id === id);
          return modal?.isOpen || false;
        },

        // Notifications
        addNotification: (notification) => {
          const id = `notification-${Date.now()}-${Math.random()}`;
          const timestamp = new Date().toISOString();
          
          set(
            (state) => ({
              notifications: [
                { ...notification, id, timestamp, read: false },
                ...state.notifications
              ].slice(0, 50) // Manter apenas as 50 mais recentes
            }),
            false,
            'addNotification'
          );
        },

        removeNotification: (id) =>
          set(
            (state) => ({
              notifications: state.notifications.filter(n => n.id !== id)
            }),
            false,
            'removeNotification'
          ),

        markNotificationAsRead: (id) =>
          set(
            (state) => ({
              notifications: state.notifications.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
              )
            }),
            false,
            'markNotificationAsRead'
          ),

        clearAllNotifications: () => 
          set({ notifications: [] }, false, 'clearAllNotifications'),

        getUnreadCount: () => 
          get().notifications.filter(n => !n.read).length,
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          region: state.region,
        }),
      }
    ),
    { name: 'AppStore' }
  )
);

// Hook para estados de loading específicos
export const useLoadingState = (key: string) => {
  const setLoading = useAppStore(state => state.setLoading);
  const isLoading = useAppStore(state => state.getLoading(key));
  
  return [isLoading, (loading: boolean) => setLoading(key, loading)] as const;
};

// Hook para gerenciamento de erros específicos
export const useErrorState = (key: string) => {
  const setError = useAppStore(state => state.setError);
  const clearError = useAppStore(state => state.clearError);
  const error = useAppStore(state => state.errors[key]);
  
  return {
    error,
    setError: (error: string) => setError(key, error),
    clearError: () => clearError(key),
    hasError: !!error
  };
};