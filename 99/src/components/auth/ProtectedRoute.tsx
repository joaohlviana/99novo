import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Shield, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: Array<'client' | 'trainer' | 'admin'>;
  requiredMode?: 'client' | 'trainer';
  requireApproval?: boolean;
  fallbackTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredMode,
  requireApproval = false,
  fallbackTo = '/'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, isInitialized, switchMode } = useAuth();
  const location = useLocation();

  // Loading state - aguarda inicialização
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackTo} state={{ from: location }} replace />;
  }

  // Check required roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => user.roles.includes(role));
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Acesso Negado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Você não tem permissão para acessar esta área. 
                  É necessário ter um dos seguintes perfis: {requiredRoles.join(', ')}.
                </AlertDescription>
              </Alert>
              <Button 
                className="w-full" 
                onClick={() => window.history.back()}
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Check required mode
  if (requiredMode && user.currentMode !== requiredMode) {
    const canSwitch = user.roles.includes(requiredMode);
    
    if (!canSwitch) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Modo Incorreto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Esta área requer o modo {requiredMode}, mas você não tem este perfil cadastrado.
                </AlertDescription>
              </Alert>
              <Button 
                className="w-full" 
                onClick={() => window.history.back()}
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <ArrowRight className="h-12 w-12 mx-auto text-brand mb-4" />
            <CardTitle>Alternar Modo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Para acessar esta área você precisa estar no modo {requiredMode}.
                Deseja alternar agora?
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => window.history.back()}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => switchMode(requiredMode)}
              >
                Alternar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check trainer approval
  if (requireApproval && user.roles.includes('trainer') && user.isTrainerApproved === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Clock className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <CardTitle>Aguardando Aprovação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Seu perfil de treinador ainda está sendo analisado pela nossa equipe. 
                Você receberá uma notificação quando a aprovação for concluída.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => window.history.back()}
              >
                Voltar
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => switchMode('client')}
              >
                Acessar como Cliente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed
  return <>{children}</>;
}

// Componente específico para áreas de admin
export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute 
      requiredRoles={['admin']}
      fallbackTo="/"
    >
      {children}
    </ProtectedRoute>
  );
}

// Componente específico para áreas de trainer
export function TrainerProtectedRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute 
      requiredRoles={['trainer']}
      requiredMode="trainer"
      requireApproval={true}
    >
      {children}
    </ProtectedRoute>
  );
}

// Componente específico para áreas de client
export function ClientProtectedRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute 
      requiredRoles={['client']}
      requiredMode="client"
    >
      {children}
    </ProtectedRoute>
  );
}