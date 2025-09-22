import React, { Suspense } from 'react';
import { TrainersCatalog } from '../components/TrainersCatalog';
import { PerformanceDashboard } from '../components/debug/PerformanceDashboard';
import { PerformanceAnalyzer } from '../components/debug/PerformanceAnalyzer';

// 🚀 FASE 5: Página com TrainersCatalog totalmente otimizado
export function TrainersCatalogOptimizedPage() {
  return (
    <div className="min-h-screen">
      <Suspense 
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        }
      >
        <TrainersCatalog />
      </Suspense>

      {/* 🚀 FASE 5: Dashboards de monitoramento (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <Suspense fallback={null}>
            <PerformanceDashboard 
              componentName="TrainersCatalog"
              autoRefresh={true}
              refreshInterval={5000}
            />
          </Suspense>

          <Suspense fallback={null}>
            <PerformanceAnalyzer
              components={['TrainersCatalog', 'OptimizedTrainerCard', 'VirtualizedGrid']}
              autoAnalyze={true}
              showRecommendations={true}
            />
          </Suspense>
        </>
      )}
    </div>
  );
}

export default TrainersCatalogOptimizedPage;