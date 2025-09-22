import { useState } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { 
  X, 
  ChevronDown, 
  MapPin, 
  Star, 
  DollarSign, 
  Target, 
  Calendar, 
  Monitor, 
  Users,
  Tag,
  TrendingUp
} from 'lucide-react';

interface ProgramFiltersProps {
  filters: {
    city: string;
    category: string;
    rating: number;
    priceRange: [number, number];
    location: string;
    period: string;
    level: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
}

export function ProgramFilters({
  filters,
  onFilterChange,
  onClearFilters
}: ProgramFiltersProps) {
  const [openPopovers, setOpenPopovers] = useState({
    city: false,
    category: false,
    rating: false,
    price: false,
    location: false,
    period: false,
    level: false
  });

  const [priceRange, setPriceRange] = useState<[number, number]>(filters.priceRange);

  const cities = [
    'Todas as cidades',
    'São Paulo, SP',
    'Rio de Janeiro, RJ',
    'Belo Horizonte, MG',
    'Brasília, DF',
    'Salvador, BA',
    'Fortaleza, CE',
    'Recife, PE',
    'Porto Alegre, RS',
    'Curitiba, PR'
  ];

  const categories = [
    'Todas as categorias',
    'Musculação',
    'Funcional',
    'Cardio',
    'Yoga',
    'Pilates',
    'CrossFit',
    'Dança',
    'Artes Marciais',
    'Natação',
    'Corrida'
  ];

  const levels = [
    'Todos os níveis',
    'Iniciante',
    'Intermediário',
    'Avançado'
  ];

  const periods = [
    'Todos os períodos',
    'Programa fechado',
    'Mensal',
    'Trimestral',
    'Semestral'
  ];

  const closePopover = (key: string) => {
    setOpenPopovers(prev => ({ ...prev, [key]: false }));
  };

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange(key, value);
  };

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
    onFilterChange('priceRange', value);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-700">
          {rating > 0 ? `${rating}.0+ estrelas` : 'Qualquer avaliação'}
        </span>
      </div>
    );
  };

  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'city') return value !== 'Todas as cidades';
    if (key === 'category') return value !== 'Todas as categorias';
    if (key === 'rating') return value > 0;
    if (key === 'priceRange') return value[0] > 0 || value[1] < 500;
    if (key === 'location') return value !== 'todos';
    if (key === 'period') return value !== 'todos';
    if (key === 'level') return value !== 'todos';
    return false;
  }).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="space-y-6">
      {/* Header com contagem de filtros ativos */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">Filtros</h3>
        {hasActiveFilters && (
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-[#FF385C]/10 text-[#FF385C] border border-[#FF385C]/20">
              {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        )}
      </div>

      {/* Filtros em linha */}
      <div className="flex flex-wrap gap-3">
        
        {/* Filtro de Cidade */}
        <Popover 
          open={openPopovers.city} 
          onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, city: open }))}
        >
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="h-11 px-4 glass border-glass-border hover:bg-white/90 transition-colors"
            >
              <MapPin className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-gray-700">
                {filters.city === 'Todas as cidades' ? 'Cidade' : filters.city.split(',')[0]}
              </span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 glass-card" align="start">
            <div className="space-y-1">
              {cities.map((city) => (
                <Button
                  key={city}
                  variant="ghost"
                  className="w-full justify-start text-sm hover:bg-white/20"
                  onClick={() => {
                    handleFilterChange('city', city);
                    closePopover('city');
                  }}
                >
                  {city}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro de Categoria */}
        <Popover 
          open={openPopovers.category} 
          onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, category: open }))}
        >
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="h-11 px-4 glass border-glass-border hover:bg-white/90 transition-colors"
            >
              <Tag className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-gray-700">
                {filters.category === 'Todas as categorias' ? 'Categoria' : filters.category}
              </span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 glass-card" align="start">
            <div className="space-y-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  className="w-full justify-start text-sm hover:bg-white/20"
                  onClick={() => {
                    handleFilterChange('category', category);
                    closePopover('category');
                  }}
                >
                  {category}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro de Avaliação */}
        <Popover 
          open={openPopovers.rating} 
          onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, rating: open }))}
        >
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="h-11 px-4 glass border-glass-border hover:bg-white/90 transition-colors"
            >
              <Star className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-gray-700">
                {filters.rating > 0 ? `${filters.rating}.0+ estrelas` : 'Avaliação'}
              </span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 glass-card" align="start">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-900">
                Avaliação mínima
              </Label>
              <div className="space-y-3">
                {[0, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto hover:bg-white/20 rounded-lg"
                    onClick={() => {
                      handleFilterChange('rating', rating);
                      closePopover('rating');
                    }}
                  >
                    {renderStars(rating)}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro de Valor */}
        <Popover 
          open={openPopovers.price} 
          onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, price: open }))}
        >
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="h-11 px-4 glass border-glass-border hover:bg-white/90 transition-colors"
            >
              <DollarSign className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-gray-700">
                {priceRange[0] > 0 || priceRange[1] < 500 
                  ? `R$ ${priceRange[0]} - R$ ${priceRange[1]}` 
                  : 'Valor'
                }
              </span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 glass-card" align="start">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-900">
                Faixa de preço por programa
              </Label>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  max={500}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>R$ {priceRange[0]}</span>
                <span>R$ {priceRange[1]}+</span>
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  size="sm" 
                  onClick={() => closePopover('price')}
                  className="bg-[#FF385C] hover:bg-[#E31C5F] text-white"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro de Nível */}
        <Popover 
          open={openPopovers.level} 
          onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, level: open }))}
        >
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="h-11 px-4 glass border-glass-border hover:bg-white/90 transition-colors"
            >
              <TrendingUp className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-gray-700">
                {filters.level === 'todos' ? 'Nível' : filters.level}
              </span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 glass-card" align="start">
            <div className="space-y-1">
              {levels.map((level) => (
                <Button
                  key={level}
                  variant="ghost"
                  className="w-full justify-start text-sm hover:bg-white/20"
                  onClick={() => {
                    handleFilterChange('level', level === 'Todos os níveis' ? 'todos' : level.toLowerCase());
                    closePopover('level');
                  }}
                >
                  {level}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro de Período */}
        <Popover 
          open={openPopovers.period} 
          onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, period: open }))}
        >
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="h-11 px-4 glass border-glass-border hover:bg-white/90 transition-colors"
            >
              <Calendar className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-gray-700">
                {filters.period === 'todos' ? 'Período' : filters.period}
              </span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 glass-card" align="start">
            <div className="space-y-1">
              {periods.map((period) => (
                <Button
                  key={period}
                  variant="ghost"
                  className="w-full justify-start text-sm hover:bg-white/20"
                  onClick={() => {
                    handleFilterChange('period', period === 'Todos os períodos' ? 'todos' : period.toLowerCase().replace(' ', '-'));
                    closePopover('period');
                  }}
                >
                  {period}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Toggle Tipo de Treino */}
        <div className="flex items-center gap-2 glass rounded-xl p-3 border border-glass-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-gray-600" />
              <Label htmlFor="online-toggle" className="text-sm text-gray-700">
                Online
              </Label>
              <Switch
                id="online-toggle"
                checked={filters.location === 'online'}
                onCheckedChange={(checked) => 
                  handleFilterChange('location', checked ? 'online' : 'todos')
                }
              />
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />
              <Label htmlFor="presencial-toggle" className="text-sm text-gray-700">
                Presencial
              </Label>
              <Switch
                id="presencial-toggle"
                checked={filters.location === 'presencial'}
                onCheckedChange={(checked) => 
                  handleFilterChange('location', checked ? 'presencial' : 'todos')
                }
              />
            </div>
          </div>
        </div>

        {/* Botão Limpar Filtros */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearFilters}
            className="h-11 px-4 glass border-glass-border hover:bg-white/90 transition-colors text-sm text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Filtros ativos como badges */}
      {hasActiveFilters && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Filtros ativos:</Label>
          <div className="flex flex-wrap gap-2">
            {filters.city !== 'Todas as cidades' && (
              <Badge 
                variant="secondary" 
                className="bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1"
              >
                <MapPin className="h-3 w-3" />
                {filters.city.split(',')[0]}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-blue-100 ml-1"
                  onClick={() => handleFilterChange('city', 'Todas as cidades')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.category !== 'Todas as categorias' && (
              <Badge 
                variant="secondary" 
                className="bg-green-50 text-green-700 border border-green-200 flex items-center gap-1"
              >
                <Tag className="h-3 w-3" />
                {filters.category}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-green-100 ml-1"
                  onClick={() => handleFilterChange('category', 'Todas as categorias')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.rating > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center gap-1"
              >
                <Star className="h-3 w-3" />
                {filters.rating}.0+ estrelas
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-yellow-100 ml-1"
                  onClick={() => handleFilterChange('rating', 0)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {(priceRange[0] > 0 || priceRange[1] < 500) && (
              <Badge 
                variant="secondary" 
                className="bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1"
              >
                <DollarSign className="h-3 w-3" />
                R$ {priceRange[0]} - R$ {priceRange[1]}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-purple-100 ml-1"
                  onClick={() => handlePriceChange([0, 500])}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.location !== 'todos' && (
              <Badge 
                variant="secondary" 
                className="bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1"
              >
                {filters.location === 'online' ? <Monitor className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                {filters.location === 'online' ? 'Online' : filters.location === 'presencial' ? 'Presencial' : 'Híbrido'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-indigo-100 ml-1"
                  onClick={() => handleFilterChange('location', 'todos')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}