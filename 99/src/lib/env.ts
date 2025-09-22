/**
 * 🌍 ENVIRONMENT UTILITIES - FIGMA MAKE SAFE
 * 
 * Funções utilitárias para acessar variáveis de ambiente
 * de forma segura no ambiente Figma Make.
 */

import { projectId, publicAnonKey, supabaseUrl, apiBaseUrl } from '../utils/supabase/info';

/**
 * Função segura para acessar variáveis de ambiente
 * Funciona tanto em Vite quanto em outros ambientes
 */
function getEnvVar(key: string, fallback = ''): string {
  try {
    // Primeira tentativa: import.meta.env (Vite)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const value = import.meta.env[key];
      if (value) return value;
    }
  } catch (error) {
    console.warn(`Failed to access import.meta.env.${key}:`, error);
  }

  try {
    // Segunda tentativa: process.env (Node/tradicional)
    if (typeof process !== 'undefined' && process.env) {
      const value = process.env[key];
      if (value) return value;
    }
  } catch (error) {
    console.warn(`Failed to access process.env.${key}:`, error);
  }

  try {
    // Terceira tentativa: globalThis ou window
    const global = typeof window !== 'undefined' ? window : globalThis;
    if (global && (global as any).env) {
      const value = (global as any).env[key];
      if (value) return value;
    }
  } catch (error) {
    console.warn(`Failed to access global env.${key}:`, error);
  }

  return fallback;
}

/**
 * Configurações do Supabase - sempre disponíveis
 */
export const env = {
  // Supabase - usar sempre os valores do info.tsx
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: publicAnonKey,
  SUPABASE_PROJECT_ID: projectId,
  API_BASE_URL: apiBaseUrl,

  // Ambiente
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  
  // Fallbacks seguros para outras variáveis que possam ser acessadas
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: publicAnonKey,
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: publicAnonKey,
};

/**
 * Função para obter uma variável de ambiente de forma segura
 */
export function safeGetEnv(key: keyof typeof env): string {
  return env[key] || '';
}

/**
 * Verifica se estamos em desenvolvimento
 */
export const isDevelopment = () => {
  return env.NODE_ENV === 'development' || env.NODE_ENV === undefined;
};

/**
 * Verifica se estamos em produção
 */
export const isProduction = () => {
  return env.NODE_ENV === 'production';
};

/**
 * Log das configurações para debug
 */
export const logEnvConfig = () => {
  if (isDevelopment()) {
    console.group('🌍 Environment Configuration');
    console.log('Environment:', env.NODE_ENV);
    console.log('Supabase URL:', env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('Supabase Key:', env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
    console.log('API Base URL:', env.API_BASE_URL);
    console.groupEnd();
  }
};

/**
 * Polyfill para process.env em ambientes que não o suportam
 * Isso evita erros quando bibliotecas tentam acessar process.env
 */
export const ensureProcessEnv = () => {
  try {
    if (typeof process === 'undefined') {
      // Criar um polyfill mínimo para process.env
      (globalThis as any).process = {
        env: {
          NODE_ENV: env.NODE_ENV,
          VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
          VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
          NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        }
      };
    } else if (typeof process === 'object' && process && !process.env) {
      // Se process existe mas env não
      (process as any).env = {
        NODE_ENV: env.NODE_ENV,
        VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
      };
    }
  } catch (error) {
    // Fail silently para não quebrar a aplicação
  }
};

// Auto-execute polyfill on import
ensureProcessEnv();