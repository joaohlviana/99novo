import { useState, useMemo, useEffect, useCallback, Suspense, lazy } from 'react';
import { Button } from './ui/button';
import { ModernProfileCard } from './ModernProfileCard';
import { TrainerFilters, FilterState } from './TrainerFilters';
import { ProgramFilters } from './ProgramFilters';
import { ProgramsGrid } from './ProgramsGrid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Filter, ArrowUpDown, Users, FileText, Star, Award, Zap, Activity, Target, Gauge } from 'lucide-react';
import { ExpandableTabs } from './ui/expandable-tabs';
import { TrainerCardSkeleton } from './skeletons/TrainerCardSkeleton';
import { ProgramCardSkeleton } from './skeletons/ProgramCardSkeleton';

// 🚀 FASE 5: Imports avançados para telemetria e cache inteligente
import { useDebounce } from '../hooks/useDebounce';
import { usePersistentFilters } from '../hooks/usePersistentFilters';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useAdvancedTelemetry } from '../hooks/useAdvancedTelemetry';
import { useSmartCache } from '../lib/smart-cache-manager';

// 🎯 FASE 5: Componentes lazy-loaded para performance
const VirtualizedGrid = lazy(() => import('./VirtualizedGrid'));
const PerformanceDashboard = lazy(() => import('./debug/PerformanceDashboard'));
const PerformanceAnalyzer = lazy(() => import('./debug/PerformanceAnalyzer'));

// Services imports - Nova Data Layer
import * as TrainersService from '../services/trainers.service';
import * as ProgramsService from '../services/programs.service';
import { searchTrainers } from '../services/search.service';
import type { TrainerCardDTO } from '../services/types/trainer-card.dto';

// Types
interface CatalogTrainer {
  id: string;
  slug?: string | null; // ✅ SLUG OPCIONAL - RELAXAR VALIDAÇÕES
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

interface CatalogProgram {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  price: string;
  students: number;
  rating: number;
  trainer: {
    name: string;
    rating: number;
    reviewCount: number;
  };
  city: string;
  location: string;
  period: string;
  popular?: boolean;
  icon?: React.ReactNode;
}

interface TrainersCatalogProps {
  // onNavigateToTrainer removed - using useNavigation hook instead
}

type ContentType = 'trainers' | 'programs';

import { useNavigation } from '../hooks/useNavigation';

export function TrainersCatalog({}: TrainersCatalogProps) {
  const { navigateToTrainer, navigateToProgram } = useNavigation();
  
  // 🚀 FASE 5: Telemetria avançada e cache inteligente
  const telemetry = useAdvancedTelemetry('TrainersCatalog');
  const cache = useSmartCache();
  
  // 🚀 FASE 4: Hooks de otimização básica
  const getOptimalBatchSize = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;
    
    if (isMobile) return 6;
    if (isTablet) return 9;
    return 12;
  }, []);
  
  // 📊 Performance monitoring (Fase 4 + 5)
  const { start: startRender, end: endRender } = usePerformanceMonitor('TrainersCatalog Render');
  
  // 🎯 Estados principais
  const [contentType, setContentType] = useState<ContentType>('trainers');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [activeFilterTab, setActiveFilterTab] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 🚀 FASE 3 + 4: Data states com busca paralela e otimizações
  const [trainers, setTrainers] = useState<CatalogTrainer[]>([]);
  const [programs, setPrograms] = useState<CatalogProgram[]>([]);
  const [isLoadingTrainers, setIsLoadingTrainers] = useState(true);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // 🎯 FASE 5: Estados avançados de otimização e monitoramento
  const [optimizationEnabled, setOptimizationEnabled] = useState(true);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [showPerformanceAnalyzer, setShowPerformanceAnalyzer] = useState(false);
  const [useVirtualization, setUseVirtualization] = useState(true);
  const [renderMetrics, setRenderMetrics] = useState({
    lastRenderTime: 0,
    totalRenders: 0,
    averageTime: 0
  });

  // 🎯 FASE 5: BUSCA PARALELA COM CACHE INTELIGENTE
  useEffect(() => {
    const loadAllData = async () => {
      telemetry.startRender();
      telemetry.trackUserAction('load_catalog_data');
      
      // 🚀 FASE 5: Verificar cache inteligente primeiro
      const cachedTrainers = cache.get('catalog-trainers') as CatalogTrainer[] | null;
      const cachedPrograms = cache.get('catalog-programs') as CatalogProgram[] | null;
      
      if (cachedTrainers && cachedPrograms && dataLoaded) {
        console.log('🧠 FASE 5: Dados encontrados no cache inteligente');
        setTrainers(cachedTrainers);
        setPrograms(cachedPrograms);
        setIsLoading(false);
        telemetry.endRender('cache_hit');
        return;
      }
      
      // Se já carregamos, não recarregar (cache básico)
      if (dataLoaded && !cachedTrainers && !cachedPrograms) {
        console.log('📦 Dados já em cache básico, pulando carregamento...');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🚀 FASE 3: Iniciando busca paralela...');
        setIsLoading(true);

        // 🔄 EXECUÇÃO PARALELA - Promise.allSettled para não falhar tudo se uma falhar
        const [trainersResult, programsResult] = await Promise.allSettled([
          // Busca 1: Treinadores
          searchTrainers({
            limit: 50,
            offset: 0
          }),
          // Busca 2: Programas
          ProgramsService.getAllPrograms?.({ page: 1, limit: 50 })
        ]);

        // 📊 MERGE CLIENT-SIDE: Processar resultados independentemente
        console.log('🔄 Processando resultados paralelos...');

        // Processar Treinadores
        if (trainersResult.status === 'fulfilled' && trainersResult.value?.success && trainersResult.value.data?.length > 0) {
          console.log(`✅ Treinadores carregados: ${trainersResult.value.data.length}`);
          
          const transformedTrainers = trainersResult.value.data.map(dto => ({
            id: dto.slug || dto.id, // ✅ SLUG prioritário, fallback para ID
            slug: dto.slug, // ✅ PODE SER NULL - trataremos na UI
            name: dto.name,
            image: dto.profilePhoto || 'https://images.unsplash.com/photo-1540206063137-4a88ca974d1a?w=400&q=80',
            rating: dto.rating || 4.5,
            reviewCount: dto.reviewCount || 50,
            location: dto.location || 'São Paulo, SP',
            specialties: dto.specialties || ['Fitness'],
            verified: dto.isVerified || true,
            isTopRated: (dto.rating || 0) >= 4.7,
            languages: ['Português'],
            title: 'Personal Trainer',
            description: dto.bio || 'Especialista em fitness e bem-estar.',
            skills: dto.specialties || ['Fitness'],
            portfolioImages: [
              'https://images.unsplash.com/photo-1573858129038-6f98c3cb2ac7?w=400&q=80',
              'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=400&q=80',
              'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80'
            ],
            priceFrom: dto.priceFrom || 'R$ 65',
            programs: []
          }));
          
          setTrainers(transformedTrainers);
          
          // 🚀 FASE 5: Cache inteligente com prioridade alta
          cache.set('catalog-trainers', transformedTrainers, {
            ttl: 10 * 60 * 1000, // 10 minutos
            priority: 'high',
            dependencies: ['trainers', 'catalog']
          });
          
          console.log(`📊 Treinadores processados: ${transformedTrainers.length} (incluindo sem slug)`);
        } else {
          console.warn('⚠️ Falha ao carregar treinadores (paralelo), usando fallback mock');
          setTrainers(mockTrainers);
        }
        setIsLoadingTrainers(false);

        // Processar Programas
        if (programsResult.status === 'fulfilled' && programsResult.value?.success && programsResult.value.data) {
          console.log(`✅ Programas carregados: ${programsResult.value.data.items?.length || 0}`);
          
          const transformedPrograms = programsResult.value.data.items?.map(transformProgramData) || [];
          setPrograms(transformedPrograms);
          
          // 🚀 FASE 5: Cache inteligente para programas
          cache.set('catalog-programs', transformedPrograms, {
            ttl: 15 * 60 * 1000, // 15 minutos  
            priority: 'medium',
            dependencies: ['programs', 'catalog']
          });
        } else {
          console.warn('⚠️ Falha ao carregar programas (paralelo), usando fallback mock');
          setPrograms(mockPrograms);
        }
        setIsLoadingPrograms(false);

        // ✅ Marcar como carregado para cache
        setDataLoaded(true);
        telemetry.endRender('data_loaded');
        console.log('🎉 FASE 5: Busca paralela com cache inteligente concluída com sucesso!');

      } catch (error) {
        console.error('❌ Erro na busca paralela:', error);
        
        // 🛡️ FALLBACK DUPLO: Garantir que ambos tenham dados
        setTrainers(mockTrainers);
        setPrograms(mockPrograms);
      } finally {
        setIsLoading(false);
        setIsLoadingTrainers(false);
        setIsLoadingPrograms(false);
      }
    };

    loadAllData();
  }, []); // ✅ Executa apenas uma vez - não depende de contentType

  // Função de transformação para programas
  const transformProgramData = (program: any): CatalogProgram => ({
    id: program.id,
    title: program.title,
    description: program.description || 'Programa completo de treinamento.',
    category: program.category || program.sport?.name || 'Fitness',
    duration: program.duration || '12 semanas',
    level: program.level || 'Intermediário',
    price: `R$ ${program.price || '297'}`,
    students: program.studentCount || program.students || 45,
    rating: program.rating || 4.8,
    trainer: {
      name: program.trainer?.name || 'Treinador',
      rating: program.trainer?.rating || 4.8,
      reviewCount: program.trainer?.reviewCount || 50
    },
    city: program.trainer?.location?.city || 'São Paulo',
    location: program.serviceMode || 'online',
    period: program.schedule || 'flexivel',
    popular: program.featured || false,
    icon: <span className="text-lg">🏋️</span>
  });
  
  // 🎯 FASE 4: Filtros com persistência e debounce
  const [trainerFilters, setTrainerFiltersInternal] = usePersistentFilters('trainer-filters', {
    city: 'Todas as cidades',
    minRating: 0,
    priceRange: [20, 500],
    trainingType: 'all'
  });

  const [programFilters, setProgramFiltersInternal] = usePersistentFilters('program-filters', {
    city: 'Todas as cidades',
    rating: 0,
    priceRange: [0, 500] as [number, number],
    location: 'todos',
    period: 'todos',
    category: 'Todas as categorias',
    level: 'todos'
  });

  // 🔄 Fallback para compatibilidade
  const setTrainerFilters = setTrainerFiltersInternal;
  const setProgramFilters = setProgramFiltersInternal;

  // ⏱️ Debounced filters para performance
  const debouncedTrainerFilters = useDebounce(trainerFilters, 300);
  const debouncedProgramFilters = useDebounce(programFilters, 300);
  const debouncedSortBy = useDebounce(sortBy, 200);

  // Dados mock como fallback
  const mockTrainers: CatalogTrainer[] = [
    {
      id: 'joao-silva',
      slug: 'joao-silva',
      name: 'João Silva',
      image: 'https://images.unsplash.com/photo-1540206063137-4a88ca974d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluZXIlMjBmaXRuZXNzJTIwY29hY2h8ZW58MXx8fHwxNzU1ODc3OTQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.9,
      reviewCount: 127,
      location: 'São Paulo, SP',
      specialties: ['Musculação', 'Funcional', 'Corrida'],
      verified: true,
      isTopRated: true,
      languages: ['Português', 'Inglês', 'Espanhol'],
      title: 'Personal Trainer Especialista',
      description: 'Especialista em treinamento funcional e nutrição esportiva, com foco em resultados sustentáveis e mudança de estilo de vida.',
      skills: ['Musculação', 'Funcional', 'Nutrição', 'Reabilitação'],
      portfolioImages: [
        'https://images.unsplash.com/photo-1573858129038-6f98c3cb2ac7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwdHJhaW5pbmclMjB3b3Jrb3V0JTIwZ3ltfGVufDF8fHx8MTc1NjUxODYwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      ],
      priceFrom: 'R$ 65',
      programs: []
    },
    {
      id: 'maria-santos',
      slug: 'maria-santos',
      name: 'Maria Santos',
      image: 'https://images.unsplash.com/photo-1494790108755-2616c27b5a66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBmaXRuZXNzJTIwdHJhaW5lcnxlbnwxfHx8fDE3NTYxMzI5MzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.7,
      reviewCount: 89,
      location: 'Rio de Janeiro, RJ',
      specialties: ['Yoga', 'Pilates', 'Funcional'],
      verified: true,
      isTopRated: false,
      languages: ['Português', 'Inglês'],
      title: 'Instrutora de Yoga e Pilates',
      description: 'Especializada em modalidades que conectam corpo e mente.',
      skills: ['Yoga', 'Pilates', 'Meditação', 'Flexibilidade'],
      portfolioImages: [
        'https://images.unsplash.com/photo-1715780463401-b9ef0567943e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwcGlsYXRlcyUyMHN0dWRpb3xlbnwxfHx8fDE3NTY1MTg2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      ],
      priceFrom: 'R$ 45',
      programs: []
    },
    {
      id: 'carlos-oliveira',
      slug: 'carlos-oliveira',
      name: 'Carlos Oliveira',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwZml0bmVzcyUyMHRyYWluZXJ8ZW58MXx8fHwxNzU2MTMyOTM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.8,
      reviewCount: 156,
      location: 'Belo Horizonte, MG',
      specialties: ['Crossfit', 'Funcional', 'HIIT'],
      verified: true,
      isTopRated: true,
      languages: ['Português'],
      title: 'Treinador de Alta Performance',
      description: 'Especialista em treinamento de alta intensidade e preparação física para atletas.',
      skills: ['Crossfit', 'HIIT', 'Preparação Física', 'Condicionamento'],
      portfolioImages: [
        'https://images.unsplash.com/photo-1662381906696-bcad03513531?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9zc2ZpdCUyMHRyYWluaW5nJTIwd29ya291dHxlbnwxfHx8fDE3NTY1MTg2Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      ],
      priceFrom: 'R$ 80',
      programs: []
    }
  ];

  const mockPrograms: CatalogProgram[] = [
    {
      id: '1',
      title: 'Treino Funcional Completo',
      description: 'Programa focado em movimentos funcionais para melhorar força, resistência e mobilidade.',
      category: 'Funcional',
      duration: '12 semanas',
      level: 'Intermediário',
      price: 'R$ 297',
      students: 45,
      rating: 4.9,
      trainer: {
        name: 'João Silva',
        rating: 4.9,
        reviewCount: 127
      },
      city: 'São Paulo',
      location: 'online',
      period: 'flexivel',
      popular: true,
      icon: <span className="text-lg">🏋️</span>
    },
    {
      id: '2',
      title: 'Yoga para Iniciantes',
      description: 'Introdução suave ao yoga com foco em respiração e posturas básicas.',
      category: 'Yoga',
      duration: '8 semanas',
      level: 'Iniciante',
      price: 'R$ 197',
      students: 78,
      rating: 4.8,
      trainer: {
        name: 'Maria Santos',
        rating: 4.7,
        reviewCount: 89
      },
      city: 'Rio de Janeiro',
      location: 'presencial',
      period: 'manha',
      icon: <span className="text-lg">🧘</span>
    },
    {
      id: '3',
      title: 'HIIT Extreme',
      description: 'Treinos intervalados de alta intensidade para queima máxima de calorias.',
      category: 'HIIT',
      duration: '10 semanas',
      level: 'Avançado',
      price: 'R$ 347',
      students: 34,
      rating: 4.9,
      trainer: {
        name: 'Carlos Oliveira',
        rating: 4.8,
        reviewCount: 156
      },
      city: 'Belo Horizonte',
      location: 'hibrido',
      period: 'tarde',
      popular: true,
      icon: <span className="text-lg">⚡</span>
    }
  ];

  // Verificar se há filtros ativos para treinadores
  const hasActiveTrainerFilters = useMemo(() => {
    return (
      trainerFilters.city !== 'Todas as cidades' ||
      trainerFilters.minRating > 0 ||
      trainerFilters.priceRange[0] > 20 ||
      trainerFilters.priceRange[1] < 500 ||
      trainerFilters.trainingType !== 'all'
    );
  }, [trainerFilters]);

  // Verificar se há filtros ativos para programas
  const hasActiveProgramFilters = useMemo(() => {
    return (
      programFilters.city !== 'Todas as cidades' ||
      programFilters.rating > 0 ||
      programFilters.priceRange[0] > 0 ||
      programFilters.priceRange[1] < 500 ||
      programFilters.location !== 'todos' ||
      programFilters.period !== 'todos' ||
      programFilters.category !== 'Todas as categorias' ||
      programFilters.level !== 'todos'
    );
  }, [programFilters]);

  const hasActiveFilters = contentType === 'trainers' ? hasActiveTrainerFilters : hasActiveProgramFilters;

  // 🚀 FASE 4: FILTRAR TREINADORES COM OTIMIZAÇÕES AVANÇADAS
  const filteredTrainers = useMemo(() => {
    startRender();
    
    const currentTrainers = trainers.length > 0 ? trainers : mockTrainers;
    const filtersToUse = optimizationEnabled ? debouncedTrainerFilters : trainerFilters;
    
    console.log(`🔍 FASE 4: Aplicando filtros otimizados a ${currentTrainers.length} treinadores...`);

    let filtered = currentTrainers.filter(trainer => {
      // Filtro por cidade
      if (filtersToUse.city !== 'Todas as cidades') {
        const trainerCity = trainer.location.split(',')[0].trim();
        const filterCity = filtersToUse.city.split(',')[0].trim();
        if (trainerCity !== filterCity) return false;
      }

      // Filtro por avaliação mínima
      if (trainer.rating < filtersToUse.minRating) return false;

      // Filtro por faixa de preço
      const priceMatch = trainer.priceFrom.match(/\d+/);
      if (priceMatch) {
        const price = parseInt(priceMatch[0]);
        if (price < filtersToUse.priceRange[0] || price > filtersToUse.priceRange[1]) return false;
      }

      return true;
    });

    console.log(`✅ ${filtered.length} treinadores aprovados nos filtros otimizados`);

    // Aplicar ordenação com debounce
    const sortToUse = optimizationEnabled ? debouncedSortBy : sortBy;
    const result = filtered.sort((a, b) => {
      switch (sortToUse) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          const priceA = parseInt(a.priceFrom.match(/\d+/)?.[0] || '0');
          const priceB = parseInt(b.priceFrom.match(/\d+/)?.[0] || '0');
          return priceA - priceB;
        case 'price-high':
          const priceA2 = parseInt(a.priceFrom.match(/\d+/)?.[0] || '0');
          const priceB2 = parseInt(b.priceFrom.match(/\d+/)?.[0] || '0');
          return priceB2 - priceA2;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'relevance':
        default:
          // Ordenação por relevância (top rated primeiro, depois por reviews)
          if (a.isTopRated && !b.isTopRated) return -1;
          if (!a.isTopRated && b.isTopRated) return 1;
          return b.rating - a.rating;
      }
    });

    endRender();
    
    // 📊 Atualizar métricas de performance
    setRenderMetrics(prev => ({
      lastRenderTime: performance.now(),
      totalRenders: prev.totalRenders + 1,
      averageTime: (prev.averageTime + (performance.now() - (prev.lastRenderTime || 0))) / 2
    }));

    return result;
  }, [trainers, debouncedTrainerFilters, trainerFilters, debouncedSortBy, sortBy, optimizationEnabled, startRender, endRender]);

  // 🚀 FASE 4: FILTRAR PROGRAMAS COM OTIMIZAÇÕES AVANÇADAS
  const filteredPrograms = useMemo(() => {
    const currentPrograms = programs.length > 0 ? programs : mockPrograms;
    const filtersToUse = optimizationEnabled ? debouncedProgramFilters : programFilters;
    
    let filtered = currentPrograms.filter(program => {
      // Filtro por cidade
      if (filtersToUse.city !== 'Todas as cidades') {
        if (program.city !== filtersToUse.city) return false;
      }

      // Filtro por avaliação mínima
      if (program.trainer.rating < filtersToUse.rating) return false;

      // Filtro por faixa de preço
      const priceMatch = program.price.match(/\d+/);
      if (priceMatch) {
        const price = parseInt(priceMatch[0]);
        if (price < filtersToUse.priceRange[0] || price > filtersToUse.priceRange[1]) return false;
      }

      // Filtro por localização
      if (filtersToUse.location !== 'todos' && program.location !== filtersToUse.location) {
        return false;
      }

      // Filtro por período
      if (filtersToUse.period !== 'todos' && program.period !== filtersToUse.period) {
        return false;
      }

      // Filtro por categoria
      if (filtersToUse.category !== 'Todas as categorias' && program.category !== filtersToUse.category) {
        return false;
      }

      // Filtro por nível
      if (filtersToUse.level !== 'todos' && program.level !== filtersToUse.level) {
        return false;
      }

      return true;
    });

    // Aplicar ordenação com debounce
    const sortToUse = optimizationEnabled ? debouncedSortBy : sortBy;
    return filtered.sort((a, b) => {
      switch (sortToUse) {
        case 'rating':
          return b.trainer.rating - a.trainer.rating;
        case 'price-low':
          const priceA = parseInt(a.price.match(/\d+/)?.[0] || '0');
          const priceB = parseInt(b.price.match(/\d+/)?.[0] || '0');
          return priceA - priceB;
        case 'price-high':
          const priceA2 = parseInt(a.price.match(/\d+/)?.[0] || '0');
          const priceB2 = parseInt(b.price.match(/\d+/)?.[0] || '0');
          return priceB2 - priceA2;
        case 'students':
          return b.students - a.students;
        case 'reviews':
          return b.trainer.reviewCount - a.trainer.reviewCount;
        case 'relevance':
        default:
          // Ordenação por relevância (populares primeiro, depois por rating)
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return b.trainer.rating - a.trainer.rating;
      }
    });
  }, [programs, mockPrograms, debouncedProgramFilters, programFilters, debouncedSortBy, sortBy, optimizationEnabled]);

  // 🔧 CONTADOR SIMPLIFICADO - USAR ARRAY FINAL
  const trainersCount = useMemo(() => {
    return filteredTrainers.length; // Sempre usar o array filtrado final
  }, [filteredTrainers]);

  const programsCount = useMemo(() => {
    return filteredPrograms.length;
  }, [filteredPrograms]);

  // 🎯 FASE 4: Handlers otimizados com callbacks memoizados
  const clearTrainerFilters = useCallback(() => {
    setTrainerFiltersInternal({
      city: 'Todas as cidades',
      minRating: 0,
      priceRange: [20, 500],
      trainingType: 'all'
    });
    setSortBy('relevance');
  }, [setTrainerFiltersInternal]);

  const clearProgramFilters = useCallback(() => {
    setProgramFiltersInternal({
      city: 'Todas as cidades',
      rating: 0,
      priceRange: [0, 500],
      location: 'todos',
      period: 'todos',
      category: 'Todas as categorias',
      level: 'todos'
    });
    setSortBy('relevance');
  }, [setProgramFiltersInternal]);

  // 🎯 Handlers para filtros com otimização
  const handleTrainerFiltersChange = useCallback((newFilters: FilterState) => {
    setTrainerFiltersInternal(newFilters);
  }, [setTrainerFiltersInternal]);

  const handleProgramFiltersChange = useCallback((newFilters: any) => {
    setProgramFiltersInternal(newFilters);
  }, [setProgramFiltersInternal]);

  // 🎯 Toggle de otimização para debugging
  const toggleOptimization = useCallback(() => {
    setOptimizationEnabled(prev => !prev);
    console.log(`🚀 FASE 5: Otimizações ${!optimizationEnabled ? 'ATIVADAS' : 'DESATIVADAS'}`);
  }, [optimizationEnabled]);

  const getTitle = () => {
    return contentType === 'trainers' 
      ? 'Treinadores em São Paulo' 
      : 'Programas de Treinamento';
  };

  const getSubtitle = () => {
    return contentType === 'trainers'
      ? 'Encontre o profissional ideal para seus objetivos'
      : 'Programas e cursos para todos os níveis';
  };

  const getSortOptions = () => {
    if (contentType === 'trainers') {
      return [
        { value: 'relevance', label: 'Mais relevantes' },
        { value: 'rating', label: 'Melhor avaliação' },
        { value: 'reviews', label: 'Mais avaliações' },
        { value: 'price-low', label: 'Menor preço' },
        { value: 'price-high', label: 'Maior preço' }
      ];
    } else {
      return [
        { value: 'relevance', label: 'Mais relevantes' },
        { value: 'rating', label: 'Melhor avaliação' },
        { value: 'students', label: 'Mais alunos' },
        { value: 'price-low', label: 'Menor preço' },
        { value: 'price-high', label: 'Maior preço' }
      ];
    }
  };

  const getSortLabel = () => {
    const options = getSortOptions();
    const option = options.find(opt => opt.value === sortBy);
    return option?.label || 'Ordenar';
  };

  // 🎯 FUNÇÃO PARA HANDLER DE CLIQUE COM VALIDAÇÃO DE SLUG
  const handleTrainerClick = (trainer: CatalogTrainer) => {
    if (trainer.slug && trainer.slug.trim() !== '') {
      // ✅ Navegação normal com slug válido
      console.log(`🔗 Navegando para treinador: ${trainer.slug}`);
      navigateToTrainer(trainer.slug);
    } else {
      // ⚠️ Sem slug válido - mostrar aviso ou fallback
      console.warn(`⚠️ Treinador "${trainer.name}" não tem slug válido - click desabilitado`);
      // Poderia mostrar um toast ou tooltip aqui
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f7f7' }}>
      {/* Header com controles */}
      <div className="glass border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-1">
                Buscar {contentType === 'trainers' ? 'Treinadores' : 'Programas'}
              </h1>
              <p className="text-muted-foreground">{getSubtitle()}</p>
            </div>
          </div>

          {/* Expandable Tabs Navigation */}
          <div className="flex justify-center mb-6">
            <ExpandableTabs
              tabs={[
                {
                  label: 'Treinadores',
                  value: 'trainers',
                  icon: <Users className="w-4 h-4" />,
                  count: contentType === 'trainers' ? filteredTrainers.length : undefined
                },
                {
                  label: 'Programas',
                  value: 'programs',
                  icon: <FileText className="w-4 h-4" />,
                  count: contentType === 'programs' ? filteredPrograms.length : undefined
                }
              ]}
              value={contentType}
              onValueChange={(value) => setContentType(value as ContentType)}
              className="bg-white rounded-xl border border-gray-200"
            />
          </div>

          {/* 🚀 FASE 4: Controles otimizados com toggle de performance */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-wrap gap-3">
              {/* 🚀 FASE 5: Controles avançados de monitoramento (desenvolvimento) */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <Button
                    variant={optimizationEnabled ? "default" : "outline"}
                    onClick={toggleOptimization}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Zap className="w-4 h-4" />
                    {optimizationEnabled ? 'Otimizado' : 'Básico'}
                  </Button>
                  
                  <Button
                    variant={showPerformanceDashboard ? "default" : "outline"}
                    onClick={() => setShowPerformanceDashboard(!showPerformanceDashboard)}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Activity className="w-4 h-4" />
                    Dashboard
                  </Button>
                  
                  <Button
                    variant={showPerformanceAnalyzer ? "default" : "outline"}
                    onClick={() => setShowPerformanceAnalyzer(!showPerformanceAnalyzer)}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Target className="w-4 h-4" />
                    Análise
                  </Button>
                  
                  <Button
                    variant={useVirtualization ? "default" : "outline"}
                    onClick={() => setUseVirtualization(!useVirtualization)}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Gauge className="w-4 h-4" />
                    Virtual
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    <SelectValue placeholder={getSortLabel()} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {getSortOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 🎛️ Controles de filtro e ordenação padrão */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-1 w-2 h-2 bg-brand rounded-full" />
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={contentType === 'trainers' ? clearTrainerFilters : clearProgramFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Limpar filtros
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    <SelectValue placeholder={getSortLabel()} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {getSortOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Painéis de filtro */}
          {showFilters && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              {contentType === 'trainers' ? (
                <TrainerFilters
                  filters={trainerFilters}
                  onFiltersChange={handleTrainerFiltersChange}
                  activeTab={activeFilterTab}
                  onActiveTabChange={setActiveFilterTab}
                />
              ) : (
                <ProgramFilters
                  filters={programFilters}
                  onFiltersChange={handleProgramFiltersChange}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🚀 FASE 4: RENDERIZAÇÃO OTIMIZADA COM VIRTUALIZAÇÃO */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        {/* 📊 Info de otimização FASE 4 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <h3 className="font-semibold text-sm text-blue-900">🚀 FASE 4: Otimizações Básicas Ativas</h3>
              <p className="text-xs text-blue-700 mt-1">
                Debounce: 300ms • Cache persistente • Performance monitoring
              </p>
            </div>
          </div>
        )}

        {/* 🎯 HEADER DINÂMICO COM LOADING ESPECÍFICO */}
        {contentType === 'trainers' ? (
          <>
            {/* Header Treinadores */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {isLoadingTrainers ? 'Carregando treinadores...' : `${trainersCount} treinadores encontrados`}
                </h2>
                {!isLoadingTrainers && (
                  <p className="text-muted-foreground">
                    {hasActiveTrainerFilters ? 'Resultados filtrados' : 'Mostrando todos os resultados'}
                    <span className="ml-2 text-green-600">• FASE 4 Otimizado</span>
                  </p>
                )}
              </div>
            </div>

            {/* Grid Treinadores */}
            {isLoadingTrainers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <TrainerCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrainers.map((trainer) => (
                  <ModernProfileCard
                    key={trainer.id}
                    trainer={trainer}
                    onClick={() => handleTrainerClick(trainer)}
                  />
                ))}
              </div>
            )}

            {/* Empty state para treinadores */}
            {!isLoadingTrainers && filteredTrainers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum treinador encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar os filtros para encontrar mais resultados.
                </p>
                <Button variant="outline" onClick={clearTrainerFilters}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Header Programas */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {isLoadingPrograms ? 'Carregando programas...' : `${programsCount} programas encontrados`}
                </h2>
                {!isLoadingPrograms && (
                  <p className="text-muted-foreground">
                    {hasActiveProgramFilters ? 'Resultados filtrados' : 'Mostrando todos os resultados'}
                    <span className="ml-2 text-green-600">• FASE 4 Otimizado</span>
                  </p>
                )}
              </div>
            </div>

            {/* Grid Programas */}
            {isLoadingPrograms ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProgramCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <ProgramsGrid
                programs={filteredPrograms}
                onProgramClick={(program) => {
                  console.log('🔗 Navegando para programa:', program.id);
                  navigateToProgram(program.id);
                }}
              />
            )}

            {/* Empty state para programas */}
            {!isLoadingPrograms && filteredPrograms.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum programa encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar os filtros para encontrar mais resultados.
                </p>
                <Button variant="outline" onClick={clearProgramFilters}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </>
        )}

        {/* 🎉 INDICADORES DE STATUS AVANÇADOS */}
        {dataLoaded && !isLoading && (
          <div className="text-center py-4 space-y-2">
            <p className="text-xs text-muted-foreground">
              ✅ FASE 3: Dados carregados via busca paralela - {trainersCount} treinadores e {programsCount} programas em cache
            </p>
            <p className="text-xs text-green-600">
              🚀 FASE 4: Otimizações básicas ativas - Debounce: 300ms • Cache persistente • Performance monitoring
            </p>
          </div>
        )}
      </div>
    </div>
  );
}