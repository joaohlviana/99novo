/**
 * DEBUGGER DE PROGRAMAS - DIAGNÓSTICO COMPLETO
 * ============================================
 * Componente para diagnosticar por que os programas não aparecem
 * para usuários não logados
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { createClient } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { unifiedProgramsService } from '../../services/unified-programs.service';
import { CheckCircle, XCircle, AlertCircle, Loader2, User, UserX } from 'lucide-react';

interface DebugResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  data?: any;
}

export function ProgramsDebugger() {
  const { user, isAuthenticated } = useAuth();
  const [results, setResults] = useState<DebugResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const addResult = (result: DebugResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    clearResults();

    // Teste 1: Status de autenticação
    addResult({
      test: 'Status de Autenticação',
      status: 'success',
      message: isAuthenticated ? `Usuário logado: ${user?.email}` : 'Usuário não logado',
      data: { isAuthenticated, userId: user?.id, email: user?.email }
    });

    // Teste 2: Conectividade com Supabase
    try {
      const supabase = createClient();
      const { data: healthCheck, error } = await supabase
        .from('99_training_programs')
        .select('id')
        .limit(1);
      
      if (error) {
        addResult({
          test: 'Conectividade Supabase',
          status: 'error',
          message: `Erro de conectividade: ${error.message}`,
          data: error
        });
      } else {
        addResult({
          test: 'Conectividade Supabase',
          status: 'success',
          message: 'Conexão com Supabase funcionando'
        });
      }
    } catch (error) {
      addResult({
        test: 'Conectividade Supabase',
        status: 'error',
        message: `Erro crítico: ${error.message}`,
        data: error
      });
    }

    // Teste 3: Query direta na tabela de programas
    try {
      const supabase = createClient();
      const { data: programs, error } = await supabase
        .from('99_training_programs')
        .select('id, title, is_published, trainer_id, created_at')
        .eq('is_published', true)
        .limit(10);
      
      if (error) {
        addResult({
          test: 'Query Direta - Programas Publicados',
          status: 'error',
          message: `Erro na query: ${error.message}`,
          data: error
        });
      } else if (!programs || programs.length === 0) {
        addResult({
          test: 'Query Direta - Programas Publicados',
          status: 'warning',
          message: 'Nenhum programa publicado encontrado',
          data: { count: 0 }
        });
      } else {
        addResult({
          test: 'Query Direta - Programas Publicados',
          status: 'success',
          message: `${programs.length} programas encontrados`,
          data: { count: programs.length, programs: programs.slice(0, 3) }
        });
      }
    } catch (error) {
      addResult({
        test: 'Query Direta - Programas Publicados',
        status: 'error',
        message: `Erro crítico: ${error.message}`,
        data: error
      });
    }

    // Teste 4: Query sem filtro de publicação
    try {
      const supabase = createClient();
      const { data: allPrograms, error } = await supabase
        .from('99_training_programs')
        .select('id, title, is_published, trainer_id')
        .limit(10);
      
      if (error) {
        addResult({
          test: 'Query Direta - Todos os Programas',
          status: 'error',
          message: `Erro na query: ${error.message}`,
          data: error
        });
      } else {
        const publishedCount = allPrograms?.filter(p => p.is_published).length || 0;
        const unpublishedCount = allPrograms?.filter(p => !p.is_published).length || 0;
        
        addResult({
          test: 'Query Direta - Todos os Programas',
          status: allPrograms?.length > 0 ? 'success' : 'warning',
          message: `Total: ${allPrograms?.length || 0} (${publishedCount} publicados, ${unpublishedCount} não publicados)`,
          data: { total: allPrograms?.length, published: publishedCount, unpublished: unpublishedCount }
        });
      }
    } catch (error) {
      addResult({
        test: 'Query Direta - Todos os Programas',
        status: 'error',
        message: `Erro crítico: ${error.message}`,
        data: error
      });
    }

    // Teste 5: Serviço unificado
    try {
      const { data: servicePrograms, error: serviceError } = await unifiedProgramsService.getPublicPrograms({}, 10);
      
      if (serviceError) {
        addResult({
          test: 'Serviço Unificado',
          status: 'error',
          message: `Erro no serviço: ${serviceError.message}`,
          data: serviceError
        });
      } else if (!servicePrograms || servicePrograms.length === 0) {
        addResult({
          test: 'Serviço Unificado',
          status: 'warning',
          message: 'Serviço retornou array vazio',
          data: { programs: servicePrograms }
        });
      } else {
        addResult({
          test: 'Serviço Unificado',
          status: 'success',
          message: `Serviço retornou ${servicePrograms.length} programas`,
          data: { count: servicePrograms.length, sample: servicePrograms.slice(0, 2) }
        });
      }
    } catch (error) {
      addResult({
        test: 'Serviço Unificado',
        status: 'error',
        message: `Erro crítico: ${error.message}`,
        data: error
      });
    }

    // Teste 6: Teste de RLS policies
    try {
      // Testar como usuário anônimo
      const supabase = createClient();
      
      // Primeiro, fazer signOut para garantir que estamos anônimos
      await supabase.auth.signOut();
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: anonPrograms, error: anonError } = await supabase
        .from('99_training_programs')
        .select('id, title, is_published')
        .eq('is_published', true)
        .limit(5);
      
      if (anonError) {
        addResult({
          test: 'Acesso Anônimo (RLS)',
          status: 'error',
          message: `RLS bloqueando usuários anônimos: ${anonError.message}`,
          data: anonError
        });
      } else {
        addResult({
          test: 'Acesso Anônimo (RLS)',
          status: 'success',
          message: `RLS permite acesso anônimo: ${anonPrograms?.length || 0} programas`,
          data: { count: anonPrograms?.length, programs: anonPrograms }
        });
      }
    } catch (error) {
      addResult({
        test: 'Acesso Anônimo (RLS)',
        status: 'error',
        message: `Erro no teste de RLS: ${error.message}`,
        data: error
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: DebugResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: DebugResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'loading':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isAuthenticated ? (
              <User className="h-5 w-5 text-green-500" />
            ) : (
              <UserX className="h-5 w-5 text-gray-500" />
            )}
            Diagnóstico de Programas
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? `Logado: ${user?.email}` : 'Usuário Anônimo'}
            </Badge>
            <Button 
              onClick={runDiagnostic} 
              disabled={isRunning}
              className="bg-[#e0093e] hover:bg-[#c40835]"
            >
              {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Resultados</TabsTrigger>
              <TabsTrigger value="data">Dados</TabsTrigger>
            </TabsList>
            
            <TabsContent value="results" className="space-y-4">
              {results.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Clique em "Executar Diagnóstico" para iniciar
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="font-medium">{result.test}</div>
                          <div className="text-sm text-gray-600 mt-1">{result.message}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="data" className="space-y-4">
              {results.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Execute o diagnóstico para ver os dados
                </div>
              ) : (
                <div className="space-y-4">
                  {results.filter(r => r.data).map((result, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-gray-50">
                      <div className="font-medium mb-2">{result.test}</div>
                      <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProgramsDebugger;