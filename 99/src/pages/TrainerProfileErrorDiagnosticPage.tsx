/**
 * 🩺 TRAINER PROFILE ERROR DIAGNOSTIC PAGE
 * 
 * Página para diagnosticar e corrigir erros de "Trainer profile não encontrado"
 */

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, CheckCircle, RefreshCw, Bug, Database, Search } from 'lucide-react';
import { errorTracker } from '../utils/error-tracker';
import { trainerProfileIntegrationService } from '../services/trainer-profile-integration.service';
import { trainerProfileService } from '../services/trainer-profile.service';
import { trainersService } from '../services/trainers.service';

interface DiagnosticResult {
  timestamp: string;
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function TrainerProfileErrorDiagnosticPage() {
  const [errors, setErrors] = useState(errorTracker.getErrors());
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Atualizar erros em tempo real
    const unsubscribe = errorTracker.onError(() => {
      setErrors([...errorTracker.getErrors()]);
    });

    return unsubscribe;
  }, []);

  const addDiagnostic = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) => {
    const result: DiagnosticResult = {
      timestamp: new Date().toISOString(),
      test,
      status,
      message,
      details
    };

    setDiagnostics(prev => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);

    try {
      // Teste 1: Verificar service híbrido
      addDiagnostic('Service Híbrido', 'warning', 'Testando conexão com service híbrido...');
      
      try {
        const profiles = await trainerProfileService.getAll(5);
        addDiagnostic('Service Híbrido', 'success', `✅ ${profiles.length} profiles encontrados no sistema híbrido`);
      } catch (error) {
        addDiagnostic('Service Híbrido', 'error', `❌ Erro no service híbrido: ${error.message}`);
      }

      // Teste 2: Verificar service mock
      addDiagnostic('Service Mock', 'warning', 'Testando conexão com service mock...');
      
      try {
        const mockResponse = await trainersService.getTopTrainers(5);
        if (mockResponse.success) {
          addDiagnostic('Service Mock', 'success', `✅ ${mockResponse.data.length} trainers encontrados no sistema mock`);
        } else {
          addDiagnostic('Service Mock', 'error', `❌ Service mock falhou: ${mockResponse.error?.message}`);
        }
      } catch (error) {
        addDiagnostic('Service Mock', 'error', `❌ Erro no service mock: ${error.message}`);
      }

      // Teste 3: Verificar service integrado
      addDiagnostic('Service Integrado', 'warning', 'Testando service de integração...');
      
      try {
        const integrated = await trainerProfileIntegrationService.getAllTrainers(5);
        addDiagnostic('Service Integrado', 'success', 
          `✅ Total: ${integrated.total} (${integrated.hybridProfiles.length} híbridos + ${integrated.mockTrainers.length} mock)`
        );
      } catch (error) {
        addDiagnostic('Service Integrado', 'error', `❌ Erro no service integrado: ${error.message}`);
      }

      // Teste 4: Testar IDs problemáticos
      const trainerErrors = errorTracker.getErrorsByPattern('trainer profile');
      const uniqueIds = [...new Set(trainerErrors.map(e => e.context?.id).filter(Boolean))];

      if (uniqueIds.length > 0) {
        addDiagnostic('IDs Problemáticos', 'warning', `Testando ${uniqueIds.length} IDs problemáticos...`);
        
        for (const id of uniqueIds.slice(0, 3)) { // Testar apenas os primeiros 3
          try {
            const result = await trainerProfileIntegrationService.getTrainerProfile(id);
            addDiagnostic('ID Test', result.source === 'not_found' ? 'error' : 'success', 
              `ID ${id}: ${result.source}`
            );
          } catch (error) {
            addDiagnostic('ID Test', 'error', `ID ${id}: Erro - ${error.message}`);
          }
        }
      } else {
        addDiagnostic('IDs Problemáticos', 'success', '✅ Nenhum ID problemático encontrado');
      }

      // Teste 5: Verificar consistência de dados
      addDiagnostic('Consistência', 'warning', 'Verificando consistência entre sistemas...');
      
      // Simular algumas buscas comuns
      const commonTests = ['trainer-1', 'joao', 'maria'];
      let successCount = 0;
      
      for (const testId of commonTests) {
        try {
          const result = await trainerProfileIntegrationService.getUnifiedTrainer(testId);
          if (result) {
            successCount++;
          }
        } catch (error) {
          // Ignorar erros de teste
        }
      }

      addDiagnostic('Consistência', successCount > 0 ? 'success' : 'warning', 
        `${successCount}/${commonTests.length} IDs comuns funcionando`
      );

    } catch (error) {
      addDiagnostic('Sistema', 'error', `Erro geral no diagnóstico: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearErrors = () => {
    errorTracker.clearErrors();
    setErrors([]);
  };

  const trainerErrors = errors.filter(e => e.message.includes('trainer profile') || e.message.includes('TrainerProfile'));
  const report = errorTracker.generateReport();
  const suggestions = errorTracker.analyzeSuggestions();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Bug className="h-8 w-8 text-red-500" />
            Diagnóstico de Erros - Trainer Profiles
          </h1>
          <p className="text-gray-600">
            Identifica e corrige problemas de "Trainer profile não encontrado"
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Erros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{errors.length}</div>
              <p className="text-xs text-gray-500">Desde o início da sessão</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Erros de Trainer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{trainerErrors.length}</div>
              <p className="text-xs text-gray-500">Específicos de trainer profile</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">IDs Únicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {[...new Set(trainerErrors.map(e => e.context?.id).filter(Boolean))].length}
              </div>
              <p className="text-xs text-gray-500">IDs problemáticos diferentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button onClick={runDiagnostics} disabled={isRunning} size="lg">
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Executar Diagnóstico
              </>
            )}
          </Button>
          
          <Button onClick={clearErrors} variant="outline" size="lg">
            Limpar Erros
          </Button>
        </div>

        {/* Diagnostic Results */}
        {diagnostics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Resultados do Diagnóstico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {diagnostics.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {result.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {result.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <div className="text-right">
                    <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}>
                      {result.status}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Error Report */}
        {trainerErrors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Erros</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-4 rounded whitespace-pre-wrap">
                {report}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sugestões de Correção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{suggestion}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Errors */}
        {trainerErrors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Erros Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trainerErrors.slice(-10).map((error, index) => (
                  <div key={index} className="border-l-4 border-red-400 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-red-800">{error.message}</p>
                        <p className="text-sm text-gray-600">ID: {error.context?.id}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Errors State */}
        {errors.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum erro encontrado!</h3>
              <p className="text-gray-600">
                O sistema está funcionando corretamente. Execute o diagnóstico para verificar a saúde dos services.
              </p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}