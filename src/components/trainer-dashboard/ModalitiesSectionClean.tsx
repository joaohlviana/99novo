import React, { useState, useCallback } from 'react';
import { Globe, MapPin, Users, Search, Plus, X, Loader2, CheckCircle, AlertCircle, Monitor } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import CitySelectionSectionFixed from './CitySelectionSectionFixed';

/** =========================
 *  CONFIG
 *  ========================= */
const GEOAPIFY_API_KEY =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GEOAPIFY_API_KEY) ||
  '5973183a2c394656bb1d7518cb3980fd'; // 🔒 use variável de ambiente em produção

/** =========================
 *  HELPERS DE API (Geoapify)
 *  ========================= */

// Autocomplete (apenas cidades do Brasil)
async function geoapifyAutocompleteCities(term: string) {
  if (!term?.trim()) return [];
  
  console.log('🔍 Buscando autocomplete para:', term);
  
  const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete');
  url.searchParams.set('text', term);
  url.searchParams.set('type', 'city');
  url.searchParams.set('filter', 'countrycode:br');
  url.searchParams.set('limit', '10');
  url.searchParams.set('lang', 'pt');
  url.searchParams.set('format', 'json');
  url.searchParams.set('apiKey', GEOAPIFY_API_KEY);

  console.log('📡 URL da API:', url.toString());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Falha no autocomplete');
  const data = await res.json();
  
  console.log('📥 Resposta da API:', data);
  
  // Retorna itens normalizados
  const results = (data?.results || []).map((r: any) => ({
    name: r.city || r.name,
    state: r.state,
    country: r.country,
    lat: r.lat,
    lon: r.lon,
    place_id: r.place_id,
    displayName: `${r.city || r.name}${r.state ? ` - ${r.state}` : ''}`
  })).filter((c: any) => c.name);
  
  console.log('✅ Cidades processadas:', results);
  return results;
}

// Geocode direto (para buscar cidade com coordenadas)
async function geoapifyGeocodeCity(cityName: string) {
  if (!cityName?.trim()) return null;
  
  console.log('🌍 Geocodificando cidade:', cityName);
  
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

// Calcular distância entre duas coordenadas (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Cidades num raio (usa forward geocoding com filter=circle + type=city)
// Usa o Geocoding API que é mais apropriado para cidades
async function geoapifyNearbyCitiesByRadius(lon: number, lat: number, distanceKm: number, limit = 80) {
  console.log('🌍 Buscando cidades próximas:', { lon, lat, distanceKm, limit });
  const radiusMeters = Math.max(1000, Math.floor(distanceKm * 1000));

  // Usar Places API com categoria específica para cidades
  const url = new URL('https://api.geoapify.com/v2/places');
  url.searchParams.set('categories', 'populated_place.city,populated_place.town,populated_place.village');
  url.searchParams.set('filter', `circle:${lon},${lat},${radiusMeters}`);
  url.searchParams.set('bias', `proximity:${lon},${lat}`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('lang', 'pt');
  url.searchParams.set('apiKey', GEOAPIFY_API_KEY);

  console.log('📡 URL Nearby (places):', url.toString());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Falha ao buscar cidades próximas');
  const data = await res.json();

  console.log('📥 Resposta Places API:', data);

  // Places API retorna GeoJSON
  const features = data?.features || [];
  console.log('🔍 Total de features encontradas:', features.length);


  const normalized = features
    .map((feature: any, index: number) => {
      const props = feature.properties || {};
      
      // Tentar extrair nome da cidade de várias formas
      let name = props.city || props.name || props.address_line1;
      
      // Se não tem nome válido, pular
      if (!name || typeof name !== 'string') {
        console.log(`❌ Feature ${index} sem nome válido:`, props);
        return null;
      }
      
      // Limpar o nome
      name = name.trim();
      
      // Extrair estado se possível
      let state = props.state || props.state_code;
      if (!state && props.address) {
        // Tentar extrair do endereço completo
        const parts = props.address.split(',');
        if (parts.length >= 2) {
          state = parts[parts.length - 2]?.trim();
        }
      }
      
      // Coordenadas
      const coords = feature.geometry?.coordinates;
      if (!coords || coords.length < 2) {
        console.log(`❌ Feature ${index} sem coordenadas válidas:`, feature.geometry);
        return null;
      }
      
      const [featureLon, featureLat] = coords;
      const distance = calculateDistance(lat, lon, featureLat, featureLon);
      
      console.log(`📍 Feature ${index}:`, {
        name,
        state,
        coords: [featureLon, featureLat],
        distance: `${distance.toFixed(1)}km`
      });
      
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
    .filter(Boolean)
    .sort((a: any, b: any) => a.distance_km - b.distance_km);

  console.log('✅ Cidades normalizadas e ordenadas:', normalized);
  return normalized;
}

/** =========================
 *  INTERFACES
 *  ========================= */
interface Card {
  title: string;
  content: React.ReactNode;
  className?: string;
}

/** =========================
 *  COMPONENTES AUXILIARES
 *  ========================= */
const Card: React.FC<Card> = ({ title, content, className = '' }) => (
  <div className={`p-6 bg-white rounded-lg border border-gray-200 ${className}`}>
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {content}
  </div>
);

/** =========================
 *  SELETOR DE MODALIDADES DE SERVIÇO
 *  ========================= */
const ServiceModalitiesSelector = ({ selectedModes, onModesChange }) => {
  const toggleMode = useCallback((mode: string) => {
    console.log('🔧 Toggling mode:', mode);
    const newModes = selectedModes.includes(mode)
      ? selectedModes.filter((m: string) => m !== mode)
      : [...selectedModes, mode];
    onModesChange(newModes);
  }, [selectedModes, onModesChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Online */}
        <div
          onClick={() => toggleMode('online')}
          className={`group relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ${
            selectedModes.includes('online')
              ? 'border-gray-800 bg-gray-50 shadow-lg'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
          }`}
        >
          {/* Status Indicator */}
          <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
            selectedModes.includes('online')
              ? 'bg-gray-800 border-gray-800'
              : 'border-gray-300 group-hover:border-gray-400'
          }`}>
            {selectedModes.includes('online') && (
              <CheckCircle className="w-3 h-3 text-white" />
            )}
          </div>

          {/* Content */}
          <div className="text-center">
            <div className={`inline-flex w-12 h-12 rounded-full items-center justify-center mb-4 transition-colors ${
              selectedModes.includes('online')
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
            }`}>
              <Monitor className="w-6 h-6" />
            </div>
            
            <h5 className={`font-medium mb-2 transition-colors ${
              selectedModes.includes('online') ? 'text-gray-900' : 'text-gray-900'
            }`}>
              Online
            </h5>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              Treinos via videoconferência, acompanhamento digital e suporte remoto
            </p>
          </div>
        </div>

        {/* Card Presencial */}
        <div
          onClick={() => toggleMode('presencial')}
          className={`group relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ${
            selectedModes.includes('presencial')
              ? 'border-gray-800 bg-gray-50 shadow-lg'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
          }`}
        >
          {/* Status Indicator */}
          <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
            selectedModes.includes('presencial')
              ? 'bg-gray-800 border-gray-800'
              : 'border-gray-300 group-hover:border-gray-400'
          }`}>
            {selectedModes.includes('presencial') && (
              <CheckCircle className="w-3 h-3 text-white" />
            )}
          </div>

          {/* Content */}
          <div className="text-center">
            <div className={`inline-flex w-12 h-12 rounded-full items-center justify-center mb-4 transition-colors ${
              selectedModes.includes('presencial')
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
            }`}>
              <Users className="w-6 h-6" />
            </div>
            
            <h5 className={`font-medium mb-2 transition-colors ${
              selectedModes.includes('presencial') ? 'text-gray-900' : 'text-gray-900'
            }`}>
              Presencial
            </h5>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              Treinos presenciais, atendimento personalizado e suporte direto
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      {selectedModes.length === 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Clique nos cards acima para selecionar suas modalidades
          </p>
        </div>
      )}
    </div>
  );
};

/** =========================
 *  MODAL: BUSCAR CIDADES POR DISTÂNCIA (API REAL)
 *  ========================= */
const CitySearchModal = ({ isOpen, onClose, onCitiesAdd }) => {
  const [baseCityInput, setBaseCityInput] = useState('');
  const [baseCitySelected, setBaseCitySelected] = useState<any | null>(null); // {name, state, lat, lon}
  const [distance, setDistance] = useState('20');
  const [isSearching, setIsSearching] = useState(false);
  const [foundCities, setFoundCities] = useState<Array<{ displayName: string; distance_km?: number }>>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [acOptions, setAcOptions] = useState<any[]>([]);
  const [acOpen, setAcOpen] = useState(false);
  const [acLoading, setAcLoading] = useState(false);
  const [acDebounce, setAcDebounce] = useState<any>(null);

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
      } catch {
        setAcOptions([]); setAcOpen(false);
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
      
      const baseName = (base.displayName || base.name || '').toLowerCase();
      const list = nearby
        .filter(c => (c.displayName || c.name).toLowerCase() !== baseName)
        .reduce((arr: Array<{displayName:string; distance_km?:number}>, c: any) => {
          const disp = c.displayName || c.name;
          if (!arr.find(a => a.displayName.toLowerCase() === disp.toLowerCase())) {
            arr.push({ displayName: disp, distance_km: c.distance_km });
          }
          return arr;
        }, [])
        .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));

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

  const addSelectedCities = () => {
    if (selectedCities.length > 0) {
      onCitiesAdd(selectedCities);
      setSelectedCities([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Buscar Cidades por Distância</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Input cidade base */}
            <div className="relative">
              <label className="block text-sm font-medium mb-2">Cidade de referência</label>
              <input
                type="text"
                value={baseCityInput}
                onChange={(e) => onTypeBaseCity(e.target.value)}
                placeholder="Digite o nome da cidade..."
                className="w-full p-3 border rounded-lg"
              />
              {acOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {acOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => pickAutocomplete(opt)}
                      className="w-full text-left p-2 hover:bg-gray-50"
                    >
                      {opt.displayName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input distância */}
            <div>
              <label className="block text-sm font-medium mb-2">Distância (km)</label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                min="1"
                max="300"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            {/* Botão buscar */}
            <button
              onClick={searchCitiesByDistance}
              disabled={!baseCityInput.trim() || isSearching}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isSearching ? 'Buscando...' : 'Buscar Cidades'}
            </button>

            {/* Erro */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Lista de cidades encontradas */}
            {foundCities.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Cidades encontradas ({foundCities.length})</h3>
                <div className="max-h-48 overflow-y-auto border rounded-lg">
                  {foundCities.map((city, i) => (
                    <div
                      key={i}
                      onClick={() => toggleCitySelection(city)}
                      className={`p-3 border-b cursor-pointer flex justify-between items-center hover:bg-gray-50 ${
                        selectedCities.includes(city.displayName) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div>
                        <span className="font-medium">{city.displayName}</span>
                        {city.distance_km && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({city.distance_km}km)
                          </span>
                        )}
                      </div>
                      {selectedCities.includes(city.displayName) && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de ação */}
            {selectedCities.length > 0 && (
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={addSelectedCities}
                  className="flex-1 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"
                >
                  Adicionar {selectedCities.length} cidade{selectedCities.length > 1 ? 's' : ''}
                </button>
                <button
                  onClick={() => setSelectedCities([])}
                  className="px-4 py-3 border rounded-lg hover:bg-gray-50"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/** =========================
 *  COMPONENTE PRINCIPAL - MODALIDADES SECTION
 *  ========================= */
interface ModalitiesSectionProps {
  profileData: any;
  onProfileDataChange: (updater: (prev: any) => any) => void;
}

const ModalitiesSection: React.FC<ModalitiesSectionProps> = ({
  profileData,
  onProfileDataChange
}) => {
  const [showCitySearchModal, setShowCitySearchModal] = useState(false);

  const modalities = profileData?.profile_data?.modalities || [];

  const handleAddCities = (cities: string[]) => {
    onProfileDataChange((prev: any) => ({
      ...prev,
      cities: [...(prev.cities || []), ...cities.filter(city => !(prev.cities || []).includes(city))]
    }));
  };

  const toggleMode = useCallback((mode: string) => {
    console.log('🔧 Toggling mode:', mode);
    onProfileDataChange((prev: any) => {
      const currentModes = prev?.profile_data?.modalities || [];
      const newModes = currentModes.includes(mode)
        ? currentModes.filter((m: string) => m !== mode)
        : [...currentModes, mode];
      
      console.log('🔄 New modes:', newModes);
      
      return {
        ...prev,
        profile_data: {
          ...prev.profile_data,
          modalities: newModes
        }
      };
    });
  }, [onProfileDataChange]);

  return (
    <>
      <Card
        title="Modalidades de Serviço"
        content={
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> Você pode oferecer serviços online, presenciais ou ambos. 
                Escolha as modalidades que melhor se adequam ao seu perfil profissional.
              </p>
            </div>

            <ServiceModalitiesSelector
              selectedModes={modalities}
              onModesChange={(newModes: string[]) => {
                console.log('🔧 Modalidades changed:', newModes);
                onProfileDataChange((prev: any) => ({
                  ...prev,
                  profile_data: {
                    ...prev.profile_data,
                    modalities: newModes
                  }
                }));
              }}
            />

            {modalities.includes('presencial') && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="mb-3">
                  <p className="font-medium">Cidades de Atendimento</p>
                </div>

                <CitySelectionSectionFixed
                  profileData={profileData}
                  onProfileDataChange={onProfileDataChange}
                />
              </div>
            )}
          </div>
        }
      />

      <CitySearchModal
        isOpen={showCitySearchModal}
        onClose={() => setShowCitySearchModal(false)}
        onCitiesAdd={handleAddCities}
      />
    </>
  );
};

export default ModalitiesSection;