import { useState, useRef, useEffect } from 'react';
import { Trophy, Star, MapPin, Users, FileText, Filter, ChevronDown, DollarSign, Monitor, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { motion } from 'motion/react';

import { BrandContentSwitcher } from './ui/brand-content-switcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { Section } from './layout/Section';
import { CardShell } from './layout/CardShell';

// Import dos dados centralizados
import { categoriesWithAll, sportsCategories } from '../data/constants';
import { SportsMegaMenu } from './ui/sports-mega-menu';

type ContentType = 'trainers' | 'programs';

interface Trainer {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  location: string;
  avatar: string;
  specialties: string[];
}

interface Program {
  id: string;
  title: string;
  trainer: string;
  price: string;
  duration: string;
  level: string;
  rating: number;
  students: number;
  image: string;
}

const mockTrainers: Trainer[] = [
  {
    id: '1',
    name: 'João Silva',
    title: 'Personal Trainer Certificado',
    rating: 4.9,
    reviews: 127,
    location: 'São Paulo, SP',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    specialties: ['Musculação', 'Emagrecimento']
  },
  {
    id: '2',
    name: 'Maria Santos',
    title: 'Especialista em Yoga',
    rating: 4.8,
    reviews: 89,
    location: 'Rio de Janeiro, RJ',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&q=80',
    specialties: ['Yoga', 'Pilates']
  },
  {
    id: '3',
    name: 'Carlos Mendes',
    title: 'Coach de Performance',
    rating: 4.9,
    reviews: 203,
    location: 'Belo Horizonte, MG',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    specialties: ['CrossFit', 'Funcional']
  }
];

const mockPrograms: Program[] = [
  {
    id: '1',
    title: 'Transformação Corporal Completa',
    trainer: 'João Silva',
    price: 'R$ 297',
    duration: '12 semanas',
    level: 'Intermediário',
    rating: 4.9,
    students: 234,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80'
  },
  {
    id: '2',
    title: 'Yoga para Iniciantes',
    trainer: 'Maria Santos',
    price: 'R$ 197',
    duration: '8 semanas',
    level: 'Iniciante',
    rating: 4.8,
    students: 156,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80'
  },
  {
    id: '3',
    title: 'CrossFit para Competição',
    trainer: 'Carlos Mendes',
    price: 'R$ 450',
    duration: '16 semanas',
    level: 'Avançado',
    rating: 4.9,
    students: 89,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80'
  }
];

// Filtros para treinadores
interface TrainerFilters {
  city: string;
  category: string;
  minRating: number;
  priceRange: [number, number];
  trainingType: 'online' | 'presencial' | 'all';
}

// Filtros para programas
interface ProgramFilters {
  category: string;
  level: string;
  duration: string;
  minRating: number;
  priceRange: [number, number];
}

export function ContentSwitcherDemo({ onNavigateBack }: { onNavigateBack: () => void }) {
  const [activeContent, setActiveContent] = useState<ContentType>('trainers');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para controlar popovers
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  
  // Estados para filtros específicos
  const [trainerFilters, setTrainerFilters] = useState<TrainerFilters>({
    city: 'Todas as cidades',
    category: 'Todas as categorias',
    minRating: 0,
    priceRange: [20, 500],
    trainingType: 'all'
  });
  
  const [programFilters, setProgramFilters] = useState<ProgramFilters>({
    category: 'Todas as categorias',
    level: 'Todos os níveis',
    duration: 'Todas as durações',
    minRating: 0,
    priceRange: [50, 1000]
  });

  // Data para filtros - importando dos dados centralizados
  const cities = [
    'Todas as cidades',
    'São Paulo, SP',
    'Rio de Janeiro, RJ', 
    'Belo Horizonte, MG',
    'Brasília, DF',
    'Salvador, BA',
    'Fortaleza, CE',
    'Curitiba, PR',
    'Recife, PE',
    'Porto Alegre, RS',
    'Manaus, AM',
    'Belém, PA',
    'Goiânia, GO',
    'Guarulhos, SP',
    'Campinas, SP',
    'São Luís, MA',
    'São Gonçalo, RJ',
    'Maceió, AL',
    'Duque de Caxias, RJ',
    'Nova Iguaçu, RJ',
    'Natal, RN',
    'Teresina, PI',
    'Campo Grande, MS',
    'São Bernardo do Campo, SP',
    'João Pessoa, PB',
    'Jaboatão dos Guararapes, PE',
    'Santo André, SP',
    'Osasco, SP',
    'Ribeirão Preto, SP',
    'Uberlândia, MG',
    'Sorocaba, SP',
    'Contagem, MG',
    'Aracaju, SE',
    'Feira de Santana, BA',
    'Cuiabá, MT',
    'Joinville, SC',
    'Aparecida de Goiânia, GO',
    'Londrina, PR',
    'Juiz de Fora, MG',
    'Ananindeua, PA',
    'Niterói, RJ',
    'Serra, ES',
    'Campos dos Goytacazes, RJ',
    'Vila Velha, ES',
    'Florianópolis, SC',
    'Santos, SP',
    'Mauá, SP',
    'Carapicuíba, SP',
    'São José dos Campos, SP'
  ];
  const levels = ['Todos os níveis', 'Iniciante', 'Intermediário', 'Avançado'];
  const durations = ['Todas as durações', '4-8 semanas', '8-12 semanas', '12+ semanas'];

  const switcherOptions = [
    {
      id: 'trainers',
      label: 'Treinadores',
      count: mockTrainers.length
    },
    {
      id: 'programs',
      label: 'Programas',
      count: mockPrograms.length
    }
  ];

  // Função para renderizar estrelas
  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'fill-current text-yellow-500' : 'text-gray-300'}`}
        />
      ))}
      {rating > 0 && <span className="ml-2 text-sm text-gray-600">{rating}+ estrelas</span>}
    </div>
  );

  // Handlers para filtros de treinadores
  const handleTrainerFilterChange = (key: keyof TrainerFilters, value: any) => {
    setTrainerFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handlers para filtros de programas
  const handleProgramFilterChange = (key: keyof ProgramFilters, value: any) => {
    setProgramFilters(prev => ({ ...prev, [key]: value }));
  };

  // Funções para controlar popovers
  const closePopover = (popoverId: string) => {
    setOpenPopovers(prev => ({ ...prev, [popoverId]: false }));
  };

  const togglePopover = (popoverId: string) => {
    setOpenPopovers(prev => ({ ...prev, [popoverId]: !prev[popoverId] }));
  };

  // Verificar se filtros específicos estão ativos (deve vir primeiro)
  const isCityFilterActive = trainerFilters.city !== 'Todas as cidades';
  const isTrainerCategoryFilterActive = trainerFilters.category !== 'Todas as categorias';
  const isRatingFilterActive = trainerFilters.minRating > 0;
  const isTrainerPriceFilterActive = trainerFilters.priceRange[0] !== 20 || trainerFilters.priceRange[1] !== 500;
  const isTrainingTypeFilterActive = trainerFilters.trainingType !== 'all';

  const isCategoryFilterActive = programFilters.category !== 'Todas as categorias';
  const isLevelFilterActive = programFilters.level !== 'Todos os níveis';
  const isDurationFilterActive = programFilters.duration !== 'Todas as durações';
  const isProgramRatingFilterActive = programFilters.minRating > 0;
  const isProgramPriceFilterActive = programFilters.priceRange[0] !== 50 || programFilters.priceRange[1] !== 1000;

  // Verificar se há filtros ativos (usa as variáveis definidas acima)
  const hasActiveTrainerFilters = isCityFilterActive || 
    isTrainerCategoryFilterActive ||
    isRatingFilterActive || 
    isTrainingTypeFilterActive ||
    isTrainerPriceFilterActive;
  
  const hasActiveProgramFilters = isCategoryFilterActive ||
    isLevelFilterActive ||
    isDurationFilterActive ||
    isProgramRatingFilterActive ||
    isProgramPriceFilterActive;

  const clearTrainerFilters = () => {
    setTrainerFilters({
      city: 'Todas as cidades',
      category: 'Todas as categorias',
      minRating: 0,
      priceRange: [20, 500],
      trainingType: 'all'
    });
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

  const renderTrainerCard = (trainer: Trainer) => (
    <Card key={trainer.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-muted group-hover:border-[#e0093e]/30 transition-colors">
            <AvatarImage src={trainer.avatar} alt={trainer.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
              {trainer.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg group-hover:text-[#e0093e] transition-colors">{trainer.name}</h3>
            <p className="text-muted-foreground text-sm mb-2">{trainer.title}</p>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current text-yellow-500" />
                <span className="font-medium">{trainer.rating}</span>
                <span className="text-muted-foreground text-sm">({trainer.reviews})</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="h-3 w-3" />
                <span>{trainer.location}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {trainer.specialties.map((specialty, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button variant="brand" size="sm" className="flex-1">
            Ver Perfil
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Contatar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderProgramCard = (program: Program) => (
    <Card key={program.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group cursor-pointer">
      <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
        <img 
          src={program.image} 
          alt={program.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-[#e0093e] transition-colors line-clamp-2">
          {program.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3">por {program.trainer}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-muted-foreground">Duração:</span>
            <p className="font-medium">{program.duration}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Nível:</span>
            <p className="font-medium">{program.level}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-current text-yellow-500" />
            <span className="font-medium">{program.rating}</span>
            <span className="text-muted-foreground text-sm">({program.students})</span>
          </div>
          <span className="font-bold text-[#e0093e] text-lg">{program.price}</span>
        </div>
        
        <Button variant="brand" size="sm" className="w-full">
          Ver Programa
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Content Switcher Demo</h1>
              <p className="text-muted-foreground">
                Demonstração do componente ContentSwitcher inspirado no design da imagem
              </p>
            </div>
            <Button variant="outline" onClick={onNavigateBack}>
              ← Voltar
            </Button>
          </div>

          {/* Content Switcher e Filtros */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Primeira linha no mobile: Toggle + Botão Filtros */}
            <div className="flex items-center gap-4">
              <BrandContentSwitcher
                options={switcherOptions}
                activeOption={activeContent}
                onOptionChange={(option) => setActiveContent(option as ContentType)}
              />
              
              {/* Desktop: Botão toggle inline */}
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="hidden md:flex h-12 w-12 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
              </Button>

              {/* Mobile: Botão que abre drawer */}
              <Drawer>
                <DrawerTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="md:hidden h-12 w-12 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader className="text-left">
                    <DrawerTitle>Filtros</DrawerTitle>
                    <DrawerDescription>
                      Refine sua busca por {activeContent === 'trainers' ? 'treinadores' : 'programas'}
                    </DrawerDescription>
                  </DrawerHeader>
                  
                  {/* Conteúdo dos filtros para mobile */}
                  <div className="px-4 pb-4 space-y-6 max-h-[60vh] overflow-y-auto">
                    {activeContent === 'trainers' && (
                      <>
                        {/* Categoria Mobile */}
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-900">Categoria</Label>
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                            <button
                              onClick={() => setTrainerFilters({...trainerFilters, category: 'Todas as categorias'})}
                              className={`p-3 rounded-lg text-left transition-colors ${
                                trainerFilters.category === 'Todas as categorias' 
                                  ? 'bg-[#e0093e] text-white' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              Todas as categorias
                            </button>
                            {sportsCategories.map((sport) => (
                              <button
                                key={sport.id}
                                onClick={() => setTrainerFilters({...trainerFilters, category: sport.label})}
                                className={`flex items-center gap-2 p-3 rounded-lg text-left transition-colors ${
                                  trainerFilters.category === sport.label 
                                    ? 'bg-[#e0093e] text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                <img 
                                  src={sport.iconUrl}
                                  alt={sport.label}
                                  className="h-4 w-4 object-contain"
                                />
                                <span className="text-sm">{sport.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Cidade Mobile */}
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-900">Cidade</Label>
                          <select 
                            value={trainerFilters.city}
                            onChange={(e) => handleTrainerFilterChange('city', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                          >
                            {cities.map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                        </div>

                        {/* Avaliação Mobile */}
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-900">Avaliação mínima</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[0, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => handleTrainerFilterChange('minRating', rating)}
                                className={`p-3 rounded-lg text-left transition-colors ${
                                  trainerFilters.minRating === rating 
                                    ? 'bg-[#e0093e] text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {rating === 0 ? 'Qualquer nota' : `${rating}+ estrelas`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Tipo de Treino Mobile */}
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-900">Tipo de Treino</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleTrainerFilterChange('trainingType', 'presencial')}
                              className={`p-3 rounded-lg text-center transition-colors ${
                                trainerFilters.trainingType === 'presencial' 
                                  ? 'bg-[#e0093e] text-white' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              Presencial
                            </button>
                            <button
                              onClick={() => handleTrainerFilterChange('trainingType', 'online')}
                              className={`p-3 rounded-lg text-center transition-colors ${
                                trainerFilters.trainingType === 'online' 
                                  ? 'bg-[#e0093e] text-white' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              Online
                            </button>
                          </div>
                        </div>

                        {/* Preço Mobile */}
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-900">Faixa de preço por sessão</Label>
                          <div className="px-2">
                            <Slider
                              value={trainerFilters.priceRange}
                              onValueChange={(value) => handleTrainerFilterChange('priceRange', value as [number, number])}
                              max={500}
                              min={20}
                              step={10}
                              className="w-full"
                            />
                          </div>
                          <div className="flex items-center justify-between text-gray-600">
                            <span>R$ {trainerFilters.priceRange[0]}</span>
                            <span>R$ {trainerFilters.priceRange[1]}+</span>
                          </div>
                        </div>
                      </>
                    )}

                    {activeContent === 'programs' && (
                      <>
                        {/* Categoria Mobile - Programas */}
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-900">Categoria</Label>
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                            <button
                              onClick={() => setProgramFilters({...programFilters, category: 'Todas as categorias'})}
                              className={`p-3 rounded-lg text-left transition-colors ${
                                programFilters.category === 'Todas as categorias' 
                                  ? 'bg-[#e0093e] text-white' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              Todas as categorias
                            </button>
                            {sportsCategories.map((sport) => (
                              <button
                                key={sport.id}
                                onClick={() => setProgramFilters({...programFilters, category: sport.label})}
                                className={`flex items-center gap-2 p-3 rounded-lg text-left transition-colors ${
                                  programFilters.category === sport.label 
                                    ? 'bg-[#e0093e] text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                <img 
                                  src={sport.iconUrl}
                                  alt={sport.label}
                                  className="h-4 w-4 object-contain"
                                />
                                <span className="text-sm">{sport.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Nível Mobile */}
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-900">Nível</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {levels.map((level) => (
                              <button
                                key={level}
                                onClick={() => handleProgramFilterChange('level', level)}
                                className={`p-3 rounded-lg text-center transition-colors ${
                                  programFilters.level === level 
                                    ? 'bg-[#e0093e] text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Duração Mobile */}
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-900">Duração</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {durations.map((duration) => (
                              <button
                                key={duration}
                                onClick={() => handleProgramFilterChange('duration', duration)}
                                className={`p-3 rounded-lg text-center transition-colors ${
                                  programFilters.duration === duration 
                                    ? 'bg-[#e0093e] text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {duration}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Avaliação Mobile - Programas */}
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-900">Avaliação mínima</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[0, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => handleProgramFilterChange('minRating', rating)}
                                className={`p-3 rounded-lg text-left transition-colors ${
                                  programFilters.minRating === rating 
                                    ? 'bg-[#e0093e] text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {rating === 0 ? 'Qualquer nota' : `${rating}+ estrelas`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Preço Mobile - Programas */}
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-900">Faixa de preço do programa</Label>
                          <div className="px-2">
                            <Slider
                              value={programFilters.priceRange}
                              onValueChange={(value) => handleProgramFilterChange('priceRange', value as [number, number])}
                              max={1000}
                              min={50}
                              step={25}
                              className="w-full"
                            />
                          </div>
                          <div className="flex items-center justify-between text-gray-600">
                            <span>R$ {programFilters.priceRange[0]}</span>
                            <span>R$ {programFilters.priceRange[1]}+</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <DrawerFooter className="flex flex-row gap-2">
                    <Button 
                      variant="outline" 
                      onClick={activeContent === 'trainers' ? clearTrainerFilters : clearProgramFilters}
                      className="flex-1"
                    >
                      Limpar
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="brand" className="flex-1">
                        Aplicar Filtros
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>

            {/* Mobile: Filtros individuais com drawers específicos */}
            <div className="md:hidden flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
              {activeContent === 'trainers' && (
                <>
                  {/* Categoria - Mobile Drawer */}
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                          isTrainerCategoryFilterActive 
                            ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`${isTrainerCategoryFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                          {trainerFilters.category === 'Todas as categorias' ? 'Categoria' : trainerFilters.category}
                        </span>
                        <ChevronDown className={`h-4 w-4 ml-2 ${isTrainerCategoryFilterActive ? 'text-white' : 'text-gray-400'}`} />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Escolha a categoria</DrawerTitle>
                        <DrawerDescription>Filtre treinadores por modalidade esportiva</DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setTrainerFilters({...trainerFilters, category: 'Todas as categorias'})}
                            className={`p-3 rounded-lg text-left transition-colors ${
                              trainerFilters.category === 'Todas as categorias' 
                                ? 'bg-[#e0093e] text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            Todas as categorias
                          </button>
                          {sportsCategories.map((sport) => (
                            <button
                              key={sport.id}
                              onClick={() => setTrainerFilters({...trainerFilters, category: sport.label})}
                              className={`flex items-center gap-2 p-3 rounded-lg text-left transition-colors ${
                                trainerFilters.category === sport.label 
                                  ? 'bg-[#e0093e] text-white' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              <img 
                                src={sport.iconUrl}
                                alt={sport.label}
                                className="h-4 w-4 object-contain"
                              />
                              <span className="text-sm">{sport.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="brand">Aplicar</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>

                  {/* Cidade - Mobile Drawer */}
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                          isCityFilterActive 
                            ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`${isCityFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                          {trainerFilters.city === 'Todas as cidades' ? 'Cidade' : trainerFilters.city.split(',')[0]}
                        </span>
                        <ChevronDown className={`h-4 w-4 ml-2 ${isCityFilterActive ? 'text-white' : 'text-gray-400'}`} />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Escolha a cidade</DrawerTitle>
                        <DrawerDescription>Filtre treinadores por localização</DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
                        <Command>
                          <CommandInput placeholder="Buscar cidade..." className="h-9 mb-4" />
                          <CommandList>
                            <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                            <CommandGroup>
                              {cities.map((city) => (
                                <CommandItem
                                  key={city}
                                  value={city}
                                  onSelect={() => handleTrainerFilterChange('city', city)}
                                  className="flex items-center justify-between py-3"
                                >
                                  <span>{city}</span>
                                  {trainerFilters.city === city && (
                                    <Check className="h-4 w-4 text-[#e0093e]" />
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="brand">Aplicar</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>

                  {/* Avaliação - Mobile Drawer */}
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                          isRatingFilterActive 
                            ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`${isRatingFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                          {isRatingFilterActive ? `${trainerFilters.minRating}+ estrelas` : 'Avaliação'}
                        </span>
                        <ChevronDown className={`h-4 w-4 ml-2 ${isRatingFilterActive ? 'text-white' : 'text-gray-400'}`} />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Avaliação mínima</DrawerTitle>
                        <DrawerDescription>Filtre por nota dos treinadores</DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-1 gap-3">
                          {[0, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => handleTrainerFilterChange('minRating', rating)}
                              className={`p-4 rounded-lg text-left transition-colors ${
                                trainerFilters.minRating === rating 
                                  ? 'bg-[#e0093e] text-white' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {rating === 0 ? 'Qualquer avaliação' : `${rating}+ estrelas`}
                            </button>
                          ))}
                        </div>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="brand">Aplicar</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>

                  {/* Preço - Mobile Drawer */}
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                          isTrainerPriceFilterActive 
                            ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`${isTrainerPriceFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                          {isTrainerPriceFilterActive ? `R$ ${trainerFilters.priceRange[0]}-${trainerFilters.priceRange[1]}` : 'Valor'}
                        </span>
                        <ChevronDown className={`h-4 w-4 ml-2 ${isTrainerPriceFilterActive ? 'text-white' : 'text-gray-400'}`} />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Faixa de preço</DrawerTitle>
                        <DrawerDescription>Defina o valor por sessão</DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 pb-4">
                        <div className="space-y-6">
                          <div className="px-2">
                            <Slider
                              value={trainerFilters.priceRange}
                              onValueChange={(value) => handleTrainerFilterChange('priceRange', value as [number, number])}
                              max={500}
                              min={20}
                              step={10}
                              className="w-full"
                            />
                          </div>
                          <div className="flex items-center justify-between text-gray-600">
                            <span>R$ {trainerFilters.priceRange[0]}</span>
                            <span>R$ {trainerFilters.priceRange[1]}+</span>
                          </div>
                        </div>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="brand">Aplicar</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>

                  {/* Tipo de Treino - Mobile Drawer */}
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                          isTrainingTypeFilterActive 
                            ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`${isTrainingTypeFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                          {trainerFilters.trainingType === 'presencial' ? 'Presencial' : 
                           trainerFilters.trainingType === 'online' ? 'Online' : 'Tipo'}
                        </span>
                        <ChevronDown className={`h-4 w-4 ml-2 ${isTrainingTypeFilterActive ? 'text-white' : 'text-gray-400'}`} />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Tipo de treino</DrawerTitle>
                        <DrawerDescription>Escolha a modalidade de atendimento</DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-1 gap-3">
                          <button
                            onClick={() => handleTrainerFilterChange('trainingType', 'presencial')}
                            className={`p-4 rounded-lg text-center transition-colors ${
                              trainerFilters.trainingType === 'presencial' 
                                ? 'bg-[#e0093e] text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            Presencial
                          </button>
                          <button
                            onClick={() => handleTrainerFilterChange('trainingType', 'online')}
                            className={`p-4 rounded-lg text-center transition-colors ${
                              trainerFilters.trainingType === 'online' 
                                ? 'bg-[#e0093e] text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            Online
                          </button>
                        </div>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="brand">Aplicar</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>

                  {/* Limpar Filtros - Mobile */}
                  {hasActiveTrainerFilters && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearTrainerFilters}
                      className="h-11 px-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all text-red-600 hover:text-red-700 whitespace-nowrap text-sm group"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5 group-hover:rotate-90 transition-transform duration-200" />
                      Limpar
                    </Button>
                  )}
                </>
              )}

              {activeContent === 'programs' && (
                <>
                  {/* Categoria Programas - Mobile Drawer */}
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                          isCategoryFilterActive 
                            ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`${isCategoryFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                          {programFilters.category === 'Todas as categorias' ? 'Categoria' : programFilters.category}
                        </span>
                        <ChevronDown className={`h-4 w-4 ml-2 ${isCategoryFilterActive ? 'text-white' : 'text-gray-400'}`} />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Escolha a categoria</DrawerTitle>
                        <DrawerDescription>Filtre programas por modalidade esportiva</DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setProgramFilters({...programFilters, category: 'Todas as categorias'})}
                            className={`p-3 rounded-lg text-left transition-colors ${
                              programFilters.category === 'Todas as categorias' 
                                ? 'bg-[#e0093e] text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            Todas as categorias
                          </button>
                          {sportsCategories.map((sport) => (
                            <button
                              key={sport.id}
                              onClick={() => setProgramFilters({...programFilters, category: sport.label})}
                              className={`flex items-center gap-2 p-3 rounded-lg text-left transition-colors ${
                                programFilters.category === sport.label 
                                  ? 'bg-[#e0093e] text-white' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              <img 
                                src={sport.iconUrl}
                                alt={sport.label}
                                className="h-4 w-4 object-contain"
                              />
                              <span className="text-sm">{sport.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="brand">Aplicar</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>

                  {/* Nível - Mobile Drawer */}
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                          isLevelFilterActive 
                            ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`${isLevelFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                          {programFilters.level === 'Todos os níveis' ? 'Nível' : programFilters.level}
                        </span>
                        <ChevronDown className={`h-4 w-4 ml-2 ${isLevelFilterActive ? 'text-white' : 'text-gray-400'}`} />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Nível de dificuldade</DrawerTitle>
                        <DrawerDescription>Filtre programas por nível</DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-1 gap-3">
                          {levels.map((level) => (
                            <button
                              key={level}
                              onClick={() => handleProgramFilterChange('level', level)}
                              className={`p-4 rounded-lg text-center transition-colors ${
                                programFilters.level === level 
                                  ? 'bg-[#e0093e] text-white' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="brand">Aplicar</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>

                  {/* Duração - Mobile Drawer */}
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                          isDurationFilterActive 
                            ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`${isDurationFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                          {programFilters.duration === 'Todas as durações' ? 'Duração' : programFilters.duration}
                        </span>
                        <ChevronDown className={`h-4 w-4 ml-2 ${isDurationFilterActive ? 'text-white' : 'text-gray-400'}`} />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Duração do programa</DrawerTitle>
                        <DrawerDescription>Filtre por tempo de duração</DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-1 gap-3">
                          {durations.map((duration) => (
                            <button
                              key={duration}
                              onClick={() => handleProgramFilterChange('duration', duration)}
                              className={`p-4 rounded-lg text-center transition-colors ${
                                programFilters.duration === duration 
                                  ? 'bg-[#e0093e] text-white' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {duration}
                            </button>
                          ))}
                        </div>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="brand">Aplicar</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>

                  {/* Limpar Filtros Programas - Mobile */}
                  {hasActiveProgramFilters && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearProgramFilters}
                      className="h-11 px-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all text-red-600 hover:text-red-700 whitespace-nowrap text-sm group"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5 group-hover:rotate-90 transition-transform duration-200" />
                      Limpar
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Desktop: Filtros com popovers horizontais */}
            {showFilters && (
              <div className="hidden md:flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
                {/* Filtros para Treinadores */}
                {activeContent === 'trainers' && (
                  <>
                    {/* Filtro de Categoria */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                              isTrainerCategoryFilterActive 
                                ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`${isTrainerCategoryFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                              {trainerFilters.category === 'Todas as categorias' ? 'Categoria' : trainerFilters.category}
                            </span>
                            <ChevronDown className={`h-4 w-4 ml-2 ${isTrainerCategoryFilterActive ? 'text-white' : 'text-gray-400'}`} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[800px] p-6" align="start">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-medium text-gray-900">Escolha sua modalidade</h3>
                              <button
                                onClick={() => setTrainerFilters({...trainerFilters, category: 'Todas as categorias'})}
                                className="text-sm text-[#e0093e] hover:text-[#c40835] font-medium hover:underline"
                              >
                                Ver todas as categorias
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4 max-h-80 overflow-y-auto">
                              {sportsCategories.map((sport) => (
                                <button
                                  key={sport.id}
                                  onClick={() => setTrainerFilters({...trainerFilters, category: sport.label})}
                                  className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors group text-left"
                                >
                                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 group-hover:border-[#e0093e] transition-colors">
                                    <img 
                                      src={sport.iconUrl}
                                      alt={sport.label}
                                      className="h-5 w-5 object-contain"
                                    />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#e0093e] transition-colors">
                                      {sport.label}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                              <p className="text-xs text-gray-500">
                                {sportsCategories.length} modalidades disponíveis
                              </p>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </motion.div>

                    {/* Filtro de Cidade */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                              isCityFilterActive 
                                ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`${isCityFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                              {trainerFilters.city === 'Todas as cidades' ? 'Cidade' : trainerFilters.city.split(',')[0]}
                            </span>
                            <ChevronDown className={`h-4 w-4 ml-2 ${isCityFilterActive ? 'text-white' : 'text-gray-400'}`} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar cidade..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                              <CommandGroup>
                                {cities.map((city) => (
                                  <CommandItem
                                    key={city}
                                    value={city}
                                    onSelect={() => {
                                      handleTrainerFilterChange('city', city);
                                    }}
                                    className="flex items-center justify-between py-2"
                                  >
                                    <span>{city}</span>
                                    {trainerFilters.city === city && (
                                      <Check className="h-4 w-4 text-[#e0093e]" />
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </motion.div>

                    {/* Filtro de Avaliação */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Popover open={openPopovers['trainer-rating']} onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, 'trainer-rating': open }))}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                              isRatingFilterActive 
                                ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`${isRatingFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                              {isRatingFilterActive ? `${trainerFilters.minRating}+ estrelas` : 'Avaliação'}
                            </span>
                            <ChevronDown className={`h-4 w-4 ml-2 ${isRatingFilterActive ? 'text-white' : 'text-gray-400'}`} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4" align="start">
                          <div className="space-y-4">
                            <Label className="font-medium text-gray-900">
                              Avaliação mínima
                            </Label>
                            <div className="space-y-4">
                              {[0, 3, 4, 5].map((rating) => (
                                <Button
                                  key={rating}
                                  variant="ghost"
                                  className="w-full justify-start p-2 h-auto hover:bg-gray-100"
                                  onClick={() => {
                                    handleTrainerFilterChange('minRating', rating);
                                    closePopover('trainer-rating');
                                  }}
                                >
                                  {renderStars(rating)}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </motion.div>

                    {/* Filtro de Valor */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <Popover open={openPopovers['trainer-price']} onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, 'trainer-price': open }))}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                              isTrainerPriceFilterActive 
                                ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`${isTrainerPriceFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                              {isTrainerPriceFilterActive ? `R$ ${trainerFilters.priceRange[0]}-${trainerFilters.priceRange[1]}` : 'Valor'}
                            </span>
                            <ChevronDown className={`h-4 w-4 ml-2 ${isTrainerPriceFilterActive ? 'text-white' : 'text-gray-400'}`} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4" align="start">
                          <div className="space-y-4">
                            <Label className="font-medium text-gray-900">
                              Faixa de preço por sessão
                            </Label>
                            <div className="px-2">
                              <Slider
                                value={trainerFilters.priceRange}
                                onValueChange={(value) => handleTrainerFilterChange('priceRange', value as [number, number])}
                                max={500}
                                min={20}
                                step={10}
                                className="w-full"
                              />
                            </div>
                            <div className="flex items-center justify-between text-gray-600">
                              <span>R$ {trainerFilters.priceRange[0]}</span>
                              <span>R$ {trainerFilters.priceRange[1]}+</span>
                            </div>
                            <div className="flex justify-end pt-2">
                              <Button 
                                size="sm"
                                className="bg-gray-900 hover:bg-gray-800 text-white"
                                onClick={() => closePopover('trainer-price')}
                              >
                                Aplicar
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </motion.div>

                    {/* Toggle Tipo de Treino */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="h-11 flex items-center rounded-xl overflow-hidden border border-gray-200"
                    >
                      <button
                        type="button"
                        onClick={() => handleTrainerFilterChange('trainingType', 'presencial')}
                        className={`h-full px-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center ${
                          trainerFilters.trainingType === 'presencial' 
                            ? 'bg-[#e0093e] text-white' 
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Presencial
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTrainerFilterChange('trainingType', 'online')}
                        className={`h-full px-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center ${
                          trainerFilters.trainingType === 'online' 
                            ? 'bg-[#e0093e] text-white' 
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Online
                      </button>
                    </motion.div>

                    {/* Botão Limpar Filtros */}
                    {hasActiveTrainerFilters && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={clearTrainerFilters}
                          className="h-11 px-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all text-red-600 hover:text-red-700 whitespace-nowrap text-sm group"
                        >
                          <X className="h-3.5 w-3.5 mr-1.5 group-hover:rotate-90 transition-transform duration-200" />
                          Limpar filtros
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Filtros para Programas */}
                {activeContent === 'programs' && (
                  <>
                    {/* Filtro de Categoria */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <SportsMegaMenu
                        currentCategory={programFilters.category}
                        onCategorySelect={(category) => setProgramFilters({...programFilters, category})}
                        isActive={isCategoryFilterActive}
                        buttonClassName={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap flex items-center justify-center ${
                          isCategoryFilterActive 
                            ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      />
                    </motion.div>

                    {/* Filtro de Nível */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                              isLevelFilterActive 
                                ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`${isLevelFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                              {programFilters.level === 'Todos os níveis' ? 'Nível' : programFilters.level}
                            </span>
                            <ChevronDown className={`h-4 w-4 ml-2 ${isLevelFilterActive ? 'text-white' : 'text-gray-400'}`} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2" align="start">
                          <div className="space-y-1">
                            {levels.map((level) => (
                              <Button
                                key={level}
                                variant="ghost"
                                className="w-full justify-start hover:bg-gray-100"
                                onClick={() => handleProgramFilterChange('level', level)}
                              >
                                {level}
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </motion.div>

                    {/* Filtro de Duração */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                              isDurationFilterActive 
                                ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`${isDurationFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                              {programFilters.duration === 'Todas as durações' ? 'Duração' : programFilters.duration}
                            </span>
                            <ChevronDown className={`h-4 w-4 ml-2 ${isDurationFilterActive ? 'text-white' : 'text-gray-400'}`} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2" align="start">
                          <div className="space-y-1">
                            {durations.map((duration) => (
                              <Button
                                key={duration}
                                variant="ghost"
                                className="w-full justify-start hover:bg-gray-100"
                                onClick={() => handleProgramFilterChange('duration', duration)}
                              >
                                {duration}
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </motion.div>

                    {/* Filtro de Avaliação */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <Popover open={openPopovers['program-rating']} onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, 'program-rating': open }))}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                              isProgramRatingFilterActive 
                                ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`${isProgramRatingFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                              {isProgramRatingFilterActive ? `${programFilters.minRating}+ estrelas` : 'Avaliação'}
                            </span>
                            <ChevronDown className={`h-4 w-4 ml-2 ${isProgramRatingFilterActive ? 'text-white' : 'text-gray-400'}`} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4" align="start">
                          <div className="space-y-4">
                            <Label className="font-medium text-gray-900">
                              Avaliação mínima
                            </Label>
                            <div className="space-y-4">
                              {[0, 3, 4, 5].map((rating) => (
                                <Button
                                  key={rating}
                                  variant="ghost"
                                  className="w-full justify-start p-2 h-auto hover:bg-gray-100"
                                  onClick={() => {
                                    handleProgramFilterChange('minRating', rating);
                                    closePopover('program-rating');
                                  }}
                                >
                                  {renderStars(rating)}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </motion.div>

                    {/* Filtro de Preço */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Popover open={openPopovers['program-price']} onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, 'program-price': open }))}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`h-11 px-4 rounded-xl transition-colors whitespace-nowrap ${
                              isProgramPriceFilterActive 
                                ? 'bg-[#e0093e] border-[#e0093e] text-white hover:bg-[#c40835]' 
                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`${isProgramPriceFilterActive ? 'text-white' : 'text-gray-700'} text-sm`}>
                              {isProgramPriceFilterActive ? `R$ ${programFilters.priceRange[0]}-${programFilters.priceRange[1]}` : 'Valor'}
                            </span>
                            <ChevronDown className={`h-4 w-4 ml-2 ${isProgramPriceFilterActive ? 'text-white' : 'text-gray-400'}`} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4" align="start">
                          <div className="space-y-4">
                            <Label className="font-medium text-gray-900">
                              Faixa de preço do programa
                            </Label>
                            <div className="px-2">
                              <Slider
                                value={programFilters.priceRange}
                                onValueChange={(value) => handleProgramFilterChange('priceRange', value as [number, number])}
                                max={1000}
                                min={50}
                                step={25}
                                className="w-full"
                              />
                            </div>
                            <div className="flex items-center justify-between text-gray-600">
                              <span>R$ {programFilters.priceRange[0]}</span>
                              <span>R$ {programFilters.priceRange[1]}+</span>
                            </div>
                            <div className="flex justify-end pt-2">
                              <Button 
                                size="sm"
                                className="bg-gray-900 hover:bg-gray-800 text-white"
                                onClick={() => closePopover('program-price')}
                              >
                                Aplicar
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </motion.div>

                    {/* Botão Limpar Filtros */}
                    {hasActiveProgramFilters && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={clearProgramFilters}
                          className="h-11 px-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all text-red-600 hover:text-red-700 whitespace-nowrap text-sm group"
                        >
                          <X className="h-3.5 w-3.5 mr-1.5 group-hover:rotate-90 transition-transform duration-200" />
                          Limpar filtros
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeContent === 'trainers' && mockTrainers.map(renderTrainerCard)}
          {activeContent === 'programs' && mockPrograms.map(renderProgramCard)}
        </div>
      </div>
    </div>
  );
}