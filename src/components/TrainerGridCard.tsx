import { useState, forwardRef } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  MapPin,
  Star,
  Heart,
  MessageCircle,
  Verified,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  getSpecialtyIcon,
  getSpecialtyColor,
} from "./trainer/constants/specialty-config";

interface TrainerGridCardProps {
  trainer: {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviewCount: number;
    location: string;
    specialties: string[];
    verified: boolean;
    isTopRated?: boolean;
    languages?: string[];
    title?: string;
    description?: string;
    skills?: string[];
    portfolioImages?: string[];
    priceFrom?: string;
  };
  onNavigateToTrainer?: (trainerId: string) => void;
}

// Componente wrapper para receber refs
const SpecialtyAvatar = forwardRef<
  HTMLDivElement,
  {
    className: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
  }
>(({ className, style, children }, ref) => (
  <div ref={ref} className={className} style={style}>
    {children}
  </div>
));

SpecialtyAvatar.displayName = "SpecialtyAvatar";

export function TrainerGridCard({
  trainer,
  onNavigateToTrainer,
}: TrainerGridCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const backgroundColors = [
    "bg-gradient-to-br from-orange-400 to-orange-500",
    "bg-gradient-to-br from-blue-400 to-blue-500",
    "bg-gradient-to-br from-purple-400 to-purple-500",
    "bg-gradient-to-br from-green-400 to-green-500",
    "bg-gradient-to-br from-pink-400 to-pink-500",
    "bg-gradient-to-br from-indigo-400 to-indigo-500",
  ];

  const bgColor =
    backgroundColors[
      trainer.id.length % backgroundColors.length
    ];

  const getSpecialtyStyle = (specialty: string) => {
    return getSpecialtyColor(specialty);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white rounded-2xl overflow-hidden">
      <div className="p-6">
        {/* Header com foto, nome e rating */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <ImageWithFallback
              src={trainer.image}
              alt={`${trainer.name} - Personal Trainer`}
              className="w-25 h-25 rounded-full object-cover border-4 border-border shadow-lg group-hover:shadow-xl transition-shadow duration-300"
            />
            {trainer.verified && (
              <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1.5 shadow-lg border-2 border-background">
                <Verified className="h-5 w-5 text-[#e0093e]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {trainer.name}
              </h3>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-black text-black" />
                <span className="font-medium text-gray-900">
                  {trainer.rating.toFixed(1)}
                </span>
                <span className="text-gray-500">
                  ({trainer.reviewCount})
                </span>
              </div>
            </div>

            {trainer.isTopRated && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 mb-2">
                Top Rated ◆◆◆
              </Badge>
            )}

            <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
              <MapPin className="h-4 w-4" />
              <span>{trainer.location}</span>
            </div>

            {/* Avatares de especialidades esportivas */}
            <div className="flex -space-x-2">
              {trainer.specialties
                .slice(0, 4)
                .map((specialty, index) => (
                  <Tooltip key={specialty}>
                    <TooltipTrigger asChild>
                      <SpecialtyAvatar
                        className={`
                        relative flex items-center justify-center w-10 h-10 rounded-full
                        ${getSpecialtyStyle(specialty)}
                        hover:scale-110 transition-all duration-200 cursor-pointer
                        shadow-sm hover:shadow-md
                      `}
                        style={{
                          zIndex:
                            trainer.specialties.length -
                            index,
                        }}
                      >
                        {getSpecialtyIcon(specialty)}
                      </SpecialtyAvatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{specialty}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}

              {trainer.specialties.length > 4 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SpecialtyAvatar className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-110 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                      <span className="text-xs font-medium">
                        +{trainer.specialties.length - 4}
                      </span>
                    </SpecialtyAvatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">
                        Outras especialidades:
                      </p>
                      {trainer.specialties
                        .slice(4)
                        .map((specialty) => (
                          <p
                            key={specialty}
                            className="text-sm"
                          >
                            {specialty}
                          </p>
                        ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
          >
            <Heart
              className={`h-4 w-4 ${isLiked ? "fill-[#e0093e] text-[#e0093e]" : "text-gray-400"}`}
            />
          </Button>
        </div>

        {/* Título profissional */}
        {trainer.title && (
          <h4 className="font-semibold text-gray-900 mb-3">
            {trainer.title}
          </h4>
        )}

        {/* Descrição */}
        {trainer.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {trainer.description}
          </p>
        )}

        {/* Skills/Specialties */}
        {trainer.skills && trainer.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {trainer.skills.slice(0, 4).map((skill, index) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs"
              >
                {skill}
              </Badge>
            ))}
            {trainer.skills.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                + {trainer.skills.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Portfolio/Trabalhos */}
        {trainer.portfolioImages &&
          trainer.portfolioImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {trainer.portfolioImages
                .slice(0, 2)
                .map((image, index) => (
                  <div
                    key={index}
                    className="aspect-video rounded-lg overflow-hidden"
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`Trabalho ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
            </div>
          )}

        {/* Footer com preço e ação */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">
              A partir de:
            </span>
            <p className="font-semibold text-lg text-gray-900">
              {trainer.priceFrom || "R$ 35"}
            </p>
          </div>

          <Button
            className="bg-gray-900 hover:bg-gray-800 text-white px-6"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToTrainer?.(trainer.id);
            }}
          >
            Ver Perfil
          </Button>
        </div>
      </div>
    </Card>
  );
}