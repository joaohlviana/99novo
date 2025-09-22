"use client";

import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  FileText, 
  MessageCircle, 
  Video,
  CheckCircle,
  Info
} from 'lucide-react';
import type { ProgramData } from '../../../services/training-programs-simple.service';

interface DeliveryModeStepProps {
  data: ProgramData;
  onUpdate: (data: Partial<ProgramData>) => void;
  loading?: boolean;
}

const deliveryModes = [
  {
    id: 'PDF',
    title: 'Material PDF',
    description: 'Entrega através de arquivos PDF com exercícios, dietas e orientações',
    icon: FileText,
    features: [
      'Fácil de compartilhar',
      'Acesso offline',
      'Formato universal',
      'Imprimível'
    ],
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    iconColor: 'text-blue-600'
  },
  {
    id: 'Consultoria',
    title: 'Consultoria Personalizada',
    description: 'Atendimento direto com acompanhamento personalizado via chat/chamadas',
    icon: MessageCircle,
    features: [
      'Suporte em tempo real',
      'Ajustes personalizados',
      'Feedback contínuo',
      'Relacionamento próximo'
    ],
    color: 'bg-green-50 border-green-200 text-green-900',
    iconColor: 'text-green-600'
  },
  {
    id: 'Video',
    title: 'Vídeo Aulas',
    description: 'Aulas gravadas ou ao vivo com demonstrações práticas dos exercícios',
    icon: Video,
    features: [
      'Demonstrações visuais',
      'Aprenda observando',
      'Pode repetir quantas vezes quiser',
      'Experiência imersiva'
    ],
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    iconColor: 'text-purple-600'
  }
];

export function DeliveryModeStep({ data, onUpdate, loading }: DeliveryModeStepProps) {
  const currentDeliveryMode = data.delivery_mode || '';

  const handleDeliveryModeSelect = (modeId: string) => {
    console.log('🚚 Selecionando modalidade de entrega:', modeId);
    onUpdate({ delivery_mode: modeId });
  };

  return (
    <div className="space-y-6">
      {/* Header Explicativo */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Como você vai entregar seu programa?
              </h3>
              <p className="text-sm text-blue-700">
                Escolha o formato principal de entrega do seu programa de treinamento. 
                Isso ajudará seus clientes a entender o que esperar e como receberão o conteúdo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modalidades de Entrega */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Selecione a Modalidade de Entrega
        </h3>
        
        <div className="grid gap-4">
          {deliveryModes.map((mode) => {
            const isSelected = currentDeliveryMode === mode.id;
            const Icon = mode.icon;
            
            return (
              <Card 
                key={mode.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-brand border-brand shadow-lg' 
                    : 'hover:shadow-md border-gray-200'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !loading && handleDeliveryModeSelect(mode.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Ícone e Indicador de Seleção */}
                    <div className="relative">
                      <div className={`p-3 rounded-lg ${mode.color}`}>
                        <Icon className={`h-6 w-6 ${mode.iconColor}`} />
                      </div>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-brand text-white rounded-full p-1">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {mode.title}
                        </h4>
                        {isSelected && (
                          <Badge className="bg-brand text-white">
                            Selecionado
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        {mode.description}
                      </p>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-2">
                        {mode.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                            <div className={`w-1.5 h-1.5 rounded-full ${mode.iconColor.replace('text-', 'bg-')}`} />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botão de Seleção */}
                    <div className="flex items-center">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={isSelected ? "bg-brand hover:bg-brand-hover" : ""}
                        disabled={loading}
                      >
                        {isSelected ? 'Selecionado' : 'Selecionar'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Resumo da Seleção */}
      {currentDeliveryMode && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900">
                  Modalidade Selecionada: {deliveryModes.find(m => m.id === currentDeliveryMode)?.title}
                </h4>
                <p className="text-sm text-green-700">
                  Você pode alterar esta opção a qualquer momento durante a criação do programa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informação Adicional */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-gray-900 mb-3">
            💡 Dica para Treinadores
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • <strong>PDF:</strong> Ideal para programas estruturados e clientes que preferem material físico
            </p>
            <p>
              • <strong>Consultoria:</strong> Perfeito para acompanhamento personalizado e resultados premium
            </p>
            <p>
              • <strong>Vídeo:</strong> Excelente para exercícios complexos que precisam de demonstração visual
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}