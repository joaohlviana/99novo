"use client";

import { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';

// Step Components
import { BasicInfoStep } from './program-creation/BasicInfoStep';
import { DescriptionStep } from './program-creation/DescriptionStep';
import { StructureStep } from './program-creation/StructureStep';
import { PricingStep } from './program-creation/PricingStep';
import { GalleryStep } from './program-creation/GalleryStep';
import { PublishStep } from './program-creation/PublishStep';

// Hooks e Services
import { useTrainingPrograms } from '../../hooks/useTrainingPrograms';
import { ProgramData, programDataToJsonb, jsonbToProgramData } from '../../types/training-program';

interface ProgramCreationProps {
  editingProgramId?: string;
  onSuccess?: (programId: string) => void;
  onCancel: () => void;
}

const steps = [
  {
    id: 1,
    title: 'Informações Básicas',
    icon: Info,
    description: 'Título, categoria e modalidade'
  },
  {
    id: 2,
    title: 'Descrição & Detalhes',
    icon: FileText,
    description: 'Descrição completa e objetivos'
  },
  {
    id: 3,
    title: 'Estrutura do Programa',
    icon: Settings,
    description: 'Duração, frequência e cronograma'
  },
  {
    id: 4,
    title: 'Preços & Pacotes',
    icon: DollarSign,
    description: 'Definir preços e opções'
  },
  {
    id: 5,
    title: 'Galeria & Mídia',
    icon: Camera,
    description: 'Fotos e vídeos do programa'
  },
  {
    id: 6,
    title: 'Publicação & Revisão',
    icon: Rocket,
    description: 'Revisar e publicar'
  }
];

export function ProgramCreation({ editingProgramId, onSuccess, onCancel }: ProgramCreationProps) {
  console.log(`🏗️ [ProgramCreation] Componente inicializando:`, {
    editingProgramId,
    hasOnSuccess: !!onSuccess,
    hasOnCancel: !!onCancel,
    timestamp: new Date().toISOString()
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [programData, setProgramData] = useState<ProgramData>({
    title: '',
    category: '',
    modality: '',
    level: '',
    tags: [],
    description: '',
    objectives: [],
    requirements: [],
    whatYouGet: [],
    duration: 12,
    durationType: 'weeks',
    frequency: 3,
    sessionDuration: 60,
    schedule: [],
    packages: [
      {
        name: 'Básico',
        price: 197,
        description: 'Programa completo',
        features: ['Acesso ao programa', 'Suporte via WhatsApp'],
        deliveryTime: 1,
        revisions: 1
      }
    ],
    addOns: [],
    coverImage: '',
    gallery: [],
    videos: [],
    isPublished: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [saving, setSaving] = useState(false);
  const [currentProgramId, setCurrentProgramId] = useState<string | null>(editingProgramId || null);
  
  // Hook para operações de programas
  const { 
    createProgram, 
    updateProgram, 
    publishProgram,
    loadProgram,
    loading,
    error
  } = useTrainingPrograms();

  // Debug do hook state
  console.log(`🎣 [ProgramCreation] Hook useTrainingPrograms state:`, {
    loading,
    error,
    hasFunctions: {
      createProgram: !!createProgram,
      updateProgram: !!updateProgram,
      publishProgram: !!publishProgram,
      loadProgram: !!loadProgram
    }
  });

  const isEditing = !!editingProgramId;
  const progress = (currentStep / steps.length) * 100;

  // Carregar programa para edição
  useEffect(() => {
    console.log(`🔄 [ProgramCreation] useEffect - carregamento programa:`, { 
      editingProgramId,
      isEditing 
    });
    
    if (editingProgramId) {
      console.log(`📖 [ProgramCreation] Carregando programa para edição:`, editingProgramId);
      
      loadProgram(editingProgramId).then(program => {
        if (program) {
          console.log(`✅ [ProgramCreation] Programa carregado:`, {
            id: program.id,
            title: program.title,
            category: program.category,
            is_published: program.is_published,
            status: program.status,
            base_price: program.base_price,
            program_data_keys: Object.keys(program.program_data || {})
          });
          
          console.log(`🔄 [ProgramCreation] Programa carregado (já convertido):`, {
            title: program.title,
            category: program.category,
            modality: program.modality,
            packages: program.packages?.length || 0,
            isPublished: program.isPublished
          });
          
          setProgramData(program);
          setCurrentProgramId(program.id);
        } else {
          console.error(`❌ [ProgramCreation] Programa não encontrado:`, editingProgramId);
          toast.error('Programa não encontrado');
        }
      }).catch(error => {
        console.error(`💥 [ProgramCreation] Erro ao carregar programa:`, error);
        toast.error('Erro ao carregar programa');
      });
    } else {
      console.log(`➕ [ProgramCreation] Modo criação - novo programa`);
    }
  }, [editingProgramId, loadProgram]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  const handleSave = async () => {
    console.log(`💾 [ProgramCreation] handleSave iniciado:`, {
      currentProgramId,
      isEditing,
      programData: {
        title: programData.title,
        category: programData.category,
        modality: programData.modality,
        level: programData.level,
        duration: programData.duration,
        packages: programData.packages?.length || 0
      }
    });

    try {
      setSaving(true);
      
      if (currentProgramId) {
        console.log(`🔄 [ProgramCreation] Atualizando programa existente:`, currentProgramId);
        
        // Atualizar programa existente
        console.log(`🔄 [ProgramCreation] Atualizando com dados do programa:`, {
          title: programData.title,
          category: programData.category,
          packages_count: programData.packages?.length || 0
        });
        
        const updatedProgram = await updateProgram(currentProgramId, programData);
        
        if (updatedProgram) {
          console.log(`✅ [ProgramCreation] Programa atualizado com sucesso:`, updatedProgram.id);
          toast.success('Programa salvo como rascunho!');
        } else {
          console.error(`❌ [ProgramCreation] Falha ao atualizar programa`);
          toast.error('Erro ao atualizar programa');
        }
      } else {
        console.log(`➕ [ProgramCreation] Criando novo programa`);
        
        // Criar novo programa
        console.log(`➕ [ProgramCreation] Dados do novo programa:`, {
          title: programData.title,
          category: programData.category,
          modality: programData.modality,
          level: programData.level,
          duration: programData.duration,
          durationType: programData.durationType,
          frequency: programData.frequency,
          packages_count: programData.packages?.length || 0
        });
        
        const newProgram = await createProgram(programData);
        
        if (newProgram) {
          console.log(`✅ [ProgramCreation] Programa criado com sucesso:`, {
            title: newProgram.title,
            category: newProgram.category,
            packages: newProgram.packages?.length || 0
          });
          setCurrentProgramId(newProgram.createdAt); // Usar createdAt como ID único
          toast.success('Programa criado como rascunho!');
        } else {
          console.error(`❌ [ProgramCreation] Falha ao criar programa`);
          toast.error('Erro ao criar programa');
        }
      }
    } catch (error) {
      console.error('💥 [ProgramCreation] Erro ao salvar programa:', error);
      toast.error('Erro ao salvar programa: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setSaving(false);
      console.log(`💾 [ProgramCreation] handleSave finalizado`);
    }
  };

  const handlePublish = async () => {
    console.log(`🚀 [ProgramCreation] handlePublish iniciado:`, {
      currentProgramId,
      hasRequiredFields: !!(programData.title && programData.category),
      programValidation: {
        title: !!programData.title,
        category: !!programData.category,
        modality: !!programData.modality,
        level: !!programData.level,
        packages: programData.packages?.length > 0
      }
    });

    try {
      setSaving(true);
      
      // Primeiro salvar se necessário
      if (!currentProgramId) {
        console.log(`💾 [ProgramCreation] Programa não existe, salvando primeiro...`);
        await handleSave();
        if (!currentProgramId) {
          console.error(`❌ [ProgramCreation] Falha ao criar programa antes de publicar`);
          toast.error('Erro ao criar programa antes de publicar');
          return;
        }
        console.log(`✅ [ProgramCreation] Programa salvo, ID:`, currentProgramId);
      }
      
      // Validação antes de publicar
      if (!programData.title || !programData.category) {
        console.error(`❌ [ProgramCreation] Dados obrigatórios faltando:`, {
          title: !!programData.title,
          category: !!programData.category
        });
        toast.error('Título e categoria são obrigatórios para publicar');
        return;
      }
      
      // Depois publicar
      console.log(`📢 [ProgramCreation] Publicando programa:`, currentProgramId);
      const success = await publishProgram(currentProgramId);
      
      if (success) {
        console.log(`✅ [ProgramCreation] Programa publicado com sucesso:`, currentProgramId);
        toast.success('Programa publicado com sucesso!');
        if (onSuccess) {
          console.log(`🎯 [ProgramCreation] Chamando onSuccess callback`);
          onSuccess(currentProgramId);
        }
      } else {
        console.error(`❌ [ProgramCreation] Falha ao publicar programa`);
        toast.error('Erro ao publicar programa');
      }
    } catch (error) {
      console.error('💥 [ProgramCreation] Erro ao publicar programa:', error);
      toast.error('Erro ao publicar programa: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setSaving(false);
      console.log(`🚀 [ProgramCreation] handlePublish finalizado`);
    }
  };

  const updateProgramData = (data: Partial<ProgramData>) => {
    console.log(`📝 [ProgramCreation] updateProgramData chamado:`, {
      currentStep,
      updatedFields: Object.keys(data),
      newData: {
        title: data.title || 'unchanged',
        category: data.category || 'unchanged',
        modality: data.modality || 'unchanged',
        packages: data.packages?.length || 'unchanged'
      },
      currentTitle: programData.title
    });
    
    setProgramData(prev => {
      const updated = { ...prev, ...data };
      console.log(`📝 [ProgramCreation] Program data updated:`, {
        title: updated.title,
        category: updated.category,
        modality: updated.modality,
        level: updated.level,
        packages: updated.packages?.length || 0,
        isValid: !!(updated.title && updated.category)
      });
      return updated;
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={programData}
            onUpdate={updateProgramData}
          />
        );
      case 2:
        return (
          <DescriptionStep
            data={programData}
            onUpdate={updateProgramData}
          />
        );
      case 3:
        return (
          <StructureStep
            data={programData}
            onUpdate={updateProgramData}
          />
        );
      case 4:
        return (
          <PricingStep
            data={programData}
            onUpdate={updateProgramData}
          />
        );
      case 5:
        return (
          <GalleryStep
            data={programData}
            onUpdate={updateProgramData}
          />
        );
      case 6:
        return (
          <PublishStep
            data={programData}
            onUpdate={updateProgramData}
            onPublish={handlePublish}
            isEditing={isEditing}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">
          {isEditing ? 'Editar Programa' : 'Criar Novo Programa'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {isEditing 
            ? 'Atualize as informações do seu programa de treino.'
            : 'Crie um novo programa de treino para seus clientes.'
          }
        </p>
      </div>

      {/* Layout com Sidebar Fixo */}
      <div className="flex gap-6">
        {/* Sidebar Fixo */}
        <div className="w-64 flex-shrink-0 relative">
          <div 
            className="bg-white rounded-lg border p-4 max-h-[calc(100vh-120px)] overflow-y-auto shadow-sm"
            style={{ 
              position: 'sticky', 
              top: '70px',
              zIndex: 10
            }}
          >
            <nav className="space-y-1">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const isAccessible = step.id <= currentStep + 1;

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      console.log(`🔄 [ProgramCreation] Step clicked:`, { 
                        stepId: step.id, 
                        title: step.title,
                        isAccessible,
                        currentStep 
                      });
                      isAccessible && handleStepClick(step.id);
                    }}
                    disabled={!isAccessible}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors text-left ${
                      isActive 
                        ? 'bg-muted text-foreground' 
                        : isCompleted
                          ? 'text-green-700 hover:text-green-800 hover:bg-green-50'
                          : isAccessible
                            ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            : 'text-muted-foreground/50 cursor-not-allowed'
                    }`}
                  >
                    <div className={`
                      flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium mr-3 flex-shrink-0
                      ${isActive 
                        ? 'bg-foreground text-background' 
                        : isCompleted 
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {isCompleted ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span className="truncate">
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </nav>
            
            {/* DEBUG PANEL */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-3 bg-gray-50 rounded-lg border text-xs">
                <div className="font-semibold text-gray-700 mb-2">🐛 Debug Info - Formulário Completo</div>
                <div className="space-y-3 text-gray-600">
                  {/* Status Geral */}
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium text-gray-800 mb-1">📊 Status Geral</div>
                    <div>Step: {currentStep}/{steps.length} ({steps[currentStep - 1]?.title})</div>
                    <div>Program ID: {currentProgramId || 'Novo'}</div>
                    <div>Saving: {saving ? '✅' : '❌'}</div>
                    <div>Loading: {loading ? '✅' : '❌'}</div>
                    <div>Error: {error || 'Nenhum'}</div>
                    <div>Editing: {isEditing ? '✅' : '❌'}</div>
                  </div>

                  {/* Passo 1: Informações Básicas */}
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium text-gray-800 mb-1">1️⃣ Informações Básicas</div>
                    <div>Title: {programData.title || 'Vazio'}</div>
                    <div>Category: {programData.category || 'Vazio'}</div>
                    <div>Modality: {programData.modality || 'Vazio'}</div>
                    <div>Level: {programData.level || 'Vazio'}</div>
                    <div>Tags: {programData.tags?.length ? programData.tags.join(', ') : 'Vazio'}</div>
                  </div>

                  {/* Passo 2: Descrição */}
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium text-gray-800 mb-1">2️⃣ Descrição</div>
                    <div>Short Description: {programData.shortDescription ? `${programData.shortDescription.substring(0, 50)}...` : 'Vazio'}</div>
                    <div>Full Description: {programData.fullDescription ? `${programData.fullDescription.substring(0, 50)}...` : 'Vazio'}</div>
                    <div>What You'll Learn: {programData.whatYouWillLearn?.length || 0} itens</div>
                    <div>Prerequisites: {programData.prerequisites?.length || 0} itens</div>
                    <div>Target Audience: {programData.targetAudience?.length || 0} itens</div>
                  </div>

                  {/* Passo 3: Estrutura */}
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium text-gray-800 mb-1">3️⃣ Estrutura</div>
                    <div>Duration: {programData.duration || 'Vazio'}</div>
                    <div>Duration Type: {programData.durationType || 'Vazio'}</div>
                    <div>Session Duration: {programData.sessionDuration || 'Vazio'}</div>
                    <div>Sessions Per Week: {programData.sessionsPerWeek || 'Vazio'}</div>
                    <div>Program Type: {programData.programType || 'Vazio'}</div>
                    <div>Modules: {programData.modules?.length || 0} módulos</div>
                    <div>Total Lessons: {programData.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0}</div>
                  </div>

                  {/* Passo 4: Preços */}
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium text-gray-800 mb-1">4️⃣ Preços</div>
                    <div>Price: R$ {programData.price || '0,00'}</div>
                    <div>Original Price: R$ {programData.originalPrice || '0,00'}</div>
                    <div>Discount: {programData.discount || 0}%</div>
                    <div>Payment Plans: {programData.paymentPlans?.length || 0} planos</div>
                    <div>Free Trial: {programData.hasFreeTrial ? '✅' : '❌'}</div>
                    <div>Trial Duration: {programData.trialDuration || 0} dias</div>
                  </div>

                  {/* Passo 5: Galeria */}
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium text-gray-800 mb-1">5️⃣ Galeria</div>
                    <div>Cover Image: {programData.coverImage ? '✅' : '❌'}</div>
                    <div>Gallery Images: {programData.galleryImages?.length || 0} imagens</div>
                    <div>Video URL: {programData.videoUrl ? '✅' : '❌'}</div>
                    <div>Video Thumbnail: {programData.videoThumbnail ? '✅' : '❌'}</div>
                  </div>

                  {/* Passo 6: Publicação */}
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium text-gray-800 mb-1">6️⃣ Publicação</div>
                    <div>Status: {programData.status || 'draft'}</div>
                    <div>Is Active: {programData.isActive ? '✅' : '❌'}</div>
                    <div>Published At: {programData.publishedAt || 'Não publicado'}</div>
                    <div>SEO Title: {programData.seoTitle || 'Vazio'}</div>
                    <div>SEO Description: {programData.seoDescription ? `${programData.seoDescription.substring(0, 30)}...` : 'Vazio'}</div>
                    <div>SEO Keywords: {programData.seoKeywords?.length || 0} palavras-chave</div>
                  </div>

                  {/* Metadados JSONB */}
                  <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                    <div className="font-medium text-yellow-800 mb-1">🗄️ Estrutura JSONB</div>
                    <div className="text-yellow-700">
                      <div>JSONB Size: {JSON.stringify(programData).length} chars</div>
                      <div>Created At: {programData.createdAt || 'Não definido'}</div>
                      <div>Updated At: {programData.updatedAt || 'Não definido'}</div>
                    </div>
                  </div>

                  {/* Validação dos Passos */}
                  <div className="bg-blue-50 p-2 rounded border border-blue-200">
                    <div className="font-medium text-blue-800 mb-1">✅ Validação dos Passos</div>
                    <div className="text-blue-700">
                      <div>Passo 1 (Básico): {programData.title && programData.category ? '✅' : '❌'}</div>
                      <div>Passo 2 (Descrição): {programData.shortDescription && programData.fullDescription ? '✅' : '❌'}</div>
                      <div>Passo 3 (Estrutura): {programData.duration && programData.programType ? '✅' : '❌'}</div>
                      <div>Passo 4 (Preços): {programData.price ? '✅' : '❌'}</div>
                      <div>Passo 5 (Galeria): {programData.coverImage ? '✅' : '❌'}</div>
                      <div>Passo 6 (Publicação): {programData.status === 'published' ? '✅' : '❌'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Área de Conteúdo Principal */}
        <div className="flex-1 space-y-6">
          {/* Step Content */}
          <div className="min-h-[600px]">
            {(() => {
              console.log(`🎯 [ProgramCreation] Rendering step content:`, { 
                currentStep, 
                stepTitle: steps[currentStep - 1]?.title,
                programDataKeys: Object.keys(programData).length,
                hasTitle: !!programData.title,
                hasCategory: !!programData.category 
              });
              return renderStepContent();
            })()}
          </div>

          {/* Navigation Buttons */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log(`⬅️ [ProgramCreation] Previous clicked:`, { 
                    currentStep, 
                    willGoTo: currentStep - 1 
                  });
                  handlePrevious();
                }}
                disabled={currentStep === 1}
                className="border-gray-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Etapa {currentStep} de {steps.length}
                </span>
                {/* Progress indicator */}
                <div className="w-16 bg-gray-200 rounded-full h-1.5 ml-2">
                  <div 
                    className="bg-brand h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {currentStep === steps.length ? (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      console.log(`💾 [ProgramCreation] Save Draft clicked:`, { 
                        currentProgramId,
                        programData: {
                          title: programData.title,
                          category: programData.category,
                          modality: programData.modality,
                          hasPackages: programData.packages?.length > 0
                        },
                        isEditing
                      });
                      await handleSave();
                      console.log(`💾 [ProgramCreation] Save completed`);
                    }}
                    disabled={saving || loading}
                    className="border-gray-300"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Rascunho
                  </Button>
                  <Button 
                    onClick={async () => {
                      console.log(`🚀 [ProgramCreation] Publish clicked:`, { 
                        currentProgramId,
                        programData: {
                          title: programData.title,
                          category: programData.category,
                          modality: programData.modality,
                          isValid: !!(programData.title && programData.category)
                        },
                        canPublish: !!(programData.title && programData.category)
                      });
                      await handlePublish();
                      console.log(`🚀 [ProgramCreation] Publish completed`);
                    }}
                    disabled={saving || loading || !programData.title || !programData.category}
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Rocket className="h-4 w-4 mr-2" />
                    )}
                    Publicar Programa
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => {
                    console.log(`➡️ [ProgramCreation] Next clicked:`, { 
                      currentStep, 
                      willGoTo: currentStep + 1,
                      stepData: {
                        title: programData.title,
                        category: programData.category,
                        modality: programData.modality
                      }
                    });
                    handleNext();
                  }}
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
            
            {/* Debug status bar */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Status: {error ? '❌ Error' : '✅ OK'}</span>
                  <span>Operations: Save={saving ? '⏳' : '✅'} Load={loading ? '⏳' : '✅'}</span>
                  <span>Data: {programData.title ? '📝' : '📄'} {programData.packages?.length > 0 ? '💰' : '💸'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Cancel Button */}
          <div className="flex justify-center">
            <Button 
              variant="ghost" 
              onClick={() => {
                console.log(`❌ [ProgramCreation] Cancel clicked`);
                onCancel();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancelar Criação
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}