/**
 * DIAGNÓSTICO DO SISTEMA CLIENT PROFILE HÍBRIDO
 * =============================================
 * Verifica se a tabela 99_client_profile existe e está configurada corretamente
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Database,
  Eye,
  Plus,
  RefreshCw,
  FileText,
  Shield,
  Settings
} from 'lucide-react';
import { clientProfileService } from '../../services/client-profile.service';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
}

export function ClientProfileSystemDiagnostic() {
  const { user } = useAuth();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    success: 0,
    error: 0,
    warning: 0
  });

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary({ total: 0, success: 0, error: 0, warning: 0 });

    try {
      // 1. Verificar quais tabelas existem
      addResult({ test: 'Table Detection', status: 'pending', message: 'Detectando tabelas disponíveis...' });
      
      const tables = ['99_client_profile', 'client_profile', 'client_profiles'];
      const availableTables = [];
      
      for (const tableName of tables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('id', { count: 'exact', head: true })
            .limit(1);
          
          if (!error) {
            availableTables.push({
              name: tableName,
              count: data?.length || 0,
              type: tableName === '99_client_profile' ? 'Híbrida (PostgreSQL + JSONB)' : 'Legacy'
            });
          }
        } catch (err) {
          // Tabela não existe ou não é acessível
        }
      }
      
      if (availableTables.length === 0) {
        addResult({
          test: 'Table Detection',
          status: 'error',
          message: 'Nenhuma tabela de client profile encontrada',
          details: 'Scripts SQL precisam ser executados para criar as tabelas necessárias'
        });
      } else {
        const primaryTable = availableTables.find(t => t.name === '99_client_profile');
        if (primaryTable) {
          addResult({
            test: 'Table Detection',
            status: 'success',
            message: `Tabela híbrida 99_client_profile encontrada (${primaryTable.count} registros)`,
            details: `Sistema híbrido ativo. Outras tabelas: ${availableTables.filter(t => t.name !== '99_client_profile').map(t => t.name).join(', ')}`
          });
        } else {
          addResult({
            test: 'Table Detection',
            status: 'warning',
            message: `Usando tabela legacy: ${availableTables[0].name} (${availableTables[0].count} registros)`,
            details: 'Scripts SQL da tabela híbrida ainda não foram executados. Sistema funciona com fallback.'
          });
        }
      }

      // 2. Verificar RLS Policies
      addResult({ test: 'RLS Policies', status: 'pending', message: 'Verificando políticas de segurança...' });
      
      try {
        const { data, error } = await supabase
          .from('99_client_profile')
          .select('*')
          .limit(1);
        
        if (error && error.code === '42501') {
          addResult({
            test: 'RLS Policies',
            status: 'error',
            message: 'Políticas RLS muito restritivas ou incorretas',
            details: 'Erro 42501: permission denied for table'
          });
        } else {
          addResult({
            test: 'RLS Policies',
            status: 'success',
            message: 'Políticas RLS configuradas corretamente',
            details: 'Acesso autorizado à tabela'
          });
        }
      } catch (err: any) {
        addResult({
          test: 'RLS Policies',
          status: 'error',
          message: 'Erro ao verificar RLS',
          details: err.message
        });
      }

      // 3. Testar Service Layer
      addResult({ test: 'Service Layer', status: 'pending', message: 'Testando serviço ClientProfileService...' });
      
      if (!user?.id) {
        addResult({
          test: 'Service Layer',
          status: 'warning',
          message: 'Usuário não autenticado',
          details: 'Não é possível testar o serviço sem usuário logado'
        });
      } else {
        try {
          const profile = await clientProfileService.getByUserId(user.id);
          addResult({
            test: 'Service Layer',
            status: 'success',
            message: profile ? 'Perfil encontrado via service' : 'Service funcionando (perfil não existe ainda)',
            details: profile ? `Nome: ${profile.name}, Status: ${profile.status}` : 'Pronto para criar novo perfil'
          });
        } catch (err: any) {
          addResult({
            test: 'Service Layer',
            status: 'error',
            message: 'Erro no serviço ClientProfileService',
            details: err.message
          });
        }
      }

      // 4. Verificar funções RPC
      addResult({ test: 'RPC Functions', status: 'pending', message: 'Verificando funções do banco de dados...' });
      
      try {
        const { data, error } = await supabase
          .rpc('find_compatible_clients_safe', {
            trainer_specialties: ['Musculação', 'Crossfit'],
            trainer_city: 'São Paulo',
            limit_count: 5
          });
        
        if (error) {
          if (error.code === '42883') {
            addResult({
              test: 'RPC Functions',
              status: 'warning',
              message: 'Função RPC não encontrada',
              details: 'find_compatible_clients_safe não existe. Será criada durante setup.'
            });
          } else {
            addResult({
              test: 'RPC Functions',
              status: 'error',
              message: 'Erro ao executar função RPC',
              details: `${error.message} (${error.code})`
            });
          }
        } else {
          addResult({
            test: 'RPC Functions',
            status: 'success',
            message: `Função RPC funcionando (${data?.length || 0} resultados)`,
            details: 'Sistema de matchmaking operacional'
          });
        }
      } catch (err: any) {
        addResult({
          test: 'RPC Functions',
          status: 'error',
          message: 'Erro ao testar função RPC',
          details: err.message
        });
      }

      // 5. Verificar triggers
      addResult({ test: 'Database Triggers', status: 'pending', message: 'Verificando triggers automáticos...' });
      
      try {
        // Verificar se triggers de updated_at existem
        const { data, error } = await supabase
          .from('pg_trigger')
          .select('tgname')
          .ilike('tgname', '%client_profile%');
        
        if (error) {
          addResult({
            test: 'Database Triggers',
            status: 'warning',
            message: 'Não foi possível verificar triggers',
            details: 'Pode não ter permissão para acessar pg_trigger'
          });
        } else {
          const triggerCount = data?.length || 0;
          addResult({
            test: 'Database Triggers',
            status: triggerCount > 0 ? 'success' : 'warning',
            message: `${triggerCount} triggers encontrados`,
            details: triggerCount > 0 ? 'Triggers de updated_at configurados' : 'Triggers podem não estar instalados'
          });
        }
      } catch (err: any) {
        addResult({
          test: 'Database Triggers',
          status: 'warning',
          message: 'Não foi possível verificar triggers',
          details: err.message
        });
      }

      // 6. Verificar índices JSONB
      addResult({ test: 'JSONB Indexes', status: 'pending', message: 'Verificando índices de performance...' });
      
      try {
        const { data, error } = await supabase
          .from('pg_indexes')
          .select('indexname')
          .eq('tablename', '99_client_profile');
        
        if (error) {
          addResult({
            test: 'JSONB Indexes',
            status: 'warning',
            message: 'Não foi possível verificar índices',
            details: 'Pode não ter permissão para acessar pg_indexes'
          });
        } else {
          const indexCount = data?.length || 0;
          addResult({
            test: 'JSONB Indexes',
            status: indexCount >= 5 ? 'success' : 'warning',
            message: `${indexCount} índices encontrados`,
            details: indexCount >= 5 ? 'Índices de performance instalados' : 'Alguns índices podem estar faltando'
          });
        }
      } catch (err: any) {
        addResult({
          test: 'JSONB Indexes',
          status: 'warning',
          message: 'Não foi possível verificar índices',
          details: err.message
        });
      }

    } finally {
      setIsRunning(false);
      
      // Calcular resumo
      const finalResults = results.filter(r => r.status !== 'pending');
      setSummary({
        total: finalResults.length,
        success: finalResults.filter(r => r.status === 'success').length,
        error: finalResults.filter(r => r.status === 'error').length,
        warning: finalResults.filter(r => r.status === 'warning').length
      });
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sucesso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Atenção</Badge>;
      case 'pending':
        return <Badge variant="outline">Executando...</Badge>;
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const hasErrors = summary.error > 0;
  const hasWarnings = summary.warning > 0;
  const isUsingLegacy = results.some(r => r.message.includes('legacy'));
  const needsSetup = hasErrors || results.some(r => 
    r.message.includes('não existe') || 
    r.message.includes('permission denied') ||
    r.message.includes('não encontrada')
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Diagnóstico do Sistema Client Profile
        </h1>
        <p className="text-gray-600">
          Verificação completa da infraestrutura híbrida PostgreSQL + JSONB
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
            <div className="text-sm text-gray-500">Testes Executados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{summary.success}</div>
            <div className="text-sm text-gray-500">Sucessos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{summary.warning}</div>
            <div className="text-sm text-gray-500">Avisos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{summary.error}</div>
            <div className="text-sm text-gray-500">Erros</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overall */}
      {needsSetup && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>⚠️ SETUP NECESSÁRIO:</strong> O sistema precisa que alguns scripts SQL sejam executados no Supabase.</p>
              <div className="text-sm space-y-1">
                <p>Scripts a executar:</p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li><code>/scripts/99-client-profile-hybrid-FINAL.sql</code> - Criar tabela híbrida</li>
                  <li><code>/scripts/fix-permission-errors-FINAL.sql</code> - Corrigir permissões RLS</li>
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!needsSetup && isUsingLegacy && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="space-y-2">
              <p><strong>🔄 SISTEMA FUNCIONANDO EM MODO FALLBACK:</strong> O sistema está operacional usando tabelas legacy.</p>
              <div className="text-sm">
                <p>Para ativar recursos avançados, execute os scripts SQL da arquitetura híbrida.</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!needsSetup && !isUsingLegacy && hasWarnings && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Sistema funcionando com alguns avisos menores. Funcionalidade completa disponível.
          </AlertDescription>
        </Alert>
      )}

      {!needsSetup && !isUsingLegacy && !hasWarnings && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>✅ SISTEMA COMPLETAMENTE OPERACIONAL!</strong> Todos os componentes estão funcionando corretamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="flex justify-center">
        <Button 
          onClick={runDiagnostics}
          disabled={isRunning}
          className="bg-brand hover:bg-brand-hover"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executando Diagnóstico...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Executar Diagnóstico
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Resultados dos Testes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Clique em "Executar Diagnóstico" para verificar o sistema
              </div>
            )}
            
            {results.map((result, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(result.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{result.test}</h4>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 p-2 rounded">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Arquitetura</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Tabela Híbrida PostgreSQL + JSONB</li>
                <li>• Campos estruturados para dados críticos</li>
                <li>• JSONB para dados flexíveis</li>
                <li>• Row Level Security (RLS)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recursos</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Sistema de matchmaking</li>
                <li>• Índices otimizados</li>
                <li>• Triggers automáticos</li>
                <li>• Função de compatibilidade</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ClientProfileSystemDiagnostic;