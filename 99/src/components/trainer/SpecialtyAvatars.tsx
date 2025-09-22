import React from "react";
import { Activity } from "lucide-react";
import { SPECIALTY_ICONS } from "./constants/specialty-config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface SpecialtyAvatarsProps {
  specialties: string[] | any[];
}

export function SpecialtyAvatars({
  specialties,
}: SpecialtyAvatarsProps) {
  // ✅ PROTEÇÃO: Garantir que specialties é array de strings
  const normalizedSpecialties = React.useMemo(() => {
    console.log('🏷️ SpecialtyAvatars - dados recebidos:', specialties);
    
    if (!Array.isArray(specialties)) {
      console.warn('⚠️ SpecialtyAvatars - specialties não é array:', typeof specialties);
      return [];
    }
    
    const normalized = specialties
      .map(spec => {
        if (typeof spec === 'string') return spec;
        if (typeof spec === 'object' && spec !== null) {
          console.log('🔄 Convertendo objeto specialty:', spec);
          return spec.description || spec.category || spec.name || 'Especialidade';
        }
        return String(spec);
      })
      .filter(Boolean);
      
    console.log('✅ SpecialtyAvatars - especialidades normalizadas:', normalized);
    return normalized;
  }, [specialties]);
  const getSpecialtyIcon = (specialty: string) => {
    const IconComponent =
      SPECIALTY_ICONS[specialty] || Activity;
    return <IconComponent className="h-5 w-5" />;
  };

  // Using grayscale tones based on specialty
  const getSpecialtyStyle = (specialty: string) => {
    const grayTones = {
      Musculação: "bg-gray-800 text-white hover:bg-gray-700",
      Funcional: "bg-gray-600 text-white hover:bg-gray-500",
      Corrida: "bg-gray-500 text-white hover:bg-gray-400",
      Nutrição: "bg-gray-700 text-white hover:bg-gray-600",
      Crossfit: "bg-gray-900 text-white hover:bg-gray-800",
      Natação: "bg-gray-400 text-white hover:bg-gray-300",
      Yoga: "bg-gray-300 text-gray-800 hover:bg-gray-200",
      Pilates: "bg-gray-200 text-gray-800 hover:bg-gray-100",
      Boxe: "bg-gray-900 text-white hover:bg-gray-800",
      Dança: "bg-gray-350 text-white hover:bg-gray-300",
      Tênis: "bg-gray-600 text-white hover:bg-gray-500",
      Futebol: "bg-gray-700 text-white hover:bg-gray-600",
      Basquete: "bg-gray-800 text-white hover:bg-gray-700",
      Vôlei: "bg-gray-500 text-white hover:bg-gray-400",
      MMA: "bg-gray-900 text-white hover:bg-gray-800",
    };

    return (
      grayTones[specialty] ||
      "bg-gray-600 text-white hover:bg-gray-500"
    );
  };

  // ✅ GUARD: Se não há especialidades válidas, renderizar estado vazio
  if (normalizedSpecialties.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Especialidades:
        </p>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Nenhuma especialidade informada
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Especialidades:
        </p>

        <div className="flex items-center gap-4">
          {/* Avatares sobrepostos */}
          <div className="flex -space-x-2">
            {normalizedSpecialties.slice(0, 4).map((specialty, index) => (
              <Tooltip key={specialty}>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-background
                      ${getSpecialtyStyle(specialty)}
                      hover:scale-110 transition-all duration-200 cursor-pointer
                      shadow-sm hover:shadow-md
                    `}
                    style={{
                      zIndex: normalizedSpecialties.length - index,
                    }}
                  >
                    {getSpecialtyIcon(specialty)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{specialty}</p>
                </TooltipContent>
              </Tooltip>
            ))}

            {normalizedSpecialties.length > 4 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-110 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                    <span className="text-xs font-medium">
                      +{normalizedSpecialties.length - 4}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">
                      Outras especialidades:
                    </p>
                    {normalizedSpecialties.slice(4).map((specialty) => (
                      <p key={specialty} className="text-sm">
                        {specialty}
                      </p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Lista de especialidades */}
          <div className="flex flex-wrap gap-1 text-sm text-muted-foreground">
            {normalizedSpecialties.slice(0, 3).map((specialty, index) => (
              <span key={specialty}>
                {specialty}
                {index < Math.min(normalizedSpecialties.length - 1, 2) &&
                  ", "}
              </span>
            ))}
            {normalizedSpecialties.length > 3 && (
              <span className="text-muted-foreground/70">
                e mais {normalizedSpecialties.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}