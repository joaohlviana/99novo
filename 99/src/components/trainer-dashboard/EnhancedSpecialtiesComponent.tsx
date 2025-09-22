import React, { useState, useCallback } from 'react';
import { 
  Award, 
  Plus, 
  X, 
  MapPin, 
  Globe,
  Users,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Target,
  Settings,
  Star,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { getSportIcon, getAllSportNames, sportCategories } from '../../data/sports-icons';

// Badge de especialidade com ícone
const SpecialtyBadge = ({ specialty, onRemove, onEdit }: { 
  specialty: string, 
  onRemove: () => void,
  onEdit: () => void 
}) => {
  const sportIcon = getSportIcon(specialty);
  
  return (
    <div className="group relative bg-gradient-to-r from-[#e0093e]/5 to-[#e0093e]/10 border border-[#e0093e]/20 rounded-xl p-3 hover:from-[#e0093e]/10 hover:to-[#e0093e]/15 transition-all duration-200">
      <div className="flex items-center gap-3">
        {/* Sport Icon */}
        <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center shadow-sm">
          {sportIcon ? (
            <img src={sportIcon} alt={specialty} className="w-5 h-5" />
          ) : (
            <Award className="w-4 h-4 text-[#e0093e]" />
          )}
        </div>
        
        {/* Sport Name */}
        <div className="flex-1">
          <span className="text-sm font-medium text-foreground">{specialty}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-[#e0093e]/10 hover:text-[#e0093e]"
            onClick={onEdit}
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-500"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>


    </div>
  );
};

// Modal para sugerir novo esporte com busca inteligente e fluxo de sugestão
const SuggestSportModal = ({ isOpen, onClose, onSubmit }: {
  isOpen: boolean,
  onClose: () => void,
  onSubmit: (sport: string) => Promise<void>
}) => {
  const [sportName, setSportName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSuggestionMode, setIsSuggestionMode] = useState(false);

  // Obter todos os esportes disponíveis
  const allAvailableSports = getAllSportNames();
  
  // Filtrar esportes baseado na busca e categoria
  const filteredSports = allAvailableSports.filter(sport => {
    const matchesSearch = sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      Object.entries(sportCategories).some(([cat, sports]) => 
        cat === selectedCategory && sports.includes(sport)
      );
    return matchesSearch && matchesCategory;
  });

  // Detectar quando não há resultados e ativar modo sugestão
  const hasNoResults = searchTerm.length >= 3 && filteredSports.length === 0;

  const handleSubmit = async () => {
    if (!sportName.trim()) return;
    
    setIsSubmitting(true);
    await onSubmit(sportName.trim());
    setSportName('');
    setSearchTerm('');
    setSelectedCategory('all');
    setIsSuggestionMode(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleSportSelect = (sport: string) => {
    setSportName(sport);
    setIsSuggestionMode(false);
  };

  const handleSuggestionActivate = () => {
    setSportName(searchTerm);
    setIsSuggestionMode(true);
  };

  const clearSuggestion = () => {
    setSportName('');
    setIsSuggestionMode(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Adicionar Especialidade</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Campo de esporte personalizado */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Nome da Especialidade
          </label>
          <div className="relative">
            <Input
              value={sportName}
              onChange={(e) => setSportName(e.target.value)}
              placeholder="Digite o nome da especialidade..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              className={isSuggestionMode ? 'bg-blue-50 border-blue-300' : ''}
            />
            {isSuggestionMode && (
              <button
                onClick={clearSuggestion}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {isSuggestionMode && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700">
                Modo sugestão ativo - Este esporte será adicionado como nova modalidade
              </span>
            </div>
          )}
        </div>

        {/* Busca e filtros */}
        <div className="mb-4">
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar especialidades..."
                className="w-full"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            >
              <option value="all">Todas Categorias</option>
              {Object.keys(sportCategories).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Banner de sugestão quando não há resultados */}
        {hasNoResults && !isSuggestionMode && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Search className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Esporte "{searchTerm}" não encontrado
                </p>
                <p className="text-xs text-blue-700">
                  Que tal sugerir esta nova modalidade?
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSuggestionActivate}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Sugerir
              </Button>
            </div>
          </div>
        )}

        {/* Lista de esportes disponíveis */}
        {!hasNoResults && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Especialidades Disponíveis ({filteredSports.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {filteredSports.map((sport) => {
                const sportIcon = getSportIcon(sport);
                return (
                  <button
                    key={sport}
                    onClick={() => handleSportSelect(sport)}
                    className={`
                      flex items-center gap-2 p-3 text-left rounded-lg border transition-colors
                      ${sportName === sport
                        ? 'border-[#e0093e] bg-[#e0093e]/5 text-[#e0093e]'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {sportIcon ? (
                      <img 
                        src={sportIcon} 
                        alt={sport}
                        className="w-4 h-4 object-contain"
                      />
                    ) : (
                      <Award className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium">{sport}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!sportName.trim() || isSubmitting}
            className={isSuggestionMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#e0093e] hover:bg-[#c0082e]'}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {isSuggestionMode ? 'Sugerir Especialidade' : 'Adicionar Especialidade'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Modal para buscar cidades por distância
const CitySearchModal = ({ isOpen, onClose, onCitiesAdd }: {
  isOpen: boolean,
  onClose: () => void,
  onCitiesAdd: (cities: string[]) => void
}) => {
  const [baseCity, setBaseCity] = useState('');
  const [distance, setDistance] = useState('20');
  const [isSearching, setIsSearching] = useState(false);
  const [foundCities, setFoundCities] = useState<{name: string, distance: number}[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Simulação de API de busca de cidades
  const searchCitiesByDistance = async (city: string, km: string) => {
    setIsSearching(true);
    setError('');
    
    // Simulação de delay da API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data baseado na cidade
    const mockCities: Record<string, {name: string, distance: number}[]> = {
      'londrina': [
        { name: 'Cambé', distance: 8 },
        { name: 'Ibiporã', distance: 12 },
        { name: 'Rolândia', distance: 18 },
        { name: 'Arapongas', distance: 19 },
        { name: 'Apucarana', distance: 35 },
        { name: 'Maringá', distance: 45 }
      ],
      'são paulo': [
        { name: 'Guarulhos', distance: 15 },
        { name: 'São Caetano do Sul', distance: 10 },
        { name: 'Santo André', distance: 18 },
        { name: 'Osasco', distance: 16 },
        { name: 'Diadema', distance: 20 }
      ],
      'rio de janeiro': [
        { name: 'Niterói', distance: 13 },
        { name: 'São Gonçalo', distance: 22 },
        { name: 'Nova Iguaçu', distance: 28 },
        { name: 'Duque de Caxias', distance: 17 },
        { name: 'Belford Roxo', distance: 35 }
      ]
    };
    
    const cityKey = city.toLowerCase();
    const allCities = mockCities[cityKey] || [];
    const citiesInRange = allCities.filter(c => c.distance <= parseInt(km));
    
    if (citiesInRange.length === 0) {
      setError(`Nenhuma cidade encontrada num raio de ${km}km de ${city}`);
    }
    
    setFoundCities(citiesInRange);
    setIsSearching(false);
  };

  const handleSearch = () => {
    if (!baseCity.trim()) return;
    searchCitiesByDistance(baseCity, distance);
  };

  const toggleCitySelection = (city: {name: string, distance: number}) => {
    setSelectedCities(prev => 
      prev.includes(city.name)
        ? prev.filter(c => c !== city.name)
        : [...prev, city.name]
    );
  };

  const handleAddCities = () => {
    onCitiesAdd(selectedCities);
    onClose();
  };

  const resetModal = () => {
    setBaseCity('');
    setDistance('20');
    setFoundCities([]);
    setSelectedCities([]);
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Buscar Cidades por Distância</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Cidade Base
              </label>
              <Input
                value={baseCity}
                onChange={(e) => setBaseCity(e.target.value)}
                placeholder="Ex: Londrina"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Distância (km)
              </label>
              <Input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                min="1"
                max="100"
                placeholder="20"
              />
            </div>
          </div>
          
          <Button
            onClick={handleSearch}
            disabled={!baseCity.trim() || isSearching}
            className="w-full bg-[#e0093e] hover:bg-[#c0082e]"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Buscar Cidades
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {foundCities.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-3">
              Cidades encontradas ({foundCities.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {foundCities.map((city) => (
                <div
                  key={city.name}
                  className={`
                    flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors
                    ${selectedCities.includes(city.name)
                      ? 'border-[#e0093e] bg-[#e0093e]/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => toggleCitySelection(city)}
                >
                  <div className="flex items-center gap-2">
                    {selectedCities.includes(city.name) && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <div>
                      <span className="font-medium">{city.name}</span>
                      <p className="text-xs text-gray-500">{city.distance}km de distância</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedCities.length > 0 && (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddCities}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar {selectedCities.length} cidade{selectedCities.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Seletor de modalidades simples
const ServiceModeSelector = ({ selectedModes, onModesChange }: {
  selectedModes: string[],
  onModesChange: (modes: string[]) => void
}) => {
  const modes = [
    { value: 'online', label: 'Online', icon: <Globe className="h-4 w-4" /> },
    { value: 'presencial', label: 'Presencial', icon: <MapPin className="h-4 w-4" /> },
    { value: 'hibrido', label: 'Híbrido', icon: <Users className="h-4 w-4" /> }
  ];

  const toggleMode = useCallback((mode: string) => {
    const newModes = selectedModes.includes(mode)
      ? selectedModes.filter(m => m !== mode)
      : [...selectedModes, mode];
    onModesChange(newModes);
  }, [selectedModes, onModesChange]);

  return (
    <div className="space-y-2">
      {modes.map((mode) => {
        const isSelected = selectedModes.includes(mode.value);
        return (
          <button
            key={mode.value}
            onClick={() => toggleMode(mode.value)}
            className={`
              w-full flex items-center gap-3 p-3 rounded-md border transition-colors text-left
              ${isSelected
                ? 'border-[#e0093e] bg-[#e0093e]/5'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className={`${isSelected ? 'text-[#e0093e]' : 'text-gray-500'}`}>
              {mode.icon}
            </div>
            <span className="font-medium">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// Componente principal aprimorado
export const EnhancedSpecialtiesComponent = ({ 
  profileData, 
  setProfileData 
}: {
  profileData: any,
  setProfileData: (updater: (prev: any) => any) => void
}) => {
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showCitySearchModal, setShowCitySearchModal] = useState(false);

  const [sportsOptions, setSportsOptions] = useState(getAllSportNames());

  const availableSports = sportsOptions.filter(sport => 
    !profileData.specialties.includes(sport)
  );

  const addSpecialty = useCallback((specialty: string) => {
    if (profileData.specialties.length < 8) {
      setProfileData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }));
    }
  }, [profileData.specialties.length, setProfileData]);

  const removeSpecialty = useCallback((index: number) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_: any, i: number) => i !== index)
    }));
  }, [setProfileData]);

  const handleSuggestSport = useCallback(async (sportName: string) => {
    if (!sportsOptions.includes(sportName)) {
      setSportsOptions(prev => [...prev, sportName]);
      addSpecialty(sportName);
    } else {
      addSpecialty(sportName);
    }
  }, [sportsOptions, addSpecialty]);

  const handleAddCities = useCallback((newCities: string[]) => {
    const uniqueCities = newCities.filter(city => 
      !profileData.cities.includes(city)
    );
    
    if (uniqueCities.length > 0) {
      setProfileData(prev => ({
        ...prev,
        cities: [...prev.cities, ...uniqueCities].slice(0, 10) // Limite de 10 cidades
      }));
    }
  }, [profileData.cities, setProfileData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Especialidades */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#e0093e]" />
              Especialidades
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setShowSuggestModal(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Adicionar
            </Button>
          </div>

          {/* Current Specialties with Action Buttons */}
          <div className="space-y-3">
            {profileData.specialties.map((specialty: string, index: number) => (
              <SpecialtyBadge
                key={index}
                specialty={specialty}
                onEdit={() => {
                  console.log('Edit specialty:', specialty);
                  // Add edit specialty logic
                }}
                onRemove={() => removeSpecialty(index)}
              />
            ))}
            
            {profileData.specialties.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-xl">
                <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">Nenhuma especialidade adicionada</p>
                <p className="text-xs text-muted-foreground">
                  Adicione suas modalidades para atrair o público certo
                </p>
              </div>
            )}
          </div>

          {/* Quick Add Section */}
          <div className="pt-3 border-t">
            <Label className="text-xs text-muted-foreground mb-2 block">Adicionar rapidamente:</Label>
            <div className="flex flex-wrap gap-2">
              {availableSports.slice(0, 6).map((sport) => {
                const sportIcon = getSportIcon(sport);
                return (
                  <Button
                    key={sport}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs hover:bg-[#e0093e]/10 hover:border-[#e0093e]/30"
                    onClick={() => addSpecialty(sport)}
                    disabled={profileData.specialties.length >= 8}
                  >
                    {sportIcon && (
                      <img src={sportIcon} alt={sport} className="w-3 h-3 mr-1" />
                    )}
                    {sport}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Especialidades ativas:</span>
              <span className="font-medium text-[#e0093e]">
                {profileData.specialties.length}/8
              </span>
            </div>
            {profileData.specialties.length >= 6 && (
              <div className="mt-2 flex items-start gap-2">
                <TrendingUp className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Considere focar em menos modalidades para se destacar como especialista
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modalidades & Cidades */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label className="mb-3 block">Modalidades de Atendimento</Label>
            <ServiceModeSelector
              selectedModes={profileData.modalities}
              onModesChange={(newModes) => {
                const newCities = newModes.includes('presencial') 
                  ? profileData.cities 
                  : [];
                
                setProfileData(prev => ({ 
                  ...prev, 
                  modalities: newModes,
                  cities: newCities
                }));
              }}
            />
          </div>

          {profileData.modalities.includes('presencial') && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <Label>Cidades de Atendimento</Label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-gray-500"
                    onClick={() => setShowCitySearchModal(true)}
                  >
                    <Search className="h-3 w-3 mr-1" />
                    Buscar por KM
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                {profileData.cities.map((city: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md group hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span className="text-sm">{city}</span>
                    </div>
                    <button
                      onClick={() => {
                        setProfileData(prev => ({
                          ...prev,
                          cities: prev.cities.filter((_: any, i: number) => i !== index)
                        }));
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {profileData.cities.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {profileData.cities.length}/10 cidades
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <SuggestSportModal
        isOpen={showSuggestModal}
        onClose={() => setShowSuggestModal(false)}
        onSubmit={handleSuggestSport}
      />

      <CitySearchModal
        isOpen={showCitySearchModal}
        onClose={() => setShowCitySearchModal(false)}
        onCitiesAdd={handleAddCities}
      />
    </div>
  );
};

export default EnhancedSpecialtiesComponent;