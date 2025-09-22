import { useState, useEffect } from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { Label } from './label';
import { Plus, X, Search, MapPin } from 'lucide-react';
import { ScrollArea } from './scroll-area';

interface City {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
        nome: string;
      };
    };
  };
}

interface CitySelectorProps {
  selectedCities: string[];
  onCitiesChange: (cities: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
}

export function CitySelector({ 
  selectedCities, 
  onCitiesChange, 
  maxSelections = 10,
  placeholder = "Buscar cidade..." 
}: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = async (query: string) => {
    if (query.length < 2) {
      setCities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Usando a API do IBGE para cidades brasileiras
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/municipios`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cidades');
      }
      
      const allCities: City[] = await response.json();
      
      // Filtrar cidades que contêm o termo de busca
      const filteredCities = allCities
        .filter(city => 
          city.nome.toLowerCase().includes(query.toLowerCase()) &&
          !selectedCities.includes(`${city.nome}, ${city.microrregiao.mesorregiao.UF.sigla}`)
        )
        .slice(0, 20) // Limitar a 20 resultados
        .sort((a, b) => a.nome.localeCompare(b.nome));
      
      setCities(filteredCities);
    } catch (err) {
      setError('Erro ao carregar cidades. Tente novamente.');
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && searchTerm) {
      const timeoutId = setTimeout(() => {
        fetchCities(searchTerm);
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timeoutId);
    } else {
      setCities([]);
    }
  }, [searchTerm, isOpen, selectedCities]);

  const handleAddCity = (city: City) => {
    const cityString = `${city.nome}, ${city.microrregiao.mesorregiao.UF.sigla}`;
    if (selectedCities.length < maxSelections && !selectedCities.includes(cityString)) {
      onCitiesChange([...selectedCities, cityString]);
      setSearchTerm('');
      setCities([]);
    }
  };

  const handleRemoveCity = (cityToRemove: string) => {
    onCitiesChange(selectedCities.filter(city => city !== cityToRemove));
  };

  return (
    <div className="space-y-3">
      {/* Selected Cities */}
      <div className="flex flex-wrap gap-2">
        {selectedCities.map((city) => (
          <Badge 
            key={city} 
            variant="secondary" 
            className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-secondary/80 transition-colors"
          >
            <MapPin className="w-3 h-3" />
            <span>{city}</span>
            <X 
              className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors" 
              onClick={() => handleRemoveCity(city)}
            />
          </Badge>
        ))}
      </div>

      {/* Add New City */}
      {!isOpen ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => setIsOpen(true)}
          disabled={selectedCities.length >= maxSelections}
        >
          <Plus className="h-4 w-4 mr-2" />
          {selectedCities.length >= maxSelections 
            ? `Máximo de ${maxSelections} cidades` 
            : 'Adicionar Cidade'
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

          {loading && (
            <div className="text-center py-4">
              <div className="text-sm text-muted-foreground">Carregando cidades...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-4">
              <div className="text-sm text-red-500">{error}</div>
            </div>
          )}

          {!loading && !error && cities.length > 0 && (
            <ScrollArea className="h-48">
              <div className="space-y-1">
                {cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleAddCity(city)}
                    className="flex items-center gap-3 p-2 text-left hover:bg-accent rounded-md transition-colors text-sm w-full"
                  >
                    <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{city.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {city.microrregiao.mesorregiao.UF.nome} ({city.microrregiao.mesorregiao.UF.sigla})
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          {!loading && !error && searchTerm && cities.length === 0 && searchTerm.length >= 2 && (
            <div className="text-center py-4">
              <div className="text-sm text-muted-foreground">
                Nenhuma cidade encontrada para "{searchTerm}"
              </div>
            </div>
          )}

          {!loading && !error && searchTerm && searchTerm.length < 2 && (
            <div className="text-center py-4">
              <div className="text-sm text-muted-foreground">
                Digite pelo menos 2 caracteres para buscar
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsOpen(false);
                setSearchTerm('');
                setCities([]);
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {selectedCities.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedCities.length}/{maxSelections} cidades selecionadas
        </p>
      )}
    </div>
  );
}