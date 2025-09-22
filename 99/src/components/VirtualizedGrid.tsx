import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { OptimizedTrainerCard } from './OptimizedTrainerCard';
import { ProgramsGrid } from './ProgramsGrid';
import { TrainerCardSkeleton } from './skeletons/TrainerCardSkeleton';
import { ProgramCardSkeleton } from './skeletons/ProgramCardSkeleton';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useOptimalBatchSize, useSmartPreload } from '../hooks/useOptimizedCatalog';

interface CatalogTrainer {
  id: string;
  slug?: string | null;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  specialties: string[];
  verified: boolean;
  isTopRated: boolean;
  languages?: string[];
  title?: string;
  description?: string;
  skills?: string[];
  portfolioImages: string[];
  priceFrom: string;
  programs?: any[];
}

interface VirtualizedGridProps {
  items: CatalogTrainer[] | any[];
  contentType: 'trainers' | 'programs';
  onItemClick: (item: any) => void;
  isLoading: boolean;
  className?: string;
}

// 🚀 FASE 4: Grid virtualizado com carregamento progressivo
const VirtualizedGrid = memo<VirtualizedGridProps>(({
  items,
  contentType,
  onItemClick,
  isLoading,
  className = ''
}) => {
  // 🎯 Hooks de otimização individuais
  const getOptimalBatchSize = useOptimalBatchSize();
  const { userBehavior, trackUserBehavior } = useSmartPreload();
  
  // 📊 Performance monitoring
  const { start, end } = usePerformanceMonitor('VirtualizedGrid');
  
  // 📱 Estados para virtualização
  const [visibleItems, setVisibleItems] = useState(getOptimalBatchSize());
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // 🎯 Batch size otimizado
  const batchSize = useMemo(() => getOptimalBatchSize(), [getOptimalBatchSize]);
  
  // 📊 Itens visíveis memoizados
  const currentItems = useMemo(() => {
    start();
    const result = items.slice(0, visibleItems);
    end();
    return result;
  }, [items, visibleItems, start, end]);

  // 🔄 Carregamento progressivo baseado no scroll
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || visibleItems >= items.length) return;
    
    setIsLoadingMore(true);
    
    // Simular delay realista baseado no comportamento do usuário
    const delay = userBehavior.scrollSpeed === 'fast' ? 100 : 
                 userBehavior.scrollSpeed === 'slow' ? 500 : 300;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    setVisibleItems(prev => Math.min(prev + batchSize, items.length));
    setIsLoadingMore(false);
  }, [isLoadingMore, visibleItems, items.length, batchSize, userBehavior.scrollSpeed]);

  // 🎯 Intersection Observer para carregamento automático
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const sentinel = document.getElementById('load-more-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [handleLoadMore, isLoadingMore]);

  // 📱 Responsive grid classes
  const gridClasses = contentType === 'trainers' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  // 🎯 Determinar prioridade de carregamento
  const getItemPriority = useCallback((index: number) => {
    if (index < 3) return 'high';
    if (index < 9) return 'normal';
    return 'low';
  }, []);

  // 🎭 Render de skeletons enquanto carrega
  const renderSkeletons = useCallback(() => {
    const skeletonCount = Math.min(batchSize, 6);
    return Array.from({ length: skeletonCount }, (_, index) => (
      contentType === 'trainers' ? (
        <TrainerCardSkeleton key={`skeleton-${index}`} />
      ) : (
        <ProgramCardSkeleton key={`skeleton-${index}`} />
      )
    ));
  }, [batchSize, contentType]);

  if (isLoading) {
    return (
      <div className={`${gridClasses} ${className}`}>
        {renderSkeletons()}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 📋 Grid principal */}
      <div className={gridClasses}>
        {currentItems.map((item, index) => {
          if (contentType === 'trainers') {
            return (
              <OptimizedTrainerCard
                key={item.id}
                trainer={item}
                onClick={onItemClick}
                index={index}
                priority={getItemPriority(index)}
              />
            );
          } else {
            // Para programas, usar o grid existente mas com otimizações
            return (
              <div key={item.id} className="program-card-wrapper">
                <ProgramsGrid
                  programs={[item]}
                  onProgramClick={onItemClick}
                />
              </div>
            );
          }
        })}
      </div>

      {/* 🎯 Sentinel para carregamento automático */}
      {visibleItems < items.length && (
        <div id="load-more-sentinel" className="w-full py-8 flex justify-center">
          {isLoadingMore ? (
            <div className={gridClasses}>
              {renderSkeletons()}
            </div>
          ) : (
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Carregar mais ({items.length - visibleItems} restantes)
            </button>
          )}
        </div>
      )}

      {/* 📊 Status de performance em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          🚀 FASE 4: Grid virtualizado • Mostrando {visibleItems} de {items.length} itens • 
          Batch size: {batchSize} • Velocidade: {userBehavior.scrollSpeed}
        </div>
      )}
    </div>
  );
});

VirtualizedGrid.displayName = 'VirtualizedGrid';

export { VirtualizedGrid };