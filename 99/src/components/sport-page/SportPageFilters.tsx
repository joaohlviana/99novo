/**
 * 🎯 COMPONENTE DE FILTROS DA SPORTPAGE
 * ====================================
 * Extrai toda a lógica de filtros da SportPage para um componente dedicado
 * Implementa filtros para treinadores e programas com estado unificado
 */

import { useState } from 'react';
import { Filter, ChevronDown, X, Star, MapPin, Award, Zap, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '../ui/drawer';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '../ui/command';

// Tipos para filtros
export type ContentType = 'treinadores' | 'programas';
export type SortOption = 'relevante' | 'avaliacao' | 'menor-preco' | 'maior-preco' | 'proximo' | 'recente';

export interface TrainerFilters {
  category: string;
  city: string;
  minRating: number;
  priceRange: [number, number];
  trainingType: 'presencial' | 'online' | null;
  quickFilter: string | null;
}

export interface ProgramFilters {
  category: string;
  level: string;
  duration: string;
  minRating: number;
  priceRange: [number, number];
}

interface SportPageFiltersProps {
  // Estados de filtros
  activeContent: ContentType;
  trainerFilters: TrainerFilters;
  programFilters: ProgramFilters;
  sortBy: SortOption;
  
  // Estados de UI
  showFilters: boolean;
  openPopovers: Record<string, boolean>;
  
  // Handlers
  onContentChange: (content: ContentType) => void;
  onTrainerFilterChange: (key: keyof TrainerFilters, value: any) => void;
  onProgramFilterChange: (key: keyof ProgramFilters, value: any) => void;
  onSortChange: (sort: SortOption) => void;
  onQuickFilter: (filterId: string) => void;
  onShowFiltersChange: (show: boolean) => void;
  onPopoverChange: (key: string, open: boolean) => void;
  
  // Dados para filtros
  cities: string[];
  levels: string[];
  durations: string[];
}

// Mock data para filtros (pode ser movido para constants)
const quickFilters = [
  { id: 'perto', label: 'Perto de mim', icon: MapPin },
  { id: 'melhor-avaliado', label: 'Melhor avaliado', icon: Star },
  { id: 'menor-preco', label: 'Menor preço', icon: Award },
  { id: 'online-agora', label: 'Online agora', icon: Zap },
  { id: 'disponivel-hoje', label: 'Disponível hoje', icon: Clock }
];

export function SportPageFilters({
  activeContent,
  trainerFilters,
  programFilters,
  sortBy,
  showFilters,
  openPopovers,
  onContentChange,
  onTrainerFilterChange,
  onProgramFilterChange,
  onSortChange,
  onQuickFilter,
  onShowFiltersChange,
  onPopoverChange,
  cities,
  levels,
  durations
}: SportPageFiltersProps) {

  // Helper functions
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

  const clearTrainerFilters = () => {
    onTrainerFilterChange('category', 'Todas as categorias');
    onTrainerFilterChange('city', 'Todas as cidades');
    onTrainerFilterChange('minRating', 0);
    onTrainerFilterChange('priceRange', [20, 500]);
    onTrainerFilterChange('trainingType', null);
    onTrainerFilterChange('quickFilter', null);
    onSortChange('relevante');
  };

  const clearProgramFilters = () => {
    onProgramFilterChange('category', 'Todas as categorias');
    onProgramFilterChange('level', 'Todos os níveis');
    onProgramFilterChange('duration', 'Todas as durações');
    onProgramFilterChange('minRating', 0);
    onProgramFilterChange('priceRange', [50, 1000]);
  };

  const renderStars = (rating: number) => {
    if (rating === 0) return <span>Qualquer avaliação</span>;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2">{rating}+ estrelas</span>
      </div>
    );
  };

  const closePopover = (key: string) => {
    onPopoverChange(key, false);
  };

  // Filter active states for trainer filters
  const hasActiveTrainerFilters = 
    trainerFilters.category !== 'Todas as categorias' ||
    trainerFilters.city !== 'Todas as cidades' ||
    trainerFilters.minRating > 0 ||
    trainerFilters.priceRange[0] !== 20 || trainerFilters.priceRange[1] !== 500 ||
    trainerFilters.trainingType !== null ||
    trainerFilters.quickFilter;

  // Filter active states for program filters
  const hasActiveProgramFilters = 
    programFilters.category !== 'Todas as categorias' ||
    programFilters.level !== 'Todos os níveis' ||
    programFilters.duration !== 'Todas as durações' ||
    programFilters.minRating > 0 ||
    programFilters.priceRange[0] !== 50 || programFilters.priceRange[1] !== 1000;

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      {activeContent === 'treinadores' && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {quickFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = trainerFilters.quickFilter === filter.id;
            
            return (
              <Button
                key={filter.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`whitespace-nowrap ${isActive ? 'bg-brand text-brand-foreground' : ''}`}
                onClick={() => onQuickFilter(filter.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      )}

      {/* Main Filters Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 overflow-x-auto scrollbar-hide">
          {/* Filter Toggle */}
          <Drawer open={showFilters} onOpenChange={onShowFiltersChange}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs bg-brand text-brand-foreground">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>

            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader>
                <DrawerTitle>Filtros</DrawerTitle>
                <DrawerDescription>
                  Refine sua busca por {activeContent}
                </DrawerDescription>
              </DrawerHeader>

              <div className="p-4 space-y-6 overflow-y-auto">
                {/* Trainer Filters */}
                {activeContent === 'treinadores' && (
                  <>
                    {/* Location Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Cidade</Label>
                      <Popover 
                        open={openPopovers.city || false} 
                        onOpenChange={(open) => onPopoverChange('city', open)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {trainerFilters.city}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar cidade..." />
                            <CommandList>
                              <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                              <CommandGroup>
                                {cities.map((city) => (
                                  <CommandItem
                                    key={city}
                                    onSelect={() => {
                                      onTrainerFilterChange('city', city);
                                      closePopover('city');
                                    }}
                                  >
                                    {city}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Rating Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Avaliação mínima</Label>
                      <div className="space-y-4">
                        <Slider
                          value={[trainerFilters.minRating]}
                          onValueChange={([value]) => onTrainerFilterChange('minRating', value)}
                          max={5}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-center">
                          {renderStars(trainerFilters.minRating)}
                        </div>
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Faixa de preço (por hora)</Label>
                      <div className="space-y-4">
                        <Slider
                          value={trainerFilters.priceRange}
                          onValueChange={(value) => onTrainerFilterChange('priceRange', value as [number, number])}
                          min={20}
                          max={500}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>R$ {trainerFilters.priceRange[0]}</span>
                          <span>R$ {trainerFilters.priceRange[1]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Training Type */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Modalidade</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={trainerFilters.trainingType === 'presencial' ? "default" : "outline"}
                          size="sm"
                          onClick={() => onTrainerFilterChange('trainingType', 
                            trainerFilters.trainingType === 'presencial' ? null : 'presencial'
                          )}
                          className={trainerFilters.trainingType === 'presencial' ? 'bg-brand text-brand-foreground' : ''}
                        >
                          Presencial
                        </Button>
                        <Button
                          variant={trainerFilters.trainingType === 'online' ? "default" : "outline"}
                          size="sm"
                          onClick={() => onTrainerFilterChange('trainingType', 
                            trainerFilters.trainingType === 'online' ? null : 'online'
                          )}
                          className={trainerFilters.trainingType === 'online' ? 'bg-brand text-brand-foreground' : ''}
                        >
                          Online
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Program Filters */}
                {activeContent === 'programas' && (
                  <>
                    {/* Level Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Nível</Label>
                      <Popover 
                        open={openPopovers.level || false} 
                        onOpenChange={(open) => onPopoverChange('level', open)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {programFilters.level}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandList>
                              <CommandGroup>
                                {levels.map((level) => (
                                  <CommandItem
                                    key={level}
                                    onSelect={() => {
                                      onProgramFilterChange('level', level);
                                      closePopover('level');
                                    }}
                                  >
                                    {level}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Duration Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Duração</Label>
                      <Popover 
                        open={openPopovers.duration || false} 
                        onOpenChange={(open) => onPopoverChange('duration', open)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {programFilters.duration}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandList>
                              <CommandGroup>
                                {durations.map((duration) => (
                                  <CommandItem
                                    key={duration}
                                    onSelect={() => {
                                      onProgramFilterChange('duration', duration);
                                      closePopover('duration');
                                    }}
                                  >
                                    {duration}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Program Rating Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Avaliação mínima</Label>
                      <div className="space-y-4">
                        <Slider
                          value={[programFilters.minRating]}
                          onValueChange={([value]) => onProgramFilterChange('minRating', value)}
                          max={5}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-center">
                          {renderStars(programFilters.minRating)}
                        </div>
                      </div>
                    </div>

                    {/* Program Price Range */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Faixa de preço</Label>
                      <div className="space-y-4">
                        <Slider
                          value={programFilters.priceRange}
                          onValueChange={(value) => onProgramFilterChange('priceRange', value as [number, number])}
                          min={50}
                          max={1000}
                          step={25}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>R$ {programFilters.priceRange[0]}</span>
                          <span>R$ {programFilters.priceRange[1]}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <DrawerFooter className="pt-4">
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={activeContent === 'treinadores' ? clearTrainerFilters : clearProgramFilters}
                    className="flex-1"
                  >
                    Limpar filtros
                  </Button>
                  <DrawerClose asChild>
                    <Button className="flex-1 bg-brand text-brand-foreground">
                      Aplicar filtros
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Sort Dropdown */}
          <Popover 
            open={openPopovers.sort || false} 
            onOpenChange={(open) => onPopoverChange('sort', open)}
          >
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                Ordenar
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {[
                      { value: 'relevante', label: 'Mais relevante' },
                      { value: 'avaliacao', label: 'Melhor avaliado' },
                      { value: 'menor-preco', label: 'Menor preço' },
                      { value: 'maior-preco', label: 'Maior preço' },
                      { value: 'proximo', label: 'Mais próximo' },
                      { value: 'recente', label: 'Mais recente' }
                    ].map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          onSortChange(option.value as SortOption);
                          closePopover('sort');
                        }}
                      >
                        {option.label}
                        {sortBy === option.value && (
                          <div className="ml-auto h-4 w-4 text-brand">✓</div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Active Filters Display */}
          {((activeContent === 'treinadores' && hasActiveTrainerFilters) || 
            (activeContent === 'programas' && hasActiveProgramFilters)) && (
            <div className="flex items-center gap-2 pl-2 border-l">
              <span className="text-sm text-gray-600">Filtros ativos:</span>
              <Badge variant="outline" className="text-xs">
                {getActiveFiltersCount()} aplicado{getActiveFiltersCount() > 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}