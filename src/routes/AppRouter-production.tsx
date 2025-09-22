import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { SimpleErrorBoundary } from '../components/SimpleErrorBoundary';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from '../components/ui/sonner';
import { ScrollToTop } from '../components/ScrollToTop';
import { useAppStore } from '../stores/app-store';
import { queryClient } from '../lib/query-client';
import { errorTracker } from '../utils/error-tracker';

// ============================================
// PRODUCTION ROUTES - APENAS ESSENCIAIS
// ============================================

// Core Pages
import HomePage from '../pages/HomePage';
const CatalogPage = lazy(() => import('../pages/CatalogPage'));
const TrainerProfileResolvePage = lazy(() => import('../pages/TrainerProfileResolvePage'));
const ProgramDetailsPage = lazy(() => import('../pages/ProgramDetailsPage'));
const SportPage = lazy(() => import('../pages/SportPage'));
const BecomeTrainerPage = lazy(() => import('../pages/BecomeTrainerPage'));
const BecomeClientPage = lazy(() => import('../pages/BecomeClientPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardRoutes = lazy(() => import('./DashboardRoutes'));

// ============================================
// CONDITIONAL DEVELOPMENT ROUTES
// ============================================
const DevelopmentRoutes = lazy(() => import('./DevelopmentRoutes')); // Separar em arquivo próprio

// App Initializer - Versão otimizada
function AppInitializer({ children }: { children: React.ReactNode }) {
  const setInitialized = useAppStore(state => state.setInitialized);
  const setOnline = useAppStore(state => state.setOnline);
  
  useEffect(() => {
    setInitialized(true);
    setOnline(navigator.onLine);
    
    // Error tracking apenas em produção
    if (process.env.NODE_ENV === 'production') {
      errorTracker.onError((error) => {
        console.error('🚨 Production Error:', error);
      });
    }
    
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

// Production Loading Spinner
const ProductionLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
    <div className="text-center space-y-4 p-8 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg">
      <div className="relative">
        <div className="w-10 h-10 border-3 border-brand/20 border-t-brand rounded-full animate-spin mx-auto"></div>
        <div className="absolute inset-0 w-10 h-10 border-3 border-transparent border-r-brand/40 rounded-full animate-spin mx-auto" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
      </div>
      <div className="space-y-1">
        <h3 className="font-medium text-gray-900">99coach</h3>
        <p className="text-sm text-gray-600">Carregando...</p>
      </div>
    </div>
  </div>
);

function AppRouter() {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <SimpleErrorBoundary>
            <ScrollToTop />
            <AppInitializer>
              <Suspense fallback={<ProductionLoadingSpinner />}>
                <Routes>
                  {/* ============================================ */}
                  {/* CORE ROUTES - SEMPRE DISPONÍVEIS */}
                  {/* ============================================ */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/trainer/:identifier" element={<TrainerProfileResolvePage />} />
                  <Route path="/program/:programId" element={<ProgramDetailsPage />} />
                  <Route path="/sport/:sportId" element={<SportPage />} />
                  <Route path="/become-trainer" element={<BecomeTrainerPage />} />
                  <Route path="/become-client" element={<BecomeClientPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Dashboard Routes */}
                  <Route path="/dashboard/*" element={<DashboardRoutes />} />
                  <Route path="/app/*" element={<DashboardRoutes />} />
                  
                  {/* ============================================ */}
                  {/* DEVELOPMENT ROUTES - APENAS EM DEV */}
                  {/* ============================================ */}
                  {isDevelopment && (
                    <Route path="/dev/*" element={<DevelopmentRoutes />} />
                  )}
                  
                  {/* Catch all - redirect to home */}
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </Suspense>
            </AppInitializer>
          </SimpleErrorBoundary>
        </BrowserRouter>
        
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default AppRouter;