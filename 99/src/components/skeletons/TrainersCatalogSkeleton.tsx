import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { TrainerCardSkeleton } from './TrainerCardSkeleton';
import { Section } from '../layout/Section';
import { CardShell } from '../layout/CardShell';

interface TrainersCatalogSkeletonProps {
  showFilters?: boolean;
  showHeader?: boolean;
  trainerCount?: number;
}

export function TrainersCatalogSkeleton({ 
  showFilters = true, 
  showHeader = true,
  trainerCount = 6 
}: TrainersCatalogSkeletonProps) {
  return (
    <SkeletonTheme 
      baseColor="var(--muted)" 
      highlightColor="var(--background)"
      borderRadius="0.625rem"
    >
      {/* Header Section */}
      {showHeader && (
        <Section>
          <CardShell>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <Skeleton height={24} width={200} className="mb-2" />
                <Skeleton height={16} width={300} />
              </div>
              <div className="flex gap-3">
                <Skeleton height={40} width={120} />
                <Skeleton height={40} width={100} />
              </div>
            </div>
          </CardShell>
        </Section>
      )}

      {/* Filters Section */}
      {showFilters && (
        <Section>
          <CardShell>
            <div className="flex items-center gap-4 mb-6">
              <Skeleton height={20} width={80} />
              <div className="flex gap-2">
                <Skeleton height={32} width={100} />
                <Skeleton height={32} width={80} />
                <Skeleton height={32} width={120} />
                <Skeleton height={32} width={90} />
              </div>
            </div>
            
            {/* Active Filters */}
            <div className="flex items-center gap-2">
              <Skeleton height={14} width={100} />
              <Skeleton height={24} width={80} />
              <Skeleton height={24} width={120} />
              <Skeleton height={24} width={60} />
            </div>
          </CardShell>
        </Section>
      )}

      {/* Results Count and Sort */}
      <Section>
        <CardShell>
          <div className="flex items-center justify-between mb-6">
            <Skeleton height={18} width={150} />
            <div className="flex items-center gap-4">
              <Skeleton height={14} width={80} />
              <Skeleton height={36} width={120} />
            </div>
          </div>
        </CardShell>
      </Section>

      {/* Trainers Grid */}
      <Section>
        <CardShell>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TrainerCardSkeleton count={trainerCount} />
          </div>
        </CardShell>
      </Section>

      {/* Pagination */}
      <Section>
        <CardShell>
          <div className="flex items-center justify-between">
            <Skeleton height={16} width={120} />
            <div className="flex gap-2">
              <Skeleton height={32} width={32} />
              <Skeleton height={32} width={32} />
              <Skeleton height={32} width={32} />
              <Skeleton height={32} width={32} />
              <Skeleton height={32} width={32} />
            </div>
            <Skeleton height={32} width={80} />
          </div>
        </CardShell>
      </Section>
    </SkeletonTheme>
  );
}