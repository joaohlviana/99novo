/**
 * 👤 USER MENU BUTTON
 * 
 * Componente padronizado para o botão de usuário nos dashboards
 * Baseado no padrão do Header.tsx
 */

import { ChevronDown } from 'lucide-react';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

interface UserMenuButtonProps {
  /** URL do avatar do usuário */
  userAvatar?: string | null;
  /** Nome do usuário */
  userName: string;
  /** Iniciais do usuário para fallback */
  userInitials: string;
  /** Classes CSS adicionais */
  className?: string;
  /** Callback quando o botão é clicado */
  onClick?: () => void;
  /** Se deve mostrar o ChevronDown */
  showChevron?: boolean;
  /** Cor de fundo do fallback do avatar */
  avatarFallbackColor?: string;
}

export function UserMenuButton({
  userAvatar,
  userName,
  userInitials,
  className = "",
  onClick,
  showChevron = true,
  avatarFallbackColor = "text-gray-700 bg-gray-200"
}: UserMenuButtonProps) {
  return (
    <Button 
      variant="ghost" 
      className={`flex items-center space-x-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 h-auto p-0 hover:bg-transparent ${className}`}
      onClick={onClick}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={userAvatar?.url || userAvatar || undefined} alt={userName} />
        <AvatarFallback className={`text-sm ${avatarFallbackColor}`}>
          {userInitials}
        </AvatarFallback>
      </Avatar>
      <span className="font-medium hidden lg:inline">{userName}</span>
      {showChevron && <ChevronDown className="h-4 w-4" />}
    </Button>
  );
}

export default UserMenuButton;