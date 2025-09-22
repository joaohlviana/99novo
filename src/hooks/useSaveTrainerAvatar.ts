/**
 * 🎯 HOOK DE MUTAÇÃO PARA AVATAR
 * 
 * Hook React Query para salvar avatar com invalidação de cache
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveTrainerAvatar, cleanOldAvatars } from '../services/trainer-profile.service';

// 4) Hook de mutação (React Query) - versão otimizada
export function useSaveTrainerAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, file, cleanOld = false }: { 
      userId: string; 
      file: File; 
      cleanOld?: boolean;
    }) => {
      // Upload do novo avatar
      const result = await saveTrainerAvatar(userId, file);
      
      // Limpeza opcional de arquivos antigos
      if (cleanOld) {
        try {
          await cleanOldAvatars(userId);
          console.log('🧹 Limpeza de avatars antigos concluída');
        } catch (error) {
          console.warn('⚠️ Limpeza falhou (não crítico):', error);
          // Não interrompe o fluxo principal
        }
      }
      
      return result;
    },
    
    onSuccess: (trainer) => {
      console.log('♻️ Cache invalidado após upload de avatar');
      
      // OnSuccess: Invalidar/mutar os caches
      queryClient.invalidateQueries({ queryKey: ['trainer', 'bySlug', trainer.slug] });
      queryClient.invalidateQueries({ queryKey: ['trainer', 'byUser', trainer.user_id] });
      queryClient.invalidateQueries({ queryKey: ['trainers', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['programs', 'public'] });
      queryClient.invalidateQueries({ queryKey: ['programs', 'byTrainer', trainer.user_id] });
    },

    onError: (error) => {
      console.error('❌ Erro ao salvar avatar:', error);
      // toast.error seria aqui se tivesse
    }
  });
}