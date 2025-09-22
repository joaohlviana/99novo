import { useState, useMemo, useCallback } from 'react';
import { 
  User, 
  MapPin, 
  Save,
  Camera,
  Video,
  GraduationCap,
  Users,
  Settings,
  Target
} from 'lucide-react';
import { Button } from '../ui/button';
import PersonalDataSection from './PersonalDataSection';
import LocationSection from './LocationSection';
import EducationSection from './EducationSection';
import SportsCheckboxGrid from './SportsCheckboxGrid';
import ModalitiesSection from './ModalitiesSectionFixed';
import GallerySection from './GallerySection';
import StoriesSection from './StoriesSection';
import { toast } from 'sonner@2.0.3';
import { useTrainerProfileHybrid } from '../../hooks/useTrainerProfileHybrid';

// Navigation configuration - centralized to avoid duplication
const NAVIGATION_SECTIONS = [
  { id: 'dados-basicos', label: 'Informações Pessoais', icon: User },
  { id: 'localizacao', label: 'Localização', icon: MapPin },
  { id: 'modalidades', label: 'Modalidades', icon: Users },
  { id: 'especialidades', label: 'Especialidades', icon: Target },
  { id: 'educacao', label: 'Educação', icon: GraduationCap },
  { id: 'galeria', label: 'Galeria', icon: Camera },
  { id: 'stories', label: 'Stories', icon: Video },
  { id: 'configuracoes', label: 'Configurações', icon: Settings }
] as const;

// Status badge component for consistency
const StatusBadge = ({ isComplete, children, variant = 'default' }: {
  isComplete: boolean;
  children: React.ReactNode;
  variant?: 'default' | 'optional';
}) => {
  if (variant === 'optional' && !isComplete) {
    return (
      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
        Opcional
      </span>
    );
  }
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
      isComplete 
        ? 'bg-green-100 text-green-700' 
        : 'bg-amber-100 text-amber-700'
    }`}>
      {isComplete ? 'Completo' : 'Pendente'}
    </span>
  );
};

// Icon container component for consistency
const SectionIcon = ({ icon: Icon, isComplete }: {
  icon: React.ComponentType<{ className?: string }>;
  isComplete: boolean;
}) => (
  <div className={`p-2 rounded-lg transition-colors ${
    isComplete 
      ? 'bg-green-100 text-green-600' 
      : 'bg-gray-100 text-gray-400'
  }`}>
    <Icon className="h-5 w-5" />
  </div>
);

// Navigation button component
const NavButton = ({ 
  section, 
  isActive, 
  onClick, 
  variant = 'desktop' 
}: {
  section: typeof NAVIGATION_SECTIONS[number];
  isActive: boolean;
  onClick: () => void;
  variant?: 'mobile' | 'desktop';
}) => {
  const { id, label, icon: Icon } = section;
  
  if (variant === 'mobile') {
    return (
      <button
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-colors whitespace-nowrap ${
          isActive 
            ? 'bg-muted text-foreground' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors text-left ${
        isActive 
          ? 'bg-muted text-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
      {label}
    </button>
  );
};

export function ProfileManagement() {
  const [activeTab, setActiveTab] = useState('dados-basicos');
  
  const { 
    profileData, 
    loading, 
    saving, 
    error, 
    isDirty, 
    saveProfile,
    updateProfileData,
    calculateProfileCompletion
  } = useTrainerProfileHybrid();

  // Memoized profile data for performance
  const currentProfileData = useMemo(() => {
    if (!profileData) return null;
    
    return {
      ...profileData.profile_data,
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone || profileData.profile_data?.phone
    };
  }, [profileData]);

  // Memoized completion calculation
  const completionPercentage = useMemo(() => {
    if (!profileData?.profile_data) return 0;
    return Math.round(calculateProfileCompletion(profileData.profile_data));
  }, [profileData, calculateProfileCompletion]);

  // Memoized field status checks
  const fieldStatus = useMemo(() => {
    if (!currentProfileData) return {};
    
    return {
      personalData: !!(currentProfileData.name && currentProfileData.bio && currentProfileData.phone),
      location: !!(currentProfileData.cities?.length > 0),
      modalities: !!(currentProfileData.modalities?.length > 0),
      specialties: !!(currentProfileData.specialties?.length > 0),
      education: !!(currentProfileData.credential || currentProfileData.universities?.length > 0 || currentProfileData.courses?.length > 0),
      gallery: !!(currentProfileData.galleryImages?.length > 0),
      stories: !!(currentProfileData.stories?.length > 0)
    };
  }, [currentProfileData]);

  // Optimized scroll function - adjusted for fixed header
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - 20; // 20px offset for spacing
      window.scrollTo({ 
        top: offsetPosition, 
        behavior: 'smooth' 
      });
    }
  }, []);

  // Navigation handler
  const handleNavigation = useCallback((sectionId: string) => {
    setActiveTab(sectionId);
    scrollToSection(sectionId);
  }, [scrollToSection]);

  // Simplified profile data change handler
  const handleProfileDataChange = useCallback((newData: any) => {
    if (!profileData) return;
    
    console.log('📝 Profile data change:', newData);
    console.log('📊 Current profile data:', currentProfileData);
    
    // Direct update - let the hook handle the complexity
    updateProfileData(newData);
  }, [profileData, updateProfileData, currentProfileData]);

  // Manual save handler
  const handleSave = useCallback(async () => {
    try {
      await saveProfile();
      // O toast já é exibido dentro do saveProfile
    } catch (error) {
      // Error já é tratado dentro do saveProfile
      console.error('Erro no save manual:', error);
    }
  }, [saveProfile]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50/50 to-white">
        <div className="text-center space-y-6 p-8 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg max-w-md mx-4">



        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen space-y-8">
        <div className="space-y-2 px-4 lg:px-6">
          <h1 className="text-2xl font-semibold mt-[20px] mr-[0px] mb-[7px] ml-[0px]">Gerenciar Perfil</h1>
          <p className="text-red-500">{error}</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Button onClick={() => window.location.reload()} className="bg-brand hover:bg-brand-hover">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!profileData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Nenhum dado encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">

      
      {/* Main content */}
      <div className="pt-8 pb-8 space-y-8">
        {/* Layout Responsivo */}
        <div className="w-full px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full lg:w-64 lg:flex-shrink-0 lg:relative">
              {/* Mobile: nav horizontal - sticky */}
              <div className="lg:hidden mb-6 sticky top-4 z-40 bg-white/95 backdrop-blur-sm py-2 -mx-4 px-4">
                <div className="overflow-x-auto">
                  <nav className="flex gap-1 pb-2 min-w-max">
                    {NAVIGATION_SECTIONS.map((section) => (
                      <NavButton
                        key={section.id}
                        section={section}
                        isActive={activeTab === section.id}
                        onClick={() => handleNavigation(section.id)}
                        variant="mobile"
                      />
                    ))}
                  </nav>
                </div>
              </div>

              {/* Desktop: nav vertical sticky - adjusted for new header position */}
              <div className="hidden lg:block">
                <div 
                  className="bg-white rounded-lg border p-4 max-h-[calc(100vh-120px)] overflow-y-auto shadow-sm sticky top-8 z-30"
                >
                  <nav className="space-y-1">
                    {NAVIGATION_SECTIONS.map((section) => (
                      <NavButton
                        key={section.id}
                        section={section}
                        isActive={activeTab === section.id}
                        onClick={() => handleNavigation(section.id)}
                        variant="desktop"
                      />
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="w-full lg:flex-1 space-y-6">
              {/* Progress Overview with Save Controls */}
              <div className="bg-gradient-to-r from-brand to-brand-hover rounded-xl p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-lg sm:text-xl font-semibold">Gerenciar Perfil</h1>
                    <p className="text-white/80 text-sm">Complete seu perfil para atrair mais clientes</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold">
                      {completionPercentage}%
                    </div>
                    <p className="text-white/80 text-xs">Completo</p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mb-4 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                
                {/* Save Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {saving && (
                      <div className="flex items-center gap-2 text-sm text-white/90">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Salvando...</span>
                      </div>
                    )}
                    {!isDirty && !saving && (
                      <div className="flex items-center gap-2 text-sm text-white/90">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Tudo salvo</span>
                      </div>
                    )}
                    {isDirty && !saving && (
                      <span className="text-sm text-white/90">Alterações não salvas</span>
                    )}
                  </div>
                  
                  {isDirty && !saving && (
                    <Button 
                      onClick={handleSave} 
                      size="sm" 
                      className="bg-white text-brand hover:bg-white/90 font-medium"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  )}
                </div>
              </div>

              {/* Profile Sections */}
              <div className="space-y-4">
                {/* Dados Básicos */}
                <section id="dados-basicos" className="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-8">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Informações Pessoais</h3>
                        <p className="text-sm text-gray-500">Nome, biografia e contatos</p>
                      </div>
                    </div>
                    <StatusBadge isComplete={fieldStatus.personalData}>
                      {fieldStatus.personalData ? 'Completo' : 'Pendente'}
                    </StatusBadge>
                  </div>
                  <div className="p-6">
                    <PersonalDataSection 
                      profileData={currentProfileData}
                      onProfileDataChange={handleProfileDataChange}
                      loading={loading}
                    />
                  </div>
                </section>

                {/* Localização e Cidades */}
                <section id="localizacao" className="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-8">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Localização e Atendimento</h3>
                        <p className="text-sm text-gray-500">Cidades onde você atende clientes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {fieldStatus.location ? (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                          {currentProfileData?.cities?.length || 0} cidade{(currentProfileData?.cities?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <StatusBadge isComplete={false}>Pendente</StatusBadge>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <LocationSection 
                      profileData={profileData}
                      onProfileDataChange={handleProfileDataChange}
                      loading={loading}
                    />
                  </div>
                </section>

                {/* Modalidades de Serviço */}
                <section id="modalidades" className="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-8">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Modalidades de Atendimento</h3>
                        <p className="text-sm text-gray-500">Como você prefere atender seus clientes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {fieldStatus.modalities ? (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                          {currentProfileData?.modalities?.join(', ') || 'Não definido'}
                        </span>
                      ) : (
                        <StatusBadge isComplete={false}>Pendente</StatusBadge>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <ModalitiesSection 
                      profileData={profileData}
                      onProfileDataChange={handleProfileDataChange}
                      loading={loading}
                    />
                  </div>
                </section>

                {/* Especialidades Esportivas */}
                <section id="especialidades" className="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-8">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Especialidades Esportivas</h3>
                        <p className="text-sm text-gray-500">Esportes que você domina e ensina (máximo 8)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {fieldStatus.specialties ? (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                          {currentProfileData?.specialties?.length || 0}/8 especialidade{(currentProfileData?.specialties?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <StatusBadge isComplete={false}>Pendente</StatusBadge>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <SportsCheckboxGrid
                      profileData={currentProfileData || { specialties: [] }}
                      onProfileDataChange={handleProfileDataChange}
                    />
                  </div>
                </section>

                {/* Formação e Certificações */}
                <section id="educacao" className="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-8">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Formação e Certificações</h3>
                        <p className="text-sm text-gray-500">Sua formação acadêmica e certificações profissionais</p>
                      </div>
                    </div>
                    <StatusBadge isComplete={fieldStatus.education} variant="optional">
                      {fieldStatus.education ? 'Completo' : 'Opcional'}
                    </StatusBadge>
                  </div>
                  <div className="p-6">
                    <EducationSection 
                      profileData={{
                        universities: currentProfileData?.universities || [],
                        credential: currentProfileData?.credential || '',
                        courses: currentProfileData?.courses || []
                      }}
                      onProfileDataChange={handleProfileDataChange}
                      loading={loading}
                    />
                  </div>
                </section>

                {/* Galeria e Mídia */}
                <section id="galeria" className="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-8">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <Camera className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Galeria de Fotos</h3>
                        <p className="text-sm text-gray-500">Mostre seu trabalho e espaço de treino</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {fieldStatus.gallery ? (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                          {currentProfileData?.galleryImages?.length || 0} foto{(currentProfileData?.galleryImages?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <StatusBadge isComplete={false} variant="optional">Opcional</StatusBadge>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <GallerySection 
                      profileData={profileData}
                      onProfileDataChange={handleProfileDataChange}
                      loading={loading}
                    />
                  </div>
                </section>

                {/* Stories e Conteúdo */}
                <section id="stories" className="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-8">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <Video className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Stories e Vídeos</h3>
                        <p className="text-sm text-gray-500">Compartilhe conteúdo inspiracional</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {fieldStatus.stories ? (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                          {currentProfileData?.stories?.length || 0} story{(currentProfileData?.stories?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <StatusBadge isComplete={false} variant="optional">Opcional</StatusBadge>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <StoriesSection 
                      profileData={profileData}
                      onProfileDataChange={handleProfileDataChange}
                      loading={loading}
                    />
                  </div>
                </section>

                {/* Configurações Avançadas - Em Desenvolvimento */}
                <section id="configuracoes" className="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-8">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Configurações Avançadas</h3>
                        <p className="text-sm text-gray-500">Configurações de privacidade e notificações</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">Em breve</span>
                  </div>
                  <div className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Settings className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Configurações em Desenvolvimento</h4>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      Esta seção incluirá configurações avançadas de privacidade, notificações e preferências do sistema.
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}