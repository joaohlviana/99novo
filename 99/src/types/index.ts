/**
 * 📋 TYPES INDEX - CENTRALIZADO E LIMPO
 * 
 * Re-export todos os tipos essenciais do sistema.
 * Arquitetura simplificada e focada no essencial.
 */

// Core domain types
export * from './common';
export * from './user';
export * from './sport';
export * from './program';
export * from './routes';

// Estados globais da aplicação
export interface AppState {
  isInitialized: boolean;
  isOnline: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  region: string;
  notifications: NotificationState[];
  modals: ModalState[];
  loading: Record<string, boolean>;
  errors: Record<string, string>;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive';
}

export interface ModalState {
  id: string;
  type: string;
  isOpen: boolean;
  data?: any;
  options?: {
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  };
}

// Tipos para formulários
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface FormField<T> {
  name: keyof T;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'date';
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: { value: string; label: string }[];
  disabled?: boolean;
  description?: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

// Tipos para tabelas
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableState<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  sorting: {
    column: keyof T | string;
    direction: 'asc' | 'desc';
  };
  filters: Record<string, any>;
  selection: string[];
}

// Tipos para componentes reutilizáveis
export interface ComponentVariants {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  color?: 'default' | 'brand' | 'success' | 'warning' | 'error' | 'info';
}

// Tipos para temas e estilos
export interface ThemeConfig {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
  breakpoints: Record<string, string>;
  animations: Record<string, string>;
}

// Tipos para configuração de layout
export interface LayoutConfig {
  header: {
    height: string;
    sticky: boolean;
    showLogo: boolean;
    showNavigation: boolean;
    showUserMenu: boolean;
  };
  sidebar: {
    width: string;
    collapsible: boolean;
    defaultCollapsed: boolean;
    position: 'left' | 'right';
  };
  footer: {
    show: boolean;
    height: string;
    sticky: boolean;
  };
}