import { Clock, DollarSign, Dumbbell, X } from 'lucide-react';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { ClientFormData } from '../BecomeClient';

interface PreferencesStepProps {
  formData: ClientFormData;
  updateFormData: (data: Partial<ClientFormData>) => void;
}

const workoutTypes = [
  { id: 'musculacao', title: 'Musculação', icon: '💪' },
  { id: 'funcional', title: 'Treino Funcional', icon: '🏃' },
  { id: 'crossfit', title: 'Crossfit', icon: '🏋️' },
  { id: 'yoga', title: 'Yoga', icon: '🧘' },
  { id: 'pilates', title: 'Pilates', icon: '🤸' },
  { id: 'cardio', title: 'Cardio', icon: '❤️' },
  { id: 'natacao', title: 'Natação', icon: '🏊' },
  { id: 'corrida', title: 'Corrida', icon: '🏃' },
  { id: 'danca', title: 'Dança', icon: '💃' },
  { id: 'lutas', title: 'Artes Marciais', icon: '🥋' },
  { id: 'ciclismo', title: 'Ciclismo', icon: '🚴' },
  { id: 'escalada', title: 'Escalada', icon: '🧗' }
];

const durations = [
  { id: '30min', title: '30 minutos', subtitle: 'Rápido e eficiente' },
  { id: '45min', title: '45 minutos', subtitle: 'Duração equilibrada' },
  { id: '60min', title: '1 hora', subtitle: 'Treino completo' },
  { id: '90min', title: '1h30min', subtitle: 'Treino extenso' },
  { id: 'flexivel', title: 'Flexível', subtitle: 'Varia conforme disponibilidade' }
];

const times = [
  { id: 'manha', title: 'Manhã', subtitle: '6h - 12h', icon: '🌅' },
  { id: 'tarde', title: 'Tarde', subtitle: '12h - 18h', icon: '☀️' },
  { id: 'noite', title: 'Noite', subtitle: '18h - 22h', icon: '🌙' },
  { id: 'madrugada', title: 'Madrugada', subtitle: '22h - 6h', icon: '🌃' },
  { id: 'flexivel', title: 'Flexível', subtitle: 'Qualquer horário', icon: '⏰' }
];

const budgets = [
  { id: 'ate-50', title: 'Até R$ 50', subtitle: 'Por sessão' },
  { id: '50-100', title: 'R$ 50 - R$ 100', subtitle: 'Por sessão' },
  { id: '100-150', title: 'R$ 100 - R$ 150', subtitle: 'Por sessão' },
  { id: '150-200', title: 'R$ 150 - R$ 200', subtitle: 'Por sessão' },
  { id: 'acima-200', title: 'Acima de R$ 200', subtitle: 'Por sessão' },
  { id: 'negociar', title: 'Prefiro negociar', subtitle: 'Conversar diretamente' }
];

export function PreferencesStep({ formData, updateFormData }: PreferencesStepProps) {
  const toggleWorkoutType = (typeId: string) => {
    const current = formData.preferredWorkoutTypes || [];
    const updated = current.includes(typeId)
      ? current.filter(id => id !== typeId)
      : [...current, typeId];
    
    updateFormData({ preferredWorkoutTypes: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-medium text-foreground">Preferências de Treino</h2>
        <p className="text-muted-foreground">Como você gosta de treinar?</p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Tipos de Treino Preferidos */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
            Tipos de Treino de Interesse * (selecione até 3)
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {workoutTypes.map((type) => {
              const isSelected = (formData.preferredWorkoutTypes || []).includes(type.id);
              const canSelect = (formData.preferredWorkoutTypes || []).length < 3 || isSelected;
              
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => canSelect && toggleWorkoutType(type.id)}
                  disabled={!canSelect}
                  className={`
                    p-3 border-2 rounded-lg text-center transition-all
                    ${isSelected 
                      ? 'border-[#e0093e] bg-[#e0093e]/5' 
                      : canSelect 
                        ? 'border-gray-200 hover:border-gray-300' 
                        : 'border-gray-100 opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium">{type.title}</div>
                </button>
              );
            })}
          </div>
          {(formData.preferredWorkoutTypes || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.preferredWorkoutTypes.map((typeId) => {
                const type = workoutTypes.find(t => t.id === typeId);
                return (
                  <Badge
                    key={typeId}
                    variant="default"
                    className="bg-[#e0093e] hover:bg-[#e0093e]/90 cursor-pointer"
                    onClick={() => toggleWorkoutType(typeId)}
                  >
                    {type?.icon} {type?.title}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Duração Preferida */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Duração Preferida por Treino *
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {durations.map((duration) => {
              const isSelected = formData.workoutDuration === duration.id;
              
              return (
                <button
                  key={duration.id}
                  type="button"
                  onClick={() => updateFormData({ workoutDuration: duration.id })}
                  className={`
                    p-4 border-2 rounded-lg text-left transition-all hover:shadow-sm
                    ${isSelected 
                      ? 'border-[#e0093e] bg-[#e0093e]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="font-medium text-foreground">{duration.title}</div>
                  <div className="text-sm text-muted-foreground">{duration.subtitle}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Horário Preferido */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Horário Preferido *
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {times.map((time) => {
              const isSelected = formData.workoutTime === time.id;
              
              return (
                <button
                  key={time.id}
                  type="button"
                  onClick={() => updateFormData({ workoutTime: time.id })}
                  className={`
                    p-4 border-2 rounded-lg text-center transition-all hover:shadow-sm
                    ${isSelected 
                      ? 'border-[#e0093e] bg-[#e0093e]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{time.icon}</div>
                  <div className="font-medium text-foreground">{time.title}</div>
                  <div className="text-sm text-muted-foreground">{time.subtitle}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orçamento */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Faixa de Orçamento *
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {budgets.map((budget) => {
              const isSelected = formData.budget === budget.id;
              
              return (
                <button
                  key={budget.id}
                  type="button"
                  onClick={() => updateFormData({ budget: budget.id })}
                  className={`
                    p-4 border-2 rounded-lg text-left transition-all hover:shadow-sm
                    ${isSelected 
                      ? 'border-[#e0093e] bg-[#e0093e]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="font-medium text-foreground">{budget.title}</div>
                  <div className="text-sm text-muted-foreground">{budget.subtitle}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">💡 Dica Importante</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Suas preferências nos ajudam na pré-seleção</li>
            <li>• Você sempre pode explorar outras modalidades</li>
            <li>• Flexibilidade facilita encontrar o treinador ideal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}