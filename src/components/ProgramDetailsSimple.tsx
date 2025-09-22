import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
  Star,
  Heart,
  Share2,
  SignalHigh,
  MapPin,
  Clock,
  CalendarDays,
  Info,
  Users,
  TrendingUp,
  Timer,
  AlertTriangle,
  MessageCircle,
  MessageSquareText,
  Award,
  CheckCircle2,
  Play,
  Download,
  Shield,
  Zap,
  Target,
  Gift,
  ArrowRight,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Plus,
  Minus
} from 'lucide-react';

// Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "border-transparent bg-brand text-brand-foreground hover:bg-brand-hover",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-muted",
      destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "text-foreground border-border",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-brand text-brand-foreground hover:bg-brand-hover",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-border bg-card hover:bg-accent",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-brand underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Avatar Components
const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    onError={(e) => {
      const target = e.target as HTMLImageElement;
      if (target.src !== 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face') {
        target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';
      }
    }}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

// Hook real do Supabase
import { useProgramWithTrainerOptimized } from '../hooks/useProgramWithTrainerOptimized';
import { useOtherProgramsByTrainer } from '../hooks/useOtherProgramsByTrainer';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { UnifiedProgramCard } from './unified/UnifiedProgramCard';
import type { UnifiedProgramCardData } from '../types/unified-program';
import type { DbProgramRow } from '../types/database-views';
// Utilitários de fallback de imagem
import { isSupabaseStorageUrl, isUrlExpired, selectBestImageUrl } from '../utils/image-fallback';

// Função adaptadora para converter DbProgramRow para UnifiedProgramCardData
function adaptDbProgramToUnified(program: DbProgramRow): UnifiedProgramCardData {
  // Safe extraction para garantir tipos corretos
  const getDuration = (durationValue: any): number => {
    if (typeof durationValue === 'number') return durationValue;
    if (typeof durationValue === 'string') {
      const parsed = parseInt(durationValue, 10);
      return isNaN(parsed) ? 4 : parsed;
    }
    return 4; // fallback
  };

  const getLevel = (levelValue: string): 'iniciante' | 'intermediario' | 'avancado' => {
    const normalized = levelValue?.toLowerCase();
    if (normalized?.includes('avançado') || normalized?.includes('avancado')) return 'avancado';
    if (normalized?.includes('intermediário') || normalized?.includes('intermediario')) return 'intermediario';
    return 'iniciante';
  };

  const getModality = (modalityValue: string): 'online' | 'presencial' | 'hibrido' => {
    const normalized = modalityValue?.toLowerCase();
    if (normalized?.includes('online') || normalized === 'video') return 'online';
    if (normalized?.includes('híbrido') || normalized?.includes('hibrido')) return 'hibrido';
    return 'presencial';
  };

  // Tipo cast seguro para any pois program pode ter propriedades extras
  const programAny = program as any;

  return {
    id: program.id,
    trainer: {
      id: program.trainer_id,
      name: programAny.trainer_name || 'Instrutor',
      avatar: null, // Será preenchido pelo hook de trainer se necessário
      initials: (programAny.trainer_name || 'IN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
      slug: programAny.trainer_slug || programAny.slug || undefined, // Adicionar slug se disponível
      specialties: programAny.trainer_specialties || [],
      location: programAny.trainer_location ? {
        city: programAny.trainer_location.city || '',
        state: programAny.trainer_location.state || ''
      } : undefined
    },
    content: {
      title: program.title,
      shortDescription: programAny.short_description || program.program_data?.description?.shortDescription || 'Programa de treinamento'
    },
    details: {
      category: program.category || 'Fitness',
      level: getLevel(program.level),
      duration: getDuration(programAny.duration || program.duration),
      durationType: (programAny.duration_type as 'weeks' | 'months' | 'days') || 'weeks',
      modality: getModality(programAny.modality_norm || program.modality),
      primarySport: undefined, // Será preenchido se necessário
      frequency: typeof programAny.frequency === 'number' ? programAny.frequency : 3,
      intensity: 5, // Valor padrão
      difficulty: 5 // Valor padrão
    },
    media: {
      coverImage: program.cover_image || program.thumbnail || null
    },
    pricing: {
      basePrice: programAny.display_price || program.base_price || 0,
      currency: 'BRL'
    },
    stats: {
      rating: program.program_data?.analytics?.average_rating || 4.8,
      reviewCount: program.program_data?.analytics?.reviews_count || 12,
      enrollments: program.program_data?.analytics?.conversions || 25
    },
    flags: {
      isPublished: program.is_published || false,
      isActive: program.status === 'published' || program.status === 'active' || program.is_published,
      isFeatured: false
    }
  };
}

interface ProgramDetailsSimpleProps {
  onNavigateToTrainer: (trainerId: string) => void;
  onNavigateToProgram?: (programId: string) => void;
  programIdOrSlug?: string;
}

export function ProgramDetailsSimple({
  onNavigateToTrainer,
  onNavigateToProgram,
  programIdOrSlug: propProgramId
}: ProgramDetailsSimpleProps) {
  // 🎯 HOOKS SEMPRE NA MESMA ORDEM - NUNCA CONDICIONAIS
  const { programId: urlProgramId } = useParams<{ programId: string }>();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(127);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // ID/slug resolution
  const programIdOrSlug = propProgramId || urlProgramId || '';

  // Hook real com dados do Supabase
  const { data: uiProgram, isLoading, error } = useProgramWithTrainerOptimized(programIdOrSlug);
  
  // Hook para outros programas do treinador
  const { data: otherPrograms, isLoading: loadingOtherPrograms } = useOtherProgramsByTrainer(
    uiProgram?.trainer?.id || '',
    programIdOrSlug
  );

  // Sistema robusto de cover image com fallback direto
  const coverImageData = useMemo(() => {
    if (!uiProgram) {
      return {
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format&q=80',
        isExpired: false,
        hasSupabaseUrls: false
      };
    }
    
    const candidateUrls = [
      uiProgram?.program_data?.basic_info?.coverImage,
      uiProgram?.media?.[0]?.url
    ].filter(Boolean);
    
    const bestUrl = selectBestImageUrl(candidateUrls, 'cover');
    const hasSupabaseUrls = candidateUrls.some(url => url && isSupabaseStorageUrl(url));
    const isExpired = candidateUrls.some(url => url && isUrlExpired(url));
    
    return {
      url: bestUrl,
      isExpired,
      hasSupabaseUrls
    };
  }, [uiProgram]);
  
  const { url: coverImageUrl, isExpired, hasSupabaseUrls } = coverImageData;
  const finalCoverImageUrl = coverImageUrl;

  // Debug: Log das URLs de imagem para análise
  if (process.env.NODE_ENV === 'development' && uiProgram) {
    console.log('[ProgramDetailsSimple] 🖼️ ANÁLISE DE COVER IMAGE:', {
      selectedUrl: coverImageUrl,
      isExpired,
      hasSupabaseUrls,
      originalCover: uiProgram?.program_data?.basic_info?.coverImage,
      mediaArray: uiProgram?.media,
      finalUrl: finalCoverImageUrl,
      uiProgramTitle: uiProgram?.title
    });
  }

  // 🎯 HANDLERS MEMOIZADOS
  const handleLike = useCallback(() => {
    setIsLiked(prev => !prev);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
  }, [isLiked]);

  const handleShare = useCallback(async () => {
    if (!uiProgram) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    } catch (error) {
      console.warn('Erro ao compartilhar:', error);
    }
  }, [uiProgram]);

  const handleNavigateToTrainer = useCallback(() => {
    if (!uiProgram?.trainer?.id) return;
    onNavigateToTrainer(uiProgram.trainer.id);
  }, [uiProgram?.trainer?.id, onNavigateToTrainer]);

  // 🔎 Resolver dados do Supabase com fallbacks inteligentes
  const ui = useMemo(() => {
    const p: any = uiProgram ?? {};

    // Safe extraction de duration - pode ser número direto ou objeto com weeks
    const getDuration = (durationValue: any): number => {
      if (typeof durationValue === 'number') return durationValue;
      if (typeof durationValue === 'object' && durationValue?.weeks) return durationValue.weeks;
      return 4; // fallback
    };

    // Safe extraction de frequency - pode ser número direto ou valor aninhado
    const getFrequency = (frequencyValue: any): number => {
      if (typeof frequencyValue === 'number') return frequencyValue;
      if (typeof frequencyValue === 'object' && frequencyValue?.perWeek) return frequencyValue.perWeek;
      return 3; // fallback
    };

    return {
      title: p.title ?? 'Programa de Transformação',
      category: p.category ?? 'Fitness',
      coverImage: finalCoverImageUrl,
      shortDescription: p.short_description ?? p.program_data?.shortDescription ?? 'Transforme sua vida com nosso programa',
      fullDescription: p.description ?? p.program_data?.fullDescription ?? 'Programa completo de transformação corporal.',
      level: p.level ?? 'Iniciante',
      modalityNorm: p.modality_norm ?? 'presencial',
      duration: getDuration(p.duration),
      durationType: p.duration_type ?? 'weeks',
      frequency: getFrequency(p.frequency),
      trainer: {
        id: p.trainer?.id ?? p.trainer_id ?? '1',
        name: p.trainer?.name ?? p.trainer_name ?? 'Instrutor',
        avatar: p.trainer?.avatar ?? '',
        rating: Number(p.trainer?.rating ?? 4.8)
      },
      stats: {
        reviewCount: p.stats?.reviewCount ?? p.reviewCount ?? 18,
        enrollments: p.stats?.enrollments ?? p.enrollments ?? 127
      },
      socialProof: {
        studentsCount: p.studentsCount ?? 250,
        successRate: p.successRate ?? '87%',
        avgTimeToResults: p.avgTimeToResults ?? '4-6 semanas'
      },
      pricing: {
        displayPrice: p.display_price ?? p.program_data?.packages?.[0]?.price ?? 397,
        originalPrice: p.program_data?.packages?.[0]?.originalPrice ?? null,
        packages: p.program_data?.packages ?? []
      },
      urgency: {
        availableSpots: p.availableSpots ?? null
      },
      benefits: p.benefits ?? [
        { icon: Target, label: 'Perda de peso com segurança' },
        { icon: Zap, label: 'Resultados visíveis rapidamente' },
        { icon: Shield, label: 'Método 100% seguro' },
        { icon: Users, label: 'Comunidade de apoio' }
      ],
      features: p.program_data?.packages?.[0]?.features ?? [
        'Acompanhamento semanal',
        'Suporte via WhatsApp',
        'Planilha de evolução'
      ],
      deliveryMode: p.program_data?.delivery_mode ?? 'Digital',
      trainerAuthority: {
        yearsExperience: p.trainerAuthority?.yearsExperience ?? 6,
        studentsHelped: p.trainerAuthority?.studentsHelped ?? 480,
        achievements: p.trainerAuthority?.achievements ?? ['CREF ativo', 'Certificação']
      },
      faq: p.program_data?.faq ?? [
        {
          question: 'Como funciona o programa?',
          answer: 'O programa é dividido em módulos progressivos que você pode seguir no seu próprio ritmo. Cada módulo inclui exercícios práticos, vídeos explicativos e material de apoio.'
        },
        {
          question: 'Preciso de equipamentos especiais?',
          answer: 'Não! O programa foi desenvolvido para ser praticado em casa ou na academia, com adaptações para diferentes níveis de equipamento disponível.'
        },
        {
          question: 'Quanto tempo por dia preciso dedicar?',
          answer: `Recomendamos entre 30-60 minutos por dia, ${getFrequency(p.frequency)}x por semana. Você pode ajustar conforme sua disponibilidade.`
        },
        {
          question: 'Terei acompanhamento direto do treinador?',
          answer: 'Sim! O programa inclui suporte via WhatsApp e sessões de feedback semanais para tirar dúvidas e acompanhar sua evolução.'
        },
        {
          question: 'E se eu não conseguir acompanhar?',
          answer: 'Sem problemas! O programa é flexível e você pode adaptar o ritmo às suas necessidades. Oferecemos suporte total durante toda a jornada.'
        },
        {
          question: 'Há garantia de resultados?',
          answer: 'Sim! Oferecemos garantia de 30 dias. Se você não estiver satisfeito, devolvemos seu investimento integral.'
        }
      ]
    };
  }, [uiProgram, finalCoverImageUrl]);

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-20 h-8 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="flex gap-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-6 bg-gray-200 rounded w-20"></div>
              ))}
            </div>
          </div>

          <div className="h-80 bg-gray-200 rounded-xl"></div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[1,2,3].map(i => (
                <div key={i} className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !uiProgram) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Programa não encontrado</h2>
        <p className="text-gray-600 mb-6">
          O programa que você está procurando não existe ou foi removido.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            Voltar
          </Button>
          <Button>Explorar Programas</Button>
        </div>
      </div>
    );
  }

  const trainer = ui.trainer;
  const stats = ui.stats;
  const hasDiscount = ui.pricing.originalPrice && ui.pricing.originalPrice > ui.pricing.displayPrice;
  const discountPercent = hasDiscount 
    ? Math.round(((ui.pricing.originalPrice - ui.pricing.displayPrice) / ui.pricing.originalPrice) * 100)
    : 0;

  return (
    <div className="space-y-16">
      <div className="container grid lg:grid-cols-3 gap-8 px-[0px] py-[20px]">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SEÇÃO 1: Enhanced Header */}
          <section className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative">
                  <Avatar className="h-16 w-16 ring-4 ring-accent">
                    <AvatarImage src={trainer.avatar} alt={trainer.name} />
                    <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                      {trainer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand rounded-full border-2 border-card flex items-center justify-center">
                    <div className="w-2 h-2 bg-brand-foreground rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">{trainer.name}</span>
                    <Badge variant="default">
                      <Award className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  </div>
                  
                  {/* Enhanced Social Proof */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-semibold text-foreground">{trainer.rating}</span>
                      <span>({stats.reviewCount} avaliações)</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold text-foreground">{ui.socialProof.studentsCount}</span>
                      <span>alunos</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-brand" />
                      <span className="font-semibold text-brand">{ui.socialProof.successRate}</span>
                      <span>sucesso</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-2 transition-all duration-200 ${
                    isLiked 
                      ? 'text-destructive border-destructive/20 bg-destructive/10 hover:bg-destructive/20' 
                      : 'hover:bg-accent'
                  }`}
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 transition-all duration-200 ${
                    isLiked ? 'fill-current scale-110' : ''
                  }`} />
                  <span className="font-medium">{likeCount}</span>
                </Button>

                <Button variant="outline" size="sm" onClick={handleShare} className="hover:bg-accent">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>

          {/* SEÇÃO 2: Cover Image */}
          <section>
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <ImageWithFallback
                src="https://rdujusymvebxndykyvhu.supabase.co/storage/v1/object/sign/make-e547215c-program-media/06588b6a-e8bb-42a4-89a8-5d237cc34476/program-covers/1757887713204-Captura_de_Tela_2025-09-12_a_s_2.56.44_PM.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xZWMwZDdiOC03NDBkLTQyZGMtOWNmNC1iZTY4ZGQyMGUzZjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYWtlLWU1NDcyMTVjLXByb2dyYW0tbWVkaWEvMDY1ODhiNmEtZThiYi00MmE0LTg5YTgtNWQyMzdjYzM0NDc2L3Byb2dyYW0tY292ZXJzLzE3NTc4ODc3MTMyMDQtQ2FwdHVyYV9kZV9UZWxhXzIwMjUtMDktMTJfYV9zXzIuNTYuNDRfUE0ucG5nIiwiaWF0IjoxNzU3ODg3NzE0LCJleHAiOjE3ODk0MjM3MTR9.Kui7Ds65tomsWWk_3IaHTAEXfmaxMUo_kxEa0oxuxG4"
                alt={`Capa do programa ${ui.title}`}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
              
              {/* Debug indicator para URLs expiradas em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-2 left-2 space-y-1">
                  {isExpired && hasSupabaseUrls && (
                    <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                      ⚠️ URL Expirada - Usando Fallback
                    </div>
                  )}
                  {coverImageUrl && (
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      ✅ Hook Ativo: {coverImageUrl.includes('unsplash') ? 'Fallback' : 'Original'}
                    </div>
                  )}
                </div>
              )}
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-white/90 text-gray-900">
                  {ui.category}
                </Badge>
              </div>
              
              {/* Urgency Badge */}
              {ui.urgency.availableSpots && (
                <div className="absolute top-4 right-4">
                  <Badge variant="destructive" className="animate-pulse bg-destructive/90">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Apenas {ui.urgency.availableSpots} vagas!
                  </Badge>
                </div>
              )}
            </div>
          </section>

          {/* SEÇÃO 3: Program Title Section */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                {ui.title}
                <span className="block text-lg lg:text-xl font-medium text-brand mt-2 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Programa {ui.deliveryMode === 'Digital' ? '100% Digital' : ui.deliveryMode}
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {ui.shortDescription}
              </p>

              {/* Enhanced Info Chips */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border">
                  <SignalHigh className="w-4 h-4 text-brand" />
                  <span className="font-medium text-sm">{ui.level}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border">
                  <MapPin className="w-4 h-4 text-brand" />
                  <span className="font-medium text-sm">
                    {ui.modalityNorm === 'hybrid' ? 'Híbrido' : 
                     ui.modalityNorm === 'online' ? 'Online' : 'Presencial'}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border">
                  <Clock className="w-4 h-4 text-brand" />
                  <span className="font-medium text-sm">{ui.duration} semanas</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border">
                  <CalendarDays className="w-4 h-4 text-brand" />
                  <span className="font-medium text-sm">{ui.frequency}x por semana</span>
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 4: Sobre este programa (consolidada) */}
          <section className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-brand" />
              Sobre este programa
            </h2>
            
            {/* Descrição completa */}
            <div className="prose max-w-none">
              <p className="text-muted-foreground leading-relaxed text-lg">
                {showFullDescription ? ui.fullDescription : ui.fullDescription.substring(0, 200) + '...'}
              </p>
              
              {ui.fullDescription.length > 200 && (
                <Button 
                  variant="link" 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="p-0 h-auto font-medium"
                >
                  {showFullDescription ? 'Ver menos' : 'Ver mais'}
                  <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${
                    showFullDescription ? 'rotate-90' : ''
                  }`} />
                </Button>
              )}
            </div>

            {/* Vídeo do programa */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Play className="w-5 h-5 text-brand" />
                Vídeo do programa
              </h3>
              
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-900">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center text-white space-y-4">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                    <p className="text-lg font-medium">Vídeo Preview do Programa</p>
                    <p className="text-sm text-gray-300">Clique para assistir</p>
                  </div>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors">
                  <Button 
                    size="lg" 
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Preview do Programa
                  </Button>
                </div>
              </div>
            </div>

            {/* Benefícios que você vai alcançar */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-brand" />
                Benefícios que você vai alcançar
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {ui.benefits.map((benefit, idx) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-accent border border-border rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-brand" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground">{benefit.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* O que está incluído */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand" />
                O que está incluído
              </h3>
              <div className="space-y-3">
                {ui.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SEÇÃO 5: Perguntas Frequentes */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-brand" />
              Perguntas Frequentes
            </h2>
            
            <div className="space-y-4">
              {ui.faq.map((faqItem, idx) => (
                <div key={idx} className="border border-border rounded-xl overflow-hidden">
                  <button
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                  >
                    <span className="font-medium text-foreground">{faqItem.question}</span>
                    {expandedFAQ === idx ? (
                      <Minus className="w-5 h-5 text-brand flex-shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-brand flex-shrink-0" />
                    )}
                  </button>
                  
                  {expandedFAQ === idx && (
                    <div className="px-4 pb-4 border-t border-border bg-muted/25">
                      <p className="text-muted-foreground leading-relaxed pt-3">{faqItem.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* SEÇÃO 6: Carrossel de programas relacionados */}
          {otherPrograms && otherPrograms.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Gift className="w-6 h-6 text-brand" />
                Outros programas de {trainer.name}
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherPrograms.slice(0, 3).map((program) => (
                  <UnifiedProgramCard
                    key={program.id}
                    program={adaptDbProgramToUnified(program)}
                    onClick={(programId) => onNavigateToProgram?.(programId)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar - Card de Compra */}
        <div className="space-y-6">
          <div className="sticky top-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <div className="space-y-4">
                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">R$ {ui.pricing.displayPrice}</span>
                    {hasDiscount && (
                      <>
                        <span className="text-lg text-muted-foreground line-through">
                          R$ {ui.pricing.originalPrice}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          {discountPercent}% OFF
                        </Badge>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Acesso vitalício • Resultados em {ui.socialProof.avgTimeToResults}
                  </p>
                </div>

                {/* CTA Button */}
                <Button size="lg" className="w-full">
                  Quero me inscrever agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {/* Garantia */}
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-foreground">
                    Garantia de 30 dias ou seu dinheiro de volta
                  </span>
                </div>

                {/* Social Proof */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand" />
                    <span className="text-sm text-muted-foreground">
                      {ui.socialProof.studentsCount} alunos já se inscreveram
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand" />
                    <span className="text-sm text-muted-foreground">
                      {ui.socialProof.successRate} de taxa de sucesso
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-brand" />
                    <span className="text-sm text-muted-foreground">
                      Resultados em {ui.socialProof.avgTimeToResults}
                    </span>
                  </div>
                </div>

                {/* Contact Trainer */}
                <Button variant="outline" className="w-full" onClick={handleNavigateToTrainer}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Falar com {trainer.name}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}