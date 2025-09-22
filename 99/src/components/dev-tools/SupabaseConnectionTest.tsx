/**
 * 🔧 SUPABASE CONNECTION TEST
 * 
 * Componente para testar e validar a conexão com Supabase
 * Inclui testes de configuração, banco de dados e operações KV
 */

import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { CheckCircle, XCircle, Loader2, Database, Settings, Zap } from "lucide-react";
import { appConfig, validateConfig, logConfig } from '../../lib/config';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
  duration?: number;
}

interface ServerResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
  timestamp?: string;
}

export function SupabaseConnectionTest() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [configInfo, setConfigInfo] = useState<any>(null);

  // Initialize config info on mount
  useEffect(() => {
    logConfig(); // Log config to console
    const configErrors = validateConfig();
    setConfigInfo({
      backend: appConfig.backend,
      errors: configErrors,
      projectId,
      hasAnonKey: !!publicAnonKey
    });
  }, []);

  const updateTest = (name: string, update: Partial<TestResult>) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, ...update } : test
    ));
  };

  const addTest = (test: TestResult) => {
    setTests(prev => [...prev, test]);
  };

  const makeServerRequest = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e547215c`;
    const url = `${baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  };

  const createTestUsers = async () => {
    setIsRunning(true);
    setTests(prev => prev.filter(test => test.name !== 'Create Test Users'));

    addTest({ name: 'Create Test Users', status: 'pending', message: 'Creating test users for authentication...' });
    
    try {
      const startTime = performance.now();
      const usersResult = await makeServerRequest('/create-test-users', { method: 'POST' });
      const duration = performance.now() - startTime;
      const stats = usersResult.statistics || {};
      
      updateTest('Create Test Users', {
        status: usersResult.success ? 'success' : 'error',
        message: usersResult.success 
          ? `Users: ${stats.created || 0} created, ${stats.alreadyExists || 0} existed, ${stats.errors || 0} errors (${Math.round(duration)}ms)` 
          : `Users creation error: ${usersResult.error}`,
        data: usersResult,
        duration
      });
    } catch (error: any) {
      updateTest('Create Test Users', {
        status: 'error',
        message: `Users creation failed: ${error.message}`
      });
    }

    setIsRunning(false);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Configuration Validation
    addTest({ name: 'Config Validation', status: 'pending', message: 'Validating configuration...' });
    
    const configErrors = validateConfig();
    if (configErrors.length === 0) {
      updateTest('Config Validation', {
        status: 'success',
        message: 'Configuration is valid',
        data: { backend: appConfig.backend, supabase: !!appConfig.supabase }
      });
    } else {
      updateTest('Config Validation', {
        status: 'error',
        message: `Configuration errors: ${configErrors.join(', ')}`
      });
    }

    // Test 2: Server Health Check
    addTest({ name: 'Server Health', status: 'pending', message: 'Checking server health...' });
    
    try {
      const startTime = performance.now();
      const healthResult = await makeServerRequest('/health');
      const duration = performance.now() - startTime;
      
      updateTest('Server Health', {
        status: 'success',
        message: `Server is healthy (${Math.round(duration)}ms)`,
        data: healthResult,
        duration
      });
    } catch (error: any) {
      updateTest('Server Health', {
        status: 'error',
        message: `Server health check failed: ${error.message}`
      });
    }

    // Test 3: Database Connection
    addTest({ name: 'Database Connection', status: 'pending', message: 'Testing database connection...' });
    
    try {
      const startTime = performance.now();
      const dbResult = await makeServerRequest('/test-db');
      const duration = performance.now() - startTime;
      
      updateTest('Database Connection', {
        status: dbResult.success ? 'success' : 'error',
        message: dbResult.success 
          ? `Database connected (${Math.round(duration)}ms)` 
          : `Database error: ${dbResult.error}`,
        data: dbResult,
        duration
      });
    } catch (error: any) {
      updateTest('Database Connection', {
        status: 'error',
        message: `Database test failed: ${error.message}`
      });
    }

    // Test 4: KV Store Operations
    addTest({ name: 'KV Store', status: 'pending', message: 'Testing KV store operations...' });
    
    try {
      const startTime = performance.now();
      const kvResult = await makeServerRequest('/test-kv', { method: 'POST' });
      const duration = performance.now() - startTime;
      
      updateTest('KV Store', {
        status: kvResult.success ? 'success' : 'error',
        message: kvResult.success 
          ? `KV operations successful (${Math.round(duration)}ms)` 
          : `KV error: ${kvResult.error}`,
        data: kvResult,
        duration
      });
    } catch (error: any) {
      updateTest('KV Store', {
        status: 'error',
        message: `KV store test failed: ${error.message}`
      });
    }

    // Test 5: Seed Test Data
    addTest({ name: 'Seed Data', status: 'pending', message: 'Seeding test data...' });
    
    try {
      const startTime = performance.now();
      const seedResult = await makeServerRequest('/seed-data', { method: 'POST' });
      const duration = performance.now() - startTime;
      
      updateTest('Seed Data', {
        status: seedResult.success ? 'success' : 'error',
        message: seedResult.success 
          ? `Test data seeded (${Math.round(duration)}ms)` 
          : `Seed error: ${seedResult.error}`,
        data: seedResult,
        duration
      });
    } catch (error: any) {
      updateTest('Seed Data', {
        status: 'error',
        message: `Seed data failed: ${error.message}`
      });
    }

    // Test 6: Create Test Users
    addTest({ name: 'Create Test Users', status: 'pending', message: 'Creating test users for authentication...' });
    
    try {
      const startTime = performance.now();
      const usersResult = await makeServerRequest('/create-test-users', { method: 'POST' });
      const duration = performance.now() - startTime;
      const stats = usersResult.statistics || {};
      
      updateTest('Create Test Users', {
        status: usersResult.success ? 'success' : 'error',
        message: usersResult.success 
          ? `Users: ${stats.created || 0} created, ${stats.alreadyExists || 0} existed, ${stats.errors || 0} errors (${Math.round(duration)}ms)` 
          : `Users creation error: ${usersResult.error}`,
        data: usersResult,
        duration
      });
    } catch (error: any) {
      updateTest('Create Test Users', {
        status: 'error',
        message: `Users creation failed: ${error.message}`
      });
    }

    // Test 7: List Existing Users  
    addTest({ name: 'List Users', status: 'pending', message: 'Listing existing users...' });
    
    try {
      const startTime = performance.now();
      const listResult = await makeServerRequest('/list-users');
      const duration = performance.now() - startTime;
      
      updateTest('List Users', {
        status: listResult.success ? 'success' : 'error',
        message: listResult.success 
          ? `Found ${listResult.total} users (${listResult.testUsersCount || 0} test users) (${Math.round(duration)}ms)` 
          : `List users error: ${listResult.error}`,
        data: listResult,
        duration
      });
    } catch (error: any) {
      updateTest('List Users', {
        status: 'error',
        message: `List users failed: ${error.message}`
      });
    }

    // Test 8: Retrieve Test Data
    addTest({ name: 'Data Retrieval', status: 'pending', message: 'Retrieving test data...' });
    
    try {
      const startTime = performance.now();
      const sportsResult = await makeServerRequest('/test-data/sports');
      const trainersResult = await makeServerRequest('/test-data/trainers');
      const duration = performance.now() - startTime;
      
      updateTest('Data Retrieval', {
        status: 'success',
        message: `Data retrieved successfully (${Math.round(duration)}ms)`,
        data: {
          sports: sportsResult.data,
          trainers: trainersResult.data
        },
        duration
      });
    } catch (error: any) {
      updateTest('Data Retrieval', {
        status: 'error',
        message: `Data retrieval failed: ${error.message}`
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="secondary">Running...</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Supabase Connection Test
          </CardTitle>
          <CardDescription>
            Test and validate the Supabase integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Run All Tests
                  </>
                )}
              </Button>
              
              <Button 
                onClick={createTestUsers} 
                disabled={isRunning}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Create Test Users
              </Button>
            </div>
            
            {configInfo && (
              <div className="text-sm text-muted-foreground">
                Backend: <Badge variant="outline">{configInfo.backend}</Badge>
              </div>
            )}
          </div>

          <Separator />

          {/* Configuration Info */}
          {configInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Backend:</span>{' '}
                    <Badge variant="outline">{configInfo.backend}</Badge>
                  </div>
                  <div>
                    <span className="font-medium">Project ID:</span>{' '}
                    <code className="bg-muted px-1 rounded">{configInfo.projectId}</code>
                  </div>
                  <div>
                    <span className="font-medium">Anon Key:</span>{' '}
                    {configInfo.hasAnonKey ? (
                      <Badge variant="default" className="bg-green-500">✓ Set</Badge>
                    ) : (
                      <Badge variant="destructive">✗ Missing</Badge>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Config Errors:</span>{' '}
                    {configInfo.errors.length === 0 ? (
                      <Badge variant="default" className="bg-green-500">None</Badge>
                    ) : (
                      <Badge variant="destructive">{configInfo.errors.length}</Badge>
                    )}
                  </div>
                </div>
                
                {configInfo.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                    <p className="font-medium text-amber-800 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Configuration Issues (Figma Make):
                    </p>
                    <ul className="mt-2 text-sm text-amber-700">
                      {configInfo.errors.map((error: string, index: number) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-amber-600">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 p-2 bg-amber-100 rounded text-xs text-amber-800">
                      💡 <strong>Nota:</strong> No ambiente Figma Make, as configurações são gerenciadas automaticamente. 
                      Estes avisos não impedem o funcionamento da aplicação.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Test Results */}
          {tests.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Test Results</h3>
              {tests.map((test, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(test.status)}
                        <span className="font-medium">{test.name}</span>
                        {getStatusBadge(test.status)}
                      </div>
                      {test.duration && (
                        <span className="text-sm text-muted-foreground">
                          {Math.round(test.duration)}ms
                        </span>
                      )}
                    </div>
                    
                    <p className="mt-2 text-sm text-muted-foreground">
                      {test.message}
                    </p>
                    
                    {test.data && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium">
                          View Details
                        </summary>
                        <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {tests.length === 0 && !isRunning && (
            <div className="text-center py-8 text-muted-foreground">
              Click "Run All Tests" to start testing the Supabase connection
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}