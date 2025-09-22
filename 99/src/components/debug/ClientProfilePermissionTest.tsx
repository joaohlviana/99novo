/**
 * TESTE DE PERMISSÕES DO CLIENT PROFILE
 * ====================================
 * Componente para diagnosticar problemas de permissão
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase/client';
import { Loader2, AlertCircle, CheckCircle, Database, User } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

export function ClientProfilePermissionTest() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const runPermissionTests = async () => {
    if (!user?.id) {
      setResults([{
        test: 'Verificação de Usuário',
        status: 'error',
        details: 'Usuário não autenticado',
        data: null
      }]);
      return;
    }

    setTesting(true);
    const testResults = [];

    try {
      // Teste 1: Verificar se a tabela existe
      console.log('🔍 Teste 1: Verificando se tabela client_profile existe...');
      try {
        const { error: tableError } = await supabase
          .from('client_profile')
          .select('id')
          .limit(1);

        testResults.push({
          test: 'Existência da Tabela',
          status: tableError ? 'error' : 'success',
          details: tableError ? `Erro: ${tableError.message}` : 'Tabela client_profile acessível',
          data: tableError
        });
      } catch (err) {
        testResults.push({
          test: 'Existência da Tabela',
          status: 'error',
          details: `Erro: ${err.message}`,
          data: err
        });
      }

      // Teste 2: Verificar auth.uid()
      console.log('🔍 Teste 2: Verificando auth.uid()...');
      try {
        const { data: userInfo, error: authError } = await supabase
          .rpc('auth.uid');

        testResults.push({
          test: 'auth.uid()',
          status: authError ? 'error' : 'success',
          details: authError ? `Erro: ${authError.message}` : `User ID: ${userInfo}`,
          data: { userInfo, authError }
        });
      } catch (err) {
        testResults.push({
          test: 'auth.uid()',
          status: 'error',
          details: `Erro: ${err.message}`,
          data: err
        });
      }

      // Teste 3: Verificar RLS policies
      console.log('🔍 Teste 3: Verificando policies RLS...');
      try {
        const { data: policies, error: policiesError } = await supabase
          .from('pg_policies')
          .select('*')
          .eq('tablename', 'client_profile');

        testResults.push({
          test: 'RLS Policies',
          status: policiesError ? 'error' : 'success',
          details: policiesError ? `Erro: ${policiesError.message}` : `${policies?.length || 0} policies encontradas`,
          data: policies
        });
      } catch (err) {
        testResults.push({
          test: 'RLS Policies',
          status: 'warning',
          details: 'Não foi possível verificar policies (normal em alguns casos)',
          data: err
        });
      }

      // Teste 4: Tentar SELECT direto
      console.log('🔍 Teste 4: Tentando SELECT direto...');
      try {
        const { data: selectData, error: selectError } = await supabase
          .from('client_profile')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        testResults.push({
          test: 'SELECT Direto',
          status: selectError ? 'error' : 'success',
          details: selectError ? `Erro: ${selectError.message}` : `Dados encontrados: ${selectData ? 'sim' : 'não'}`,
          data: { selectData, selectError }
        });
      } catch (err) {
        testResults.push({
          test: 'SELECT Direto',
          status: 'error',
          details: `Erro: ${err.message}`,
          data: err
        });
      }

      // Teste 5: Verificar função de teste personalizada
      console.log('🔍 Teste 5: Verificando função de teste...');
      try {
        const { data: testData, error: testError } = await supabase
          .rpc('test_client_profile_access');

        testResults.push({
          test: 'Função de Teste',
          status: testError ? 'error' : 'success',
          details: testError ? `Erro: ${testError.message}` : 'Função de teste executada',
          data: testData
        });
      } catch (err) {
        testResults.push({
          test: 'Função de Teste',
          status: 'warning',
          details: 'Função de teste não disponível (execute o script SQL primeiro)',
          data: err
        });
      }

      // Teste 6: Tentar INSERT simples
      console.log('🔍 Teste 6: Tentando INSERT de teste...');
      try {
        const testProfile = {
          user_id: user.id,
          name: user.name || 'Teste',
          email: user.email || 'teste@example.com',
          profile_data: {
            sportsInterest: ['Teste'],
            primaryGoals: ['Teste'],
            fitnessLevel: 'teste'
          },
          status: 'draft',
          is_active: true,
          is_verified: false
        };

        const { data: insertData, error: insertError } = await supabase
          .from('client_profile')
          .insert(testProfile)
          .select()
          .single();

        if (!insertError && insertData) {
          // Limpar o registro de teste
          await supabase
            .from('client_profile')
            .delete()
            .eq('id', insertData.id);
        }

        testResults.push({
          test: 'INSERT de Teste',
          status: insertError ? 'error' : 'success',
          details: insertError ? `Erro: ${insertError.message}` : 'INSERT funcionando corretamente',
          data: { insertData, insertError }
        });
      } catch (err) {
        testResults.push({
          test: 'INSERT de Teste',
          status: 'error',
          details: `Erro: ${err.message}`,
          data: err
        });
      }

    } catch (globalError) {
      testResults.push({
        test: 'Execução Geral',
        status: 'error',
        details: `Erro global: ${globalError.message}`,
        data: globalError
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  const hasErrors = results.some(r => r.status === 'error');
  const hasWarnings = results.some(r => r.status === 'warning');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Client Profile Permission Test</h1>
        <p className="text-gray-600">
          Diagnóstico de permissões para o sistema de perfil do cliente
        </p>
      </div>

      {/* Status do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Status do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">ID:</p>
              <p className="font-mono text-sm">{user?.id || 'Não logado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email:</p>
              <p className="font-mono text-sm">{user?.email || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Testes de Permissão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runPermissionTests} 
            disabled={testing || !user?.id}
            className="w-full"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executando Testes...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Executar Testes de Permissão
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Resultados dos Testes
              </span>
              <div className="flex gap-2">
                {hasErrors && <Badge variant="destructive">Erros Encontrados</Badge>}
                {hasWarnings && <Badge variant="secondary">Avisos</Badge>}
                {!hasErrors && !hasWarnings && <Badge variant="default">Tudo OK</Badge>}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{result.test}</h4>
                  <Badge 
                    variant={
                      result.status === 'success' ? 'default' : 
                      result.status === 'warning' ? 'secondary' : 'destructive'
                    }
                  >
                    {result.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.details}</p>
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500">Ver dados técnicos</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-48">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Diagnóstico */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Problemas de permissão detectados!</strong><br />
            Execute o script SQL de correção: <code>/scripts/fix-client-profile-permissions.sql</code>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}