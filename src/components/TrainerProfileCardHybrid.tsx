/**
 * 🏋️ TRAINER PROFILE CARD - SISTEMA HÍBRIDO
 * =========================================
 * 
 * Componente para exibir cards de treinadores usando dados reais
 * do sistema híbrido 99_trainer_profile
 */

import { useEffect, useState } from 'react';
import { ModernProfileCard } from './ModernProfileCard';
import { useTrainerSearch } from '../hooks/useTrainerProfileHybrid';
import { trainerProfileService, type TrainerProfile } from '../services/trainer-profile.service';
import { Carousel as AppleCarousel } from './ui/apple-cards-carousel';

// ===============================================
// PROPS DO COMPONENTE
// ===============================================

interface TrainerProfileCardHybridProps {
  // Modo 1: ID específico do trainer (UUID)
  trainerId?: string;
  
  // Modo 2: User ID
  userId?: string;
  
  // Modo 3: Slug do trainer
  trainerSlug?: string;
  
  // Modo 4: Dados já carregados
  trainerData?: TrainerProfile;
  
  // Configurações visuais
  className?: string;
  showStats?: boolean;
  showActions?: boolean;
  
  // Callbacks
  onTrainerClick?: (trainer: TrainerProfile) => void;
  onFollowClick?: (trainer: TrainerProfile, isFollowing: boolean) => void;
  onMessageClick?: (trainer: TrainerProfile) => void;
}

// ===============================================
// COMPONENTE PRINCIPAL
// ===============================================

export function TrainerProfileCardHybrid({
  trainerId,
  userId,
  trainerSlug,
  trainerData,
  className,
  showStats = true,
  showActions = true,
  onTrainerClick,
  onFollowClick,
  onMessageClick
}: TrainerProfileCardHybridProps) {
  const [trainer, setTrainer] = useState<TrainerProfile | null>(trainerData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===============================================
  // CARREGAR DADOS DO TRAINER
  // ===============================================

  useEffect(() => {
    const loadTrainer = async () => {
      // Se já tem dados, usar
      if (trainerData) {
        setTrainer(trainerData);
        return;
      }

      // Se não tem ID/slug para buscar, não fazer nada
      if (!trainerId && !userId && !trainerSlug) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let profile: TrainerProfile | null = null;

        if (userId) {
          console.log('🔍 Carregando trainer por userId:', userId);
          profile = await trainerProfileService.getByUserId(userId);
        } else if (trainerSlug) {
          console.log('🔍 Carregando trainer por slug:', trainerSlug);
          profile = await trainerProfileService.getBySlug(trainerSlug);
        } else if (trainerId) {
          // ✅ DETECÇÃO AUTOMÁTICA: UUID vs SLUG
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trainerId);
          
          if (isUUID) {
            console.log('🔍 Carregando trainer por UUID:', trainerId);
            profile = await trainerProfileService.getById(trainerId);
          } else {
            console.log('🔍 Carregando trainer por slug (auto-detectado):', trainerId);
            profile = await trainerProfileService.getBySlug(trainerId);
          }
        }

        if (profile) {
          console.log('✅ Trainer carregado:', profile.name);
          setTrainer(profile);
        } else {
          console.log('⚠️ Trainer não encontrado');
          setError('Trainer não encontrado');
        }

      } catch (err) {
        console.error('❌ Erro ao carregar trainer:', err);
        setError(err.message || 'Erro ao carregar dados do trainer');
      } finally {
        setLoading(false);
      }
    };

    loadTrainer();
  }, [trainerId, userId, trainerSlug, trainerData]);

  // ===============================================
  // HANDLERS
  // ===============================================

  const handleTrainerClick = () => {
    if (trainer && onTrainerClick) {
      onTrainerClick(trainer);
    }
  };

  const handleFollowClick = (isFollowing: boolean) => {
    if (trainer && onFollowClick) {
      onFollowClick(trainer, isFollowing);
    }
  };

  const handleMessageClick = () => {
    if (trainer && onMessageClick) {
      onMessageClick(trainer);
    }
  };

  // ===============================================
  // RENDER DE LOADING
  // ===============================================

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 h-[400px] flex flex-col">
          {/* Portfolio skeleton */}
          <div className="h-[100px] bg-gray-200 rounded-t-2xl"></div>
          
          {/* Avatar skeleton */}
          <div className="flex justify-center -mt-10 mb-4">
            <div className="w-20 h-20 bg-gray-300 rounded-full ring-4 ring-white"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="px-5 pb-3 flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="flex justify-center gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
              <div className="text-center space-y-1">
                <div className="h-3 bg-gray-200 rounded w-8 mx-auto"></div>
                <div className="h-2 bg-gray-200 rounded w-12 mx-auto"></div>
              </div>
              <div className="text-center space-y-1">
                <div className="h-3 bg-gray-200 rounded w-8 mx-auto"></div>
                <div className="h-2 bg-gray-200 rounded w-12 mx-auto"></div>
              </div>
              <div className="text-center space-y-1">
                <div className="h-3 bg-gray-200 rounded w-8 mx-auto"></div>
                <div className="h-2 bg-gray-200 rounded w-12 mx-auto"></div>
              </div>
            </div>
            <div className="space-y-2 mt-auto pt-4">
              <div className="h-9 bg-gray-200 rounded-xl"></div>
              <div className="h-9 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===============================================
  // RENDER DE ERRO
  // ===============================================

  if (error || !trainer) {
    return (
      <ModernProfileCard
        name="Trainer não encontrado"
        location="N/A"
        avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        portfolioImages={[
          'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400'
        ]}
        tags={[]}
        stats={{
          followers: '0',
          following: '0',
          views: '0'
        }}
        rating={0}
        isVerified={false}
        className={className}
      />
    );
  }

  // ===============================================
  // RENDER PRINCIPAL
  // ===============================================

  return (
    <ModernProfileCard
      trainerData={trainer}
      className={className}
    />
  );
}

// ===============================================
// LISTA DE TRAINERS HÍBRIDOS
// ===============================================

interface TrainerProfileListHybridProps {
  filters?: {
    specialty?: string;
    city?: string;
    modality?: string;
    limit?: number;
  };
  className?: string;
  cardClassName?: string;
  onTrainerClick?: (trainer: TrainerProfile) => void;
}

export function TrainerProfileListHybrid({
  filters = {},
  className,
  cardClassName,
  onTrainerClick
}: TrainerProfileListHybridProps) {
  const { trainers, loading, error, listActive } = useTrainerSearch();

  useEffect(() => {
    // Usar listActive que não filtra por status, apenas por is_active
    listActive(filters.limit || 10, 0);
  }, [listActive, filters.limit]);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {trainers.map((trainer) => (
          <TrainerProfileCardHybrid
            key={trainer.id}
            trainerData={trainer}
            className={cardClassName}
            onTrainerClick={onTrainerClick}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">
          <p className="font-medium">Erro ao carregar treinadores</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (trainers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">
          <p className="font-medium">Nenhum treinador encontrado</p>
          <p className="text-sm text-gray-500">Tente ajustar os filtros de busca</p>
        </div>
      </div>
    );
  }

  return (
    <div className="full-bleed">
      <div className="pl-6 lg:pl-8">
        <AppleCarousel 
          items={trainers.map((trainer) => (
            <div key={trainer.id} className="w-80">
              <TrainerProfileCardHybrid
                trainerData={trainer}
                className={cardClassName}
                onTrainerClick={onTrainerClick}
              />
            </div>
          ))}
        />
      </div>
    </div>
  );
}

// ===============================================
// EXPORTS
// ===============================================

export default TrainerProfileCardHybrid;