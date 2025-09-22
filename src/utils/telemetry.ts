/**
 * 📊 SISTEMA DE TELEMETRIA PARA SLUGS
 * 
 * Sistema de tracking de eventos para monitorar a implementação de slugs
 * e diagnosticar problemas de navegação.
 */

interface TelemetryEvent {
  event: string;
  data: Record<string, any>;
  timestamp: string;
  sessionId: string;
}

class TelemetryService {
  private sessionId: string;
  private events: TelemetryEvent[] = [];

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('📊 Telemetry initialized with session:', this.sessionId);
  }

  track(event: string, data: Record<string, any> = {}) {
    const telemetryEvent: TelemetryEvent = {
      event,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    this.events.push(telemetryEvent);
    
    // Console log para desenvolvimento
    console.log(`📊 ${event}:`, data);
    
    // TODO: Enviar para analytics service quando disponível
    // this.sendToAnalytics(telemetryEvent);
  }

  getEvents() {
    return [...this.events];
  }

  getEventsByType(eventType: string) {
    return this.events.filter(e => e.event === eventType);
  }

  // Métricas específicas para slugs
  getSlugMetrics() {
    const events = this.events;
    
    return {
      totalClicks: events.filter(e => e.event === 'trainer_card_click').length,
      missingSlugErrors: events.filter(e => e.event === 'trainer_slug_missing').length,
      validationErrors: events.filter(e => e.event === 'navigation_validation_error').length,
      redirects: events.filter(e => e.event === 'id_redirect_to_slug').length,
      successfulNavigations: events.filter(e => e.event === 'trainer_navigation_success').length,
      
      // Taxa de sucesso
      successRate: (() => {
        const total = events.filter(e => e.event === 'trainer_card_click').length;
        const successful = events.filter(e => e.event === 'trainer_navigation_success').length;
        return total > 0 ? (successful / total * 100).toFixed(2) + '%' : '0%';
      })(),
      
      // Detalhes dos erros
      errorDetails: {
        missingSlug: events.filter(e => e.event === 'trainer_slug_missing').map(e => e.data),
        validationErrors: events.filter(e => e.event === 'navigation_validation_error').map(e => e.data),
        invalidSlugs: events.filter(e => e.event === 'trainer_invalid_slug').map(e => e.data)
      },
      
      // Métricas de qualidade dos dados
      dataQuality: {
        trainersWithoutSlug: events.filter(e => e.event === 'trainers_missing_slugs'),
        cardValidationErrors: events.filter(e => e.event === 'trainer_card_validation_failed')
      }
    };
  }

  // Métricas gerais da sessão
  getSessionSummary() {
    const events = this.events;
    const eventTypes = [...new Set(events.map(e => e.event))];
    
    const summary = {
      sessionId: this.sessionId,
      totalEvents: events.length,
      eventTypes: eventTypes.length,
      timespan: events.length > 0 ? {
        start: events[0].timestamp,
        end: events[events.length - 1].timestamp
      } : null,
      
      // Breakdown por tipo de evento
      eventBreakdown: eventTypes.reduce((acc, type) => {
        acc[type] = events.filter(e => e.event === type).length;
        return acc;
      }, {} as Record<string, number>)
    };
    
    return summary;
  }

  // Clear events (para testes ou reset)
  clear() {
    this.events = [];
    console.log('📊 Telemetry events cleared');
  }

  // Export events para debugging
  exportEvents() {
    return {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      events: this.events,
      metrics: this.getSlugMetrics(),
      summary: this.getSessionSummary()
    };
  }
}

// Singleton instance
export const telemetry = new TelemetryService();

// Hook para usar telemetria nos componentes
export function useTelemetry() {
  return {
    track: telemetry.track.bind(telemetry),
    getMetrics: telemetry.getSlugMetrics.bind(telemetry),
    getEvents: telemetry.getEvents.bind(telemetry),
    getSessionSummary: telemetry.getSessionSummary.bind(telemetry),
    exportEvents: telemetry.exportEvents.bind(telemetry),
    clear: telemetry.clear.bind(telemetry)
  };
}

// Helper para tracking rápido
export const track = (event: string, data: Record<string, any> = {}) => {
  telemetry.track(event, data);
};

// Eventos padronizados para slugs
export const SlugEvents = {
  TRAINER_CARD_CLICK: 'trainer_card_click',
  TRAINER_SLUG_MISSING: 'trainer_slug_missing',
  TRAINER_INVALID_SLUG: 'trainer_invalid_slug',
  TRAINER_NAVIGATION_SUCCESS: 'trainer_navigation_success',
  NAVIGATION_VALIDATION_ERROR: 'navigation_validation_error',
  ID_REDIRECT_TO_SLUG: 'id_redirect_to_slug',
  TRAINERS_MISSING_SLUGS: 'trainers_missing_slugs',
  TRAINER_CARD_VALIDATION_FAILED: 'trainer_card_validation_failed',
  TRAINER_SEARCH_COMPLETED: 'trainer_search_completed',
  TRAINER_SEARCH_ERROR: 'trainer_search_error'
} as const;

export default telemetry;