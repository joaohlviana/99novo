import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Clock, 
  Users, 
  Star,
  Heart,
  BookOpen,
  Play,
  MapPin,
  CheckCircle
} from 'lucide-react';

interface FigmaProgramCardProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  level: string;
  category: string;
  duration: string;
  students: string;
  rating: number;
  reviewCount?: number;
  price: string;
  originalPrice?: string;
  isOnline?: boolean;
  isPresential?: boolean;
  trainer: {
    name: string;
    avatar: string;
    initials: string;
    verified?: boolean;
  };
  features?: string[];
  onNavigateToProgram?: (programId: string) => void;
  onNavigateToTrainer?: (trainerId: string) => void;
}

export function FigmaProgramCard({
  id,
  title,
  description,
  image,
  level,
  category,
  duration,
  students,
  rating,
  reviewCount = 0,
  price,
  originalPrice,
  isOnline = true,
  isPresential = false,
  trainer,
  features = [],
  onNavigateToProgram,
  onNavigateToTrainer
}: FigmaProgramCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card className="group w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-0 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 will-change-transform">
      <CardContent className="p-0">
        
        {/* Image Section - Premium Design */}
        <div className="relative h-48 overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-100 to-gray-50">
          <ImageWithFallback
            src={image}
            alt={`Imagem do programa ${title}`}
            className="h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110 will-change-transform"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Overlay gradients for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
          
          {/* Category Badge - Top Left */}
          <div className="absolute left-3 top-3 transform transition-all duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-1">
            <Badge className="rounded-lg border-0 bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-lg backdrop-blur-sm hover:bg-white transition-colors">
              {category}
            </Badge>
          </div>

          {/* Like Button - Top Right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            aria-label={isLiked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg border-0 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-white hover:scale-110 hover:shadow-xl hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#e0093e]/50 ${
              isLiked ? 'bg-white scale-105' : ''
            }`}
          >
            <Heart
              className={`h-4 w-4 transition-all duration-300 ${
                isLiked ? 'text-[#e0093e] fill-current scale-110' : 'text-gray-600 hover:text-gray-900'
              }`}
            />
          </button>

          {/* Play Button - Center overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 ease-out group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToProgram?.(id);
              }}
              aria-label={`Visualizar programa ${title}`}
              className="rounded-full bg-[#e0093e]/90 p-3 text-white shadow-2xl backdrop-blur-sm border border-white/20 hover:bg-[#e0093e] hover:scale-110 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </button>
          </div>

          {/* Level Badge - Bottom Left */}
          <div className="absolute bottom-3 left-3">
            <Badge className="rounded-lg border-0 bg-[#e0093e] px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
              {level}
            </Badge>
          </div>

          {/* Mode badges - Bottom Right */}
          <div className="absolute bottom-3 right-3 flex gap-1">
            {isOnline && (
              <Badge className="rounded-lg border-0 bg-blue-500 px-2 py-1 text-xs font-medium text-white shadow-sm">
                Online
              </Badge>
            )}
            {isPresential && (
              <Badge className="rounded-lg border-0 bg-green-500 px-2 py-1 text-xs font-medium text-white shadow-sm">
                <MapPin className="h-3 w-3 mr-1" />
                Presencial
              </Badge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          
          {/* Header with Trainer Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold leading-tight text-gray-900 mb-1 line-clamp-2 group-hover:text-gray-800 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {description}
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToTrainer?.(trainer.name);
              }}
              className="ml-3 flex-shrink-0 transition-transform hover:scale-105"
            >
              <Avatar className="h-10 w-10 ring-2 ring-gray-100 hover:ring-[#e0093e]/30 transition-all">
                <AvatarImage src={trainer.avatar} alt={trainer.name} />
                <AvatarFallback className="bg-gradient-to-br from-[#e0093e] to-[#c40835] text-white text-xs font-semibold">
                  {trainer.initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>

          {/* Trainer Name */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-gray-700">{trainer.name}</span>
              {trainer.verified && (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{students}</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <Star className="h-4 w-4 fill-current text-amber-400" />
              <span className="font-semibold text-gray-900">{rating}</span>
              {reviewCount > 0 && (
                <span className="text-gray-500">({reviewCount})</span>
              )}
            </div>
          </div>

          {/* Features List */}
          {features.length > 0 && (
            <div className="mb-4 space-y-1.5">
              {features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Price and CTA */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gray-900">{price}</span>
                {originalPrice && (
                  <span className="text-sm text-gray-500 line-through">{originalPrice}</span>
                )}
              </div>
              <span className="text-sm text-gray-600">por mês</span>
            </div>
            
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToProgram?.(id);
              }}
              className="h-9 rounded-lg border-0 bg-[#e0093e] px-4 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c40835] hover:shadow-lg active:translate-y-0 active:scale-95"
            >
              <BookOpen className="mr-1.5 h-4 w-4" />
              Ver programa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}