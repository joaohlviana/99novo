import { SpecialtyAvatars } from './SpecialtyAvatars';

interface TrainerInfoProps {
  title: string;
  description: string;
  specialties: string[];
}

export function TrainerInfo({ title, description, specialties }: TrainerInfoProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      
      <SpecialtyAvatars specialties={specialties} />
    </div>
  );
}