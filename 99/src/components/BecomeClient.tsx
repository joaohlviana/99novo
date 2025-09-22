import { useState } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Star, Users, Clock, Zap } from 'lucide-react';
import { BecomeClientHero } from './become-client/BecomeClientHero';
import { BasicInfoStep } from './become-client/BasicInfoStep';
import { FitnessGoalsStep } from './become-client/FitnessGoalsStep';
import { ActivityLevelStep } from './become-client/ActivityLevelStep';
import { PreferencesStep } from './become-client/PreferencesStep';
import { LocationStep } from './become-client/LocationStep';
import { FinalStep } from './become-client/FinalStep';
import { ClientFormStepper } from './become-client/ClientFormStepper';
import { useNavigation } from '../hooks/useNavigation';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase/client';
import { toast } from 'sonner@2.0.3';

interface BecomeClientProps {}

export interface ClientFormData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  
  // Fitness Goals
  primaryGoal: string;
  currentWeight: string;
  targetWeight: string;
  height: string;
  bodyFatPercentage: string;
  
  // Activity Level
  currentActivityLevel: string;
  exerciseFrequency: string;
  hasInjuries: boolean;
  injuries: string[];
  medicalConditions: string;
  
  // Preferences
  preferredWorkoutTypes: string[];
  workoutDuration: string;
  workoutTime: string;
  budget: string;
  
  // Location
  serviceMode: 'online' | 'presencial' | 'ambos';
  cities: string[];
  
  // Additional
  motivation: string;
  additionalInfo: string;
}

export function BecomeClient({}: BecomeClientProps) {
  const navigation = useNavigation();
  const { user, refreshUserData } = useAuth();
  const [currentStep, setCurrentStep] = useState(0); // 0 = hero, 1-6 = form steps
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    primaryGoal: '',
    currentWeight: '',
    targetWeight: '',
    height: '',
    bodyFatPercentage: '',
    currentActivityLevel: '',
    exerciseFrequency: '',
    hasInjuries: false,
    injuries: [],
    medicalConditions: '',
    preferredWorkoutTypes: [],
    workoutDuration: '',
    workoutTime: '',
    budget: '',
    serviceMode: 'online',
    cities: [],
    motivation: '',
    additionalInfo: ''
  });

  const totalSteps = 6;
  const progressPercentage = currentStep === 0 ? 0 : (currentStep / totalSteps) * 100;

  const updateFormData = (updates: Partial<ClientFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startWizard = () => {
    setCurrentStep(1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: // Basic Info
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2: // Fitness Goals
        return formData.primaryGoal && formData.height;
      case 3: // Activity Level
        return formData.currentActivityLevel && formData.exerciseFrequency;
      case 4: // Preferences
        return formData.preferredWorkoutTypes.length > 0 && formData.workoutDuration;
      case 5: // Location
        return (formData.serviceMode === 'online') || 
               (formData.serviceMode === 'presencial' && formData.cities.length > 0) ||
               (formData.serviceMode === 'ambos' && formData.cities.length > 0);
      case 6: // Final Step
        return formData.motivation.length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para completar o cadastro');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Ativar role de client
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'client',
          is_active: true,
          activated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,role'
        });

      if (roleError) {
        throw new Error('Erro ao ativar perfil de cliente');
      }

      // 2. Salvar perfil de cliente
      const profileData = {
        user_id: user.id,
        fitness_level: formData.currentActivityLevel as 'iniciante' | 'intermediario' | 'avancado',
        main_goal: formData.primaryGoal,
        preferred_workout_time: formData.workoutTime,
        specific_goals: formData.preferredWorkoutTypes,
        has_injuries: formData.hasInjuries,
        injury_details: formData.injuries.join(', ') || null,
        preferred_training_type: formData.preferredWorkoutTypes,
        budget_range: formData.budget,
        city: formData.cities[0] || null,
        state: null, // TODO: Extrair do seletor de cidade
        is_complete: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('client_profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        });

      if (profileError) {
        throw new Error('Erro ao salvar perfil');
      }

      // 3. Sucesso!
      toast.success('Cadastro de cliente concluído com sucesso!');
      
      // Navegar para o dashboard client
      navigation.navigateTo('/app/client');
      
    } catch (error) {
      console.error('❌ Erro ao finalizar cadastro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao finalizar cadastro');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hero page
  if (currentStep === 0) {
    return (
      <BecomeClientHero 
        onStart={startWizard}
      />
    );
  }

  // Wizard steps
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo and Exit */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={prevStep}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              
              <img 
                src="https://cdn.prod.website-files.com/610165a842cc98cbd9ae2ba5/6508a3f687afc532e6f8fe67_99coach.svg"
                alt="99coach"
                className="h-8 w-auto"
              />
            </div>
            
            <Button
              variant="ghost"
              onClick={navigation.navigateToHome}
              className="text-gray-500 hover:text-gray-700"
            >
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Stepper */}
      <div className="bg-white border-b border-gray-100">
        <ClientFormStepper 
          currentStep={currentStep} 
          onStepChange={(step) => setCurrentStep(step)}
        />
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          
          {currentStep === 1 && (
            <BasicInfoStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 2 && (
            <FitnessGoalsStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 3 && (
            <ActivityLevelStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 4 && (
            <PreferencesStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 5 && (
            <LocationStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 6 && (
            <FinalStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                size="lg"
                onClick={nextStep}
                disabled={!isStepValid()}
                className="bg-[#e0093e] hover:bg-[#c0082e] text-white px-8 flex items-center gap-2"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                className="bg-[#e0093e] hover:bg-[#c0082e] text-white px-8 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Finalizar Cadastro
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}