import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StarRatingProps {
  rating: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StarRating({ 
  rating, 
  showValue = true, 
  size = 'md',
  className 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn("flex items-center gap-1 flex-shrink-0", className)}>
      <Star className={cn(sizeClasses[size], "text-yellow-400 fill-current")} />
      {showValue && (
        <span className={cn("font-medium text-gray-900", textSizeClasses[size])}>
          {rating}
        </span>
      )}
    </div>
  );
}