import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Removido para performance
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { DevelopmentButton } from '../components/DevelopmentButton';
import { SimpleErrorBoundary } from '../components/SimpleErrorBoundary';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from '../components/ui/sonner';
import { useAppStore } from '../stores/app-store';

// import { logConfig } from '../lib/config'; // Removido para evitar timeout
import { queryClient } from '../lib/query-client';
import { errorTracker } from '../utils/error-tracker';

// Lazy load pages for better performance
// Import HomePage diretamente para debug do logout
import HomePage from '../pages/HomePage';
// const HomePage = lazy(() => import('../pages/HomePage'));
const CatalogPage = lazy(() => import('../pages/CatalogPage'));
const TrainerProfilePage = lazy(() => import('../pages/TrainerProfilePage'));
const ProgramDetailsPage = lazy(() => import('../pages/ProgramDetailsPage'));
const SportPage = lazy(() => import('../pages/SportPage'));
const BecomeTrainerPage = lazy(() => import('../pages/BecomeTrainerPage'));
const BecomeClientPage = lazy(() => import('../pages/BecomeClientPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const AuthDemoPage = lazy(() => import('../pages/AuthDemoPage'));
const DashboardAccessPage = lazy(() => import('../pages/DashboardAccessPage'));
const DashboardRoutes = lazy(() => import('./DashboardRoutes'));
const DevAccessPage = lazy(() => import('../pages/DevAccessPage'));
const SystemTestPage = lazy(() => import('../pages/SystemTestPage'));
const ServicesTestPage = lazy(() => import('../pages/ServicesTestPage'));
const ServicesTestPageV2 = lazy(() => import('../pages/ServicesTestPageV2'));
const DashboardTestPage = lazy(() => import('../pages/DashboardTestPage'));
const SupabaseTestPage = lazy(() => import('../pages/SupabaseTestPage'));
const LoginTestPage = lazy(() => import('../pages/LoginTestPage'));
const DatabaseSchemaDebugPage = lazy(() => import('../pages/DatabaseSchemaDebugPage'));
const DatabaseTablesTestPage = lazy(() => import('../pages/DatabaseTablesTestPage'));
const DatabaseDiagnosticPage = lazy(() => import('../pages/DatabaseDiagnosticPage'));
const ServerDiagnosticPage = lazy(() => import('../pages/ServerDiagnosticPage'));
const TrainerProfileHybridTestPage = lazy(() => import('../pages/TrainerProfileHybridTestPage'));
const TrainerProfileHybridTestPageSimple = lazy(() => import('../pages/TrainerProfileHybridTestPageSimple'));
const TrainingProgramsHybridTestPage = lazy(() => import('../pages/TrainingProgramsHybridTestPage'));
const TrainingProgramsJsonbTestPage = lazy(() => import('../pages/TrainingProgramsJsonbTestPage'));
const StorageSetupPage = lazy(() => import('../pages/StorageSetupPage'));
const StorageFixPage = lazy(() => import('../pages/StorageFixPage'));
const StorageRLSTestPage = lazy(() => import('../pages/StorageRLSTestPage'));
const TrainingProgramsDiagnosticPage = lazy(() => import('../pages/TrainingProgramsDiagnosticPage'));
const TrainerProfileErrorDiagnosticPage = lazy(() => import('../pages/TrainerProfileErrorDiagnosticPage'));

// Components Demo Pages
const ComponentsIndexPage = lazy(() => import('../pages/ComponentsIndexPage'));
const ContentSwitcherDemoPage = lazy(() => import('../pages/demos/ContentSwitcherDemoPage'));
const GlassEffectsDemoPage = lazy(() => import('../pages/demos/GlassEffectsDemoPage'));
const FiltersDemoPage = lazy(() => import('../pages/demos/FiltersDemoPage'));
const StarRatingDemoPage = lazy(() => import('../pages/demos/StarRatingDemoPage'));
const SkeletonDemoPage = lazy(() => import('../pages/demos/SkeletonDemoPage'));
const ProgramCarouselDemoPage = lazy(() => import('../pages/demos/ProgramCarouselDemoPage'));
const AppleCardsCarouselDemoPage = lazy(() => import('../pages/demos/AppleCardsCarouselDemoPage'));
const ResizableNavbarDemoPage = lazy(() => import('../pages/demos/ResizableNavbarDemoPage'));

// Componente interno que inicializa os stores - Versão ultra-simples
function AppInitializer({ children }: { children: React.ReactNode }) {
  const setInitialized = useAppStore(state => state.setInitialized);
  const setOnline = useAppStore(state => state.setOnline);
  
  useEffect(() => {
    // Inicialização direta sem timeouts
    setInitialized(true);
    setOnline(navigator.onLine);
    console.log('✅ AppInitializer: Inicialização instantânea');
    
    // Inicializar error tracker
    errorTracker.onError((error) => {
      if (error.message.includes('TrainerProfile')) {
        console.log('🚨 Error interceptado:', error.context?.id);
      }
    });
    
    // Listeners de rede simples
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline, { passive: true });
    window.addEventListener('offline', handleOffline, { passive: true });
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setInitialized, setOnline]);
  
  return <>{children}</>;
}

function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <SimpleErrorBoundary>
            <AppInitializer>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center space-y-4 p-8 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg">
                  <div className="relative">
                    <div className="w-10 h-10 border-3 border-brand/20 border-t-brand rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 w-10 h-10 border-3 border-transparent border-r-brand/40 rounded-full animate-spin mx-auto" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">99coach</h3>
                    <p className="text-sm text-gray-600">Carregando página...</p>
                  </div>
                </div>
              </div>
            }>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/trainer/:trainerId" element={<TrainerProfilePage />} />
              <Route path="/program/:programId" element={<ProgramDetailsPage />} />
              <Route path="/sport/:sportId" element={<SportPage />} />
              <Route path="/become-trainer" element={<BecomeTrainerPage />} />
              <Route path="/become-client" element={<BecomeClientPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth-demo" element={<AuthDemoPage />} />
              
              {/* Demo/Development Routes */}
              <Route path="/demo/dashboard-access" element={<DashboardAccessPage />} />
              <Route path="/dev" element={<DevAccessPage />} />
              <Route path="/dev/components" element={<ComponentsIndexPage />} />
              <Route path="/dev/components/content-switcher" element={<ContentSwitcherDemoPage />} />
              <Route path="/dev/components/glass-effects" element={<GlassEffectsDemoPage />} />
              <Route path="/dev/components/filters" element={<FiltersDemoPage />} />
              <Route path="/dev/components/star-rating" element={<StarRatingDemoPage />} />
              <Route path="/dev/components/skeleton" element={<SkeletonDemoPage />} />
              <Route path="/dev/components/program-carousel" element={<ProgramCarouselDemoPage />} />
              <Route path="/dev/components/apple-cards-carousel" element={<AppleCardsCarouselDemoPage />} />
              <Route path="/dev/components/resizable-navbar" element={<ResizableNavbarDemoPage />} />
              <Route path="/system-test" element={<SystemTestPage />} />
              <Route path="/dev/services-test" element={<ServicesTestPage />} />
              <Route path="/dev/services-test-v2" element={<ServicesTestPageV2 />} />
              <Route path="/dev/dashboard-test" element={<DashboardTestPage />} />
              <Route path="/dev/supabase-test" element={<SupabaseTestPage />} />
              <Route path="/login-test" element={<LoginTestPage />} />
              <Route path="/dev/database-schema" element={<DatabaseSchemaDebugPage />} />
              <Route path="/dev/database-tables-test" element={<DatabaseTablesTestPage />} />
              <Route path="/dev/database-diagnostic" element={<DatabaseDiagnosticPage />} />
              <Route path="/dev/server-diagnostic" element={<ServerDiagnosticPage />} />
              <Route path="/dev/trainer-profile-hybrid-test" element={<TrainerProfileHybridTestPage />} />
              <Route path="/dev/trainer-profile-hybrid-test-simple" element={<TrainerProfileHybridTestPageSimple />} />
              <Route path="/dev/training-programs-hybrid-test" element={<TrainingProgramsHybridTestPage />} />
              <Route path="/dev/training-programs-jsonb-test" element={<TrainingProgramsJsonbTestPage />} />
              <Route path="/dev/storage-setup" element={<StorageSetupPage />} />
              <Route path="/dev/storage-fix" element={<StorageFixPage />} />
              <Route path="/dev/storage-rls-test" element={<StorageRLSTestPage />} />
              <Route path="/dev/training-programs-diagnostic" element={<TrainingProgramsDiagnosticPage />} />
              <Route path="/dev/trainer-profile-error-diagnostic" element={<TrainerProfileErrorDiagnosticPage />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard/*" element={<DashboardRoutes />} />
              <Route path="/app/*" element={<DashboardRoutes />} />
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
          
            {/* Development Button */}
            <DevelopmentButton />
            </AppInitializer>
          </SimpleErrorBoundary>
        </BrowserRouter>
        
        {/* Toast Notifications */}
        <Toaster />
      </AuthProvider>
      
      {/* React Query Devtools - desabilitado permanentemente para performance */}
    </QueryClientProvider>
  );
}

export default AppRouter;