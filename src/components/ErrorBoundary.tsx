/**
 * 🛡️ ERROR BOUNDARY COMPONENT
 * 
 * Componente para capturar erros React e integrar com o sistema
 * de error handling centralizado.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { errorHandler, ErrorCode, type AppError } from '../lib/error-handler';
import { appConfig } from '../lib/config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: AppError;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para que a próxima renderização mostre a UI de erro
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Cria um AppError estruturado
    const appError = errorHandler.createError(
      ErrorCode.UNKNOWN_ERROR,
      error.message,
      'Algo deu errado. Recarregue a página ou tente novamente.',
      {
        adapter: 'react-error-boundary',
        method: 'componentDidCatch',
        requestId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36),
        metadata: {
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          errorBoundary: true
        }
      },
      error
    );

    this.setState({
      error: appError,
      errorInfo
    });

    // Chama callback personalizado se fornecido
    this.props.onError?.(appError, errorInfo);

    // Log adicional em desenvolvimento
    if (appConfig.development.logLevel === 'debug') {
      console.group('🚨 React Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('App Error:', appError);
      console.groupEnd();
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleReportBug = () => {
    const { error, errorInfo } = this.state;
    
    const bugReport = {
      error: error,
      errorInfo: errorInfo,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString(),
      userId: 'current-user-id', // TODO: Get from user store
      appVersion: '1.0.0' // TODO: Get from package.json
    };

    // TODO: Integrar com sistema de bug reporting (ex: Sentry, LogRocket)
    console.log('Bug Report:', bugReport);
    
    // Por enquanto, copia para o clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2))
        .then(() => alert('Relatório copiado para o clipboard!'))
        .catch(() => alert('Erro ao copiar relatório'));
    } else {
      alert('Clipboard não disponível neste ambiente');
    }
  };

  public render() {
    if (this.state.hasError) {
      // Usa fallback personalizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de erro padrão
      return (
        <div className="container py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                  <CardTitle>Oops! Algo deu errado</CardTitle>
                  <CardDescription>
                    Encontramos um erro inesperado. Tente uma das opções abaixo.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* User-friendly error message */}
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  {this.state.error?.userMessage || 'Erro inesperado do sistema'}
                </AlertDescription>
              </Alert>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={this.handleRetry}
                  className="bg-brand hover:bg-brand-hover"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleReload}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar Página
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleReportBug}
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Reportar Bug
                </Button>
              </div>

              {/* Technical details (only in development) */}
              {appConfig.development.logLevel === 'debug' && this.state.error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium mb-3">
                    Detalhes Técnicos (Debug)
                  </summary>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <strong>Error Code:</strong> {this.state.error.code}
                    </div>
                    
                    <div>
                      <strong>Request ID:</strong> {this.state.error.context.requestId}
                    </div>
                    
                    <div>
                      <strong>Timestamp:</strong> {this.state.error.timestamp}
                    </div>
                    
                    {this.state.error.message && (
                      <div>
                        <strong>Technical Message:</strong>
                        <pre className="mt-1 p-3 bg-muted rounded text-xs overflow-auto">
                          {this.state.error.message}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para usar Error Boundary em componentes funcionais
 */
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: Partial<ErrorInfo>) => {
    const appError = errorHandler.createError(
      ErrorCode.UNKNOWN_ERROR,
      error.message,
      'Erro inesperado. Tente novamente.',
      {
        adapter: 'react-hook',
        method: 'useErrorHandler',
        requestId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36),
        metadata: errorInfo
      },
      error
    );

    // Em um app real, você provavelmente iria:
    // 1. Mostrar um toast de erro
    // 2. Enviar para serviço de telemetria
    // 3. Atualizar estado global de erro
    
    throw appError;
  };

  return { handleError };
};

/**
 * Higher-Order Component para envolver componentes com Error Boundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent: React.FC<P> = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};