import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

export interface DatabaseSport {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  icon_name?: string;
  cover_image_url?: string;
  icon_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Hook para buscar esportes do banco de dados
 */
export function useSports() {
  const [sports, setSports] = useState<DatabaseSport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSports() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('sports')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        setSports(data || []);
      } catch (err) {
        console.error('Erro ao buscar esportes:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchSports();
  }, []);

  return {
    sports,
    loading,
    error,
    // Funções utilitárias
    getSportById: (sportId: string) => sports.find(sport => sport.id === sportId),
    getSportBySlug: (slug: string) => sports.find(sport => sport.slug === slug),
    searchSportsByName: (query: string) => {
      const searchTerm = query.toLowerCase().trim();
      if (!searchTerm) return [];
      return sports.filter(sport => sport.name.toLowerCase().includes(searchTerm));
    },
    refetch: () => {
      fetchSports();
    }
  };
}

/**
 * Hook simplificado para buscar apenas a lista de esportes
 */
export function useAllSports() {
  const { sports, loading, error } = useSports();
  return { sports, loading, error };
}