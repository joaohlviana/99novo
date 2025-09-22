/**
 * 🔄 SERVICES LAYER - SIMPLIFICADO
 * 
 * Centraliza todos os services essenciais da aplicação.
 * Arquitetura limpa focada na funcionalidade principal.
 */

// Service contracts
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    source: 'cache' | 'api' | 'mock';
    requestId: string;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterParams {
  search?: string;
  category?: string;
  level?: string;
  location?: string;
  priceRange?: [number, number];
  rating?: number;
  [key: string]: any;
}

// Core services exports
export * from './sports.service';
export * from './trainers.service';
export * from './programs.service';
export * from './users.service';
export * from './financial.service';
export * from './notifications.service';
export * from './messages.service';
export * from './workouts.service';

// Serviços híbridos consolidados - VERSÕES UNIFICADAS
export * from './trainer-profile.service';
export * from './training-programs-unified.service';
export * from './client-profile-unified.service';
export * from './slug.service';

// Compatibilidade - manter imports dos serviços legados para migração gradual
// TODO: Migrar todos os componentes para usar os serviços unificados e remover estes exports
export * from './training-programs.service'; // Legacy - usar training-programs-unified.service
export * from './programs.service'; // Legacy - usar training-programs-unified.service