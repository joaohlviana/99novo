/**
 * 🖼️ HOOK: useImageUrl
 * ====================
 * Hook para gerenciar URLs de imagem com fallbacks robustos
 */

import { useMemo } from 'react';
import { isSupabaseStorageUrl, isUrlExpired, selectBestImageUrl } from '../utils/image-fallback';

interface UseImageUrlOptions {
  type?: 'cover' | 'avatar' | 'general';
  size?: 'large' | 'small';
  debug?: boolean;
}

export function useImageUrl(
  urls: (string | null | undefined)[], 
  options: UseImageUrlOptions = {}
) {
  const { type = 'general', size = 'large', debug = false } = options;

  const result = useMemo(() => {
    const bestUrl = selectBestImageUrl(urls, type);
    
    if (debug && process.env.NODE_ENV === 'development') {
      console.log('[useImageUrl] URL Analysis:', {
        original: urls,
        selected: bestUrl,
        hasExpired: urls.some(url => url && isUrlExpired(url)),
        hasSupabase: urls.some(url => url && isSupabaseStorageUrl(url))
      });
    }

    return {
      url: bestUrl,
      isExpired: urls.some(url => url && isUrlExpired(url)),
      hasSupabaseUrls: urls.some(url => url && isSupabaseStorageUrl(url))
    };
  }, [urls, type, size, debug]);

  return result;
}

// Hook específico para covers de programa
export function useProgramCoverUrl(
  programData: any, 
  size: 'large' | 'small' = 'large',
  debug = false
) {
  const candidateUrls = useMemo(() => [
    programData?.program_data?.basic_info?.coverImage,
    programData?.media?.[0]?.url,
  ], [programData]);

  return useImageUrl(candidateUrls, { type: 'cover', size, debug });
}

// Hook específico para avatars de treinador
export function useTrainerAvatarUrl(
  trainerData: any,
  debug = false
) {
  const candidateUrls = useMemo(() => [
    trainerData?.avatar,
    trainerData?.profile_data?.avatar,
    trainerData?.trainer?.avatar,
  ], [trainerData]);

  return useImageUrl(candidateUrls, { type: 'avatar', size: 'small', debug });
}