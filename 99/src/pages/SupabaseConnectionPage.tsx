/**
 * 🔧 PÁGINA DE TESTE DE CONEXÃO SUPABASE
 * 
 * Página dedicada para testes de conexão e configuração do Supabase
 * Garante que o sistema tenha um singleton e conecte por apenas um local
 */

import React from 'react';
import { SupabaseConnectionTest } from '../components/dev-tools/SupabaseConnectionTest';
import { ConnectionTestSimple } from '../components/dev-tools/ConnectionTestSimple';
import { LoginTestSimple } from '../components/dev-tools/LoginTestSimple';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Home, Database, Shield, Zap } from 'lucide-react';
import { useSupabaseClient } from '../lib/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export default function SupabaseConnectionPage() {
  // Teste do singleton - deve retornar sempre a mesma instância
  const supabase1 = useSupabaseClient();
  const supabase2 = useSupabaseClient();
  const isSingleton = supabase1 === supabase2;

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teste de Conexão Supabase</h1>
            <p className="text-muted-foreground mt-2">
              Validação e teste da conexão com o banco de dados
            </p>
          </div>
          <Button onClick={handleGoHome} variant="outline" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Voltar ao Início
          </Button>
        </div>

        {/* Informações da Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configuração Atual
            </CardTitle>
            <CardDescription>
              Informações da configuração do Supabase e singleton
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Project ID</div>
                <div className="text-sm font-mono bg-muted p-2 rounded">
                  {projectId}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">URL Base</div>
                <div className="text-sm font-mono bg-muted p-2 rounded break-all">
                  https://{projectId}.supabase.co
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Anon Key Status</div>
                <div className="flex items-center gap-2">
                  {publicAnonKey ? (
                    <Badge variant="default" className="bg-green-500">
                      ✓ Configurada
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      ✗ Ausente
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Singleton Status</div>
                <div className="flex items-center gap-2">
                  {isSingleton ? (
                    <Badge variant="default" className="bg-green-500">
                      ✓ Funcionando
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      ✗ Múltiplas instâncias
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Detalhes da chave */}
            {publicAnonKey && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Detalhes da Anon Key
                </div>
                <div className="text-xs font-mono bg-muted p-3 rounded break-all">
                  {publicAnonKey.substring(0, 50)}...
                  <span className="text-muted-foreground">
                    ({publicAnonKey.length} caracteres)
                  </span>
                </div>
              </div>
            )}

            {/* Aviso sobre singleton */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center gap-2 text-blue-800">
                <Database className="h-4 w-4" />
                <span className="font-medium">Garantia de Singleton</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                O sistema está configurado para usar apenas uma instância do cliente Supabase.
                Status atual: {isSingleton ? 'Funcionando corretamente' : 'ERRO - Múltiplas instâncias detectadas'}
              </p>
              <div className="mt-2 text-xs text-blue-500">
                Projeto: {projectId} | URL: https://{projectId}.supabase.co
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Testes rápidos de funcionalidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto p-4 flex-col"
                onClick={() => {
                  console.log('Supabase Client 1:', supabase1);
                  console.log('Supabase Client 2:', supabase2);
                  console.log('São iguais?', supabase1 === supabase2);
                }}
              >
                <Database className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Testar Singleton</div>
                  <div className="text-xs text-muted-foreground">
                    Verifica instância única no console
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto p-4 flex-col"
                onClick={() => {
                  console.log('Project ID:', projectId);
                  console.log('Base URL:', `https://${projectId}.supabase.co`);
                  console.log('Anon Key Length:', publicAnonKey?.length);
                }}
              >
                <Shield className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Log Configuração</div>
                  <div className="text-xs text-muted-foreground">
                    Mostra config no console
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto p-4 flex-col"
                onClick={async () => {
                  try {
                    const { data: { session } } = await supabase1.auth.getSession();
                    console.log('Sessão atual:', session);
                    if (session) {
                      console.log('Usuário logado:', session.user.email);
                    } else {
                      console.log('Nenhum usuário logado');
                    }
                  } catch (error) {
                    console.error('Erro ao verificar sessão:', error);
                  }
                }}
              >
                <Zap className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Verificar Sessão</div>
                  <div className="text-xs text-muted-foreground">
                    Testa autenticação
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teste Simples */}
        <ConnectionTestSimple />
        
        {/* Teste de Login */}
        <LoginTestSimple />
        
        {/* Componente de Teste Completo */}
        <SupabaseConnectionTest />
      </div>
    </div>
  );
}