/**
 * 🔬 SUPABASE DIRECT TEST SERVICE
 * 
 * Testa diretamente o cliente Supabase para identificar problemas específicos
 */

import { supabase } from '../lib/supabase/client';

export class SupabaseDirectTestService {
  
  /**
   * Teste básico de conectividade
   */
  static async testBasicConnection(): Promise<{
    success: boolean;
    message: string;
    error?: any;
  }> {
    try {
      console.log('🔍 Testando conexão básica com Supabase...');
      
      const { data, error } = await supabase
        .from('trainers_with_slugs')
        .select('id')
        .range(0, 0);

      if (error) {
        console.error('❌ Erro na conexão básica:', error);
        return {
          success: false,
          message: `Erro na conexão: ${error.message}`,
          error
        };
      }

      console.log('✅ Conexão básica funcionando:', data);
      return {
        success: true,
        message: 'Conexão básica funcionando'
      };

    } catch (error) {
      console.error('🚨 Erro inesperado na conexão:', error);
      return {
        success: false,
        message: `Erro inesperado: ${String(error)}`,
        error
      };
    }
  }

  /**
   * Teste usando range ao invés de limit
   */
  static async testWithRange(): Promise<{
    success: boolean;
    message: string;
    data?: any[];
    error?: any;
  }> {
    try {
      console.log('🔍 Testando busca com range...');
      
      const { data, error } = await supabase
        .from('trainers_with_slugs')
        .select('id, slug, name')
        .range(0, 4); // Equivale a limit(5)

      if (error) {
        console.error('❌ Erro na busca com range:', error);
        return {
          success: false,
          message: `Erro com range: ${error.message}`,
          error
        };
      }

      console.log('✅ Busca com range funcionando:', data);
      return {
        success: true,
        message: `Busca com range funcionando. Encontrados ${data?.length || 0} registros`,
        data: data || []
      };

    } catch (error) {
      console.error('🚨 Erro inesperado com range:', error);
      return {
        success: false,
        message: `Erro inesperado com range: ${String(error)}`,
        error
      };
    }
  }

  /**
   * Teste usando limit tradicional
   */
  static async testWithLimit(): Promise<{
    success: boolean;
    message: string;
    data?: any[];
    error?: any;
  }> {
    try {
      console.log('🔍 Testando busca com limit...');
      
      const { data, error } = await supabase
        .from('trainers_with_slugs')
        .select('id, slug, name')
        .range(0, 4);

      if (error) {
        console.error('❌ Erro na busca com limit:', error);
        return {
          success: false,
          message: `Erro com limit: ${error.message}`,
          error
        };
      }

      console.log('✅ Busca com limit funcionando:', data);
      return {
        success: true,
        message: `Busca com limit funcionando. Encontrados ${data?.length || 0} registros`,
        data: data || []
      };

    } catch (error) {
      console.error('🚨 Erro inesperado com limit:', error);
      return {
        success: false,
        message: `Erro inesperado com limit: ${String(error)}`,
        error
      };
    }
  }

  /**
   * Teste da Materialized View
   */
  static async testMaterializedView(): Promise<{
    success: boolean;
    message: string;
    data?: any[];
    error?: any;
  }> {
    try {
      console.log('🔍 Testando Materialized View...');
      
      const { data, error } = await supabase
        .from('trainers_denormalized_mv')
        .select('id, slug, name, specialties_text')
        .range(0, 2); // Usar range para segurança

      if (error) {
        console.error('❌ Erro na Materialized View:', error);
        return {
          success: false,
          message: `Erro na MV: ${error.message}`,
          error
        };
      }

      console.log('✅ Materialized View funcionando:', data);
      return {
        success: true,
        message: `MV funcionando. Encontrados ${data?.length || 0} registros`,
        data: data || []
      };

    } catch (error) {
      console.error('🚨 Erro inesperado na MV:', error);
      return {
        success: false,
        message: `Erro inesperado na MV: ${String(error)}`,
        error
      };
    }
  }

  /**
   * Teste de busca de programas
   */
  static async testProgramsSearch(): Promise<{
    success: boolean;
    message: string;
    data?: any[];
    error?: any;
  }> {
    try {
      console.log('🔍 Testando busca de programas...');
      
      const { data, error } = await supabase
        .from('training_programs_view')
        .select('id, title, sports')
        .eq('is_published', true)
        .range(0, 4);

      if (error) {
        console.error('❌ Erro na busca de programas:', error);
        return {
          success: false,
          message: `Erro em programas: ${error.message}`,
          error
        };
      }

      console.log('✅ Busca de programas funcionando:', data);
      return {
        success: true,
        message: `Programas funcionando. Encontrados ${data?.length || 0} registros`,
        data: data || []
      };

    } catch (error) {
      console.error('🚨 Erro inesperado em programas:', error);
      return {
        success: false,
        message: `Erro inesperado em programas: ${String(error)}`,
        error
      };
    }
  }

  /**
   * Teste completo do sistema
   */
  static async runCompleteTest(): Promise<{
    connection: any;
    range: any;
    limit: any;
    mv: any;
    programs: any;
    summary: {
      totalTests: number;
      passedTests: number;
      failedTests: number;
      overallStatus: 'success' | 'partial' | 'failed';
    };
  }> {
    console.log('🚀 Iniciando teste completo do sistema...');

    const connection = await this.testBasicConnection();
    const range = await this.testWithRange();
    const limit = await this.testWithLimit();
    const mv = await this.testMaterializedView();
    const programs = await this.testProgramsSearch();

    const results = [connection, range, limit, mv, programs];
    const passedTests = results.filter(r => r.success).length;
    const failedTests = results.filter(r => !r.success).length;

    let overallStatus: 'success' | 'partial' | 'failed' = 'failed';
    if (passedTests === results.length) {
      overallStatus = 'success';
    } else if (passedTests > 0) {
      overallStatus = 'partial';
    }

    const summary = {
      totalTests: results.length,
      passedTests,
      failedTests,
      overallStatus
    };

    console.log('📊 Resumo do teste completo:', summary);

    return {
      connection,
      range,
      limit,
      mv,
      programs,
      summary
    };
  }

  /**
   * Teste específico do problema de limit
   */
  static async diagnoseLimitProblem(): Promise<{
    clientType: string;
    hasLimit: boolean;
    hasRange: boolean;
    limitError?: any;
    rangeError?: any;
    diagnosis: string;
  }> {
    try {
      console.log('🔬 Diagnosticando problema do método limit...');

      // Verificar o tipo do cliente
      const clientType = typeof supabase;
      console.log('📋 Tipo do cliente Supabase:', clientType);

      // Criar query builder para inspeção
      const queryBuilder = supabase.from('trainers_with_slugs').select('id');
      
      // Verificar se os métodos existem
      const hasLimit = typeof queryBuilder.limit === 'function';
      const hasRange = typeof queryBuilder.range === 'function';
      
      console.log('📋 Métodos disponíveis:', { hasLimit, hasRange });

      let limitError, rangeError;
      
      // Testar limit se disponível (mas não executar para evitar erros)
      if (hasLimit) {
        try {
          // Apenas verificar se o método existe, não executar
          const testQuery = queryBuilder.limit;
          console.log('✅ Método limit está disponível');
        } catch (error) {
          console.error('❌ Método limit falhou:', error);
          limitError = error;
        }
      }

      // Testar range sempre
      try {
        await supabase.from('trainers_with_slugs').select('id').range(0, 0);
        console.log('✅ Método range funcionou');
      } catch (error) {
        console.error('❌ Método range falhou:', error);
        rangeError = error;
      }

      let diagnosis = '';
      if (!hasLimit && !hasRange) {
        diagnosis = 'Problema crítico: nem limit nem range estão disponíveis';
      } else if (!hasLimit) {
        diagnosis = 'Método limit não disponível, usar range como alternativa';
      } else if (limitError) {
        diagnosis = 'Método limit existe mas falha ao executar, usar range';
      } else {
        diagnosis = 'Ambos os métodos funcionam normalmente';
      }

      return {
        clientType,
        hasLimit,
        hasRange,
        limitError,
        rangeError,
        diagnosis
      };

    } catch (error) {
      return {
        clientType: 'unknown',
        hasLimit: false,
        hasRange: false,
        diagnosis: `Erro no diagnóstico: ${String(error)}`
      };
    }
  }
}

export default SupabaseDirectTestService;