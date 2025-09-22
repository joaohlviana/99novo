import React, { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, ChevronDown, User, Zap, LogOut, Settings, Shield, UserCircle, Layers } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../contexts/AppStateContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { LoginModal } from '../auth/LoginModal';

interface AppHeaderProps {
  showSearch?: boolean;
  transparent?: boolean;
}

export function AppHeader({ showSearch = true, transparent = false }: AppHeaderProps) {
  const { user, isAuthenticated, logoutAndRedirect, switchModeAndRedirect, canAccessTrainerMode, hasMultipleRoles } = useAuth();
  const { state, setSidebarOpen } = useAppState();
  const navigation = useAppNavigation();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRedirectTo, setLoginRedirectTo] = useState<string>();

  const searchRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigation.navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      setSearchQuery('');
    }
  };

  const handleAuthAction = (action: 'login' | 'register', redirectTo?: string) => {
    setLoginRedirectTo(redirectTo);
    setShowLoginModal(true);
  };

  const handleModeSwitch = async (mode: 'trainer' | 'client') => {
    try {
      await switchModeAndRedirect(mode);
    } catch (error) {
      console.error('Error switching mode:', error);
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getCurrentModeLabel = () => {
    if (!user) return '';
    return user.currentMode === 'trainer' ? 'Treinador' : 'Cliente';
  };

  return (
    <>
      <header className={`sticky top-0 z-header border-b ${transparent ? 'bg-background/80 backdrop-blur-sm' : 'bg-background'}`}>
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Menu Mobile */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!state.sidebarOpen)}
              >
                {state.sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <button
                onClick={() => navigation.goToHome()}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="hidden sm:block font-semibold text-lg">99Coach</span>
              </button>
            </div>

            {/* Barra de Busca */}
            {showSearch && (
              <div ref={searchRef} className="hidden md:block flex-1 max-w-md mx-8">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar treinadores ou modalidades..."
                    className="pl-10 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                  />
                  {isSearchFocused && searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg p-2 z-50">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={handleSearch}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Buscar por "{searchQuery}"
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Ações do Header */}
            <div className="flex items-center gap-2">
              {/* Busca Mobile */}
              {showSearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsSearchFocused(!isSearchFocused)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}

              {/* Menu do Usuário */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs bg-brand text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{getCurrentModeLabel()}</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end">
                    <DropdownMenuLabel>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-brand text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    
                    <DropdownMenuSeparator />

                    {/* Dashboard Links */}
                    <DropdownMenuGroup>
                      <DropdownMenuItem 
                        onClick={() => {
                          if (user.currentMode === 'trainer') {
                            navigation.goToTrainerDashboard();
                          } else {
                            navigation.goToClientDashboard();
                          }
                        }}
                      >
                        <UserCircle className="mr-2 h-4 w-4" />
                        Meu Dashboard
                      </DropdownMenuItem>

                      {user.roles.includes('admin') && (
                        <DropdownMenuItem onClick={() => navigation.goToAdminDashboard()}>
                          <Shield className="mr-2 h-4 w-4" />
                          Painel Admin
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>

                    {/* Mode Switching */}
                    {hasMultipleRoles() && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Alternar Modo</DropdownMenuLabel>
                        
                        {user.roles.includes('client') && user.currentMode !== 'client' && (
                          <DropdownMenuItem onClick={() => handleModeSwitch('client')}>
                            <User className="mr-2 h-4 w-4" />
                            Modo Cliente
                          </DropdownMenuItem>
                        )}
                        
                        {canAccessTrainerMode() && user.currentMode !== 'trainer' && (
                          <DropdownMenuItem onClick={() => handleModeSwitch('trainer')}>
                            <Layers className="mr-2 h-4 w-4" />
                            Modo Treinador
                          </DropdownMenuItem>
                        )}
                      </>
                    )}

                    <DropdownMenuSeparator />
                    
                    {/* Settings & Logout */}
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={logoutAndRedirect} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost"
                    onClick={() => handleAuthAction('login')}
                  >
                    Entrar
                  </Button>
                  <Button 
                    onClick={() => handleAuthAction('register')}
                  >
                    Cadastrar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Busca Mobile Expandida */}
          {showSearch && isSearchFocused && (
            <div className="md:hidden border-t bg-background p-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar treinadores ou modalidades..."
                    className="pl-10 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectTo={loginRedirectTo}
      />
    </>
  );
}