import { CheckCircle, Heart, Target, Trophy } from 'lucide-react';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ClientFormData } from '../BecomeClient';

interface FinalStepProps {
  formData: ClientFormData;
  updateFormData: (data: Partial<ClientFormData>) => void;
}

export function FinalStep({ formData, updateFormData }: FinalStepProps) {
  const getGoalTitle = (goalId: string) => {
    const goals: Record<string, string> = {
      'perder-peso': 'Perder Peso',
      'ganhar-massa': 'Ganhar Massa Muscular',
      'definir-corpo': 'Definir o Corpo',
      'condicionamento': 'Melhorar Condicionamento',
      'saude-geral': 'Saúde Geral',
      'performance': 'Performance Esportiva'
    };
    return goals[goalId] || goalId;
  };

  const getServiceModeTitle = (mode: string) => {
    const modes: Record<string, string> = {
      'online': 'Apenas Online',
      'presencial': 'Apenas Presencial',
      'ambos': 'Online + Presencial'
    };
    return modes[mode] || mode;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-medium text-foreground">Finalização</h2>
        <p className="text-muted-foreground">Quase pronto para encontrar seu treinador!</p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Resumo do Perfil */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#e0093e]" />
            Resumo do seu Perfil
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Nome Completo</Label>
                <p className="text-foreground">{formData.firstName} {formData.lastName}</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Objetivo Principal</Label>
                <p className="text-foreground">{getGoalTitle(formData.primaryGoal)}</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Modalidades de Interesse</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.preferredWorkoutTypes.slice(0, 3).map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Modalidade de Atendimento</Label>
                <p className="text-foreground">{getServiceModeTitle(formData.serviceMode)}</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Duração Preferida</Label>
                <p className="text-foreground">{formData.workoutDuration?.replace('min', ' minutos') || 'Não informado'}</p>
              </div>
              
              {formData.cities && formData.cities.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Cidades</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.cities.slice(0, 3).map((city) => (
                      <Badge key={city} variant="outline" className="text-xs">
                        {city}
                      </Badge>
                    ))}
                    {formData.cities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{formData.cities.length - 3} mais
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Motivação */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            O que te motiva a buscar um treinador? *
          </Label>
          <Textarea
            value={formData.motivation}
            onChange={(e) => updateFormData({ motivation: e.target.value })}
            placeholder="Conte-nos sobre sua motivação, experiências anteriores, ou qualquer coisa que considere importante para encontrar o treinador ideal..."
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Esta informação ajuda os treinadores a entenderem melhor seu perfil.
          </p>
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-4">
          <Label>Informações Adicionais (opcional)</Label>
          <Textarea
            value={formData.additionalInfo}
            onChange={(e) => updateFormData({ additionalInfo: e.target.value })}
            placeholder="Alguma informação adicional que gostaria de compartilhar com os treinadores..."
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Próximos Passos */}
        <div className="bg-gradient-to-r from-[#e0093e]/10 to-[#e0093e]/5 border border-[#e0093e]/20 rounded-lg p-6">
          <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-[#e0093e]" />
            Próximos Passos
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#e0093e] text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium text-foreground">Criação do Perfil</h4>
                <p className="text-sm text-muted-foreground">Seu perfil será criado e você receberá um email de confirmação.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#e0093e] text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium text-foreground">Busca por Treinadores</h4>
                <p className="text-sm text-muted-foreground">Navegue pela nossa plataforma e encontre treinadores que combinam com seu perfil.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#e0093e] text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium text-foreground">Primeira Conversa</h4>
                <p className="text-sm text-muted-foreground">Entre em contato com treinadores e agende uma conversa inicial gratuita.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">🎉 Parabéns!</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Seu perfil ajudará treinadores a entender suas necessidades</li>
            <li>• Você pode atualizar suas informações a qualquer momento</li>
            <li>• Nossa equipe está sempre disponível para ajudar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}