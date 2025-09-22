/**
 * ⚠️ ARQUIVO SIMPLIFICADO - useAppState
 * 
 * Este hook foi simplificado. Para funcionalidades específicas, use diretamente:
 * - useUIStore() para estados de UI
 * - useFiltersStore() para filtros
 * - useAppStore() para configurações globais
 * 
 * Mantém apenas compatibilidade básica com código legado.
 */

import { useUIStore } from '../stores/ui-store';
import { useAppStore } from '../stores/app-store';

export function useAppState() {
  // Funcionalidades básicas mais usadas
  const { sidebarOpen, setSidebarOpen, favorites, addToFavorites, removeFromFavorites, isFavorite } = useUIStore();
  const { theme, language, setTheme, setLanguage, loading, errors, setError, clearError } = useAppStore();

  // Estrutura simplificada para compatibilidade
  const state = {
    sidebarOpen,
    isLoading: Object.values(loading).some(Boolean),
    favorites,
    theme,
    language,
  };

  return {
    state,
    // Funcionalidades mais comuns
    setSidebarOpen,
    setTheme,
    setLanguage,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    setError,
    clearError,
    getError: (key: string) => errors[key],
    // Função para reset (compatibilidade)
    resetAppState: () => {
      // Reset básico - pode ser expandido conforme necessário
    },
  };
}

// Hooks específicos para diferentes aspectos do estado
export const useAppLoading = () => {
  const { loading, setLoading, clearLoading, getLoading } = useAppStore();
  
  return {
    loading,
    setLoading,
    clearLoading,
    isLoading: (key: string) => getLoading(key),
  };
};

export const useAppErrors = () => {
  const { errors, setError, clearError, clearAllErrors } = useAppStore();
  
  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    hasError: (key: string) => !!errors[key],
    getError: (key: string) => errors[key],
  };
};

export const useAppPreferences = () => {
  const { theme, language, region, setTheme, setLanguage, setRegion } = useAppStore();
  const { preferences, updatePreferences } = useUIStore();
  
  return {
    theme,
    language,
    region,
    setTheme,
    setLanguage,
    setRegion,
    uiPreferences: preferences,
    updateUIPreferences: updatePreferences,
  };
};