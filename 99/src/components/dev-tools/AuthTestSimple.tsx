/**
 * 🔐 TESTE DE AUTENTICAÇÃO SIMPLIFICADO
 * 
 * Testa o sistema de autenticação seguindo padrões oficiais do Supabase
 */

import React from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';

export function AuthTestSimple() {
  const { user, session, isLoading, error, login, logout, clearError } = useAuth();

  const testLogin = async () => {
    try {
      clearError();
      await login('ana@demo.fit', 'Demo!12345');
    } catch (err) {
      console.error('Erro no teste de login:', err);
    }
  };

  const testLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Erro no teste de logout:', err);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔐 Teste de Autenticação - Padrão Oficial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="space-y-2 text-sm">
              <div><strong>Carregando:</strong> {isLoading ? 'Sim' : 'Não'}</div>
              <div><strong>Usuário:</strong> {user ? user.email : 'Não logado'}</div>
              <div><strong>Sessão:</strong> {session ? 'Ativa' : 'Inativa'}</div>
              <div><strong>Roles:</strong> {user?.roles.join(', ') || 'Nenhuma'}</div>
              {error && (
                <div className="text-destructive">
                  <strong>Erro:</strong> {error}
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <Button 
              onClick={testLogin} 
              disabled={isLoading || !!user}
              variant="default"
            >
              {isLoading ? 'Carregando...' : 'Testar Login'}
            </Button>
            
            <Button 
              onClick={testLogout} 
              disabled={isLoading || !user}
              variant="outline"
            >
              Testar Logout
            </Button>
            
            {error && (
              <Button 
                onClick={clearError} 
                variant="ghost"
                size="sm"
              >
                Limpar Erro
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground">
            Sistema simplificado seguindo: 
            <br />
            https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
          </div>
        </CardContent>
      </Card>
    </div>
  );
}