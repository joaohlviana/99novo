/**
 * 🧪 PÁGINA DE VALIDAÇÃO SEGURA - SEM ACESSO A auth.users
 * 
 * Versão ultra-segura que testa apenas nossas tabelas customizadas
 * sem qualquer referência à tabela auth.users do Supabase.
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  duration?: number;
}

export default function SystemValidationPageSafe() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (name: string, result: Partial<TestResult>) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        return prev.map(t => t.name === name ? { ...t, ...result } : t);
      } else {
        return [...prev, { name, status: 'pending', message: '', ...result }];
      }
    });
  };

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    updateTest(name, { status: 'pending', message: 'Executando...' });
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTest(name, { 
        status: 'success', 
        message: 'Sucesso!', 
        details: result,
        duration 
      });
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTest(name, { 
        status: 'error', 
        message: `ERRO: ${error.message || 'Desconhecido'}`,
        details: error,
        duration
      });
      console.error(`❌ Erro no teste ${name}:`, error);
      throw error;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);

    try {
      console.log('🧪 Iniciando testes seguros...');

      // 1. Teste básico de conexão
      await runTest('CONEXÃO SUPABASE', async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id')
          .limit(1);
        
        if (error) throw error;
        return { connected: true, sample: !!data };
      });

      // 2. Teste de tabela user_profiles (apenas contagem)
      await runTest('TABELA user_profiles', async () => {
        const { count, error } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return { total_records: count };
      });

      // 3. Teste de tabela training_programs (apenas contagem)
      await runTest('TABELA training_programs', async () => {
        const { count, error } = await supabase
          .from('training_programs')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return { total_records: count };
      });

      // 4. Teste de alguns registros específicos
      await runTest('REGISTROS user_profiles', async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, name, email, role, is_active')
          .eq('is_active', true)
          .limit(5);
        
        if (error) throw error;
        
        const trainers = data?.filter(p => p.role === 'trainer').length || 0;
        const clients = data?.filter(p => p.role === 'client').length || 0;
        
        return { 
          found: data?.length || 0,
          trainers,
          clients,
          samples: data?.map(p => ({ id: p.id, name: p.name, role: p.role }))
        };
      });

      // 5. Teste de registros training_programs
      await runTest('REGISTROS training_programs', async () => {
        const { data, error } = await supabase
          .from('training_programs')
          .select('id, title, status, price_amount')
          .limit(3);
        
        if (error) throw error;
        
        return { 
          found: data?.length || 0,
          samples: data?.map(p => ({ 
            id: p.id, 
            title: p.title, 
            status: p.status,
            price: p.price_amount 
          }))
        };
      });

      // 6. Teste de view program_cards_view (se existir)
      await runTest('VIEW program_cards_view', async () => {
        try {
          const { data, error } = await supabase
            .from('program_cards_view')
            .select('id, title')
            .limit(2);
          
          if (error) throw error;
          return { found: data?.length || 0, status: 'exists' };
        } catch (err: any) {
          if (err.message?.includes('does not exist')) {
            return { found: 0, status: 'not_exists', note: 'View não existe - normal' };
          }
          throw err;
        }
      });

      // 7. Teste de view trainer_dashboard_summary (se existir)
      await runTest('VIEW trainer_dashboard_summary', async () => {
        try {
          const { data, error } = await supabase
            .from('trainer_dashboard_summary')
            .select('id, name')
            .limit(2);
          
          if (error) throw error;
          return { found: data?.length || 0, status: 'exists' };
        } catch (err: any) {
          if (err.message?.includes('does not exist')) {
            return { found: 0, status: 'not_exists', note: 'View não existe - normal' };
          }
          throw err;
        }
      });

      // 8. Teste de busca simples por role
      await runTest('BUSCA POR ROLE', async () => {
        const [trainersResult, clientsResult] = await Promise.all([
          supabase
            .from('user_profiles')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'trainer')
            .eq('is_active', true),
          supabase
            .from('user_profiles')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'client')
            .eq('is_active', true)
        ]);

        if (trainersResult.error) throw trainersResult.error;
        if (clientsResult.error) throw clientsResult.error;

        return {
          trainers: trainersResult.count || 0,
          clients: clientsResult.count || 0
        };
      });

      // 9. Teste específico para trainer profiles com JSONB
      await runTest('TRAINER PROFILES JSONB', async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, name, profile_data')
          .eq('role', 'trainer')
          .eq('is_active', true)
          .limit(2);
        
        if (error) throw error;
        
        const profilesWithSpecialties = data?.filter(p => 
          p.profile_data && 
          p.profile_data.specialties && 
          Array.isArray(p.profile_data.specialties) && 
          p.profile_data.specialties.length > 0
        ).length || 0;
        
        return { 
          total_trainers: data?.length || 0,
          with_specialties: profilesWithSpecialties,
          sample_profile_data: data?.[0]?.profile_data ? Object.keys(data[0].profile_data) : []
        };
      });

      // 10. Teste específico para client profiles com JSONB
      await runTest('CLIENT PROFILES JSONB', async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, name, profile_data')
          .eq('role', 'client')
          .eq('is_active', true)
          .limit(2);
        
        if (error) throw error;
        
        const profilesWithGoals = data?.filter(p => 
          p.profile_data && 
          p.profile_data.primaryGoals && 
          Array.isArray(p.profile_data.primaryGoals) && 
          p.profile_data.primaryGoals.length > 0
        ).length || 0;
        
        return { 
          total_clients: data?.length || 0,
          with_goals: profilesWithGoals,
          sample_profile_data: data?.[0]?.profile_data ? Object.keys(data[0].profile_data) : []
        };
      });

      console.log('✅ Todos os testes seguros concluídos!');

    } catch (error) {
      console.error('❌ Erro durante testes seguros:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'pending':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const totalTests = tests.length;
  const overallProgress = totalTests > 0 ? (successCount / totalTests) * 100 : 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">🔒 Validação Segura do Sistema</h1>
        <p className="text-muted-foreground">
          Testando apenas nossas tabelas customizadas - SEM acesso a auth.users
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Badge variant={overallProgress === 100 ? "default" : "secondary"}>
            {successCount}/{totalTests} testes passando
          </Badge>
          {overallProgress === 100 && (
            <Badge variant="default" className="bg-green-600">
              ✅ Sistema Seguro Funcional
            </Badge>
          )}
        </div>
      </div>

      {/* Tests Results */}
      <div className="grid gap-4">
        {tests.map((test) => (
          <Card key={test.name} className={`transition-all ${getStatusColor(test.status)}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <span className="text-lg">{test.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {test.duration && (
                    <Badge variant="outline" className="text-xs">
                      {test.duration}ms
                    </Badge>
                  )}
                  <Badge variant={test.status === 'success' ? 'default' : 'destructive'}>
                    {test.status}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {test.message}
              </p>
              
              {test.details && (
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium mb-2">
                    Ver detalhes
                  </summary>
                  <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-60">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Executando Testes Seguros...' : 'Executar Testes Novamente'}
        </button>
      </div>

      {/* Summary */}
      {!isRunning && totalTests > 0 && (
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle>📊 Resumo da Validação Segura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-muted-foreground">Sucessos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {tests.filter(t => t.status === 'error').length}
                </div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(overallProgress)}%
                </div>
                <div className="text-sm text-muted-foreground">Progresso</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
              <p className="text-blue-700">
                <strong>🔒 Modo Seguro:</strong> Esta validação usa apenas queries diretas 
                às nossas tabelas customizadas, evitando completamente a tabela auth.users 
                protegida do Supabase.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}