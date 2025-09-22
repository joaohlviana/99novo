import { useState, useEffect } from 'react';
import { 
  User, 
  Heart,
  MessageCircle, 
  BookOpen,
  Search,
  Bell,
  ArrowLeft,
  Settings,
  Target,
  MapPin,
  Activity,
  Award,
  Sparkles,
  Users,
  Clock,
  CheckCircle,
  Menu,
  ChevronDown,
  LogOut,
  UserPen,
  Palette,
  Shield,
  HelpCircle,
  Home,
  TrendingUp,
  Zap,
  LogIn
} from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AvatarCropper } from '../ui/avatar-cropper';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Input } from '../ui/input';
import { Toaster } from '../ui/sonner';
import { BriefingSection } from './BriefingSection';
import { FavoriteTrainersSection } from './FavoriteTrainersSection';
import { MessagesSection } from './MessagesSection';
import { MyProgramsSection } from './MyProgramsSection';
import { NewsSection } from './NewsSection';
import { DashboardSection } from './DashboardSection';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ProfileToggle, ProfileMode } from '../ui/profile-toggle';
import { UserMenuButton } from '../ui/user-menu-button';
import { supabase } from '../../lib/supabase/client';
import { useClientData } from '../../hooks/useClientData';
import { useClientProfileHybrid } from '../../hooks/useClientProfileHybrid';
import { useClientNotifications } from '../../hooks/useClientNotifications';

interface ClientDashboardProps {}

type ActiveSection = 'dashboard' | 'briefing' | 'favorites' | 'messages' | 'programs' | 'news';

// Dados reais serão carregados do Supabase via hooks/services

export function ClientDashboard({}: ClientDashboardProps) {
  const navigation = useNavigation();
  const { user, switchModeAndRedirect, logoutAndRedirect } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // ✅ USAR EXCLUSIVAMENTE DADOS DO SUPABASE - NUNCA MOCK DATA
  const { stats: clientStats, loading: isLoadingStats, error: statsError } = useClientData();
  const { profileData: clientProfile, loading: isLoadingProfile } = useClientProfileHybrid();
  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading, 
    markAsRead, 
    markAllAsRead 
  } = useClientNotifications();
  
  // Extrair URL do avatar de forma segura
  const getUserAvatarUrl = (avatar: any): string | null => {
    if (!avatar) return null;
    if (typeof avatar === 'string') return avatar;
    if (typeof avatar === 'object' && avatar.url) return avatar.url;
    return null;
  };

  const [userAvatar, setUserAvatar] = useState<string | null>(getUserAvatarUrl(user?.avatar));

  // Funções para gerenciar notificações usando dados do Supabase
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleNotificationClick = async (id: number) => {
    await markAsRead(id);
  };

  // Componente Dot para notificações não lidas
  const Dot = ({ className }: { className?: string }) => {
    return (
      <svg
        width="6"
        height="6"
        fill="currentColor"
        viewBox="0 0 6 6"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <circle cx="3" cy="3" r="3" />
      </svg>
    );
  };

  // Usar dados reais do contexto de autenticação
  const userData = {
    name: user?.name || "Cliente",
    avatar: userAvatar || getUserAvatarUrl(user?.avatar),
    initials: user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : "C",
    trainerProfileComplete: false, // TODO: Verificar via query no Supabase
    clientProfileComplete: true // Assumindo que está no dashboard do cliente, então está completo
  };

  // ✅ DADOS REAIS CARREGADOS VIA HOOKS useClientData e useClientProfileHybrid
  useEffect(() => {
    if (statsError) {
      console.error('❌ Erro no hook useClientData:', statsError);
    }
  }, [statsError]);

  useEffect(() => {
    if (clientProfile) {
      console.log('✅ Perfil do cliente carregado:', clientProfile.name);
    }
  }, [clientProfile]);



  const handleModeChange = (mode: ProfileMode) => {
    if (mode === 'trainer') {
      // Se perfil está completo, muda para dashboard do treinador
      if (userData.trainerProfileComplete) {
        switchModeAndRedirect('trainer');
      } else {
        navigation.navigateTo('/become-trainer');
      }
    }
    // Se já está no modo cliente, não faz nada
  };

  const handleIncompleteProfileClick = (mode: ProfileMode) => {
    if (mode === 'trainer') {
      navigation.navigateTo('/become-trainer');
    }
  };

  const menuItems = [
    { 
      id: 'dashboard' as const, 
      label: 'Dashboard', 
      icon: Home, 
      description: 'Visão geral da sua jornada fitness',
      count: undefined
    },
    { 
      id: 'briefing' as const, 
      label: 'Meu Perfil', 
      icon: User, 
      description: 'Complete seu briefing para ser encontrado por treinadores',
      badge: clientStats.profileCompletion < 100 ? 'Incompleto' : null
    },
    { 
      id: 'programs' as const, 
      label: 'Meus Programas', 
      icon: BookOpen, 
      description: 'Programas de treino adquiridos',
      count: clientStats.activePrograms
    },
    { 
      id: 'favorites' as const, 
      label: 'Treinadores favoritos', 
      icon: Heart, 
      description: 'Treinadores que você marcou como favoritos',
      count: clientStats.favoriteTrainers
    },
    { 
      id: 'messages' as const, 
      label: 'Mensagens', 
      icon: MessageCircle, 
      description: 'Conversas com treinadores',
      count: clientStats.unreadMessages
    },
    { 
      id: 'news' as const, 
      label: 'Novidades', 
      icon: TrendingUp, 
      description: 'Últimas atualizações dos treinadores que você segue',
      count: 6
    }
  ];

  const getSectionTitle = (section: ActiveSection) => {
    const item = menuItems.find(item => item.id === section);
    return item?.label || 'Dashboard';
  };

  const handleSectionChange = (section: ActiveSection) => {
    setActiveSection(section);
    setMobileSidebarOpen(false);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'briefing':
        return <BriefingSection />;
      case 'news':
        return <NewsSection />;
      case 'favorites':
        return <FavoriteTrainersSection />;
      case 'programs':
        return <MyProgramsSection onNavigateToProgramDetails={navigation.navigateToClientProgram} />;
      case 'messages':
        return <MessagesSection />;
      default:
        return <DashboardSection />;
    }
  };

  // Sidebar content component
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Profile Summary */}


      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              onClick={() => handleSectionChange(item.id)}
              className={`w-full justify-start h-auto py-3 ${
                isActive 
                  ? 'bg-[#e0093e] hover:bg-[#c0082e] text-white' 
                  : 'hover:bg-muted'
              }`}
            >
              <Icon className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count && item.count > 0 && (
                <Badge variant="secondary" className="h-5 min-w-[1.25rem] text-xs ml-2">
                  {item.count}
                </Badge>
              )}
              {item.badge && (
                <Badge variant="destructive" className="h-5 text-xs ml-2">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t">
        <div className="bg-muted/50 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">Resumo Hoje</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Programas Concluídos</span>
              <span className="font-medium">{clientStats.programsCompleted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mensagens</span>
              <span className="font-medium">{clientStats.unreadMessages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Favoritos</span>
              <span className="font-medium text-green-600">{clientStats.favoriteTrainers}</span>
            </div>
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
              currentMode={'client' as ProfileMode}
              onModeChange={handleModeChange}
              onIncompleteProfileClick={handleIncompleteProfileClick}
              userAvatar={userData.avatar}
              userName={userData.name}
              userInitials={userData.initials}
              trainerProfileComplete={userData.trainerProfileComplete}
              clientProfileComplete={userData.clientProfileComplete}
            />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2"
                  aria-label="Abrir notificações"
                >
                  <Bell className="h-4 w-4" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs bg-[var(--brand)] hover:bg-[var(--brand-hover)]">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-1">
                <div className="flex items-baseline justify-between gap-4 px-3 py-2">
                  <div className="text-sm font-semibold">Notificações</div>
                  {unreadCount > 0 && (
                    <button
                      className="text-xs font-medium hover:underline text-[var(--brand)]"
                      onClick={handleMarkAllAsRead}
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>
                <div
                  role="separator"
                  aria-orientation="horizontal"
                  className="bg-border -mx-1 my-1 h-px"
                />
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors"
                  >
                    <div className="relative flex items-start pe-3">
                      <div className="flex-1 space-y-1">
                        <button
                          className="text-foreground/80 text-left after:absolute after:inset-0"
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <span className="text-foreground font-medium hover:underline">
                            {notification.user}
                          </span>{" "}
                          {notification.action}{" "}
                          <span className="text-foreground font-medium hover:underline">
                            {notification.target}
                          </span>
                          .
                        </button>
                        <div className="text-muted-foreground text-xs">
                          {notification.timestamp}
                        </div>
                      </div>
                      {notification.unread && (
                        <div className="absolute end-0 self-center">
                          <span className="sr-only">Não lida</span>
                          <Dot className="text-[var(--brand)]" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 hidden lg:block">
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
          </div>

          {/* Center Section - Profile Toggle */}
          <div className="flex items-center justify-center">
            <ProfileToggle
              currentMode={'client' as ProfileMode}
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
                placeholder="Buscar treinadores..."
                className="pl-10 w-64"
              />
            </div>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2"
                  aria-label="Abrir notificações"
                >
                  <Bell className="h-4 w-4" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs bg-[var(--brand)] hover:bg-[var(--brand-hover)]">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-1">
                <div className="flex items-baseline justify-between gap-4 px-3 py-2">
                  <div className="text-sm font-semibold">Notificações</div>
                  {unreadCount > 0 && (
                    <button
                      className="text-xs font-medium hover:underline text-[var(--brand)]"
                      onClick={handleMarkAllAsRead}
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>
                <div
                  role="separator"
                  aria-orientation="horizontal"
                  className="bg-border -mx-1 my-1 h-px"
                />
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors"
                  >
                    <div className="relative flex items-start pe-3">
                      <div className="flex-1 space-y-1">
                        <button
                          className="text-foreground/80 text-left after:absolute after:inset-0"
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <span className="text-foreground font-medium hover:underline">
                            {notification.user}
                          </span>{" "}
                          {notification.action}{" "}
                          <span className="text-foreground font-medium hover:underline">
                            {notification.target}
                          </span>
                          .
                        </button>
                        <div className="text-muted-foreground text-xs">
                          {notification.timestamp}
                        </div>
                      </div>
                      {notification.unread && (
                        <div className="absolute end-0 self-center">
                          <span className="sr-only">Não lida</span>
                          <Dot className="text-[var(--brand)]" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </PopoverContent>
            </Popover>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userAvatar || getUserAvatarUrl(user?.avatar)} alt={userData.name} />
                    <AvatarFallback className="text-sm">
                      {userData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium hidden lg:inline">{userData.name || 'Usuário'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {/* User Info */}
                <div className="px-3 py-3 border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userAvatar || getUserAvatarUrl(user?.avatar)} alt={userData.name} />
                      <AvatarFallback className="text-sm">
                        {userData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{userData.name || 'Usuário'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email || ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {user?.roles?.map(type => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type === 'trainer' ? 'Treinador' : 'Cliente'}
                      </Badge>
                    )) || null}
                  </div>
                </div>
                
                {/* Dashboard Links */}
                {user?.roles?.includes('trainer') && (
                  <DropdownMenuItem onClick={() => navigation.navigateToTrainerDashboard()}>
                    <User className="h-4 w-4 mr-2" />
                    Dashboard Treinador
                  </DropdownMenuItem>
                )}
                {user?.roles?.includes('client') && (
                  <DropdownMenuItem onClick={() => navigation.navigateToClientDashboard()}>
                    <User className="h-4 w-4 mr-2" />
                    Dashboard Cliente
                  </DropdownMenuItem>
                )}
                
                {/* Additional Options */}
                <DropdownMenuSeparator />
                
                {/* Become options for users who are not yet trainer/client */}
                {!user?.roles?.includes('trainer') && (
                  <DropdownMenuItem onClick={() => navigation.navigateToBecomeTrainer()}>
                    <Zap className="h-4 w-4 mr-2" />
                    Tornar-se Treinador
                  </DropdownMenuItem>
                )}
                {!user?.roles?.includes('client') && (
                  <DropdownMenuItem onClick={() => navigation.navigateToBecomeClient()}>
                    <User className="h-4 w-4 mr-2" />
                    Tornar-se Cliente
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={() => console.log('Navigate to settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logoutAndRedirect()} className="text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] bg-card border-r w-64 hidden lg:block">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full">
          <div className="w-full">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ClientDashboard;