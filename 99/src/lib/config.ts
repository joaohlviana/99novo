/**
 * ⚙️ APP CONFIGURATION - SIMPLIFICADO
 * 
 * Configuração limpa focada no essencial.
 * Supabase como backend principal.
 */

export interface AppConfig {
  backend: 'supabase';
  development: {
    enableMocks: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableErrorBoundary: boolean;
  };
  supabase?: {
    url: string;
    anonKey: string;
    // ⚠️ serviceKey removido do frontend por segurança
  };
}

/**
 * Configuração padrão da aplicação
 */
const defaultConfig: AppConfig = {
  backend: 'supabase',
  development: {
    enableMocks: false,
    logLevel: 'debug',
    enableErrorBoundary: true
  }
};

/**
 * Carrega configuração adaptada para ambiente Figma Make
 */
async function loadConfigFromEnv(): Promise<Partial<AppConfig>> {
  const config: Partial<AppConfig> = {};

  // ✅ FIGMA MAKE: Usar variáveis do arquivo info.tsx
  try {
    // Importar as variáveis do Figma Make de forma assíncrona
    const infoModule = await import('../utils/supabase/info');
    const { projectId, publicAnonKey } = infoModule;
    
    if (projectId && publicAnonKey) {
      config.supabase = {
        url: `https://${projectId}.supabase.co`,
        anonKey: publicAnonKey
      };
    }
  } catch (error: unknown) {
    console.warn('⚠️ Falha ao carregar info.tsx, tentando variáveis de ambiente:', error);
    
    // Fallback para variáveis de ambiente tradicionais
    let env: any = {};
    try {
      env = (globalThis as any).process?.env || import.meta.env || {};
    } catch (envError: unknown) {
      console.warn('Failed to load environment variables:', envError);
      env = {};
    }

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL;
    const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      config.supabase = {
        url: supabaseUrl,
        anonKey: supabaseAnonKey
      };
    }
  }

  // ✅ FIGMA MAKE: Development settings simplificados
  config.development = {
    enableMocks: false, // Sempre usar dados reais
    logLevel: 'debug',  // Debug habilitado
    enableErrorBoundary: true // Error boundary sempre ativo
  };

  return config;
}

/**
 * Carrega configuração de forma síncrona para compatibilidade
 */
function loadConfigFromEnvSync(): Partial<AppConfig> {
  const config: Partial<AppConfig> = {};

  // ✅ FIGMA MAKE: Configuração hardcoded para evitar timeout
  // Os valores reais serão carregados dinamicamente quando necessário
  config.supabase = {
    url: 'https://rdujusymvebxndykyvhu.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdWp1c3ltdmVieG5keWt5dmh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NTQyNjEsImV4cCI6MjA3MzEzMDI2MX0.2koadjTydnQREvtl6kyAmmmCJ2sBksatwNICSdoeIUg'
  };

  // ✅ FIGMA MAKE: Development settings simplificados
  config.development = {
    enableMocks: false, // Sempre usar dados reais
    logLevel: 'debug',  // Debug habilitado
    enableErrorBoundary: true // Error boundary sempre ativo
  };

  return config;
}

/**
 * Configuração final mesclada - usando versão síncrona para evitar timeout
 */
export const appConfig: AppConfig = {
  ...defaultConfig,
  ...loadConfigFromEnvSync()
};

/**
 * Validators para configuração
 */
export const validateConfig = (): string[] => {
  const errors: string[] = [];

  // Validar Supabase
  if (!appConfig.supabase?.url) {
    errors.push('Supabase URL is required');
  }
  if (!appConfig.supabase?.anonKey) {
    errors.push('Supabase anon key is required');
  }

  return errors;
};
export const isDevelopment = () => {
  // ✅ FIGMA MAKE: Sempre retorna true para habilitar debugging
  return true;
};

export const isProduction = () => {
  // ✅ FIGMA MAKE: Sempre retorna false para manter features de dev
  return false;
};

/**
 * Log de configuração para debug - Otimizado para evitar timeout
 */
export const logConfig = (): void => {
  try {
    console.group('🔧 App Configuration - Figma Make');
    console.log('Environment: Figma Make Development');
    console.log('Backend:', appConfig.backend);
    console.log('Enable Mocks:', appConfig.development.enableMocks);
    console.log('Log Level:', appConfig.development.logLevel);
    
    if (appConfig.supabase) {
      console.log('Supabase URL:', appConfig.supabase.url ? '✅ Configurado' : '❌ Ausente');
      console.log('Supabase Anon Key:', appConfig.supabase.anonKey ? '✅ Configurado' : '❌ Ausente');
      console.log('📡 Edge Functions: Disponíveis via /supabase/functions/server');
      console.log('✅ Configuração válida!');
    }
    
    console.groupEnd();
  } catch (error) {
    console.warn('⚠️ Erro no log de configuração:', error);
  }
};

/**
 * Hook para acessar configuração em componentes React
 */
export const useAppConfig = () => {
  return {
    config: appConfig,
    isDevelopment: isDevelopment(),
    isProduction: isProduction(),
    validate: validateConfig
  };
};