import { TrainerHeaderInfo } from "./TrainerHeaderInfo";
import { TrainerActions } from "./TrainerActions";
import { TrainerAvatar } from "./TrainerAvatar";
import { TrainerInfo } from "./TrainerInfo";

interface TrainerHeaderProps {
  name: string;
  title: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
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
}: TrainerHeaderProps) {
  return (
    <div className="space-y-6 text-left">
      {/* Header com título e ações */}
<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 text-left">
        <TrainerHeaderInfo
          name={name}
          rating={rating}
          reviewCount={reviewCount}
          location={location}
        />
        <TrainerActions />
      </div>

      {/* Perfil principal */}
      <div className="flex flex-col md:flex-row gap-8 text-left">
        <TrainerAvatar image={image} name={name} />

        <div className="flex-1">
          <TrainerInfo
            title={title}
            description={description}
            specialties={specialties}
          />
        </div>
      </div>
    </div>
  );
}