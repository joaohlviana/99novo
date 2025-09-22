import { useState } from 'react';
import { Button } from './ui/button';
import { ProgramFilters } from './ProgramFilters';
import { ProgramsGrid } from './ProgramsGrid';
import { programsCatalog } from '../data/programs-catalog-data';

export function FiltersDemo({ onNavigateBack }: { onNavigateBack?: () => void }) {
  const [programFilters, setProgramFilters] = useState({
    city: 'Todas as cidades',
    rating: 0,
    priceRange: [0, 500] as [number, number],
    location: 'todos',
    period: 'todos',
    category: 'Todas as categorias',
    level: 'todos'
  });

  // Função para filtrar programas
  const filteredPrograms = programsCatalog.filter(program => {
    // Filtro por cidade
    if (programFilters.city !== 'Todas as cidades') {
      if (program.city !== programFilters.city) return false;
    }

    // Filtro por avaliação mínima
    if (program.trainer.rating < programFilters.rating) return false;

    // Filtro por faixa de preço
    const priceMatch = program.price.match(/\d+/);
    if (priceMatch) {
      const price = parseInt(priceMatch[0]);
      if (price < programFilters.priceRange[0] || price > programFilters.priceRange[1]) return false;
    }

    // Filtro por localização
    if (programFilters.location !== 'todos' && program.location !== programFilters.location) {
      return false;
    }

    // Filtro por período
    if (programFilters.period !== 'todos' && program.period !== programFilters.period) {
      return false;
    }

    // Filtro por categoria
    if (programFilters.category !== 'Todas as categorias' && program.category !== programFilters.category) {
      return false;
    }

    // Filtro por nível
    if (programFilters.level !== 'todos' && program.level !== programFilters.level) {
      return false;
    }

    return true;
  });

  const clearProgramFilters = () => {
    setProgramFilters({
      city: 'Todas as cidades',
      rating: 0,
      priceRange: [0, 500],
      location: 'todos',
      period: 'todos',
      category: 'Todas as categorias',
      level: 'todos'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Demonstração dos Filtros Modernos
            </h1>
            {onNavigateBack && (
              <Button variant="outline" onClick={onNavigateBack}>
                ← Voltar
              </Button>
            )}
          </div>
          <p className="text-gray-600">
            Filtros com glass morphism e layout horizontal responsivo
          </p>
        </div>

        {/* Filtros */}
        <div className="glass-card rounded-2xl p-6 shadow-xl mb-8">
          <ProgramFilters 
            filters={programFilters}
            onFilterChange={(key, value) => {
              setProgramFilters(prev => ({ ...prev, [key]: value }));
            }}
            onClearFilters={clearProgramFilters}
          />
        </div>

        {/* Resultados */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Resultados da Busca
            </h2>
            <div className="text-sm text-gray-600">
              {filteredPrograms.length} programas encontrados
            </div>
          </div>
        </div>

        {/* Grid de Programas */}
        <ProgramsGrid 
          programs={filteredPrograms}
          onNavigateToProgram={(programId) => {
            console.log('Navigate to program:', programId);
          }}
        />

        {/* Stats dos Filtros */}
        <div className="mt-12 glass-card rounded-2xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Estado dos Filtros</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Cidade:</span>
              <div className="font-medium">{programFilters.city}</div>
            </div>
            <div>
              <span className="text-gray-600">Categoria:</span>
              <div className="font-medium">{programFilters.category}</div>
            </div>
            <div>
              <span className="text-gray-600">Avaliação:</span>
              <div className="font-medium">
                {programFilters.rating > 0 ? `${programFilters.rating}.0+` : 'Qualquer'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Preço:</span>
              <div className="font-medium">
                R$ {programFilters.priceRange[0]} - R$ {programFilters.priceRange[1]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}