/**
 * 🧪 DASHBOARD TEST PAGE
 * 
 * Página simples para testar os dashboards sem proteções de auth
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { UserCircle, Users, Shield, Bug } from 'lucide-react';
import { useAppStore } from '../stores/app-store';
import { useUserStore } from '../stores/user-store';
import { appConfig } from '../lib/config';

export default function DashboardTestPage() {
  const { isLoading, initialized } = useAppStore();
  const { user, isAuthenticated } = useUserStore();

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Dashboard Test Page</h1>
          <p className="text-muted-foreground">
            Teste rápido dos dashboards sem autenticação
          </p>
          
          {/* Status indicators */}
          <div className="flex justify-center gap-4">
            <Badge variant={initialized ? "default" : "destructive"}>
              App: {initialized ? 'Inicializado' : 'Carregando'}
            </Badge>
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              Auth: {isAuthenticated ? 'Logado' : 'Deslogado'}
            </Badge>
            <Badge variant={appConfig.backend === 'supabase' ? "default" : "secondary"}>
              Backend: {appConfig.backend}
            </Badge>
          </div>
        </div>

        {/* Current State */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Estado Atual do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <strong>App Loading:</strong> {isLoading ? 'Sim' : 'Não'}
              </div>
              <div>
                <strong>App Initialized:</strong> {initialized ? 'Sim' : 'Não'}
              </div>
              <div>
                <strong>Usuário:</strong> {user?.name || 'Nenhum'}
              </div>
              <div>
                <strong>Tipo:</strong> {user?.type || 'N/A'}
              </div>
            </div>
            
            {user && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <pre className="text-sm">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dashboard Links */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Trainer Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Trainer Dashboard
              </CardTitle>
              <CardDescription>
                Dashboard para treinadores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link to="/dashboard/trainer">Produção</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard/dev/trainer">Desenvolvimento</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Client Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Client Dashboard
              </CardTitle>
              <CardDescription>
                Dashboard para clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link to="/dashboard/client">Produção</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard/dev/client">Desenvolvimento</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Dashboard
              </CardTitle>
              <CardDescription>
                Dashboard administrativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link to="/dashboard/admin">Produção</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard/dev/admin">Desenvolvimento</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Actions</CardTitle>
            <CardDescription>
              Ações para debug e teste
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                variant="outline"
                onClick={() => {
                  console.clear();
                  console.log('🔧 Debug: Current App State');
                  console.log('App Store:', useAppStore.getState());
                  console.log('User Store:', useUserStore.getState());
                  console.log('Config:', appConfig);
                }}
              >
                Log Current State
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
              >
                Clear Storage & Reload
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const { login } = useUserStore.getState();
                  login({
                    id: '999',
                    email: 'test@dev.com',
                    name: 'Test User',
                    type: 'trainer',
                  });
                }}
              >
                Login Test Trainer
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const { logout } = useUserStore.getState();
                  logout();
                }}
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center">
          <Button asChild variant="outline">
            <Link to="/">← Voltar para Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}