/**
 * 🗂️ CONTEXTS INDEX - REACT CONTEXT PADRÃO
 * 
 * Centraliza exports dos contexts React seguindo padrões oficiais do Supabase.
 * useAuth removido - use diretamente de /contexts/AuthContext.tsx
 */

// Primary store hooks (mantidos para outras funcionalidades)
export { 
  useAppStore,
  useLoadingState,
  useErrorState,
} from '../stores/app-store';

export { 
  useUIStore,
  useFavorites,
  useSearch,
  useUIPreferences,
  useUILayout,
  useModals,
} from '../stores/ui-store';

export {
  useFiltersStore,
  useProgramFilters,
  useTrainerFilters,
  useQuickFilters,
} from '../stores/filters-store';

export {
  useNavigationStore,
  useCurrentRoute,
  useBreadcrumbs,
  useNavigationMenu,
  usePageMeta,
  useNavigationHistory,
} from '../stores/navigation-store';

// Specialized hooks (sem useAuth - use diretamente do AuthContext)
export { useAppState } from '../hooks/useAppState';
export { useNavigation } from '../hooks/useNavigation';