/**
 * 🔐 PÁGINA DE TESTE DE LOGIN PÓS-CORREÇÕES
 * 
 * Página para testar se o sistema de login está funcionando corretamente
 * após as correções de timeout implementadas
 */

import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  LogIn, 
  User, 
  Server,
  AlertTriangle,
  RefreshCw,
  Home,
  TestTube
} from "lucide-react";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'not_started';
  message: string;
  duration?: number;
  details?: any;
}

const TEST_USERS = [
  { email: 'ana@demo.fit', password: 'Demo!12345', role: 'Trainer' },
  { email: 'carlos@demo.fit', password: 'Demo!12345', role: 'Client' },
  { email: 'admin@demo.fit', password: 'Demo!12345', role: 'Admin' }
];

export default function LoginTestPage() {
  const { login, logout, user, isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Conexão Backend', status: 'not_started', message: 'Não testado' },
    { name: 'Criação Usuários', status: 'not_started', message: 'Não testado' },
    { name: 'Teste Login Backend', status: 'not_started', message: 'Não testado' },
    { name: 'Teste Login Frontend', status: 'not_started', message: 'Não testado' }
  ]);
  
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedUser, setSelectedUser] = useState(TEST_USERS[0]);
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [frontendLoginTest, setFrontendLoginTest] = useState(false);

  const updateTest = (name: string, update: Partial<TestResult>) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, ...update } : test
    ));
  };

  const testBackendConnection = async () => {
    const startTime = Date.now();
    updateTest('Conexão Backend', { status: 'pending', message: 'Testando conexão...' });
    
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e547215c`;
      const response = await fetch(`${baseUrl}/health`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      const result = await response.json();
      const duration = Date.now() - startTime;
      
      updateTest('Conexão Backend', {
        status: 'success',
        message: `✅ Backend online (${duration}ms)`,
        duration,
        details: result
      });
      
      return true;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTest('Conexão Backend', {
        status: 'error',
        message: `❌ Erro: ${error.message}`,
        duration
      });
      return false;
    }
  };

  const testUserCreation = async () => {
    const startTime = Date.now();
    updateTest('Criação Usuários', { status: 'pending', message: 'Criando usuários de teste...' });
    
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e547215c`;
      const response = await fetch(`${baseUrl}/create-test-users`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      const result = await response.json();
      const duration = Date.now() - startTime;
      
      if (result.success) {
        updateTest('Criação Usuários', {
          status: 'success',
          message: `✅ ${result.statistics.successful}/${result.statistics.total} usuários prontos (${duration}ms)`,
          duration,
          details: result
        });
      } else {
        updateTest('Criação Usuários', {
          status: 'error',
          message: `❌ Erro: ${result.error}`,
          duration
        });
      }
      
      return result.success;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTest('Criação Usuários', {
        status: 'error',
        message: `❌ Erro: ${error.message}`,
        duration
      });
      return false;
    }
  };

  const testBackendLogin = async () => {
    const startTime = Date.now();
    updateTest('Teste Login Backend', { status: 'pending', message: 'Testando login no backend...' });
    
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e547215c`;
      const response = await fetch(`${baseUrl}/test-login`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: selectedUser.email,
          password: selectedUser.password
        })
      });
      
      const result = await response.json();
      const duration = Date.now() - startTime;
      
      if (result.success) {
        updateTest('Teste Login Backend', {
          status: 'success',
          message: `✅ Login ${selectedUser.role} OK (${duration}ms)`,
          duration,
          details: result
        });
      } else {
        updateTest('Teste Login Backend', {
          status: 'error',
          message: `❌ Falha: ${result.error}`,
          duration
        });
      }
      
      return result.success;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTest('Teste Login Backend', {
        status: 'error',
        message: `❌ Erro: ${error.message}`,
        duration
      });
      return false;
    }
  };

  const testFrontendLogin = async () => {
    const startTime = Date.now();
    updateTest('Teste Login Frontend', { status: 'pending', message: 'Testando AuthContext...' });
    
    try {
      // Primeiro fazer logout se estiver logado
      if (isAuthenticated) {
        await logout();
        // Aguardar um pouco para o logout processar
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Tentar fazer login
      await login(selectedUser.email, selectedUser.password);
      
      // Aguardar um pouco para o login processar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const duration = Date.now() - startTime;
      
      updateTest('Teste Login Frontend', {
        status: 'success',
        message: `✅ AuthContext funcionando (${duration}ms)`,
        duration
      });
      
      return true;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTest('Teste Login Frontend', {
        status: 'error',
        message: `❌ Erro AuthContext: ${error.message}`,
        duration
      });
      return false;
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ 
      ...test, 
      status: 'not_started' as const, 
      message: 'Aguardando...' 
    })));
    
    try {
      // Teste 1: Conexão Backend
      const backendOk = await testBackendConnection();
      if (!backendOk) return;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Teste 2: Criação de usuários
      const usersOk = await testUserCreation();
      if (!usersOk) return;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Teste 3: Login no backend
      const backendLoginOk = await testBackendLogin();
      if (!backendLoginOk) return;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Teste 4: Login no frontend
      await testFrontendLogin();
      
    } catch (error) {
      console.error('Erro nos testes:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const testCustomLogin = async () => {
    if (!customEmail || !customPassword) return;
    
    setFrontendLoginTest(true);
    try {
      await login(customEmail, customPassword);
    } catch (error: any) {
      console.error('Erro no login customizado:', error);
    } finally {
      setFrontendLoginTest(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'not_started':
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🔐 Teste de Login Pós-Correções</h1>
          <p className="text-gray-600">
            Verificação completa do sistema de autenticação após correções de timeout
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="mt-4"
          >
            <Home className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>

        {/* Status do Auth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Status de Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={authLoading ? "secondary" : "outline"}>
                  {authLoading ? "Carregando..." : "Pronto"}
                </Badge>
                <span className="text-sm">Estado Auth</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isAuthenticated ? "default" : "outline"}>
                  {isAuthenticated ? "Autenticado" : "Não autenticado"}
                </Badge>
                <span className="text-sm">Status</span>
              </div>
              <div className="flex items-center gap-2">
                {user && (
                  <Badge variant="secondary">
                    {user.email}
                  </Badge>
                )}
                <span className="text-sm">Usuário</span>
              </div>
            </div>
            
            {authError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  Erro de Auth: {authError}
                </div>
              </div>
            )}
            
            {isAuthenticated && user && (
              <div className="mt-4 flex gap-2">
                <Button onClick={handleLogout} variant="outline">
                  Fazer Logout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Testes Automatizados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Bateria de Testes Automatizados
            </CardTitle>
            <CardDescription>
              Testa todo o fluxo: backend → criação de usuários → login backend → login frontend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seleção de usuário */}
            <div className="space-y-2">
              <Label>Usuário para Teste</Label>
              <div className="flex gap-2">
                {TEST_USERS.map((user) => (
                  <Button
                    key={user.email}
                    variant={selectedUser.email === user.email ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUser(user)}
                  >
                    {user.role}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Testando: {selectedUser.email} • {selectedUser.password}
              </p>
            </div>
            
            <Button 
              onClick={runAllTests} 
              disabled={isRunningTests}
              className="w-full"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Executando Testes...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Executar Todos os Testes
                </>
              )}
            </Button>

            {/* Resultados dos testes */}
            <div className="space-y-3">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">{test.message}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {test.duration && `${test.duration}ms`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Teste Manual de Login */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Teste Manual de Login
            </CardTitle>
            <CardDescription>
              Teste o AuthContext diretamente com credenciais personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ana@demo.fit"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Demo!12345"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                />
              </div>
            </div>
            
            <Button 
              onClick={testCustomLogin} 
              disabled={frontendLoginTest || !customEmail || !customPassword || authLoading}
              className="w-full"
            >
              {frontendLoginTest ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Testando Login...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Testar Login no Frontend
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Project ID:</strong> {projectId}
              </div>
              <div>
                <strong>Anon Key:</strong> {publicAnonKey.substring(0, 20)}...
              </div>
              <div>
                <strong>Backend URL:</strong> https://{projectId}.supabase.co/functions/v1/make-server-e547215c
              </div>
              <div>
                <strong>Timestamp:</strong> {new Date().toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}