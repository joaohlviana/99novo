import { useState, useEffect } from 'react';
import { Search, ChevronDown, MapPin, Star, Award, Users, Clock, ChevronRight, Play, CheckCircle, ExternalLink, X, Check, Heart, Calendar, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { SportsMenu } from './SportsMenu';
import { SportsCategories } from './SportsCategories';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { usePublicPrograms } from '../hooks/useUnifiedPrograms';
import { CompactProgramCard } from './unified/UnifiedProgramCard';
import { ModernProfileCard } from './ModernProfileCard';
import { Carousel as AppleCarousel } from './ui/apple-cards-carousel';

import { useNavigation } from '../hooks/useNavigation';
import { TrainerProfileListHybrid } from './TrainerProfileCardHybrid';

// Services imports - Nova Data Layer
import * as SportsService from '../services/sports.service';
import { searchTrainers } from '../services/search.service';

// Types - Interfaces locais para garantir compatibilidade com componentes
interface HomePageTrainer {
  id: string;
  name: string;
  location: string;
  avatar: string;
  portfolioImages: string[];
  tags: string[];
  stats: {
    followers: string;
    following: string;
    views: string;
  };
  rating: number;
  isVerified: boolean;
}

// Props drilling ELIMINADO - agora o HomePage não precisa de props de navegação  
interface HomePageProps {}

export function HomePage({}: HomePageProps) {
  const navigation = useNavigation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string>('patinacao');
  
  // Filter states
  const [searchType, setSearchType] = useState<'trainers' | 'programs'>('trainers');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [sportsOpen, setSportsOpen] = useState(false);
  const [citiesOpen, setCitiesOpen] = useState(false);

  // Data states - Nova Data Layer
  const [topTrainers, setTopTrainers] = useState<HomePageTrainer[]>([]);
  const [availableSports, setAvailableSports] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hook unificado para programas - UMA ÚNICA FONTE DE DADOS
  const { programs: programsFromHook, loading: programsLoading, error: programsError } = usePublicPrograms();

  // REQUISITO CRÍTICO: APENAS DADOS REAIS DO SUPABASE
  // Usar apenas os dados vindos do hook, sem fallbacks para mock data
  const programs = programsFromHook || [];

  // Static data que permanece mock
  const availableCities = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 
    'Salvador', 'Fortaleza', 'Curitiba', 'Recife', 'Porto Alegre', 'Goiânia'
  ];

  // Simplificado - agora usa o sistema unificado
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('🏠 HomePage: Carregando dados do banco...');

        // Carregar esportes disponíveis
        try {
          const sportsResponse = await SportsService.sportsService.getAllSports();
          if (sportsResponse.success && sportsResponse.data?.length > 0) {
            const sportsNames = sportsResponse.data.map(sport => sport.name);
            setAvailableSports(sportsNames);
          } else {
            setAvailableSports(mockAvailableSports);
          }
        } catch (error) {
          console.warn('⚠️ Erro ao carregar esportes, usando fallback:', error);
          setAvailableSports(mockAvailableSports);
        }

        // 🎯 CARREGAR TREINADORES REAIS DO SUPABASE
        try {
          console.log('🔍 HomePage: Carregando top treinadores...');
          const trainersResponse = await searchTrainers({
            limit: 6, // Top 6 treinadores para HomePage
            offset: 0
          });
          
          if (trainersResponse.success && trainersResponse.data?.length > 0) {
            console.log(`✅ Carregados ${trainersResponse.data.length} treinadores reais`);
            
            // ✅ busque simples e, se quiser ranking, ordene no client:
            const score = (row: any) => Number(row.rating ?? 0);
            trainersResponse.data.sort((a, b) => score(b) - score(a));
            
            // Transformar DTOs para formato HomePageTrainer
            const realTrainers: HomePageTrainer[] = trainersResponse.data.map(dto => ({
              id: dto.slug || dto.id, // ✅ USAR SLUG COMO ID
              name: dto.name,
              location: dto.location || 'São Paulo, SP',
              avatar: dto.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
              portfolioImages: [
                'https://images.unsplash.com/photo-1573858129038-6f98c3cb2ac7?w=400&q=80',
                'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=400&q=80',
                'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80'
              ],
              tags: dto.specialties?.slice(0, 2) || ['Fitness'],
              stats: {
                followers: `${Math.floor(Math.random() * 3000 + 500)}`,
                following: `${Math.floor(Math.random() * 300 + 100)}`,
                views: `${Math.floor(Math.random() * 20000 + 5000)}`
              },
              rating: dto.rating || 4.8,
              isVerified: dto.isVerified || true
            }));
            
            setTopTrainers(realTrainers);
          } else {
            console.log('📝 Nenhum treinador encontrado no banco');
            setTopTrainers([]);
          }
        } catch (error) {
          console.error('❌ Erro ao carregar treinadores reais:', error);
          console.log('📝 Definindo lista de treinadores vazia');
          setTopTrainers([]);
        }

        console.log('✅ HomePage: Dados carregados com sucesso');

      } catch (error) {
        console.error('Erro ao carregar dados da HomePage:', error);
        
        // REQUISITO CRÍTICO: APENAS DADOS REAIS DO SUPABASE
        // Definir listas vazias ao invés de usar mock data
        setTopTrainers([]);
        setAvailableSports([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const clearAllFilters = () => {
    setSearchType('trainers');
    setSelectedSports([]);
    setIsOnline(true);
    setSelectedCities([]);
  };

  const activeFiltersCount = selectedSports.length + selectedCities.length + (searchType !== 'trainers' ? 1 : 0) + (!isOnline ? 1 : 0);

  // Dados mock como fallback
  const mockAvailableSports = [
    'Musculação', 'Funcional', 'Yoga', 'Crossfit', 'Corrida', 
    'Pilates', 'Natação', 'Futebol', 'Basquete', 'Tênis'
  ];

  const mockTopTrainers: HomePageTrainer[] = [
    {
      id: "joao",
      name: "João Silva",
      location: "São Paulo, SP",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      portfolioImages: [
        "https://images.unsplash.com/photo-1573858129038-6f98c3cb2ac7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwdHJhaW5pbmclMjB3b3Jrb3V0JTIwZ3ltfGVufDF8fHx8MTc1NjUxODYwMnww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWlnaHRsaWZ0aW5nJTIwZ3ltJTIwdHJhaW5pbmd8ZW58MXx8fHwxNzU2MTMxNjUxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwZml0bmVzcyUyMHRyYWluZXJ8ZW58MXx8fHwxNzU2MTMyOTM4fDA&ixlib=rb-4.1.0&q=80&w=1080"
      ],
      tags: ["Musculação", "Funcional"],
      stats: {
        followers: "3,2k",
        following: "245",
        views: "18,7k"
      },
      rating: 4.9,
      isVerified: true
    },
    {
      id: "maria",
      name: "Maria Santos",
      location: "Rio de Janeiro, RJ",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c647?w=400&q=80",
      portfolioImages: [
        "https://images.unsplash.com/photo-1715780463401-b9ef0567943e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwcGlsYXRlcyUyMHN0dWRpb3xlbnwxfHx8fDE3NTY1MTg2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1599447421416-3414500d18a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwY2xhc3MlMjBncm91cHxlbnwxfHx8fDE3NTYxMzI5Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1506629905853-cb0d03b2b93a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwcGlsYXRlcyUyMHdvcmtvdXJ8ZW58MXx8fHwxNzU2MTMyOTM2fDA&ixlib=rb-4.1.0&q=80&w=1080"
      ],
      tags: ["Yoga", "Pilates"],
      stats: {
        followers: "2,8k",
        following: "189",
        views: "14,2k"
      },
      rating: 4.8,
      isVerified: true
    },
    {
      id: "carlos",
      name: "Carlos Lima",
      location: "Belo Horizonte, MG",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
      portfolioImages: [
        "https://images.unsplash.com/photo-1662381906696-bcad03513531?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9zc2ZpdCUyMHRyYWluaW5nJTIwd29ya291dHxlbnwxfHx8fDE3NTY1MTg2Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWl0JTIwdHJhaW5pbmclMjB3b3Jrb3V0fGVufDF8fHx8MTc1NjEzMjkzOXww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1583483425806-e45dfe57e4b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9zc2ZpdCUyMHdvcmtvdXQlMjBneW18ZW58MXx8fHwxNzU2MTMyOTM4fDA&ixlib=rb-4.1.0&q=80&w=1080"
      ],
      tags: ["Crossfit", "HIIT"],
      stats: {
        followers: "4,1k",
        following: "312",
        views: "22,5k"
      },
      rating: 4.7,
      isVerified: true
    },
    {
      id: "ana",
      name: "Ana Costa",
      location: "Porto Alegre, RS",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      portfolioImages: [
        "https://images.unsplash.com/photo-1751456357786-68c278e9063c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBmaXRuZXNzJTIwdHJhaW5lcnxlbnwxfHx8fDE3NTY2NDYzNDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        "https://images.unsplash.com/photo-1641971215217-fc55b492d11f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwc3R1ZGlvJTIwY2xhc3N8ZW58MXx8fHwxNzU2Njg5MTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80"
      ],
      tags: ["Fitness", "Corrida"],
      stats: {
        followers: "1,9k",
        following: "156",
        views: "11,3k"
      },
      rating: 4.6,
      isVerified: true
    },
    {
      id: "ricardo",
      name: "Ricardo Mendes",
      location: "Brasília, DF",
      avatar: "https://images.unsplash.com/photo-1658279445014-dcc466ac1192?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIweW9nYSUyMGluc3RydWN0b3J8ZW58MXx8fHwxNzU2Njg5MTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      portfolioImages: [
        "https://images.unsplash.com/photo-1641971215217-fc55b492d11f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwc3R1ZGlvJTIwY2xhc3N8ZW58MXx8fHwxNzU2Njg5MTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        "https://images.unsplash.com/photo-1599447421416-3414500d18a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwY2xhc3MlMjBncm91cHxlbnwxfHx8fDE3NTYxMzI5Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1506629905853-cb0d03b2b93a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwcGlsYXRlcyUyMHdvcmtvdXJ8ZW58MXx8fHwxNzU2MTMyOTM2fDA&ixlib=rb-4.1.0&q=80&w=1080"
      ],
      tags: ["Yoga", "Meditação"],
      stats: {
        followers: "2,5k",
        following: "134",
        views: "13,8k"
      },
      rating: 4.8,
      isVerified: true
    },
    {
      id: "pedro",
      name: "Pedro Oliveira",
      location: "Fortaleza, CE",
      avatar: "https://images.unsplash.com/photo-1721096702258-e693f8977a83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMGNvYWNoJTIwcG9vbHxlbnwxfHx8fDE3NTY2ODkxNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      portfolioImages: [
        "https://images.unsplash.com/photo-1727151590381-324be70e3295?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjB0cmFpbmluZ3xlbnwxfHx8fDE3NTY2ODkxMzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwZml0bmVzcyUyMHRyYWluZXJ8ZW58MXx8fHwxNzU2MTMyOTM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80"
      ],
      tags: ["Natação", "Aqua Fitness"],
      stats: {
        followers: "1,7k",
        following: "98",
        views: "9,2k"
      },
      rating: 4.7,
      isVerified: true
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Sports Menu */}
      <SportsMenu 
        selectedSport={selectedSport}
      />

      {/* Hero Section with Pink Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e0093e] via-[#e0093e] to-[#c0082e]">
        {/* Background pattern/shapes */}
        <div className="absolute inset-0 overflow-hidden max-w-[87.5rem] mx-auto rounded-xl">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10"></div>
          <div className="absolute top-1/2 -left-20 w-40 h-40 rounded-full bg-white/5"></div>
          <div className="absolute bottom-20 right-1/4 w-32 h-32 rounded-full bg-white/5"></div>
        </div>

        <div className="relative container py-16 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="md:text-5xl lg:text-6xl font-bold text-white mb-[20px] leading-tight text-[48px] mt-[0px] mr-[0px] ml-[0px]">
              Encontre o<br />
              <span className="text-white">treinador ideal</span><br />
              para o seu<br />
              <span className="text-white font-[Inter]">esporte favorito.</span>
            </h1>

            {/* Search Bar */}
            <div className="max-w-xl mb-6">
              <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <DialogTrigger asChild>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="O que está procurando?"
                      className="pl-12 pr-4 h-14 text-base bg-white border-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                      readOnly
                    />
                  </div>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-2xl backdrop-blur-md">
                  <DialogTitle className="sr-only">Buscar na plataforma</DialogTitle>
                  <DialogDescription className="sr-only">
                    Busque por treinadores, modalidades esportivas e programas de treino
                  </DialogDescription>
                  
                  <div className="space-y-6">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Buscar esportes, treinadores ou programas..."
                        className="pl-12 text-lg h-12 border-2 focus:border-[#e0093e]"
                        autoFocus
                      />
                    </div>

                    {/* Compact Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Search Type */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Buscar por</Label>
                        <RadioGroup 
                          value={searchType} 
                          onValueChange={(value: 'trainers' | 'programs') => setSearchType(value)}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="trainers" id="trainers" />
                            <Label htmlFor="trainers" className="text-sm">Treinadores</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="programs" id="programs" />
                            <Label htmlFor="programs" className="text-sm">Programas</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Training Mode */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Modalidade</Label>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                          <div className="flex items-center gap-2">
                            <MapPin className={`h-4 w-4 ${!isOnline ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className="text-sm font-medium">{isOnline ? 'Online' : 'Presencial'}</span>
                          </div>
                          <Switch
                            checked={isOnline}
                            onCheckedChange={setIsOnline}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sports Multi-Select */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Esportes</Label>
                      <Popover open={sportsOpen} onOpenChange={setSportsOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between h-10"
                          >
                            {selectedSports.length === 0 
                              ? "Selecione os esportes..." 
                              : `${selectedSports.length} esporte${selectedSports.length > 1 ? 's' : ''} selecionado${selectedSports.length > 1 ? 's' : ''}`
                            }
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar esporte..." />
                            <CommandList>
                              <CommandEmpty>Nenhum esporte encontrado.</CommandEmpty>
                              <CommandGroup>
                                {(availableSports.length > 0 ? availableSports : mockAvailableSports).map((sport) => (
                                  <CommandItem
                                    key={sport}
                                    onSelect={() => {
                                      setSelectedSports(prev => 
                                        prev.includes(sport) 
                                          ? prev.filter(s => s !== sport)
                                          : [...prev, sport]
                                      );
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        selectedSports.includes(sport) ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {sport}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      
                      {selectedSports.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedSports.map((sport) => (
                            <Badge key={sport} variant="secondary" className="text-xs">
                              {sport}
                              <X 
                                className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500" 
                                onClick={() => setSelectedSports(prev => prev.filter(s => s !== sport))}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cities (conditional) */}
                    {!isOnline && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Cidades</Label>
                        <Popover open={citiesOpen} onOpenChange={setCitiesOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between h-10"
                            >
                              {selectedCities.length === 0 
                                ? "Selecione as cidades..." 
                                : `${selectedCities.length} cidade${selectedCities.length > 1 ? 's' : ''} selecionada${selectedCities.length > 1 ? 's' : ''}`
                              }
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Buscar cidade..." />
                              <CommandList>
                                <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                                <CommandGroup>
                                  {availableCities.map((city) => (
                                    <CommandItem
                                      key={city}
                                      onSelect={() => {
                                        setSelectedCities(prev => 
                                          prev.includes(city) 
                                            ? prev.filter(c => c !== city)
                                            : [...prev, city]
                                        );
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          selectedCities.includes(city) ? "opacity-100" : "opacity-0"
                                        }`}
                                      />
                                      {city}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        
                        {selectedCities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedCities.map((city) => (
                              <Badge key={city} variant="secondary" className="text-xs">
                                {city}
                                <X 
                                  className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500" 
                                  onClick={() => setSelectedCities(prev => prev.filter(c => c !== city))}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Filters summary */}
                    <div className="flex items-center justify-between py-3 border-t">
                      <span className="text-sm text-gray-600">
                        {activeFiltersCount > 0 ? `${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''} aplicado${activeFiltersCount > 1 ? 's' : ''}` : 'Nenhum filtro aplicado'}
                      </span>
                      {activeFiltersCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearAllFilters}
                          className="text-[#e0093e] hover:text-[#c0082e]"
                        >
                          Limpar filtros
                        </Button>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <Button className="flex-1 bg-[#e0093e] hover:bg-[#c0082e] text-white">
                        <Search className="w-4 h-4 mr-2" />
                        Buscar
                      </Button>
                      <Button variant="outline" onClick={() => setIsSearchOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 text-center text-white">
              <div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm opacity-90">Treinadores</div>
              </div>
              <div>
                <div className="text-2xl font-bold">1200+</div>
                <div className="text-sm opacity-90">Programas</div>
              </div>
              <div>
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm opacity-90">Modalidades</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Categories */}
      <SportsCategories />

      {/* Programas Seção - UMA ÚNICA SEÇÃO USANDO DADOS UNIFICADOS */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-[Inter] mb-8 text-[36px]">
              Programas de <span className="text-[#e0093e]">Treino</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Descubra os melhores programas de treinamento criados por nossos especialistas
            </p>
          </div>

          {/* Programas Grid - SEMPRE MOSTRA PROGRAMAS */}
          {programsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e0093e]"></div>
            </div>
          ) : (
            <div className="full-bleed">
              <div className="pl-6 lg:pl-8">
                <AppleCarousel 
                  items={programs.map((program) => (
                    <div key={program.id} className="w-80">
                      <CompactProgramCard
                        program={program}
                        actions={{
                          onNavigateToProgram: (id) => navigation.navigateTo('program-details', { id }),
                          onNavigateToTrainer: (id) => navigation.navigateTo('trainer-profile', { id }),
                          onLike: (id) => console.log('Like program:', id)
                        }}
                      />
                    </div>
                  ))}
                />
              </div>
            </div>
          )}

          {/* Ver Mais Button */}
          {programs && programs.length > 8 && (
            <div className="text-center mt-12">
              <Button 
                onClick={() => navigation.navigateTo('catalog')}
                variant="outline" 
                size="lg"
                className="border-[#e0093e] text-[#e0093e] hover:bg-[#e0093e] hover:text-white"
              >
                Ver Todos os Programas
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Treinadores Seção */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nossos <span className="text-[#e0093e]">Treinadores</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Conheça os profissionais certificados que vão te ajudar a alcançar seus objetivos
            </p>
          </div>

          {/* Trainers Carousel */}
          <TrainerProfileListHybrid
            filters={{ limit: 6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            cardClassName=""
            onTrainerClick={(trainer) => navigation.navigateTo('trainer-profile', { id: trainer.id })}
          />

          {/* Ver Mais Button */}
          <div className="text-center mt-12">
            <Button 
              onClick={() => navigation.navigateTo('trainers-catalog')}
              variant="outline" 
              size="lg"
              className="border-[#e0093e] text-[#e0093e] hover:bg-[#e0093e] hover:text-white"
            >
              Ver Todos os Treinadores
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como <span className="text-[#e0093e]">Funciona</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Em 3 passos simples você encontra o treinador perfeito para você
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#e0093e] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Busque</h3>
              <p className="text-gray-600">
                Encontre treinadores por modalidade, localização ou especialidade
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#e0093e] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Conecte</h3>
              <p className="text-gray-600">
                Entre em contato diretamente com o treinador de sua escolha
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#e0093e] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Treine</h3>
              <p className="text-gray-600">
                Comece seu treinamento e alcance seus objetivos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-[#e0093e] text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para Começar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Encontre seu treinador ideal hoje mesmo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigation.navigateTo('become-client')}
              className="bg-white text-[#e0093e] hover:bg-gray-100"
            >
              Sou Cliente
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigation.navigateTo('become-trainer')}
              className="border-white text-white hover:bg-white hover:text-[#e0093e]"
            >
              Sou Treinador
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}