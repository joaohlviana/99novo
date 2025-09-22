import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardContent } from '../ui/card';

interface ProgramCardSkeletonProps {
  count?: number;
  layout?: 'grid' | 'horizontal';
}

export function ProgramCardSkeleton({ count = 1, layout = 'grid' }: ProgramCardSkeletonProps) {
  return (
    <SkeletonTheme 
      baseColor="var(--muted)" 
      highlightColor="var(--background)"
      borderRadius="0.625rem"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-200">
          <CardContent className={layout === 'horizontal' ? "p-0 flex" : "p-0"}>
            {/* Image Section */}
            <div className={layout === 'horizontal' ? "w-48 flex-shrink-0" : "w-full"}>
              <Skeleton 
                height={layout === 'horizontal' ? 160 : 200} 
                className="rounded-t-lg" 
              />
            </div>
            
            {/* Content Section */}
            <div className="p-6 flex-1">
              {/* Header */}
              <div className="mb-3">
                <Skeleton height={20} width="80%" className="mb-1" />
                <Skeleton height={16} width="50%" />
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <Skeleton circle height={12} width={12} />
                  <Skeleton height={16} width={40} />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton circle height={12} width={12} />
                  <Skeleton height={16} width={60} />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton circle height={12} width={12} />
                  <Skeleton height={16} width={30} />
                </div>
              </div>
              
              {/* Separator */}
              <div className="border-t mb-3"></div>
              
              {/* Price and Action */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton height={20} width={80} />
                    <Skeleton height={16} width={60} />
                  </div>
                  <Skeleton height={12} width={90} />
                </div>
                <Skeleton height={32} width={100} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </SkeletonTheme>
  );
}