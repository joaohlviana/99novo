import React, { memo, useCallback, useMemo } from 'react';
import { TrainerFilters, FilterState } from './TrainerFilters';
import { ProgramFilters } from './ProgramFilters';
import { Button } from './ui/button';
import { Filter, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { usePersistentFilters } from '../hooks/usePersistentFilters';  
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

interface OptimizedFiltersProps {
  contentType: 'trainers' | 'programs';
  trainerFilters: FilterState;
  programFilters: any;
  onTrainerFiltersChange: (filters: FilterState) => void;
  onProgramFiltersChange: (filters: any) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  activeFilterTab?: number | null;
  onActiveTabChange?: (tab: number | null) => void;
}

// 🚀 FASE 4: Sistema de filtros otimizado com debounce e persistência
const OptimizedFilters = memo<OptimizedFiltersProps>(({
  contentType,
  trainerFilters,
  programFilters,
  onTrainerFiltersChange,
  onProgramFiltersChange,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  onClearFilters,
  activeFilterTab,
  onActiveTabChange
}) => {
  // 🎯 Hooks de otimização individuais
  
  // 🎯 Performance monitoring
  const { start, end } = usePerformanceMonitor('Filtros');

  // ⏱️ Debounce para filtros de treinadores
  const debouncedTrainerFilters = useDebounce(trainerFilters, 300);
  
  // ⏱️ Debounce para filtros de programas  
  const debouncedProgramFilters = useDebounce(programFilters, 300);

  // 💾 Persistir filtros no localStorage
  const [persistedFilters, setPersistenFilters] = usePersistentFilters(
    `catalog-filters-${contentType}`,
    contentType === 'trainers' ? trainerFilters : programFilters
  );

  // 🎯 Handler otimizado para mudança de filtros de treinadores
  const handleTrainerFiltersChange = useCallback((newFilters: FilterState) => {
    start();
    onTrainerFiltersChange(newFilters);
    setPersistenFilters(newFilters);
    end();
  }, [onTrainerFiltersChange, setPersistenFilters, start, end]);

  // 🎯 Handler otimizado para mudança de filtros de programas
  const handleProgramFiltersChange = useCallback((newFilters: any) => {
    start();
    onProgramFiltersChange(newFilters);
    setPersistenFilters(newFilters);
    end();
  }, [onProgramFiltersChange, setPersistenFilters, start, end]);

  // 🧮 Contagem de filtros ativos memoizada
  const activeFiltersCount = useMemo(() => {
    if (contentType === 'trainers') {
      let count = 0;
      if (trainerFilters.city !== 'Todas as cidades') count++;
      if (trainerFilters.minRating > 0) count++;
      if (trainerFilters.priceRange[0] > 20 || trainerFilters.priceRange[1] < 500) count++;
      if (trainerFilters.trainingType !== 'all') count++;
      return count;
    } else {
      let count = 0;
      if (programFilters.city !== 'Todas as cidades') count++;
      if (programFilters.rating > 0) count++;
      if (programFilters.priceRange[0] > 0 || programFilters.priceRange[1] < 500) count++;
      if (programFilters.location !== 'todos') count++;
      if (programFilters.period !== 'todos') count++;
      if (programFilters.category !== 'Todas as categorias') count++;
      if (programFilters.level !== 'todos') count++;
      return count;
    }
  }, [contentType, trainerFilters, programFilters]);

  // 🎯 Handler para restaurar filtros persistidos
  const handleRestoreFilters = useCallback(() => {
    if (contentType === 'trainers') {
      onTrainerFiltersChange(persistedFilters);
    } else {
      onProgramFiltersChange(persistedFilters);
    }
  }, [contentType, persistedFilters, onTrainerFiltersChange, onProgramFiltersChange]);

  return (
    <div className="filters-container">
      {/* 🎛️ Controles de filtro */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-3">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={onToggleFilters}
            className="flex items-center gap-2 relative"
          >
            <Filter className="w-4 h-4" />
            Filtros
            
            {/* 🔴 Badge de filtros ativos */}
            {hasActiveFilters && (
              <span className="ml-1 min-w-[1.25rem] h-5 bg-brand text-brand-foreground text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* 🧹 Botão de limpar filtros */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Limpar filtros
            </Button>
          )}

          {/* 📦 Botão para restaurar filtros salvos */}
          {persistedFilters && Object.keys(persistedFilters).length > 0 && (
            <Button
              variant="outline"
              onClick={handleRestoreFilters}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Restaurar filtros salvos
            </Button>
          )}
        </div>
      </div>

      {/* 🎛️ Painel de filtros */}
      {showFilters && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 animate-in slide-in-from-top-2 duration-200">
          {contentType === 'trainers' ? (
            <TrainerFilters
              filters={trainerFilters}
              onFiltersChange={handleTrainerFiltersChange}
              activeTab={activeFilterTab}
              onActiveTabChange={onActiveTabChange}
            />
          ) : (
            <ProgramFilters
              filters={programFilters}
              onFiltersChange={handleProgramFiltersChange}
            />
          )}

          {/* 📊 Status de performance (apenas em dev) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
              🔍 FASE 4: Filtros otimizados com debounce (300ms) • {activeFiltersCount} filtros ativos
            </div>
          )}
        </div>
      )}
    </div>
  );
});

OptimizedFilters.displayName = 'OptimizedFilters';

export { OptimizedFilters };