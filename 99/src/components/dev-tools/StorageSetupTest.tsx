import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Database, 
  Upload,
  Settings,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface StorageTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp: string;
}

export const StorageSetupTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [setupResult, setSetupResult] = useState<StorageTestResult | null>(null);
  const [testResult, setTestResult] = useState<StorageTestResult | null>(null);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e547215c`;

  const runStorageSetup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/setup-storage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      setSetupResult(result);

      if (result.success) {
        toast.success('Storage setup concluído com sucesso!');
      } else {
        toast.error(`Erro no setup: ${result.error}`);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Falha na conexão com o servidor',
        timestamp: new Date().toISOString()
      };
      setSetupResult(errorResult);
      toast.error('Erro na conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const runUploadTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/test-avatar-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      setTestResult(result);

      if (result.success) {
        toast.success('Teste de upload realizado com sucesso!');
      } else {
        toast.error(`Erro no teste: ${result.error}`);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Falha no teste de upload',
        timestamp: new Date().toISOString()
      };
      setTestResult(errorResult);
      toast.error('Erro no teste de upload');
    } finally {
      setIsLoading(false);
    }
  };

  const resetTests = () => {
    setSetupResult(null);
    setTestResult(null);
    toast.info('Testes resetados');
  };

  const getStatusIcon = (result: StorageTestResult | null) => {
    if (!result) return <AlertCircle className="h-5 w-5 text-gray-400" />;
    return result.success ? 
      <CheckCircle className="h-5 w-5 text-green-600" /> : 
      <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusBadge = (result: StorageTestResult | null) => {
    if (!result) return <Badge variant="secondary">Não testado</Badge>;
    return result.success ? 
      <Badge className="bg-green-100 text-green-800">Sucesso</Badge> : 
      <Badge variant="destructive">Erro</Badge>;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Setup de Storage - Teste e Diagnóstico
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Ferramenta para configurar e testar os buckets de storage quando você não tem 
          permissões de owner para executar o SQL diretamente.
        </p>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Instruções de Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-800">
          <div className="text-sm space-y-2">
            <p><strong>1.</strong> Execute o "Setup de Storage" para criar os buckets automaticamente</p>
            <p><strong>2.</strong> Execute o "Teste de Upload" para verificar se tudo está funcionando</p>
            <p><strong>3.</strong> Se houver erros, verifique as permissões no Supabase Dashboard</p>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded">
            <p className="text-sm font-medium">💡 Alternativa Manual:</p>
            <p className="text-xs mt-1">
              Se os testes falharem, execute o script: <code>/scripts/setup-avatar-buckets-simplified.sql</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button
          onClick={runStorageSetup}
          disabled={isLoading}
          className="h-20 flex flex-col gap-2 bg-brand hover:bg-brand-hover"
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Database className="h-6 w-6" />
          )}
          <span>Setup de Storage</span>
        </Button>

        <Button
          onClick={runUploadTest}
          disabled={isLoading}
          className="h-20 flex flex-col gap-2"
          variant="outline"
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
          <span>Teste de Upload</span>
        </Button>

        <Button
          onClick={resetTests}
          disabled={isLoading}
          className="h-20 flex flex-col gap-2"
          variant="secondary"
        >
          <RefreshCw className="h-6 w-6" />
          <span>Reset Testes</span>
        </Button>
      </div>

      {/* Results */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Setup Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {getStatusIcon(setupResult)}
                Setup de Storage
              </span>
              {getStatusBadge(setupResult)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {setupResult ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {setupResult.message}
                  </p>
                  {setupResult.error && (
                    <p className="text-red-600 mt-1">
                      Erro: {setupResult.error}
                    </p>
                  )}
                </div>
                
                {setupResult.data && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
                    <p className="font-medium mb-2">Detalhes:</p>
                    <ul className="space-y-1">
                      <li>Buckets criados: {setupResult.data.bucketsCount}/3</li>
                      <li>Status: {setupResult.data.isComplete ? '✅ Completo' : '⚠️ Incompleto'}</li>
                      {setupResult.data.buckets?.map((bucket: any, i: number) => (
                        <li key={i}>• {bucket.name} ({bucket.public ? 'público' : 'privado'})</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  {new Date(setupResult.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Clique em "Setup de Storage" para iniciar a configuração
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upload Test Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {getStatusIcon(testResult)}
                Teste de Upload
              </span>
              {getStatusBadge(testResult)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResult ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {testResult.message}
                  </p>
                  {testResult.error && (
                    <p className="text-red-600 mt-1">
                      Erro: {testResult.error}
                    </p>
                  )}
                </div>
                
                {testResult.data && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
                    <p className="font-medium mb-2">Detalhes do teste:</p>
                    <ul className="space-y-1">
                      <li>Arquivo: {testResult.data.path}</li>
                      <li>URL gerada: {testResult.data.url ? '✅ Sim' : '❌ Não'}</li>
                      <li>Nota: {testResult.data.note}</li>
                    </ul>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  {new Date(testResult.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Execute o teste para verificar se o upload está funcionando
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      {setupResult?.success && testResult?.success && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Sistema Pronto!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-800">
            <p className="text-sm mb-3">
              ✅ Os buckets foram criados e testados com sucesso. Seu sistema de avatar está funcionando!
            </p>
            <div className="text-xs space-y-1">
              <p><strong>Próximos passos:</strong></p>
              <p>• Use o componente <code>UserAvatarManager</code> em suas páginas</p>
              <p>• Configure políticas RLS no Supabase Dashboard se necessário</p>
              <p>• Teste o sistema de avatar nos dashboards de trainer e client</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-gray-700 text-sm">Informações de Debug</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-600 space-y-1">
          <p>Projeto ID: <code>{projectId}</code></p>
          <p>Base URL: <code>{baseUrl}</code></p>
          <p>Buckets esperados: make-e547215c-avatars, make-e547215c-trainer-assets, make-e547215c-documents</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageSetupTest;