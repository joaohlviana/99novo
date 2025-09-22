/**
 * 🧪 PÁGINA DE VALIDAÇÃO DO SISTEMA UNIFICADO
 * 
 * Testa se todas as funções SQL, views e estruturas estão funcionando
 * corretamente após as correções de tipo implementadas.
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

export default function SystemValidationPage() {
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
        message: error.message || 'Erro desconhecido',
        details: error,
        duration
      });
      throw error;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);

    try {
      // 1. Testar estrutura de tabelas
      await runTest('USER PROFILES', async () => {
        const { data, error, count } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact' })
          .limit(1);
        
        if (error) throw error;
        return { count, sample: data?.[0] };
      });

      // 2. Testar training_programs
      await runTest('TRAINING PROGRAMS', async () => {
        const { data, error, count } = await supabase
          .from('training_programs')
          .select('*', { count: 'exact' })
          .limit(1);
        
        if (error) throw error;
        return { count, sample: data?.[0] };
      });

      // 3. Testar views
      await runTest('PROGRAM CARDS VIEW', async () => {
        const { data, error } = await supabase
          .from('program_cards_view')
          .select('*')
          .limit(3);
        
        if (error) throw error;
        return { count: data?.length, programs: data };
      });

      await runTest('TRAINER DASHBOARD VIEW', async () => {
        const { data, error } = await supabase
          .from('trainer_dashboard_summary')
          .select('*')
          .limit(3);
        
        if (error) throw error;
        return { count: data?.length, trainers: data };
      });

      // 4. Testar funções SQL corrigidas
      await runTest('get_featured_programs', async () => {
        const { data, error } = await supabase.rpc('get_featured_programs', {
          p_limit: 3
        });
        
        if (error) throw error;
        return { count: data?.length, programs: data };
      });

      await runTest('get_programs_for_cards', async () => {
        const { data, error } = await supabase.rpc('get_programs_for_cards', {
          p_specialties: null,
          p_goals: null,
          p_cities: null,
          p_difficulty: 'beginner',
          p_max_price: null,
          p_service_mode: null,
          p_sort_by: 'relevance',
          p_limit: 5,
          p_offset: 0
        });
        
        if (error) throw error;
        return { count: data?.length, programs: data };
      });

      await runTest('get_trainers_with_stats', async () => {
        const { data, error } = await supabase.rpc('get_trainers_with_stats', {
          p_specialties: null,
          p_cities: null,
          p_limit: 3,
          p_offset: 0
        });
        
        if (error) throw error;
        return { count: data?.length, trainers: data };
      });

      // 5. Testar estatísticas da plataforma (usando apenas nossas tabelas)
      await runTest('PLATFORM STATS', async () => {
        // Usar apenas contagens simples das nossas tabelas customizadas
        const [programsResult, profilesResult] = await Promise.all([
          supabase
            .from('training_programs')
            .select('id', { count: 'exact' })
            .eq('status', 'published'),
          supabase
            .from('user_profiles')
            .select('id, role', { count: 'exact' })
            .eq('is_active', true)
        ]);

        if (programsResult.error) throw programsResult.error;
        if (profilesResult.error) throw profilesResult.error;

        // Contar roles manualmente dos dados retornados
        const trainers = profilesResult.data?.filter(p => p.role === 'trainer').length || 0;
        const clients = profilesResult.data?.filter(p => p.role === 'client').length || 0;

        return {
          programs: programsResult.count || 0,
          trainers,
          clients,
          totalProfiles: profilesResult.count || 0
        };
      });

    } catch (error) {
      console.error('Erro durante os testes:', error);
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
        <h1 className="text-3xl font-bold">🧪 Validação do Sistema Unificado</h1>
        <p className="text-muted-foreground">
          Testando funções SQL, views e estruturas após as correções de tipo
        </p>
        
        {/* Progress Overview */}
        <div className="flex items-center justify-center gap-4">
          <Badge variant={overallProgress === 100 ? "default" : "secondary"}>
            {successCount}/{totalTests} testes passando
          </Badge>
          {overallProgress === 100 && (
            <Badge variant="default" className="bg-green-600">
              ✅ Sistema 100% Funcional
            </Badge>
          )}
        </div>
      </div>

      {/* Tests Results */}
      <div className="grid gap-4">
        {tests.map((test, index) => (
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
                  <pre className="bg-gray-100 p-3 rounded overflow-auto">
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
          {isRunning ? 'Executando Testes...' : 'Executar Testes Novamente'}
        </button>
      </div>

      {/* Summary */}
      {!isRunning && totalTests > 0 && (
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle>📊 Resumo da Validação</CardTitle>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}