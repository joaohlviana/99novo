import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Star,
  Plus,
  Heart,
  Building2
} from 'lucide-react';

interface ProfileCoverCardProps {
  id: string;
  name: string;
  title: string;
  coverImage: string;
  location: string;
  serviceMode: 'Presencial' | 'Online' | 'Ambos';
  rating: number;
  onFollow?: (id: string) => void;
  onNavigateToProfile?: (id: string) => void;
  className?: string;
}

export function ProfileCoverCard({
  id,
  name,
  title,
  coverImage,
  location,
  serviceMode,
  rating,
  onFollow,
  onNavigateToProfile,
  className = ""
}: ProfileCoverCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    onFollow?.(id);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleCardClick = () => {
    onNavigateToProfile?.(id);
  };

  return (
    <div className="flex items-center justify-center">
      <Card className={`w-full max-w-[240px] bg-white shadow-lg rounded-2xl group transition-all duration-500 ease-out ${className}`}>
        <CardContent className="p-0">
          {/* Profile Image */}
          <div className="w-full aspect-square bg-white relative p-[3px]">
            <ImageWithFallback
              src={coverImage}
              alt={name}
              className="w-full h-full object-cover rounded-t-2xl"
            />
          </div>

          {/* Content Section */}
          <div className="p-4 space-y-3 rounded-b-2xl bg-white">
            {/* Name and Rating */}
            <div className="flex items-center justify-start gap-3">
              <h2 className="font-bold text-lg text-black leading-tight">
                {name}
              </h2>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 mr-1 text-gray-500" />
                <span className="font-medium text-sm text-gray-600">{rating}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center text-gray-600 text-sm">
                <Building2 className="w-4 h-4 mx-1 flex-shrink-0 text-gray-500" />
                <span className="truncate">{location}</span>
              </div>
              <Badge 
                variant="secondary" 
                className={`text-xs px-2 py-1 ${
                  serviceMode === 'Presencial' ? 'bg-green-100 text-green-700 border-green-200' :
                  serviceMode === 'Online' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  'bg-purple-100 text-purple-700 border-purple-200'
                }`}
              >
                {serviceMode}
              </Badge>
            </div>

            {/* Action Buttons - Hidden by default, shown on hover */}
            <div className="h-0 overflow-hidden group-hover:h-12 transition-all duration-500 ease-out">
              <div className="flex gap-2.5 pt-3 pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                {/* Botão principal Toyota Red */}
                <Button
                  onClick={handleFollow}
                  className={`flex-1 h-10 rounded-full text-base font-medium transition-all duration-200 ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                      : 'bg-[#e0093e] text-white hover:bg-[#c40835] border-0'
                  }`}
                >
                  <Plus className={`w-4 h-4 mr-1 ${isFollowing ? 'rotate-45' : ''} transition-transform`} />
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </Button>
                
                {/* Curtir em cinza (inclusive quando ativo) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`h-10 w-10 p-0 rounded-full border transition-all duration-200 ${
                    isLiked 
                      ? 'border-gray-300 bg-gray-200 hover:bg-gray-300' 
                      : 'border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 transition-colors ${
                    isLiked ? 'text-gray-700 fill-current' : 'text-gray-500'
                  }`} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}