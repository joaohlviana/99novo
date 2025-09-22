/**
 * Hook para gerenciamento de slugs
 * Fornece funcionalidades para resolver e navegar com slugs
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { slugService, type SlugResult } from '../services/slug.service';

interface UseSlugReturn {
  result: SlugResult | null;
  loading: boolean;
  error: string | null;
  resolveSlug: (slug: string) => Promise<SlugResult | null>;
  navigateToSlug: (result: SlugResult) => void;
  generateSeoUrl: (result: SlugResult) => string;
  isValidUuid: (str: string) => boolean;
}

export function useSlug(): UseSlugReturn {
  const [result, setResult] = useState<SlugResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Resolve um slug para qualquer tipo de entidade
   */
  const resolveSlug = useCallback(async (slug: string): Promise<SlugResult | null> => {
    if (!slug?.trim()) return null;

    setLoading(true);
    setError(null);

    try {
      const slugResult = await slugService.resolveBySlugOrId(slug);
      setResult(slugResult);
      return slugResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao resolver slug';
      setError(errorMessage);
      console.error('Erro no useSlug:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Navega para a URL SEO do resultado
   */
  const navigateToSlug = useCallback((slugResult: SlugResult) => {
    const url = slugService.generateSeoUrl(slugResult);
    navigate(url);
  }, [navigate]);

  /**
   * Gera URL SEO-friendly
   */
  const generateSeoUrl = useCallback((slugResult: SlugResult): string => {
    return slugService.generateSeoUrl(slugResult);
  }, []);

  /**
   * Verifica se uma string é UUID válido
   */
  const isValidUuid = useCallback((str: string): boolean => {
    return slugService.isValidUuid(str);
  }, []);

  return {
    result,
    loading,
    error,
    resolveSlug,
    navigateToSlug,
    generateSeoUrl,
    isValidUuid
  };
}

/**
 * Hook específico para resolver slug de trainer
 */
export function useTrainerSlug(slug?: string) {
  const [trainerData, setTrainerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const resolveTrainer = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await slugService.resolveTrainerSlug(slug);
        if (result) {
          setTrainerData(result.data);
        } else {
          setError('Treinador não encontrado');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar treinador');
        console.error('Erro ao resolver trainer slug:', err);
      } finally {
        setLoading(false);
      }
    };

    resolveTrainer();
  }, [slug]);

  return { trainerData, loading, error };
}

/**
 * Hook específico para resolver slug de program
 */
export function useProgramSlug(slug?: string) {
  const [programData, setProgramData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const resolveProgram = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await slugService.resolveProgramSlug(slug);
        if (result) {
          setProgramData(result.data);
        } else {
          setError('Programa não encontrado');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar programa');
        console.error('Erro ao resolver program slug:', err);
      } finally {
        setLoading(false);
      }
    };

    resolveProgram();
  }, [slug]);

  return { programData, loading, error };
}

/**
 * Hook específico para resolver slug de sport
 */
export function useSportSlug(slug?: string) {
  const [sportData, setSportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const resolveSport = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await slugService.resolveSportSlug(slug);
        if (result) {
          setSportData(result.data);
        } else {
          setError('Esporte não encontrado');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar esporte');
        console.error('Erro ao resolver sport slug:', err);
      } finally {
        setLoading(false);
      }
    };

    resolveSport();
  }, [slug]);

  return { sportData, loading, error };
}