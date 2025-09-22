import { Star, Shield, MapPin } from "lucide-react";

interface TrainerHeaderInfoProps {
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
}

export function TrainerHeaderInfo({
  name,
  rating,
  reviewCount,
  location,
}: TrainerHeaderInfoProps) {
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
      <h1 className="text-3xl font-semibold mb-2">{name}</h1>
      <div className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {renderStars(rating)}
          </div>
          <span className="font-medium text-foreground">
            {rating.toFixed(2)}
          </span>
          <span className="underline cursor-pointer hover:text-foreground transition-colors">
            ({reviewCount} avaliações)
          </span>
        </div>

        <span className="mx-2 text-muted-foreground/60">·</span>

        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span className="whitespace-nowrap">{location}</span>
        </div>

        <span className="mx-2 text-muted-foreground/60">·</span>

        <div className="flex items-center gap-1">
          <Shield className="h-4 w-4 text-emerald-600" />
          <span className="underline cursor-pointer hover:text-foreground transition-colors whitespace-nowrap text-emerald-600">
            Verificado
          </span>
        </div>
      </div>
    </div>
  );
}