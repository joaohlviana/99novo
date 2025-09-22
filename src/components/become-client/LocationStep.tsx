import { MapPin, Monitor, Users, X } from 'lucide-react';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { CitySelector } from '../ui/city-selector';
import { ClientFormData } from '../BecomeClient';

interface LocationStepProps {
  formData: ClientFormData;
  updateFormData: (data: Partial<ClientFormData>) => void;
}

const serviceModes = [
  {
    id: 'online' as const,
    title: 'Apenas Online',
    description: 'Treinos virtuais via videochamada',
    icon: Monitor,
    benefits: ['Flexibilidade total', 'Sem deslocamento', 'Mais opções de treinadores'],
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'presencial' as const,
    title: 'Apenas Presencial',
    description: 'Treinos presenciais na sua cidade',
    icon: MapPin,
    benefits: ['Acompanhamento direto', 'Correção em tempo real', 'Motivação presencial'],
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'ambos' as const,
    title: 'Online + Presencial',
    description: 'Combinação de treinos online e presenciais',
    icon: Users,
    benefits: ['Máxima flexibilidade', 'Melhor custo-benefício', 'Variedade de opções'],
    color: 'bg-purple-100 text-purple-600'
  }
];

export function LocationStep({ formData, updateFormData }: LocationStepProps) {
  const needsCities = formData.serviceMode === 'presencial' || formData.serviceMode === 'ambos';

  const handleCityAdd = (city: string) => {
    const currentCities = formData.cities || [];
    if (!currentCities.includes(city)) {
      updateFormData({ cities: [...currentCities, city] });
    }
  };

  const handleCityRemove = (cityToRemove: string) => {
    const currentCities = formData.cities || [];
    updateFormData({ cities: currentCities.filter(city => city !== cityToRemove) });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-medium text-foreground">Localização e Modalidade</h2>
        <p className="text-muted-foreground">Como você prefere treinar?</p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Modalidade de Atendimento */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Modalidade de Atendimento *
          </Label>
          <div className="grid grid-cols-1 gap-4">
            {serviceModes.map((mode) => {
              const isSelected = formData.serviceMode === mode.id;
              const Icon = mode.icon;
              
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => updateFormData({ serviceMode: mode.id })}
                  className={`
                    p-4 border-2 rounded-lg text-left transition-all hover:shadow-sm
                    ${isSelected 
                      ? 'border-[#e0093e] bg-[#e0093e]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${mode.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{mode.title}</h3>
                        {isSelected && (
                          <div className="w-5 h-5 bg-[#e0093e] rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{mode.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {mode.benefits.map((benefit, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seleção de Cidades (se presencial ou ambos) */}
        {needsCities && (
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Cidades de Atendimento *
            </Label>
            
            <div className="space-y-4">
              <CitySelector 
                onCitySelect={handleCityAdd}
                placeholder="Digite o nome da cidade..."
                disabled={false}
              />

              {formData.cities && formData.cities.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Cidades selecionadas:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.cities.map((city) => (
                      <Badge
                        key={city}
                        variant="default"
                        className="bg-[#e0093e] hover:bg-[#e0093e]/90 cursor-pointer"
                        onClick={() => handleCityRemove(city)}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {city}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Clique em uma cidade para removê-la da lista.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">📍 Importante</h4>
              <p className="text-sm text-yellow-800">
                Selecione todas as cidades onde você gostaria de encontrar treinadores presenciais. 
                Você pode adicionar múltiplas cidades para ter mais opções.
              </p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">💡 Dica da Modalidade</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            {formData.serviceMode === 'online' && (
              <>
                <li>• Acesso a treinadores de todo o Brasil</li>
                <li>• Economia de tempo e dinheiro com deslocamento</li>
                <li>• Flexibilidade total de horários</li>
              </>
            )}
            {formData.serviceMode === 'presencial' && (
              <>
                <li>• Acompanhamento e correção em tempo real</li>
                <li>• Motivação e energia do contato presencial</li>
                <li>• Uso de equipamentos específicos quando necessário</li>
              </>
            )}
            {formData.serviceMode === 'ambos' && (
              <>
                <li>• Máxima flexibilidade: online ou presencial conforme necessário</li>
                <li>• Melhor custo-benefício com opções variadas</li>
                <li>• Acesso a uma rede mais ampla de treinadores</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}