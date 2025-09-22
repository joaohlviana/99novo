import React, { useState } from 'react';
import { MapPin, Plus, X, Search, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const CitySelectionSection = ({ profileData, onProfileDataChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [autocompleteCities, setAutocompleteCities] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [debounceId, setDebounceId] = useState<any>(null);
  const [addingCity, setAddingCity] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const [cityFeedback, setCityFeedback] = useState<{city: string; type: 'success' | 'error'; message: string} | null>(null);

  const selectedCities = profileData.cities || [];

  const addCity = async (cityData: any) => {
    const cityName = cityData.displayName || cityData;
    
    if (selectedCities.length >= 10 || selectedCities.includes(cityName)) {
      return;
    }

    setAddingCity(cityName);
    setCityFeedback(null);

    try {
      // Importar as informações do Supabase
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      // Preparar dados para envio
      const updatedCities = [...selectedCities, cityName];
      const updateData = {
        profile_data: {
          ...profileData.profile_data,
          cities: updatedCities
        }
      };

      // Fazer chamada para o servidor
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e547215c/trainer-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          trainer_id: profileData.user_id || profileData.id,
          updates: updateData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro do servidor: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Cidade salva no banco:', { city: cityName, result });

      // Atualizar estado local apenas após sucesso
      onProfileDataChange(prev => ({
        ...prev,
        cities: updatedCities
      }));

      // Feedback visual
      setRecentlyAdded(cityName);
      setTimeout(() => setRecentlyAdded(null), 2000);
      setSearchTerm('');
      setIsAddingMode(false);
      setShowAutocomplete(false);

    } catch (error: any) {
      console.error('❌ Erro ao salvar cidade:', error);
      
      // Mostrar feedback de erro
      setCityFeedback({
        city: cityName,
        type: 'error',
        message: error.message || 'Erro ao adicionar cidade. Tente novamente.'
      });

      // Limpar feedback de erro após 5 segundos
      setTimeout(() => setCityFeedback(null), 5000);
    } finally {
      setAddingCity(null);
    }
  };

  const removeCity = async (cityToRemove: string) => {
    try {
      // Importar as informações do Supabase
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      // Preparar dados para envio
      const updatedCities = selectedCities.filter(city => city !== cityToRemove);
      const updateData = {
        profile_data: {
          ...profileData.profile_data,
          cities: updatedCities
        }
      };

      // Fazer chamada para o servidor
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e547215c/trainer-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          trainer_id: profileData.user_id || profileData.id,
          updates: updateData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro do servidor: ${response.status}`);
      }

      // Atualizar estado local apenas após sucesso
      onProfileDataChange(prev => ({
        ...prev,
        cities: updatedCities
      }));

      console.log('✅ Cidade removida do banco:', cityToRemove);

    } catch (error: any) {
      console.error('❌ Erro ao remover cidade:', error);
      
      // Mostrar feedback de erro
      setCityFeedback({
        city: cityToRemove,
        type: 'error',
        message: 'Erro ao remover cidade. Tente novamente.'
      });

      setTimeout(() => setCityFeedback(null), 5000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Lista de Cidades Selecionadas */}
      {selectedCities.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {selectedCities.length} cidade{selectedCities.length > 1 ? 's' : ''} selecionada{selectedCities.length > 1 ? 's' : ''}:
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedCities.map((city, index) => (
              <div
                key={city}
                className={`group relative inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  recentlyAdded === city
                    ? 'bg-green-50 border-green-200 shadow-md animate-pulse'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Ícone de confirmação para cidade recém-adicionada */}
                {recentlyAdded === city && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
                
                <MapPin className={`w-4 h-4 ${
                  recentlyAdded === city ? 'text-green-600' : 'text-gray-500'
                }`} />
                
                <span className={`text-sm font-medium ${
                  recentlyAdded === city ? 'text-green-800' : 'text-gray-800'
                }`}>
                  {city}
                </span>
                
                <button
                  onClick={() => removeCity(city)}
                  className="w-5 h-5 rounded-full bg-gray-200 hover:bg-red-100 transition-colors duration-150 flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3 text-gray-600 hover:text-red-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Área de Busca/Adição */}
      <div className="space-y-3">
        {!isAddingMode ? (
          <button
            onClick={() => setIsAddingMode(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors duration-150"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Adicionar cidade</span>
          </button>
        ) : (
          <div className="space-y-3">
            {/* Campo de busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (debounceId) clearTimeout(debounceId);
                  
                  const newDebounceId = setTimeout(async () => {
                    if (e.target.value.trim().length >= 2) {
                      try {
                        const response = await fetch(
                          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(e.target.value)}&type=city&filter=countrycode:br&apiKey=01b02d5f999348b999993f8f11b5b4fe`
                        );
                        const data = await response.json();
                        const cities = data.features?.map((feature: any) => ({
                          place_id: feature.properties.place_id,
                          displayName: `${feature.properties.city || feature.properties.name} - ${feature.properties.state_code || feature.properties.state}`,
                          lat: feature.geometry.coordinates[1],
                          lng: feature.geometry.coordinates[0],
                          city: feature.properties.city || feature.properties.name,
                          state: feature.properties.state_code || feature.properties.state
                        })) || [];
                        
                        const filteredCities = cities.filter(city => 
                          !selectedCities.includes(city.displayName)
                        );
                        
                        setAutocompleteCities(filteredCities.slice(0, 5));
                        setShowAutocomplete(filteredCities.length > 0);
                      } catch (error) {
                        console.error('Erro no autocomplete:', error);
                        setAutocompleteCities([]);
                        setShowAutocomplete(false);
                      }
                    } else {
                      setAutocompleteCities([]);
                      setShowAutocomplete(false);
                    }
                  }, 300);
                  
                  setDebounceId(newDebounceId);
                }}
                placeholder="Digite o nome da cidade..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
                autoFocus
              />
              <button
                onClick={() => {
                  setIsAddingMode(false);
                  setSearchTerm('');
                  setShowAutocomplete(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de cidades filtradas */}
            {searchTerm.length > 0 && (
              <div className={`max-h-32 overflow-y-auto border border-gray-200 rounded-lg bg-white ${showAutocomplete ? 'block' : 'hidden'}`}>
                {autocompleteCities.length > 0 ? (
                  <div className="p-1">
                    {autocompleteCities.map((city) => (
                      <button
                        key={city.place_id}
                        onClick={() => addCity(city)}
                        disabled={addingCity === city.displayName}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2 transition-colors duration-150 disabled:opacity-50"
                      >
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{city.displayName}</span>
                        {addingCity === city.displayName ? (
                          <Loader2 className="w-4 h-4 text-gray-400 ml-auto animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 text-gray-400 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Nenhuma cidade encontrada
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feedback de cidade adicionada */}
      {recentlyAdded && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-800 font-medium">
            {recentlyAdded} foi adicionada com sucesso!
          </span>
        </div>
      )}

      {/* Feedback de erro global */}
      {cityFeedback && cityFeedback.type === 'error' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-800 font-medium">
            {cityFeedback.message}
          </span>
        </div>
      )}

      {/* Estado vazio */}
      {selectedCities.length === 0 && !isAddingMode && (
        <div className="text-center py-6 text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Nenhuma cidade selecionada</p>
          <p className="text-xs text-gray-400 mt-1">
            Clique em "Adicionar cidade" para começar
          </p>
        </div>
      )}
    </div>
  );
};

export default CitySelectionSection;