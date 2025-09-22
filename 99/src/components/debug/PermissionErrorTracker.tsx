/**
 * RASTREADOR DE ERROS DE PERMISSÃO
 * =================================
 * Componente para capturar e analisar erros de permissão específicos
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, Bug, Database, RefreshCw } from 'lucide-react';

interface PermissionError {
  timestamp: string;
  error: any;
  context: string;
  stackTrace?: string;
}

export function PermissionErrorTracker() {
  const [errors, setErrors] = useState<PermissionError[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  // Interceptar erros globais
  useEffect(() => {
    if (!isTracking) return;

    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    // Interceptar console.error
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      
      if (errorMessage.includes('permission denied') || 
          errorMessage.includes('42501') ||
          errorMessage.includes('table users')) {
        
        setErrors(prev => [...prev, {
          timestamp: new Date().toISOString(),
          error: args[0],
          context: 'console.error',
          stackTrace: new Error().stack
        }]);
      }
      
      originalConsoleError(...args);
    };

    // Interceptar console.warn
    console.warn = (...args) => {
      const warnMessage = args.join(' ');
      
      if (warnMessage.includes('permission denied') || 
          warnMessage.includes('42501') ||
          warnMessage.includes('table users')) {
        
        setErrors(prev => [...prev, {
          timestamp: new Date().toISOString(),
          error: args[0],
          context: 'console.warn', 
          stackTrace: new Error().stack
        }]);
      }
      
      originalConsoleWarn(...args);
    };

    // Interceptar erros não capturados
    const handleUnhandledError = (event: ErrorEvent) => {
      const errorMessage = event.message || event.error?.message || '';
      
      if (errorMessage.includes('permission denied') || 
          errorMessage.includes('42501') ||
          errorMessage.includes('table users')) {
        
        setErrors(prev => [...prev, {
          timestamp: new Date().toISOString(),
          error: event.error,
          context: 'unhandled error',
          stackTrace: event.error?.stack
        }]);
      }
    };

    // Interceptar rejeições de promise não capturadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const errorMessage = reason?.message || reason?.toString() || '';
      
      if (errorMessage.includes('permission denied') || 
          errorMessage.includes('42501') ||
          errorMessage.includes('table users')) {
        
        setErrors(prev => [...prev, {
          timestamp: new Date().toISOString(),
          error: reason,
          context: 'unhandled promise rejection',
          stackTrace: reason?.stack
        }]);
      }
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isTracking]);

  const startTracking = () => {
    setIsTracking(true);
    setErrors([]);
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const analyzeError = (error: PermissionError) => {
    const errorStr = JSON.stringify(error.error, null, 2);
    
    // Análise básica
    const analysis = {
      isPermissionError: errorStr.includes('permission denied') || errorStr.includes('42501'),
      isUsersTableError: errorStr.includes('table users'),
      isAuthError: errorStr.includes('auth.'),
      isRPCError: errorStr.includes('rpc'),
      isSupabaseError: errorStr.includes('supabase')
    };

    return analysis;
  };

  return (
    <div className="space-y-4">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Rastreador de Erros de Permissão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={isTracking ? stopTracking : startTracking}
              variant={isTracking ? "destructive" : "default"}
            >
              {isTracking ? 'Parar Rastreamento' : 'Iniciar Rastreamento'}
            </Button>
            
            <Button onClick={clearErrors} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar Erros
            </Button>
            
            <Badge variant={isTracking ? "default" : "secondary"}>
              {isTracking ? `Rastreando (${errors.length} erros)` : 'Parado'}
            </Badge>
          </div>

          {isTracking && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Rastreamento ativo:</strong> Todos os erros de permissão serão capturados e analisados.
                Use a aplicação normalmente para reproduzir o problema.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Lista de Erros */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Erros Capturados ({errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.map((error, index) => {
              const analysis = analyzeError(error);
              
              return (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  {/* Header do erro */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Erro #{index + 1}</Badge>
                      <Badge variant="outline">{error.context}</Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(error.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {/* Análise */}
                  <div className="flex flex-wrap gap-2">
                    {analysis.isPermissionError && (
                      <Badge variant="destructive">Permission Denied</Badge>
                    )}
                    {analysis.isUsersTableError && (
                      <Badge variant="destructive">Table Users</Badge>
                    )}
                    {analysis.isAuthError && (
                      <Badge variant="secondary">Auth Related</Badge>
                    )}
                    {analysis.isRPCError && (
                      <Badge variant="secondary">RPC Function</Badge>
                    )}
                    {analysis.isSupabaseError && (
                      <Badge variant="secondary">Supabase</Badge>
                    )}
                  </div>

                  {/* Detalhes do erro */}
                  <details className="space-y-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      Ver detalhes do erro
                    </summary>
                    
                    <div className="space-y-2">
                      <div>
                        <h5 className="text-sm font-medium">Erro:</h5>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(error.error, null, 2)}
                        </pre>
                      </div>
                      
                      {error.stackTrace && (
                        <div>
                          <h5 className="text-sm font-medium">Stack Trace:</h5>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-48">
                            {error.stackTrace}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Clique em "Iniciar Rastreamento"</p>
          <p>2. Navegue para a seção que está causando o erro (ex: Dashboard Cliente → Meu Perfil)</p>
          <p>3. Tente reproduzir o problema</p>
          <p>4. Volte aqui para ver os erros capturados</p>
          <p>5. Analise os detalhes para identificar a causa exata</p>
        </CardContent>
      </Card>
    </div>
  );
}