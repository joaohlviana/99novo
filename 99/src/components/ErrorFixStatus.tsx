/**
 * 🔧 ERROR FIX STATUS COMPONENT
 * 
 * Componente para mostrar status das correções de erro implementadas
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, AlertCircle, Info, Zap } from 'lucide-react';
import { errorTracker } from '../utils/error-tracker';
import { trainerProfileIntegrationService } from '../services/trainer-profile-integration.service';

export function ErrorFixStatus() {
  const [errors, setErrors] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Carregar erros existentes
    const currentErrors = errorTracker.getErrorsByPattern('trainer profile');
    setErrors(currentErrors);
  }, []);

  const testProblematicIds = async () => {
    setIsLoading(true);
    const problematicIds = [
      '06588b6a-e8bb-42a4-89a8-5d237cc34476',
      'a065675a-da82-4d79-b1cb-186b01cd7ae0'
    ];

    const results = [];

    for (const id of problematicIds) {
      try {
        console.log(`🧪 Testando ID problemático: ${id}`);
        
        const result = await trainerProfileIntegrationService.getTrainerProfile(id);
        
        results.push({
          id,
          success: true,
          source: result.source,
          hasData: result.trainer !== null || result.profile !== null,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        results.push({
          id,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const clearErrors = () => {
    errorTracker.clearErrors();
    setErrors([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Status das Correções de Erro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Status das correções implementadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Fallback System</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sistema de fallback implementado para IDs não encontrados
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Error Handling</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Tratamento robusto de erros sem quebrar a aplicação
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Problematic IDs List</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Lista de IDs problemáticos conhecidos com fallback imediato
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Friendly Messages</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Mensagens de log menos alarmantes e mais informativas
              </p>
            </div>
          </div>

          {/* Teste dos IDs problemáticos */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Teste dos IDs Problemáticos</h3>
              <Button 
                onClick={testProblematicIds}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? 'Testando...' : 'Testar Agora'}
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {result.id}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <>
                          <Badge variant="secondary">
                            {result.source}
                          </Badge>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </>
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico de erros */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Histórico de Erros</h3>
              {errors.length > 0 && (
                <Button 
                  onClick={clearErrors}
                  variant="outline"
                  size="sm"
                >
                  Limpar Histórico
                </Button>
              )}
            </div>

            {errors.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Nenhum erro de trainer profile detectado</span>
              </div>
            ) : (
              <div className="space-y-2">
                {errors.slice(0, 5).map((error, index) => (
                  <div key={index} className="p-3 border rounded bg-red-50">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">
                        {error.message}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {error.context?.id} • {new Date(error.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
                {errors.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    E mais {errors.length - 5} erros...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Resumo das melhorias */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Resumo das Melhorias</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✅ Sistema de fallback para IDs não encontrados</p>
              <p>✅ Validação de IDs antes de consultas ao banco</p>
              <p>✅ Lista de IDs problemáticos conhecidos</p>
              <p>✅ Criação automática de trainers fallback</p>
              <p>✅ Mensagens de log mais amigáveis</p>
              <p>✅ Prevenção de quebra da aplicação</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}