import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  User, 
  FileText, 
  Users, 
  MessageCircle, 
  Star, 
  DollarSign, 
  Settings,
  Home,
  PlusCircle,
  Bell,
  Search,
  Menu,
  Target,
  ChevronDown,
  LogOut,
  UserPen,
  Palette,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase/client';
import { Toaster } from '../ui/sonner';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { OverviewDashboard } from './OverviewDashboard';
import { ProfileManagement } from './ProfileManagement';
import { ProgramsManagementSimple } from './ProgramsManagementSimple';
import { CustomTrainingManagement } from './CustomTrainingManagement';
import { ChatSystemNew } from './ChatSystemNew';
import { StatisticsPanel } from './StatisticsPanel';
import { ReviewsManagement } from './ReviewsManagement';
import { SettingsManagement } from './SettingsManagement';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ProfileToggle, ProfileMode } from '../ui/profile-toggle';
import { UserMenuButton } from '../ui/user-menu-button';

type DashboardSection = 
  | 'overview' 
  | 'profile' 
  | 'programs' 
  | 'custom-training' 
  | 'leads' 
  | 'stats' 
  | 'reviews' 
  | 'financial' 
  | 'settings';

interface SidebarItem {
  id: DashboardSection;
  label: string;
  icon: any;
}

const sidebarItems: SidebarItem[] = [
  { id: 'overview', label: 'Visão Geral', icon: Home },
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'programs', label: 'Programas', icon: FileText },
  { id: 'custom-training', label: 'Treinos Personalizados', icon: Target },
  { id: 'leads', label: 'Leads e Clientes', icon: Users },
  { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
  { id: 'reviews', label: 'Avaliações', icon: Star },
  { id: 'financial', label: 'Financeiro', icon: DollarSign },
  { id: 'settings', label: 'Configurações', icon: Settings }
];

interface TrainerDashboardProps {}

// Placeholder component for undeveloped sections
const PlaceholderSection = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="p-8 text-center">
    <Icon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export function TrainerDashboard({}: TrainerDashboardProps) {
  const navigation = useNavigation();
  const { user, switchModeAndRedirect, logoutAndRedirect } = useAuth();
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Hook para buscar status dos perfis
  const [profileStatus, setProfileStatus] = useState({
    trainerProfileComplete: false,
    clientProfileComplete: false,
    loading: true
  });

  // Buscar status dos perfis no Supabase
  useEffect(() => {
    const fetchProfileStatus = async () => {
      if (!user?.id) return;

      try {
        // Verificar perfil do trainer
        const { data: trainerProfile } = await supabase
          .from('trainer_profiles')
          .select('is_complete')
          .eq('user_id', user.id)
          .single();

        // Verificar perfil do cliente  
        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('is_complete')
          .eq('user_id', user.id)
          .single();

        setProfileStatus({
          trainerProfileComplete: trainerProfile?.is_complete || false,
          clientProfileComplete: clientProfile?.is_complete || false,
          loading: false
        });
      } catch (error) {
        console.error('Erro ao verificar status dos perfis:', error);
        setProfileStatus(prev => ({ ...prev, loading: false }));
      }
    };

    fetchProfileStatus();
  }, [user?.id]);

  // Usar dados reais do contexto de autenticação
  const userData = {
    name: user?.name || "Usuário",
    avatar: user?.avatar,
    initials: user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : "U",
    trainerProfileComplete: profileStatus.trainerProfileComplete,
    clientProfileComplete: profileStatus.clientProfileComplete
  };

  const handleModeChange = (mode: ProfileMode) => {
    if (mode === 'client') {
      // Se perfil está completo, muda para dashboard do cliente
      if (userData.clientProfileComplete) {
        switchModeAndRedirect('client');
      } else {
        navigation.navigate('/become-client');
      }
    }
    // Se já está no modo treinador, não faz nada
  };

  const handleIncompleteProfileClick = (mode: ProfileMode) => {
    if (mode === 'client') {
      navigation.navigate('/become-client');
    }
  };

  const getSectionTitle = (section: DashboardSection) => {
    const item = sidebarItems.find(item => item.id === section);
    return item?.label || 'Dashboard';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewDashboard />;
      case 'profile':
        return <ProfileManagement />;
      case 'programs':
        return <ProgramsManagementSimple />;
      case 'custom-training':
        return <CustomTrainingManagement />;
      case 'leads':
        return <ChatSystemNew />;
      case 'stats':
        return <StatisticsPanel />;
      case 'reviews':
        return <ReviewsManagement />;
      case 'financial':
        return <PlaceholderSection icon={DollarSign} title="Financeiro" description="Esta seção estará disponível em breve" />;
      case 'settings':
        return <SettingsManagement />;
      default:
        return <OverviewDashboard />;
    }
  };

  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section);
    setMobileSidebarOpen(false);
  };

  // Sidebar content component
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <button 
          onClick={navigation.navigateToHome}
          className="hover:opacity-80 transition-opacity flex items-center gap-2"
        >
          <ImageWithFallback 
            src="https://cdn.prod.website-files.com/610165a842cc98cbd9ae2ba5/6508a3f687afc532e6f8fe67_99coach.svg"
            alt="99coach"
            className="h-6 w-auto"
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            onClick={() => handleSectionChange(item.id)}
            className={`w-full justify-start h-auto py-3 ${
              activeSection === item.id 
                ? 'bg-[#e0093e] hover:bg-[#c0082e] text-white' 
                : 'hover:bg-muted'
            }`}
          >
            <item.icon className="h-4 w-4 mr-3" />
            <span className="flex-1 text-left">{item.label}</span>
          </Button>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t">
        <div className="bg-muted/50 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">Acesso Rápido</h4>
          <div className="space-y-2 text-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection('profile')}
              className="w-full justify-start h-auto py-2 text-xs"
            >
              <User className="h-3 w-3 mr-2" />
              Editar Perfil
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection('programs')}
              className="w-full justify-start h-auto py-2 text-xs"
            >
              <FileText className="h-3 w-3 mr-2" />
              Meus Programas
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection('leads')}
              className="w-full justify-start h-auto py-2 text-xs"
            >
              <MessageCircle className="h-3 w-3 mr-2" />
              Mensagens
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <h1 className="font-semibold">{getSectionTitle(activeSection)}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Profile Toggle Mobile */}
            <ProfileToggle
              currentMode={'trainer' as ProfileMode}
              onModeChange={handleModeChange}
              onIncompleteProfileClick={handleIncompleteProfileClick}
              userAvatar={userData.avatar}
              userName={userData.name}
              userInitials={userData.initials}
              trainerProfileComplete={userData.trainerProfileComplete}
              clientProfileComplete={userData.clientProfileComplete}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="bg-[#e0093e] hover:bg-[#c0082e] text-xs px-3">
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Criar
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Criar Conteúdo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    setActiveSection('programs');
                    // Dispatch custom event para comunicação entre componentes
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('trigger-program-creation'));
                    }, 100);
                  }}
                  className="cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>Novo Programa</span>
                    <span className="text-xs text-muted-foreground">Crie um programa de treinos completo</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setActiveSection('custom-training');
                    // Dispatch custom event para comunicação entre componentes
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('trigger-service-creation'));
                    }, 100);
                  }}
                  className="cursor-pointer"
                >
                  <Target className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>Treino Personalizado</span>
                    <span className="text-xs text-muted-foreground">Configure um novo serviço personalizado</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setActiveSection('profile')}
                  className="cursor-pointer"
                >
                  <User className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>Atualizar Perfil</span>
                    <span className="text-xs text-muted-foreground">Edite suas informações e galeria</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Header - REMOVIDO para limpar a interface */}

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="sticky top-0 h-screen bg-card border-r w-64 hidden lg:block">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-[20px] py-[29px]">
          <div className={`${
            activeSection === 'leads' || activeSection === 'stats' || activeSection === 'reviews' || activeSection === 'settings' || activeSection === 'profile' || activeSection === 'programs' || activeSection === 'custom-training'
              ? 'w-full' 
              : 'p-4 lg:p-8 max-w-7xl mx-auto'
          }`}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default TrainerDashboard;