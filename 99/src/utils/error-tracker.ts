/**
 * 🚨 ERROR TRACKER
 * 
 * Utilitário para rastrear e interceptar erros específicos
 * Ajuda a identificar origem de problemas como "Trainer profile não encontrado"
 */

interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  resolved?: boolean;
}

class ErrorTracker {
  private errors: ErrorLog[] = [];
  private listeners: Array<(error: ErrorLog) => void> = [];

  /**
   * Registra um erro
   */
  logError(message: string, context?: Record<string, any>, stack?: string) {
    const error: ErrorLog = {
      timestamp: new Date().toISOString(),
      message,
      context,
      stack,
      resolved: false
    };

    this.errors.push(error);
    console.warn(`🚨 ErrorTracker: ${message}`, context);

    // Notificar listeners
    this.listeners.forEach(listener => listener(error));

    // Limitar tamanho do array
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-50);
    }
  }

  /**
   * Intercepta mensagens específicas do console
   */
  interceptConsoleErrors() {
    const originalConsoleError = console.error;
    const originalConsoleLog = console.log;

    console.error = (...args) => {
      const message = args.join(' ');
      
      // Interceptar erros de trainer profile
      if (message.includes('Trainer profile não encontrado para ID:')) {
        const match = message.match(/ID:\s*([a-f0-9-]+)/);
        const id = match ? match[1] : 'unknown';
        
        this.logError('TrainerProfile ID não encontrado', {
          id,
          originalMessage: message,
          stack: new Error().stack
        });
      }

      // Chamar console.error original
      originalConsoleError.apply(console, args);
    };

    console.log = (...args) => {
      const message = args.join(' ');
      
      // Interceptar logs de trainer profile
      if (message.includes('Trainer profile não encontrado para ID:')) {
        const match = message.match(/ID:\s*([a-f0-9-]+)/);
        const id = match ? match[1] : 'unknown';
        
        this.logError('TrainerProfile ID não encontrado (via log)', {
          id,
          originalMessage: message,
          stack: new Error().stack
        });
      }

      // Chamar console.log original
      originalConsoleLog.apply(console, args);
    };
  }

  /**
   * Adiciona listener para novos erros
   */
  onError(listener: (error: ErrorLog) => void) {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Obtém todos os erros
   */
  getErrors(): ErrorLog[] {
    return [...this.errors];
  }

  /**
   * Obtém erros por padrão
   */
  getErrorsByPattern(pattern: string): ErrorLog[] {
    return this.errors.filter(error => 
      error.message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Marca erro como resolvido
   */
  markResolved(index: number) {
    if (this.errors[index]) {
      this.errors[index].resolved = true;
    }
  }

  /**
   * Limpa todos os erros
   */
  clearErrors() {
    this.errors = [];
  }

  /**
   * Gera relatório de erros
   */
  generateReport(): string {
    const trainerErrors = this.getErrorsByPattern('trainer profile');
    
    if (trainerErrors.length === 0) {
      return 'Nenhum erro de trainer profile encontrado.';
    }

    const uniqueIds = [...new Set(
      trainerErrors
        .map(error => error.context?.id)
        .filter(Boolean)
    )];

    const report = [
      `📊 RELATÓRIO DE ERROS - TRAINER PROFILES`,
      `===========================================`,
      `Total de erros: ${trainerErrors.length}`,
      `IDs únicos problemáticos: ${uniqueIds.length}`,
      ``,
      `IDs problemáticos:`,
      ...uniqueIds.map(id => `  - ${id}`),
      ``,
      `Primeiros 5 erros:`,
      ...trainerErrors.slice(0, 5).map((error, index) => 
        `  ${index + 1}. ${error.timestamp} - ${error.message} (ID: ${error.context?.id})`
      )
    ];

    return report.join('\n');
  }

  /**
   * Analisa e sugere soluções
   */
  analyzeSuggestions(): string[] {
    const trainerErrors = this.getErrorsByPattern('trainer profile');
    const suggestions: string[] = [];

    if (trainerErrors.length > 0) {
      suggestions.push('🔧 Verificar se os IDs estão sendo gerados corretamente');
      suggestions.push('🔧 Confirmar se existe sincronização entre sistemas mock e híbrido');
      suggestions.push('🔧 Implementar fallback para IDs não encontrados');
      suggestions.push('🔧 Adicionar validação de UUID antes de fazer queries');
    }

    const uniqueIds = [...new Set(
      trainerErrors
        .map(error => error.context?.id)
        .filter(Boolean)
    )];

    if (uniqueIds.length > 5) {
      suggestions.push('⚠️ Muitos IDs diferentes problemáticos - possível problema sistêmico');
    }

    return suggestions;
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Inicializar interceptação automaticamente
if (typeof window !== 'undefined') {
  errorTracker.interceptConsoleErrors();
}

export default errorTracker;