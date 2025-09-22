/**
 * 🚀 PROGRAM DETAILS ENHANCED - Versão completa inspirada no seu design
 * Adiciona algumas melhorias extras à sua excelente base
 */

import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import {
  Star,
  Heart,
  Share2,
  SignalHigh,
  MapPin,
  Clock,
  CalendarDays,
  Banknote,
  Info,
  Users,
  TrendingUp,
  Timer,
  AlertTriangle,
  MessageCircle,
  MessageSquareText,
  Award,
  Smile,
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
  Home,
  ChevronDown,
  Eye,
  ThumbsUp,
  Copy,
  Facebook,
  Twitter,
  WhatsApp,
  Calendar,
  CreditCard,
  Smartphone,
  Globe,
  Video,
  FileText,
  TrendingDown
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Hook simulado - usar o real
const useProgramWithTrainerOptimized = (id) => ({
  data: {
    title: 'Emagreça 10kg em 8 Semanas - Método Comprovado',
    category: 'Perda de Peso',
    short_description: 'Transforme seu corpo com o método que já ajudou +500 pessoas a emagrecer com saúde',
    description: 'Um programa completo de emagrecimento que combina treino funcional, orientação nutricional e acompanhamento personalizado. Desenvolvido com base em anos de experiência e resultados comprovados. Inclui material didático exclusivo, planilhas de acompanhamento e suporte direto com a professora.',
    level: 'Todos os níveis',
    modality_norm: 'hybrid',
    duration: 8,
    duration_type: 'weeks',
    frequency: 4,
    display_price: 497,
    availableSpots: 7,
    studentsCount: 523,
    successRate: '91%',
    avgTimeToResults: '3-5 semanas',
    completionRate: 78, // Para progress bar
    lastUpdated: '2024-01-15',
    language: 'Português',
    certificateIncluded: true,
    trainer: {
      id: '1',
      name: 'Ana Carolina Silva',
      avatar: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&q=80',
      rating: 4.9,
      isOnline: true,
      responseTime: '~2h'
    },
    stats: {
      reviewCount: 127,
      enrollments: 523,
      views: 12547
    },
    media: [{
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      type: 'image'
    }, {
      url: 'https://www.youtube.com/embed/example',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80'
    }],
    program_data: {
      packages: [{
        name: 'Programa Completo',
        price: 497,
        originalPrice: 797,
        description: 'Acesso completo + acompanhamento personalizado',
        features: [
          '8 semanas de treino progressivo',
          'Guia nutricional detalhado',
          'Suporte diário via WhatsApp',
          'Planilha de evolução',
          'Receitas exclusivas',
          'Grupo VIP de apoio',
          'Certificado de conclusão',
          'Atualizações gratuitas'
        ],
        recommended: true
      }],
      delivery_mode: 'Digital + Suporte',
      modules: [
        { name: 'Fundamentos', duration: 'Semana 1-2', status: 'available' },
        { name: 'Intensificação', duration: 'Semana 3-5', status: 'available' },
        { name: 'Consolidação', duration: 'Semana 6-8', status: 'available' }
      ]
    },
    benefits: [
      { icon: Target, label: 'Perda de 5-10kg garantida' },
      { icon: Zap, label: 'Resultados visíveis em 2 semanas' },
      { icon: Shield, label: 'Método 100% seguro' },
      { icon: Users, label: 'Comunidade de apoio' }
    ],
    relatedPrograms: [
      { id: '2', title: 'Manutenção do Peso', trainer: 'Ana Carolina', price: 297 },
      { id: '3', title: 'Tonificação Avançada', trainer: 'Ana Carolina', price: 397 }
    ],
    trainerAuthority: {
      yearsExperience: 8,
      studentsHelped: 1200,
      achievements: ['CREF 12345', 'Especialista em Emagrecimento', 'Nutrição Esportiva']
    }
  },
  isLoading: false,
  error: null
});

interface ProgramDetailsEnhancedProps {
  onNavigateToTrainer: (trainerId: string) => void;
  programIdOrSlug?: string;
}

export default function ProgramDetailsEnhanced({
  onNavigateToTrainer,
  programIdOrSlug: propProgramId
}: ProgramDetailsEnhancedProps) {
  const { programId: urlProgramId } = useParams<{ programId: string }>();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(127);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const programIdOrSlug = propProgramId || urlProgramId || '';
  const { data: uiProgram, isLoading, error } = useProgramWithTrainerOptimized(programIdOrSlug);

  const handleLike = useCallback(() => {
    setIsLiked(prev => !prev);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
  }, [isLiked]);

  const handleShare = useCallback(async (platform?: string) => {
    const url = window.location.href;
    const text = `Confira este programa: ${uiProgram?.title}`;
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else {
      try {
        await navigator.clipboard.writeText(url);
        // Mostrar toast de sucesso
      } catch (error) {
        console.warn('Erro ao compartilhar:', error);
      }
    }
    setShowShareMenu(false);
  }, [uiProgram]);

  const ui = useMemo(() => {
    // ... mesmo código de resolução de dados da sua versão
    const p: any = uiProgram ?? {};
    
    return {
      title: p.title ?? 'Programa de Transformação',
      category: p.category ?? 'Fitness',
      coverImage: p.media?.[0]?.url ?? 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      shortDescription: p.short_description ?? 'Transforme sua vida',
      fullDescription: p.description ?? 'Programa completo.',
      level: p.level ?? 'Iniciante',
      modalityNorm: p.modality_norm ?? 'presencial',
      duration: p.duration ?? 4,
      frequency: p.frequency ?? 3,
      completionRate: p.completionRate ?? 75,
      lastUpdated: p.lastUpdated ?? '2024-01-01',
      language: p.language ?? 'Português',
      certificateIncluded: p.certificateIncluded ?? false,
      trainer: {
        id: p.trainer?.id ?? '1',
        name: p.trainer?.name ?? 'Instrutor',
        avatar: p.trainer?.avatar ?? '',
        rating: Number(p.trainer?.rating ?? 4.8),
        isOnline: p.trainer?.isOnline ?? false,
        responseTime: p.trainer?.responseTime ?? '~4h'
      },
      stats: {
        reviewCount: p.stats?.reviewCount ?? 18,
        enrollments: p.stats?.enrollments ?? 127,
        views: p.stats?.views ?? 1000
      },
      media: p.media ?? [],
      socialProof: {
        studentsCount: p.studentsCount ?? 250,
        successRate: p.successRate ?? '87%',
        avgTimeToResults: p.avgTimeToResults ?? '4-6 semanas'
      },
      pricing: {
        displayPrice: p.display_price ?? 397,
        originalPrice: p.program_data?.packages?.[0]?.originalPrice ?? null,
        packages: p.program_data?.packages ?? []
      },
      urgency: {
        availableSpots: p.availableSpots ?? null
      },
      benefits: p.benefits ?? [],
      features: p.program_data?.packages?.[0]?.features ?? [],
      modules: p.program_data?.modules ?? [],
      relatedPrograms: p.relatedPrograms ?? [],
      deliveryMode: p.program_data?.delivery_mode ?? 'Digital',
      trainerAuthority: p.trainerAuthority ?? {}
    };
  }, [uiProgram]);

  if (isLoading) {
    // Mesma estrutura de loading da sua versão
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-8">
          {/* Enhanced skeleton */}
          <div className="h-4 bg-gray-200 rounded w-64"></div> {/* Breadcrumb */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-80 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !uiProgram) {
    // Mesmo error state da sua versão
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

  const hasDiscount = ui.pricing.originalPrice && ui.pricing.originalPrice > ui.pricing.displayPrice;
  const discountPercent = hasDiscount 
    ? Math.round(((ui.pricing.originalPrice - ui.pricing.displayPrice) / ui.pricing.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 🆕 Enhanced Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              Início
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/programas">Programas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/categoria/${ui.category.toLowerCase()}`}>
              {ui.category}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">{ui.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Enhanced */}
        <div className="lg:col-span-2 space-y-8">
          {/* Enhanced Header com mais badges */}
          <section className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative">
                  <Avatar className="h-16 w-16 ring-4 ring-blue-50">
                    <AvatarImage src={ui.trainer.avatar} alt={ui.trainer.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                      {ui.trainer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {ui.trainer.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">{ui.trainer.name}</span>
                    <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                      <Award className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                    {ui.trainer.isOnline && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Online - responde em {ui.trainer.responseTime}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Enhanced Social Proof */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">{ui.trainer.rating}</span>
                      <span>({ui.stats.reviewCount})</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold text-gray-900">{ui.socialProof.studentsCount}</span>
                      <span>alunos</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span className="font-semibold text-gray-900">{ui.stats.views.toLocaleString()}</span>
                      <span>visualizações</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-700">{ui.socialProof.successRate}</span>
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
                      ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 transition-all duration-200 ${
                    isLiked ? 'fill-current scale-110' : ''
                  }`} />
                  <span className="font-medium">{likeCount}</span>
                </Button>

                {/* 🆕 Enhanced Share Menu */}
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="hover:bg-gray-50"
                  >
                    <Share2 className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                  
                  {showShareMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          Copiar link
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <WhatsApp className="w-4 h-4" />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Facebook className="w-4 h-4" />
                          Facebook
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Twitter className="w-4 h-4" />
                          Twitter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Program Title com mais badges */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {ui.category}
                </Badge>
                {ui.urgency.availableSpots && (
                  <Badge className="bg-orange-100 text-orange-800 animate-pulse">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Apenas {ui.urgency.availableSpots} vagas!
                  </Badge>
                )}
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Atualizado em {new Date(ui.lastUpdated).toLocaleDateString('pt-BR')}
                </Badge>
                {ui.certificateIncluded && (
                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                    <Award className="w-3 h-3 mr-1" />
                    Com certificado
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {ui.title}
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                {ui.shortDescription}
              </p>

              {/* Enhanced Info Chips */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
                  <SignalHigh className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm">{ui.level}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm">
                    {ui.modalityNorm === 'hybrid' ? 'Híbrido' : 
                     ui.modalityNorm === 'online' ? 'Online' : 'Presencial'}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-sm">{ui.duration} semanas</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-sm">{ui.frequency}x por semana</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
                  <Globe className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-sm">{ui.language}</span>
                </div>
              </div>

              {/* 🆕 Progress Bar para taxa de conclusão */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Taxa de conclusão</span>
                  <span className="text-sm font-semibold text-green-600">{ui.completionRate}%</span>
                </div>
                <Progress value={ui.completionRate} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {ui.completionRate}% dos alunos completam o programa com sucesso
                </p>
              </div>
            </div>

            {/* 🆕 Media Gallery com preview */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <ImageWithFallback
                  src={ui.media[selectedMediaIndex]?.url || ui.coverImage}
                  alt={ui.title}
                  className="w-full h-80 lg:h-96 object-cover"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Media Controls */}
                {ui.media.length > 1 && (
                  <div className="absolute bottom-4 left-4">
                    <div className="flex gap-2">
                      {ui.media.map((media, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedMediaIndex(index)}
                          className={`w-12 h-8 rounded border-2 overflow-hidden transition-all ${
                            index === selectedMediaIndex 
                              ? 'border-white shadow-lg' 
                              : 'border-white/50 hover:border-white/80'
                          }`}
                        >
                          {media.type === 'video' ? (
                            <div className="w-full h-full bg-black/50 flex items-center justify-center">
                              <Video className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <img src={media.url} alt="" className="w-full h-full object-cover" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    size="lg" 
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    {ui.media[selectedMediaIndex]?.type === 'video' ? 'Assistir vídeo' : 'Preview do programa'}
                  </Button>
                </div>

                {/* Bottom Info Overlay */}
                <div className="absolute bottom-4 right-4">
                  <div className="flex items-center gap-4 text-white text-sm">
                    <div className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      <span>Resultados em {ui.socialProof.avgTimeToResults}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{ui.deliveryMode}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Continua com o resto do conteúdo da sua versão + modules section */}
          
          {/* 🆕 Program Modules */}
          {ui.modules.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Conteúdo do programa
              </h2>
              
              <div className="space-y-3">
                {ui.modules.map((module, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-blue-600">{idx + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{module.name}</h4>
                        <p className="text-sm text-gray-600">{module.duration}</p>
                      </div>
                    </div>
                    <Badge variant={module.status === 'available' ? 'default' : 'secondary'}>
                      {module.status === 'available' ? 'Disponível' : 'Em breve'}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Continue com description, benefits, features da sua versão... */}
          {/* Enhanced Description */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Sobre este programa
            </h2>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                {showFullDescription ? ui.fullDescription : ui.fullDescription.substring(0, 200) + '...'}
              </p>
              
              {ui.fullDescription.length > 200 && (
                <Button 
                  variant="link" 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                >
                  {showFullDescription ? 'Ver menos' : 'Ver mais'}
                  <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${
                    showFullDescription ? 'rotate-90' : ''
                  }`} />
                </Button>
              )}
            </div>

            {/* Benefits e Features - igual sua versão */}
            {ui.benefits.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Benefícios que você vai alcançar
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {ui.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <benefit.icon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{benefit.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ui.features.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-blue-600" />
                  O que está incluído
                </h3>
                <div className="grid gap-3">
                  {ui.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Seção do trainer - igual sua versão */}
          <section className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Seu instrutor</h2>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <Avatar className="w-24 h-24 ring-4 ring-blue-50">
                  <AvatarImage src={ui.trainer.avatar} alt={ui.trainer.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-bold">
                    {ui.trainer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{ui.trainer.name}</h3>
                  <p className="text-gray-600">Personal Trainer & Coach de Emagrecimento</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{ui.trainerAuthority.yearsExperience || 8}</div>
                    <div className="text-sm text-gray-600">anos de experiência</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{ui.trainerAuthority.studentsHelped || 1200}+</div>
                    <div className="text-sm text-gray-600">alunos transformados</div>
                  </div>
                  <div className="text-center col-span-2 lg:col-span-1">
                    <div className="text-2xl font-bold text-yellow-600">{ui.trainer.rating}</div>
                    <div className="text-sm text-gray-600">avaliação média</div>
                  </div>
                </div>

                {ui.trainerAuthority.achievements && (
                  <div className="flex flex-wrap gap-2">
                    {ui.trainerAuthority.achievements.map((achievement, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-white border-gray-300">
                        <Award className="w-3 h-3 mr-1" />
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button 
                  variant="outline" 
                  onClick={() => onNavigateToTrainer(ui.trainer.id)}
                  className="w-full sm:w-auto hover:bg-blue-50 border-blue-200 text-blue-700"
                >
                  Ver perfil completo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </section>

          {/* 🆕 Related Programs */}
          {ui.relatedPrograms.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Outros programas da instrutora</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {ui.relatedPrograms.map((program) => (
                  <div key={program.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 mb-1">{program.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">por {program.trainer}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">R$ {program.price.toLocaleString('pt-BR')}</span>
                      <Button variant="outline" size="sm">
                        Ver programa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar - igual sua versão mas com algumas melhorias */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            {/* Sua pricing card aqui... */}
            
            {/* Adicionar mais elementos de confiança, reviews, etc. */}
          </div>
        </div>
      </div>
    </div>
  );
}