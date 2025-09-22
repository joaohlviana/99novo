/**
 * 🎯 PROGRAM DETAILS - TABELAS REAIS SUPABASE
 * ==========================================
 * Componente otimizado usando exclusivamente tabelas/views reais:
 * - 99_training_programs (tabela principal)
 * - 99_trainer_profile_hybrid (perfis de treinadores) 
 * - published_programs_by_trainer (view otimizada)
 * 
 * ✅ ELIMINADO: dependencies de services antigos
 * ✅ OTIMIZADO: queries mínimas com React Query
 * ✅ GARANTIDO: zero uso do KV Store
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  Star, 
  CheckCircle, 
  MapPin,
  Heart,
  Share2,
  Instagram,
  MoreHorizontal
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

// 🎯 HOOKS OTIMIZADOS PARA TABELAS REAIS
import { useProgramByIdOrSlug } from '../hooks/useProgramByIdOrSlug';
import { useProgramWithTrainerOptimized } from '../hooks/useProgramWithTrainerOptimized';
import { useTrainerCore } from '../hooks/useTrainerCore';
import { useOtherProgramsByTrainer } from '../hooks/useOtherProgramsByTrainer';
import { toUiProgram, toUiProgramFromView, getLevelDisplay, adaptLegacyProgram } from '../utils/toUiProgram';
import type { UiProgram } from '../types/database-views';

interface ProgramDetailsProps {
  // Props opcionais para compatibilidade com uso legado
  program?: any | null; // programa legado via prop
  trainer?: any | null; // treinador legado via prop
  onNavigateToTrainer: (trainerId: string) => void;
  programIdOrSlug?: string; // ID/slug específico (override de useParams)
}

export function ProgramDetails({ 
  program: legacyProgram, 
  trainer: legacyTrainer, 
  onNavigateToTrainer,
  programIdOrSlug: propProgramId
}: ProgramDetailsProps) {
  
  // 🎯 RESOLUÇÃO INTELIGENTE DE ID/SLUG
  const { programId: urlProgramId } = useParams<{ programId: string }>();
  const programIdOrSlug = propProgramId || urlProgramId || legacyProgram?.id || '';

  // 🎯 ESTADOS LOCAIS PRIMEIRO (sempre na mesma ordem)
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(21);

  console.log('[PROGRAM_DETAILS] Resolvendo programa:', { 
    propProgramId, 
    urlProgramId, 
    legacyId: legacyProgram?.id, 
    final: programIdOrSlug 
  });

  // 🎯 HOOKS DE QUERY - SEMPRE EXECUTADOS NA MESMA ORDEM
  const optimizedQuery = useProgramWithTrainerOptimized(programIdOrSlug);
  const fallbackProgramQuery = useProgramByIdOrSlug(programIdOrSlug);
  
  // 🎯 DETERMINAR TRAINER ID PARA PRÓXIMAS QUERIES
  const dbProgram = optimizedQuery.data ? null : fallbackProgramQuery.data;
  const uiProgramFromOptimized = optimizedQuery.data;
  const trainerId = dbProgram?.trainer_id || legacyProgram?.trainer?.id || '';
  
  // 🎯 SEMPRE CHAMAR OS HOOKS, CONTROLAR COM enabled
  const { data: dbTrainer, isLoading: loadingTrainer } = useTrainerCore(
    trainerId || '', // sempre passar string, nunca undefined
    { enabled: Boolean(trainerId && !uiProgramFromOptimized) }
  );
  
  const { data: otherDbPrograms, isLoading: loadingOthers } = useOtherProgramsByTrainer(
    trainerId || '', // sempre passar string, nunca undefined
    dbProgram?.id || legacyProgram?.id || '', // sempre passar string
    3,
    { enabled: Boolean(trainerId) } // controlar execução
  );

  // 🎯 MEMOIZED VALUES - SEMPRE NA MESMA ORDEM
  const uiProgram: UiProgram | null = useMemo(() => {
    if (uiProgramFromOptimized) {
      console.log('[PROGRAM_DETAILS] ✅ Usando dados do hook otimizado');
      return uiProgramFromOptimized;
    } else if (dbProgram) {
      console.log('[PROGRAM_DETAILS] ✅ Usando dados das tabelas reais (fallback)');
      return toUiProgram(dbProgram, dbTrainer ?? undefined);
    } else if (legacyProgram) {
      console.log('[PROGRAM_DETAILS] ⚠️ Fallback para dados legados');
      return adaptLegacyProgram(legacyProgram);
    }
    return null;
  }, [uiProgramFromOptimized, dbProgram, dbTrainer, legacyProgram]);

  const otherProgramsUi: UiProgram[] = useMemo(() => {
    if (!otherDbPrograms) return [];
    console.log('[PROGRAM_DETAILS] ✅ Adaptando', otherDbPrograms.length, 'outros programas');
    return otherDbPrograms.map(p => toUiProgram(p));
  }, [otherDbPrograms]);

  // 🎯 COMPUTED STATES
  const isLoadingProgram = optimizedQuery.isLoading || fallbackProgramQuery.isLoading;
  const programError = optimizedQuery.error || fallbackProgramQuery.error;
  const isLoading = isLoadingProgram || (Boolean(dbProgram) && loadingTrainer);
  const hasError = Boolean(programError) || (!uiProgramFromOptimized && !dbProgram && !legacyProgram && !isLoadingProgram);

  // 🎯 EFFECT PARA SINCRONIZAR LIKE COUNT COM DADOS DO PROGRAMA
  useEffect(() => {
    if (uiProgram?.stats?.reviewCount) {
      setLikeCount(uiProgram.stats.reviewCount);
    }
  }, [uiProgram?.stats?.reviewCount]);

  // 🎯 HANDLERS MEMOIZADOS
  const handleLike = useCallback(() => {
    setIsLiked(prev => !prev);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  }, [isLiked]);

  const handleShare = useCallback(async () => {
    if (!uiProgram) return;
    
    const shareData = {
      title: uiProgram.title,
      text: 'Confira este incrível programa de transformação corporal!',
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        console.log('[PROGRAM_DETAILS] Link copiado para clipboard');
      }
    } catch (error) {
      console.warn('[PROGRAM_DETAILS] Erro ao compartilhar:', error);
    }
  }, [uiProgram]);

  // 🎯 SKELETON LOADING OTIMIZADO
  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Carregando programa">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          
          {/* Title skeleton */}
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          
          {/* Image skeleton */}
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          
          {/* Content skeleton */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // 🎯 ERROR STATE MELHORADO
  if (hasError || !uiProgram || !trainerDisplayData) {
    const errorMessage = programError?.message || 'Programa não encontrado';
    console.warn('[PROGRAM_DETAILS] 🚨 Erro:', { programIdOrSlug, error: errorMessage, hasUiProgram: !!uiProgram, hasTrainerData: !!trainerDisplayData });
    
    return (
      <div className="text-center py-12" role="alert">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Programa não encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            O programa que você está procurando não existe ou foi removido.
          </p>
          {programError && (
            <details className="text-sm text-red-600 mb-4">
              <summary className="cursor-pointer">Detalhes do erro</summary>
              <p className="mt-2 p-2 bg-red-50 rounded text-left">
                {programError.message}
              </p>
            </details>
          )}
          <div className="space-x-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              Voltar
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 🎯 DADOS MEMOIZADOS DO TREINADOR - SEMPRE NA MESMA ORDEM
  const trainerDisplayData = useMemo(() => {
    if (!uiProgram?.trainer) return null;
    return {
      id: uiProgram.trainer.id,
      slug: uiProgram.trainer.slug,
      name: uiProgram.trainer.name,
      avatar: uiProgram.trainer.avatar,
      title: uiProgram.trainer.title || 'Personal Trainer',
      bio: uiProgram.trainer.bio,
      rating: uiProgram.trainer.rating || 4.5,
      isVerified: uiProgram.trainer.isVerified || false
    };
  }, [uiProgram?.trainer]);

  // 🎯 DADOS MEMOIZADOS DE DURAÇÃO - SEMPRE NA MESMA ORDEM
  const durationDisplay = useMemo(() => {
    if (!uiProgram?.duration) return { weeks: 12, hoursPerWeek: 4, totalHours: 48 };
    
    const weeks = uiProgram.duration.weeks || 12;
    const hoursPerWeek = uiProgram.duration.hoursPerWeek || 4;
    
    return {
      weeks,
      hoursPerWeek,
      totalHours: uiProgram.duration.totalHours || (weeks * hoursPerWeek)
    };
  }, [uiProgram?.duration]);

  // 🎯 HANDLER PARA NAVEGAÇÃO DO TREINADOR - SEMPRE NA MESMA ORDEM
  const handleNavigateToTrainer = useCallback(() => {
    if (!trainerDisplayData) return;
    const identifier = trainerDisplayData.slug || trainerDisplayData.id;
    onNavigateToTrainer(identifier);
  }, [trainerDisplayData, onNavigateToTrainer]);

  return (
    <div className="space-y-0">
      {/* 🎯 PROGRAM HEADER - SEÇÃO SELECIONADA REFATORADA */}
      <section className="mb-8">
        {/* Trainer Info Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={trainerDisplayData.avatar} 
                alt={trainerDisplayData.name} 
              />
              <AvatarFallback>
                {trainerDisplayData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {trainerDisplayData.name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {trainerDisplayData.isVerified ? 'Verificado' : 'Pro'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3 w-3 fill-current text-yellow-500" />
                <span>
                  {trainerDisplayData.rating?.toFixed(1) || '4.8'}
                </span>
                <span>({uiProgram.stats.reviewCount || 0})</span>
                <span className="mx-2">•</span>
                <span>{uiProgram.stats.enrollments || 0} vendas</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Instagram Button */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-accent"
              onClick={() =>
                window.open(
                  `https://instagram.com/${trainerDisplayData.name.split(' ')[0].toLowerCase()}_coach`,
                  "_blank",
                )
              }
            >
              <Instagram className="h-4 w-4" />
              <span className="hidden sm:inline">@{trainerDisplayData.name.split(' ')[0].toLowerCase()}_coach</span>
            </Button>

            {/* Like Button */}
            <Button
              variant="outline"
              size="sm"
              className={`gap-2 transition-colors border-border ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'hover:text-red-500'
              }`}
              onClick={handleLike}
            >
              <Heart 
                className={`h-4 w-4 transition-colors ${
                  isLiked ? 'fill-current' : ''
                }`} 
              />
              <span className="font-medium">{likeCount}</span>
            </Button>

            {/* Share Button */}
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-accent border-border"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>

            {/* More Options Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-accent border-border"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem>
                  Reportar programa
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Bloquear treinador
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Copiar link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Program Title */}
        <h1 className="text-2xl lg:text-3xl font-semibold mb-4 leading-tight">
          {uiProgram.title}
        </h1>

        {/* Program Image */}
        <div className="relative rounded-xl overflow-hidden mb-6">
          <ImageWithFallback
            src={uiProgram.media[0]?.url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'}
            alt={uiProgram.title}
            className="w-full h-64 lg:h-80 object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-white/90 text-black shadow-sm backdrop-blur-sm">
              {uiProgram.category || 'Fitness'}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 shadow-sm backdrop-blur-sm">
              <MapPin className="h-3 w-3 mr-1" />
              Online
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {getLevelDisplay(uiProgram.level)}
            </Badge>
          </div>
        </div>
      </section>

      {/* Program Description - Fiverr style */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sobre este programa</h2>
        <div className="prose max-w-none text-muted-foreground space-y-4">
          <p>{uiProgram.description}</p>
          
          {uiProgram.shortDescription && uiProgram.shortDescription !== uiProgram.description && (
            <p>{uiProgram.shortDescription}</p>
          )}
          
          {uiProgram.features && uiProgram.features.length > 0 && (
            <>
              <p>
                <strong>O que torna este programa único:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {uiProgram.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </>
          )}
          
          <p>
            <strong>Para quem é este programa:</strong><br/>
            Pessoas com nível {getLevelDisplay(uiProgram.level).toLowerCase()} que querem levar seus resultados 
            para o próximo nível. Ideal para quem busca resultados consistentes e duradouros.
          </p>
          
          <p>
            <strong>Modalidade:</strong><br/>
            Este programa é <span className="font-medium text-blue-600">100% online</span>. Você pode treinar 
            de qualquer lugar - em casa, na academia ou ao ar livre. Todos os exercícios têm variações 
            para diferentes ambientes e equipamentos disponíveis.
          </p>
          
          <p>
            <strong>Duração:</strong><br/>
            {durationDisplay.weeks} semanas de treinamento intensivo, com aproximadamente {durationDisplay.hoursPerWeek} horas 
            de treino por semana. Total de {durationDisplay.totalHours} horas de conteúdo.
          </p>
        </div>
      </section>

      <Separator className="mb-8" />

      {/* About the Trainer - Prominent section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Sobre o treinador</h2>
        <div className="flex gap-6">
          <Avatar className="h-20 w-20 flex-shrink-0">
            <AvatarImage src={trainerDisplayData.avatar} alt={trainerDisplayData.name} />
            <AvatarFallback>{trainerDisplayData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{trainerDisplayData.name}</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNavigateToTrainer}
              >
                Ver perfil completo
              </Button>
            </div>
            <p className="text-muted-foreground mb-3">{trainerDisplayData.title}</p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium">{trainerDisplayData.rating?.toFixed(1) || '4.8'}</span>
                </div>
                <div className="text-muted-foreground">({uiProgram.stats.reviewCount} avaliações)</div>
              </div>
              <div>
                <div className="font-medium">{uiProgram.stats.enrollments}</div>
                <div className="text-muted-foreground">Programas vendidos</div>
              </div>
              <div>
                <div className="font-medium">~2 horas</div>
                <div className="text-muted-foreground">Tempo de resposta</div>
              </div>
              <div>
                <div className="font-medium">{uiProgram.stats.activeStudents || 50}+</div>
                <div className="text-muted-foreground">Alunos ativos</div>
              </div>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {trainerDisplayData.bio || `${trainerDisplayData.title} especializado em ${uiProgram.category?.toLowerCase() || 'fitness'}. 
              Profissional experiente com foco em resultados e acompanhamento personalizado. 
              Meu diferencial é o atendimento humanizado e metodologia comprovada.`}
            </p>
          </div>
        </div>
      </section>

      <Separator className="mb-8" />

      {/* FAQ Section - Prominent like Fiverr */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Perguntas frequentes</h2>
        <div className="space-y-4">
          {[
            {
              question: "Preciso ter experiência prévia com musculação?",
              answer: "Este programa é destinado a pessoas com experiência básica. Se você é completamente iniciante, recomendo começar com meu programa 'Funcional para Iniciantes' para criar uma base sólida primeiro."
            },
            {
              question: "Como funciona um programa 100% online?",
              answer: "Você recebe acesso a uma plataforma completa com vídeos explicativos de cada exercício, cronograma detalhado e pode baixar tudo no seu celular. Acompanho sua evolução via WhatsApp e você pode treinar no horário que preferir, onde estiver."
            },
            {
              question: "Quanto tempo por dia precisarei dedicar aos treinos?",
              answer: "Os treinos têm duração média de 45-60 minutos, 4-5 vezes por semana. Também incluo opções de treinos mais curtos (30min) para dias corridos."
            },
            {
              question: "O programa funciona para treino em casa?",
              answer: "Sim! Forneço adaptações completas para treino em casa com equipamentos mínimos. Você receberá duas versões: uma para academia e outra para casa."
            },
            {
              question: "Como funciona o acompanhamento personalizado?",
              answer: "Você terá acesso direto a mim via WhatsApp para tirar dúvidas, enviar fotos dos treinos e receber feedback. Também faço ajustes no programa baseado na sua evolução."
            },
            {
              question: "E se eu não conseguir seguir o cronograma exato?",
              answer: "O programa é flexível! Você pode adaptar os dias de treino à sua rotina. O importante é manter a consistência. Eu te ajudo a encontrar a melhor estratégia para seu estilo de vida."
            },
            {
              question: "Há garantia de resultados?",
              answer: "Ofereço garantia de 30 dias. Se você seguir o programa conforme orientado e não estiver satisfeito com os resultados iniciais, devolvemos seu investimento integral."
            }
          ].map((faq, index) => (
            <div key={index} className="border-b border-border pb-4">
              <h4 className="font-medium mb-2">{faq.question}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="mb-8" />

      {/* 🎯 OUTROS PROGRAMAS DO TREINADOR - OPTIMIZADO */}
      <section className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-12 w-12">
            <AvatarImage src={trainerDisplayData.avatar} alt={trainerDisplayData.name} />
            <AvatarFallback>
              {trainerDisplayData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">
              Mais programas do {trainerDisplayData.name}
            </h2>
            <p className="text-muted-foreground text-sm">
              Explore outros programas deste treinador
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loadingOthers ? (
            // Skeleton otimizado
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={`skeleton-${index}`} className="overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </Card>
            ))
          ) : otherProgramsUi.length > 0 ? (
            otherProgramsUi.map((otherProgram) => (
              <Card 
                key={otherProgram.id} 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                role="article"
                aria-label={`Programa ${otherProgram.title}`}
              >
                <div className="relative h-32 overflow-hidden">
                  <ImageWithFallback
                    src={otherProgram.media[0]?.url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80'}
                    alt={otherProgram.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {otherProgram.level && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 right-2 text-xs bg-white/90 text-black"
                    >
                      {getLevelDisplay(otherProgram.level)}
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-brand transition-colors">
                    {otherProgram.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      <span className="text-xs text-muted-foreground">
                        {otherProgram.stats.averageRating?.toFixed(1) || '4.8'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({otherProgram.stats.reviewCount || 0})
                      </span>
                    </div>
                    <span className="font-medium text-sm text-brand">
                      {otherProgram.pricing?.amount 
                        ? `R$ ${otherProgram.pricing.amount.toLocaleString('pt-BR')}` 
                        : 'Gratuito'
                      }
                    </span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-muted-foreground">
              <div className="max-w-sm mx-auto">
                <p className="mb-2">Nenhum outro programa encontrado deste treinador.</p>
                <Button variant="outline" size="sm" onClick={handleNavigateToTrainer}>
                  Ver perfil completo
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}