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
  BookOpen
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

const ImageWithFallback: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} />
);

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

  // ID/slug resolution
  const programIdOrSlug = propProgramId || urlProgramId || '';

  // Hook real com dados do Supabase
  const { data: uiProgram, isLoading, error } = useProgramWithTrainerOptimized(programIdOrSlug);

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
      coverImage: p.media?.[0]?.url ?? p.program_data?.basic_info?.coverImage ?? 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
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
      }
    };
  }, [uiProgram]);

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
    <div className="max-w-6xl mx-auto">
      <div className="container grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Enhanced Header */}
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

            {/* Enhanced Program Title */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {ui.category}
                </Badge>
                {ui.urgency.availableSpots && (
                  <Badge variant="destructive" className="animate-pulse">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Apenas {ui.urgency.availableSpots} vagas!
                  </Badge>
                )}
              </div>
              
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

            {/* Enhanced Program Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <ImageWithFallback
                src={ui.coverImage}
                alt={ui.title}
                className="w-full h-80 lg:h-96 object-cover"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button 
                  size="lg" 
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                >
                  <Play className="w-6 h-6 mr-2" />
                  Preview do Programa
                </Button>
              </div>

              {/* Bottom Info Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Timer className="w-4 h-4" />
                    <span className="font-medium">Resultados em {ui.socialProof.avgTimeToResults}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <Download className="w-4 h-4" />
                    <span className="font-medium">{ui.deliveryMode}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Description */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-brand" />
              Sobre este programa
            </h2>
            
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

            {/* Enhanced Benefits Grid */}
            {ui.benefits.length > 0 && (
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
                        <div>
                          <span className="font-semibold text-foreground">{benefit.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Enhanced Features */}
            {ui.features.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Gift className="w-5 h-5 text-brand" />
                  O que está incluído
                </h3>
                <div className="grid gap-3">
                  {ui.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-secondary border border-border rounded-lg hover:bg-accent transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-brand flex-shrink-0" />
                      <span className="font-medium text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Enhanced Sidebar - Pricing Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              {/* Pricing Header */}
              <div className="bg-gradient-to-r from-brand to-brand-hover p-6 text-brand-foreground">
                <div className="text-center">
                  {hasDiscount && (
                    <div className="inline-flex items-center gap-2 bg-brand-foreground/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium mb-3">
                      <Zap className="w-4 h-4" />
                      {discountPercent}% de desconto!
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {hasDiscount && (
                      <div className="text-lg line-through opacity-75">
                        R$ {ui.pricing.originalPrice?.toLocaleString('pt-BR')}
                      </div>
                    )}
                    <div className="text-4xl font-bold">
                      R$ {ui.pricing.displayPrice?.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-brand-foreground/70">
                      ou 12x de R$ {Math.round(ui.pricing.displayPrice / 12).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Content */}
              <div className="p-6 space-y-6">
                {/* Urgency Message */}
                {ui.urgency.availableSpots && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-destructive font-semibold">
                      <AlertTriangle className="w-5 h-5" />
                      Últimas {ui.urgency.availableSpots} vagas disponíveis!
                    </div>
                    <div className="text-sm text-destructive/80 mt-1">
                      Garante já a sua vaga com desconto especial
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand text-brand-foreground font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Quero me inscrever agora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full border-brand/20 text-brand hover:bg-brand/10 font-medium"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Falar com a instrutora
                  </Button>
                </div>

                {/* Guarantees */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="w-5 h-5 text-brand" />
                    <span>Garantia de 7 dias ou seu dinheiro de volta</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Download className="w-5 h-5 text-brand" />
                    <span>Acesso imediato após o pagamento</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MessageSquareText className="w-5 h-5 text-brand" />
                    <span>Suporte direto com a instrutora</span>
                  </div>
                </div>

                {/* Social Proof Numbers */}
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">{ui.socialProof.studentsCount}</div>
                    <div className="text-xs text-muted-foreground">alunos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-brand">{ui.socialProof.successRate}</div>
                    <div className="text-xs text-muted-foreground">sucesso</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-brand">{trainer.rating}</div>
                    <div className="text-xs text-muted-foreground">avaliação</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Trainer Section */}
            <div className="mt-6">
              <div className="bg-gradient-to-br from-secondary to-card p-6 rounded-2xl border border-border">
                <h3 className="text-xl font-bold text-foreground mb-4">Seu instrutor</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-16 h-16 ring-2 ring-accent">
                      <AvatarImage src={trainer.avatar} alt={trainer.name} />
                      <AvatarFallback className="bg-accent text-accent-foreground text-lg font-bold">
                        {trainer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">{trainer.name}</h4>
                      <p className="text-sm text-muted-foreground">Personal Trainer & Coach</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-foreground">{trainer.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Stats */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-t border-border">
                    <div className="text-center">
                      <div className="text-lg font-bold text-brand">{ui.trainerAuthority.yearsExperience || 8}</div>
                      <div className="text-xs text-muted-foreground">anos exp.</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-brand">{ui.trainerAuthority.studentsHelped || 1200}+</div>
                      <div className="text-xs text-muted-foreground">alunos</div>
                    </div>
                  </div>

                  {/* Compact Achievements */}
                  {ui.trainerAuthority.achievements && (
                    <div className="space-y-2">
                      {ui.trainerAuthority.achievements.slice(0, 2).map((achievement, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Award className="w-3 h-3 text-brand" />
                          <span>{achievement}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNavigateToTrainer}
                    className="w-full hover:bg-accent border-brand/20 text-brand"
                  >
                    Ver perfil completo
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Shield className="w-4 h-4" />
                <span>Compra 100% segura e protegida</span>
              </div>
              <div>Processamento via SSL • Dados criptografados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}