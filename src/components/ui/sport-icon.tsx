import { getSportIcon } from '../../lib/sports-icons';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Activity } from 'lucide-react';

interface SportIconProps {
  sportName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  grayscale?: boolean;
  opacity?: number;
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10'
};

export function SportIcon({ 
  sportName, 
  size = 'md', 
  className = '', 
  grayscale = true,
  opacity = 0.7 
}: SportIconProps) {
  const iconUrl = getSportIcon(sportName);
  const sizeClass = sizeClasses[size];
  
  const baseClasses = `${sizeClass} object-contain flex-shrink-0 transition-all duration-200`;
  const filterClasses = grayscale ? 'grayscale' : '';
  const opacityStyle = { opacity };
  
  if (!iconUrl) {
    // Fallback para ícone genérico se não encontrar o ícone específico
    return (
      <Activity 
        className={`${baseClasses} ${className} text-gray-500`}
        style={opacityStyle}
      />
    );
  }

  return (
    <img
      src={iconUrl}
      alt={`Ícone do esporte ${sportName}`}
      className={`${baseClasses} ${filterClasses} ${className}`}
      style={opacityStyle}
      loading="lazy"
    />
  );
}

// Componente especializado para badges com ícones de esporte
interface SportBadgeProps {
  sportName: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
  showIcon?: boolean;
}

export function SportBadge({ 
  sportName, 
  size = 'md',
  variant = 'secondary',
  className = '',
  showIcon = true
}: SportBadgeProps) {
  const iconSize = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-gray-100 text-gray-700 border-gray-200',
    outline: 'border border-gray-200 text-gray-700 bg-transparent hover:bg-gray-50'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className={`
      inline-flex items-center gap-2 rounded-full font-medium
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `}>
      {showIcon && (
        <SportIcon 
          sportName={sportName} 
          size={iconSize}
          grayscale={true}
          opacity={0.8}
        />
      )}
      <span>{sportName}</span>
    </div>
  );
}

// Hook para usar ícones de esporte de forma consistente
export function useSportIcon(sportName: string) {
  const iconUrl = getSportIcon(sportName);
  
  return {
    iconUrl,
    hasIcon: !!iconUrl,
    SportIcon: (props: Omit<SportIconProps, 'sportName'>) => (
      <SportIcon sportName={sportName} {...props} />
    ),
    SportBadge: (props: Omit<SportBadgeProps, 'sportName'>) => (
      <SportBadge sportName={sportName} {...props} />
    )
  };
}