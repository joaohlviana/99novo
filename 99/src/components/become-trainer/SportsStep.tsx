import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FormData } from '../BecomeTrainer';

// Import dos dados centralizados
import { sportsCategories } from '../../data/constants';

interface SportsStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

interface Sport {
  id: string;
  name: string;
  icon: string;
}

// Usa os dados centralizados como fonte única de verdade
const sports: Sport[] = sportsCategories.map(sport => ({
  id: sport.id,
  name: sport.label,
  icon: sport.iconUrl
}));

export function SportsStep({ formData, updateFormData }: SportsStepProps) {
  const toggleSport = (sportId: string) => {
    const currentSports = formData.selectedSports;
    const isSelected = currentSports.includes(sportId);
    
    if (isSelected) {
      updateFormData({ 
        selectedSports: currentSports.filter(id => id !== sportId) 
      });
    } else {
      updateFormData({ 
        selectedSports: [...currentSports, sportId] 
      });
    }
  };

  const clearAll = () => {
    updateFormData({ selectedSports: [] });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Esportes Especializados</h2>
        <p className="text-gray-600">Selecione todas as modalidades que você domina</p>
      </div>

      {/* Selected Sports Counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {formData.selectedSports.length} modalidade{formData.selectedSports.length !== 1 ? 's' : ''} selecionada{formData.selectedSports.length !== 1 ? 's' : ''}
          </span>
          {formData.selectedSports.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Limpar seleção
            </Button>
          )}
        </div>
      </div>

      {/* Selected Sports Display */}
      {formData.selectedSports.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Suas especialidades:</p>
          <div className="flex flex-wrap gap-2">
            {formData.selectedSports.map((sportId) => {
              const sport = sports.find(s => s.id === sportId);
              return sport ? (
                <Badge key={sportId} variant="default" className="bg-[#e0093e] hover:bg-[#c0082e]">
                  {sport.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Sports Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sports.map((sport) => {
          const isSelected = formData.selectedSports.includes(sport.id);
          
          return (
            <button
              key={sport.id}
              onClick={() => toggleSport(sport.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105
                ${isSelected 
                  ? 'border-[#e0093e] bg-[#e0093e]/10 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 flex items-center justify-center">
                  <img 
                    src={sport.icon} 
                    alt={sport.name}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      // Fallback to a placeholder if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className={`text-xs font-medium text-center leading-tight ${
                  isSelected ? 'text-[#e0093e]' : 'text-gray-700'
                }`}>
                  {sport.name}
                </span>
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#e0093e] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-medium text-amber-900 mb-2">⚡ Dicas para maximizar suas oportunidades:</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Selecione apenas modalidades que você realmente domina</li>
          <li>• Quanto mais especialidades, maior seu alcance de potenciais alunos</li>
          <li>• Foque em modalidades populares na sua região</li>
          <li>• Você pode atualizar suas especialidades a qualquer momento</li>
        </ul>
      </div>
    </div>
  );
}