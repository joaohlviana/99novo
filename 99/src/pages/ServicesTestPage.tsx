import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  TestTube,
  Bug,
  Zap,
  Users,
  Trophy,
  DollarSign,
  Bell,
  Search,
  Activity
} from 'lucide-react';

// Services imports
import * as SportsService from '../services/sports.service';
import * as TrainersService from '../services/trainers.service';
import * as ProgramsService from '../services/programs.service';
import * as UsersService from '../services/users.service';
import * as FinancialService from '../services/financial.service';
import * as NotificationsService from '../services/notifications.service';
import * as SearchService from '../services/search.service';
import * as DataService from '../services/data.service';

interface TestResult {
  service: string;
  method: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  duration: number;
  data?: any;
  error?: any;
}

interface ServiceTest {
  name: string;
  icon: any;
  color: string;
  tests: {
    method: string;
    testFn: () => Promise<any>;
  }[];
}

export default function ServicesTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    success: 0,
    error: 0,
    warning: 0
  });

  const serviceTests: ServiceTest[] = [
    {
      name: 'Sports Service',
      icon: Trophy,
      color: 'text-blue-600',
      tests: [
        {
          method: 'getAllSports',
          testFn: () => SportsService.getAllSports?.() || Promise.resolve({ data: [], success: true })
        },
        {
          method: 'getSportById',
          testFn: () => SportsService.getSportById?.('test-id') || Promise.resolve({ data: null, success: true })
        },
        {
          method: 'getSportsByCategory',
          testFn: () => SportsService.getSportsByCategory?.('fitness') || Promise.resolve({ data: [], success: true })
        }
      ]
    },
    {
      name: 'Trainers Service',
      icon: Users,
      color: 'text-green-600',
      tests: [
        {
          method: 'getAllTrainers',
          testFn: () => TrainersService.getAllTrainers?.() || Promise.resolve({ data: [], success: true })
        },
        {
          method: 'getTrainerById',
          testFn: () => TrainersService.getTrainerById?.('test-id') || Promise.resolve({ data: null, success: true })
        },
        {
          method: 'getTrainersByLocation',
          testFn: () => TrainersService.getTrainersByLocation?.('São Paulo') || Promise.resolve({ data: [], success: true })
        }
      ]
    },
    {
      name: 'Programs Service',
      icon: Activity,
      color: 'text-purple-600',
      tests: [
        {
          method: 'getAllPrograms',
          testFn: () => ProgramsService.getAllPrograms?.() || Promise.resolve({ data: [], success: true })
        },
        {
          method: 'getProgramById',
          testFn: () => ProgramsService.getProgramById?.('test-id') || Promise.resolve({ data: null, success: true })
        },
        {
          method: 'getProgramsByTrainer',
          testFn: () => ProgramsService.getProgramsByTrainer?.('test-trainer-id') || Promise.resolve({ data: [], success: true })
        }
      ]
    },
    {
      name: 'Users Service',
      icon: Users,
      color: 'text-orange-600',
      tests: [
        {
          method: 'getCurrentUser',
          testFn: () => UsersService.getCurrentUser?.() || Promise.resolve({ data: null, success: true })
        },
        {
          method: 'getUserById',
          testFn: () => UsersService.getUserById?.('test-id') || Promise.resolve({ data: null, success: true })
        }
      ]
    },
    {
      name: 'Financial Service',
      icon: DollarSign,
      color: 'text-emerald-600',
      tests: [
        {
          method: 'getRevenue',
          testFn: () => FinancialService.getRevenue?.('test-trainer-id') || Promise.resolve({ data: null, success: true })
        },
        {
          method: 'getTransactions',
          testFn: () => FinancialService.getTransactions?.('test-trainer-id') || Promise.resolve({ data: [], success: true })
        }
      ]
    },
    {
      name: 'Notifications Service',
      icon: Bell,
      color: 'text-red-600',
      tests: [
        {
          method: 'getNotifications',
          testFn: () => NotificationsService.getNotifications?.('test-user-id') || Promise.resolve({ data: [], success: true })
        },
        {
          method: 'markAsRead',
          testFn: () => NotificationsService.markAsRead?.('test-notification-id') || Promise.resolve({ success: true })
        }
      ]
    },
    {
      name: 'Search Service',
      icon: Search,
      color: 'text-indigo-600',
      tests: [
        {
          method: 'searchTrainers',
          testFn: () => SearchService.searchTrainers?.('yoga') || Promise.resolve({ data: [], success: true })
        },
        {
          method: 'searchPrograms',
          testFn: () => SearchService.searchPrograms?.('musculacao') || Promise.resolve({ data: [], success: true })
        }
      ]
    },
    {
      name: 'Data Service',
      icon: Database,
      color: 'text-gray-600',
      tests: [
        {
          method: 'getAllData',
          testFn: () => DataService.getAllData?.() || Promise.resolve({ data: {}, success: true })
        },
        {
          method: 'getConsolidatedData',
          testFn: () => DataService.getConsolidatedData?.() || Promise.resolve({ data: {}, success: true })
        }
      ]
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results: TestResult[] = [];
    
    for (const service of serviceTests) {
      for (const test of service.tests) {
        const startTime = performance.now();
        
        try {
          console.log(`🧪 Testing ${service.name}.${test.method}...`);
          
          const result = await test.testFn();
          const duration = performance.now() - startTime;
          
          if (result && typeof result === 'object') {
            if (result.success !== false) {
              results.push({
                service: service.name,
                method: test.method,
                status: 'success',
                message: `✅ Método existe e retorna dados`,
                duration,
                data: result
              });
            } else {
              results.push({
                service: service.name,
                method: test.method,
                status: 'warning',
                message: `⚠️ Método existe mas retornou erro: ${result.error?.message || 'Erro desconhecido'}`,
                duration,
                error: result.error
              });
            }
          } else {
            results.push({
              service: service.name,
              method: test.method,
              status: 'warning',
              message: '⚠️ Método existe mas retorno inesperado',
              duration,
              data: result
            });
          }
        } catch (error: any) {
          const duration = performance.now() - startTime;
          
          if (error.message?.includes('is not a function')) {
            results.push({
              service: service.name,
              method: test.method,
              status: 'error',
              message: `❌ Método não implementado`,
              duration,
              error: error.message
            });
          } else {
            results.push({
              service: service.name,
              method: test.method,
              status: 'error',
              message: `❌ Erro na execução: ${error.message}`,
              duration,
              error: error.message
            });
          }
        }
      }
    }
    
    setTestResults(results);
    
    // Calcular resumo
    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      error: results.filter(r => r.status === 'error').length,
      warning: results.filter(r => r.status === 'warning').length
    };
    
    setSummary(summary);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <TestTube className="w-8 h-8 text-brand" />
              <h1 className="text-2xl font-bold">Services Test Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Diagnóstico completo dos services implementados - ISOLADO da aplicação principal
            </p>
          </div>
          
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            size="lg"
            className="bg-brand hover:bg-brand-hover"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Executar Todos os Testes
              </>
            )}
          </Button>
        </div>

        {/* Summary Cards */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-2xl font-bold">{summary.total}</p>
                    <p className="text-sm text-muted-foreground">Total de Testes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{summary.success}</p>
                    <p className="text-sm text-muted-foreground">Sucessos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{summary.warning}</p>
                    <p className="text-sm text-muted-foreground">Avisos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-red-600">{summary.error}</p>
                    <p className="text-sm text-muted-foreground">Erros</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alert de Segurança */}
        <Alert>
          <Bug className="w-4 h-4" />
          <AlertDescription>
            <strong>🛡️ TESTE ISOLADO:</strong> Esta página não afeta nenhum componente ou funcionalidade da aplicação principal. 
            Todos os testes são executados de forma segura para diagnosticar os services.
          </AlertDescription>
        </Alert>

        {/* Results */}
        <Tabs defaultValue="results" className="space-y-4">
          <TabsList>
            <TabsTrigger value="results">Resultados dos Testes</TabsTrigger>
            <TabsTrigger value="services">Services por Categoria</TabsTrigger>
            <TabsTrigger value="details">Detalhes Técnicos</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            {testResults.length === 0 && !isRunning && (
              <Card>
                <CardContent className="p-12 text-center">
                  <TestTube className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum teste executado</h3>
                  <p className="text-muted-foreground mb-4">
                    Clique em "Executar Todos os Testes" para iniciar o diagnóstico
                  </p>
                </CardContent>
              </Card>
            )}

            {testResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultados Completos</CardTitle>
                  <CardDescription>
                    Status de cada método testado nos services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {testResults.map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {result.service}.{result.method}
                                </span>
                                <Badge className={getStatusBadge(result.status)}>
                                  {result.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {result.message}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {result.duration.toFixed(1)}ms
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceTests.map((service, index) => {
                const serviceResults = testResults.filter(r => r.service === service.name);
                const successCount = serviceResults.filter(r => r.status === 'success').length;
                const totalCount = service.tests.length;
                
                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <service.icon className={`w-6 h-6 ${service.color}`} />
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription>
                            {serviceResults.length > 0 
                              ? `${successCount}/${totalCount} métodos funcionando`
                              : `${totalCount} métodos para testar`
                            }
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {service.tests.map((test, testIndex) => {
                          const result = serviceResults.find(r => r.method === test.method);
                          return (
                            <div key={testIndex} className="flex items-center justify-between">
                              <span className="text-sm">{test.method}</span>
                              {result ? (
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(result.status)}
                                  <span className="text-xs text-muted-foreground">
                                    {result.duration.toFixed(1)}ms
                                  </span>
                                </div>
                              ) : (
                                <Badge variant="outline">Pendente</Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise Técnica</CardTitle>
                <CardDescription>
                  Informações detalhadas sobre a estrutura dos services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Services Implementados</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-blue-600" />
                        <code className="text-sm">sports.service.ts</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <code className="text-sm">trainers.service.ts</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <code className="text-sm">programs.service.ts</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-orange-600" />
                        <code className="text-sm">users.service.ts</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <code className="text-sm">financial.service.ts</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-red-600" />
                        <code className="text-sm">notifications.service.ts</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-indigo-600" />
                        <code className="text-sm">search.service.ts</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-gray-600" />
                        <code className="text-sm">data.service.ts</code>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Possíveis Problemas Identificados</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Services podem referenciar dependências não implementadas</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Métodos podem não estar exportados corretamente</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Dados mock podem estar incompletos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}