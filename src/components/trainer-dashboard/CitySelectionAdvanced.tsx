import React, { useState, useCallback } from 'react';
import { Globe, MapPin, Users, Search, X, Loader2, CheckCircle } from 'lucide-react';

/** =========================
 *  CONFIG
 *  ========================= */
const GEOAPIFY_API_KEY =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GEOAPIFY_API_KEY) ||
  '5973183a2c394656bb1d7518cb3980fd';

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
  url.searchParams.set('apiKey', GEOAPIFY_API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Falha no autocomplete');
  const data = await res.json();

  return (data?.results || []).map((r: any) => ({
    name: r.city || r.name,
    state: r.state,
    lat: r.lat,
    lon: r.lon,
    place_id: r.place_id,
    displayName: `${r.city || r.name}${r.state ? ` - ${r.state}` : ''}`,
  })).filter((c: any) => c.name);
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

  const first = data?.results?.[0];
  if (!first) return null;

  return {
    name: first.city || first.name,
    state: first.state,
    lat: first.lat,
    lon: first.lon,
    place_id: first.place_id,
    displayName: `${first.city || first.name}${first.state ? ` - ${first.state}` : ''}`,
  };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geoapifyNearbyCitiesByRadius(lon: number, lat: number, distanceKm: number, limit = 80) {
  const url = new URL('https://api.geoapify.com/v2/places');
  url.searchParams.set('categories', 'populated_place.city,populated_place.town,populated_place.village');
  url.searchParams.set('filter', `circle:${lon},${lat},${Math.floor(distanceKm * 1000)}`);
  url.searchParams.set('bias', `proximity:${lon},${lat}`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('lang', 'pt');
  url.searchParams.set('apiKey', GEOAPIFY_API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Falha ao buscar cidades próximas');
  const data = await res.json();

  return (data?.features || []).map((f: any) => {
    const props = f.properties || {};
    const coords = f.geometry?.coordinates;
    if (!coords || coords.length < 2) return null;
    const [lonR, latR] = coords;
    return {
      name: props.city || props.name,
      state: props.state,
      lat: latR,
      lon: lonR,
      displayName: `${props.city || props.name}${props.state ? ` - ${props.state}` : ''}`,
      distance_km: Math.round(calculateDistance(lat, lon, latR, lonR) * 10) / 10,
    };
  }).filter(Boolean);
}

/** =========================
 *  COMPONENTES
 *  ========================= */
const ServiceModalitiesSelector = ({ selectedModes, onModesChange }) => {
  const toggleMode = useCallback((mode: string) => {
    const newModes = selectedModes.includes(mode)
      ? selectedModes.filter((m: string) => m !== mode)
      : [...selectedModes, mode];
    onModesChange(newModes);
  }, [selectedModes, onModesChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Online */}
      <div
        onClick={() => toggleMode('online')}
        className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
          selectedModes.includes('online') ? 'border-gray-800 bg-gray-50 shadow' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="text-center">
          <div className={`w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full ${
            selectedModes.includes('online') ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            <Globe className="w-6 h-6" />
          </div>
          <h5 className="font-medium">Online</h5>
        </div>
      </div>

      {/* Presencial */}
      <div
        onClick={() => toggleMode('presencial')}
        className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
          selectedModes.includes('presencial') ? 'border-gray-800 bg-gray-50 shadow' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="text-center">
          <div className={`w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full ${
            selectedModes.includes('presencial') ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            <Users className="w-6 h-6" />
          </div>
          <h5 className="font-medium">Presencial</h5>
        </div>
      </div>
    </div>
  );
};

const CitySearchModal = ({ isOpen, onClose, onCitiesAdd }) => {
  const [baseCityInput, setBaseCityInput] = useState('');
  const [baseCitySelected, setBaseCitySelected] = useState<any | null>(null);
  const [distance, setDistance] = useState('20');
  const [isSearching, setIsSearching] = useState(false);
  const [foundCities, setFoundCities] = useState<any[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [acOptions, setAcOptions] = useState<any[]>([]);
  const [acOpen, setAcOpen] = useState(false);

  const onTypeBaseCity = (val: string) => {
    setBaseCityInput(val);
    if (val.trim().length < 2) {
      setAcOptions([]); setAcOpen(false);
      return;
    }
    setTimeout(async () => {
      try {
        const opts = await geoapifyAutocompleteCities(val.trim());
        setAcOptions(opts);
        setAcOpen(true);
      } catch (error) {
        console.error('Erro no autocomplete:', error);
        setAcOptions([]);
        setAcOpen(false);
      }
    }, 250);
  };

  const pickAutocomplete = (opt: any) => {
    setBaseCityInput(opt.displayName);
    setBaseCitySelected(opt);
    setAcOpen(false);
  };

  const searchCitiesByDistance = async () => {
    setIsSearching(true);
    setFoundCities([]);
    try {
      let base = baseCitySelected || await geoapifyGeocodeCity(baseCityInput.trim());
      if (!base) {
        console.error('Cidade base não encontrada');
        return;
      }
      const nearby = await geoapifyNearbyCitiesByRadius(base.lon, base.lat, parseInt(distance, 10), 80);
      setFoundCities(nearby.filter(c => c.displayName !== base.displayName));
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleCitySelection = (city: any) => {
    setSelectedCities(prev =>
      prev.includes(city.displayName)
        ? prev.filter(c => c !== city.displayName)
        : [...prev, city.displayName]
    );
  };

  const confirmSelection = () => {
    onCitiesAdd(selectedCities);
    setSelectedCities([]);
    setFoundCities([]);
    setBaseCityInput('');
    setBaseCitySelected(null);
    onClose();
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Buscar Cidades Próximas</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <label className="block text-sm mb-1">Cidade base</label>
            <input
              value={baseCityInput}
              onChange={(e) => onTypeBaseCity(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Digite uma cidade..."
            />
            {acOpen && acOptions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto">
                {acOptions.map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => pickAutocomplete(opt)} 
                    className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                  >
                    {opt.displayName}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">Distância (km)</label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full border rounded p-2"
              min="1"
              max="200"
            />
          </div>
        </div>
        
        <button
          onClick={searchCitiesByDistance}
          disabled={!baseCityInput.trim() || isSearching}
          className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
        
        {foundCities.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            <h3 className="font-medium">Cidades encontradas:</h3>
            {foundCities.map((c, i) => (
              <div
                key={i}
                onClick={() => toggleCitySelection(c)}
                className={`p-3 border rounded cursor-pointer flex justify-between items-center ${
                  selectedCities.includes(c.displayName) ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{c.displayName}</span>
                <div className="flex items-center gap-2">
                  {c.distance_km && <span className="text-xs text-gray-500">{c.distance_km} km</span>}
                  {selectedCities.includes(c.displayName) && <CheckCircle className="w-4 h-4 text-blue-600" />}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {selectedCities.length > 0 && (
          <button
            onClick={confirmSelection}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Confirmar {selectedCities.length} cidade(s)
          </button>
        )}
      </div>
    </div>
  );
};

/** =========================
 *  PRINCIPAL
 *  ========================= */
interface CitySelectionAdvancedProps {
  profileData: { modalities: string[]; cities: string[] };
  onProfileDataChange: (updater: (prev: any) => any) => void;
  isPresencialActive: boolean;
}

const CitySelectionAdvanced: React.FC<CitySelectionAdvancedProps> = ({ 
  profileData, 
  onProfileDataChange, 
  isPresencialActive 
}) => {
  const [showCitySearchModal, setShowCitySearchModal] = useState(false);
  const modalities = profileData?.modalities || [];
  const cities = profileData?.cities || [];

  const handleAddCities = (newCities: string[]) => {
    console.log('✅ Adicionando cidades localmente:', newCities);
    onProfileDataChange(prev => ({
      ...prev,
      cities: [...(prev.cities || []), ...newCities.filter(c => !prev.cities?.includes(c))].slice(0, 10),
    }));
  };

  const removeCity = (city: string) => {
    console.log('✅ Removendo cidade localmente:', city);
    onProfileDataChange(prev => ({
      ...prev,
      cities: (prev.cities || []).filter(c => c !== city),
    }));
  };

  const toggleMode = (newModes: string[]) => {
    console.log('✅ Alterando modalidades:', newModes);
    onProfileDataChange(prev => ({
      ...prev,
      modalities: newModes,
      cities: newModes.includes('presencial') ? prev.cities : [],
    }));
  };

  // Se presencial não estiver ativo, não renderizar
  if (!isPresencialActive) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-4">Modalidades de Atendimento</h3>
        <ServiceModalitiesSelector selectedModes={modalities} onModesChange={toggleMode} />
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-4">Modalidades de Atendimento</h3>
        <ServiceModalitiesSelector selectedModes={modalities} onModesChange={toggleMode} />
        
        {modalities.includes('presencial') && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Cidades de Atendimento</p>
              <button
                onClick={() => setShowCitySearchModal(true)}
                className="inline-flex items-center gap-2 px-3 py-1 border rounded text-sm hover:bg-gray-50"
              >
                <Search className="w-4 h-4" />
                Buscar cidades próximas
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {cities.map((c, i) => (
                <div key={i} className="px-3 py-1 border rounded bg-gray-50 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-gray-600" />
                  <span className="text-sm">{c}</span>
                  <button
                    onClick={() => removeCity(c)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {cities.length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma cidade selecionada</p>
              )}
            </div>
          </div>
        )}
      </div>

      <CitySearchModal
        isOpen={showCitySearchModal}
        onClose={() => setShowCitySearchModal(false)}
        onCitiesAdd={handleAddCities}
      />
    </>
  );
};

export default CitySelectionAdvanced;