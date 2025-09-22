/**
 * 🧪 TESTE SIMPLES DOS SERVIÇOS
 * 
 * Versão simplificada que testa apenas o básico,
 * sem dependências complexas ou views que podem não existir.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, Clock, Play } from 'lucide-react';
import { unifiedPlatformService } from '../services/unified-platform.service';

interface TestResult {
  name: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  data?: any;
  duration?: number;
}

export default function SimpleServicesTestPage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        return prev.map(t => t.name === name ? { ...t, ...updates } : t);
      } else {
        return [...prev, { name, status: 'idle', message: '', ...updates }];
      }
    });
  };

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    updateTest(name, { status: 'loading', message: 'Executando...' });
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTest(name, { 
        status: 'success', 
        message: `Sucesso! Retornou ${Array.isArray(result) ? result.length : 'dados'}`,
        data: result,
        duration 
      });
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTest(name, { 
        status: 'error', 
        message: error.message || 'Erro desconhecido',
        data: error,
        duration
      });
      throw error;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);

    try {
      console.log('🧪 Iniciando testes simples dos serviços...');

      // 1. Teste de Estatísticas da Plataforma
      await runTest('Estatísticas da Plataforma', () => 
        unifiedPlatformService.getPlatformStats()
      );

      // 2. Teste de Program Cards (básico)
      await runTest('Program Cards', () => 
        unifiedPlatformService.getProgramCards({
          limit: 5
        })
      );

      // 3. Teste de Trainer Cards (básico)
      await runTest('Trainer Cards', () => 
        unifiedPlatformService.getTrainerCards({
          limit: 5
        })
      );

      // 4. Teste de Featured Programs
      await runTest('Featured Programs', () => 
        unifiedPlatformService.getFeaturedPrograms(3)
      );

      // 5. Teste de Busca Unificada
      await runTest('Busca Unificada', () => 
        unifiedPlatformService.unifiedSearch('treino', {
          limit: 5
        })
      );

      console.log('✅ Todos os testes simples concluídos!');

    } catch (error) {
      console.error('❌ Erro durante os testes:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'loading':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-200" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'loading':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const totalTests = tests.length;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">🧪 Teste Simples dos Serviços</h1>
        <p className="text-muted-foreground">
          Validação básica dos serviços sem dependências complexas
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Button onClick={runAllTests} disabled={isRunning} className="px-8 py-2">
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Executando...' : 'Executar Todos os Testes'}
          </Button>
          
          {totalTests > 0 && (
            <Badge variant={successCount === totalTests ? "default" : "secondary"}>
              {successCount}/{totalTests} sucessos
            </Badge>
          )}
        </div>
      </div>

      {/* Tests Results */}
      {tests.length > 0 && (
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
                
                {test.data && test.status === 'success' && (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium mb-2">
                      Ver dados retornados
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}

                {test.status === 'error' && test.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium mb-2 text-red-600">
                      Ver erro detalhado
                    </summary>
                    <pre className="mt-2 text-xs bg-red-100 p-3 rounded overflow-auto max-h-60 text-red-800">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {!isRunning && totalTests > 0 && (
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle>📊 Resumo dos Testes</CardTitle>
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
                  {totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
              <p className="text-blue-700">
                <strong>🧪 Teste Simples:</strong> Esta versão testa apenas os serviços básicos
                sem dependências de views SQL ou funções complexas que podem não existir.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}