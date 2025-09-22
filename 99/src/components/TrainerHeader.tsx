import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Star, 
  Heart, 
  Share2,
  Shield,
  MapPin,
  CheckCircle
} from 'lucide-react';

interface TrainerHeaderProps {
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  image: string;
  title: string;
  description: string;
  specialties: string[];
  stats: {
    students: number;
    rating: number;
    experience: number;
  };
}

export function TrainerHeader({ 
  name, 
  rating, 
  reviewCount, 
  location, 
  image, 
  title, 
  description, 
  specialties, 
  stats 
}: TrainerHeaderProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${
          i < Math.floor(rating) 
            ? "fill-foreground text-foreground" 
            : i < rating 
            ? "fill-foreground/50 text-foreground" 
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">{name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {renderStars(rating)}
              </div>
              <span className="font-medium text-foreground">{rating.toFixed(2)}</span>
              <span className="underline cursor-pointer hover:text-foreground">{reviewCount} avaliações</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span className="underline cursor-pointer hover:text-foreground">Treinador verificado</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Heart className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={image}
              alt={`${name} - Personal Trainer`}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
            />
            <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-lg">
              <CheckCircle className="h-6 w-6 text-[#FF385C]" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary" className="bg-muted text-muted-foreground hover:bg-accent">
                {specialty}
              </Badge>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-xl font-semibold">{stats.students}</div>
              <div className="text-sm text-muted-foreground">Alunos</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{stats.rating.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Avaliação</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{stats.experience}</div>
              <div className="text-sm text-muted-foreground">Anos experiência</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}