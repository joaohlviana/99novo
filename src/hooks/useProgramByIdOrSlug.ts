/**
 * 🔍 HOOK: useProgramByIdOrSlug
 * =============================
 * Busca programa por ID diretamente na tabela 99_training_programs
 * ou na view published_programs_by_trainer se disponível
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';
import type { DbProgramRow, DbPublishedProgramRow } from '../types/database-views';

export function useProgramByIdOrSlug(idOrSlug: string) {
  // Heurística melhorada: UUID v4 ou busca por slug
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(idOrSlug);

  return useQuery({
    queryKey: ['program-by-id-or-slug', idOrSlug],
    queryFn: async (): Promise<DbProgramRow | null> => {
      if (!idOrSlug?.trim()) {
        console.warn('[PROGRAM_QUERY] ID/slug vazio fornecido');
        return null;
      }

      console.log('[PROGRAM_QUERY] 🔍 Buscando programa por', isUuid ? 'UUID' : 'slug', ':', idOrSlug);

      try {
        if (isUuid) {
          // Busca otimizada por ID na tabela principal (usar cover_image, não thumbnail)
          const { data, error } = await supabase
            .from('99_training_programs')
            .select(`
              id, trainer_id, title, category, modality, level,
              duration, frequency, base_price, cover_image,
              program_data, is_published, status,
              created_at, updated_at
            `)
            .eq('id', idOrSlug)
            .eq('is_published', true)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              console.log('[PROGRAM_QUERY] ❌ Programa não encontrado por ID:', idOrSlug);
              return null;
            }
            console.warn('[PROGRAM_QUERY] ❌ Erro na consulta por ID:', error.message);
            throw error;
          }

          console.log('[PROGRAM_QUERY] ✅ Programa encontrado por ID:', data.title);
          return {
            ...data,
            thumbnail: data.cover_image // Mapear cover_image para thumbnail
          } as DbProgramRow;
          
        } else {
          // Busca por slug - tentar múltiplas estratégias
          console.log('[PROGRAM_QUERY] 🔍 Tentando busca por slug:', idOrSlug);
          
          // Estratégia 1: View published_programs_by_trainer
          try {
            const { data: viewData, error: viewError } = await supabase
              .from('published_programs_by_trainer')
              .select(`
                id, trainer_id, trainer_user_id, slug, trainer_name,
                title, category, level, modality, modality_norm,
                base_price, display_price, status_norm, is_published,
                duration, duration_type, frequency, program_data,
                cover_image, short_description, created_at, updated_at
              `)
              .eq('slug', idOrSlug)
              .eq('is_published', true)
              .limit(1)
              .single();

            if (!viewError && viewData) {
              console.log('[PROGRAM_QUERY] ✅ Programa encontrado na view por trainer slug:', viewData.title);
              return convertPublishedToDbProgram(viewData);
            }
          } catch (viewError) {
            console.log('[PROGRAM_QUERY] ⚠️ View não disponível ou erro:', viewError);
          }

          // Estratégia 2: Busca na tabela principal por possível ID na forma de slug
          if (idOrSlug.length > 10) { // possível ID não-UUID
            try {
              const { data: directData, error: directError } = await supabase
                .from('99_training_programs')
                .select(`
                  id, trainer_id, title, category, modality, level,
                  duration, frequency, base_price, cover_image,
                  program_data, is_published, status,
                  created_at, updated_at
                `)
                .eq('id', idOrSlug)
                .eq('is_published', true)
                .single();

              if (!directError && directData) {
                console.log('[PROGRAM_QUERY] ✅ Programa encontrado por ID direto:', directData.title);
                return {
                  ...directData,
                  thumbnail: directData.cover_image // Mapear cover_image para thumbnail
                } as DbProgramRow;
              }
            } catch (error) {
              console.log('[PROGRAM_QUERY] ID direto não funcionou, continuando...');
            }
          }

          console.log('[PROGRAM_QUERY] ❌ Programa não encontrado por slug:', idOrSlug);
          return null;
        }
        
      } catch (error: any) {
        console.error('[PROGRAM_QUERY] ❌ Erro crítico na busca:', error.message);
        throw error;
      }
    },
    staleTime: 300_000, // 5 minutos (mais agressivo para performance)
    gcTime: 600_000, // 10 minutos no cache
    enabled: !!idOrSlug?.trim(),
    retry: (failureCount, error: any) => {
      // Não retry para recursos não encontrados
      if (error?.code === 'PGRST116') return false;
      return failureCount < 2;
    },
  });
}

// 🔄 Função auxiliar para converter view para estrutura da tabela
function convertPublishedToDbProgram(program: DbPublishedProgramRow): DbProgramRow {
  return {
    id: program.id,
    trainer_id: program.trainer_id,
    title: program.title,
    category: program.category,
    modality: program.modality,
    level: program.level,
    duration: program.duration?.toString() || '',
    frequency: program.frequency?.toString() || '',
    base_price: program.base_price,
    thumbnail: program.cover_image,
    program_data: {
      ...program.program_data,
      description: {
        overview: program.short_description,
        shortDescription: program.short_description,
        ...program.program_data?.description
      },
      basic_info: {
        duration: program.duration,
        duration_type: program.duration_type,
        frequency: program.frequency,
        display_price: program.display_price,
        ...program.program_data?.basic_info
      }
    },
    is_published: program.is_published,
    status: program.status_norm || 'published',
    created_at: program.created_at,
    updated_at: program.updated_at
  };
}