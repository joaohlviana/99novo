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
  CheckCircle,
  Award,
  Zap
} from 'lucide-react';

interface FigmaCard2Props {
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
  discount?: string;
  isOnline?: boolean;
  isPresential?: boolean;
  isFeatured?: boolean;
  trainer: {
    name: string;
    avatar: string;
    initials: string;
    verified?: boolean;
    badge?: string;
  };
  features?: string[];
  onNavigateToProgram?: (programId: string) => void;
  onNavigateToTrainer?: (trainerId: string) => void;
}

export function FigmaCard2({
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
  discount,
  isOnline = true,
  isPresential = false,
  isFeatured = false,
  trainer,
  features = [],
  onNavigateToProgram,
  onNavigateToTrainer
}: FigmaCard2Props) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={`group relative w-full max-w-sm mx-auto overflow-hidden rounded-3xl border-0 bg-white shadow-md hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 will-change-transform ${
        isFeatured ? 'ring-2 ring-[#e0093e]/20' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
          <Badge className="rounded-full border-0 bg-gradient-to-r from-[#e0093e] to-[#c40835] px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            <Zap className="h-3 w-3 mr-1" />
            Destaque
          </Badge>
        </div>
      )}

      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden rounded-t-3xl">
          <ImageWithFallback
            src={image}
            alt={`Programa ${title}`}
            className="h-full w-full object-cover transition-all duration-1000 ease-out group-hover:scale-110 will-change-transform"
          />

          {/* Dynamic Gradient Overlay */}
          <div className={`absolute inset-0 transition-all duration-500 ${
            isHovered 
              ? 'bg-gradient-to-t from-black/70 via-black/20 to-transparent' 
              : 'bg-gradient-to-t from-black/50 via-transparent to-black/10'
          }`} />

          {/* Top Row - Category & Heart */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            <Badge className="rounded-xl border-0 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-black/40 transition-colors">
              {category}
            </Badge>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`grid h-10 w-10 place-items-center rounded-xl border-0 bg-black/30 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-black/40 active:scale-95 ${
                isLiked ? 'bg-white/90 scale-110' : ''
              }`}
            >
              <Heart
                className={`h-4 w-4 transition-all duration-300 ${
                  isLiked ? 'text-[#e0093e] fill-current' : 'text-white'
                }`}
              />
            </button>
          </div>

          {/* Center Play Button - Only visible on hover */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToProgram?.(id);
              }}
              className="grid h-16 w-16 place-items-center rounded-full bg-white/95 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white active:scale-95"
            >
              <Play className="h-6 w-6 fill-current text-[#e0093e] ml-1" />
            </button>
          </div>

          {/* Bottom Row - Level & Mode */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <Badge className="rounded-xl border-0 bg-[#e0093e] px-3 py-1.5 text-xs font-bold text-white shadow-lg">
              {level}
            </Badge>
            
            <div className="flex gap-2">
              {isOnline && (
                <Badge className="rounded-lg border-0 bg-blue-500/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  Online
                </Badge>
              )}
              {isPresential && (
                <Badge className="rounded-lg border-0 bg-green-500/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  Presencial
                </Badge>
              )}
            </div>
          </div>

          {/* Discount Badge - Top Right Corner */}
          {discount && (
            <div className="absolute -top-1 -right-1">
              <div className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 p-2 shadow-lg">
                <span className="text-xs font-bold text-white">{discount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="relative p-6">
          
          {/* Trainer Badge - Overlapping */}
          <div className="absolute -top-6 left-6 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToTrainer?.(trainer.name);
              }}
              className="flex items-center gap-3 rounded-2xl border-2 border-white bg-white px-3 py-2 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                <AvatarImage src={trainer.avatar} alt={trainer.name} />
                <AvatarFallback className="bg-gradient-to-br from-[#e0093e] to-[#c40835] text-white text-xs font-semibold">
                  {trainer.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-gray-900 truncate">{trainer.name}</span>
                  {trainer.verified && <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />}
                </div>
                {trainer.badge && (
                  <span className="text-xs text-[#e0093e] font-medium">{trainer.badge}</span>
                )}
              </div>
            </button>
          </div>

          {/* Main Content - Adjusted for overlapping trainer */}
          <div className="mt-8">
            
            {/* Title and Description */}
            <div className="mb-4">
              <h3 className="text-xl font-bold leading-tight text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-800 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Stats Row - Enhanced Design */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="flex flex-col items-center p-3 rounded-xl bg-gray-50 transition-colors hover:bg-gray-100">
                <Clock className="h-4 w-4 text-gray-500 mb-1" />
                <span className="text-xs font-semibold text-gray-900">{duration}</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-gray-50 transition-colors hover:bg-gray-100">
                <Users className="h-4 w-4 text-gray-500 mb-1" />
                <span className="text-xs font-semibold text-gray-900">{students}</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-gray-50 transition-colors hover:bg-gray-100">
                <Star className="h-4 w-4 fill-current text-amber-400 mb-1" />
                <span className="text-xs font-semibold text-gray-900">{rating}</span>
              </div>
            </div>

            {/* Features Preview */}
            {features.length > 0 && (
              <div className="mb-5">
                <div className="flex flex-wrap gap-2">
                  {features.slice(0, 2).map((feature, index) => (
                    <div key={index} className="flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium text-green-800">{feature}</span>
                    </div>
                  ))}
                  {features.length > 2 && (
                    <span className="text-xs text-gray-500 px-2 py-1">+{features.length - 2} mais</span>
                  )}
                </div>
              </div>
            )}

            {/* Price and CTA */}
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2 mb-1">
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
                className="h-11 rounded-xl border-0 bg-gradient-to-r from-[#e0093e] to-[#c40835] px-6 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:from-[#c40835] hover:to-[#a0072b] hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Ver programa
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}