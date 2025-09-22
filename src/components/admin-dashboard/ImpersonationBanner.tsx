import { AlertTriangle, X, User, UserCheck } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useImpersonation } from '../../hooks/useImpersonation';

interface ImpersonationBannerProps {
  onStopImpersonation: () => void;
}

export function ImpersonationBanner({ onStopImpersonation }: ImpersonationBannerProps) {
  const { impersonatedUser, isImpersonating, stopImpersonation } = useImpersonation();

  if (!isImpersonating || !impersonatedUser) return null;

  const handleStopImpersonation = () => {
    stopImpersonation();
    onStopImpersonation();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div className="flex items-center gap-3">
              <span className="font-medium">Modo Administrador:</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={impersonatedUser.avatar} />
                  <AvatarFallback className="text-xs">
                    {impersonatedUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span>
                  Personificando <strong>{impersonatedUser.name}</strong>
                </span>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-xs">
                  {impersonatedUser.type === 'trainer' ? (
                    <UserCheck className="h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  {impersonatedUser.type === 'trainer' ? 'Treinador' : 'Cliente'}
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStopImpersonation}
            className="text-white hover:bg-white/20 h-8 px-3"
          >
            <X className="h-4 w-4 mr-1" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}