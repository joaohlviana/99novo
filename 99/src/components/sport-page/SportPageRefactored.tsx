/**
 * 🎯 SPORTPAGE REFATORADA - ARQUITETURA LIMPA
 * ==========================================
 * Versão otimizada da SportPage com separação clara de responsabilidades
 * 
 * MELHORIAS IMPLEMENTADAS:
 * ✅ Hook customizado para data fetching (useSportPageData)
 * ✅ Componente dedicado para filtros (SportPageFilters)
 * ✅ Separação clara entre UI e lógica de negócio
 * ✅ Estados simplificados e organizados
 * ✅ Performance otimizada com memoização
 * ✅ Código mais legível e manutenível
 */

import React, { useState, useMemo } from 'react';
import { ChevronLeft, Users, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { BrandContentSwitcher } from '../ui/brand-content-switcher';
import { Section } from '../layout/Section';
import { PageShell } from '../layout/PageShell';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { SportsMenu } from '../SportsMenu';
import { TrainerProfileCardHybrid } from '../TrainerProfileCardHybrid';
import { UnifiedProgramCard } from '../unified/UnifiedProgramCard';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Skeleton } from '../ui/skeleton';
import { useSportPageData } from '../../hooks/useSportPageData';
import { SportPageFilters, type ContentType, type SortOption } from './SportPageFilters';
import { useNavigation } from '../../hooks/useNavigation';
import { sportsCategories } from '../../data/constants';

interface SportPageRefactoredProps {
  sportId: string;
}

// Mock data para filtros (pode ser movido para constants)
const cities = [
  'Todas as cidades',
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Brasília, DF',
  'Curitiba, PR',
  'Florianópolis, SC',
  'Porto Alegre, RS',
  'Salvador, BA',
  'Recife, PE',
  'Fortaleza, CE'
];

const levels = [
  'Todos os níveis',
  'Iniciante',
  'Intermediário',
  'Avançado',
  'Profissional'
];

const durations = [
  'Todas as durações',
  '1-4 semanas',
  '1-3 meses',
  '3-6 meses',
  '6+ meses'
];

export function SportPageRefactored({ sportId }: SportPageRefactoredProps) {
  const navigation = useNavigation();
  
  // Hook customizado para dados da página
  const {
    sportData,
    sportTrainers,
    sportPrograms,
    sportStats,
    isLoading,
    bgReady,
    setBgReady
  } = useSportPageData(sportId);

  // Estados de UI simplificados
  const [activeContent, setActiveContent] = useState<ContentType>('treinadores');
  const [showFilters, setShowFilters] = useState(false);
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<SortOption>('relevante');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Estados de filtros
  const [trainerFilters, setTrainerFilters] = useState({
    category: 'Todas as categorias',
    city: 'Todas as cidades',
    minRating: 0,
    priceRange: [20, 500] as [number, number],
    trainingType: null as 'presencial' | 'online' | null,
    quickFilter: null as string | null
  });

  const [programFilters, setProgramFilters] = useState({
    category: 'Todas as categorias',
    level: 'Todos os níveis',
    duration: 'Todas as durações',
    minRating: 0,
    priceRange: [50, 1000] as [number, number]
  });

  // Dados computados
  const sport = sportData || sportsCategories.find(s => s.id === sportId);
  const sportName = sportData?.name || sport?.label || 'Esporte';

  // Opções do content switcher
  const switcherOptions = useMemo(() => [
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
  ], [sportStats.totalTrainers, sportStats.totalPrograms]);

  // Handlers de filtros
  const handleTrainerFilterChange = (key: keyof typeof trainerFilters, value: any) => {
    setTrainerFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleProgramFilterChange = (key: keyof typeof programFilters, value: any) => {
    setProgramFilters(prev => ({ ...prev, [key]: value }));
  };

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

  const handlePopoverChange = (key: string, open: boolean) => {
    setOpenPopovers(prev => ({ ...prev, [key]: open }));
  };

  // Handlers de favoritos
  const toggleFavorite = (trainerId: string) => {
    setFavorites(prev => 
      prev.includes(trainerId) 
        ? prev.filter(id => id !== trainerId)
        : [...prev, trainerId]
    );
  };

  // Background image URL
  const backgroundImageUrl = useMemo(() => {
    if (sportData?.cover_image_url) return sportData.cover_image_url;
    
    // Fallback baseado no nome do esporte
    if (sportName === 'Futebol') {
      return "https://images.unsplash.com/photo-1595317299544-017fc65565d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHNvY2NlciUyMHRyYWluaW5nfGVufDF8fHx8MTc1ODAzMDg2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    
    return "https://images.unsplash.com/photo-1574772135913-d519461c3996?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHNvY2NlciUyMHRyYWluaW5nJTIwZmllbGR8ZW58MXx8fHwxNzU3MDY1MjY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
  }, [sportData?.cover_image_url, sportName]);

  return (
    <PageShell>
      <Header />
      
      <div className="pt-16">
        <SportsMenu selectedSport={sportId} />
        
        {/* Enhanced Hero Section */}
        <Section key={`hero-${sportId}`} className="py-8 relative overflow-hidden">
          {/* Background Image with Overlay */}
          <div key={`bg-container-${sportId}`} className="absolute inset-0 z-0">
            {/* Preload da imagem */}
            <img
              src={`${backgroundImageUrl}?v=${sportId}`}
              alt=""
              className="hidden"
              onLoad={() => setBgReady(true)}
              onError={() => setBgReady(true)}
            />

            {/* Background aplicado */}
            <div
              key={`bg-${sportId}`}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${
                bgReady ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${backgroundImageUrl}?v=${sportId})`
              }}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          </div>

          {/* Content */}
          <div className="container relative z-10">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => navigation.goHome()}
                    className="text-white/80 hover:text-white cursor-pointer"
                  >
                    Início
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => navigation.goTo('/catalog')}
                    className="text-white/80 hover:text-white cursor-pointer"
                  >
                    Esportes
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">
                    {sportName}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Hero Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-white"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                  {sportName}
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-6">
                  Encontre os melhores treinadores e programas de {sportName.toLowerCase()} 
                  para alcançar seus objetivos.
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{sportStats.totalTrainers}</div>
                    <div className="text-sm text-white/80">Treinadores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{sportStats.totalPrograms}</div>
                    <div className="text-sm text-white/80">Programas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{sportStats.avgRating.toFixed(1)}</div>
                    <div className="text-sm text-white/80">Avaliação média</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {sportStats.minPrice > 0 ? `R$ ${sportStats.minPrice}` : '-'}
                    </div>
                    <div className="text-sm text-white/80">A partir de</div>
                  </div>
                </div>
              </motion.div>

              {/* Right side content can be added here */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden lg:block"
              >
                {/* Placeholder for additional content */}
              </motion.div>
            </div>
          </div>
        </Section>

        {/* Content Section */}
        <Section className="py-8">
          <div className="container">
            {/* Content Switcher */}
            <div className="mb-6">
              <BrandContentSwitcher
                options={switcherOptions}
                value={activeContent}
                onChange={(value) => setActiveContent(value as ContentType)}
              />
            </div>

            {/* Filters */}
            <SportPageFilters
              activeContent={activeContent}
              trainerFilters={trainerFilters}
              programFilters={programFilters}
              sortBy={sortBy}
              showFilters={showFilters}
              openPopovers={openPopovers}
              onContentChange={setActiveContent}
              onTrainerFilterChange={handleTrainerFilterChange}
              onProgramFilterChange={handleProgramFilterChange}
              onSortChange={setSortBy}
              onQuickFilter={handleQuickFilter}
              onShowFiltersChange={setShowFilters}
              onPopoverChange={handlePopoverChange}
              cities={cities}
              levels={levels}
              durations={durations}
            />

            {/* Results */}
            <div className="mt-8">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-96 rounded-lg" />
                  ))}
                </div>
              ) : (
                <>
                  {activeContent === 'treinadores' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sportTrainers.map((trainer) => (
                        <TrainerProfileCardHybrid
                          key={trainer.id}
                          trainerId={trainer.id}
                          isFavorited={favorites.includes(trainer.id)}
                          onFavoriteToggle={() => toggleFavorite(trainer.id)}
                        />
                      ))}
                    </div>
                  )}

                  {activeContent === 'programas' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sportPrograms.map((program) => (
                        <UnifiedProgramCard
                          key={program.id}
                          program={program}
                        />
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {((activeContent === 'treinadores' && sportTrainers.length === 0) ||
                    (activeContent === 'programas' && sportPrograms.length === 0)) && (
                    <div className="text-center py-12">
                      <div className="text-gray-500 mb-4">
                        {activeContent === 'treinadores' 
                          ? 'Nenhum treinador encontrado para este esporte.'
                          : 'Nenhum programa encontrado para este esporte.'
                        }
                      </div>
                      <p className="text-sm text-gray-400">
                        Tente ajustar os filtros ou explore outros esportes.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </Section>
      </div>

      <Footer />
    </PageShell>
  );
}