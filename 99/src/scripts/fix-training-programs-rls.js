/**
 * SCRIPT PARA CORRIGIR POLICIES RLS - TRAINING PROGRAMS
 * ====================================================
 * Este script corrige o erro de "permission denied for table users"
 * aplicando a correção das policies RLS
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obter diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  try {
    console.log('🔧 Iniciando correção das policies RLS...');
    
    // Ler o script SQL de correção
    const sqlFile = join(__dirname, 'migration-sql', '06-fix-training-programs-policies.sql');
    const sql = readFileSync(sqlFile, 'utf8');
    
    console.log('📝 Executando correção das policies...');
    
    // Executar o script SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Erro ao executar correção:', error);
      return;
    }
    
    console.log('✅ Correção das policies aplicada com sucesso!');
    
    // Verificar se as policies foram corrigidas
    console.log('🔍 Verificando policies...');
    
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname, cmd')
      .eq('tablename', '99_training_programs');
    
    if (policiesError) {
      console.warn('⚠️ Não foi possível verificar as policies:', policiesError);
    } else {
      console.log('📋 Policies ativas na tabela 99_training_programs:');
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname} (${policy.cmd})`);
      });
    }
    
    console.log('\n🎉 Correção concluída!');
    console.log('💡 O erro "permission denied for table users" deve estar resolvido.');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}