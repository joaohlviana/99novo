import { useState } from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { Label } from './label';
import { Plus, X, Search } from 'lucide-react';
import { adjustedSportsIcons, getSportIcon, sportsCategories } from '../../lib/sports-icons';
import { SportIcon } from './sport-icon';

interface SportSelectorProps {
  selectedSports: string[];
  onSportsChange: (sports: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
}

export function SportSelector({ 
  selectedSports, 
  onSportsChange, 
  maxSelections = 10,
  placeholder = "Buscar modalidade..." 
}: SportSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const allSports = sportsCategories.map(sport => sport.label);
  const filteredSports = allSports.filter(sport => 
    sport.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedSports.includes(sport)
  );

  const handleAddSport = (sport: string) => {
    if (selectedSports.length < maxSelections && !selectedSports.includes(sport)) {
      onSportsChange([...selectedSports, sport]);
      setSearchTerm('');
    }
  };

  const handleRemoveSport = (sport: string) => {
    onSportsChange(selectedSports.filter(s => s !== sport));
  };

  return (
    <div className="space-y-3">
      {/* Selected Sports */}
      <div className="flex flex-wrap gap-2">
        {selectedSports.map((sport) => {
          return (
            <Badge 
              key={sport} 
              variant="secondary" 
              className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary/80 transition-colors bg-gray-100 text-gray-700 border-gray-200"
            >
              <SportIcon 
                sportName={sport}
                size="sm"
                grayscale={true}
                opacity={0.8}
              />
              <span>{sport}</span>
              <X 
                className="h-4 w-4 cursor-pointer hover:text-red-500 transition-colors ml-1" 
                onClick={() => handleRemoveSport(sport)}
              />
            </Badge>
          );
        })}
      </div>

      {/* Add New Sport */}
      {!isOpen ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => setIsOpen(true)}
          disabled={selectedSports.length >= maxSelections}
        >
          <Plus className="h-4 w-4 mr-2" />
          {selectedSports.length >= maxSelections 
            ? `Máximo de ${maxSelections} modalidades` 
            : 'Adicionar Modalidade'
          }
        </Button>
      ) : (
        <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="pl-10 h-9"
              autoFocus
            />
          </div>

          {filteredSports.length > 0 ? (
            <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
              {filteredSports.slice(0, 10).map((sport) => {
                return (
                  <button
                    key={sport}
                    onClick={() => handleAddSport(sport)}
                    className="flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors text-sm"
                  >
                    <SportIcon 
                      sportName={sport}
                      size="lg"
                      grayscale={true}
                      opacity={0.7}
                    />
                    <span className="text-gray-700">{sport}</span>
                  </button>
                );
              })}
            </div>
          ) : searchTerm ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma modalidade encontrada para "{searchTerm}"
            </p>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Digite para buscar modalidades
            </p>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsOpen(false);
                setSearchTerm('');
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {selectedSports.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedSports.length}/{maxSelections} modalidades selecionadas
        </p>
      )}
    </div>
  );
}