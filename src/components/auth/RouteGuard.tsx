/**
 * 🛡️ ROUTE GUARD - PROTEÇÃO DE ROTAS COM MODAL
 * 
 * Guard que verifica autenticação e completude de perfil
 * Exibe modal para perfis incompletos mantendo a UI/UX
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../hooks/useNavigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading-spinner';
import { AlertCircle, User, Layers } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'trainer';
  requireCompleteProfile?: boolean;
  fallbackPath?: string;
}

export function RouteGuard({ 
  children, 
  requiredRole, 
  requireCompleteProfile = true,
  fallbackPath = '/' 
}: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'role' | 'incomplete'>('login');

  useEffect(() => {
    if (isLoading) return;

    // 1. Verificar autenticação
    if (!isAuthenticated || !user) {
      setModalType('login');
      setShowModal(true);
      return;
    }

    // 2. Verificar role necessário
    if (requiredRole && !user.roles.includes(requiredRole)) {
      setModalType('role');
      setShowModal(true);
      return;
    }

    // 3. Verificar perfil completo (se necessário)
    if (requireCompleteProfile && requiredRole) {
      const isProfileComplete = requiredRole === 'client' 
        ? user.clientProfile?.is_complete
        : user.trainerProfile?.is_complete;

      if (!isProfileComplete) {
        setModalType('incomplete');
        setShowModal(true);
        return;
      }
    }

    // Tudo ok, fechar modal se estiver aberto
    setShowModal(false);
  }, [isAuthenticated, user, isLoading, requiredRole, requireCompleteProfile]);

  const handleLogin = () => {
    setShowModal(false);
    navigation.navigateTo('/login');
  };

  const handleBecomeRole = () => {
    setShowModal(false);
    if (requiredRole === 'client') {
      navigation.navigateTo('/become-client');
    } else if (requiredRole === 'trainer') {
      navigation.navigateTo('/become-trainer');
    }
  };

  const handleCompleteProfile = () => {
    setShowModal(false);
    if (requiredRole === 'client') {
      navigation.navigateTo('/become-client');
    } else if (requiredRole === 'trainer') {
      navigation.navigateTo('/become-trainer');
    }
  };

  const handleGoHome = () => {
    setShowModal(false);
    navigation.navigateTo(fallbackPath);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Render modal baseado no tipo
  const renderModal = () => {
    if (modalType === 'login') {
      return (
        <Dialog open={showModal} onOpenChange={() => {}}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Login Necessário
              </DialogTitle>
              <DialogDescription>
                Você precisa fazer login para acessar esta página.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleGoHome}>
                Ir para Home
              </Button>
              <Button 
                onClick={handleLogin}
                className="bg-[#e0093e] hover:bg-[#c0082e] text-white"
              >
                Fazer Login
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    if (modalType === 'role') {
      const roleLabel = requiredRole === 'client' ? 'Cliente' : 'Treinador';
      const RoleIcon = requiredRole === 'client' ? User : Layers;

      return (
        <Dialog open={showModal} onOpenChange={() => {}}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RoleIcon className="h-5 w-5 text-blue-500" />
                Acesso Restrito
              </DialogTitle>
              <DialogDescription>
                Esta página é exclusiva para usuários do tipo {roleLabel}. 
                Você gostaria de se tornar um {roleLabel.toLowerCase()}?
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleGoHome}>
                Voltar
              </Button>
              <Button 
                onClick={handleBecomeRole}
                className="bg-[#e0093e] hover:bg-[#c0082e] text-white"
              >
                Tornar-se {roleLabel}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    if (modalType === 'incomplete') {
      const roleLabel = requiredRole === 'client' ? 'Cliente' : 'Treinador';
      const RoleIcon = requiredRole === 'client' ? User : Layers;

      return (
        <Dialog open={showModal} onOpenChange={() => {}}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RoleIcon className="h-5 w-5 text-orange-500" />
                Perfil Incompleto
              </DialogTitle>
              <DialogDescription>
                Para acessar esta página, você precisa completar seu perfil de {roleLabel.toLowerCase()}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleGoHome}>
                Voltar
              </Button>
              <Button 
                onClick={handleCompleteProfile}
                className="bg-[#e0093e] hover:bg-[#c0082e] text-white"
              >
                Completar Perfil
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return null;
  };

  // Se tudo estiver ok, renderizar children
  if (isAuthenticated && user && 
      (!requiredRole || user.roles.includes(requiredRole)) &&
      (!requireCompleteProfile || !requiredRole || 
       (requiredRole === 'client' ? user.clientProfile?.is_complete : user.trainerProfile?.is_complete))) {
    return <>{children}</>;
  }

  // Renderizar modal
  return (
    <>
      {/* Backdrop para impedir interação */}
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-2 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
      {renderModal()}
    </>
  );
}