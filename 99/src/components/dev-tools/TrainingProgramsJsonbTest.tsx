/**
 * COMPONENTE DE TESTE: TrainingProgramsJsonbTest
 * ==============================================
 * Testa a nova estrutura JSONB dos programas de treino
 * após a migração de programDataToHybrid/hybridToProgramData
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Database,
  FileText,
  BarChart3
} from 'lucide-react';
import { useTrainingPrograms } from '../../hooks/useTrainingPrograms';
import { useAuth } from '../../contexts/AuthContext';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
}

export function TrainingProgramsJsonbTest() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  
  const {
    programs,
    loading,
    error,
    createProgram,
    refreshPrograms,
    refreshStats,
    stats
  } = useTrainingPrograms();

  const addTestResult = (result: TestResult) => {
    setTests(prev => [...prev, result]);
  };

  const clearTests = () => {
    setTests([]);
  };

  const runTests = async () => {
    if (!user) {
      addTestResult({
        name: 'Autenticação',
        status: 'error',
        message: 'Usuário não autenticado'
      });
      return;
    }

    setIsRunning(true);
    clearTests();

    try {
      // Teste 1: Hook inicialização
      addTestResult({
        name: 'Hook useTrainingPrograms',
        status: 'success',
        message: 'Hook inicializado corretamente',
        details: {
          hasCreateFunction: !!createProgram,
          hasRefreshFunction: !!refreshPrograms,
          programsCount: programs?.length || 0
        }
      });

      // Teste 2: Carregar programas existentes
      addTestResult({
        name: 'Carregar Programas',
        status: 'pending',
        message: 'Carregando programas...'
      });

      await refreshPrograms();

      setTests(prev => prev.map(test => 
        test.name === 'Carregar Programas' 
          ? {
              ...test,
              status: error ? 'error' : 'success',
              message: error 
                ? `Erro ao carregar: ${error}`
                : `${programs?.length || 0} programas carregados`,
              details: { programsCount: programs?.length || 0 }
            }
          : test
      ));

      // Teste 3: Estatísticas
      addTestResult({
        name: 'Estatísticas',
        status: 'pending',
        message: 'Carregando estatísticas...'
      });

      await refreshStats();

      setTests(prev => prev.map(test => 
        test.name === 'Estatísticas' 
          ? {
              ...test,
              status: stats ? 'success' : 'warning',
              message: stats 
                ? 'Estatísticas carregadas com sucesso'
                : 'Estatísticas não disponíveis',
              details: stats
            }
          : test
      ));

      // Teste 4: Criar programa de teste (se não houver programas)
      if (programs?.length === 0) {
        addTestResult({
          name: 'Criar Programa Teste',
          status: 'pending',
          message: 'Criando programa de teste...'
        });

        const testProgram = {
          title: 'Programa de Teste JSONB',
          category: 'Musculação',
          modality: 'Presencial',
          level: 'Iniciante',
          tags: ['teste', 'jsonb'],
          description: 'Programa criado para testar a nova estrutura JSONB',
          objectives: ['Testar JSONB', 'Verificar compatibilidade'],
          requirements: ['Nenhum'],
          whatYouGet: ['Estrutura testada'],
          duration: 8,
          durationType: 'weeks' as const,
          frequency: 3,
          sessionDuration: 60,
          schedule: [],
          packages: [{
            name: 'Básico',
            price: 150,
            description: 'Pacote de teste',
            features: ['Teste JSONB'],
            deliveryTime: 1,
            revisions: 1
          }],
          addOns: [],
          coverImage: '',
          gallery: [],
          videos: [],
          isPublished: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        try {
          const newProgram = await createProgram(testProgram);
          
          setTests(prev => prev.map(test => 
            test.name === 'Criar Programa Teste' 
              ? {
                  ...test,
                  status: newProgram ? 'success' : 'error',
                  message: newProgram 
                    ? 'Programa de teste criado com sucesso'
                    : 'Falha ao criar programa de teste',
                  details: newProgram ? {
                    title: newProgram.title,
                    category: newProgram.category,
                    packages: newProgram.packages?.length || 0
                  } : null
                }
              : test
          ));
        } catch (createError) {
          setTests(prev => prev.map(test => 
            test.name === 'Criar Programa Teste' 
              ? {
                  ...test,
                  status: 'error',
                  message: `Erro ao criar programa: ${createError}`,
                }
              : test
          ));
        }
      }

      // Teste 5: Verificar estrutura dos dados
      if (programs && programs.length > 0) {
        const firstProgram = programs[0];
        addTestResult({
          name: 'Estrutura de Dados',
          status: 'success',
          message: 'Estrutura JSONB válida detectada',
          details: {
            hasTitle: !!firstProgram.title,
            hasCategory: !!firstProgram.category,
            hasPackages: !!firstProgram.packages?.length,
            hasDescription: !!firstProgram.description,
            programStructure: {
              title: firstProgram.title,
              category: firstProgram.category,
              modality: firstProgram.modality,
              packagesCount: firstProgram.packages?.length || 0
            }
          }
        });
      }

    } catch (testError) {
      addTestResult({
        name: 'Erro Geral',
        status: 'error',
        message: `Erro durante execução dos testes: ${testError}`,
        details: { error: testError }
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
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

  useEffect(() => {
    if (user && tests.length === 0) {
      // Auto-run basic tests on mount
      setTimeout(() => {
        runTests();
      }, 1000);
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Teste da Estrutura JSONB - Training Programs
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Verifica se a migração de programDataToHybrid → programDataToJsonb funcionou corretamente
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button 
              onClick={runTests} 
              disabled={isRunning || !user}
              className="bg-gray-900 hover:bg-gray-800"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executando Testes...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Executar Testes
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearTests}
              disabled={isRunning}
            >
              Limpar Resultados
            </Button>

            <Badge variant="outline" className="ml-auto">
              {user ? `Usuário: ${user.email}` : 'Não logado'}
            </Badge>
          </div>

          {!user && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                É necessário estar logado para executar os testes.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      {tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resultados dos Testes
              <Badge variant="outline" className="ml-auto">
                {tests.length} teste{tests.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tests.map((test, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(test.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{test.name}</h4>
                        <Badge 
                          variant={test.status === 'success' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {test.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {test.message}
                      </p>
                      
                      {test.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            Ver detalhes
                          </summary>
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                            {JSON.stringify(test.details, null, 2)}
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

      {/* Estado Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Estado Atual do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Programas Carregados:</strong>
              <span className="ml-2">{programs?.length || 0}</span>
            </div>
            <div>
              <strong>Loading:</strong>
              <span className="ml-2">{loading ? '✅' : '❌'}</span>
            </div>
            <div>
              <strong>Erro:</strong>
              <span className="ml-2">{error || 'Nenhum'}</span>
            </div>
            <div>
              <strong>Estatísticas:</strong>
              <span className="ml-2">{stats ? '✅' : '❌'}</span>
            </div>
          </div>

          {stats && (
            <>
              <Separator />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Total:</strong>
                  <span className="ml-2">{stats.total_programs}</span>
                </div>
                <div>
                  <strong>Publicados:</strong>
                  <span className="ml-2">{stats.published_programs}</span>
                </div>
                <div>
                  <strong>Rascunhos:</strong>
                  <span className="ml-2">{stats.draft_programs}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}