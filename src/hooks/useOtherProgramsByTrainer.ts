/**
 * 📚 HOOK: useOtherProgramsByTrainer
 * ==================================
 * Busca outros programas do mesmo treinador usando tabela real
 * Usado na seção "Mais programas do treinador"
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';
import type { DbProgramRow, DbPublishedProgramRow } from '../types/database-views';

interface UseOtherProgramsByTrainerOptions {
  enabled?: boolean;
}

export function useOtherProgramsByTrainer(
  trainerId: string, 
  excludeProgramId?: string, 
  limit = 3,
  options: UseOtherProgramsByTrainerOptions = {}
) {
  return useQuery({
    queryKey: ['trainer-other-programs', trainerId, excludeProgramId, limit],
    queryFn: async (): Promise<DbProgramRow[]> => {
      if (!trainerId?.trim()) {
        console.warn('[OTHER_PROGRAMS_QUERY] ID do treinador vazio');
        return [];
      }

      console.log('[OTHER_PROGRAMS_QUERY] 🔍 Buscando outros programas do treinador:', trainerId, 
        'excluindo:', excludeProgramId, 'limite:', limit);

      try {
        // Estratégia 1: View published_programs_by_trainer (otimizada)
        const viewResult = await tryPublishedProgramsView(trainerId, excludeProgramId, limit);
        if (viewResult.length > 0) {
          console.log('[OTHER_PROGRAMS_QUERY] ✅', viewResult.length, 'programas encontrados na view');
          return viewResult;
        }

        // Estratégia 2: Busca direta na tabela principal
        console.log('[OTHER_PROGRAMS_QUERY] 🔄 Tentando busca direta na tabela principal...');
        const directResult = await tryDirectTableQuery(trainerId, excludeProgramId, limit);
        
        console.log('[OTHER_PROGRAMS_QUERY] ✅', directResult.length, 'programas encontrados na tabela');
        return directResult;

      } catch (error: any) {
        console.error('[OTHER_PROGRAMS_QUERY] ❌ Erro ao buscar outros programas:', error.message);
        return [];
      }
    },
    enabled: options.enabled !== false && Boolean(trainerId?.trim()),
    staleTime: 300_000, // 5 minutos
    gcTime: 600_000, // 10 minutos
    retry: 1, // Retry apenas uma vez
  });
}

// 🔍 Função auxiliar para tentar a view published_programs_by_trainer
async function tryPublishedProgramsView(
  trainerId: string, 
  excludeProgramId?: string, 
  limit = 3
): Promise<DbProgramRow[]> {
  try {
    let query = supabase
      .from('published_programs_by_trainer')
      .select(`
        id, trainer_id, trainer_user_id, slug, trainer_name,
        title, category, level, modality, modality_norm,
        base_price, display_price, status_norm, is_published,
        duration, duration_type, frequency, program_data,
        cover_image, short_description, created_at, updated_at
      `)
      .eq('trainer_id', trainerId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (excludeProgramId) {
      query = query.neq('id', excludeProgramId);
    }

    const { data, error } = await query;

    if (error) {
      console.log('[OTHER_PROGRAMS_QUERY] ⚠️ View não disponível:', error.message);
      return [];
    }

    // Usar adaptador otimizado para view (sem necessidade de converter)
    return (data as DbPublishedProgramRow[]).map(convertPublishedToDbProgram);
    
  } catch (error) {
    console.log('[OTHER_PROGRAMS_QUERY] ⚠️ Erro na view, usando fallback');
    return [];
  }
}

// 🔍 Função auxiliar para busca direta na tabela
async function tryDirectTableQuery(
  trainerId: string, 
  excludeProgramId?: string, 
  limit = 3
): Promise<DbProgramRow[]> {
  let query = supabase
    .from('99_training_programs')
    .select(`
      id, trainer_id, title, category, modality, level,
      duration, frequency, base_price, thumbnail,
      program_data, is_published, status,
      created_at, updated_at
    `)
    .eq('trainer_id', trainerId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (excludeProgramId) {
    query = query.neq('id', excludeProgramId);
  }

  const { data, error } = await query;

  if (error) {
    console.warn('[OTHER_PROGRAMS_QUERY] ❌ Erro na busca direta:', error.message);
    throw error;
  }

  return (data as DbProgramRow[]) || [];
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