import { Target, TrendingDown, TrendingUp, Zap, Heart, Trophy } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ClientFormData } from '../BecomeClient';

interface FitnessGoalsStepProps {
  formData: ClientFormData;
  updateFormData: (data: Partial<ClientFormData>) => void;
}

const goals = [
  {
    id: 'perder-peso',
    title: 'Perder Peso',
    description: 'Reduzir gordura corporal e emagrecer',
    icon: TrendingDown,
    color: 'bg-red-100 text-red-600'
  },
  {
    id: 'ganhar-massa',
    title: 'Ganhar Massa Muscular',
    description: 'Aumentar músculos e força',
    icon: TrendingUp,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'definir-corpo',
    title: 'Definir o Corpo',
    description: 'Tonificar e definir músculos',
    icon: Target,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'condicionamento',
    title: 'Melhorar Condicionamento',
    description: 'Aumentar resistência e energia',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    id: 'saude-geral',
    title: 'Saúde Geral',
    description: 'Melhorar bem-estar e qualidade de vida',
    icon: Heart,
    color: 'bg-pink-100 text-pink-600'
  },
  {
    id: 'performance',
    title: 'Performance Esportiva',
    description: 'Melhorar performance em esportes específicos',
    icon: Trophy,
    color: 'bg-purple-100 text-purple-600'
  }
];

export function FitnessGoalsStep({ formData, updateFormData }: FitnessGoalsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-medium text-foreground">Objetivos Fitness</h2>
        <p className="text-muted-foreground">Qual seu principal objetivo?</p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Objetivo Principal */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            Objetivo Principal *
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const isSelected = formData.primaryGoal === goal.id;
              const Icon = goal.icon;
              
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => updateFormData({ primaryGoal: goal.id })}
                  className={`
                    p-4 border-2 rounded-lg text-left transition-all hover:shadow-sm
                    ${isSelected 
                      ? 'border-[#e0093e] bg-[#e0093e]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${goal.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">{goal.title}</h3>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-[#e0093e] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Medidas Corporais */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            Medidas Corporais
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Altura * (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => updateFormData({ height: e.target.value })}
                placeholder="170"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentWeight">Peso Atual (kg)</Label>
              <Input
                id="currentWeight"
                type="number"
                value={formData.currentWeight}
                onChange={(e) => updateFormData({ currentWeight: e.target.value })}
                placeholder="70"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetWeight">Peso Meta (kg)</Label>
              <Input
                id="targetWeight"
                type="number"
                value={formData.targetWeight}
                onChange={(e) => updateFormData({ targetWeight: e.target.value })}
                placeholder="65"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyFat">% Gordura (opcional)</Label>
              <Input
                id="bodyFat"
                type="number"
                value={formData.bodyFatPercentage}
                onChange={(e) => updateFormData({ bodyFatPercentage: e.target.value })}
                placeholder="20"
                className="h-11"
              />
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">🎯 Dica Importante</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Objetivos claros ajudam a encontrar o treinador ideal</li>
            <li>• Medidas precisas permitem um plano mais personalizado</li>
            <li>• Você pode ajustar suas metas ao longo do tempo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}