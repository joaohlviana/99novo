/**
 * 🔧 TESTE DE BUILD
 * 
 * Componente simples para testar se todos os imports estão funcionando
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';

export function BuildTest() {
  const { user, isAuthenticated, isLoading, error } = useAuth();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🔧 Teste de Build</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm">
          <strong>Status:</strong> {isLoading ? 'Carregando...' : 'Pronto'}
        </div>
        <div className="text-sm">
          <strong>Autenticado:</strong> {isAuthenticated ? 'Sim' : 'Não'}
        </div>
        <div className="text-sm">
          <strong>Usuário:</strong> {user?.email || 'Nenhum'}
        </div>
        {error && (
          <div className="text-sm text-destructive">
            <strong>Erro:</strong> {error}
          </div>
        )}
        <Button size="sm" variant="outline">
          Teste OK ✅
        </Button>
      </CardContent>
    </Card>
  );
}