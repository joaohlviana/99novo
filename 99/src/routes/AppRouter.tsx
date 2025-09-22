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
import { isDevelopment } from '../lib/env';

// ===============================================
// 🎯 PÁGINAS ESSENCIAIS (PRODUÇÃO)
// ===============================================

import HomePage from '../pages/HomePage';
const CatalogPage = lazy(() => import('../pages/CatalogPage'));
const TrainerProfileResolvePage = lazy(() => import('../pages/TrainerProfileResolvePage'));
const ProgramDetailsPage = lazy(() => import('../pages/ProgramDetailsPage'));
const SportPage = lazy(() => import('../pages/SportPage'));
const BecomeTrainerPage = lazy(() => import('../pages/BecomeTrainerPage'));
const BecomeClientPage = lazy(() => import('../pages/BecomeClientPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardRoutes = lazy(() => import('./DashboardRoutes'));

// ===============================================
// 🛠️ PÁGINAS DE DESENVOLVIMENTO (CONDITIONAL)
// ===============================================

let DevAccessPageNew: any = null;
let DashboardAccessPage: any = null;

// Carregar páginas de dev apenas em desenvolvimento
let JsonbFiltersTestPage: any = null;
let SpecialtiesGinTestPage: any = null;
let SpecialtiesGinTestPageSimple: any = null;
let SpecialtiesGinTestPageBasic: any = null;
let SystemHealthPage: any = null;
let SportMappingTestPage: any = null;

if (isDevelopment()) {
  DevAccessPageNew = lazy(() => import('../pages/DevAccessPageNew'));
  DashboardAccessPage = lazy(() => import('../pages/DashboardAccessPage'));
  JsonbFiltersTestPage = lazy(() => import('../pages/JsonbFiltersTestPage'));
  SpecialtiesGinTestPage = lazy(() => import('../pages/SpecialtiesGinTestPage'));
  SpecialtiesGinTestPageSimple = lazy(() => import('../pages/SpecialtiesGinTestPageSimple'));
  SpecialtiesGinTestPageBasic = lazy(() => import('../pages/SpecialtiesGinTestPageBasic'));
  SystemHealthPage = lazy(() => import('../pages/SystemHealthPage'));
  SportMappingTestPage = lazy(() => import('../pages/SportMappingTestPage'));
}

// ===============================================
// INICIALIZADOR DA APLICAÇÃO
// ===============================================

function AppInitializer({ children }: { children: React.ReactNode }) {
  const setInitialized = useAppStore(state => state.setInitialized);
  const setOnline = useAppStore(state => state.setOnline);
  
  useEffect(() => {
    // Inicialização instantânea
    setInitialized(true);
    setOnline(navigator.onLine);
    console.log('✅ App inicializado');
    
    // Error tracker
    errorTracker.onError((error) => {
      if (error.message.includes('TrainerProfile')) {
        console.log('🚨 Error interceptado:', error.context?.id);
      }
    });
    
    // Network listeners
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

// ===============================================
// LOADING COMPONENT
// ===============================================

const AppLoading = () => (
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

// ===============================================
// APP ROUTER PRINCIPAL
// ===============================================

function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <SimpleErrorBoundary>
            <ScrollToTop />
            <AppInitializer>
              <Suspense fallback={<AppLoading />}>
                <Routes>
                  {/* =============================================== */}
                  {/* 🌍 ROTAS PÚBLICAS */}
                  {/* =============================================== */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/trainer/:identifier" element={<TrainerProfileResolvePage />} />
                  <Route path="/program/:programId" element={<ProgramDetailsPage />} />
                  <Route path="/sport/:sportId" element={<SportPage />} />
                  <Route path="/become-trainer" element={<BecomeTrainerPage />} />
                  <Route path="/become-client" element={<BecomeClientPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* =============================================== */}
                  {/* 🏠 DASHBOARDS */}
                  {/* =============================================== */}
                  <Route path="/dashboard/*" element={<DashboardRoutes />} />
                  <Route path="/app/*" element={<DashboardRoutes />} />
                  
                  {/* =============================================== */}
                  {/* 🛠️ DESENVOLVIMENTO (APENAS EM DEV) */}
                  {/* =============================================== */}
                  {isDevelopment() && DevAccessPageNew && (
                    <Route path="/dev" element={<DevAccessPageNew />} />
                  )}
                  {isDevelopment() && DashboardAccessPage && (
                    <Route path="/demo/dashboard-access" element={<DashboardAccessPage />} />
                  )}
                  {isDevelopment() && JsonbFiltersTestPage && (
                    <Route path="/test/jsonb-filters" element={<JsonbFiltersTestPage />} />
                  )}
                  {isDevelopment() && SpecialtiesGinTestPage && (
                    <Route path="/test/specialties-gin" element={<SpecialtiesGinTestPage />} />
                  )}
                  {isDevelopment() && SpecialtiesGinTestPageSimple && (
                    <Route path="/test/specialties-gin-simple" element={<SpecialtiesGinTestPageSimple />} />
                  )}
                  {isDevelopment() && SpecialtiesGinTestPageBasic && (
                    <Route path="/test/specialties-gin-basic" element={<SpecialtiesGinTestPageBasic />} />
                  )}
                  {isDevelopment() && SystemHealthPage && (
                    <Route path="/system/health" element={<SystemHealthPage />} />
                  )}
                  {isDevelopment() && SportMappingTestPage && (
                    <Route path="/test/sport-mapping" element={<SportMappingTestPage />} />
                  )}
                  
                  {/* =============================================== */}
                  {/* 🔄 FALLBACK */}
                  {/* =============================================== */}
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