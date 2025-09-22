import { useState } from 'react';
import { User, Users, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from './dropdown-menu';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { toast } from 'sonner@2.0.3';

export type ProfileMode = 'trainer' | 'client';

interface ProfileToggleProps {
  currentMode: ProfileMode;
  onModeChange: (mode: ProfileMode) => void;
  userAvatar?: string;
  userName: string;
  userInitials: string;
  // Status dos perfis - se estão completos ou não
  trainerProfileComplete?: boolean;
  clientProfileComplete?: boolean;
  // Callbacks para quando perfil não está completo
  onIncompleteProfileClick?: (mode: ProfileMode) => void;
}

export function ProfileToggle({
  currentMode,
  onModeChange,
  userAvatar,
  userName,
  userInitials,
  trainerProfileComplete = false,
  clientProfileComplete = false,
  onIncompleteProfileClick
}: ProfileToggleProps) {
  const getModeLabel = (mode: ProfileMode) => {
    return mode === 'trainer' ? 'Treinador' : 'Cliente';
  };

  const getModeIcon = (mode: ProfileMode) => {
    return mode === 'trainer' ? Users : User;
  };

  const getCurrentModeIcon = () => {
    const IconComponent = getModeIcon(currentMode);
    return <IconComponent className="h-4 w-4" />;
  };

  const isProfileComplete = (mode: ProfileMode) => {
    return mode === 'trainer' ? trainerProfileComplete : clientProfileComplete;
  };

  const handleModeClick = (mode: ProfileMode) => {
    if (mode === currentMode) {
      return; // Já está no modo atual
    }

    if (!isProfileComplete(mode)) {
      // Perfil não está completo
      const modeLabel = getModeLabel(mode);
      toast.info(`Perfil de ${modeLabel} incompleto`, {
        description: `Complete seu perfil de ${modeLabel.toLowerCase()} para acessar essa área.`,
        action: {
          label: 'Completar',
          onClick: () => onIncompleteProfileClick?.(mode)
        }
      });
      return;
    }

    // Perfil completo, pode alternar
    onModeChange(mode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-2 hover:bg-muted/50 border border-border/40">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              {getCurrentModeIcon()}
              <span className="text-sm font-medium">{getModeLabel(currentMode)}</span>
            </div>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="text-foreground truncate text-sm font-medium">
            {userName}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            Alternar entre perfis
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Opção Treinador */}
        <DropdownMenuItem 
          onClick={() => handleModeClick('trainer')}
          className={`cursor-pointer ${currentMode === 'trainer' ? 'bg-accent' : ''}`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Modo Treinador</span>
            </div>
            <div className="flex items-center gap-1">
              {currentMode === 'trainer' && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  Ativo
                </Badge>
              )}
              {!isProfileComplete('trainer') && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Incompleto
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuItem>

        {/* Opção Cliente */}
        <DropdownMenuItem 
          onClick={() => handleModeClick('client')}
          className={`cursor-pointer ${currentMode === 'client' ? 'bg-accent' : ''}`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span>Modo Cliente</span>
            </div>
            <div className="flex items-center gap-1">
              {currentMode === 'client' && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  Ativo
                </Badge>
              )}
              {!isProfileComplete('client') && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Incompleto
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        {/* Informações sobre perfis incompletos */}
        {(!trainerProfileComplete || !clientProfileComplete) && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
              💡 Complete seus perfis para aproveitar todas as funcionalidades
            </DropdownMenuLabel>
            <div className="px-2 pb-2 text-xs text-muted-foreground">
              {!trainerProfileComplete && (
                <div>• Complete o perfil de <strong>Treinador</strong> para oferecer serviços</div>
              )}
              {!clientProfileComplete && (
                <div>• Complete o perfil de <strong>Cliente</strong> para contratar treinadores</div>
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}