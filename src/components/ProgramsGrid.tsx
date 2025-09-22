import { useState } from 'react';
import { ProgramCard } from './ProgramCard';
import { ProgramCatalog } from '../data/programs-catalog-data';
import { Button } from './ui/button';
import { Grid3X3, List } from 'lucide-react';

interface ProgramsGridProps {
  programs: ProgramCatalog[];
  onNavigateToProgram?: (programId: string) => void;
}

export function ProgramsGrid({ programs, onNavigateToProgram }: ProgramsGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-6">
      {/* Header com contagem e toggle de visualização */}


      {/* Grid de programas */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {programs.map((program) => (
          <ProgramCard 
            key={program.id} 
            program={program}
            onNavigateToProgram={onNavigateToProgram}
          />
        ))}
      </div>

      {/* Estado vazio */}
      {programs.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum programa encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros para encontrar programas que atendam seus critérios.
          </p>
        </div>
      )}
    </div>
  );
}