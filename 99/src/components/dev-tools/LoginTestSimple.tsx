/**
 * 🔐 TESTE SIMPLES DE LOGIN
 * 
 * Componente para testar rapidamente as credenciais dos usuários de teste
 */

import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CheckCircle, XCircle, Loader2, LogIn, User } from "lucide-react";
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface LoginResult {
  email: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

const TEST_USERS = [
  { email: 'ana@demo.fit', password: 'Demo!12345', role: 'Trainer' },
  { email: 'carlos@demo.fit', password: 'Demo!12345', role: 'Client' },
  { email: 'admin@demo.fit', password: 'Demo!12345', role: 'Admin' }
];

export function LoginTestSimple() {
  const [results, setResults] = useState<LoginResult[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const updateResult = (email: string, update: Partial<LoginResult>) => {
    setResults(prev => prev.map(result => 
      result.email === email ? { ...result, ...update } : result
    ));
  };

  const addResult = (result: LoginResult) => {
    setResults(prev => [...prev.filter(r => r.email !== result.email), result]);
  };

  const testLogin = async (email: string, password: string) => {
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e547215c`;
    
    try {
      const response = await fetch(`${baseUrl}/test-login`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        email
      };
    }
  };

  const testAllUsers = async () => {
    setIsTestingAll(true);
    setResults([]);

    for (const user of TEST_USERS) {
      addResult({
        email: user.email,
        status: 'pending',
        message: `Testing ${user.role} login...`
      });

      try {
        const result = await testLogin(user.email, user.password);
        
        updateResult(user.email, {
          status: result.success ? 'success' : 'error',
          message: result.success 
            ? `✅ ${user.role} login successful` 
            : `❌ Login failed: ${result.error}`,
          details: result
        });
      } catch (error: any) {
        updateResult(user.email, {
          status: 'error',
          message: `❌ Login error: ${error.message}`
        });
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsTestingAll(false);
  };

  const testCustomLogin = async () => {
    if (!customEmail || !customPassword) return;

    setIsTesting(true);
    
    addResult({
      email: customEmail,
      status: 'pending',
      message: 'Testing custom login...'
    });

    try {
      const result = await testLogin(customEmail, customPassword);
      
      updateResult(customEmail, {
        status: result.success ? 'success' : 'error',
        message: result.success 
          ? '✅ Custom login successful' 
          : `❌ Login failed: ${result.error}`,
        details: result
      });
    } catch (error: any) {
      updateResult(customEmail, {
        status: 'error',
        message: `❌ Login error: ${error.message}`
      });
    }

    setIsTesting(false);
  };

  const getStatusIcon = (status: LoginResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-5 w-5" />
          Teste de Login - Usuários Demo
        </CardTitle>
        <CardDescription>
          Teste das credenciais dos usuários de desenvolvimento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test All Users */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Usuários de Teste</h3>
            <Button 
              onClick={testAllUsers} 
              disabled={isTestingAll}
              className="flex items-center gap-2"
            >
              {isTestingAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  Testar Todos
                </>
              )}
            </Button>
          </div>

          <div className="grid gap-2">
            {TEST_USERS.map((user) => (
              <div key={user.email} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{user.email}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.role} • Password: {user.password}
                  </div>
                </div>
                <Badge variant="outline">{user.role}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Login Test */}
        <div className="space-y-4">
          <h3 className="font-medium">Teste Personalizado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@demo.fit"
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
            disabled={isTesting || !customEmail || !customPassword}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testando Login...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Testar Login
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Resultados</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.email}</div>
                    <div className="text-sm text-muted-foreground">{result.message}</div>
                  </div>
                </div>
                <Badge 
                  variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}
                >
                  {result.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !isTestingAll && (
          <div className="text-center py-6 text-muted-foreground">
            Clique em "Testar Todos" para verificar as credenciais dos usuários demo
          </div>
        )}
      </CardContent>
    </Card>
  );
}