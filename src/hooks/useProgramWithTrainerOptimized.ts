/**
 * 🎯 HOOK OTIMIZADO: useProgramWithTrainerOptimized
 * =================================================
 * Hook especializado que usa a view published_programs_by_trainer
 * para carregar programa + dados básicos do trainer em uma query
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';
import { toUiProgramFromView } from '../utils/toUiProgram';
import type { DbPublishedProgramRow, UiProgram } from '../types/database-views';

export function useProgramWithTrainerOptimized(idOrSlug: string) {
  // Heurística melhorada para determinar se é UUID ou slug
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(idOrSlug);
  
  console.log('[OPTIMIZED_PROGRAM_QUERY] Inicializando hook:', { idOrSlug, isUuid });

  return useQuery({
    queryKey: ['program-with-trainer-optimized', idOrSlug],
    queryFn: async (): Promise<UiProgram | null> => {
      if (!idOrSlug?.trim()) {
        console.warn('[OPTIMIZED_PROGRAM_QUERY] ID/slug vazio');
        return null;
      }

      console.log('[OPTIMIZED_PROGRAM_QUERY] 🔍 Executando query para:', { idOrSlug, isUuid });

      try {
        // Primeiro, tentar como ID (estratégia principal)
        if (isUuid) {
          console.log('[OPTIMIZED_PROGRAM_QUERY] 🔍 Buscando por ID UUID...');
          
          const { data, error } = await supabase
            .from('published_programs_by_trainer')
            .select('*')
            .eq('id', idOrSlug)
            .eq('is_published', true)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              console.log('[OPTIMIZED_PROGRAM_QUERY] ❌ Programa não encontrado por ID:', idOrSlug);
              return null;
            }
            console.warn('[OPTIMIZED_PROGRAM_QUERY] ❌ Erro na consulta por ID:', error.message);
            throw error;
          }

          if (!data) {
            console.log('[OPTIMIZED_PROGRAM_QUERY] ❌ Nenhum dado retornado por ID');
            return null;
          }

          console.log('[OPTIMIZED_PROGRAM_QUERY] ✅ Programa encontrado por ID:', data.title);
          console.log('[OPTIMIZED_PROGRAM_QUERY] 🐛 TODAS AS COLUNAS DISPONÍVEIS:', Object.keys(data));
          console.log('[OPTIMIZED_PROGRAM_QUERY] 🐛 DADOS RAW COMPLETOS (por ID):', JSON.stringify(data, null, 2));
          return toUiProgramFromView(data as DbPublishedProgramRow);

        } else {
          // Para não-UUID, tentar como slug (strategy fallback)
          console.log('[OPTIMIZED_PROGRAM_QUERY] 🔍 Buscando por slug...');
          
          const { data, error } = await supabase
            .from('published_programs_by_trainer')
            .select('*')
            .eq('slug', idOrSlug)
            .eq('is_published', true)
            .limit(1)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              console.log('[OPTIMIZED_PROGRAM_QUERY] ❌ Programa não encontrado por slug:', idOrSlug);
              return null;
            }
            console.warn('[OPTIMIZED_PROGRAM_QUERY] ❌ Erro na consulta por slug:', error.message);
            throw error;
          }

          if (!data) {
            console.log('[OPTIMIZED_PROGRAM_QUERY] ❌ Nenhum dado retornado por slug');
            return null;
          }

          console.log('[OPTIMIZED_PROGRAM_QUERY] ✅ Programa encontrado por slug:', data.title);
          console.log('[OPTIMIZED_PROGRAM_QUERY] 🐛 TODAS AS COLUNAS DISPONÍVEIS:', Object.keys(data));
          console.log('[OPTIMIZED_PROGRAM_QUERY] 🐛 DADOS RAW COMPLETOS (por slug):', JSON.stringify(data, null, 2));
          return toUiProgramFromView(data as DbPublishedProgramRow);
        }

      } catch (error: any) {
        console.error('[OPTIMIZED_PROGRAM_QUERY] ❌ Erro crítico:', error.message);
        throw error;
      }
    },
    enabled: Boolean(idOrSlug?.trim()),
    staleTime: 300_000, // 5 minutos
    gcTime: 600_000, // 10 minutos
    retry: (failureCount, error: any) => {
      // Não retry para recursos não encontrados
      if (error?.code === 'PGRST116') return false;
      return failureCount < 2;
    },
  });
}