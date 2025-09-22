import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Clock, Award, Users, CheckCircle } from 'lucide-react';
import { FormData } from '../BecomeTrainer';

interface AdditionalInfoStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export function AdditionalInfoStep({ formData, updateFormData }: AdditionalInfoStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Informações Adicionais</h2>
        <p className="text-gray-600">Últimos detalhes para completar seu perfil</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Years of Experience */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Award className="h-4 w-4 text-gray-500" />
            Quantos anos de experiência você tem? *
          </Label>
          <Select 
            value={formData.experienceYears} 
            onValueChange={(value) => updateFormData({ experienceYears: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione sua experiência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="menos-1">Menos de 1 ano</SelectItem>
              <SelectItem value="1-2">1 a 2 anos</SelectItem>
              <SelectItem value="3-5">3 a 5 anos</SelectItem>
              <SelectItem value="6-10">6 a 10 anos</SelectItem>
              <SelectItem value="mais-10">Mais de 10 anos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Response Time */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            Qual seu tempo médio de resposta? *
          </Label>
          <Select 
            value={formData.responseTime} 
            onValueChange={(value) => updateFormData({ responseTime: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Tempo de resposta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="imediato">Imediato (até 30 min)</SelectItem>
              <SelectItem value="1-hora">Até 1 hora</SelectItem>
              <SelectItem value="2-horas">Até 2 horas</SelectItem>
              <SelectItem value="4-horas">Até 4 horas</SelectItem>
              <SelectItem value="12-horas">Até 12 horas</SelectItem>
              <SelectItem value="24-horas">Até 24 horas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Students Count */}
        <div className="space-y-3 md:col-span-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            Quantos alunos você já atendeu? *
          </Label>
          <Select 
            value={formData.studentsCount} 
            onValueChange={(value) => updateFormData({ studentsCount: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Número aproximado de alunos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="iniciante">Estou começando (0-5 alunos)</SelectItem>
              <SelectItem value="poucos">Poucos alunos (5-20)</SelectItem>
              <SelectItem value="moderado">Experiência moderada (20-50)</SelectItem>
              <SelectItem value="experiente">Bastante experiente (50-100)</SelectItem>
              <SelectItem value="muito-experiente">Muito experiente (100-200)</SelectItem>
              <SelectItem value="expert">Expert (200+ alunos)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Success Preview */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">🎉 Você está quase lá!</h4>
            <p className="text-gray-700">
              Parabéns por completar seu cadastro! Após finalizar, você receberá:
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Acesso ao painel do treinador</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Perfil público na plataforma</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Notificações de alunos interessados</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Ferramentas de gestão e comunicação</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Experience Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <h5 className="font-medium text-blue-900 mb-2">Resposta Rápida</h5>
          <p className="text-xs text-blue-800">
            Treinadores que respondem rapidamente têm 70% mais chances de conseguir alunos
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <h5 className="font-medium text-purple-900 mb-2">Experiência Conta</h5>
          <p className="text-xs text-purple-800">
            Anos de experiência aumentam a confiança dos alunos em seu trabalho
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="h-5 w-5 text-orange-600" />
          </div>
          <h5 className="font-medium text-orange-900 mb-2">Portfólio Forte</h5>
          <p className="text-xs text-orange-800">
            Histórico de alunos atendidos demonstra sua capacidade profissional
          </p>
        </div>
      </div>

      {/* Final Encouragement */}
      <div className="text-center space-y-4 pt-4">
        <div className="text-4xl">🚀</div>
        <h3 className="text-xl font-semibold text-gray-900">
          Pronto para transformar vidas através do esporte?
        </h3>
        <p className="text-gray-600">
          Seus futuros alunos estão esperando por você. Vamos começar essa jornada juntos!
        </p>
      </div>
    </div>
  );
}