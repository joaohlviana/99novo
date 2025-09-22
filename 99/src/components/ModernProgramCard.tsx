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
  MessageCircle,
  Play
} from 'lucide-react';
import { StarRating } from './ui/star-rating';
import { useNavigation } from '../hooks/useNavigation';

interface ProgramCardProps {
  id: string;
  title?: string;
  image?: string;
  level?: string;
  category?: string;
  duration?: string;
  students?: string | number;
  rating?: number;
  price?: string | number;
  trainer?: {
    name?: string;
    avatar?: string;
    initials?: string;
  };
  // Novos campos para compatibilidade com dados híbridos
  pricing?: {
    amount?: number;
    currency?: string;
  };
  stats?: {
    enrollments?: number;
    averageRating?: number;
  };
  className?: string;
}

export function ModernProgramCard({
  id,
  title = '',
  image,
  level = '',
  category = '',
  duration = '',
  students = '',
  rating = 0,
  trainer = {},
  price = '',
  pricing,
  stats,
  className
}: ProgramCardProps) {
  const navigation = useNavigation();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Normalizar dados para compatibilidade com estrutura híbrida
  const normalizedPrice = pricing?.amount ? 
    `R$ ${pricing.amount.toLocaleString('pt-BR')}` : 
    price || 'Preço não informado';
    
  const normalizedRating = stats?.averageRating || rating || 0;
  
  const normalizedStudents = stats?.enrollments ? 
    `${stats.enrollments} alunos` : 
    typeof students === 'number' ? `${students} alunos` : 
    students || '0 alunos';

  return (
    <Card className={`flex h-full flex-col bg-white rounded-3xl border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 ${className || ''}`}>
      <CardContent className="p-0 flex flex-col h-full">
        {/* Program Images Grid - Proporção fixa 16/9 */}
        <div className="relative aspect-[16/9] max-h-44 bg-gray-100">
      <div className="h-full">
        <div className="relative rounded-xl overflow-hidden bg-gray-200 h-full">
          <ImageWithFallback
            src={
              image ||
              "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400"
            }
            alt={title || 'Programa'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
        </div>
      </div>

      {/* Online badge */}
      <div className="absolute top-3 right-3">
        <div className="w-8 h-8 bg-black rounded-[2px] flex items-center justify-center text-[14px]">
          <span className="text-white text-xs font-bold text-[10px]">online</span>
        </div>
      </div>
    </div>

        {/* Profile Section */}
        <div className="flex-1 flex flex-col px-5 relative mt-[-26px]">
      {/* Avatar */}
      <div className="flex items-start gap-2 mb-3">
        <Avatar className="w-12 h-12 ring-3 ring-white shadow-lg">
          <AvatarImage src={trainer?.avatar || ''} alt={trainer?.name || 'Trainer'} />
          <AvatarFallback className="bg-gray-900 text-white text-sm font-semibold">
            {trainer?.initials || trainer?.name?.slice(0, 2).toUpperCase() || 'TR'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 pt-0.5">
          <div className="text-base font-semibold text-white mt-1 text-[15px]">{trainer?.name || 'Nome não disponível'}</div>
          <div className="text-xs text-gray-600 text-[12px]">Personal</div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5 flex-1 flex flex-col">
        <div className="flex flex-wrap items-start gap-x-3 gap-y-1 mt-1 mb-2">
          <div className="text-xl font-bold text-gray-900 leading-tight flex-1 min-w-0 line-clamp-2 min-h-[3.5rem]">
            {title || 'Programa sem título'}
          </div>
          <div className="flex items-center justify-center mb-2.5">
            <Star className="w-4 h-4 mr-1 text-gray-500" />
            <span className="font-medium text-gray-900 text-base">{normalizedRating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mb-1">
          <Badge
            variant="secondary"
            className="px-3 py-1 text-sm rounded-full border-0 font-medium bg-gray-100 text-gray-700"
          >
            {category || 'Categoria'}
          </Badge>
          <Badge
            variant="secondary"
            className="px-3 py-1 text-sm rounded-full border-0 font-medium bg-gray-100 text-gray-700"
          >
            {level || 'Nível'}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 py-2">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration || 'Duração'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{normalizedStudents}</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">{normalizedPrice}</div>
      </div>

          {/* Buttons - Sempre no fundo com mt-auto */}
          <div className="mt-auto space-y-2.5">
        <div className="flex gap-2">
  {/* Botão principal ocupa todo o espaço */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      navigation.navigateToProgram(id);
    }}
    className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-medium transition-all h-10 px-4 py-2 bg-[#e0093e] hover:bg-[#c0082e] text-white text-[14px]"
  >
    {!isEnrolled && <Play className="w-4 h-4 mr-1" />}
    {isEnrolled ? "Matriculado" : "Começar"}
  </button>

  {/* Botão de like fixo */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      setIsLiked(!isLiked);
    }}
    className={`inline-flex items-center justify-center rounded-full h-10 w-10 border transition-all ${
      isLiked
        ? "border-gray-300 bg-gray-100 hover:bg-gray-200"
        : "border-gray-200 hover:bg-gray-50"
    }`}
  >
    <Heart
      className={`w-4 h-4 ${
        isLiked ? "text-red-500 fill-current" : "text-gray-400"
      }`}
    />
  </button>
</div>


            <button
              onClick={(e) => {
                e.stopPropagation();
                navigation.navigateToTrainer('1');
              }}
              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-medium transition-all h-9 px-4 py-2 border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 text-[13px]"
            >
              <MessageCircle className="w-4 h-4 mr-2 text-gray-500" />
              Contatar
            </button>
          </div>
        </div>
      </CardContent>
    </Card>

  );
}