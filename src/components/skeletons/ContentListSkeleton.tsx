import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardContent } from '../ui/card';

interface ContentListSkeletonProps {
  count?: number;
  layout?: 'list' | 'grid';
  showImage?: boolean;
  imagePosition?: 'left' | 'top';
}

export function ContentListSkeleton({ 
  count = 3, 
  layout = 'list',
  showImage = true,
  imagePosition = 'left'
}: ContentListSkeletonProps) {
  return (
    <SkeletonTheme 
      baseColor="var(--muted)" 
      highlightColor="var(--background)"
      borderRadius="0.625rem"
    >
      <div className={layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-4">
              <div className={`flex ${
                imagePosition === 'top' ? 'flex-col' : 'items-start gap-4'
              }`}>
                {/* Image */}
                {showImage && (
                  <div className={imagePosition === 'top' ? "w-full mb-4" : "flex-shrink-0"}>
                    <Skeleton 
                      height={imagePosition === 'top' ? 160 : 80} 
                      width={imagePosition === 'top' ? "100%" : 80}
                      className={imagePosition === 'left' ? "rounded-lg" : "rounded-t-lg"}
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1">
                  {/* Title */}
                  <Skeleton height={18} width="80%" className="mb-2" />
                  
                  {/* Subtitle or Meta */}
                  <Skeleton height={14} width="60%" className="mb-3" />
                  
                  {/* Description */}
                  <div className="space-y-2 mb-3">
                    <Skeleton height={12} width="100%" />
                    <Skeleton height={12} width="85%" />
                    <Skeleton height={12} width="70%" />
                  </div>
                  
                  {/* Tags or Meta Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton height={20} width={60} />
                    <Skeleton height={20} width={40} />
                    <Skeleton height={20} width={50} />
                  </div>
                  
                  {/* Action Section */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton circle height={16} width={16} />
                      <Skeleton height={14} width={80} />
                    </div>
                    <Skeleton height={32} width={80} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SkeletonTheme>
  );
}