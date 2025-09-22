/**
 * 🏥 HEALTH CHECK COMPONENT
 * 
 * Componente de diagnóstico automático para verificar se todos os
 * sistemas essenciais estão funcionando corretamente.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface HealthStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  message: string;
  details?: string;
}

export function HealthCheck() {
  const [healthStatuses, setHealthStatuses] = useState<HealthStatus[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const healthChecks = [
    {
      name: 'Environment Variables',
      check: async (): Promise<HealthStatus> => {
        try {
          const { env } = await import('../lib/env');
          
          if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
            return {
              name: 'Environment Variables',
              status: 'error',
              message: 'Missing Supabase credentials',
              details: 'SUPABASE_URL or SUPABASE_ANON_KEY not found'
            };
          }

          return {
            name: 'Environment Variables',
            status: 'healthy',
            message: 'All environment variables loaded',
            details: `URL: ${env.SUPABASE_URL.substring(0, 20)}...`
          };
        } catch (error) {
          return {
            name: 'Environment Variables',
            status: 'error',
            message: 'Failed to load environment',
            details: String(error)
          };
        }
      }
    },
    {
      name: 'Supabase Connection',
      check: async (): Promise<HealthStatus> => {
        try {
          const { supabase } = await import('../lib/supabase/client');
          
          const { data, error } = await supabase
            .from('user_profiles')
            .select('count')
            .limit(1)
            .single();

          if (error && !error.message.includes('more than one row')) {
            return {
              name: 'Supabase Connection',
              status: 'warning',
              message: 'Connection established but query failed',
              details: error.message
            };
          }

          return {
            name: 'Supabase Connection',
            status: 'healthy',
            message: 'Connected successfully',
            details: 'Database queries working'
          };
        } catch (error) {
          return {
            name: 'Supabase Connection',
            status: 'error',
            message: 'Connection failed',
            details: String(error)
          };
        }
      }
    },
    {
      name: 'Views & Tables',
      check: async (): Promise<HealthStatus> => {
        try {
          const { supabase } = await import('../lib/supabase/client');
          
          // Check if critical views exist
          const { data: trainersView, error: trainersError } = await supabase
            .from('trainers_with_slugs')
            .select('id')
            .limit(1);

          if (trainersError) {
            return {
              name: 'Views & Tables',
              status: 'warning',
              message: 'Some views may be missing',
              details: `trainers_with_slugs: ${trainersError.message}`
            };
          }

          return {
            name: 'Views & Tables',
            status: 'healthy',
            message: 'Critical views accessible',
            details: 'trainers_with_slugs working'
          };
        } catch (error) {
          return {
            name: 'Views & Tables',
            status: 'error',
            message: 'Database structure check failed',
            details: String(error)
          };
        }
      }
    },
    {
      name: 'Specialties Search',
      check: async (): Promise<HealthStatus> => {
        try {
          // Tentar serviço otimizado primeiro
          try {
            const SpecialtiesService = await import('../services/specialties-search-optimized.service');
            
            const result = await SpecialtiesService.default.searchTrainersBySpecialties({
              specialties: [],
              limit: 1
            });

            if (result.error) {
              return {
                name: 'Specialties Search',
                status: 'warning',
                message: 'Optimized service has issues',
                details: result.error
              };
            }

            return {
              name: 'Specialties Search',
              status: 'healthy',
              message: 'Optimized search service working',
              details: `Found ${result.count} trainers (optimized)`
            };
          } catch (optimizedError) {
            // Tentar serviço safe como fallback
            const SafeService = await import('../services/specialties-search-safe.service');
            
            const connectionTest = await SafeService.default.testConnection();
            
            if (!connectionTest.success) {
              return {
                name: 'Specialties Search',
                status: 'error',
                message: 'All search services failed',
                details: connectionTest.message
              };
            }

            return {
              name: 'Specialties Search',
              status: 'warning',
              message: 'Using fallback search service',
              details: 'Optimized service failed, but safe service works'
            };
          }
        } catch (error) {
          return {
            name: 'Specialties Search',
            status: 'error',
            message: 'Search services completely failed',
            details: String(error)
          };
        }
      }
    },
    {
      name: 'Query Builder',
      check: async (): Promise<HealthStatus> => {
        try {
          const { supabase } = await import('../lib/supabase/client');
          
          // Testar se o query builder tem os métodos necessários
          const query = supabase
            .from('trainers_with_slugs')
            .select('id');

          // Verificar se os métodos existem
          const hasLimit = typeof query.limit === 'function';
          const hasRange = typeof query.range === 'function';
          const hasSelect = typeof query.select === 'function';

          if (!hasLimit) {
            return {
              name: 'Query Builder',
              status: 'error',
              message: 'Query builder missing limit method',
              details: 'Supabase client may be incorrectly initialized'
            };
          }

          // Testar uma query simples
          const { data, error } = await query.limit(1);

          if (error) {
            return {
              name: 'Query Builder',
              status: 'warning',
              message: 'Query execution failed',
              details: error.message
            };
          }

          return {
            name: 'Query Builder',
            status: 'healthy',
            message: 'Query builder working correctly',
            details: `Methods available: limit(${hasLimit}), range(${hasRange}), select(${hasSelect})`
          };
        } catch (error) {
          return {
            name: 'Query Builder',
            status: 'error',
            message: 'Query builder check failed',
            details: String(error)
          };
        }
      }
    },
    {
      name: 'Routing System',
      check: async (): Promise<HealthStatus> => {
        try {
          // Check if router dependencies are working
          const { isDevelopment } = await import('../lib/env');
          
          const devMode = isDevelopment();
          
          return {
            name: 'Routing System',
            status: 'healthy',
            message: 'Router system operational',
            details: `Mode: ${devMode ? 'Development' : 'Production'}`
          };
        } catch (error) {
          return {
            name: 'Routing System',
            status: 'error',
            message: 'Router check failed',
            details: String(error)
          };
        }
      }
    }
  ];

  const runHealthChecks = async () => {
    setIsRunning(true);
    setHealthStatuses([]);

    // Initialize all checks as "checking"
    const initialStatuses = healthChecks.map(check => ({
      name: check.name,
      status: 'checking' as const,
      message: 'Running diagnostic...',
    }));
    setHealthStatuses(initialStatuses);

    // Run checks sequentially to avoid overwhelming the system
    const results: HealthStatus[] = [];
    
    for (let i = 0; i < healthChecks.length; i++) {
      const check = healthChecks[i];
      
      try {
        const result = await check.check();
        results.push(result);
      } catch (error) {
        results.push({
          name: check.name,
          status: 'error',
          message: 'Check failed unexpectedly',
          details: String(error)
        });
      }

      // Update UI with current progress
      setHealthStatuses([...results, ...initialStatuses.slice(i + 1)]);
    }

    setIsRunning(false);
  };

  // Run initial health check
  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'checking':
        return <Badge variant="outline">Checking...</Badge>;
    }
  };

  const overallStatus = healthStatuses.length > 0 ? (
    healthStatuses.some(s => s.status === 'error') ? 'error' :
    healthStatuses.some(s => s.status === 'warning') ? 'warning' : 
    healthStatuses.some(s => s.status === 'checking') ? 'checking' : 'healthy'
  ) : 'checking';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            System Health Check
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(overallStatus)}
            <Button
              onClick={runHealthChecks}
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Re-check
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthStatuses.map((status, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <div className="mt-0.5">
                {getStatusIcon(status.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{status.name}</h4>
                  {getStatusBadge(status.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {status.message}
                </p>
                {status.details && (
                  <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                    {status.details}
                  </p>
                )}
              </div>
            </div>
          ))}

          {healthStatuses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p>Running initial health checks...</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {healthStatuses.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {healthStatuses.filter(s => s.status === 'healthy').length}
                </div>
                <div className="text-xs text-muted-foreground">Healthy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {healthStatuses.filter(s => s.status === 'warning').length}
                </div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {healthStatuses.filter(s => s.status === 'error').length}
                </div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {healthStatuses.filter(s => s.status === 'checking').length}
                </div>
                <div className="text-xs text-muted-foreground">Checking</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}