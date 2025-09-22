import { useState } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Star, Users, Clock, Zap } from 'lucide-react';
import { useNavigation } from '../hooks/useNavigation';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase/client';
import { toast } from 'sonner@2.0.3';
import { BecomeTrainerHero } from './become-trainer/BecomeTrainerHero';
import { BasicInfoStep } from './become-trainer/BasicInfoStep';
import { LocationStep } from './become-trainer/LocationStep';
import { EducationStep } from './become-trainer/EducationStep';
import { SportsStep } from './become-trainer/SportsStep';
import { ServiceModeStep } from './become-trainer/ServiceModeStep';
import { AdditionalInfoStep } from './become-trainer/AdditionalInfoStep';
import { TrainerFormStepper } from './become-trainer/TrainerFormStepper';

export interface FormData {
  // Basic Info
  name: string;
  city: string;
  email: string;
  phone: string;
  bio: string;
  instagram: string;
  address: string;
  cep: string;
  
  // Education
  university: string;
  credential: string;
  courses: string[];
  
  // Sports
  selectedSports: string[];
  
  // Service Mode
  isOnline: boolean;
  isInPerson: boolean;
  cities: string[];
  
  // Additional Info
  experienceYears: string;
  responseTime: string;
  studentsCount: string;
}

export function BecomeTrainer() {
  const navigation = useNavigation();
  const { user, refreshUserData } = useAuth();
  const [currentStep, setCurrentStep] = useState(0); // 0 = hero, 1-5 = form steps
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    city: '',
    email: '',
    phone: '',
    bio: '',
    instagram: '',
    address: '',
    cep: '',
    university: '',
    credential: '',
    courses: [],
    selectedSports: [],
    isOnline: false,
    isInPerson: false,
    cities: [],
    experienceYears: '',
    responseTime: '',
    studentsCount: ''
  });

  const totalSteps = 6;
  const progressPercentage = currentStep === 0 ? 0 : (currentStep / totalSteps) * 100;

  const updateFormData = (updates: Partial<FormData>) => {
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
        return formData.name && formData.email && formData.phone && formData.bio;
      case 2: // Location
        return formData.city && formData.cep;
      case 3: // Education
        return formData.university && formData.credential;
      case 4: // Sports
        return formData.selectedSports.length > 0;
      case 5: // Service Mode
        return (formData.isOnline || formData.isInPerson) && 
               (!formData.isInPerson || formData.cities.length > 0);
      case 6: // Additional Info
        return formData.experienceYears && formData.responseTime && formData.studentsCount;
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
      // 1. Ativar role de trainer
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'trainer',
          is_active: true,
          activated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,role'
        });

      if (roleError) {
        throw new Error('Erro ao ativar perfil de treinador');
      }

      // 2. Determinar service_mode
      let serviceMode: 'online' | 'presencial' | 'ambos';
      if (formData.isOnline && formData.isInPerson) {
        serviceMode = 'ambos';
      } else if (formData.isOnline) {
        serviceMode = 'online';
      } else {
        serviceMode = 'presencial';
      }

      // 3. Salvar perfil de treinador
      const profileData = {
        user_id: user.id,
        bio: formData.bio || null,
        experience_years: formData.experienceYears ? parseInt(formData.experienceYears) : null,
        certifications: formData.courses,
        service_mode: serviceMode,
        city: formData.city || null,
        state: null, // TODO: Extrair do seletor de cidade
        specialties: formData.selectedSports,
        social_links: formData.instagram ? { instagram: formData.instagram } : null,
        is_complete: true,
        is_verified: false, // Será verificado pela administração
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('trainer_profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        });

      if (profileError) {
        throw new Error('Erro ao salvar perfil');
      }

      // 4. Sucesso!
      toast.success('Cadastro de treinador enviado! Aguarde a aprovação da nossa equipe.');
      
      // Navegar para o dashboard trainer
      navigation.navigateTo('/app/trainer');
      
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
      <BecomeTrainerHero 
        onStartWizard={startWizard}
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
              onClick={navigation.navigateToCatalog}
              className="text-gray-500 hover:text-gray-700"
            >
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Stepper */}
      <div className="bg-white border-b border-gray-100">
        <TrainerFormStepper 
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
            <LocationStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 3 && (
            <EducationStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 4 && (
            <SportsStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 5 && (
            <ServiceModeStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 6 && (
            <AdditionalInfoStep 
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