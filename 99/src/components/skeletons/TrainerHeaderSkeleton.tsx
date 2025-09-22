import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function TrainerHeaderSkeleton() {
  return (
    <SkeletonTheme 
      baseColor="var(--muted)" 
      highlightColor="var(--background)"
      borderRadius="0.625rem"
    >
      <div className="p-6 rounded-3xl bg-card">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <div className="relative flex-shrink-0">
            <Skeleton circle height={120} width={120} />
            {/* Online Status */}
            <div className="absolute bottom-2 right-2">
              <Skeleton circle height={20} width={20} />
            </div>
          </div>
          
          {/* Info Section */}
          <div className="flex-1">
            {/* Basic Info */}
            <div className="mb-4">
              <Skeleton height={28} width="60%" className="mb-2" />
              <Skeleton height={20} width="40%" className="mb-3" />
              
              {/* Rating and Location */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <Skeleton circle height={16} width={16} />
                  <Skeleton height={16} width={80} />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton circle height={16} width={16} />
                  <Skeleton height={16} width={100} />
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-4">
              <Skeleton height={16} width="90%" className="mb-2" />
              <Skeleton height={16} width="85%" className="mb-2" />
              <Skeleton height={16} width="70%" />
            </div>
            
            {/* Specialties */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Skeleton height={24} width={80} />
              <Skeleton height={24} width={60} />
              <Skeleton height={24} width={70} />
              <Skeleton height={24} width={90} />
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton height={20} width={40} className="mb-1" />
                  <Skeleton height={14} width={60} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Section */}
          <div className="flex flex-col gap-3 md:w-48">
            <Skeleton height={40} />
            <Skeleton height={40} />
            <div className="flex gap-2">
              <Skeleton height={32} width={32} />
              <Skeleton height={32} width={32} />
              <Skeleton height={32} width={32} />
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}