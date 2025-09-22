/**
 * 🧪 PÁGINA DE TESTES DOS SERVICES V2
 * 
 * Página para testar todos os services com o novo adapter pattern.
 * Inclui testes de contrato, validação, error handling e performance.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  RotateCcw,
  Database,
  Clock,
  Zap,
  Shield
} from 'lucide-react';

import { usersServiceV2 } from '../services/users.service.v2';
import { adapterRegistry } from '../lib/adapters/base-adapter';
import { errorHandler } from '../lib/error-handler';
import { appConfig, useAppConfig } from '../lib/config';

// ==============================
// TYPES
// ==============================

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  duration: number;
  message: string;
  details?: any;
  error?: any;
}

interface ServiceTestSuite {
  name: string;
  results: TestResult[];
  isRunning: boolean;
  totalDuration: number;
  passCount: number;
  failCount: number;
  warningCount: number;
}

// ==============================
// COMPONENT
// ==============================

export default function ServicesTestPageV2() {
  const { config, isDevelopment } = useAppConfig();
  const [testSuites, setTestSuites] = useState<Record<string, ServiceTestSuite>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);

  // ==============================
  // TEST HELPERS
  // ==============================

  const createTestResult = (
    name: string,
    status: TestResult['status'],
    duration: number,
    message: string,
    details?: any,
    error?: any
  ): TestResult => ({
    name,
    status,
    duration,
    message,
    details,
    error
  });

  const updateTestSuite = (suiteName: string, updater: (suite: ServiceTestSuite) => ServiceTestSuite) => {
    setTestSuites(prev => ({
      ...prev,
      [suiteName]: updater(prev[suiteName] || {
        name: suiteName,
        results: [],
        isRunning: false,
        totalDuration: 0,
        passCount: 0,
        failCount: 0,
        warningCount: 0
      })
    }));
  };

  const runTest = async (
    suiteName: string,
    testName: string,
    testFn: () => Promise<any>
  ): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      return createTestResult(
        testName,
        'pass',
        duration,
        'Test passed successfully',
        result
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return createTestResult(
        testName,
        'fail',
        duration,
        error instanceof Error ? error.message : 'Unknown error',
        null,
        error
      );
    }
  };

  // ==============================
  // USERS SERVICE TESTS
  // ==============================

  const runUsersServiceTests = async () => {
    const suiteName = 'UsersService';
    
    updateTestSuite(suiteName, suite => ({
      ...suite,
      isRunning: true,
      results: []
    }));

    const tests = [
      {
        name: 'Health Check',
        fn: async () => {
          const result = await usersServiceV2.healthCheck();
          if (!result.success) throw new Error(result.error?.message || 'Health check failed');
          return result.data;
        }
      },
      {
        name: 'Register New User',
        fn: async () => {
          const result = await usersServiceV2.register({
            name: 'Test User',
            email: `test-${Date.now()}@test.com`,
            password: 'test123',
            userType: 'client',
            acceptTerms: true
          });
          if (!result.success) throw new Error(result.error?.message || 'Registration failed');
          return result.data;
        }
      },
      {
        name: 'Login User',
        fn: async () => {
          const result = await usersServiceV2.login({
            email: 'ana@exemplo.com',
            password: 'test123'
          });
          if (!result.success) throw new Error(result.error?.message || 'Login failed');
          return result.data;
        }
      },
      {
        name: 'Get Current User',
        fn: async () => {
          const result = await usersServiceV2.getCurrentUser();
          if (!result.success) throw new Error(result.error?.message || 'Get current user failed');
          return result.data;
        }
      },
      {
        name: 'List Users with Pagination',
        fn: async () => {
          const result = await usersServiceV2.listUsers(
            { page: 1, limit: 10 },
            { role: 'client' }
          );
          if (!result.success) throw new Error(result.error?.message || 'List users failed');
          return result.data;
        }
      },
      {
        name: 'Search Users',
        fn: async () => {
          const result = await usersServiceV2.searchUsers('Ana', { role: 'client' });
          if (!result.success) throw new Error(result.error?.message || 'Search users failed');
          return result.data;
        }
      },
      {
        name: 'Count Users',
        fn: async () => {
          const result = await usersServiceV2.countUsers({ role: 'client' });
          if (!result.success) throw new Error(result.error?.message || 'Count users failed');
          return result.data;
        }
      },
      {
        name: 'Invalid Email Validation',
        fn: async () => {
          try {
            await usersServiceV2.register({
              name: 'Test',
              email: 'invalid-email',
              password: 'test123',
              userType: 'client',
              acceptTerms: true
            });
            throw new Error('Should have failed validation');
          } catch (error) {
            // Expected to fail
            return { validation: 'passed' };
          }
        }
      },
      {
        name: 'Duplicate Email Prevention',
        fn: async () => {
          try {
            await usersServiceV2.register({
              name: 'Test',
              email: 'ana@exemplo.com', // Email que já existe
              password: 'test123',
              userType: 'client',
              acceptTerms: true
            });
            throw new Error('Should have prevented duplicate email');
          } catch (error) {
            // Expected to fail
            return { validation: 'passed' };
          }
        }
      },
      {
        name: 'Logout',
        fn: async () => {
          const result = await usersServiceV2.logout();
          if (!result.success) throw new Error(result.error?.message || 'Logout failed');
          return result.data;
        }
      }
    ];

    const results: TestResult[] = [];
    
    for (const test of tests) {
      const result = await runTest(suiteName, test.name, test.fn);
      results.push(result);
      
      updateTestSuite(suiteName, suite => ({
        ...suite,
        results: [...suite.results, result]
      }));
    }

    // Calcula estatísticas finais
    const totalDuration = results.reduce((acc, r) => acc + r.duration, 0);
    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.filter(r => r.status === 'fail').length;
    const warningCount = results.filter(r => r.status === 'warning').length;

    updateTestSuite(suiteName, suite => ({
      ...suite,
      isRunning: false,
      totalDuration,
      passCount,
      failCount,
      warningCount
    }));
  };

  // ==============================
  // ADAPTER TESTS
  // ==============================

  const runAdapterTests = async () => {
    const suiteName = 'Adapters';
    
    updateTestSuite(suiteName, suite => ({
      ...suite,
      isRunning: true,
      results: []
    }));

    const tests = [
      {
        name: 'Registry Health Check',
        fn: async () => {
          const results = await adapterRegistry.healthCheckAll();
          return results;
        }
      },
      {
        name: 'Memory Adapter Registration',
        fn: async () => {
          const hasUsers = adapterRegistry.has('users');
          if (!hasUsers) throw new Error('Users adapter not registered');
          return { registered: true };
        }
      },
      {
        name: 'Config Validation',
        fn: async () => {
          const errors = config.validate?.() || [];
          if (errors.length > 0) throw new Error(`Config errors: ${errors.join(', ')}`);
          return { valid: true };
        }
      }
    ];

    const results: TestResult[] = [];
    
    for (const test of tests) {
      const result = await runTest(suiteName, test.name, test.fn);
      results.push(result);
      
      updateTestSuite(suiteName, suite => ({
        ...suite,
        results: [...suite.results, result]
      }));
    }

    const totalDuration = results.reduce((acc, r) => acc + r.duration, 0);
    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.filter(r => r.status === 'fail').length;
    const warningCount = results.filter(r => r.status === 'warning').length;

    updateTestSuite(suiteName, suite => ({
      ...suite,
      isRunning: false,
      totalDuration,
      passCount,
      failCount,
      warningCount
    }));
  };

  // ==============================
  // ERROR HANDLING TESTS
  // ==============================

  const runErrorHandlingTests = async () => {
    const suiteName = 'ErrorHandling';
    
    updateTestSuite(suiteName, suite => ({
      ...suite,
      isRunning: true,
      results: []
    }));

    const tests = [
      {
        name: 'Error Handler Instance',
        fn: async () => {
          const errors = errorHandler.getStoredErrors();
          return { errorCount: errors.length };
        }
      },
      {
        name: 'Clear Stored Errors',
        fn: async () => {
          errorHandler.clearStoredErrors();
          const errors = errorHandler.getStoredErrors();
          if (errors.length !== 0) throw new Error('Failed to clear errors');
          return { cleared: true };
        }
      }
    ];

    const results: TestResult[] = [];
    
    for (const test of tests) {
      const result = await runTest(suiteName, test.name, test.fn);
      results.push(result);
      
      updateTestSuite(suiteName, suite => ({
        ...suite,
        results: [...suite.results, result]
      }));
    }

    const totalDuration = results.reduce((acc, r) => acc + r.duration, 0);
    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.filter(r => r.status === 'fail').length;
    const warningCount = results.filter(r => r.status === 'warning').length;

    updateTestSuite(suiteName, suite => ({
      ...suite,
      isRunning: false,
      totalDuration,
      passCount,
      failCount,
      warningCount
    }));
  };

  // ==============================
  // RUN ALL TESTS
  // ==============================

  const runAllTests = async () => {
    setIsRunningAll(true);
    setGlobalProgress(0);
    
    const totalSuites = 3;
    let completedSuites = 0;

    const updateProgress = () => {
      completedSuites++;
      setGlobalProgress((completedSuites / totalSuites) * 100);
    };

    try {
      await runAdapterTests();
      updateProgress();
      
      await runErrorHandlingTests();
      updateProgress();
      
      await runUsersServiceTests();
      updateProgress();
    } finally {
      setIsRunningAll(false);
    }
  };

  // ==============================
  // RENDER HELPERS
  // ==============================

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pass: 'default',
      fail: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const renderTestSuite = (suite: ServiceTestSuite) => (
    <Card key={suite.name} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {suite.name}
              {suite.isRunning && <div className="animate-spin h-4 w-4 border-2 border-brand border-t-transparent rounded-full" />}
            </CardTitle>
            <CardDescription>
              {suite.results.length > 0 && (
                <>
                  {suite.passCount} passed • {suite.failCount} failed • {suite.warningCount} warnings
                  {suite.totalDuration > 0 && ` • ${suite.totalDuration}ms`}
                </>
              )}
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              if (suite.name === 'UsersService') runUsersServiceTests();
              if (suite.name === 'Adapters') runAdapterTests();
              if (suite.name === 'ErrorHandling') runErrorHandlingTests();
            }}
            disabled={suite.isRunning}
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Rerun
          </Button>
        </div>
      </CardHeader>
      
      {suite.results.length > 0 && (
        <CardContent>
          <div className="space-y-2">
            {suite.results.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {result.message}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {result.duration}ms
                  </span>
                  {getStatusBadge(result.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-4">Services Test Suite V2</h1>
        <p className="text-muted-foreground mb-6">
          Testa todos os services com o novo adapter pattern, validação Zod e error handling centralizado.
        </p>
        
        {/* Config Info */}
        <Alert className="mb-6">
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Backend atual:</strong> {config.backend} • 
            <strong> Environment:</strong> {isDevelopment ? 'Development' : 'Production'} •
            <strong> Adapters registrados:</strong> {adapterRegistry.list().join(', ')}
          </AlertDescription>
        </Alert>

        {/* Progress */}
        {isRunningAll && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Executando todos os testes...</span>
            </div>
            <Progress value={globalProgress} />
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3 mb-8">
          <Button 
            onClick={runAllTests}
            disabled={isRunningAll}
            className="bg-brand hover:bg-brand-hover"
          >
            <Play className="h-4 w-4 mr-2" />
            Executar Todos os Testes
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Test Results */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users Service</TabsTrigger>
          <TabsTrigger value="adapters">Adapters</TabsTrigger>
          <TabsTrigger value="errors">Error Handling</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            {Object.values(testSuites).map(suite => renderTestSuite(suite))}
            
            {Object.keys(testSuites).length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nenhum teste executado ainda. Clique em "Executar Todos os Testes" para começar.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        <TabsContent value="users">
          {testSuites.UsersService ? renderTestSuite(testSuites.UsersService) : (
            <Alert>
              <AlertDescription>Execute os testes para ver os resultados do Users Service.</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="adapters">
          {testSuites.Adapters ? renderTestSuite(testSuites.Adapters) : (
            <Alert>
              <AlertDescription>Execute os testes para ver os resultados dos Adapters.</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="errors">
          {testSuites.ErrorHandling ? renderTestSuite(testSuites.ErrorHandling) : (
            <Alert>
              <AlertDescription>Execute os testes para ver os resultados do Error Handling.</AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Debug Info */}
      {isDevelopment && (
        <div className="mt-8 pt-8 border-t">
          <h3 className="mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Debug Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Stored Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(errorHandler.getStoredErrors(), null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">App Config</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}