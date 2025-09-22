/**
 * 🚨 SISTEMA DE ERROR HANDLING CENTRALIZADO
 * 
 * Sistema robusto para tratamento de erros em toda a aplicação.
 * Fornece logging estruturado, mensagens user-friendly e telemetria.
 */

// Função simples para gerar ID único, evitando dependência externa
function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Tipos de erro da aplicação
export enum ErrorCode {
  // Network & API
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SCHEMA_ERROR = 'SCHEMA_ERROR',
  
  // Auth & Permissions
  AUTH_ERROR = 'AUTH_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  
  // Data & Business Logic
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  BUSINESS_RULE_ERROR = 'BUSINESS_RULE_ERROR',
  
  // System
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  ADAPTER_ERROR = 'ADAPTER_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR'
}

export interface ErrorContext {
  adapter?: string;
  method?: string;
  requestId?: string;
  duration?: number;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  context: ErrorContext;
  timestamp: string;
  stack?: string;
}

export class AppErrorHandler {
  private static instance: AppErrorHandler;
  
  static getInstance(): AppErrorHandler {
    if (!AppErrorHandler.instance) {
      AppErrorHandler.instance = new AppErrorHandler();
    }
    return AppErrorHandler.instance;
  }

  /**
   * Cria um erro estruturado da aplicação
   */
  createError(
    code: ErrorCode,
    message: string,
    userMessage: string,
    context: ErrorContext = {},
    originalError?: Error
  ): AppError {
    const requestId = context.requestId || generateId();
    
    const appError: AppError = {
      code,
      message,
      userMessage,
      context: {
        ...context,
        requestId
      },
      timestamp: new Date().toISOString(),
      stack: originalError?.stack
    };

    // Log estruturado para observabilidade
    this.logError(appError, originalError);
    
    return appError;
  }

  /**
   * Converte erros desconhecidos em AppError
   */
  handleUnknownError(
    error: unknown,
    context: ErrorContext = {}
  ): AppError {
    if (error instanceof Error) {
      return this.createError(
        ErrorCode.UNKNOWN_ERROR,
        error.message,
        'Ocorreu um erro inesperado. Tente novamente.',
        context,
        error
      );
    }

    return this.createError(
      ErrorCode.UNKNOWN_ERROR,
      'Unknown error occurred',
      'Ocorreu um erro inesperado. Tente novamente.',
      context
    );
  }

  /**
   * Log estruturado para telemetria
   */
  private logError(appError: AppError, originalError?: Error): void {
    const logData = {
      level: 'error',
      code: appError.code,
      message: appError.message,
      userMessage: appError.userMessage,
      context: appError.context,
      timestamp: appError.timestamp,
      stack: appError.stack
    };

    // Para desenvolvimento, log completo no console
    let isDev = false;
    try {
      // Verificação de ambiente mais segura
      isDev = process.env.NODE_ENV === 'development' || 
              typeof window !== 'undefined' && window.location.hostname === 'localhost';
    } catch {
      isDev = false;
    }
    if (isDev) {
      console.group(`🚨 Error [${appError.code}]`);
      console.error('Message:', appError.message);
      console.error('User Message:', appError.userMessage);
      console.error('Context:', appError.context);
      if (originalError) {
        console.error('Original Error:', originalError);
      }
      console.groupEnd();
    } else {
      // Em produção, log estruturado
      console.error('AppError:', JSON.stringify(logData));
    }

    // Aqui você pode integrar com serviços de telemetria
    // como Sentry, LogRocket, etc.
    this.sendToTelemetry(logData);
  }

  /**
   * Envio para serviços de telemetria (stub)
   */
  private sendToTelemetry(logData: any): void {
    // TODO: Integrar com Sentry, LogRocket, etc.
    // Para agora, apenas armazenamos no localStorage para debug
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(logData);
      
      // Manter apenas os últimos 100 erros
      if (errors.length > 100) {
        errors.splice(0, errors.length - 100);
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      // Fail silently se não conseguir armazenar
    }
  }

  /**
   * Recupera erros para debug
   */
  getStoredErrors(): any[] {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Limpa erros armazenados
   */
  clearStoredErrors(): void {
    localStorage.removeItem('app_errors');
  }
}

// Instância singleton
export const errorHandler = AppErrorHandler.getInstance();

// Helper functions para uso comum
export const createNetworkError = (message: string, context: ErrorContext = {}) =>
  errorHandler.createError(
    ErrorCode.NETWORK_ERROR,
    message,
    'Problema de conexão. Verifique sua internet.',
    context
  );

export const createValidationError = (message: string, context: ErrorContext = {}) =>
  errorHandler.createError(
    ErrorCode.VALIDATION_ERROR,
    message,
    'Dados inválidos fornecidos.',
    context
  );

export const createNotFoundError = (resource: string, context: ErrorContext = {}) =>
  errorHandler.createError(
    ErrorCode.NOT_FOUND,
    `${resource} not found`,
    `${resource} não encontrado.`,
    context
  );

export const createAuthError = (message: string, context: ErrorContext = {}) =>
  errorHandler.createError(
    ErrorCode.AUTH_ERROR,
    message,
    'Erro de autenticação. Faça login novamente.',
    context
  );

// Error Boundary Context para React
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: AppError;
}

/**
 * Hook para usar o error handler em componentes
 */
export const useErrorHandler = () => {
  const handleError = (error: unknown, context: ErrorContext = {}) => {
    return errorHandler.handleUnknownError(error, context);
  };

  const createError = (
    code: ErrorCode,
    message: string,
    userMessage: string,
    context: ErrorContext = {}
  ) => {
    return errorHandler.createError(code, message, userMessage, context);
  };

  return {
    handleError,
    createError,
    getStoredErrors: errorHandler.getStoredErrors,
    clearStoredErrors: errorHandler.clearStoredErrors
  };
};