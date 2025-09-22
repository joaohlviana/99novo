import React, { memo, useState, useCallback } from 'react';
import { ModernProfileCard } from './ModernProfileCard';
import { TrainerCardSkeleton } from './skeletons/TrainerCardSkeleton';
import { useIntersectionObserver } from '../hooks/useOptimizedCatalog';

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

interface OptimizedTrainerCardProps {
  trainer: CatalogTrainer;
  onClick: (trainer: CatalogTrainer) => void;
  index: number;
  priority?: 'high' | 'normal' | 'low';
}

// 🚀 FASE 4: Card otimizado com lazy loading e memoização
const OptimizedTrainerCard = memo<OptimizedTrainerCardProps>(({ 
  trainer, 
  onClick, 
  index, 
  priority = 'normal' 
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // 🎯 Intersection Observer para lazy loading
  const [isVisible, targetRef] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: priority === 'high' ? '200px' : '100px'
  });

  // 📸 Preload de imagem otimizado
  const handleImageLoad = useCallback(() => {
    setHasLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setHasError(true);
    setHasLoaded(true);
  }, []);

  // 🎯 Determinar se deve renderizar conteúdo ou skeleton
  const shouldRenderContent = isVisible || priority === 'high' || index < 6;

  // 📱 Render otimizado baseado na visibilidade
  return (
    <div 
      ref={targetRef}
      className="trainer-card-container"
      style={{ minHeight: '380px' }} // Evita layout shift
    >
      {shouldRenderContent ? (
        <div className="relative">
          {/* 🖼️ Preload de imagem em background */}
          {!hasLoaded && !hasError && (
            <>
              <img
                src={trainer.image}
                alt=""
                className="hidden"
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading={priority === 'high' ? 'eager' : 'lazy'}
              />
              <TrainerCardSkeleton />
            </>
          )}
          
          {/* 📋 Card real após carregamento */}
          {(hasLoaded || hasError) && (
            <ModernProfileCard
              trainer={{
                ...trainer,
                // Fallback para imagem quebrada
                image: hasError ? 'https://images.unsplash.com/photo-1540206063137-4a88ca974d1a?w=400&q=80' : trainer.image
              }}
              onClick={onClick}
            />
          )}
        </div>
      ) : (
        // 💀 Skeleton para cards não visíveis
        <TrainerCardSkeleton />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // 🎯 Memoização personalizada - só re-render se dados relevantes mudaram
  return (
    prevProps.trainer.id === nextProps.trainer.id &&
    prevProps.trainer.rating === nextProps.trainer.rating &&
    prevProps.trainer.reviewCount === nextProps.trainer.reviewCount &&
    prevProps.trainer.image === nextProps.trainer.image &&
    prevProps.index === nextProps.index
  );
});

OptimizedTrainerCard.displayName = 'OptimizedTrainerCard';

export { OptimizedTrainerCard };
export type { OptimizedTrainerCardProps };