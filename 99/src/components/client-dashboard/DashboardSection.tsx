import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Sparkles, 
  Target, 
  Star, 
  Clock, 
  TrendingUp,
  ChevronRight,
  Play,
  BookOpen,
  Heart,
  Users,
  Award,
  Calendar,
  ArrowRight,
  Activity,
  CheckCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { SportInterestsSection } from './SportInterestsSection';

export function DashboardSection() {
  const { user } = useAuth();

  // Estados declarados primeiro
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSports, setCurrentSports] = useState<string[]>([]);
  const [pastSports, setPastSports] = useState<string[]>([]);
  const [sportsCuriosity, setSportsCuriosity] = useState<string[]>([]);
  const [recentPrograms, setRecentPrograms] = useState<any[]>([]);
  const [recommendedPrograms, setRecommendedPrograms] = useState<any[]>([]);
  const [clientStats, setClientStats] = useState({
    activePrograms: 0,
    weeklyGoalProgress: 0,
    favoriteTrainers: 0,
    completedWorkouts: 0,
    profileViews: 0,
    unreadMessages: 0,
    profileCompletion: 0
  });
  const [userProfile, setUserProfile] = useState<{
    displayName: string;
    avatarUrl: string;
    gender: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Slides de boas-vindas (agora userProfile está definido)
  const welcomeSlides = [
    {
      id: 1,
      title: `Bem-vind${userProfile?.gender === 'female' ? 'a' : 'o'}, ${userProfile?.displayName?.split(' ')[0] || 'Cliente'}! 🎉`,
      subtitle: "Sua jornada fitness está apenas começando",
      description: "Complete seu perfil e descubra treinadores incríveis que combinam com seus objetivos",
      cta: "Completar Perfil",
      background: "bg-gradient-to-br from-purple-500 to-pink-500",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80"
    },
    {
      id: 2,
      title: "Novos Programas Chegaram! 🚀",
      subtitle: "Descubra treinos personalizados para você",
      description: "Baseado nos seus interesses em musculação e funcional, encontramos programas perfeitos",
      cta: "Ver Programas",
      background: "bg-gradient-to-br from-blue-500 to-teal-500",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
    },
    {
      id: 3,
      title: "Meta da Semana 🎯",
      subtitle: "Continue consistente nos seus treinos",
      description: "Você já treinou 3 vezes esta semana. Que tal mais uma sessão hoje?",
      cta: "Ver Treinos",
      background: "bg-gradient-to-br from-orange-500 to-red-500",
      image: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=800&q=80"
    }
  ];

  // ✅ CARREGAR DADOS REAIS DO SUPABASE
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // 1. Carregar perfil do usuário (display_name, avatar_url, etc.)
        const { data: userProfileData } = await supabase
          .from('user_profiles')
          .select('display_name, avatar_url, gender')
          .eq('user_id', user.id)
          .single();

        if (userProfileData) {
          setUserProfile({
            displayName: userProfileData.display_name || 'Cliente',
            avatarUrl: userProfileData.avatar_url || '',
            gender: userProfileData.gender
          });
        }

        // 2. Carregar perfil do cliente e esportes da tabela unificada
        const { data: clientProfile } = await supabase
          .from('user_profiles')
          .select('profile_data')
          .eq('user_id', user.id)
          .eq('role', 'client')
          .single();

        if (clientProfile?.profile_data) {
          setCurrentSports(clientProfile.profile_data.sportsInterest || []);
          setPastSports(clientProfile.profile_data.sportsTrained || []);
          setSportsCuriosity(clientProfile.profile_data.sportsCurious || []);
        }

        // 3. Carregar programas recomendados usando o serviço unificado
        const { clientDashboardService } = await import('../../services/client-dashboard.service');
        const recommendedProgramsData = await clientDashboardService.getRecommendedPrograms(user.id, 6);

        if (recommendedProgramsData) {
          setRecentPrograms(recommendedProgramsData.slice(0, 3));
          setRecommendedPrograms(recommendedProgramsData.slice(3, 6));
        }

        // 4. Carregar estatísticas do cliente usando dados estáticos
        // Estas funcionalidades serão implementadas quando as tabelas relacionais estiverem prontas
        const activePrograms = 0; // TODO: implementar com tabelas relacionais
        const favoriteTrainers = 0; // TODO: implementar com tabelas relacionais  
        const completedWorkouts = 12; // TODO: implementar quando houver tabela de workouts
        const weeklyGoalProgress = 75; // TODO: implementar com sistema de metas
        const profileViews = 0; // TODO: implementar com sistema de analytics
        const unreadMessages = 0; // TODO: implementar com sistema de mensagens
        
        // Calcular completude do perfil baseado nos dados reais
        let profileCompletion = 0;
        if (clientProfile?.profile_data) {
          const data = clientProfile.profile_data;
          const requiredFields = ['sportsInterest', 'primaryGoals', 'fitnessLevel', 'city'];
          const filledFields = requiredFields.filter(field => {
            const value = data[field];
            return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0);
          });
          profileCompletion = Math.round((filledFields.length / requiredFields.length) * 100);
        }

        setClientStats({
          activePrograms,
          weeklyGoalProgress,
          favoriteTrainers,
          completedWorkouts,
          profileViews,
          unreadMessages,
          profileCompletion
        });

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  const handleSportsChange = (field: 'currentSports' | 'pastSports' | 'sportsCuriosity', sports: string[]) => {
    switch (field) {
      case 'currentSports':
        setCurrentSports(sports);
        break;
      case 'pastSports':
        setPastSports(sports);
        break;
      case 'sportsCuriosity':
        setSportsCuriosity(sports);
        break;
    }
  };

  const ProgramCard = ({ program, isRecommended = false }: { program: any; isRecommended?: boolean }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img 
          src={program.image} 
          alt={program.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {program.isNew && (
          <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600">
            Novo
          </Badge>
        )}
        <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {program.category}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{program.title}</h3>
            {isRecommended && program.matchReason && (
              <p className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {program.matchReason}
              </p>
            )}
          </div>
        </div>

        {/* Trainer Info */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={program.trainerImage} />
            <AvatarFallback>{program.trainer[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">{program.trainer}</span>
        </div>

        {/* Program Details */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {program.duration}
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {program.level}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {program.students}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{program.rating}</span>
          <span className="text-xs text-gray-500">({program.students} alunos)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{program.price}</span>
            {program.originalPrice && (
              <span className="text-sm text-gray-500 line-through">{program.originalPrice}</span>
            )}
          </div>
          <Button size="sm" variant="brand">
            Ver Programa
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full min-h-screen space-y-8">
      {/* Header Section */}
      <div className="space-y-2 px-4 lg:px-6">
        <h1 className="text-2xl font-semibold mt-[20px] mr-[0px] mb-[7px] ml-[0px]">Olá, {userProfile?.displayName?.split(' ')[0] || 'Cliente'}!</h1>
        <p className="text-muted-foreground">
          Pronta para seu próximo treino?
        </p>
      </div>

      {/* Content */}
      <div className="w-full px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-3 space-y-6">

            {/* Welcome Carousel */}
            <section>
              {/* Mobile Carousel */}
              <div className="block md:hidden">
                <Carousel className="w-full">
                  <CarouselContent>
                    {welcomeSlides.map((slide) => (
                      <CarouselItem key={slide.id}>
                        <Card className="border-0 overflow-hidden mx-2">
                          <div className={`${slide.background} relative h-64`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                            <img 
                              src={slide.image} 
                              alt={slide.title}
                              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                            />
                            <div className="relative h-full flex items-center p-4">
                              <div className="text-white">
                                <h1 className="text-2xl font-bold mb-2">{slide.title}</h1>
                                <h2 className="text-lg font-medium mb-3 opacity-90">{slide.subtitle}</h2>
                                <p className="text-sm mb-4 opacity-80 line-clamp-2">{slide.description}</p>
                                <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                                  {slide.cta}
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>

              {/* Desktop Carousel */}
              <div className="hidden md:block">
                <Carousel className="w-full">
                  <CarouselContent>
                    {welcomeSlides.map((slide) => (
                      <CarouselItem key={slide.id}>
                        <Card className="border-0 overflow-hidden">
                          <div className={`${slide.background} relative h-64 lg:h-80`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                            <img 
                              src={slide.image} 
                              alt={slide.title}
                              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                            />
                            <div className="relative h-full flex items-center p-8 lg:p-12">
                              <div className="text-white max-w-lg">
                                <h1 className="text-3xl lg:text-4xl font-bold mb-3">{slide.title}</h1>
                                <h2 className="text-xl lg:text-2xl font-medium mb-4 opacity-90">{slide.subtitle}</h2>
                                <p className="text-lg mb-6 opacity-80">{slide.description}</p>
                                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                                  {slide.cta}
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
              </div>
            </section>

            {/* Quick Stats */}
            <section>
              {/* Mobile Carousel */}
              <div className="block md:hidden">
                <Carousel className="w-full">
                  <CarouselContent className="-ml-2">
                    <CarouselItem className="pl-2 basis-1/2">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{loading ? '...' : clientStats.activePrograms}</div>
                          <div className="text-sm text-gray-500">Programas Ativos</div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                    <CarouselItem className="pl-2 basis-1/2">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <div className="p-2 bg-green-100 rounded-full">
                              <Target className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{loading ? '...' : `${clientStats.weeklyGoalProgress}%`}</div>
                          <div className="text-sm text-gray-500">Meta Semanal</div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                    <CarouselItem className="pl-2 basis-1/2">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <div className="p-2 bg-purple-100 rounded-full">
                              <Heart className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{loading ? '...' : clientStats.favoriteTrainers}</div>
                          <div className="text-sm text-gray-500">Favoritos</div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                    <CarouselItem className="pl-2 basis-1/2">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <div className="p-2 bg-orange-100 rounded-full">
                              <Award className="h-5 w-5 text-orange-600" />
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{loading ? '...' : clientStats.completedWorkouts}</div>
                          <div className="text-sm text-gray-500">Treinos</div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
              </div>

              {/* Desktop Grid */}
              <div className="hidden md:grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{loading ? '...' : clientStats.activePrograms}</div>
                    <div className="text-sm text-gray-500">Programas Ativos</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Target className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{loading ? '...' : `${clientStats.weeklyGoalProgress}%`}</div>
                    <div className="text-sm text-gray-500">Meta Semanal</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Heart className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{loading ? '...' : clientStats.favoriteTrainers}</div>
                    <div className="text-sm text-gray-500">Treinadores Favoritos</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <Award className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{loading ? '...' : clientStats.completedWorkouts}</div>
                    <div className="text-sm text-gray-500">Treinos Completos</div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Sports Interests Dashboard Preview */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[var(--brand)]" />
                    Meus Esportes de Interesse
                  </h2>
                  <p className="text-gray-600">Gerencie seus esportes favoritos e descobertas</p>
                </div>
                <Button variant="outline" size="sm">
                  Editar Interesses
                </Button>
              </div>

              <Card className="overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  {/* Mobile Carousel */}
                  <div className="block lg:hidden">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {/* Current Sports Preview */}
                        <CarouselItem>
                          <div className="px-2">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-green-100 rounded-full">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <h4 className="font-medium text-gray-900">Pratico Atualmente</h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {currentSports.slice(0, 4).map((sport) => (
                                  <Badge key={sport} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                    {sport}
                                  </Badge>
                                ))}
                                {currentSports.length > 4 && (
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                    +{currentSports.length - 4} mais
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CarouselItem>

                        {/* Sports Curiosity Preview */}
                        <CarouselItem>
                          <div className="px-2">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-yellow-100 rounded-full">
                                  <Sparkles className="h-4 w-4 text-yellow-600" />
                                </div>
                                <h4 className="font-medium text-gray-900">Tenho Curiosidade</h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {sportsCuriosity.slice(0, 4).map((sport) => (
                                  <Badge key={sport} variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                    {sport}
                                  </Badge>
                                ))}
                                {sportsCuriosity.length > 4 && (
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                    +{sportsCuriosity.length - 4} mais
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CarouselItem>

                        {/* Past Sports Preview */}
                        <CarouselItem>
                          <div className="px-2">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-blue-100 rounded-full">
                                  <Clock className="h-4 w-4 text-blue-600" />
                                </div>
                                <h4 className="font-medium text-gray-900">Já Pratiquei</h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {pastSports.slice(0, 4).map((sport) => (
                                  <Badge key={sport} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                                    {sport}
                                  </Badge>
                                ))}
                                {pastSports.length > 4 && (
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                    +{pastSports.length - 4} mais
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      </CarouselContent>
                    </Carousel>
                  </div>

                  {/* Desktop Grid */}
                  <div className="hidden lg:grid grid-cols-3 gap-6">
                    {/* Current Sports Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">Pratico Atualmente</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentSports.slice(0, 3).map((sport) => (
                          <Badge key={sport} variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 flex items-center gap-1">
                            <div className="w-3 h-3">
                              <img 
                                src={`https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508ab177b7d1b2c8bd16d49_fitness-biceps.svg`}
                                alt={sport}
                                className="w-full h-full object-contain grayscale opacity-60"
                                loading="lazy"
                              />
                            </div>
                            {sport}
                          </Badge>
                        ))}
                        {currentSports.length > 3 && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                            +{currentSports.length - 3} mais
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Sports Curiosity Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-yellow-100 rounded-full">
                          <Sparkles className="h-4 w-4 text-yellow-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">Tenho Curiosidade</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sportsCuriosity.slice(0, 3).map((sport) => (
                          <Badge key={sport} variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 flex items-center gap-1">
                            <div className="w-3 h-3">
                              <img 
                                src={`https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aafd7401672b3b753bf3_gymnastics-ribbon-person-2.svg`}
                                alt={sport}
                                className="w-full h-full object-contain grayscale opacity-60"
                                loading="lazy"
                              />
                            </div>
                            {sport}
                          </Badge>
                        ))}
                        {sportsCuriosity.length > 3 && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                            +{sportsCuriosity.length - 3} mais
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Past Sports Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-blue-100 rounded-full">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">Já Pratiquei</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pastSports.slice(0, 3).map((sport) => (
                          <Badge key={sport} variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 flex items-center gap-1">
                            <div className="w-3 h-3">
                              <img 
                                src={`https://cdn.prod.website-files.com/6105b575384a7015be985fb9/610d3768e2c3de514e5c30a2_corrida.png`}
                                alt={sport}
                                className="w-full h-full object-contain grayscale opacity-60"
                                loading="lazy"
                              />
                            </div>
                            {sport}
                          </Badge>
                        ))}
                        {pastSports.length > 3 && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                            +{pastSports.length - 3} mais
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Recent Programs */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Últimos Programas</h2>
                  <p className="text-gray-600">Novos programas adicionados recentemente</p>
                </div>
                <Button variant="outline" size="sm">
                  Ver Todos
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentPrograms.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            </section>

            {/* Recommended Programs */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-blue-500" />
                    Recomendados Para Você
                  </h2>
                  <p className="text-gray-600">Baseado nos seus interesses e objetivos</p>
                </div>
                <Button variant="outline" size="sm">
                  Ver Mais
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedPrograms.map((program) => (
                  <ProgramCard key={program.id} program={program} isRecommended />
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            
            {/* Profile Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">
                  Estatísticas do seu perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Top Row */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">{loading ? '...' : clientStats.activePrograms}</div>
                    <div className="text-xs text-gray-500 uppercase">Programas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">{loading ? '...' : clientStats.favoriteTrainers}</div>
                    <div className="text-xs text-gray-500 uppercase">Favoritos</div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Middle Row */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">{loading ? '...' : clientStats.profileViews}</div>
                    <div className="text-xs text-gray-500 uppercase">Visualizações</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">{loading ? '...' : clientStats.unreadMessages}</div>
                    <div className="text-xs text-gray-500 uppercase">Mensagens</div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Bottom Row */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">{loading ? '...' : `${clientStats.profileCompletion}%`}</div>
                    <div className="text-xs text-gray-500 uppercase">Perfil completo</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">{loading ? '...' : clientStats.completedWorkouts}</div>
                    <div className="text-xs text-gray-500 uppercase">Treinos feitos</div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Recommendation Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">
                  Recomendação para você
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">João Silva</h4>
                    <p className="text-xs text-gray-500">Personal Trainer</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      <span className="text-xs">4.9</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Especialista em hipertrofia, combina perfeitamente com seus objetivos.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Ver Perfil
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}