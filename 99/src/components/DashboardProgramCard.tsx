import { useState, useId } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { supabase } from '../lib/supabase/client';
import { 
  Clock, 
  Users, 
  Star,
  Heart,
  MessageCircle,
  Play,
  Dumbbell,
  Edit,
  Copy,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface DashboardProgramCardProps {
  id: string;
  title: string;
  image?: string;
  level: string;
  category: string;
  duration: string;
  students: string;
  rating: number;
  price: string;
  trainer: {
    name: string;
    avatar: string;
    initials: string;
  };
  programData?: {
    coverImage?: string;
    shortDescription?: string;
    fullDescription?: string;
  };
  onNavigateToProgram?: (programId: string) => void;
  onNavigateToTrainer?: (trainerId: string) => void;
  onEdit?: (programId: string) => void;
  onDuplicate?: (programId: string) => void;
  onDelete?: (programId: string) => void;
  onView?: (programId: string) => void;
}

export function DashboardProgramCard({
  id,
  title,
  image,
  level,
  category,
  duration,
  students,
  rating,
  trainer,
  price,
  programData,
  onNavigateToProgram,
  onNavigateToTrainer,
  onEdit,
  onDuplicate,
  onDelete,
  onView
}: DashboardProgramCardProps) {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isActive, setIsActive] = useState(() => {
    // Verificar se está ativo nos dados do programa (program_data.isActive)
    if (programData && typeof programData === 'object' && 'isActive' in programData) {
      return (programData as any).isActive !== false;
    }
    return true; // Default para ativo se não especificado
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const switchId = useId();

  // Função para atualizar o status no banco de dados
  const handleActiveToggle = async (newActiveState: boolean) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      console.log('🔄 Atualizando status ativo do programa:', { id, newActiveState });

      // Buscar dados atuais do programa
      const { data: currentData, error: fetchError } = await supabase
        .from('99_training_programs')
        .select('program_data')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar dados atuais:', fetchError);
        return;
      }

      // Atualizar program_data com o novo status
      let updatedProgramData = currentData?.program_data || {};
      if (typeof updatedProgramData === 'string') {
        updatedProgramData = JSON.parse(updatedProgramData);
      }
      updatedProgramData.isActive = newActiveState;
      updatedProgramData.lastUpdated = new Date().toISOString();

      // Salvar no banco
      const { error: updateError } = await supabase
        .from('99_training_programs')
        .update({
          program_data: updatedProgramData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('❌ Erro ao atualizar programa:', updateError);
        return;
      }

      // Atualizar estado local apenas se a operação foi bem-sucedida
      setIsActive(newActiveState);
      console.log('✅ Status do programa atualizado com sucesso:', { id, isActive: newActiveState });

    } catch (error) {
      console.error('❌ Erro inesperado ao atualizar programa:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Debug do trainer avatar
  console.log('🎯 DashboardProgramCard Debug:', {
    programId: id,
    trainerName: trainer?.name,
    trainerAvatar: trainer?.avatar,
    trainerInitials: trainer?.initials,
    programCoverImage: programData?.coverImage
  });

  return (
    <Card className="w-full bg-white rounded-3xl border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
      <CardContent className={`p-0 transition-all duration-300 ${!isActive ? 'grayscale opacity-80' : ''}`}>
        {/* Program Images Grid */}
        <div className="relative h-40 sm:h-48 bg-gray-100">
          <div className="h-full">
            <div className="relative rounded-xl overflow-hidden bg-gray-200 h-full">
              <ImageWithFallback
                src={programData?.coverImage || image || "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400"}
                alt={title}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay for text visibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
            </div>
          </div>
          
          {/* Quick Actions - Always visible for dashboard */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {/* Active/Inactive Switch */}
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5">
              <Switch
                id={switchId}
                checked={isActive}
                onCheckedChange={handleActiveToggle}
                disabled={isUpdating}
                className="data-[state=unchecked]:border-input data-[state=unchecked]:[&_span]:bg-input data-[state=unchecked]:bg-transparent [&_span]:transition-all data-[state=unchecked]:[&_span]:size-4 data-[state=unchecked]:[&_span]:translate-x-0.5 data-[state=unchecked]:[&_span]:shadow-none data-[state=unchecked]:[&_span]:rtl:-translate-x-0.5"
              />
              <Label htmlFor={switchId} className="text-xs font-medium text-gray-700 cursor-pointer">
                {isActive ? 'Ativo' : 'Inativo'}
              </Label>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-white/90 backdrop-blur-sm border border-white/20 hover:bg-white transition-all duration-200"
                >
                  <MoreVertical className="h-4 w-4 text-gray-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onView?.(id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Online badge in top left */}
          <div className="absolute top-3 left-3">
            <div className="px-2 py-1 bg-black/80 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-xs font-medium">online</span>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 -mt-10 relative">
          {/* Avatar and Name Row */}
          <div className="flex items-start gap-2 mb-4">
            <div className="relative">
              <Avatar className="w-14 h-14 sm:w-16 sm:h-16 ring-4 ring-white shadow-lg">
                <AvatarImage 
                  src={trainer?.avatar} 
                  alt={trainer?.name || 'Trainer'}
                  onError={(e) => {
                    console.log('Avatar falhou ao carregar:', trainer?.avatar);
                  }}
                />
                <AvatarFallback className="bg-gray-900 text-white text-lg sm:text-xl font-semibold">
                  {trainer?.initials || trainer?.name?.charAt(0) || 'T'}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Trainer Name */}
            <div className="flex-1 pt-1">
              <div className="text-base sm:text-lg font-semibold text-white mt-2">
                {trainer?.name || 'Personal Trainer'}
              </div>
              <div className="text-sm text-gray-600">
                Personal Trainer
              </div>
            </div>
          </div>

          {/* Information Stack */}
          <div className="text-left space-y-2">
            {/* Program Title */}
            <div className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {title}
            </div>

            {/* Program Description */}
            <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {programData?.shortDescription || "Programa de treinamento personalizado para alcançar seus objetivos."}
            </div>

            {/* Program Type */}
            <div className="text-sm text-gray-600 m-0 p-0">
              <div className="flex items-center">
                <Dumbbell className="w-4 h-4 mr-1 text-red-600" />
                <span>{category} • {level}</span>
              </div>
            </div>

            {/* Duration, Students, Rating in responsive layout */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 py-3">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{students}</span>
                <span className="sm:hidden">{students.split(' ')[0]}</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-gray-400 fill-current" />
                <span className="font-medium text-gray-900">{rating}</span>
              </div>
            </div>

            {/* Price */}
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 pt-1">
              {price}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 sm:mt-6">
            {/* Main CTA Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToProgram?.(id);
              }}
              className={`flex-1 h-10 sm:h-12 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 ${
                isEnrolled
                  ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
                  : 'bg-red-600 text-white hover:bg-red-700 border-0 shadow-md'
              }`}
            >
              {!isEnrolled && <Play className="w-4 h-4 mr-2" />}
              {isEnrolled ? 'Matriculado' : 'Ver Programa'}
            </Button>
            
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-full border transition-all duration-200 ${
                isLiked 
                  ? 'border-gray-300 bg-gray-100 hover:bg-gray-200' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                isLiked ? 'text-red-500 fill-current' : 'text-gray-400'
              }`} />
            </Button>
          </div>

          {/* Secondary Button */}
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(id);
            }}
            className="w-full h-10 sm:h-12 rounded-full text-sm sm:text-base font-medium border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-200 mt-3"
          >
            <Edit className="w-4 h-4 mr-2 text-gray-500" />
            Editar programa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}