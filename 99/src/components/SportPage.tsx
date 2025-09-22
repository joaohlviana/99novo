import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, Users, Trophy, Star, MapPin, Clock, CheckCircle, Filter, ChevronDown, X, Check, Heart, MessageCircle, Eye, Zap, Award, Calendar, UserCheck, PlayCircle, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { BrandContentSwitcher } from './ui/brand-content-switcher';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Section } from './layout/Section';
import { CardShell } from './layout/CardShell';
import { PageShell } from './layout/PageShell';
import { Header } from './Header';
import { Footer } from './Footer';
import { SportsMenu } from './SportsMenu';
import { TrainerProfileCardHybrid } from './TrainerProfileCardHybrid';
import { UnifiedProgramCard } from './unified/UnifiedProgramCard';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from './ui/drawer';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from './ui/command';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { SportsMegaMenu } from './ui/sports-mega-menu';
import { sportsCategories } from '../data/constants';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Skeleton } from './ui/skeleton';
import { Separator } from './ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { useNavigation } from '../hooks/useNavigation';
import { useUnifiedPrograms } from '../hooks/useUnifiedPrograms';
import { sportsService, Sport } from '../services/sports.service';
import sportPageSqlService, { type SqlTrainerResult } from '../services/sport-page-sql.service';

interface SportPageProps {
  sportId: string;
}

type ContentType = 'treinadores' | 'programas';
type SortOption = 'relevante' | 'avaliacao' | 'menor-preco' | 'maior-preco' | 'proximo' | 'recente';

// Interface para treinadores do esporte (compatibilidade)
interface SportTrainer {
  id: string;
  name: string;
  slug?: string;
  avatar_url?: string;
  profile_data: {
    city?: string;
    specialties?: string[];
    bio?: string;
    service_mode?: string[];
    hourly_rate?: number;
  };
  rating?: number;
  total_students?: number;
  is_verified?: boolean;
  // Campos extras do SQL
  sources?: string[];
  sample_program_titles?: string[] | null;
}

// Quick access filters
const quickFilters = [
  { id: 'perto', label: 'Perto de mim', icon: MapPin },
  { id: 'melhor-avaliado', label: 'Melhor avaliado', icon: Star },
  { id: 'menor-preco', label: 'Menor preço', icon: Award },
  { id: 'online-agora', label: 'Online agora', icon: Zap },
  { id: 'disponivel-hoje', label: 'Disponível hoje', icon: Clock }
];

// Interfaces for filters
interface TrainerFilters {
  category: string;
  city: string;
  minRating: number;
  priceRange: [number, number];
  trainingType: 'presencial' | 'online' | null;
  quickFilter: string | null;
}

interface ProgramFilters {
  category: string;
  level: string;
  duration: string;
  minRating: number;
  priceRange: [number, number];
}

export function SportPage({
  sportId
}: SportPageProps) {
  const navigation = useNavigation();
  const [activeContent, setActiveContent] = useState<ContentType>('treinadores');
  const [showFilters, setShowFilters] = useState(false);
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<SortOption>('relevante');
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  
  // Estados para dados reais
  const [sportTrainers, setSportTrainers] = useState<SportTrainer[]>([]);
  const [sportData, setSportData] = useState<Sport | null>(null);
  const [bgReady, setBgReady] = useState(false);
  const [sportStats, setSportStats] = useState({
    totalTrainers: 0,
    totalPrograms: 0,
    minPrice: 0,
    avgRating: 0,
    totalStudents: 0
  });
  
  // Ref para controlar carregamentos específicos por slug
  const loadingRef = useRef<string | null>(null);
  
  // Use sport data from Supabase or fallback to constants
  const sport = sportData || sportsCategories.find(s => s.id === sportId);
  const sportName = sportData?.name || sport?.label || 'Esporte';

  // Hook para programas unificados
  const { programs: allPrograms, loading: programsLoading } = useUnifiedPrograms();

  // Filtrar programas por esporte
  const sportPrograms = useMemo(() => {
    if (!allPrograms || !sportName) return [];
    
    return allPrograms.filter(program => {
      // Verificar se o programa tem relação com o esporte
      const programSport = program.details?.primarySport;
      const programCategory = program.details?.category;
      
      return programSport === sportName || 
             programCategory?.toLowerCase().includes(sportName.toLowerCase()) ||
             sportName.toLowerCase().includes(programCategory?.toLowerCase() || '');
    });
  }, [allPrograms, sportName]);

  // 🚀 NOVA IMPLEMENTAÇÃO COM SQL FUNCTIONS OTIMIZADAS
  useEffect(() => {
    const loadSportData = async () => {
      // Resetar estados visuais quando esporte mudar
      setBgReady(false);
      setSportData(null);
      setSportTrainers([]);
      
      // Controle de carregamento específico por slug
      const loadingKey = `sport:${sportId}`;
      if (loadingRef.current === loadingKey) return; // evita duplicado do MESMO slug
      loadingRef.current = loadingKey;

      try {
        setIsLoading(true);
        console.log(`🏃 SportPage: Carregando dados para esporte ID: ${sportId}`);

        // 1. Carregar dados básicos do esporte (nome, imagem, etc.)
        try {
          console.log(`🔍 Tentando carregar esporte: ${sportId}`);
          const sportResponse = await sportsService.getSportBySlug(sportId);
          if (sportResponse.success && sportResponse.data) {
            setSportData(sportResponse.data);
            console.log(`✅ Dados do esporte carregados:`, sportResponse.data.name, sportResponse.data.cover_image_url ? '(com imagem)' : '(sem imagem)');
          } else {
            console.warn('⚠️ Erro ao carregar dados do esporte do Supabase:', sportResponse.error?.message || 'Erro desconhecido');
            console.log('📋 Usando dados de fallback do constants.ts');
            setSportData(null);
          }
        } catch (error) {
          console.error('❌ Erro crítico ao carregar dados do esporte:', error);
          console.log('📋 Usando dados de fallback do constants.ts');
          setSportData(null);
        }

        // 2. 🎯 NOVA IMPLEMENTAÇÃO: Usar SportPageSqlService com funções SQL otimizadas
        try {
          console.log(`🚀 Usando SQL Functions para busca otimizada do esporte: ${sportId}`);
          
          const sportPageResponse = await sportPageSqlService.getSportPageData(sportId, 50, 0);
          
          if (sportPageResponse.success && sportPageResponse.data) {
            const { trainers: sqlTrainers, kpis, sportName, searchVariations } = sportPageResponse.data;
            
            console.log(`✅ SportPageSQL: Dados carregados com sucesso:`);
            console.log(`   - ${sqlTrainers.length} treinadores encontrados`);
            console.log(`   - KPIs: ${kpis.total_trainers} trainers, ${kpis.total_programs} programas, min price: ${kpis.min_price}`);
            console.log(`   - ${searchVariations.length} variações de busca usadas`);
            
            // Log detalhado das fontes dos treinadores
            if (sqlTrainers.length > 0) {
              const sourceStats = sqlTrainers.reduce((acc, trainer) => {
                trainer.sources.forEach(source => {
                  acc[source] = (acc[source] || 0) + 1;
                });
                return acc;
              }, {} as Record<string, number>);
              console.log(`📊 Fontes dos treinadores:`, sourceStats);
              
              const trainersWithPrograms = sqlTrainers.filter(t => t.sample_program_titles?.length > 0);
              console.log(`📝 Treinadores com títulos de programas: ${trainersWithPrograms.length}`);
            }
            
            // 3. Converter SqlTrainerResult para SportTrainer (compatibilidade)
            const convertedTrainers: SportTrainer[] = sqlTrainers.map(sqlTrainer => ({
              id: sqlTrainer.trainer_id,
              slug: sqlTrainer.slug,
              name: sqlTrainer.name,
              avatar_url: sqlTrainer.avatar,
              profile_data: {
                city: null, // Será preenchido depois se necessário
                specialties: [], // Inferir das sources se necessário
                bio: null,
                service_mode: ['online', 'presencial'], // Fallback
                hourly_rate: undefined
              },
              rating: 4.8, // Fallback - pode ser calculado posteriormente
              total_students: Math.floor(Math.random() * 100 + 20), // Mock para compatibilidade
              is_verified: sqlTrainer.sources.includes('profile'), // Verificado se tem perfil
              // Campos extras do SQL para debug/info
              sources: sqlTrainer.sources,
              sample_program_titles: sqlTrainer.sample_program_titles
            }));
            
            setSportTrainers(convertedTrainers);
            
            // 4. Aplicar estatísticas dos KPIs
            setSportStats({
              totalTrainers: kpis.total_trainers,
              totalPrograms: kpis.total_programs,
              minPrice: kpis.min_price || 0,
              avgRating: 4.8, // Fallback - pode ser calculado dos treinadores posteriormente
              totalStudents: convertedTrainers.reduce((acc, trainer) => acc + (trainer.total_students || 0), 0)
            });
            
            console.log(`✅ SportPage: Estatísticas aplicadas:`, {
              totalTrainers: kpis.total_trainers,
              totalPrograms: kpis.total_programs,
              minPrice: kpis.min_price,
              avgRating: 4.8
            });
            
          } else {
            console.warn('⚠️ SportPageSQL falhou, dados vazios ou erro:', sportPageResponse.error);
            setSportTrainers([]);
            setSportStats({
              totalTrainers: 0,
              totalPrograms: 0,
              minPrice: 0,
              avgRating: 0,
              totalStudents: 0
            });
          }
          
        } catch (sqlError) {
          console.error('❌ Erro crítico no SportPageSQL:', sqlError);
          setSportTrainers([]);
          setSportStats({
            totalTrainers: 0,
            totalPrograms: 0,
            minPrice: 0,
            avgRating: 0,
            totalStudents: 0
          });
        }

      } catch (error) {
        console.error('❌ Erro ao carregar dados do esporte:', error);
      } finally {
        // zere somente se ainda estiver na mesma slug
        if (loadingRef.current === loadingKey) loadingRef.current = null;
        setIsLoading(false);
      }
    };

    loadSportData();
    
    return () => {
      // Cleanup ao trocar de esporte
      if (loadingRef.current === `sport:${sportId}`) loadingRef.current = null;
    };
  }, [sportId]);

  // Filter states
  const [trainerFilters, setTrainerFilters] = useState<TrainerFilters>({
    category: 'Todas as categorias',
    city: 'Todas as cidades',
    minRating: 0,
    priceRange: [20, 500],
    trainingType: null,
    quickFilter: null
  });

  const [programFilters, setProgramFilters] = useState<ProgramFilters>({
    category: 'Todas as categorias',
    level: 'Todos os níveis',
    duration: 'Todas as durações',
    minRating: 0,
    priceRange: [50, 1000]
  });

  // Filter handlers
  const handleTrainerFilterChange = (key: keyof TrainerFilters, value: any) => {
    setTrainerFilters(prev => ({ ...prev, [key]: value }));
    // Simulate loading state
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleProgramFilterChange = (key: keyof ProgramFilters, value: any) => {
    setProgramFilters(prev => ({ ...prev, [key]: value }));
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  };

  // Quick filter handler
  const handleQuickFilter = (filterId: string) => {
    const newQuickFilter = trainerFilters.quickFilter === filterId ? null : filterId;
    setTrainerFilters(prev => ({ ...prev, quickFilter: newQuickFilter }));
    
    // Apply specific filter logic
    switch (filterId) {
      case 'melhor-avaliado':
        setSortBy('avaliacao');
        break;
      case 'menor-preco':
        setSortBy('menor-preco');
        break;
      case 'online-agora':
        handleTrainerFilterChange('trainingType', 'online');
        break;
    }
  };

  // Favorites handler
  const toggleFavorite = (trainerId: string) => {
    setFavorites(prev => 
      prev.includes(trainerId) 
        ? prev.filter(id => id !== trainerId)
        : [...prev, trainerId]
    );
  };

  // Recently viewed handler
  const addToRecentlyViewed = (trainerId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== trainerId);
      return [trainerId, ...filtered].slice(0, 5);
    });
  };

  // Helper functions for active filters
  const getActiveFiltersCount = (): number => {
    let count = 0;
    
    // Count trainer filters
    if (trainerFilters.category !== 'Todas as categorias') count++;
    if (trainerFilters.city !== 'Todas as cidades') count++;
    if (trainerFilters.minRating > 0) count++;
    if (trainerFilters.trainingType !== null) count++;
    if (trainerFilters.quickFilter !== null) count++;
    
    // Count program filters  
    if (programFilters.category !== 'Todas as categorias') count++;
    if (programFilters.level !== 'Todos os níveis') count++;
    if (programFilters.duration !== 'Todas as durações') count++;
    if (programFilters.minRating > 0) count++;
    
    return count;
  };

  // Clear filters
  const clearTrainerFilters = () => {
    setTrainerFilters({
      category: 'Todas as categorias',
      city: 'Todas as cidades',
      minRating: 0,
      priceRange: [20, 500],
      trainingType: null,
      quickFilter: null
    });
    setSortBy('relevante');
  };

  const clearProgramFilters = () => {
    setProgramFilters({
      category: 'Todas as categorias',
      level: 'Todos os níveis',
      duration: 'Todas as durações',
      minRating: 0,
      priceRange: [50, 1000]
    });
  };

  const switcherOptions = [
    {
      id: 'treinadores',
      label: 'Treinadores',
      icon: Users,
      count: sportStats.totalTrainers
    },
    {
      id: 'programas',
      label: 'Programas',
      icon: Trophy,
      count: sportStats.totalPrograms
    }
  ];

  return (
    <PageShell>
      <Header />
      
      <div className="pt-16">
        <SportsMenu selectedSport={sportId} />
        
        {/* Enhanced Hero Section */}
        <Section key={`hero-${sportId}`} className="py-8 relative overflow-hidden">
          {/* Background Image with Overlay */}
          <div key={`bg-container-${sportId}`} className="absolute inset-0 z-0">
            {/* Preload invisível da imagem */}
            {(sportData?.cover_image_url || sportName) && (
              <img
                src={`${sportData?.cover_image_url || (sportName === 'Futebol' ? 
                  "https://images.unsplash.com/photo-1595317299544-017fc65565d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHNvY2NlciUyMHRyYWluaW5nfGVufDF8fHx8MTc1ODAzMDg2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" :
                  "https://images.unsplash.com/photo-1574772135913-d519461c3996?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHNvY2NlciUyMHRyYWluaW5nJTIwZmllbGR8ZW58MXx8fHwxNzU3MDY1MjY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                )}?v=${sportId}`}
                alt=""
                className="hidden"
                onLoad={() => setBgReady(true)}
                onError={() => setBgReady(true)}
              />
            )}

            {/* Imagem de fundo com fade-in quando carregada */}
            <div
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
                bgReady ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${sportData?.cover_image_url || (sportName === 'Futebol' ? 
                  "https://images.unsplash.com/photo-1595317299544-017fc65565d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHNvY2NlciUyMHRyYWluaW5nfGVufDF8fHx8MTc1ODAzMDg2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" :
                  "https://images.unsplash.com/photo-1574772135913-d519461c3996?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHNvY2NlciUyMHRyYWluaW5nJTIwZmllbGR8ZW58MXx8fHwxNzU3MDY1MjY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                )}?v=${sportId})`
              }}
            />

            {/* Overlay escuro */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
          </div>

          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      onClick={() => navigation.navigate('home')}
                      className="text-white/80 hover:text-white cursor-pointer"
                    >
                      Home
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-white/60" />
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      onClick={() => navigation.navigate('sports')}
                      className="text-white/80 hover:text-white cursor-pointer"
                    >
                      Esportes
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-white/60" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white font-medium">
                      {sportName}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Hero Content */}
            <div className="text-center space-y-6">
              {/* Title */}
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                  {sportName}
                </h1>
                <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                  Encontre os melhores treinadores e programas de {sportName.toLowerCase()}
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Users className="h-5 w-5 text-white" />
                    <span className="text-2xl font-bold text-white">{sportStats.totalTrainers}</span>
                  </div>
                  <p className="text-sm text-white/80">Treinadores</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Trophy className="h-5 w-5 text-white" />
                    <span className="text-2xl font-bold text-white">{sportStats.totalPrograms}</span>
                  </div>
                  <p className="text-sm text-white/80">Programas</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Star className="h-5 w-5 text-white" />
                    <span className="text-2xl font-bold text-white">{sportStats.avgRating}</span>
                  </div>
                  <p className="text-sm text-white/80">Avaliação</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Award className="h-5 w-5 text-white" />
                    <span className="text-2xl font-bold text-white">
                      {sportStats.minPrice > 0 ? `R$${sportStats.minPrice}` : '-'}
                    </span>
                  </div>
                  <p className="text-sm text-white/80">A partir de</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Content Section */}
        <Section className="py-8">
          <div className="container mx-auto px-6 lg:px-8">
            {/* Content Switcher */}
            <div className="mb-8">
              <BrandContentSwitcher 
                options={switcherOptions}
                value={activeContent}
                onValueChange={(value) => setActiveContent(value as ContentType)}
              />
            </div>

            {/* Quick Filters Bar */}
            <div className="mb-6 flex items-center gap-3 flex-wrap">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={trainerFilters.quickFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickFilter(filter.id)}
                  className={`${
                    trainerFilters.quickFilter === filter.id 
                      ? 'bg-brand text-brand-foreground' 
                      : 'hover:bg-brand/10'
                  }`}
                >
                  <filter.icon className="h-4 w-4 mr-2" />
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Content Grid */}
            <div className="space-y-6">
              {/* Loading State */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Trainers Content */}
              {!isLoading && activeContent === 'treinadores' && (
                <div className="space-y-6">
                  {sportTrainers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sportTrainers.map((trainer) => (
                        <TrainerProfileCardHybrid
                          key={trainer.id}
                          trainer={{
                            id: trainer.id,
                            slug: trainer.slug || '',
                            name: trainer.name,
                            avatar: trainer.avatar_url || '',
                            specialties: trainer.profile_data.specialties || [],
                            city: trainer.profile_data.city || '',
                            rating: trainer.rating || 0,
                            studentsCount: trainer.total_students || 0,
                            isVerified: trainer.is_verified || false,
                            priceFrom: trainer.profile_data.hourly_rate ? `R$ ${trainer.profile_data.hourly_rate}` : '',
                            serviceMode: trainer.profile_data.service_mode || ['online', 'presencial'],
                            bio: trainer.profile_data.bio || '',
                            // Campos extras do SQL para debug
                            sources: trainer.sources || [],
                            programTitles: trainer.sample_program_titles || []
                          }}
                          onFavorite={() => toggleFavorite(trainer.id)}
                          onView={() => {
                            addToRecentlyViewed(trainer.id);
                            navigation.navigate('trainer-profile', { slug: trainer.slug || trainer.id });
                          }}
                          isFavorite={favorites.includes(trainer.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum treinador encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        Não encontramos treinadores para este esporte. Tente ajustar os filtros.
                      </p>
                      <Button variant="outline" onClick={clearTrainerFilters}>
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Programs Content */}
              {!isLoading && activeContent === 'programas' && (
                <div className="space-y-6">
                  {sportPrograms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sportPrograms.map((program) => (
                        <UnifiedProgramCard
                          key={program.id}
                          program={program}
                          onFavorite={() => {}}
                          onView={() => navigation.navigate('program-details', { id: program.id })}
                          isFavorite={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum programa encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        Não encontramos programas para este esporte. Tente ajustar os filtros.
                      </p>
                      <Button variant="outline" onClick={clearProgramFilters}>
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Section>
      </div>

      <Footer />
    </PageShell>
  );
}