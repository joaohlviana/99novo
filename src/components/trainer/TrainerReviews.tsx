import { Avatar, AvatarFallback } from '../ui/avatar';
import { Star } from 'lucide-react';

interface Review {
  name: string;
  date: string;
  rating: number;
  comment: string;
}

interface TrainerReviewsProps {
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

export function TrainerReviews({ rating, reviewCount, reviews }: TrainerReviewsProps) {
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
    <section className="border-t border-border pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Avaliações</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {renderStars(rating)}
          </div>
          <span className="font-medium">{rating.toFixed(2)} · {reviewCount} avaliações</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review, index) => (
          <div key={index} className="space-y-3 p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {review.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{review.name}</div>
                <div className="text-sm text-muted-foreground">{review.date}</div>
              </div>
            </div>
            <div className="flex items-center">
              {renderStars(review.rating)}
            </div>
            <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}