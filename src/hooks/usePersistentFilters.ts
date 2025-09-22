import { useState, useCallback } from 'react';

// 🔄 Hook para filtros persistentes
export function usePersistentFilters(key: string, defaultValue: any) {
  const [filters, setFilters] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setPersistedFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
    try {
      localStorage.setItem(key, JSON.stringify(newFilters));
    } catch {
      console.warn('Failed to persist filters to localStorage');
    }
  }, [key]);

  return [filters, setPersistedFilters] as const;
}