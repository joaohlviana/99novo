import { CheckCircle } from "lucide-react";

interface TrainerAvatarProps {
  image: string;
  name: string;
}

export function TrainerAvatar({
  image,
  name,
}: TrainerAvatarProps) {
  const initials = (name || 'T').slice(0, 2).toUpperCase();
  
  // ✅ LOG DE DIAGNÓSTICO
  console.log('🖼️ TrainerAvatar recebeu:', {
    image,
    name,
    initials,
    hasImage: !!image && image.trim() !== ''
  });
  
  return (
    <div className="flex-shrink-0">
      <div className="relative group">
        {image && image.trim() !== '' ? (
          <img
            src={image}
            alt={`${name} - Personal Trainer`}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-border shadow-lg group-hover:shadow-xl transition-shadow duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback avatar */}
        <div 
          className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-900 text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300 flex items-center justify-center border-4 border-border" 
          style={{ display: image && image.trim() !== '' ? 'none' : 'flex' }}
        >
          <span className="text-2xl md:text-4xl font-semibold">{initials}</span>
        </div>
        
        <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1.5 shadow-lg border-2 border-background">
          <CheckCircle className="h-6 w-6 text-[#FF385C]" />
        </div>
      </div>
    </div>
  );
}