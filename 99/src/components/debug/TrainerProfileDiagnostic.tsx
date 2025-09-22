/**
 * 🔍 TRAINER PROFILE DIAGNOSTIC
 * 
 * Componente para diagnosticar problemas de carregamento de perfil
 */

import React, { useState, useEffect } from 'react';
import { identifierResolverService } from '../../services/identifier-resolver.service';
import { trainerProfileIntegrationService } from '../../services/trainer-profile-integration.service';
import { supabase } from '../../lib/supabase/client';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface DiagnosticResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export function TrainerProfileDiagnostic() {
  const [results, setResults] = useState<Record<string, DiagnosticResult>>({});
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostic = async () => {
    setIsLoading(true);
    const diagnosticResults: Record<string, DiagnosticResult> = {};

    try {
      // 1. Verificar conexão com Supabase
      console.log('🔍 1. Testando conexão Supabase...');
      try {
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
        diagnosticResults.supabase = {
          success: !error,
          message: error ? `Erro de conexão: ${error.message}` : 'Conexão funcionando',
          data: data
        };
      } catch (error: any) {
        diagnosticResults.supabase = {
          success: false,
          message: `Erro de conexão: ${error.message}`,
          error: error.message
        };
      }

      // 2. Verificar se a view trainers_with_slugs existe e tem dados
      console.log('🔍 2. Verificando view trainers_with_slugs...');
      try {
        const viewCheck = await identifierResolverService.checkViewData();
        diagnosticResults.view = {
          success: viewCheck.hasData,
          message: `View tem ${viewCheck.count} registros`,
          data: viewCheck
        };
      } catch (error: any) {
        diagnosticResults.view = {
          success: false,
          message: `Erro ao acessar view: ${error.message}`,
          error: error.message
        };
      }

      // 3. Verificar dados na tabela user_profiles para trainers
      console.log('🔍 3. Verificando trainers na user_profiles...');
      try {
        const { data, error, count } = await supabase
          .from('user_profiles')
          .select('id,user_id,name,slug,role', { count: 'exact' })
          .eq('role', 'trainer')
          .limit(5);

        diagnosticResults.userProfiles = {
          success: !error && count && count > 0,
          message: `Encontrados ${count} trainers na user_profiles`,
          data: { count, sample: data?.slice(0, 3) }
        };
      } catch (error: any) {
        diagnosticResults.userProfiles = {
          success: false,
          message: `Erro ao buscar trainers: ${error.message}`,
          error: error.message
        };
      }

      // 4. Testar resolução de um slug específico
      console.log('🔍 4. Testando resolução de identificador...');
      try {
        // Pegar um trainer da lista anterior para testar
        if (diagnosticResults.userProfiles.data?.sample?.length > 0) {
          const sampleTrainer = diagnosticResults.userProfiles.data.sample[0];
          const testIdentifier = sampleTrainer.slug || sampleTrainer.user_id;
          
          if (testIdentifier) {
            const resolveResult = await identifierResolverService.resolveTrainer(testIdentifier);
            diagnosticResults.resolve = {
              success: resolveResult.success,
              message: resolveResult.success 
                ? `Resolvido com sucesso via ${resolveResult.resolveMethod}`
                : `Falha: ${resolveResult.error}`,
              data: resolveResult
            };
          } else {
            diagnosticResults.resolve = {
              success: false,
              message: 'Nenhum identificador válido encontrado para teste'
            };
          }
        } else {
          diagnosticResults.resolve = {
            success: false,
            message: 'Nenhum trainer encontrado para testar resolução'
          };
        }
      } catch (error: any) {
        diagnosticResults.resolve = {
          success: false,
          message: `Erro na resolução: ${error.message}`,
          error: error.message
        };
      }

      // 5. Testar serviço de integração
      console.log('🔍 5. Testando serviço de integração...');
      try {
        if (diagnosticResults.userProfiles.data?.sample?.length > 0) {
          const sampleTrainer = diagnosticResults.userProfiles.data.sample[0];
          const unifiedResult = await trainerProfileIntegrationService.getUnifiedTrainer(sampleTrainer.user_id);
          
          diagnosticResults.integration = {
            success: !!unifiedResult,
            message: unifiedResult 
              ? `Perfil unificado carregado para ${unifiedResult.name}`
              : 'Nenhum perfil unificado encontrado',
            data: unifiedResult ? {
              name: unifiedResult.name,
              avatar: unifiedResult.avatar,
              specialties: unifiedResult.specialties?.length || 0
            } : null
          };
        } else {
          diagnosticResults.integration = {
            success: false,
            message: 'Nenhum trainer disponível para teste de integração'
          };
        }
      } catch (error: any) {
        diagnosticResults.integration = {
          success: false,
          message: `Erro no serviço de integração: ${error.message}`,
          error: error.message
        };
      }

      // 6. Verificar métricas de telemetria
      console.log('🔍 6. Verificando telemetria...');
      try {
        const metrics = identifierResolverService.getTelemetryMetrics();
        diagnosticResults.telemetry = {
          success: true,
          message: `${metrics.totalResolves} resoluções, ${metrics.successRate.toFixed(1)}% sucesso`,
          data: metrics
        };
      } catch (error: any) {
        diagnosticResults.telemetry = {
          success: false,
          message: `Erro na telemetria: ${error.message}`,
          error: error.message
        };
      }

    } catch (error: any) {
      console.error('❌ Erro geral no diagnóstico:', error);
    }

    setResults(diagnosticResults);
    setIsLoading(false);
  };

  const getStatusIcon = (result: DiagnosticResult) => {
    if (result.success) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getOverallStatus = () => {
    const testResults = Object.values(results);
    if (testResults.length === 0) return 'pending';
    
    const successes = testResults.filter(r => r.success).length;
    const total = testResults.length;
    
    if (successes === total) return 'success';
    if (successes === 0) return 'error';
    return 'warning';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {overallStatus === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
            {overallStatus === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            {overallStatus === 'warning' && <AlertTriangle className="h-6 w-6 text-yellow-500" />}
            {overallStatus === 'pending' && <AlertTriangle className="h-6 w-6 text-gray-500" />}
            Diagnóstico do Sistema de Perfis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runDiagnostic} 
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executando Diagnóstico...
              </>
            ) : (
              'Executar Diagnóstico'
            )}
          </Button>

          {Object.keys(results).length > 0 && (
            <div className="space-y-4">
              {Object.entries(results).map(([test, result]) => (
                <Alert key={test} className={result.success ? 'border-green-200' : 'border-red-200'}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result)}
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {test === 'supabase' && 'Conexão Supabase'}
                        {test === 'view' && 'View trainers_with_slugs'}
                        {test === 'userProfiles' && 'Tabela user_profiles'}
                        {test === 'resolve' && 'Resolução de Identificador'}
                        {test === 'integration' && 'Serviço de Integração'}
                        {test === 'telemetry' && 'Telemetria'}
                      </h4>
                      <AlertDescription>
                        {result.message}
                      </AlertDescription>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-sm text-gray-600 cursor-pointer">
                            Ver dados (clique para expandir)
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {overallStatus === 'error' && (
        <Alert className="border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Problemas críticos detectados!</strong>
            <br />
            O sistema de perfis não está funcionando corretamente. Verifique os erros acima e:
            <ul className="mt-2 ml-4 list-disc">
              <li>Confirme se as migrações SQL foram executadas</li>
              <li>Verifique se a view trainers_with_slugs existe</li>
              <li>Confirme se há dados de trainers na user_profiles</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {overallStatus === 'warning' && (
        <Alert className="border-yellow-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Alguns problemas detectados.</strong>
            <br />
            O sistema pode estar funcionando parcialmente. Alguns recursos podem não estar disponíveis.
          </AlertDescription>
        </Alert>
      )}

      {overallStatus === 'success' && (
        <Alert className="border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Sistema funcionando corretamente!</strong>
            <br />
            Todos os testes passaram. O sistema de perfis está operacional.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}