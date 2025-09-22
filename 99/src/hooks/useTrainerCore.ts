/**
 * 👨‍🏫 HOOK: useTrainerCore
 * =========================
 * Busca dados do treinador na tabela 99_trainer_profile_hybrid
 * Complementa dados que faltarem do programa
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';
import type { DbTrainerRow } from '../types/database-views';

export function useTrainerCore(trainerId: string) {
  return useQuery({
    queryKey: ['trainer-core', trainerId],
    queryFn: async (): Promise<DbTrainerRow | null> => {
      if (!trainerId?.trim()) {
        console.warn('[TRAINER_QUERY] ID do treinador vazio');
        return null;
      }

      console.log('[TRAINER_QUERY] 🔍 Buscando dados do treinador:', trainerId);

      try {
        // Estratégia 1: View trainers_with_slugs (fonte otimizada)
        const { data, error } = await supabase
          .from('trainers_with_slugs')
          .select(`
            id, user_id, name, email, phone, role, 
            is_active, is_verified, profile_data, slug,
            created_at, updated_at
          `)
          .eq('user_id', trainerId)
          .single();

        if (!error && data) {
          console.log('[TRAINER_QUERY] ✅ Treinador encontrado na view:', data.name);
          return data as DbTrainerRow;
        }

        if (error?.code !== 'PGRST116') {
          console.warn('[TRAINER_QUERY] ⚠️ Erro na view trainers_with_slugs:', error.message);
        }

        // Estratégia 2: Fallback direto para tabela base se disponível
        console.log('[TRAINER_QUERY] ⚠️ View principal não encontrou, tentando estratégias alternativas');

        // Estratégia 3: Fallback para auth.users (limitado)
        console.log('[TRAINER_QUERY] 🔄 Tentando fallback para auth.users...');
        
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('id, email, raw_user_meta_data')
          .eq('id', trainerId)
          .single();

        if (userError) {
          if (userError.code === 'PGRST116') {
            console.log('[TRAINER_QUERY] ❌ Treinador não encontrado em nenhuma fonte');
            return null;
          }
          console.warn('[TRAINER_QUERY] ❌ Erro no fallback auth.users:', userError.message);
          throw userError;
        }

        // Construir objeto básico do treinador
        const metadata = userData.raw_user_meta_data || {};
        const basicTrainer: DbTrainerRow = {
          id: userData.id,
          user_id: userData.id,
          name: metadata.full_name || metadata.name || metadata.displayName || 'Treinador',
          email: userData.email,
          profile_photo: metadata.avatar_url || metadata.picture,
          bio: metadata.bio || undefined,
          location_data: metadata.location_data || {},
          profile_data: metadata || {},
          is_verified: metadata.is_verified || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('[TRAINER_QUERY] ⚠️ Usando dados básicos do auth.users:', basicTrainer.name);
        return basicTrainer;

      } catch (error: any) {
        console.error('[TRAINER_QUERY] ❌ Erro crítico ao buscar treinador:', error.message);
        throw error;
      }
    },
    enabled: !!trainerId?.trim(),
    staleTime: 300_000, // 5 minutos
    gcTime: 600_000, // 10 minutos no cache
    retry: (failureCount, error: any) => {
      // Não retry para usuários não encontrados
      if (error?.code === 'PGRST116') return false;
      return failureCount < 2;
    },
  });
}