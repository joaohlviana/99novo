import { useState } from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Monitor, MapPin, Plus, X } from 'lucide-react';
import { FormData } from '../BecomeTrainer';

interface ServiceModeStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

// Lista de cidades próximas a São Paulo (exemplo)
const suggestedCities = [
  'São Paulo, SP',
  'Guarulhos, SP',
  'Osasco, SP',
  'Santo André, SP',
  'São Bernardo, SP',
  'São Caetano, SP',
  'Diadema, SP',
  'Mauá, SP',
  'Ribeirão Pires, SP',
  'Taboão da Serra, SP',
  'Carapicuíba, SP',
  'Barueri, SP',
  'Cotia, SP',
  'Embu das Artes, SP',
  'Itaquaquecetuba, SP'
];

export function ServiceModeStep({ formData, updateFormData }: ServiceModeStepProps) {
  const [newCity, setNewCity] = useState('');

  const handleOnlineChange = (checked: boolean) => {
    updateFormData({ isOnline: checked });
  };

  const handleInPersonChange = (checked: boolean) => {
    updateFormData({ isInPerson: checked });
    
    // If unchecking in-person, clear cities
    if (!checked) {
      updateFormData({ cities: [] });
    }
  };

  const addCity = (city: string) => {
    if (city.trim() && !formData.cities.includes(city.trim())) {
      updateFormData({ 
        cities: [...formData.cities, city.trim()] 
      });
    }
    setNewCity('');
  };

  const removeCity = (cityToRemove: string) => {
    updateFormData({ 
      cities: formData.cities.filter(city => city !== cityToRemove) 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCity(newCity);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Modalidade de Atendimento</h2>
        <p className="text-gray-600">Como você gostaria de atender seus alunos?</p>
      </div>

      <div className="space-y-6">
        
        {/* Online Option */}
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <Checkbox
              id="online"
              checked={formData.isOnline}
              onCheckedChange={handleOnlineChange}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="online" className="flex items-center gap-2 text-lg font-medium cursor-pointer">
                <Monitor className="h-5 w-5 text-blue-500" />
                Atendimento Online
              </Label>
              <p className="text-gray-600 mt-2">
                Treine alunos de qualquer lugar através de videochamadas, apps de mensagem e plataformas digitais.
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span>✅ Maior alcance</span>
                <span>✅ Flexibilidade total</span>
                <span>✅ Sem deslocamento</span>
              </div>
            </div>
          </div>
        </div>

        {/* In-Person Option */}
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <Checkbox
              id="inperson"
              checked={formData.isInPerson}
              onCheckedChange={handleInPersonChange}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="inperson" className="flex items-center gap-2 text-lg font-medium cursor-pointer">
                <MapPin className="h-5 w-5 text-green-500" />
                Atendimento Presencial
              </Label>
              <p className="text-gray-600 mt-2">
                Atenda alunos pessoalmente em academias, parques, domicílio ou seu próprio espaço.
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span>✅ Contato direto</span>
                <span>✅ Correção imediata</span>
                <span>✅ Motivação presencial</span>
              </div>
            </div>
          </div>

          {/* Cities Selection - Only show if in-person is selected */}
          {formData.isInPerson && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">
                Em quais cidades você atende presencialmente?
              </h4>
              
              {/* Add Custom City */}
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Digite uma cidade..."
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-10"
                />
                <Button 
                  type="button"
                  onClick={() => addCity(newCity)}
                  variant="outline"
                  className="px-4 h-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggested Cities */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Cidades sugeridas (raio de 50km):</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedCities.slice(0, 8).map((city) => (
                    <Button
                      key={city}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addCity(city)}
                      disabled={formData.cities.includes(city)}
                      className="text-xs border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {city}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selected Cities */}
              {formData.cities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Cidades selecionadas ({formData.cities.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.cities.map((city) => (
                      <Badge
                        key={city}
                        variant="secondary"
                        className="flex items-center gap-2 py-1 px-3"
                      >
                        <MapPin className="h-3 w-3" />
                        {city}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCity(city)}
                          className="h-4 w-4 p-0 hover:bg-transparent ml-1"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-2">💡 Dica de ouro:</h4>
        <p className="text-sm text-purple-800">
          Você pode oferecer <strong>ambas as modalidades</strong>! Treinadores que atendem online e presencial 
          têm 3x mais oportunidades de conseguir alunos. Seja flexível e aumente suas chances de sucesso.
        </p>
      </div>

      {/* Validation Warning */}
      {!formData.isOnline && !formData.isInPerson && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            ⚠️ Selecione pelo menos uma modalidade de atendimento para continuar.
          </p>
        </div>
      )}

      {formData.isInPerson && formData.cities.length === 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            ⚠️ Adicione pelo menos uma cidade para atendimento presencial.
          </p>
        </div>
      )}
    </div>
  );
}