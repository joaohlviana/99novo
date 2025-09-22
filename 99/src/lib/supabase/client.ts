/**
 * 🌐 SUPABASE CLIENT SINGLETON - PADRÃO OFICIAL TIPADO
 * 
 * Implementação seguindo exatamente as práticas recomendadas:
 * https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
 * 
 * ⚠️ SINGLETON PATTERN para evitar múltiplas instâncias do GoTrueClient
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '../env';
import type { Database } from '../../types/supabase';

const supabaseUrl = env.SUPABASE_URL;
const publicAnonKey = env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !publicAnonKey) {
  console.error('🔧 Supabase Client - Variáveis de ambiente faltando:', { supabaseUrl, publicAnonKey });
  throw new Error('Missing Supabase environment variables');
}

// ✅ SINGLETON PATTERN - Garante uma única instância
let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null;

function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Criar instância única do cliente
  supabaseInstance = createSupabaseClient<Database>(supabaseUrl, publicAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce'
    }
  });

  return supabaseInstance;
}

// ✅ EXPORT DA INSTÂNCIA SINGLETON
export const supabase = getSupabaseClient();

// Export function for creating additional clients if needed (e.g., for testing)
export const createClient = getSupabaseClient;

// Export do client para compatibilidade
export default supabase;