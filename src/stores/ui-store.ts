import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ID } from '../types';

interface UIState {
  // Layout e navegação
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  currentPage: string;
  
  // Favoritos
  favorites: string[];
  
  // Pesquisas recentes
  recentSearches: string[];
  
  // Cache de busca
  searchResults: any[];
  searchQuery: string;
  
  // Estados temporários de UI
  showWelcomeModal: boolean;
  lastVisitedTrainer?: string;
  pendingRedirect?: string;
  
  // Modais e overlays globais
  activeModals: string[];
  
  // Preferências de UI
  preferences: {
    viewMode: 'grid' | 'list';
    cardsPerRow: number;
    showPreviews: boolean;
    compactMode: boolean;
    animationsEnabled: boolean;
  };
  
  // Estados de filtros visuais (não os filtros em si)
  filtersVisible: boolean;
  filtersCollapsed: boolean;
}

interface UIStore extends UIState {
  // Layout actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setCurrentPage: (page: string) => void;
  
  // Favoritos actions
  addToFavorites: (id: string) => void;
  removeFromFavorites: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
  getFavoritesCount: () => number;
  
  // Pesquisas recentes actions
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  getRecentSearches: () => string[];
  
  // Cache de busca actions
  setSearchResults: (results: any[]) => void;
  setSearchQuery: (query: string) => void;
  clearSearchResults: () => void;
  
  // Estados temporários actions
  setShowWelcomeModal: (show: boolean) => void;
  setLastVisitedTrainer: (trainerId: string) => void;
  setPendingRedirect: (path?: string) => void;
  
  // Modais actions
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
  isModalOpen: (modalId: string) => boolean;
  
  // Preferências actions
  setViewMode: (mode: 'grid' | 'list') => void;
  setCardsPerRow: (count: number) => void;
  setShowPreviews: (show: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  updatePreferences: (prefs: Partial<UIState['preferences']>) => void;
  
  // Filtros visuais actions
  setFiltersVisible: (visible: boolean) => void;
  toggleFiltersVisible: () => void;
  setFiltersCollapsed: (collapsed: boolean) => void;
  toggleFiltersCollapsed: () => void;
  
  // Utilities
  resetUIState: () => void;
  getUISnapshot: () => Partial<UIState>;
  restoreUISnapshot: (snapshot: Partial<UIState>) => void;
}

const initialState: UIState = {
  sidebarOpen: false,
  mobileMenuOpen: false,
  currentPage: 'home',
  favorites: [],
  recentSearches: [],
  searchResults: [],
  searchQuery: '',
  showWelcomeModal: false,
  lastVisitedTrainer: undefined,
  pendingRedirect: undefined,
  activeModals: [],
  preferences: {
    viewMode: 'grid',
    cardsPerRow: 3,
    showPreviews: true,
    compactMode: false,
    animationsEnabled: true,
  },
  filtersVisible: true,
  filtersCollapsed: false,
};

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...initialState,

        // Layout actions
        setSidebarOpen: (open) =>
          set({ sidebarOpen: open }, false, 'setSidebarOpen'),

        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),

        setMobileMenuOpen: (open) =>
          set({ mobileMenuOpen: open }, false, 'setMobileMenuOpen'),

        toggleMobileMenu: () =>
          set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }), false, 'toggleMobileMenu'),

        setCurrentPage: (page) =>
          set({ currentPage: page }, false, 'setCurrentPage'),

        // Favoritos actions
        addToFavorites: (id) =>
          set(
            (state) => ({
              favorites: state.favorites.includes(id)
                ? state.favorites
                : [...state.favorites, id]
            }),
            false,
            'addToFavorites'
          ),

        removeFromFavorites: (id) =>
          set(
            (state) => ({
              favorites: state.favorites.filter(fId => fId !== id)
            }),
            false,
            'removeFromFavorites'
          ),

        toggleFavorite: (id) => {
          const { favorites, addToFavorites, removeFromFavorites } = get();
          if (favorites.includes(id)) {
            removeFromFavorites(id);
          } else {
            addToFavorites(id);
          }
        },

        isFavorite: (id) => get().favorites.includes(id),

        clearFavorites: () =>
          set({ favorites: [] }, false, 'clearFavorites'),

        getFavoritesCount: () => get().favorites.length,

        // Pesquisas recentes actions
        addRecentSearch: (query) => {
          const trimmedQuery = query.trim();
          if (!trimmedQuery) return;

          set(
            (state) => ({
              recentSearches: [
                trimmedQuery,
                ...state.recentSearches.filter(s => s !== trimmedQuery)
              ].slice(0, 10) // Manter apenas 10
            }),
            false,
            'addRecentSearch'
          );
        },

        removeRecentSearch: (query) =>
          set(
            (state) => ({
              recentSearches: state.recentSearches.filter(s => s !== query)
            }),
            false,
            'removeRecentSearch'
          ),

        clearRecentSearches: () =>
          set({ recentSearches: [] }, false, 'clearRecentSearches'),

        getRecentSearches: () => get().recentSearches,

        // Cache de busca actions
        setSearchResults: (results) =>
          set({ searchResults: results }, false, 'setSearchResults'),

        setSearchQuery: (query) =>
          set({ searchQuery: query }, false, 'setSearchQuery'),

        clearSearchResults: () =>
          set({ searchResults: [], searchQuery: '' }, false, 'clearSearchResults'),

        // Estados temporários actions
        setShowWelcomeModal: (show) =>
          set({ showWelcomeModal: show }, false, 'setShowWelcomeModal'),

        setLastVisitedTrainer: (trainerId) =>
          set({ lastVisitedTrainer: trainerId }, false, 'setLastVisitedTrainer'),

        setPendingRedirect: (path) =>
          set({ pendingRedirect: path }, false, 'setPendingRedirect'),

        // Modais actions
        openModal: (modalId) =>
          set(
            (state) => ({
              activeModals: state.activeModals.includes(modalId)
                ? state.activeModals
                : [...state.activeModals, modalId]
            }),
            false,
            'openModal'
          ),

        closeModal: (modalId) =>
          set(
            (state) => ({
              activeModals: state.activeModals.filter(id => id !== modalId)
            }),
            false,
            'closeModal'
          ),

        closeAllModals: () =>
          set({ activeModals: [] }, false, 'closeAllModals'),

        isModalOpen: (modalId) => get().activeModals.includes(modalId),

        // Preferências actions
        setViewMode: (mode) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, viewMode: mode }
            }),
            false,
            'setViewMode'
          ),

        setCardsPerRow: (count) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, cardsPerRow: count }
            }),
            false,
            'setCardsPerRow'
          ),

        setShowPreviews: (show) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, showPreviews: show }
            }),
            false,
            'setShowPreviews'
          ),

        setCompactMode: (compact) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, compactMode: compact }
            }),
            false,
            'setCompactMode'
          ),

        setAnimationsEnabled: (enabled) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, animationsEnabled: enabled }
            }),
            false,
            'setAnimationsEnabled'
          ),

        updatePreferences: (prefs) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, ...prefs }
            }),
            false,
            'updatePreferences'
          ),

        // Filtros visuais actions
        setFiltersVisible: (visible) =>
          set({ filtersVisible: visible }, false, 'setFiltersVisible'),

        toggleFiltersVisible: () =>
          set((state) => ({ filtersVisible: !state.filtersVisible }), false, 'toggleFiltersVisible'),

        setFiltersCollapsed: (collapsed) =>
          set({ filtersCollapsed: collapsed }, false, 'setFiltersCollapsed'),

        toggleFiltersCollapsed: () =>
          set((state) => ({ filtersCollapsed: !state.filtersCollapsed }), false, 'toggleFiltersCollapsed'),

        // Utilities
        resetUIState: () =>
          set(initialState, false, 'resetUIState'),

        getUISnapshot: () => {
          const state = get();
          return {
            sidebarOpen: state.sidebarOpen,
            preferences: state.preferences,
            filtersVisible: state.filtersVisible,
            filtersCollapsed: state.filtersCollapsed,
          };
        },

        restoreUISnapshot: (snapshot) =>
          set((state) => ({ ...state, ...snapshot }), false, 'restoreUISnapshot'),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          favorites: state.favorites,
          recentSearches: state.recentSearches,
          lastVisitedTrainer: state.lastVisitedTrainer,
          preferences: state.preferences,
          showWelcomeModal: state.showWelcomeModal,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

// Hooks especializados
export const useFavorites = () => {
  const {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    getFavoritesCount,
  } = useUIStore();

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: getFavoritesCount(),
  };
};

export const useSearch = () => {
  const {
    searchResults,
    searchQuery,
    recentSearches,
    setSearchResults,
    setSearchQuery,
    clearSearchResults,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    getRecentSearches,
  } = useUIStore();

  return {
    results: searchResults,
    query: searchQuery,
    recentSearches,
    setResults: setSearchResults,
    setQuery: setSearchQuery,
    clearResults: clearSearchResults,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    getRecent: getRecentSearches,
  };
};

export const useUIPreferences = () => {
  const {
    preferences,
    setViewMode,
    setCardsPerRow,
    setShowPreviews,
    setCompactMode,
    setAnimationsEnabled,
    updatePreferences,
  } = useUIStore();

  return {
    ...preferences,
    setViewMode,
    setCardsPerRow,
    setShowPreviews,
    setCompactMode,
    setAnimationsEnabled,
    updatePreferences,
  };
};

export const useUILayout = () => {
  const {
    sidebarOpen,
    mobileMenuOpen,
    setSidebarOpen,
    toggleSidebar,
    setMobileMenuOpen,
    toggleMobileMenu,
    filtersVisible,
    filtersCollapsed,
    setFiltersVisible,
    toggleFiltersVisible,
    setFiltersCollapsed,
    toggleFiltersCollapsed,
  } = useUIStore();

  return {
    sidebar: {
      isOpen: sidebarOpen,
      setOpen: setSidebarOpen,
      toggle: toggleSidebar,
    },
    mobileMenu: {
      isOpen: mobileMenuOpen,
      setOpen: setMobileMenuOpen,
      toggle: toggleMobileMenu,
    },
    filters: {
      visible: filtersVisible,
      collapsed: filtersCollapsed,
      setVisible: setFiltersVisible,
      toggleVisible: toggleFiltersVisible,
      setCollapsed: setFiltersCollapsed,
      toggleCollapsed: toggleFiltersCollapsed,
    },
  };
};

export const useModals = () => {
  const {
    activeModals,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
  } = useUIStore();

  return {
    activeModals,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
  };
};