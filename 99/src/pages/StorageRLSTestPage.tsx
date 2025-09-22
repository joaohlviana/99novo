import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, FileUp, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface PolicyCheck {
  name: string;
  exists: boolean;
  details?: any;
}

interface TestResult {
  operation: string;
  icon: React.ReactNode;
  success: boolean;
  message: string;
  details?: string;
}

export default function StorageRLSTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [policies, setPolicies] = useState<PolicyCheck[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [storageTests, setStorageTests] = useState<TestResult[]>([]);

  // Using the singleton supabase instance

  useEffect(() => {
    checkAuthStatus();
    checkPolicies();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        setAuthStatus('authenticated');
        setUserInfo(session.user);
      } else {
        setAuthStatus('unauthenticated');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthStatus('unauthenticated');
    }
  };

  const checkPolicies = async () => {
    try {
      setIsLoading(true);
      
      // Verificar políticas RLS via servidor
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e547215c/storage/check-policies`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies || []);
      } else {
        console.warn('Could not check policies via server');
        // Fallback: verificar algumas políticas básicas
        setPolicies([
          { name: 'make_users_upload', exists: false },
          { name: 'make_users_view', exists: false },
          { name: 'make_users_update', exists: false },
          { name: 'make_users_delete', exists: false }
        ]);
      }
    } catch (error) {
      console.error('Error checking policies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInTestUser = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'test123456'
      });

      if (error) throw error;
      
      setAuthStatus('authenticated');
      setUserInfo(data.user);
      
      return { success: true, message: 'Login realizado com sucesso' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const runStorageTests = async () => {
    if (authStatus !== 'authenticated') {
      setStorageTests([{
        operation: 'Authentication Required',
        icon: <AlertCircle className="w-4 h-4" />,
        success: false,
        message: 'Usuário deve estar autenticado para testar storage'
      }]);
      return;
    }

    setIsLoading(true);
    const results: TestResult[] = [];

    try {
      // Test 1: Verificar se buckets existem
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      const requiredBuckets = ['make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents'];
      const existingBuckets = buckets?.map(b => b.name) || [];
      
      for (const bucketName of requiredBuckets) {
        const exists = existingBuckets.includes(bucketName);
        results.push({
          operation: `Bucket: ${bucketName}`,
          icon: exists ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />,
          success: exists,
          message: exists ? 'Bucket existe' : 'Bucket não encontrado'
        });
      }

      // Test 2: Tentar upload de arquivo de teste
      const testFile = new File(['test content'], 'test-rls.txt', { type: 'text/plain' });
      const testPath = `${userInfo?.id}/test-rls-${Date.now()}.txt`;

      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('make-e547215c-avatars')
          .upload(testPath, testFile);

        if (uploadError) throw uploadError;

        results.push({
          operation: 'Upload Test',
          icon: <FileUp className="w-4 h-4" />,
          success: true,
          message: 'Upload realizado com sucesso',
          details: `Arquivo: ${uploadData.path}`
        });

        // Test 3: Tentar listar arquivos
        try {
          const { data: listData, error: listError } = await supabase.storage
            .from('make-e547215c-avatars')
            .list(userInfo?.id);

          if (listError) throw listError;

          results.push({
            operation: 'List Files Test',
            icon: <Eye className="w-4 h-4" />,
            success: true,
            message: `${listData.length} arquivo(s) encontrado(s)`,
            details: `Pasta: ${userInfo?.id}`
          });

          // Test 4: Tentar deletar arquivo de teste
          try {
            const { error: deleteError } = await supabase.storage
              .from('make-e547215c-avatars')
              .remove([testPath]);

            if (deleteError) throw deleteError;

            results.push({
              operation: 'Delete Test',
              icon: <Trash2 className="w-4 h-4" />,
              success: true,
              message: 'Arquivo deletado com sucesso'
            });
          } catch (deleteError: any) {
            results.push({
              operation: 'Delete Test',
              icon: <XCircle className="w-4 h-4" />,
              success: false,
              message: 'Erro ao deletar arquivo',
              details: deleteError.message
            });
          }

        } catch (listError: any) {
          results.push({
            operation: 'List Files Test',
            icon: <XCircle className="w-4 h-4" />,
            success: false,
            message: 'Erro ao listar arquivos',
            details: listError.message
          });
        }

      } catch (uploadError: any) {
        results.push({
          operation: 'Upload Test',
          icon: <XCircle className="w-4 h-4" />,
          success: false,
          message: 'Erro no upload',
          details: uploadError.message
        });
      }

    } catch (error: any) {
      results.push({
        operation: 'Storage Connection',
        icon: <XCircle className="w-4 h-4" />,
        success: false,
        message: 'Erro na conexão com storage',
        details: error.message
      });
    }

    setStorageTests(results);
    setIsLoading(false);
  };

  const getPolicyStatusBadge = (exists: boolean) => {
    return exists ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Ativa
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Ausente
      </Badge>
    );
  };

  const allPoliciesActive = policies.length > 0 && policies.every(p => p.exists);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Storage RLS Test</h1>
        <p className="text-muted-foreground">
          Teste das políticas RLS do Supabase Storage
        </p>
      </div>

      {/* Status de Autenticação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              authStatus === 'authenticated' ? 'bg-green-500' : 
              authStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            Status de Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {authStatus === 'checking' && (
            <p className="text-muted-foreground">Verificando autenticação...</p>
          )}
          
          {authStatus === 'unauthenticated' && (
            <div className="space-y-4">
              <p className="text-red-600">Usuário não autenticado</p>
              <Button onClick={signInTestUser} variant="outline">
                Fazer Login (test@example.com)
              </Button>
            </div>
          )}
          
          {authStatus === 'authenticated' && userInfo && (
            <div className="space-y-2">
              <p className="text-green-600">Usuário autenticado</p>
              <div className="text-sm text-muted-foreground">
                <p><strong>ID:</strong> {userInfo.id}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status das Políticas RLS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${allPoliciesActive ? 'bg-green-500' : 'bg-red-500'}`} />
            Políticas RLS do Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Verificando políticas...</p>
          ) : (
            <div className="space-y-3">
              {policies.map((policy, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{policy.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Política de {policy.name.split('_')[2]} para storage
                    </p>
                  </div>
                  {getPolicyStatusBadge(policy.exists)}
                </div>
              ))}
              
              {policies.length === 0 && (
                <p className="text-muted-foreground">Nenhuma política encontrada</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testes de Storage */}
      <Card>
        <CardHeader>
          <CardTitle>Testes de Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runStorageTests} 
            disabled={isLoading || authStatus !== 'authenticated'}
            className="w-full"
          >
            {isLoading ? 'Executando testes...' : 'Executar Testes de Storage'}
          </Button>

          {storageTests.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <h3 className="font-medium">Resultados dos Testes:</h3>
              {storageTests.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`${result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {result.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{result.operation}</p>
                    <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.message}
                    </p>
                    {result.details && (
                      <p className="text-xs text-muted-foreground">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!allPoliciesActive && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-medium text-yellow-800 mb-2">⚠️ Políticas RLS não configuradas</p>
              <p className="text-sm text-yellow-700">
                Execute as instruções em <code>/scripts/setup-rls-policies-dashboard.md</code> para configurar as políticas RLS através do Supabase Dashboard.
              </p>
            </div>
          )}
          
          {allPoliciesActive && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-800 mb-2">✅ Sistema configurado</p>
              <p className="text-sm text-green-700">
                Todas as políticas RLS estão ativas. O sistema de upload de avatares deve estar funcionando corretamente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}