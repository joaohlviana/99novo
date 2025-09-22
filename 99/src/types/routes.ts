import { ID } from './common';

// Parâmetros de rota tipados
export interface RouteParams {
  // Rotas de usuário
  '/trainer/:trainerId': { trainerId: ID };
  '/client/:clientId': { clientId: ID };
  
  // Rotas de programa
  '/program/:programId': { programId: ID };
  '/trainer/:trainerId/program/:programId': { trainerId: ID; programId: ID };
  
  // Rotas de esporte
  '/sport/:sportId': { sportId: ID };
  '/sport/:sportId/trainers': { sportId: ID };
  '/sport/:sportId/programs': { sportId: ID };
  
  // Rotas de dashboard
  '/dashboard/trainer/:section?': { section?: DashboardSection };
  '/dashboard/client/:section?': { section?: DashboardSection };
  '/dashboard/admin/:section?': { section?: AdminSection };
  
  // Rotas de demonstração
  '/dev/components/:componentName': { componentName: string };
}

// Query parameters tipados
export interface QueryParams {
  // Filtros gerais
  page?: string;
  limit?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  
  // Filtros específicos
  category?: string;
  sport?: string;
  level?: string;
  mode?: string;
  price_min?: string;
  price_max?: string;
  rating?: string;
  location?: string;
  featured?: string;
  
  // Estados da UI
  modal?: string;
  tab?: string;
  step?: string;
  view?: string;
}

// Seções do dashboard
export type DashboardSection = 
  // Trainer sections
  | 'overview'
  | 'profile'
  | 'programs'
  | 'students'
  | 'calendar'
  | 'messages'
  | 'analytics'
  | 'financial'
  | 'settings'
  
  // Client sections
  | 'dashboard'
  | 'my-programs'
  | 'progress'
  | 'trainers'
  | 'messages'
  | 'goals'
  | 'settings';

// Seções do admin
export type AdminSection =
  | 'overview'
  | 'users'
  | 'trainers'
  | 'clients'
  | 'programs'
  | 'sports'
  | 'categories'
  | 'payments'
  | 'analytics'
  | 'moderation'
  | 'settings'
  | 'impersonation';

// Navegação tipada
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
  requiresAuth?: boolean;
  allowedUserTypes?: ('client' | 'trainer' | 'admin')[];
  isActive?: boolean;
}

// Breadcrumbs
export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
  isActive?: boolean;
}

// Tipos para o roteamento
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  requiresAuth?: boolean;
  allowedUserTypes?: ('client' | 'trainer' | 'admin')[];
  title?: string;
  description?: string;
}

// Estados de navegação
export interface NavigationState {
  currentPath: string;
  currentParams: Record<string, string>;
  currentQuery: Record<string, string>;
  previousPath?: string;
  breadcrumbs: BreadcrumbItem[];
  isLoading: boolean;
}

// Hooks de navegação
export interface NavigationHookReturn {
  navigate: (path: string, options?: NavigationOptions) => void;
  goBack: () => void;
  goForward: () => void;
  replace: (path: string, options?: NavigationOptions) => void;
  currentPath: string;
  params: Record<string, string>;
  query: Record<string, string>;
  isLoading: boolean;
}

export interface NavigationOptions {
  replace?: boolean;
  state?: any;
  preserveQuery?: boolean;
  query?: Record<string, string>;
}