import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ChevronDown, Star, MapPin, DollarSign, Monitor, Users } from 'lucide-react';

interface TrainerFiltersProps {
  onFiltersChange?: (filters: FilterState) => void;
}

export interface FilterState {
  city: string;
  minRating: number;
  priceRange: [number, number];
  trainingType: 'all' | 'online' | 'presencial';
}

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
  'Porto Alegre, RS'
];

export function TrainerFilters({ onFiltersChange }: TrainerFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    city: 'Todas as cidades',
    minRating: 0,
    priceRange: [20, 500],
    trainingType: 'all'
  });

  const [openPopovers, setOpenPopovers] = useState({
    city: false,
    rating: false,
    price: false
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const closePopover = (key: keyof typeof openPopovers) => {
    setOpenPopovers(prev => ({ ...prev, [key]: false }));
  };

  const clearFilters = () => {
    const defaultFilters = {
      city: 'Todas as cidades',
      minRating: 0,
      priceRange: [20, 500] as [number, number],
      trainingType: 'all' as const
    };
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
  };

  const hasActiveFilters = 
    filters.city !== 'Todas as cidades' ||
    filters.minRating > 0 ||
    filters.priceRange[0] > 20 ||
    filters.priceRange[1] < 500 ||
    filters.trainingType !== 'all';

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating === 0 ? 'Qualquer avaliação' : `${rating}+ estrelas`}
        </span>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filtrar resultados</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Filtro de Cidade */}
        <Popover 
          open={openPopovers.city} 
          onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, city: open }))}
        >
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="h-11 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <MapPin className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-gray-700">
                {filters.city === 'Todas as cidades' ? 'Cidade' : filters.city.split(',')[0]}
              </span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-1">
              {cities.map((city) => (
                <Button
                  key={city}
                  variant="ghost"
                  className="w-full justify-start text-sm hover:bg-gray-100"
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

        {/* Filtro de Avaliação */}
        <Popover 
          open={openPopovers.rating} 
          onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, rating: open }))}
        >
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="h-11 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Star className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-gray-700">Avaliação do treinador</span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-900">
                Avaliação mínima
              </Label>
              <div className="space-y-4">
                {[0, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto hover:bg-gray-100"
                    onClick={() => {
                      handleFilterChange('minRating', rating);
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
              className="h-11 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <DollarSign className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-gray-700">Valor</span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-900">
                Faixa de preço por sessão
              </Label>
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => handleFilterChange('priceRange', value as [number, number])}
                  max={500}
                  min={20}
                  step={10}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>R$ {filters.priceRange[0]}</span>
                <span>R$ {filters.priceRange[1]}+</span>
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  size="sm" 
                  onClick={() => closePopover('price')}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Toggle Tipo de Treino */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-gray-600" />
              <Label htmlFor="online-toggle" className="text-sm text-gray-700">
                Online
              </Label>
              <Switch
                id="online-toggle"
                checked={filters.trainingType === 'online'}
                onCheckedChange={(checked) => 
                  handleFilterChange('trainingType', checked ? 'online' : 'all')
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />
              <Label htmlFor="presencial-toggle" className="text-sm text-gray-700">
                Presencial
              </Label>
              <Switch
                id="presencial-toggle"
                checked={filters.trainingType === 'presencial'}
                onCheckedChange={(checked) => 
                  handleFilterChange('trainingType', checked ? 'presencial' : 'all')
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
            onClick={clearFilters}
            className="h-11 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-600 hover:text-gray-900"
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Filtros ativos */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <div className="flex flex-wrap gap-2">
            {filters.city !== 'Todas as cidades' && (
              <Badge 
                variant="secondary" 
                className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 animate-in fade-in-0 slide-in-from-left-2 duration-200"
              >
                {filters.city.split(',')[0]}
              </Badge>
            )}
            {filters.minRating > 0 && (
              <Badge 
                variant="secondary" 
                className="px-3 py-1 bg-yellow-50 text-yellow-700 border-yellow-200 animate-in fade-in-0 slide-in-from-left-2 duration-200 delay-100"
              >
                {filters.minRating}+ estrelas
              </Badge>
            )}
            {(filters.priceRange[0] > 20 || filters.priceRange[1] < 500) && (
              <Badge 
                variant="secondary" 
                className="px-3 py-1 bg-green-50 text-green-700 border-green-200 animate-in fade-in-0 slide-in-from-left-2 duration-200 delay-200"
              >
                R$ {filters.priceRange[0]} - R$ {filters.priceRange[1]}
              </Badge>
            )}
            {filters.trainingType !== 'all' && (
              <Badge 
                variant="secondary" 
                className="px-3 py-1 bg-purple-50 text-purple-700 border-purple-200 animate-in fade-in-0 slide-in-from-left-2 duration-200 delay-300"
              >
                {filters.trainingType === 'online' ? 'Online' : 'Presencial'}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}