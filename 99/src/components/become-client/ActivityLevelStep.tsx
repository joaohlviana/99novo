import { Activity, Calendar, AlertTriangle, X } from 'lucide-react';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { ClientFormData } from '../BecomeClient';

interface ActivityLevelStepProps {
  formData: ClientFormData;
  updateFormData: (data: Partial<ClientFormData>) => void;
}

const activityLevels = [
  {
    id: 'sedentario',
    title: 'Sedentário',
    description: 'Pouco ou nenhum exercício',
    icon: '🛋️'
  },
  {
    id: 'leve',
    title: 'Levemente Ativo',
    description: 'Exercícios leves 1-3 dias por semana',
    icon: '🚶'
  },
  {
    id: 'moderado',
    title: 'Moderadamente Ativo',
    description: 'Exercícios moderados 3-5 dias por semana',
    icon: '🏃'
  },
  {
    id: 'ativo',
    title: 'Muito Ativo',
    description: 'Exercícios intensos 6-7 dias por semana',
    icon: '💪'
  },
  {
    id: 'atleta',
    title: 'Atleta',
    description: 'Treinos intensos 2x por dia ou esporte profissional',
    icon: '🏆'
  }
];

const frequencies = [
  { id: 'nunca', title: 'Nunca pratiquei exercícios regularmente' },
  { id: '1-2', title: '1-2 vezes por semana' },
  { id: '3-4', title: '3-4 vezes por semana' },
  { id: '5-6', title: '5-6 vezes por semana' },
  { id: 'diario', title: 'Todos os dias' }
];

const commonInjuries = [
  'Lesão no joelho',
  'Dor nas costas',
  'Lesão no ombro',
  'Dor no pescoço',
  'Lesão no tornozelo',
  'Tendinite',
  'Hérnia de disco',
  'Lesão no punho'
];

export function ActivityLevelStep({ formData, updateFormData }: ActivityLevelStepProps) {
  const toggleInjury = (injury: string) => {
    const currentInjuries = formData.injuries || [];
    const newInjuries = currentInjuries.includes(injury)
      ? currentInjuries.filter(i => i !== injury)
      : [...currentInjuries, injury];
    
    updateFormData({ injuries: newInjuries });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-medium text-foreground">Nível de Atividade</h2>
        <p className="text-muted-foreground">Qual seu condicionamento físico atual?</p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Nível de Atividade Atual */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Nível de Atividade Atual *
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {activityLevels.map((level) => {
              const isSelected = formData.currentActivityLevel === level.id;
              
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => updateFormData({ currentActivityLevel: level.id })}
                  className={`
                    p-4 border-2 rounded-lg text-left transition-all hover:shadow-sm
                    ${isSelected 
                      ? 'border-[#e0093e] bg-[#e0093e]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{level.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{level.title}</h3>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
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

        {/* Frequência de Exercícios */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Frequência de Exercícios *
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {frequencies.map((freq) => {
              const isSelected = formData.exerciseFrequency === freq.id;
              
              return (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => updateFormData({ exerciseFrequency: freq.id })}
                  className={`
                    p-3 border rounded-lg text-left transition-all
                    ${isSelected 
                      ? 'border-[#e0093e] bg-[#e0093e]/5 text-[#e0093e]' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {freq.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lesões */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="hasInjuries"
              checked={formData.hasInjuries}
              onCheckedChange={(checked) => updateFormData({ hasInjuries: !!checked })}
            />
            <Label htmlFor="hasInjuries" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Tenho lesões ou limitações físicas
            </Label>
          </div>

          {formData.hasInjuries && (
            <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <Label className="text-sm font-medium text-orange-900">
                Selecione suas lesões ou limitações:
              </Label>
              <div className="flex flex-wrap gap-2">
                {commonInjuries.map((injury) => {
                  const isSelected = (formData.injuries || []).includes(injury);
                  
                  return (
                    <Badge
                      key={injury}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer ${
                        isSelected ? 'bg-[#e0093e] hover:bg-[#e0093e]/90' : ''
                      }`}
                      onClick={() => toggleInjury(injury)}
                    >
                      {injury}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medicalConditions" className="text-sm">
                  Outras condições médicas ou observações:
                </Label>
                <Textarea
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) => updateFormData({ medicalConditions: e.target.value })}
                  placeholder="Descreva outras condições, medicamentos ou observações importantes..."
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">🛡️ Segurança em Primeiro Lugar</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Informações confidenciais e protegidas</li>
            <li>• Ajudam seu treinador a criar um programa seguro</li>
            <li>• Evitam lesões e maximizam resultados</li>
          </ul>
        </div>
      </div>
    </div>
  );
}