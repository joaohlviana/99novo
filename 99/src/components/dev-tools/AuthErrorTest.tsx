/**
 * 🧪 TESTE DE ERROS DE AUTENTICAÇÃO
 * 
 * Componente para verificar se todos os erros foram corrigidos
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';

export function AuthErrorTest() {
  const { user, isAuthenticated, isLoading, error, login, logout } = useAuth();

  const testLoginSimple = async () => {
    try {
      await login('test@example.com', 'test123');
      console.log('✅ Login teste executado sem erros');
    } catch (err) {
      console.log('❌ Erro esperado no login:', err);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Teste de Erros Corrigidos
          <Badge variant={error ? "destructive" : "secondary"}>
            {error ? "Com Erro" : "OK"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status do Sistema */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Autenticado:</strong> {isAuthenticated ? 'Sim' : 'Não'}
          </div>
          <div>
            <strong>Carregando:</strong> {isLoading ? 'Sim' : 'Não'}
          </div>
          <div>
            <strong>Email:</strong> {user?.email || 'N/A'}
          </div>
          <div>
            <strong>Roles:</strong> {user?.roles?.join(', ') || 'N/A'}
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {/* Ações de Teste */}
        <div className="flex gap-2">
          <Button 
            onClick={testLoginSimple}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            Teste Login
          </Button>
          
          {user && (
            <Button 
              onClick={logout}
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              Logout
            </Button>
          )}
        </div>

        {/* Resultado */}
        <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
          ✅ Se você consegue ver este componente sem erros no console, 
          significa que os problemas de import foram corrigidos.
        </div>
      </CardContent>
    </Card>
  );
}