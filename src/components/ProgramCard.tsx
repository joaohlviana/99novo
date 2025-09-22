import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { MapPin, Star, Heart, Users, Clock, Calendar, Monitor, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProgramCatalog } from '../data/programs-catalog-data';

interface ProgramCardProps {
  program: ProgramCatalog;
  // onNavigateToProgram removed - using useNavigation hook instead
}

import { useNavigation } from '../hooks/useNavigation';

export function ProgramCard({ program }: ProgramCardProps) {
  const { navigateToProgram } = useNavigation();
  const [isLiked, setIsLiked] = useState(false);

  const getLocationIcon = () => {
    switch (program.location) {
      case 'online':
        return <Monitor className="h-4 w-4" />;
      case 'presencial':
        return <User className="h-4 w-4" />;
      case 'hibrido':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getLocationText = () => {
    switch (program.location) {
      case 'online':
        return 'Online';
      case 'presencial':
        return 'Presencial';
      case 'hibrido':
        return 'Híbrido';
      default:
        return 'Online';
    }
  };

  const getPeriodBadge = () => {
    return program.period === 'programa-fechado' ? 'Programa Fechado' : 'Mensal';
  };

  const getLevelColor = () => {
    switch (program.level) {
      case 'iniciante':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediario':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'avancado':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer glass-card rounded-2xl overflow-hidden">
      <div className="relative">
        {/* Imagem do programa */}
        <div className="aspect-video overflow-hidden">
          <ImageWithFallback
            src={program.image}
            alt={program.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Badge de popular */}
        {program.isPopular && (
          <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-0">
            Popular
          </Badge>
        )}

        {/* Botão de like */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 p-2 glass hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </Button>
      </div>

      <div className="p-6">
        {/* Header com título e avaliação */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 flex-1">
              {program.title}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-4 w-4 fill-black text-black" />
              <span className="font-medium text-gray-900">{program.trainer.rating.toFixed(1)}</span>
              <span className="text-gray-500">({program.trainer.reviewCount})</span>
            </div>
          </div>

          {/* Treinador */}
          <div className="flex items-center gap-2 mb-3">
            <ImageWithFallback
              src={program.trainer.image}
              alt={program.trainer.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm text-gray-600">por {program.trainer.name}</span>
          </div>

          {/* Tags principais */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={getLevelColor()}>
              {program.level.charAt(0).toUpperCase() + program.level.slice(1)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getPeriodBadge()}
            </Badge>
          </div>
        </div>

        {/* Descrição */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {program.description}
        </p>

        {/* Informações do programa */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{program.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              {getLocationIcon()}
              <span>{getLocationText()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{program.city}</span>
            </div>
            {program.maxStudents && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{program.currentStudents}/{program.maxStudents} alunos</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {program.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Footer com preço e ação */}
        <div className="flex items-center justify-between">
          <div>
            {program.originalPrice && (
              <span className="text-sm text-gray-500 line-through mr-2">
                {program.originalPrice}
              </span>
            )}
            <span className="font-semibold text-lg text-gray-900">{program.price}</span>
            {program.period === 'mensal' && (
              <span className="text-sm text-gray-600">/mês</span>
            )}
          </div>
          
          <Button
            className="bg-gray-900 hover:bg-gray-800 text-white px-6"
            onClick={(e) => {
              e.stopPropagation();
              navigateToProgram(program.id);
            }}
          >
            Ver Programa
          </Button>
        </div>
      </div>
    </Card>
  );
}