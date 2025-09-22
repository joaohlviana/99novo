/**
 * 🏋️ PROGRAM CREATION SIMPLE
 * 
 * Componente simplificado para criação de programas de treinamento
 * Arquitetura inspirada no ProfileManagement.tsx
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Eye, 
  Check,
  Info,
  FileText,
  Settings,
  DollarSign,
  Camera,
  Rocket,
  Loader2,
  Truck,
  Trophy
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { BasicInfoStep } from './program-creation/BasicInfoStep';
import { SportsSelectionStep } from './program-creation/SportsSelectionStep';
import { DescriptionStep } from './program-creation/DescriptionStep';
import { StructureStep } from './program-creation/StructureStep';
import { DeliveryModeStep } from './program-creation/DeliveryModeStep';
import { PricingStep } from './program-creation/PricingStep';
import { GalleryStep } from './program-creation/GalleryStep';
import { PublishStep } from './program-creation/PublishStep';
import { useTrainingProgramsSimple } from '../../hooks/useTrainingProgramsSimple';
import type { ProgramData } from '../../services/training-programs-simple.service';

// ============================================
// CONFIGURAÇÃO DOS PASSOS
// ============================================

const STEPS = [
  { 
    id: 'basic-info', 
    title: 'Informações Básicas',
    description: 'Título, categoria e modalidade',
    icon: Info,
    component: BasicInfoStep 
  },
  { 
    id: 'sports-selection', 
    title: 'Seleção de Esportes',
    description: 'Esporte principal e secundários',
    icon: Trophy,
    component: SportsSelectionStep 
  },
  { 
    id: 'description', 
    title: 'Descrição e Objetivos',
    description: 'Detalhes e o que será ensinado',
    icon: FileText,
    component: DescriptionStep 
  },
  { 
    id: 'structure', 
    title: 'Estrutura do Programa',
    description: 'Módulos, aulas e duração',
    icon: Settings,
    component: StructureStep 
  },
  { 
    id: 'delivery-mode', 
    title: 'Modalidade de Entrega',
    description: 'Como o programa será entregue',
    icon: Truck,
    component: DeliveryModeStep 
  },
  { 
    id: 'pricing', 
    title: 'Preços e Planos',
    description: 'Valores e formas de pagamento',
    icon: DollarSign,
    component: PricingStep 
  },
  { 
    id: 'gallery', 
    title: 'Galeria e Mídia',
    description: 'Fotos, vídeos e imagens',
    icon: Camera,
    component: GalleryStep 
  },
  { 
    id: 'publish', 
    title: 'Revisar e Publicar',
    description: 'Verificar e publicar programa',
    icon: Rocket,
    component: PublishStep 
  }
] as const;

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface ProgramCreationSimpleProps {
  programId?: string;
  onBack?: () => void;
  onSave?: (programId: string) => void;
}

export function ProgramCreationSimple({ 
  programId, 
  onBack, 
  onSave 
}: ProgramCreationSimpleProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  const {
    currentProgram,
    loading,
    saving,
    error,
    isDirty,
    loadProgram,
    createProgram,
    updateCurrentProgram,
    saveCurrentProgram,
    setCurrentProgram,
    publishProgram,
    unpublishProgram
  } = useTrainingProgramsSimple();

  // ============================================
  // CARREGAR PROGRAMA (SE EDITANDO)
  // ============================================

  useEffect(() => {
    if (programId) {
      loadProgram(programId);
    } else {
      // Criar novo programa
      createProgram({
        title: 'Novo Programa',
        category: 'Geral',
        modality: 'Presencial',
        level: 'Iniciante',
        duration: 4,
        frequency: 3,
        base_price: 0
      });
    }
  }, [programId]);

  // ============================================
  // FUNÇÕES DE NAVEGAÇÃO
  // ============================================

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleStepClick = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  // ============================================
  // FUNÇÕES DE DADOS
  // ============================================

  const handleDataChange = useCallback((newData: Partial<ProgramData>) => {
    console.log('📝 Atualizando dados do programa:', newData);
    
    // O hook já trata a separação entre campos estruturados e JSONB
    updateCurrentProgram(newData);
  }, [updateCurrentProgram]);

  const handleSave = useCallback(async () => {
    try {
      await saveCurrentProgram();
      if (onSave && currentProgram?.id) {
        onSave(currentProgram.id);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  }, [saveCurrentProgram, onSave, currentProgram?.id]);

  const handlePublish = useCallback(async () => {
    if (!currentProgram?.id) return;
    
    try {
      await publishProgram(currentProgram.id);
      toast.success('Programa publicado com sucesso!');
    } catch (error) {
      console.error('Erro ao publicar:', error);
    }
  }, [currentProgram?.id, publishProgram]);

  // ============================================
  // VALIDAÇÃO DOS PASSOS
  // ============================================

  const stepValidation = useMemo(() => {
    if (!currentProgram) return {};

    const data = currentProgram.program_data || {};
    
    return {
      1: !!(currentProgram.title && currentProgram.category && currentProgram.modality && currentProgram.level), // Básico
      2: !!(data.sports?.primary), // Esportes
      3: !!(data.shortDescription && data.fullDescription), // Descrição
      4: !!(currentProgram.duration && data.programType), // Estrutura
      5: !!(data.delivery_mode), // Modalidade de Entrega
      6: !!(currentProgram.base_price !== undefined && currentProgram.base_price >= 0), // Preços
      7: !!(data.coverImage), // Galeria
      8: !!(currentProgram.is_published) // Publicação
    };
  }, [currentProgram]);

  // ============================================
  // CÁLCULO DE PROGRESSO
  // ============================================

  const progressPercentage = useMemo(() => {
    const validSteps = Object.values(stepValidation).filter(Boolean).length;
    return Math.round((validSteps / STEPS.length) * 100);
  }, [stepValidation]);

  // ============================================
  // COMPONENTE ATUAL
  // ============================================

  const CurrentStepComponent = STEPS[currentStep - 1]?.component;
  const currentStepInfo = STEPS[currentStep - 1];

  // ============================================
  // ESTADOS DE CARREGAMENTO
  // ============================================

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand" />
          <p className="text-muted-foreground">Carregando programa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!currentProgram) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Programa não encontrado</p>
          <Button onClick={onBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header apenas para esta seção */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {programId ? 'Editar Programa' : 'Criar Novo Programa'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Complete todas as etapas para publicar seu programa
              </p>
            </div>
            
            {/* Botão de voltar */}
            {onBack && (
              <Button onClick={onBack} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progresso do programa</span>
              <span>{progressPercentage}% completo</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-8">
        <div className="w-full px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Navegação dos Passos */}
            <div className="w-full lg:w-80 lg:flex-shrink-0">
              {/* Mobile: horizontal scroll */}
              <div className="lg:hidden mb-6 sticky top-0 z-40 bg-white/95 backdrop-blur-sm py-2 -mx-4 px-4">
                <div className="overflow-x-auto">
                  <div className="flex gap-1 pb-2 min-w-max">
                    {STEPS.map((step, index) => (
                      <button
                        key={step.id}
                        onClick={() => handleStepClick(index + 1)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-full transition-colors whitespace-nowrap ${
                          currentStep === index + 1
                            ? 'bg-brand text-white'
                            : stepValidation[index + 1]
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <step.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{step.title}</span>
                        <span className="sm:hidden">{index + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop: vertical sidebar */}
              <div className="hidden lg:block">
                <div className="bg-white rounded-lg border p-4 shadow-sm sticky top-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Etapas do Programa</h3>
                  <nav className="space-y-2">
                    {STEPS.map((step, index) => {
                      const stepNumber = index + 1;
                      const isActive = currentStep === stepNumber;
                      const isCompleted = stepValidation[stepNumber];
                      
                      return (
                        <button
                          key={step.id}
                          onClick={() => handleStepClick(stepNumber)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                            isActive
                              ? 'bg-brand text-white'
                              : isCompleted
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            isActive
                              ? 'bg-white/20'
                              : isCompleted
                              ? 'bg-green-100'
                              : 'bg-gray-100'
                          }`}>
                            <step.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{step.title}</div>
                            <div className={`text-xs ${
                              isActive ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              {step.description}
                            </div>
                          </div>
                          {isCompleted && !isActive && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </button>
                      );
                    })}
                  </nav>

                  {/* Indicador de Esporte Principal */}
                  {currentProgram?.program_data?.sports?.primary && (
                    <div className="mt-4 p-3 bg-brand/5 rounded-lg border border-brand/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-brand rounded-full"></div>
                        <span className="text-xs font-medium text-brand uppercase tracking-wide">
                          Esporte Principal
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {currentProgram.program_data.sports.primary.name}
                      </div>
                      {currentProgram.program_data.sports.secondary && currentProgram.program_data.sports.secondary.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          +{currentProgram.program_data.sports.secondary.length} secundário{currentProgram.program_data.sports.secondary.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="w-full lg:flex-1">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {currentStepInfo && (
                          <>
                            <currentStepInfo.icon className="h-5 w-5 text-brand" />
                            {currentStepInfo.title}
                          </>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentStepInfo?.description}
                      </p>
                    </div>
                    <Badge variant={stepValidation[currentStep] ? 'default' : 'secondary'}>
                      Passo {currentStep} de {STEPS.length}
                    </Badge>
                  </div>
                  <Separator />
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Render do componente do passo atual */}
                  {CurrentStepComponent && (
                    <CurrentStepComponent
                      data={{
                        // Campos estruturados do programa
                        title: currentProgram.title,
                        category: currentProgram.category,
                        modality: currentProgram.modality, // Manter valor original
                        level: currentProgram.level,
                        duration: currentProgram.duration,
                        duration_type: currentProgram.duration_type || 'weeks',
                        frequency: currentProgram.frequency,
                        base_price: currentProgram.base_price,
                        // Campos do JSONB
                        ...currentProgram.program_data,
                        // Garantir que campos importantes existem
                        tags: currentProgram.program_data?.tags || [],
                        schedule: currentProgram.program_data?.schedule || [],
                        shortDescription: currentProgram.program_data?.shortDescription || '',
                        objectives: currentProgram.program_data?.objectives || [],
                        whatYouGet: currentProgram.program_data?.whatYouGet || [],
                        coverImage: currentProgram.program_data?.coverImage,
                        galleryImages: currentProgram.program_data?.galleryImages || [],
                        delivery_mode: currentProgram.program_data?.delivery_mode || '', // Novo campo
                        sports: currentProgram.program_data?.sports || { primary: null, secondary: [] } // Dados de esportes
                      }}
                      onUpdate={handleDataChange}
                      loading={saving}
                    />
                  )}



                  {/* Navegação entre passos */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Anterior
                    </Button>

                    <div className="flex items-center gap-2">
                      {/* Save Button */}
                      {isDirty && (
                        <Button
                          variant="outline"
                          onClick={async () => {
                            try {
                              await handleSave();
                              // Confirmação visual temporária
                              const button = document.querySelector('[data-save-button]') as HTMLButtonElement;
                              if (button) {
                                const originalText = button.innerHTML;
                                button.innerHTML = '<svg class="h-4 w-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Salvo!';
                                button.className = button.className.replace('border-gray-300', 'border-green-300 bg-green-50 text-green-700');
                                setTimeout(() => {
                                  button.innerHTML = originalText;
                                  button.className = button.className.replace('border-green-300 bg-green-50 text-green-700', 'border-gray-300');
                                }, 2000);
                              }
                            } catch (error) {
                              console.error('Erro ao salvar:', error);
                            }
                          }}
                          disabled={saving}
                          className="gap-2"
                          data-save-button
                        >
                          <Save className="h-4 w-4" />
                          Salvar
                        </Button>
                      )}

                      {/* Next/Publish Button */}
                      {currentStep < STEPS.length ? (
                        <Button
                          onClick={handleNext}
                          className="bg-brand hover:bg-brand-hover gap-2"
                        >
                          Próximo
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handlePublish}
                          disabled={saving || !stepValidation[7]}
                          className="bg-brand hover:bg-brand-hover gap-2"
                        >
                          <Rocket className="h-4 w-4" />
                          Publicar Programa
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgramCreationSimple;