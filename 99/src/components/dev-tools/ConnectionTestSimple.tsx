/**
 * 🔧 TESTE SIMPLES DE CONEXÃO SUPABASE
 * 
 * Componente básico para verificar se a conexão do Supabase está funcionando
 * corretamente com o singleton pattern e o projeto correto.
 */

import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle, XCircle, Loader2, Database, Zap } from "lucide-react";
import { supabase } from '../../lib/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export function ConnectionTestSimple() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const supabase = useSupabaseClient();

  const updateTest = (name: string, update: Partial<TestResult>) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, ...update } : test
    ));
  };

  const addTest = (test: TestResult) => {
    setTests(prev => [...prev, test]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Singleton Check
    addTest({ name: 'Singleton Pattern', status: 'pending', message: 'Verificando singleton...' });
    try {
      const client1 = supabase;
      const client2 = supabase;
      const isSingleton = client1 === client2;
      
      updateTest('Singleton Pattern', {
        status: isSingleton ? 'success' : 'error',
        message: isSingleton ? 'Singleton funcionando corretamente' : 'ERRO: Múltiplas instâncias detectadas',
        details: { isSingleton, client1Type: typeof client1, client2Type: typeof client2 }
      });
    } catch (error: any) {
      updateTest('Singleton Pattern', {
        status: 'error',
        message: `Erro no teste de singleton: ${error.message}`
      });
    }

    // Test 2: Configuration Check
    addTest({ name: 'Configuration', status: 'pending', message: 'Verificando configuração...' });
    try {
      const config = {
        projectId,
        hasAnonKey: !!publicAnonKey,
        anonKeyLength: publicAnonKey?.length,
        expectedUrl: `https://${projectId}.supabase.co`
      };

      const isValidConfig = projectId === 'rdujusymvebxndykyvhu' && !!publicAnonKey;
      
      updateTest('Configuration', {
        status: isValidConfig ? 'success' : 'error',
        message: isValidConfig ? 'Configuração correta' : 'Configuração incorreta',
        details: config
      });
    } catch (error: any) {
      updateTest('Configuration', {
        status: 'error',
        message: `Erro na configuração: ${error.message}`
      });
    }

    // Test 3: Auth Session Check
    addTest({ name: 'Auth Session', status: 'pending', message: 'Verificando sessão...' });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      updateTest('Auth Session', {
        status: 'success',
        message: session ? `Usuário logado: ${session.user.email}` : 'Nenhum usuário logado (normal)',
        details: {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          error: error?.message
        }
      });
    } catch (error: any) {
      updateTest('Auth Session', {
        status: 'error',
        message: `Erro ao verificar sessão: ${error.message}`
      });
    }

    // Test 4: Basic Database Query
    addTest({ name: 'Database Query', status: 'pending', message: 'Testando query básica...' });
    try {
      // Tentar uma query simples - não importa se falha, importa se conecta
      const { data, error } = await supabase
        .from('kv_store_e547215c')
        .select('count')
        .limit(1);

      updateTest('Database Query', {
        status: 'success',
        message: error ? `Conectado (erro esperado): ${error.message}` : 'Query executada com sucesso',
        details: {
          hasData: !!data,
          error: error?.message,
          errorCode: error?.code
        }
      });
    } catch (error: any) {
      updateTest('Database Query', {
        status: 'error',
        message: `Erro na query: ${error.message}`,
        details: { error: error.message }
      });
    }

    // Test 5: Project ID Validation
    addTest({ name: 'Project Validation', status: 'pending', message: 'Validando projeto...' });
    try {
      const isCorrectProject = projectId === 'rdujusymvebxndykyvhu';
      const jwt = publicAnonKey ? JSON.parse(atob(publicAnonKey.split('.')[1])) : null;
      
      updateTest('Project Validation', {
        status: isCorrectProject ? 'success' : 'error',
        message: isCorrectProject ? 'Projeto correto configurado' : 'ERRO: Projeto incorreto',
        details: {
          currentProject: projectId,
          expectedProject: 'rdujusymvebxndykyvhu',
          jwtRef: jwt?.ref,
          jwtIss: jwt?.iss,
          isExpired: jwt ? jwt.exp * 1000 < Date.now() : true
        }
      });
    } catch (error: any) {
      updateTest('Project Validation', {
        status: 'error',
        message: `Erro na validação: ${error.message}`
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">✓</Badge>;
      case 'error':
        return <Badge variant="destructive">✗</Badge>;
      case 'pending':
        return <Badge variant="secondary">...</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Teste Simples de Conexão
        </CardTitle>
        <CardDescription>
          Verificação rápida do singleton pattern e configuração Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Executar Testes
              </>
            )}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Projeto: <code className="bg-muted px-1 rounded">{projectId}</code>
          </div>
        </div>

        {tests.length > 0 && (
          <div className="space-y-2">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-muted-foreground">{test.message}</div>
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>
            ))}
            
            {/* Summary */}
            <div className="mt-4 p-3 bg-muted rounded">
              <div className="text-sm font-medium">
                Resumo: {tests.filter(t => t.status === 'success').length} sucessos, {' '}
                {tests.filter(t => t.status === 'error').length} erros
              </div>
            </div>
          </div>
        )}

        {tests.length === 0 && !isRunning && (
          <div className="text-center py-8 text-muted-foreground">
            Clique em "Executar Testes" para verificar a conexão
          </div>
        )}
      </CardContent>
    </Card>
  );
}