import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardContent } from '../ui/card';

interface TrainerCardSkeletonProps {
  count?: number;
}

export function TrainerCardSkeleton({ count = 1 }: TrainerCardSkeletonProps) {
  return (
    <SkeletonTheme 
      baseColor="var(--muted)" 
      highlightColor="var(--background)"
      borderRadius="0.625rem"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            {/* Header Section */}
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar */}
              <Skeleton circle height={64} width={64} />
              
              {/* Info */}
              <div className="flex-1">
                <Skeleton height={20} width="70%" className="mb-2" />
                <div className="flex items-center gap-1 mb-1">
                  <Skeleton circle height={12} width={12} />
                  <Skeleton height={16} width={60} />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton circle height={12} width={12} />
                  <Skeleton height={16} width={80} />
                </div>
              </div>
            </div>
            
            {/* Specialties */}
            <div className="flex flex-wrap gap-1 mb-3">
              <Skeleton height={24} width={80} />
              <Skeleton height={24} width={60} />
              <Skeleton height={24} width={70} />
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Skeleton circle height={12} width={12} />
                  <Skeleton height={16} width={30} />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton circle height={12} width={12} />
                  <Skeleton height={16} width={25} />
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Skeleton circle height={16} width={16} />
                <Skeleton circle height={16} width={16} />
              </div>
            </div>
            
            {/* Separator */}
            <div className="border-t my-3"></div>
            
            {/* Price and Action */}
            <div className="flex items-center justify-between">
              <div>
                <Skeleton height={20} width={80} className="mb-1" />
                <Skeleton height={14} width={60} />
              </div>
              <Skeleton height={32} width={100} />
            </div>
          </CardContent>
        </Card>
      ))}
    </SkeletonTheme>
  );
}