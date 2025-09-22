import React, { useState, useCallback, useMemo } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTM5Mzk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VtIG7Do28gZW5jb250cmFkYTwvdGV4dD4KPC9zdmc+'

const FALLBACK_URLS = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1606889803107-66dd7d7c9bfb?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&auto=format&q=80',
  ERROR_IMG_SRC
]

const isSupabaseStorageUrl = (url: string): boolean => {
  return url?.includes('supabase.co/storage') || false;
}

const isUrlExpired = (url: string): boolean => {
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
}

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [didError, setDidError] = useState(false)
  
  // Verifica se a URL inicial está obviamente expirada
  const initialSrc = useMemo(() => {
    if (props.src && isUrlExpired(props.src)) {
      console.log('[ImageWithFallback] URL inicial detectada como expirada, usando fallback');
      return FALLBACK_URLS[0];
    }
    return props.src;
  }, [props.src])

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement
    const currentSrc = target.src

    // Se já estamos no placeholder final, não tenta mais
    if (currentSrc === ERROR_IMG_SRC || didError) {
      setDidError(true)
      return
    }

    // Log para debug em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('[ImageWithFallback] Erro ao carregar imagem:', {
        original: props.src,
        current: currentSrc,
        isSupabase: isSupabaseStorageUrl(currentSrc),
        isExpired: isUrlExpired(currentSrc),
        currentIndex
      });
    }

    // Se é o primeiro erro e é uma URL do Supabase expirada, pula direto para os fallbacks
    if (currentIndex === 0 && isSupabaseStorageUrl(currentSrc) && isUrlExpired(currentSrc)) {
      setCurrentIndex(1);
      target.src = FALLBACK_URLS[1];
      return;
    }

    // Se é o primeiro erro, tenta os fallbacks
    if (currentIndex < FALLBACK_URLS.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      target.src = FALLBACK_URLS[nextIndex]
    } else {
      // Último recurso: placeholder
      setDidError(true)
      target.src = ERROR_IMG_SRC
    }

    // Chama o onError original se existir
    if (props.onError) {
      props.onError(e)
    }
  }, [currentIndex, didError, props.onError])

  const { src, alt, style, className, onError, ...rest } = props

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt={alt || "Imagem não encontrada"} {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img 
      src={initialSrc} 
      alt={alt} 
      className={className} 
      style={style} 
      {...rest} 
      onError={handleError}
      loading="lazy"
    />
  )
}
