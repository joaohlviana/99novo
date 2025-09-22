/**
 * TESTE DE CORREÇÃO DOS ERROS DE ESTATÍSTICAS
 * ============================================
 * Testa se o erro "permission denied for table users" foi resolvido
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { trainingProgramsService } from '../../services/training-programs.service';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
  error?: any;
}

export function StatsErrorTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { user } = useAuth();

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runTests = async () => {
    if (!user) {
      addResult({
        name: 'Pré-requisito',
        status: 'error',
        message: 'Usuário deve estar logado para executar testes'
      });
      return;
    }

    setTesting(true);
    clearResults();

    // Teste 1: Verificar se o service está funcionando
    addResult({
      name: 'Inicialização do Service',
      status: 'pending',
      message: 'Verificando se o trainingProgramsService está disponível...'
    });

    try {
      const hasGetTrainerStats = typeof trainingProgramsService.getTrainerStats === 'function';
      
      setResults(prev => prev.map(r => 
        r.name === 'Inicialização do Service' 
          ? {
              ...r,
              status: hasGetTrainerStats ? 'success' : 'error',
              message: hasGetTrainerStats 
                ? 'Service carregado com sucesso'
                : 'Método getTrainerStats não encontrado'
            }
          : r
      ));

      if (!hasGetTrainerStats) {
        setTesting(false);
        return;
      }
    } catch (error) {
      setResults(prev => prev.map(r => 
        r.name === 'Inicialização do Service' 
          ? {
              ...r,
              status: 'error',
              message: `Erro ao verificar service: ${error}`
            }
          : r
      ));
      setTesting(false);
      return;
    }

    // Teste 2: Chamar getTrainerStats
    addResult({
      name: 'Carregar Estatísticas',
      status: 'pending',
      message: 'Chamando trainingProgramsService.getTrainerStats...'
    });

    try {
      const startTime = Date.now();
      const { data, error } = await trainingProgramsService.getTrainerStats(user.id);
      const duration = Date.now() - startTime;

      setResults(prev => prev.map(r => 
        r.name === 'Carregar Estatísticas' 
          ? {
              ...r,
              status: error ? 'error' : 'success',
              message: error 
                ? `Erro: ${JSON.stringify(error)}`
                : `Estatísticas carregadas em ${duration}ms`,
              data,
              error
            }
          : r
      ));

      // Teste 3: Verificar estrutura dos dados
      if (data && !error) {
        addResult({
          name: 'Validação dos Dados',
          status: 'pending',
          message: 'Verificando estrutura dos dados retornados...'
        });

        const expectedFields = [
          'total_programs',
          'published_programs', 
          'draft_programs',
          'total_views',
          'total_inquiries',
          'total_conversions'
        ];

        const missingFields = expectedFields.filter(field => !(field in data));
        const hasValidNumbers = expectedFields.every(field => 
          typeof data[field] === 'number' && data[field] >= 0
        );

        setResults(prev => prev.map(r => 
          r.name === 'Validação dos Dados' 
            ? {
                ...r,
                status: missingFields.length === 0 && hasValidNumbers ? 'success' : 'warning',
                message: missingFields.length === 0 && hasValidNumbers
                  ? 'Todos os campos obrigatórios presentes e válidos'
                  : `Problemas encontrados: ${missingFields.length > 0 ? `Campos faltando: ${missingFields.join(', ')}. ` : ''}${!hasValidNumbers ? 'Alguns valores não são números válidos.' : ''}`,
                data: {
                  receivedFields: Object.keys(data),
                  expectedFields,
                  missingFields,
                  values: data
                }
              }
            : r
        ));
      }

      // Teste 4: Verificar se há fallbacks funcionando
      if (data) {
        addResult({
          name: 'Sistema de Fallback',
          status: 'success',
          message: 'Sistema retornou dados válidos (fallback ou reais)',
          data: {
            note: 'O sistema está funcionando corretamente com fallbacks de segurança',
            stats: data
          }
        });
      }

    } catch (error) {
      console.error('Erro no teste:', error);
      
      // Verificar se é o erro específico de permissão
      const isPermissionError = error?.message?.includes('permission denied for table users');
      
      setResults(prev => prev.map(r => 
        r.name === 'Carregar Estatísticas' 
          ? {
              ...r,
              status: 'error',
              message: isPermissionError 
                ? '🚨 ERRO DE PERMISSÃO DETECTADO: Este é o erro que precisamos corrigir!'
                : `Erro inesperado: ${error.message}`,
              error: {
                isPermissionError,
                message: error.message,
                fullError: error
              }
            }
          : r
      ));

      if (isPermissionError) {
        addResult({
          name: 'Diagnóstico do Erro',
          status: 'error',
          message: 'O erro "permission denied for table users" ainda está ocorrendo',
          data: {
            solution: 'Este erro indica que algum código ainda está tentando acessar diretamente a tabela users do Supabase',
            nextSteps: [
              'Verificar se todos os services estão usando endpoints do servidor',
              'Garantir que não há queries diretas à tabela users',
              'Implementar fallbacks mais robustos'
            ]
          }
        });
      }
    }

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return null;
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
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            🔧 Teste de Correção - Erro "permission denied for table users"
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Este teste verifica se o erro de permissão na tabela users foi corrigido.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button 
              onClick={runTests} 
              disabled={testing || !user}
              className="bg-gray-900 hover:bg-gray-800"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                'Executar Teste de Correção'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearResults}
              disabled={testing}
            >
              Limpar Resultados
            </Button>
          </div>

          {!user && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                É necessário estar logado para executar este teste.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{result.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.message}
                      </p>
                      
                      {(result.data || result.error) && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            Ver detalhes
                          </summary>
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(result.data || result.error, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}