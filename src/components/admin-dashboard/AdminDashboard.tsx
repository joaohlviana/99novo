import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Trophy, 
  Settings,
  Home,
  PlusCircle,
  Bell,
  Search,
  Menu,
  Shield,
  ChevronDown,
  LogOut,
  UserPen,
  Palette,
  HelpCircle,
  Database,
  Activity,
  TrendingUp,
  Dumbbell,
  Image
} from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { Toaster } from '../ui/sonner';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ProfileToggle, ProfileMode } from '../ui/profile-toggle';
import { UserMenuButton } from '../ui/user-menu-button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ImpersonationProvider } from './ImpersonationProvider';
import { ImpersonationBanner } from './ImpersonationBanner';
import { useImpersonation } from '../../hooks/useImpersonation';

import { AdminOverview } from './AdminOverview';
import { TrainersManagement } from './TrainersManagement';
import { ClientsManagement } from './ClientsManagement';
import { ProgramsManagement } from './ProgramsManagement';
import { SportsManagement } from './SportsManagement';
import { WorkoutsManagement } from './WorkoutsManagement';
import { BannersManagement } from './BannersManagement';
import { AnalyticsPanel } from './AnalyticsPanel';
import { PlatformSettings } from './PlatformSettings';

type AdminSection = 
  | 'overview' 
  | 'trainers' 
  | 'clients' 
  | 'programs' 
  | 'workouts'
  | 'sports'
  | 'banners'
  | 'analytics' 
  | 'settings';

interface SidebarItem {
  id: AdminSection;
  label: string;
  icon: any;
}

const sidebarItems: SidebarItem[] = [
  { id: 'overview', label: 'Visão Geral', icon: Home },
  { id: 'trainers', label: 'Treinadores', icon: Users },
  { id: 'clients', label: 'Clientes', icon: UserPen },
  { id: 'programs', label: 'Programas', icon: FileText },
  { id: 'workouts', label: 'Treinos', icon: Dumbbell },
  { id: 'sports', label: 'Modalidades', icon: Trophy },
  { id: 'banners', label: 'Banners', icon: Image },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Configurações', icon: Settings }
];

interface AdminDashboardProps {}

// ✅ SISTEMA DE AUTH ADMIN SEPARADO (SEM SUPABASE)
const useAdminAuth = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Verificar cookie de auth admin
    const adminToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_auth='))
      ?.split('=')[1];
    
    setIsAdminAuthenticated(!!adminToken);
    setIsCheckingAuth(false);
  }, []);

  const loginAdmin = (password: string): boolean => {
    if (password === 'admin123') {
      // Criar cookie com expiração de 8 horas
      const expires = new Date();
      expires.setHours(expires.getHours() + 8);
      document.cookie = `admin_auth=admin_session_${Date.now()}; expires=${expires.toUTCString()}; path=/`;
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    document.cookie = 'admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsAdminAuthenticated(false);
  };

  return { isAdminAuthenticated, isCheckingAuth, loginAdmin, logoutAdmin };
};

// Component de Login Admin
function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginAdmin } = useAdminAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (loginAdmin(password)) {
      // Login será refletido pelo useAdminAuth
    } else {
      setError('Senha incorreta');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <Shield className="h-6 w-6 text-[#e0093e]" />
            Admin Portal
          </CardTitle>
          <CardDescription>
            Entre com a senha de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password">Senha Admin</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha admin"
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-[#e0093e] hover:bg-[#c0082e]"
            >
              Entrar
            </Button>
          </form>
          <div className="mt-4 text-xs text-gray-500 text-center">
            Acesso restrito aos administradores do sistema
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Component interno que usa o hook de impersonation
function AdminDashboardContent({}: AdminDashboardProps) {
  const navigation = useNavigation();
  const { logoutAdmin } = useAdminAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<ProfileMode>('trainer'); // Admin pode alternar entre perfis
  const { isImpersonating, impersonatedUser } = useImpersonation();

  // Dados do admin (sem contexto de auth externo)
  const userData = {
    name: "Admin Sistema",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    initials: "AS",
    trainerProfileComplete: true,
    clientProfileComplete: true
  };

  const handleModeChange = (mode: ProfileMode) => {
    // Se estiver em modo impersonation, navegar diretamente para o dashboard adequado
    if (isImpersonating && impersonatedUser) {
      if (impersonatedUser.type === 'trainer') {
        navigation.navigateToTrainerDashboard();
      } else {
        navigation.navigateToClientDashboard();
      }
      return;
    }

    // Comportamento normal do admin
    if (mode === 'trainer') {
      navigation.navigateToTrainerDashboard();
    } else if (mode === 'client') {
      navigation.navigateToClientDashboard();
    }
  };

  const handleStopImpersonation = () => {
    // Voltar para o overview do admin quando sair da impersonation
    setActiveSection('overview');
  };

  const handleIncompleteProfileClick = (mode: ProfileMode) => {
    if (mode === 'trainer') {
      navigation.navigateToBecomeTrainer();
    } else if (mode === 'client') {
      navigation.navigateToBecomeClient();
    }
  };

  const getSectionTitle = (section: AdminSection) => {
    const item = sidebarItems.find(item => item.id === section);
    return item?.label || 'Admin Dashboard';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview />;
      case 'trainers':
        return (
          <TrainersManagement 
            onImpersonateTrainer={navigation.navigateToTrainerDashboard}
          />
        );
      case 'clients':
        return (
          <ClientsManagement 
            onImpersonateClient={navigation.navigateToClientDashboard}
          />
        );
      case 'programs':
        return <ProgramsManagement />;
      case 'workouts':
        return <WorkoutsManagement />;
      case 'sports':
        return <SportsManagement />;
      case 'banners':
        return <BannersManagement />;
      case 'analytics':
        return <AnalyticsPanel />;
      case 'settings':
        return <PlatformSettings />;
      default:
        return <AdminOverview />;
    }
  };

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
    setMobileSidebarOpen(false);
  };

  // Sidebar content component
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
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

      {/* Admin Status */}
      <div className="p-4 border-t">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-purple-600" />
            <h4 className="font-medium text-sm">Admin Panel</h4>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sistema</span>
              <span className="font-medium text-green-600">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usuários Ativos</span>
              <span className="font-medium">1,247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notificações</span>
              <span className="font-medium text-orange-600">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-background ${isImpersonating ? 'pt-16' : ''}`}>
      <Toaster position="top-right" richColors />
      
      {/* Impersonation Banner */}
      <ImpersonationBanner onStopImpersonation={handleStopImpersonation} />
      
      {/* Mobile Header */}
      <header className={`sticky ${isImpersonating ? 'top-16' : 'top-0'} z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 lg:hidden`}>
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
              currentMode={currentMode}
              onModeChange={handleModeChange}
              onIncompleteProfileClick={handleIncompleteProfileClick}
              userAvatar={userData.avatar}
              userName={userData.name}
              userInitials={userData.initials}
              trainerProfileComplete={userData.trainerProfileComplete}
              clientProfileComplete={userData.clientProfileComplete}
            />
            
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs"
              >
                12
              </Badge>
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className={`sticky ${isImpersonating ? 'top-16' : 'top-0'} z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 hidden lg:block`}>
        <div className="flex h-16 items-center px-6 bg-white">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={navigation.navigateToHome}
              className="hover:opacity-80 transition-opacity"
            >
              <ImageWithFallback 
                src="https://cdn.prod.website-files.com/610165a842cc98cbd9ae2ba5/6508a3f687afc532e6f8fe67_99coach.svg"
                alt="99coach"
                className="h-8 w-auto"
              />
            </button>
            <Badge variant="outline" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200">
              <Shield className="h-3 w-3 mr-1" />
              Admin Panel
            </Badge>
          </div>

          {/* Center Section - Profile Toggle */}
          <div className="flex items-center justify-center flex-1">
            <ProfileToggle
              currentMode={currentMode}
              onModeChange={handleModeChange}
              onIncompleteProfileClick={handleIncompleteProfileClick}
              userAvatar={userData.avatar}
              userName={userData.name}
              userInitials={userData.initials}
              trainerProfileComplete={userData.trainerProfileComplete}
              clientProfileComplete={userData.clientProfileComplete}
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários, programas..."
                className="pl-10 w-64"
              />
            </div>

            {/* Quick Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="bg-[#e0093e] hover:bg-[#c0082e]">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ações
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Ações Rápidas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleSectionChange('trainers')}
                  className="cursor-pointer"
                >
                  <Users className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>Novo Treinador</span>
                    <span className="text-xs text-muted-foreground">Cadastrar treinador manualmente</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSectionChange('programs')}
                  className="cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>Moderar Programa</span>
                    <span className="text-xs text-muted-foreground">Revisar programas pendentes</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSectionChange('sports')}
                  className="cursor-pointer"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>Nova Modalidade</span>
                    <span className="text-xs text-muted-foreground">Adicionar novo esporte</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleSectionChange('settings')}
                  className="cursor-pointer"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>Configurações</span>
                    <span className="text-xs text-muted-foreground">Acessar configurações da plataforma</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                12
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div>
                  <UserMenuButton
                    userAvatar={userData.avatar}
                    userName={userData.name}
                    userInitials={userData.initials}
                    avatarFallbackColor="bg-gradient-to-br from-purple-500 to-pink-600 text-white"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-w-64" align="end">
                <DropdownMenuLabel className="flex min-w-0 flex-col">
                  <span className="text-foreground truncate text-sm font-medium">
                    {userData.name}
                  </span>
                  <span className="text-muted-foreground truncate text-xs font-normal">
                    admin@99coach.com
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleSectionChange('overview')}>
                    <BarChart3 size={16} className="opacity-60" aria-hidden="true" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSectionChange('settings')}>
                    <Settings size={16} className="opacity-60" aria-hidden="true" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Palette size={16} className="opacity-60" aria-hidden="true" />
                    <span>Aparência</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Shield size={16} className="opacity-60" aria-hidden="true" />
                    <span>Segurança</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle size={16} className="opacity-60" aria-hidden="true" />
                    <span>Ajuda</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logoutAdmin} className="text-red-600 focus:text-red-600">
                  <LogOut size={16} className="opacity-60" aria-hidden="true" />
                  <span>Sair do Admin</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className={`sticky ${isImpersonating ? 'top-32' : 'top-16'} ${isImpersonating ? 'h-[calc(100vh-8rem)]' : 'h-[calc(100vh-4rem)]'} bg-card border-r w-64 hidden lg:block`}>
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-[20px] py-[29px]">
          <div className="w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

// Componente principal que gerencia auth admin + impersonation
export function AdminDashboard(props: AdminDashboardProps) {
  const { isAdminAuthenticated, isCheckingAuth } = useAdminAuth();
  
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 text-[#e0093e] mx-auto mb-2" />
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <ImpersonationProvider>
      <AdminDashboardContent {...props} />
    </ImpersonationProvider>
  );
}

// Default export para o lazy loading
export default AdminDashboard;