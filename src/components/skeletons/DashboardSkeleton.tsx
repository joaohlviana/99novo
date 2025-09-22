import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardContent } from '../ui/card';

interface DashboardSkeletonProps {
  layout?: 'overview' | 'detailed';
}

export function DashboardSkeleton({ layout = 'overview' }: DashboardSkeletonProps) {
  return (
    <SkeletonTheme 
      baseColor="var(--muted)" 
      highlightColor="var(--background)"
      borderRadius="0.625rem"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton height={14} width="80%" className="mb-2" />
                    <Skeleton height={24} width="60%" />
                  </div>
                  <Skeleton circle height={40} width={40} />
                </div>
                {layout === 'detailed' && (
                  <div className="mt-4">
                    <Skeleton height={12} width="40%" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Chart Area */}
        {layout === 'detailed' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton height={20} width={200} />
                <Skeleton height={32} width={120} />
              </div>
              <Skeleton height={300} />
            </CardContent>
          </Card>
        )}
        
        {/* Quick Actions or Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <Card>
            <CardContent className="p-6">
              <Skeleton height={20} width={150} className="mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton circle height={32} width={32} />
                    <div className="flex-1">
                      <Skeleton height={16} width="70%" className="mb-1" />
                      <Skeleton height={14} width="50%" />
                    </div>
                    <Skeleton height={24} width={60} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Right Column */}
          <Card>
            <CardContent className="p-6">
              <Skeleton height={20} width={180} className="mb-4" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton circle height={40} width={40} />
                    <div className="flex-1">
                      <Skeleton height={16} width="80%" className="mb-1" />
                      <Skeleton height={14} width="60%" className="mb-2" />
                      <Skeleton height={12} width="40%" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Table/List Section */}
        {layout === 'detailed' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton height={20} width={150} />
                <Skeleton height={32} width={100} />
              </div>
              
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 pb-3 border-b">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} height={16} width="60%" />
                ))}
              </div>
              
              {/* Table Rows */}
              <div className="space-y-3 mt-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 items-center py-2">
                    <div className="flex items-center gap-3">
                      <Skeleton circle height={32} width={32} />
                      <Skeleton height={16} width="70%" />
                    </div>
                    <Skeleton height={16} width="50%" />
                    <Skeleton height={16} width="60%" />
                    <Skeleton height={32} width={80} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SkeletonTheme>
  );
}