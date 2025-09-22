import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// 🔧 Hook separado para intersection observer
export function useIntersectionObserver(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!targetRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(targetRef);

    return () => {
      if (targetRef) {
        observer.unobserve(targetRef);
      }
    };
  }, [targetRef, options]);

  return [isVisible, setTargetRef] as const;
}

// 🎯 Hook para debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 🔄 Hook para filtros persistentes
export function usePersistentFilters(key: string, defaultValue: any) {
  const [filters, setFilters] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setPersistedFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
    try {
      localStorage.setItem(key, JSON.stringify(newFilters));
    } catch {
      console.warn('Failed to persist filters to localStorage');
    }
  }, [key]);

  return [filters, setPersistedFilters] as const;
}

// 📊 Hook para monitoramento de performance
export function usePerformanceMonitor(operation: string) {
  const startTime = useRef<number>();
  
  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const end = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current;
      console.log(`🔍 FASE 4: ${operation} executado em ${duration.toFixed(2)}ms`);
    }
  }, [operation]);

  return { start, end };
}

// 🎯 Hook para lazy loading
export function useLazyLoading(threshold = 0.1) {
  const [loadedItems, setLoadedItems] = useState(new Set<string>());
  const [isVisible, targetRef] = useIntersectionObserver({ threshold });

  const markAsLoaded = useCallback((id: string) => {
    setLoadedItems(prev => new Set(prev).add(id));
  }, []);

  const isLoaded = useCallback((id: string) => {
    return loadedItems.has(id);
  }, [loadedItems]);

  return {
    isVisible,
    targetRef,
    markAsLoaded,
    isLoaded,
    loadedItems: loadedItems.size
  };
}

// 🚀 Hook para virtual scrolling  
export function useVirtualScrolling(itemHeight: number, containerHeight: number, totalItems: number) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 2, totalItems); // +2 para buffer
    
    return { start, end, visibleCount };
  }, [scrollTop, itemHeight, containerHeight, totalItems]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleRange,
    handleScroll,
    totalHeight: totalItems * itemHeight,
    containerStyle: {
      height: containerHeight,
      overflow: 'auto'
    }
  };
}

// 📱 Hook para batch size otimizado
export function useOptimalBatchSize() {
  return useCallback(() => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;
    
    if (isMobile) return 6;
    if (isTablet) return 9;
    return 12;
  }, []);
}

// 🎯 Hook para preload inteligente
export function useSmartPreload() {
  const [preloadQueue, setPreloadQueue] = useState<string[]>([]);
  const [userBehavior, setUserBehavior] = useState({
    lastCategory: '',
    averageTime: 0,
    scrollSpeed: 'normal' as 'slow' | 'normal' | 'fast'
  });

  const trackUserBehavior = useCallback((category: string, timeSpent: number) => {
    setUserBehavior(prev => ({
      lastCategory: category,
      averageTime: (prev.averageTime + timeSpent) / 2,
      scrollSpeed: timeSpent < 1000 ? 'fast' : timeSpent > 5000 ? 'slow' : 'normal'
    }));
  }, []);

  return {
    preloadQueue,
    userBehavior,
    trackUserBehavior
  };
}

// 🚀 FASE 4: Hook principal de otimização avançada para catálogo
export function useOptimizedCatalog() {
  const getOptimalBatchSize = useOptimalBatchSize();

  return {
    useDebounce,
    usePersistentFilters,
    usePerformanceMonitor,
    useLazyLoading,
    useVirtualScrolling,
    getOptimalBatchSize,
    useSmartPreload
  };
}