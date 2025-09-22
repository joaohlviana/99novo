import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { MapPin, Star, Instagram, MessageCircle, Verified, Users, Heart, Clock, Calendar, Video, Target, Dumbbell, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

import { ImageWithFallback } from './figma/ImageWithFallback';
import { getSpecialtyIcon, getSpecialtyColor } from './trainer/constants/specialty-config';

interface TrainerCardProps {
  trainer: {
    id: string;
    name: string;
    image: string;
    rating: number;
    location: string;
    specialties: string[];
    verified: boolean;
    programs: {
      id: string;
      title: string;
      price: string;
      image: string;
      type: 'presencial' | 'online';
      level?: string;
      category?: string;
      duration?: string;
      students?: number;
      rating?: number;
      description?: string;
    }[];
  };
  // onNavigateToTrainer removed - using useNavigation hook instead
}

import { useNavigation } from '../hooks/useNavigation';
import { useProtectedAction } from '../hooks/useProtectedAction';
import { LoginModal } from './auth/LoginModal';

export function TrainerCard({ trainer }: TrainerCardProps) {
  const { navigateToTrainer } = useNavigation();
  const { executeProtectedAction, showLoginModal, handleLoginSuccess, handleLoginCancel } = useProtectedAction();
  const [activeTab, setActiveTab] = useState('programs');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [personalizedSlide, setPersonalizedSlide] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);



  // Expandir programas mock para demonstrar scroll com dados completos
  const extendedPrograms = [
    ...trainer.programs.map(program => ({
      ...program,
      level: 'Intermediário' as const,
      category: program.title.includes('Funcional') ? 'Funcional' : 
                program.title.includes('Musculação') ? 'Musculação' : 'Fitness',
      duration: '8 semanas',
      students: Math.floor(Math.random() * 50) + 15,
      rating: (4.5 + Math.random() * 0.5),
      description: 'Programa completo focado em resultados reais.'
    })),
    {
      id: 'extra1',
      title: 'Yoga Flow Iniciante',
      price: 'R$ 89',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwZmxvdyUyMGNsYXNzfGVufDF8fHx8MTc1NjEzMzgyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      type: 'online' as const,
      level: 'Iniciante' as const,
      category: 'Yoga',
      duration: '6 semanas',
      students: 42,
      rating: 4.6,
      description: 'Sequências suaves para iniciantes no yoga.'
    },
    {
      id: 'extra2',
      title: 'HIIT Queima Gordura',
      price: 'R$ 127',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWl0JTIwd29ya291dCUyMGZpdG5lc3N8ZW58MXx8fHwxNzU2MTMzODMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      type: 'presencial' as const,
      level: 'Avançado' as const,
      category: 'HIIT',
      duration: '4 semanas',
      students: 28,
      rating: 4.8,
      description: 'Treinos intensos para queima acelerada.'
    },
    {
      id: 'extra3',
      title: 'Pilates Core Strong',
      price: 'R$ 157',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWxhdGVzJTIwY29yZSUyMHRyYWluaW5nfGVufDF8fHx8MTc1NjEzMzgzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      type: 'online' as const,
      level: 'Intermediário' as const,
      category: 'Pilates',
      duration: '10 semanas',
      students: 37,
      rating: 4.7,
      description: 'Fortalecimento do core com técnicas avançadas.'
    },
    {
      id: 'extra4',
      title: 'Mobilidade & Flexibilidade',
      price: 'R$ 97',
      image: 'https://images.unsplash.com/photo-1606889464198-fcb18894cf41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJldGNoaW5nJTIwZmxleGliaWxpdHklMjB0cmFpbmluZ3xlbnwxfHx8fDE3NTYxMzM4MzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      type: 'presencial' as const,
      level: 'Iniciante' as const,
      category: 'Mobilidade',
      duration: '12 semanas',
      students: 51,
      rating: 4.9,
      description: 'Melhore sua flexibilidade e mobilidade.'
    }
  ];

  // Expandir treinos personalizados mock para demonstrar scroll
  const personalizedOptions = [
    {
      id: 'presencial',
      type: 'Presencial',
      description: 'Treino individual personalizado',
      price: 'R$ 65/h',
      period: 'ou R$ 350/mês',
      features: ['Avaliação física', 'Treino personalizado', 'Acompanhamento direto'],
      icon: <Users className="h-4 w-4" />,
      popular: false
    },
    {
      id: 'consultoria',
      type: 'Consultoria Online',
      description: 'Acompanhamento mensal completo',
      price: 'R$ 150/mês',
      period: '2 calls + suporte',
      features: ['Videochamadas', 'Plano personalizado', 'Chat direto'],
      icon: <Video className="h-4 w-4" />,
      popular: true
    },
    {
      id: 'planilha',
      type: 'Planilha Personalizada',
      description: '4 semanas de treino customizado',
      price: 'R$ 35',
      period: 'pagamento único',
      features: ['PDF personalizado', 'Vídeos explicativos', 'Suporte WhatsApp'],
      icon: <Calendar className="h-4 w-4" />,
      popular: false
    },
    {
      id: 'hibrido',
      type: 'Híbrido Premium',
      description: 'Presencial + Online combinados',
      price: 'R$ 280/mês',
      period: '2x presencial + suporte',
      features: ['Melhor dos 2 mundos', 'Flexibilidade total', 'Resultados acelerados'],
      icon: <Target className="h-4 w-4" />,
      popular: false
    },
    {
      id: 'intensivo',
      type: 'Intensivo 30 Dias',
      description: 'Transformação acelerada',
      price: 'R$ 497',
      period: 'programa completo',
      features: ['Acompanhamento diário', 'Nutrição incluída', 'Garantia de resultado'],
      icon: <Zap className="h-4 w-4" />,
      popular: false
    },
    {
      id: 'grupo',
      type: 'Treino em Grupo',
      description: 'Pequenos grupos de 3-4 pessoas',
      price: 'R$ 180/mês',
      period: '3x por semana',
      features: ['Economia no valor', 'Motivação em grupo', 'Acompanhamento próximo'],
      icon: <Dumbbell className="h-4 w-4" />,
      popular: false
    }
  ];

  return (
    <Card className="overflow-hidden glass-card hover:shadow-xl transition-all duration-300 border-0">
      <div className="flex flex-col md:flex-row">
        {/* Left Section - Trainer Info */}
        <div className="md:w-2/5 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            {/* Trainer Info Section */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="relative group">
                  <ImageWithFallback
                    src={trainer.image}
                    alt={`${trainer.name} - Personal Trainer`}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-border shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  />
                  {trainer.verified && (
                    <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1.5 shadow-lg border-2 border-background">
                      <Verified className="h-5 w-5 text-[#e0093e]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">{trainer.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-black text-black" />
                    <span className="font-medium text-gray-900">{trainer.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({trainer.reviewCount})</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{trainer.location}</span>
                </div>

                {/* Specialties */}
                <div className="flex -space-x-1.5">
                  {trainer.specialties.slice(0, 3).map((specialty, index) => (
                    <div
                      key={specialty}
                      className={`
                        relative flex items-center justify-center w-9 h-9 rounded-full
                        ${getSpecialtyColor(specialty)}
                        hover:scale-110 transition-transform duration-200 cursor-pointer
                        shadow-sm hover:shadow-md
                      `}
                      title={specialty}
                      style={{ zIndex: trainer.specialties.length - index }}
                    >
                      {getSpecialtyIcon(specialty)}
                    </div>
                  ))}
                  
                  {trainer.specialties.length > 3 && (
                    <div 
                      className="relative flex items-center justify-center w-9 h-9 rounded-full border-2 border-background bg-muted text-muted-foreground hover:scale-110 transition-transform duration-200 cursor-pointer shadow-sm hover:shadow-md"
                      title={`+${trainer.specialties.length - 3} especialidades`}
                    >
                      <span className="text-xs font-medium">+{trainer.specialties.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Favorite Action */}
            <div className="flex items-center flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-3"
                onClick={() => executeProtectedAction(() => {
                  setIsFollowing(!isFollowing);
                  // Aqui você faria a chamada para a API
                  console.log(isFollowing ? 'Deixou de seguir' : 'Seguindo', trainer.name);
                })}
              >
                <Heart className={`h-5 w-5 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Bio */}
          <p className="text-muted-foreground leading-relaxed mb-6">
            Especialista em treinamento personalizado com foco em resultados sustentáveis. 
            Experiência comprovada ajudando pessoas a alcançarem seus objetivos de forma saudável.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => executeProtectedAction(() => {
                // Ação de contatar treinador
                console.log('Contatando treinador:', trainer.name);
                // Aqui você abriria um modal de contato ou navegaria para chat
              })}
              variant="outline"
              size="sm"
              className="px-4"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contatar
            </Button>

            <Button 
              onClick={() => navigateToTrainer(trainer.id)}
              className="px-6"
              size="sm"
            >
              Ver Perfil
            </Button>
          </div>
        </div>

        {/* Right Section - Tabs */}
        <div className="md:w-3/5 bg-white/50 backdrop-blur-md p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="programs" className="text-sm">
                Programas de treino
              </TabsTrigger>
              <TabsTrigger value="personalized" className="text-sm">
                Treinos personalizados
              </TabsTrigger>
            </TabsList>

            {/* Programs Tab */}
            {activeTab === 'programs' && (
              <TabsContent value="programs" className="space-y-4">
                <div className="relative">


                {/* Swiper container with lateral arrows */}
                <div className="relative">
                  {/* Left Arrow - Only show when there are elements to the left */}
                  {currentSlide > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 glass border border-glass-border hover:bg-white/90 shadow-sm hover:scale-105"
                      onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Right Arrow - Only show when there are elements to the right */}
                  {currentSlide < extendedPrograms.length - 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 glass border border-glass-border hover:bg-white/90 shadow-sm hover:scale-105"
                      onClick={() => setCurrentSlide(Math.min(extendedPrograms.length - 2, currentSlide + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Swiper container */}
                  <div className={`overflow-hidden ${
                    currentSlide > 0 ? 'pl-12' : 'pl-0'
                  } ${
                    currentSlide < extendedPrograms.length - 2 ? 'pr-12' : 'pr-0'
                  }`}>
                    <div 
                      className="flex gap-3 py-2 transition-transform duration-300"
                      style={{ transform: `translateX(-${currentSlide * 50}%)` }}
                    >
                      {extendedPrograms.map((program) => (
                        <div 
                          key={program.id}
                          className="flex-shrink-0 w-[48%] glass-card rounded-xl overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                        >
                          {/* Program Image */}
                          <div className="relative h-32 overflow-hidden group/image">
                            <ImageWithFallback
                              src={program.image}
                              alt={program.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                            />
                            {/* Gradient overlay for better badge visibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

                            <div className="absolute top-2 right-2 flex flex-col gap-1">
                              <Badge variant="secondary" className="bg-white/95 text-black shadow-sm backdrop-blur-sm text-xs">
                                {program.category}
                              </Badge>
                              <Badge 
                                variant={program.type === 'presencial' ? 'default' : 'secondary'}
                                className="text-xs px-2 py-0.5 bg-white/95 text-black shadow-sm backdrop-blur-sm"
                              >
                                {program.type === 'presencial' ? 'Presencial' : 'Online'}
                              </Badge>
                            </div>
                          </div>

                          {/* Program Content */}
                          <div className="p-3">
                            <div className="mb-2">
                              <h5 className="font-medium text-foreground text-sm leading-tight line-clamp-1 mb-1">
                                {program.title}
                              </h5>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {program.description}
                              </p>
                            </div>

                            {/* Program Stats - Condensed */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{program.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current text-yellow-500" />
                                <span>{program.rating.toFixed(1)}</span>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-semibold text-primary text-sm">{program.price}</span>
                                <span className="text-xs text-muted-foreground ml-1">
                                  {program.price.includes('/') ? '' : '/programa'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dots indicator */}
                <div className="flex items-center justify-center gap-1 mt-4">
                  {Array.from({ length: Math.ceil(extendedPrograms.length / 2) }).map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        Math.floor(currentSlide / 2) === index ? 'bg-primary' : 'bg-muted'
                      }`}
                      onClick={() => setCurrentSlide(index * 2)}
                    />
                  ))}
                </div>


                </div>
              </TabsContent>
            )}

            {/* Personalized Tab */}
            {activeTab === 'personalized' && (
              <TabsContent value="personalized" className="space-y-4">
                <div className="relative">
                {/* Counter */}
                <div className="flex justify-end mb-4">
                  <span className="text-xs text-muted-foreground">
                    {personalizedSlide + 1}-{Math.min(personalizedSlide + 2, personalizedOptions.length)} de {personalizedOptions.length}
                  </span>
                </div>

                {/* Swiper container with lateral arrows */}
                <div className="relative">
                  {/* Left Arrow - Only show when there are elements to the left */}
                  {personalizedSlide > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 glass border border-glass-border hover:bg-white/90 shadow-sm hover:scale-105"
                      onClick={() => setPersonalizedSlide(Math.max(0, personalizedSlide - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Right Arrow - Only show when there are elements to the right */}
                  {personalizedSlide < personalizedOptions.length - 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 glass border border-glass-border hover:bg-white/90 shadow-sm hover:scale-105"
                      onClick={() => setPersonalizedSlide(Math.min(personalizedOptions.length - 2, personalizedSlide + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Swiper container */}
                  <div className={`overflow-hidden ${
                    personalizedSlide > 0 ? 'pl-12' : 'pl-0'
                  } ${
                    personalizedSlide < personalizedOptions.length - 2 ? 'pr-12' : 'pr-0'
                  }`}>
                    <div 
                      className="flex gap-3 py-2 transition-transform duration-300"
                      style={{ transform: `translateX(-${personalizedSlide * 50}%)` }}
                    >
                      {personalizedOptions.map((option) => (
                        <div 
                          key={option.id}
                          className="flex-shrink-0 w-[48%] glass-card rounded-xl overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer relative"
                        >
                          {/* Header with icon background */}


                          {/* Content */}
                          <div className="p-3">
                            <div className="mb-2">
                              <h5 className="font-medium text-foreground text-sm leading-tight mb-1">
                                {option.type}
                              </h5>
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {option.description}
                              </p>
                            </div>

                            {/* Price */}
                            <div className="mb-2">
                              <div>
                                <span className="font-semibold text-primary text-sm">{option.price}</span>
                                <span className="text-xs text-muted-foreground ml-1">{option.period}</span>
                              </div>
                            </div>
                            
                            {/* Features - Limited to 2 */}
                            <div className="flex flex-wrap gap-1">
                              {option.features.slice(0, 2).map((feature, index) => (
                                <span key={index} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground flex items-center gap-1">
                                  <Target className="h-2 w-2 text-green-500" />
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dots indicator */}
                <div className="flex items-center justify-center gap-1 mt-4">
                  {Array.from({ length: Math.ceil(personalizedOptions.length / 2) }).map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        Math.floor(personalizedSlide / 2) === index ? 'bg-primary' : 'bg-muted'
                      }`}
                      onClick={() => setPersonalizedSlide(index * 2)}
                    />
                  ))}
                </div>


                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Login Modal para ações protegidas */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleLoginCancel}
        onSuccess={handleLoginSuccess}
        title="Entre para continuar"
        description="Você precisa estar logado para seguir treinadores ou entrar em contato."
      />
    </Card>
  );
}