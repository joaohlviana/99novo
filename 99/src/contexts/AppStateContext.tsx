/**
 * DEPRECATED: AppStateContext - SUBSTITUÍDO POR ZUSTAND
 * 
 * Este arquivo foi mantido apenas para fins de documentação.
 * Todo estado da aplicação agora usa os hooks em /hooks/ que são baseados em Zustand.
 * 
 * NÃO IMPORTE NADA DESTE ARQUIVO - use os hooks apropriados:
 * - /hooks/useAppState.ts
 * - /stores/ui-store.ts
 * - /stores/filters-store.ts
 * - etc.
 */

import React, { ReactNode } from 'react';

// Tipos para filtros globais
export interface SportFilter {
  id: string;
  name: string;
  selected: boolean;
}

export interface LocationFilter {
  city?: string;
  state?: string;
  radius?: number; // em km
  onlineOnly?: boolean;
  inPersonOnly?: boolean;
}

export interface PriceFilter {
  min?: number;
  max?: number;
}

export interface GlobalFilters {
  sports: SportFilter[];
  location: LocationFilter;
  price: PriceFilter;
  rating?: number; // filtro por avaliação mínima
  availability?: string[]; // dias da semana disponíveis
  experience?: 'beginner' | 'intermediate' | 'advanced' | 'any';
}

// Estado da aplicação
export interface AppState {
  // Navegação e UI
  sidebarOpen: boolean;
  currentPage: string;
  isLoading: boolean;
  
  // Filtros globais
  filters: GlobalFilters;
  
  // Cache de dados
  searchResults: any[];
  favorites: string[]; // IDs dos favoritos
  recentSearches: string[];
  
  // Preferências do usuário
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  
  // Estados temporários
  showWelcomeModal: boolean;
  lastVisitedTrainer?: string;
  pendingRedirect?: string;
}

// Ações
type AppAction = 
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_CURRENT_PAGE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_SPORT_FILTERS'; payload: SportFilter[] }
  | { type: 'UPDATE_LOCATION_FILTER'; payload: LocationFilter }
  | { type: 'UPDATE_PRICE_FILTER'; payload: PriceFilter }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SEARCH_RESULTS'; payload: any[] }
  | { type: 'ADD_FAVORITE'; payload: string }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'ADD_RECENT_SEARCH'; payload: string }
  | { type: 'CLEAR_RECENT_SEARCHES' }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<AppState> }
  | { type: 'SET_WELCOME_MODAL'; payload: boolean }
  | { type: 'SET_LAST_VISITED_TRAINER'; payload: string }
  | { type: 'SET_PENDING_REDIRECT'; payload: string | undefined }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: AppState = {
  sidebarOpen: false,
  currentPage: 'home',
  isLoading: false,
  
  filters: {
    sports: [],
    location: {},
    price: {},
    rating: undefined,
    availability: [],
    experience: 'any'
  },
  
  searchResults: [],
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
  recentSearches: JSON.parse(localStorage.getItem('recentSearches') || '[]'),
  
  theme: (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system',
  language: (localStorage.getItem('language') as 'pt' | 'en') || 'pt',
  notifications: {
    email: true,
    push: true,
    marketing: false,
    ...JSON.parse(localStorage.getItem('notifications') || '{}')
  },
  
  showWelcomeModal: !localStorage.getItem('hasVisited'),
  lastVisitedTrainer: localStorage.getItem('lastVisitedTrainer') || undefined,
  pendingRedirect: undefined
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
      
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'UPDATE_SPORT_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, sports: action.payload }
      };
      
    case 'UPDATE_LOCATION_FILTER':
      return {
        ...state,
        filters: { ...state.filters, location: { ...state.filters.location, ...action.payload } }
      };
      
    case 'UPDATE_PRICE_FILTER':
      return {
        ...state,
        filters: { ...state.filters, price: { ...state.filters.price, ...action.payload } }
      };
      
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          sports: state.filters.sports.map(sport => ({ ...sport, selected: false })),
          location: {},
          price: {},
          rating: undefined,
          availability: [],
          experience: 'any'
        }
      };
      
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
      
    case 'ADD_FAVORITE': {
      const newFavorites = [...state.favorites, action.payload];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return { ...state, favorites: newFavorites };
    }
    
    case 'REMOVE_FAVORITE': {
      const newFavorites = state.favorites.filter(id => id !== action.payload);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return { ...state, favorites: newFavorites };
    }
    
    case 'ADD_RECENT_SEARCH': {
      const newSearches = [action.payload, ...state.recentSearches.filter(s => s !== action.payload)].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      return { ...state, recentSearches: newSearches };
    }
    
    case 'CLEAR_RECENT_SEARCHES':
      localStorage.removeItem('recentSearches');
      return { ...state, recentSearches: [] };
      
    case 'UPDATE_PREFERENCES': {
      const newState = { ...state, ...action.payload };
      
      // Persistir preferências no localStorage
      if (action.payload.theme) {
        localStorage.setItem('theme', action.payload.theme);
      }
      if (action.payload.language) {
        localStorage.setItem('language', action.payload.language);
      }
      if (action.payload.notifications) {
        localStorage.setItem('notifications', JSON.stringify(action.payload.notifications));
      }
      
      return newState;
    }
    
    case 'SET_WELCOME_MODAL':
      if (!action.payload) {
        localStorage.setItem('hasVisited', 'true');
      }
      return { ...state, showWelcomeModal: action.payload };
      
    case 'SET_LAST_VISITED_TRAINER':
      localStorage.setItem('lastVisitedTrainer', action.payload);
      return { ...state, lastVisitedTrainer: action.payload };
      
    case 'SET_PENDING_REDIRECT':
      return { ...state, pendingRedirect: action.payload };
      
    case 'RESET_STATE':
      // Limpar localStorage relacionado ao estado
      localStorage.removeItem('favorites');
      localStorage.removeItem('recentSearches');
      localStorage.removeItem('lastVisitedTrainer');
      return { ...initialState, favorites: [], recentSearches: [], lastVisitedTrainer: undefined };
      
    default:
      return state;
  }
}

// Context
interface AppStateContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Actions helpers
  setSidebarOpen: (open: boolean) => void;
  setCurrentPage: (page: string) => void;
  setLoading: (loading: boolean) => void;
  updateFilters: (filters: Partial<GlobalFilters>) => void;
  clearFilters: () => void;
  addToFavorites: (id: string) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  updatePreferences: (preferences: Partial<AppState>) => void;
  resetAppState: () => void;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions
  const setSidebarOpen = (open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR', payload: open });
  };

  const setCurrentPage = (page: string) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const updateFilters = (filters: Partial<GlobalFilters>) => {
    if (filters.sports) {
      dispatch({ type: 'UPDATE_SPORT_FILTERS', payload: filters.sports });
    }
    if (filters.location) {
      dispatch({ type: 'UPDATE_LOCATION_FILTER', payload: filters.location });
    }
    if (filters.price) {
      dispatch({ type: 'UPDATE_PRICE_FILTER', payload: filters.price });
    }
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  const addToFavorites = (id: string) => {
    if (!state.favorites.includes(id)) {
      dispatch({ type: 'ADD_FAVORITE', payload: id });
    }
  };

  const removeFromFavorites = (id: string) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: id });
  };

  const isFavorite = (id: string) => {
    return state.favorites.includes(id);
  };

  const addRecentSearch = (query: string) => {
    if (query.trim()) {
      dispatch({ type: 'ADD_RECENT_SEARCH', payload: query.trim() });
    }
  };

  const clearRecentSearches = () => {
    dispatch({ type: 'CLEAR_RECENT_SEARCHES' });
  };

  const updatePreferences = (preferences: Partial<AppState>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  };

  const resetAppState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  const value: AppStateContextType = {
    state,
    dispatch,
    setSidebarOpen,
    setCurrentPage,
    setLoading,
    updateFilters,
    clearFilters,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addRecentSearch,
    clearRecentSearches,
    updatePreferences,
    resetAppState
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => {
  throw new Error('DEPRECATED: Use import { useAppState } from "../hooks/useAppState" instead');
};