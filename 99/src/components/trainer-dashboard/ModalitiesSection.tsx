import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Monitor, MapPin, Globe, Search, Plus, X, Check } from 'lucide-react';

/** =========================
 *  CONFIG
 *  ========================= */
const GEOAPIFY_API_KEY =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GEOAPIFY_API_KEY) ||
  '5973183a2c394656bb1d7518cb3980fd';

/** =========================
 *  NORMALIZAÇÃO & DEDUP
 *  ========================= */
function normalizeStr(s?: string) {
  if (!s) return '';
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function cityKey(name?: string, state?: string, lat?: number, lon?: number) {
  const n = normalizeStr(name);
  const uf = normalizeStr(state);
  if (n && uf) return `${n}|${uf}`;
  if (n) return n;
  if (typeof lat === 'number' && typeof lon === 'number') {
    return `@${lat.toFixed(2)},${lon.toFixed(2)}`;
  }
  return '';
}

/** =========================
 *  HELPERS DE API (Geoapify)
 *  ========================= */
async function geoapifyAutocompleteCities(term: string) {
  if (!term?.trim()) return [];
  
  const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete');
  url.searchParams.set('text', term);
  url.searchParams.set('type', 'city');
  url.searchParams.set('filter', 'countrycode:br');
  url.searchParams.set('limit', '10');
  url.searchParams.set('lang', 'pt');
  url.searchParams.set('format', 'json');
  url.searchParams.set('apiKey', GEOAPIFY_API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Falha no autocomplete');
  const data = await res.json();

  const results = (data?.results || [])
    .map((r: any) => ({
      name: r.city || r.name,
      state: r.state,
      country: r.country,
      lat: r.lat,
      lon: r.lon,
      place_id: r.place_id,
      displayName: `${r.city || r.name}${r.state ? ` - ${r.state}` : ''}`
    }))
    .filter((c: any) => c.name);

  return results;
}

async function geoapifyGeocodeCity(cityName: string) {
  if (!cityName?.trim()) return null;
  
  const url = new URL('https://api.geoapify.com/v1/geocode/search');
  url.searchParams.set('text', cityName);
  url.searchParams.set('type', 'city');
  url.searchParams.set('filter', 'countrycode:br');
  url.searchParams.set('limit', '1');
  url.searchParams.set('lang', 'pt');
  url.searchParams.set('apiKey', GEOAPIFY_API_KEY);
  
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Falha no geocoding');
  const data = await res.json();
  
  const result = data?.features?.[0];
  if (!result) return null;
  
  return {
    name: result.properties.city || result.properties.name,
    state: result.properties.state,
    country: result.properties.country,
    lat: result.geometry.coordinates[1],
    lon: result.geometry.coordinates[0],
    place_id: result.properties.place_id,
    displayName: `${result.properties.city || result.properties.name}${result.properties.state ? ` - ${result.properties.state}` : ''}`
  };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function geoapifyNearbyCitiesByRadius(lon: number, lat: number, distanceKm: number, limit = 80) {
  const radiusMeters = Math.max(1000, Math.floor(distanceKm * 1000));

  const url = new URL('https://api.geoapify.com/v2/places');
  url.searchParams.set('categories', 'populated_place.city,populated_place.town,populated_place.village');
  url.searchParams.set('filter', `circle:${lon},${lat},${radiusMeters}`);
  url.searchParams.set('bias', `proximity:${lon},${lat}`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('lang', 'pt');
  url.searchParams.set('apiKey', GEOAPIFY_API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Falha ao buscar cidades próximas');
  const data = await res.json();

  const features = data?.features || [];

  const invalidPatterns = [
    /shopping|mall|centro|hospital|escola|igreja|posto|farmácia|supermercado/i,
    /^rua |^av |^avenida |^estrada |^rodovia /i,
    /\d{5}-\d{3}/,
    /km \d+/i
  ];

  const normalized = features
    .map((feature: any) => {
      const props = feature.properties || {};
      let name = (props.city || props.name || props.address_line1 || '').trim();
      if (!name || typeof name !== 'string') return null;
      if (name.length < 2 || name.length > 50) return null;
      if (invalidPatterns.some((p) => p.test(name))) return null;

      let state = props.state || props.state_code;
      const coords = feature.geometry?.coordinates;
      if (!coords || coords.length < 2) return null;

      const [featureLon, featureLat] = coords;
      const distance = calculateDistance(lat, lon, featureLat, featureLon);

      return {
        name,
        state,
        displayName: state ? `${name} - ${state}` : name,
        lat: featureLat,
        lon: featureLon,
        distance_km: Math.round(distance * 10) / 10,
        place_id: props.place_id || `${featureLat}_${featureLon}`
      };
    })
    .filter(Boolean) as Array<{
      name: string;
      state?: string;
      displayName: string;
      lat: number;
      lon: number;
      distance_km: number;
      place_id: string;
    }>;

  const byKey = new Map<string, typeof normalized[number]>();
  for (const c of normalized) {
    const k = cityKey(c.name, c.state, c.lat, c.lon);
    if (!k) continue;
    const prev = byKey.get(k);
    if (!prev || (c.distance_km ?? Infinity) < (prev.distance_km ?? Infinity)) {
      byKey.set(k, c);
    }
  }

  const unique = Array.from(byKey.values()).sort(
    (a, b) => (a.distance_km ?? 1e9) - (b.distance_km ?? 1e9)
  );

  return unique;
}

/** =========================
 *  INTERFACES
 *  ========================= */
interface CardProps {
  title: string;
  content: React.ReactNode;
  className?: string;
}

interface CityMapProps {
  cities: string[];
}

interface CitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCitiesAdd?: (cities: string[]) => void;
  onCitiesStage?: (cities: string[]) => void;
  baseCity?: string;
}

interface CitySelectionAdvancedProps {
  profileData: any;
  onProfileDataChange: (updater: (prev: any) => any) => void;
  isPresencialActive: boolean;
  onStageFromModal?: (fn: (cities: string[]) => void) => void;
  baseCity?: string;
}

interface ModalitiesSectionProps {
  profileData: any;
  onProfileDataChange: (updater: (prev: any) => any) => void;
}

/** =========================
 *  COMPONENTES AUXILIARES
 *  ========================= */
const Card: React.FC<CardProps> = ({ title, content, className = '' }) => (
  <div className={`p-6 bg-card rounded-lg border border-border shadow-sm ${className}`}>
    <h3 className="text-lg mb-6 text-foreground">{title}</h3>
    {content}
  </div>
);

const CityListView: React.FC<{ cities: string[] }> = ({ cities }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {cities.map((city, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border transition-colors hover:bg-secondary/70"
        >
          <div className="w-2 h-2 bg-brand rounded-full flex-shrink-0" />
          <span className="text-sm text-foreground truncate">{city}</span>
        </div>
      ))}
    </div>
  );
};

/** =========================
 *  VISUALIZAÇÃO DE CIDADES
 *  ========================= */
const CityMap: React.FC<CityMapProps> = ({ cities }) => {
  if (cities.length === 0) {
    return (
      <div className="min-h-32 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center p-6">
        <div className="text-center text-muted-foreground">
          <div className="w-12 h-12 bg-muted-foreground/20 rounded-full mx-auto mb-3 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm">Adicione cidades para visualizar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 bg-brand rounded-full flex-shrink-0" />
        <span className="text-sm text-muted-foreground">
          {cities.length} cidade{cities.length > 1 ? 's' : ''} de atendimento
        </span>
      </div>
      <CityListView cities={cities} />
    </div>
  );
};

/** =========================
 *  SELETOR DE MODALIDADES
 *  ========================= */
const ServiceModalitiesSelector = ({ selectedModes, onModesChange }: {
  selectedModes: string[];
  onModesChange: (modes: string[]) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Online */}
        <div
          onClick={() => {
            const newModes = selectedModes.includes('online')
              ? selectedModes.filter((m: string) => m !== 'online')
              : [...selectedModes, 'online'];
            onModesChange(newModes);
          }}
          className={`group relative cursor-pointer rounded-lg border p-6 transition-all duration-200 hover:shadow-md ${
            selectedModes.includes('online')
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border bg-card hover:border-primary/50'
          }`}
        >
          <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
            selectedModes.includes('online')
              ? 'bg-primary border-primary'
              : 'border-border group-hover:border-primary/50'
          }`}>
            {selectedModes.includes('online') && (
              <Check className="w-3 h-3 text-primary-foreground" />
            )}
          </div>

          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg transition-colors ${
              selectedModes.includes('online') 
                ? 'bg-primary/10 text-primary' 
                : 'bg-muted text-muted-foreground'
            }`}>
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h5 className="mb-2 text-foreground">Online</h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Treinos via videoconferência, acompanhamento digital e suporte remoto
              </p>
            </div>
          </div>
        </div>

        {/* Card Presencial */}
        <div
          onClick={() => {
            const wasPresencialActive = selectedModes.includes('presencial');
            const newModes = wasPresencialActive
              ? selectedModes.filter((m: string) => m !== 'presencial')
              : [...selectedModes, 'presencial'];
            onModesChange(newModes);
          }}
          className={`group relative cursor-pointer rounded-lg border p-6 transition-all duration-200 hover:shadow-md ${
            selectedModes.includes('presencial')
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border bg-card hover:border-primary/50'
          }`}
        >
          <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
            selectedModes.includes('presencial')
              ? 'bg-primary border-primary'
              : 'border-border group-hover:border-primary/50'
          }`}>
            {selectedModes.includes('presencial') && (
              <Check className="w-3 h-3 text-primary-foreground" />
            )}
          </div>

          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg transition-colors ${
              selectedModes.includes('presencial') 
                ? 'bg-primary/10 text-primary' 
                : 'bg-muted text-muted-foreground'
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h5 className="mb-2 text-foreground">Presencial</h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Treinos presenciais, atendimento personalizado e suporte direto
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** =========================
 *  SELEÇÃO AVANÇADA DE CIDADES
 *  ========================= */
const CitySelectionAdvanced: React.FC<CitySelectionAdvancedProps> = ({
  profileData,
  onProfileDataChange,
  isPresencialActive,
  onStageFromModal,
  baseCity
}) => {
  const [stagedCities, setStagedCities] = useState<string[]>([]);
  const [newCityInput, setNewCityInput] = useState('');
  const [autocompleteOptions, setAutocompleteOptions] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [debounceTimer, setDebounceTimer] = useState<any>(null);

  const cities = profileData?.profile_data?.cities || [];

  useEffect(() => {
    if (onStageFromModal && typeof onStageFromModal === 'function') {
      onStageFromModal((incomingCities: string[]) => {
        setStagedCities(prev => {
          const newStaged = [...prev];
          incomingCities.forEach(city => {
            if (!newStaged.includes(city) && !cities.includes(city)) {
              newStaged.push(city);
            }
          });
          return newStaged;
        });
      });
    }
  }, [onStageFromModal, cities]);

  const handleInputChange = useCallback((value: string) => {
    setNewCityInput(value);
    setSelectedCity(null);
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    if (value.trim().length < 2) {
      setAutocompleteOptions([]);
      setShowAutocomplete(false);
      return;
    }
    
    const timer = setTimeout(async () => {
      try {
        setIsLoadingAutocomplete(true);
        const options = await geoapifyAutocompleteCities(value.trim());
        
        let finalOptions = [...options];
        if (baseCity) {
          const normalizedInput = normalizeStr(value.trim());
          const normalizedBaseCity = normalizeStr(baseCity);
          
          if (normalizedBaseCity.includes(normalizedInput)) {
            finalOptions = options.filter(opt => 
              normalizeStr(opt.displayName) !== normalizedBaseCity
            );
            
            const baseCityOption = {
              name: baseCity.split(',')[0]?.trim() || baseCity,
              state: baseCity.includes(',') ? baseCity.split(',')[1]?.trim() : undefined,
              displayName: baseCity,
              lat: 0,
              lon: 0,
              place_id: 'base-city'
            };
            
            finalOptions.unshift(baseCityOption);
          }
        }
        
        setAutocompleteOptions(finalOptions);
        setShowAutocomplete(finalOptions.length > 0);
      } catch (error) {
        console.error('Erro no autocomplete:', error);
        setAutocompleteOptions([]);
        setShowAutocomplete(false);
      } finally {
        setIsLoadingAutocomplete(false);
      }
    }, 300);
    
    setDebounceTimer(timer);
  }, [debounceTimer, baseCity]);

  const selectAutocompleteOption = useCallback((option: any) => {
    setNewCityInput(option.displayName);
    setSelectedCity(option);
    setShowAutocomplete(false);
    setAutocompleteOptions([]);
  }, []);

  const addManualCity = useCallback(() => {
    if (!newCityInput.trim() || !selectedCity) return;
    
    const cityName = selectedCity.displayName;
    if (!stagedCities.includes(cityName) && !cities.includes(cityName)) {
      setStagedCities(prev => [...prev, cityName]);
    }
    setNewCityInput('');
    setSelectedCity(null);
  }, [selectedCity, stagedCities, cities]);

  const removeFromStaging = useCallback((cityToRemove: string) => {
    setStagedCities(prev => prev.filter(city => city !== cityToRemove));
  }, []);

  const confirmStagedCities = useCallback(() => {
    if (stagedCities.length === 0) return;
    
    onProfileDataChange((prev: any) => {
      const currentCities: string[] = prev.profile_data?.cities || [];
      const merged = [...currentCities];
      
      stagedCities.forEach(city => {
        const exists = merged.some(c => cityKey(c) === cityKey(city));
        if (!exists && merged.length < 10) {
          merged.push(city);
        }
      });
      
      return { 
        ...prev, 
        profile_data: {
          ...prev.profile_data,
          cities: merged
        }
      };
    });
    
    setStagedCities([]);
  }, [stagedCities, onProfileDataChange]);

  const removeCity = useCallback((cityToRemove: string) => {
    onProfileDataChange((prev: any) => ({
      ...prev,
      profile_data: {
        ...prev.profile_data,
        cities: (prev.profile_data?.cities || []).filter((city: string) => city !== cityToRemove)
      }
    }));
  }, [onProfileDataChange]);

  if (!isPresencialActive) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Input de cidade */}
      <div className="relative">
        <div className="flex items-center gap-3 p-4 bg-input-background rounded-lg border border-border focus-within:border-primary focus-within:bg-card transition-all">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={newCityInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addManualCity()}
            placeholder="Digite o nome da cidade..."
            className="flex-1 bg-transparent border-0 focus:outline-none text-foreground placeholder-muted-foreground"
            disabled={cities.length >= 10}
          />
          {isLoadingAutocomplete && (
            <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
          )}
          <button
            onClick={addManualCity}
            disabled={!selectedCity || cities.length >= 10}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
        
        {/* Autocomplete dropdown */}
        {showAutocomplete && (
          <div className="absolute z-dropdown mt-2 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {autocompleteOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => selectAutocompleteOption(option)}
                className="w-full text-left p-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="text-foreground">{option.displayName}</div>
                <div className="text-xs text-muted-foreground">Cidade</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Área de staging */}
      {stagedCities.length > 0 && (
        <div className="p-4 bg-secondary/30 border border-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-foreground">
              {stagedCities.length} cidade{stagedCities.length > 1 ? 's' : ''} para adicionar
            </span>
            <button
              onClick={() => setStagedCities([])}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {stagedCities.map((city, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-card border border-border rounded-md text-sm"
              >
                <span className="text-foreground">{city}</span>
                <button
                  onClick={() => removeFromStaging(city)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={confirmStagedCities}
            disabled={cities.length + stagedCities.length > 10}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm transition-colors"
          >
            Confirmar {stagedCities.length} cidade{stagedCities.length > 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Lista de cidades confirmadas */}
      {cities.length > 0 ? (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm text-muted-foreground">Cidades Selecionadas</h4>
              {cities.length > 1 && (
                <button
                  onClick={() => onProfileDataChange((prev: any) => ({ 
                    ...prev, 
                    profile_data: { 
                      ...prev.profile_data, 
                      cities: [] 
                    } 
                  }))}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  Limpar todas
                </button>
              )}
            </div>
            <div className="space-y-3">
              <CityMap cities={cities} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cities.map((city: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group"
                  >
                    <span className="text-foreground">{city}</span>
                    <button
                      onClick={() => removeCity(city)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-muted-foreground" />
          </div>
          <h5 className="text-foreground mb-1">Nenhuma cidade adicionada</h5>
          <p className="text-sm text-muted-foreground">
            Adicione as cidades onde você oferece atendimento presencial
          </p>
        </div>
      )}
    </div>
  );
};

/** =========================
 *  MODAL DE BUSCA
 *  ========================= */
const CitySearchModal: React.FC<CitySearchModalProps> = ({ isOpen, onClose, onCitiesAdd, onCitiesStage, baseCity = '' }) => {
  const [baseCityInput, setBaseCityInput] = useState(baseCity);
  const [baseCitySelected, setBaseCitySelected] = useState<any | null>(null);
  const [distance, setDistance] = useState('20');
  const [isSearching, setIsSearching] = useState(false);
  const [foundCities, setFoundCities] = useState<Array<{ displayName: string; distance_km?: number; name?: string; state?: string; lat?: number; lon?: number }>>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [stagedCities, setStagedCities] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [acOptions, setAcOptions] = useState<any[]>([]);
  const [acOpen, setAcOpen] = useState(false);
  const [acLoading, setAcLoading] = useState(false);
  const [acDebounce, setAcDebounce] = useState<any>(null);

  useEffect(() => {
    if (baseCity && !baseCityInput) {
      setBaseCityInput(baseCity);
    }
  }, [baseCity, baseCityInput]);

  const onTypeBaseCity = (val: string) => {
    setBaseCityInput(val);
    setBaseCitySelected(null);
    if (acDebounce) clearTimeout(acDebounce);
    if (val.trim().length < 2) {
      setAcOptions([]); setAcOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setAcLoading(true);
        const opts = await geoapifyAutocompleteCities(val.trim());
        setAcOptions(opts);
        setAcOpen(opts.length > 0);
      } finally {
        setAcLoading(false);
      }
    }, 250);
    setAcDebounce(t);
  };

  const pickAutocomplete = (opt: any) => {
    setBaseCityInput(opt.displayName);
    setBaseCitySelected(opt);
    setAcOpen(false);
  };

  const searchCitiesByDistance = async () => {
    setIsSearching(true);
    setError('');
    setFoundCities([]);

    try {
      let base = baseCitySelected;
      if (!base) {
        base = await geoapifyGeocodeCity(baseCityInput.trim());
      }
      if (!base) {
        setError('Cidade não encontrada. Selecione uma opção do autocomplete.');
        setIsSearching(false);
        return;
      }

      const nearby = await geoapifyNearbyCitiesByRadius(base.lon, base.lat, parseInt(distance, 10), 80);
      const baseK = cityKey(base.name || base.displayName, base.state, base.lat, base.lon);

      const seen = new Map<string, { displayName: string; distance_km?: number }>();
      for (const c of nearby) {
        const k = cityKey(c.name || c.displayName, c.state, c.lat, c.lon);
        if (!k || k === baseK) continue;
        const current = seen.get(k);
        if (!current || (c.distance_km ?? Infinity) < (current.distance_km ?? Infinity)) {
          seen.set(k, { displayName: c.displayName, distance_km: c.distance_km });
        }
      }
      const list = Array.from(seen.values()).sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));

      if (list.length === 0) {
        setError(`Nenhuma cidade encontrada num raio de ${distance}km de ${base.displayName || base.name}`);
      } else {
        setFoundCities(list);
      }
    } catch (e: any) {
      setError('Erro ao buscar cidades. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleCitySelection = (city: {displayName:string}) => {
    setSelectedCities(prev =>
      prev.includes(city.displayName)
        ? prev.filter(c => c !== city.displayName)
        : [...prev, city.displayName]
    );
  };

  const addToStaging = () => {
    if (selectedCities.length === 0) return;
    setStagedCities(prev => {
      const newStaged = [...prev];
      selectedCities.forEach(city => {
        if (!newStaged.includes(city)) {
          newStaged.push(city);
        }
      });
      return newStaged;
    });
    setSelectedCities([]);
  };

  const removeFromStaging = (cityToRemove: string) => {
    setStagedCities(prev => prev.filter(city => city !== cityToRemove));
  };

  const confirmStagedCities = () => {
    if (stagedCities.length === 0) return;
    
    if (typeof onCitiesStage === 'function') {
      onCitiesStage(stagedCities);
    } else if (typeof onCitiesAdd === 'function') {
      onCitiesAdd(stagedCities);
    }
    
    setStagedCities([]);
    setSelectedCities([]);
    onClose();
  };

  const clearStaging = () => {
    setStagedCities([]);
  };

  const handleClose = () => {
    setStagedCities([]);
    setSelectedCities([]);
    setFoundCities([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl text-foreground">Buscar Cidades por Distância</h2>
              <p className="text-sm text-muted-foreground mt-1">Encontre cidades próximas</p>
            </div>
            <button 
              onClick={handleClose} 
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Painel de busca */}
            <div className="p-6 border-r border-border">
              <div className="space-y-4">
                <div className="relative">
                  <Label className="block text-sm mb-2 text-foreground">Cidade base</Label>
                  <div className="relative">
                    <input
                      type="text"
                      value={baseCityInput}
                      onChange={(e) => onTypeBaseCity(e.target.value)}
                      placeholder="Digite o nome da cidade..."
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-card text-foreground transition-all"
                    />
                  </div>
                  {acOpen && (
                    <div className="absolute z-dropdown mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {acOptions.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => pickAutocomplete(opt)}
                          className="w-full text-left p-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 text-foreground"
                        >
                          {opt.displayName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="block text-sm mb-2 text-foreground">Raio de busca</Label>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    min="1"
                    max="300"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-card text-foreground transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Em quilômetros (máximo 300km)</p>
                </div>

                <button
                  onClick={searchCitiesByDistance}
                  disabled={!baseCityInput.trim() || isSearching}
                  className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSearching ? 'Buscando...' : 'Buscar Cidades'}
                </button>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <span className="text-destructive text-sm">{error}</span>
                  </div>
                )}

                {foundCities.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-foreground">
                        {foundCities.length} cidade{foundCities.length > 1 ? 's' : ''} encontrada{foundCities.length > 1 ? 's' : ''}
                      </h3>
                      {selectedCities.length > 0 && (
                        <button
                          onClick={addToStaging}
                          className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 transition-colors"
                        >
                          Adicionar {selectedCities.length}
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto border border-border rounded-lg bg-muted/30">
                      {foundCities.map((city, i) => (
                        <div
                          key={i}
                          onClick={() => toggleCitySelection(city)}
                          className={`p-3 border-b border-border last:border-b-0 cursor-pointer flex justify-between items-center hover:bg-card transition-colors ${
                            selectedCities.includes(city.displayName) 
                              ? 'bg-primary/10' 
                              : 'bg-transparent'
                          }`}
                        >
                          <div className="flex-1">
                            <div>
                              <span className="text-foreground">{city.displayName}</span>
                              {typeof city.distance_km === 'number' && (
                                <div className="text-xs text-muted-foreground">
                                  {city.distance_km}km de distância
                                </div>
                              )}
                            </div>
                          </div>
                          {selectedCities.includes(city.displayName) && (
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {selectedCities.length > 0 && (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
                        {selectedCities.length} cidade{selectedCities.length > 1 ? 's' : ''} selecionada{selectedCities.length > 1 ? 's' : ''}. 
                        Clique em "Adicionar" para confirmar.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Painel de staging */}
            <div className="p-6 bg-muted/20">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-foreground">
                    Área de Confirmação ({stagedCities.length})
                  </h3>
                  {stagedCities.length > 0 && (
                    <button
                      onClick={clearStaging}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Limpar tudo
                    </button>
                  )}
                </div>

                {stagedCities.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h4 className="text-foreground mb-2">Nenhuma cidade selecionada</h4>
                      <p className="text-sm">
                        As cidades selecionadas aparecerão aqui para confirmação
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-2">
                      {stagedCities.map((city, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-card rounded-lg border border-border transition-all group"
                        >
                          <div>
                            <span className="text-foreground">{city}</span>
                            <div className="text-xs text-muted-foreground">Pronto para adicionar</div>
                          </div>
                          <button
                            onClick={() => removeFromStaging(city)}
                            className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-border space-y-3">
                      <button
                        onClick={confirmStagedCities}
                        className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Confirmar {stagedCities.length} Cidade{stagedCities.length > 1 ? 's' : ''}
                      </button>
                      <p className="text-xs text-center text-muted-foreground">
                        As cidades serão adicionadas ao seu perfil
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** =========================
 *  COMPONENTE PRINCIPAL
 *  ========================= */
const ModalitiesSection: React.FC<ModalitiesSectionProps> = ({
  profileData,
  onProfileDataChange
}) => {
  const [showCitySearchModal, setShowCitySearchModal] = useState(false);

  const modalities = profileData?.profile_data?.modalities || [];

  const stageFromModalRef = useRef<(cities: string[]) => void>();
  const handleStageFromModal = (cities: string[]) => {
    if (stageFromModalRef.current) {
      stageFromModalRef.current(cities);
    }
  };

  const baseCity = profileData?.profile_data?.city || '';

  return (
    <>
      <Card
        title="Modalidades de Serviço"
        content={
          <div className="space-y-8">
            <ServiceModalitiesSelector
              selectedModes={modalities}
              onModesChange={(newModes: string[]) => {
                const wasPresencialActive = modalities.includes('presencial');
                const isPresencialActive = newModes.includes('presencial');
                const shouldClearCities = wasPresencialActive && !isPresencialActive;
                
                onProfileDataChange((prev: any) => ({
                  ...prev,
                  profile_data: {
                    ...prev.profile_data,
                    modalities: newModes,
                    cities: shouldClearCities ? [] : prev.profile_data.cities
                  }
                }));
              }}
            />

            {modalities.includes('presencial') && (
              <div className="pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-foreground">Cidades de Atendimento</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Onde você oferece atendimento presencial
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCitySearchModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 text-sm transition-colors border border-border"
                  >
                    <Search className="w-4 h-4" />
                    Buscar por Distância
                  </button>
                </div>
                <CitySelectionAdvanced
                  profileData={profileData}
                  onProfileDataChange={onProfileDataChange}
                  isPresencialActive={modalities.includes('presencial')}
                  onStageFromModal={(fn: (cities: string[]) => void) => {
                    stageFromModalRef.current = fn;
                  }}
                  baseCity={baseCity}
                />
              </div>
            )}
          </div>
        }
      />

      <CitySearchModal
        isOpen={showCitySearchModal}
        onClose={() => setShowCitySearchModal(false)}
        onCitiesStage={handleStageFromModal}
        baseCity={baseCity}
      />
    </>
  );
};

export default ModalitiesSection;