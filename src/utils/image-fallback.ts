/**
 * 🖼️ UTILITÁRIOS DE FALLBACK DE IMAGEM
 * ====================================
 * Utilitários simples para detecção e fallback de URLs de imagem
 */

export const isSupabaseStorageUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('supabase.co/storage');
};

export const isUrlExpired = (url: string): boolean => {
  if (!isSupabaseStorageUrl(url)) return false;
  
  try {
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token');
    if (!token) return false;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp < now;
  } catch {
    return true;
  }
};

export const getFallbackImageUrls = (type: 'cover' | 'avatar' | 'general' = 'general'): string[] => {
  const fallbacks = {
    cover: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1606889803107-66dd7d7c9bfb?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&auto=format&q=80',
    ],
    avatar: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    ],
    general: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1606889803107-66dd7d7c9bfb?w=800&h=600&fit=crop&auto=format&q=80',
    ]
  };

  return fallbacks[type] || fallbacks.general;
};

export const selectBestImageUrl = (urls: (string | null | undefined)[], type: 'cover' | 'avatar' | 'general' = 'general'): string => {
  // Filtra URLs válidas
  const validUrls = urls.filter((url): url is string => Boolean(url));
  
  // Procura por URLs não expiradas
  for (const url of validUrls) {
    if (!isUrlExpired(url)) {
      return url;
    }
  }

  // Se todas estão expiradas ou não há URLs, usa fallback
  const fallbacks = getFallbackImageUrls(type);
  return fallbacks[0];
};