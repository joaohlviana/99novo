/**
 * 🔍 SUPABASE SINGLETON DEBUG
 * 
 * Utilitários para verificar e debugar instâncias do Supabase
 */

import { supabase } from './client';

// Contador global de instâncias (para debug)
let instanceCount = 0;

// Verificar se já existe uma instância ativa
export function checkSupabaseInstance() {
  instanceCount++;
  
  const info = {
    instanceCount,
    hasAuth: !!supabase.auth,
    hasDatabase: !!supabase.from,
    projectUrl: supabase.supabaseUrl,
    hasSession: false
  };

  // Verificar sessão atual
  supabase.auth.getSession().then(({ data: { session } }) => {
    info.hasSession = !!session;
    console.log('🔍 Supabase Singleton Check:', info);
  });

  return info;
}

// Verificar saúde da instância
export async function verifySupabaseHealth() {
  try {
    // Teste básico de conexão
    const { data, error } = await supabase
      .from('kv_store_e547215c')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.warn('⚠️ Supabase Health Warning:', error.message);
      return { healthy: false, error: error.message };
    }

    console.log('✅ Supabase Health: OK');
    return { healthy: true, count: data };

  } catch (error: any) {
    console.error('❌ Supabase Health Error:', error.message);
    return { healthy: false, error: error.message };
  }
}

// Export da instância singleton com verificação
export function getSupabaseInstance() {
  checkSupabaseInstance();
  return supabase;
}

// Função para reportar status
export function reportSupabaseStatus() {
  const status = {
    singleton: !!supabase,
    auth: !!supabase?.auth,
    instanceId: Date.now().toString(36),
    timestamp: new Date().toISOString()
  };

  console.log('📊 Supabase Status Report:', status);
  return status;
}