import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthUser, UserType, ImpersonationSession } from '../types';

interface UserStore {
  // Auth state
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // User mode switching
  currentUserType: UserType | null;
  availableUserTypes: UserType[];
  
  // Impersonation (admin feature)
  impersonation: ImpersonationSession | null;
  isImpersonating: boolean;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentUserType: (type: UserType) => void;
  setAvailableUserTypes: (types: UserType[]) => void;
  
  // Auth actions
  login: (user: AuthUser) => void;
  logout: () => void;
  
  // User type switching
  switchUserType: (type: UserType) => void;
  canSwitchTo: (type: UserType) => boolean;
  
  // Impersonation
  startImpersonation: (session: ImpersonationSession) => void;
  stopImpersonation: () => void;
  
  // Getters
  isTrainer: () => boolean;
  isClient: () => boolean;
  isAdmin: () => boolean;
  getUserDisplayName: () => string;
  getUserAvatar: () => string | undefined;
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        currentUserType: null,
        availableUserTypes: [],
        impersonation: null,
        isImpersonating: false,

        // Actions
        setUser: (user) =>
          set(
            {
              user,
              isAuthenticated: !!user,
              currentUserType: user?.type || null,
            },
            false,
            'setUser'
          ),

        setLoading: (loading) =>
          set({ isLoading: loading }, false, 'setLoading'),

        setCurrentUserType: (type) =>
          set({ currentUserType: type }, false, 'setCurrentUserType'),

        setAvailableUserTypes: (types) =>
          set({ availableUserTypes: types }, false, 'setAvailableUserTypes'),

        // Auth actions
        login: (user) => {
          set(
            {
              user,
              isAuthenticated: true,
              currentUserType: user.type,
              // Usuários podem ter múltiplos tipos
              availableUserTypes: [user.type], // TODO: buscar do backend
              isLoading: false,
            },
            false,
            'login'
          );
        },

        logout: () => {
          set(
            {
              user: null,
              isAuthenticated: false,
              currentUserType: null,
              availableUserTypes: [],
              impersonation: null,
              isImpersonating: false,
              isLoading: false,
            },
            false,
            'logout'
          );
        },

        // User type switching
        switchUserType: (type) => {
          const { availableUserTypes } = get();
          if (availableUserTypes.includes(type)) {
            set({ currentUserType: type }, false, 'switchUserType');
          }
        },

        canSwitchTo: (type) => {
          const { availableUserTypes, isImpersonating } = get();
          // Durante impersonação, só pode usar o tipo do usuário impersonado
          if (isImpersonating) return false;
          return availableUserTypes.includes(type);
        },

        // Impersonation
        startImpersonation: (session) => {
          set(
            {
              impersonation: session,
              isImpersonating: true,
            },
            false,
            'startImpersonation'
          );
        },

        stopImpersonation: () => {
          const { user } = get();
          set(
            {
              impersonation: null,
              isImpersonating: false,
              currentUserType: user?.type || null,
            },
            false,
            'stopImpersonation'
          );
        },

        // Getters
        isTrainer: () => {
          const { currentUserType } = get();
          return currentUserType === 'trainer';
        },

        isClient: () => {
          const { currentUserType } = get();
          return currentUserType === 'client';
        },

        isAdmin: () => {
          const { currentUserType } = get();
          return currentUserType === 'admin';
        },

        getUserDisplayName: () => {
          const { user } = get();
          return user?.name || 'Usuário';
        },

        getUserAvatar: () => {
          const { user } = get();
          return user?.avatar?.url;
        },
      }),
      {
        name: 'user-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          currentUserType: state.currentUserType,
          availableUserTypes: state.availableUserTypes,
        }),
      }
    ),
    { name: 'UserStore' }
  )
);

// Hooks especializados
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setLoading,
  } = useUserStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setLoading,
  };
};

export const useUserType = () => {
  const {
    currentUserType,
    availableUserTypes,
    switchUserType,
    canSwitchTo,
    isTrainer,
    isClient,
    isAdmin,
  } = useUserStore();

  return {
    currentUserType,
    availableUserTypes,
    switchUserType,
    canSwitchTo,
    isTrainer: isTrainer(),
    isClient: isClient(),
    isAdmin: isAdmin(),
  };
};

export const useImpersonation = () => {
  const {
    impersonation,
    isImpersonating,
    startImpersonation,
    stopImpersonation,
  } = useUserStore();

  return {
    impersonation,
    isImpersonating,
    startImpersonation,
    stopImpersonation,
  };
};