// Tipos básicos e utilitários usados em toda a aplicação

export type ID = string;
export type Timestamp = string; // ISO date string

// Tipos de resposta padronizados
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
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

// Filtros base
export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Localização
export interface Location {
  id: ID;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Address extends Location {
  street?: string;
  number?: string;
  complement?: string;
  zipCode?: string;
  neighborhood?: string;
}

// Status genéricos
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

// Modalidades de atendimento
export type ServiceMode = 'online' | 'in-person' | 'both';

// Níveis de experiência
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

// Gênero
export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

// Tipos de arquivo
export interface FileUpload {
  id: ID;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Timestamp;
}

// Avaliações
export interface Rating {
  id: ID;
  userId: ID;
  rating: number; // 1-5
  comment?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Meta informações
export interface Meta {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: ID;
  updatedBy?: ID;
}

// Estados de carregamento
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Tipos de erro
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
}