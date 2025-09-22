import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RouteGuard } from '../components/auth/RouteGuard';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { useAuth } from '../contexts/AuthContext';

// Lazy load dashboards para melhor performance
const TrainerDashboard = lazy(() => import('../components/trainer-dashboard/TrainerDashboard'));
const ClientDashboard = lazy(() => import('../components/client-dashboard/ClientDashboard'));
const ClientProgramDetails = lazy(() => import('../components/client-dashboard/ClientProgramDetails'));
const AdminDashboard = lazy(() => import('../components/admin-dashboard/AdminDashboard'));

// Componente para redirecionamento automático baseado no role
function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirecionar baseado nos roles do usuário
  const hasTrainerRole = user.roles.includes('trainer');
  const hasClientRole = user.roles.includes('client');
  
  if (hasTrainerRole) {
    return <Navigate to="/app/trainer" replace />;
  } else if (hasClientRole) {
    return <Navigate to="/app/client" replace />;
  } else {
    // Se não tem nenhum role, redirecionar para become-client
    return <Navigate to="/become-client" replace />;
  }
}

function DashboardRoutes() {
  return (
    <Routes>
      {/* 🔄 Redirecionamento automático para /app baseado no role do usuário */}
      <Route path="/app" element={<DashboardRedirect />} />
      
      {/* 🔐 Rotas App com Auth Real - Padrão de Produção */}
      <Route path="/app/trainer/*" element={
        <RouteGuard requiredRole="trainer" requireCompleteProfile={true}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <TrainerDashboard />
          </Suspense>
        </RouteGuard>
      } />
      
      <Route path="/app/client/*" element={
        <RouteGuard requiredRole="client" requireCompleteProfile={true}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <ClientDashboard />
          </Suspense>
        </RouteGuard>
      } />
      
      <Route path="/app/client/program/:programId" element={
        <RouteGuard requiredRole="client" requireCompleteProfile={true}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <ClientProgramDetails />
          </Suspense>
        </RouteGuard>
      } />

      {/* 🧪 Rotas Development (sem auth para testes) */}
      <Route path="/dev/trainer/*" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
          <TrainerDashboard />
        </Suspense>
      } />
      
      <Route path="/dev/client/*" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
          <ClientDashboard />
        </Suspense>
      } />
      
      <Route path="/dev/client/program/:programId" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
          <ClientProgramDetails />
        </Suspense>
      } />
      
      <Route path="/dev/admin/*" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
          <AdminDashboard />
        </Suspense>
      } />

      {/* 🔄 Rotas Legacy (manter compatibilidade - sem exigir perfil completo) */}
      <Route path="/trainer/*" element={
        <RouteGuard requiredRole="trainer" requireCompleteProfile={false}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <TrainerDashboard />
          </Suspense>
        </RouteGuard>
      } />
      
      <Route path="/client/*" element={
        <RouteGuard requiredRole="client" requireCompleteProfile={false}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <ClientDashboard />
          </Suspense>
        </RouteGuard>
      } />
      
      <Route path="/client/program/:programId" element={
        <RouteGuard requiredRole="client" requireCompleteProfile={false}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <ClientProgramDetails />
          </Suspense>
        </RouteGuard>
      } />
      
      <Route path="/admin/*" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
          <AdminDashboard />
        </Suspense>
      } />
    </Routes>
  );
}

export default DashboardRoutes;