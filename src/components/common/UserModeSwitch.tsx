import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { User, Layers, ArrowLeftRight, CheckCircle, Clock, AlertCircle, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/loading-spinner';
import { useNavigation } from '../../hooks/useNavigation';

interface UserModeSwitchProps {
  compact?: boolean;
  showCurrentMode?: boolean;
  className?: string;
}

export function UserModeSwitch({ compact = false, showCurrentMode = true, className }: UserModeSwitchProps) {
  const { user, switchModeAndRedirect, isLoading } = useAuth();
  const navigation = useNavigation();
  
  const [isChanging, setIsChanging] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [pendingMode, setPendingMode] = useState<'client' | 'trainer' | null>(null);

  if (!user || user.roles.length <= 1) {
    return null;
  }

  const hasMultipleRoles = () => user.roles.length > 1;
  const canAccessTrainerMode = () => user.trainerProfile?.is_complete && user.trainerProfile?.is_verified;
  const needsTrainerApproval = () => user.roles.includes('trainer') && user.trainerProfile && !user.trainerProfile.is_verified;

  const handleModeSwitch = async (mode: 'trainer' | 'client') => {
    if (mode === user.currentMode || isChanging) return;

    // Verificar se o usuário tem o role
    if (!user.roles.includes(mode)) {
      // Redirecionar para become-*
      if (mode === 'client') {
        navigation.navigateTo('/become-client');
      } else {
        navigation.navigateTo('/become-trainer');
      }
      return;
    }

    // Verificação simplificada - o switchModeAndRedirect já faz o redirecionamento correto
    // se o usuário não tiver o role necessário

    setIsChanging(true);
    try {
      // Usar o método simplificado que já faz redirecionamento
      switchModeAndRedirect(mode);
    } catch (error) {
      console.error('Error switching mode:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleCompleteProfile = () => {
    setShowIncompleteModal(false);
    if (pendingMode === 'client') {
      navigation.navigateTo('/become-client');
    } else if (pendingMode === 'trainer') {
      navigation.navigateTo('/become-trainer');
    }
    setPendingMode(null);
  };

  const getModeIcon = (mode: 'trainer' | 'client') => {
    return mode === 'trainer' ? Layers : User;
  };

  const getModeLabel = (mode: 'trainer' | 'client') => {
    return mode === 'trainer' ? 'Treinador' : 'Cliente';
  };

  const getModeStatus = (mode: 'trainer' | 'client') => {
    if (!user.roles.includes(mode)) return 'inactive';
    
    if (mode === 'client') {
      return user.clientProfile?.is_complete ? 'active' : 'incomplete';
    }
    
    if (mode === 'trainer') {
      if (!user.trainerProfile?.is_complete) return 'incomplete';
      if (!user.trainerProfile?.is_verified) return 'pending';
      return 'active';
    }
    
    return 'inactive';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showCurrentMode && (
          <Badge variant="outline" className="gap-1">
            {React.createElement(getModeIcon(user.currentMode), { className: "h-3 w-3" })}
            {getModeLabel(user.currentMode)}
          </Badge>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => handleModeSwitch(user.currentMode === 'trainer' ? 'client' : 'trainer')}
          disabled={isChanging || isLoading}
        >
          {isChanging ? (
            <LoadingSpinner size="sm" />
          ) : (
            <ArrowLeftRight className="h-3 w-3" />
          )}
          Alternar
        </Button>
      </div>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Alternar Modo</h3>
          </div>

          {needsTrainerApproval() && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Seu perfil de treinador está aguardando aprovação da nossa equipe.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            {(['client', 'trainer'] as const).map((mode) => {
              const Icon = getModeIcon(mode);
              const status = getModeStatus(mode);
              const isCurrentMode = user.currentMode === mode;
              const canSwitch = (status === 'active' || status === 'incomplete') && !isCurrentMode;

              return (
                <Button
                  key={mode}
                  variant={isCurrentMode ? 'default' : 'outline'}
                  className="justify-start h-auto p-3"
                  onClick={() => handleModeSwitch(mode)}
                  disabled={status === 'inactive' || isChanging || isLoading}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{getModeLabel(mode)}</div>
                        <div className="text-xs text-muted-foreground">
                          {mode === 'client' 
                            ? 'Procurar e contratar treinadores'
                            : 'Oferecer serviços de treinamento'
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isCurrentMode && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Ativo
                        </Badge>
                      )}
                      
                      {status === 'pending' && (
                        <Badge variant="outline" className="gap-1 text-amber-600 border-amber-600">
                          <Clock className="h-3 w-3" />
                          Pendente
                        </Badge>
                      )}

                      {status === 'incomplete' && !isCurrentMode && (
                        <Badge variant="outline" className="gap-1 text-blue-600 border-blue-600">
                          <Settings className="h-3 w-3" />
                          Completar
                        </Badge>
                      )}
                      
                      {isChanging && user.currentMode !== mode && (
                        <LoadingSpinner size="sm" />
                      )}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Modal para perfil incompleto */}
    <Dialog open={showIncompleteModal} onOpenChange={setShowIncompleteModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Perfil Incompleto</DialogTitle>
          <DialogDescription>
            Para acessar o modo {pendingMode === 'client' ? 'Cliente' : 'Treinador'}, 
            você precisa completar seu perfil primeiro.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={() => setShowIncompleteModal(false)}
          >
            Cancelar
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
  </>
);
}