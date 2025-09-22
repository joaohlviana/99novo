/**
 * 🔍 IDENTIFIER RESOLVER SERVICE
 * 
 * Serviço responsável por resolver identificadores de treinadores:
 * - Detectar se é UUID ou slug
 * - Buscar por slug (via view) ou UUID (via tabela)
 * - Redirecionar UUIDs para slugs quando possível
 * - Implementar telemetria e logs detalhados
 */

import { supabase } from '../lib/supabase/client';
import { 
  TrainerInfo, 
  ResolverResult, 
  TelemetryEvent,
  validateTrainerInfo 
} from './types/trainer-resolver.dto';
import { normalizeTrainerVisual } from './normalize';

// Re-export tipos para compatibilidade
export type { TrainerInfo, ResolverResult, TelemetryEvent };

// ============================================
// UTILITÁRIOS DE VALIDAÇÃO
// ============================================

/**
 * Detecta se um identificador é um UUID
 */
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Valida se um slug está em formato correto
 */
function isValidSlug(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  if (str.includes('undefined') || str.trim() === '') return false;
  // Slug deve conter apenas letras minúsculas, números e hífens
  return /^[a-z0-9-]+$/.test(str);
}

/**
 * Normaliza um slug para formato padrão
 */
function normalizeSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') return '';
  
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Espaços para hífens
    .replace(/-+/g, '-') // Múltiplos hífens para um
    .replace(/^-+|-+$/g, ''); // Remove hífens das bordas
}

// ✅ Função removida - usando a importada do ./normalize

// ============================================
// TELEMETRIA
// ============================================

class TelemetryService {
  private events: TelemetryEvent[] = [];

  track(event: Omit<TelemetryEvent, 'timestamp'>): void {
    const telemetryEvent: TelemetryEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    this.events.push(telemetryEvent);
    console.log(`📊 [Telemetria] ${event.event}:`, event);

    // Em produção, enviar para sistema de analytics
    // analytics.track(event.event, telemetryEvent);
  }

  getEvents(): TelemetryEvent[] {
    return this.events;
  }

  getMetrics(): {
    totalResolves: number;
    successRate: number;
    redirectCount: number;
    errorCount: number;
    undefinedCount: number;
  } {
    const total = this.events.length;
    const successes = this.events.filter(e => e.success).length;
    const redirects = this.events.filter(e => e.event === 'uuid_to_slug_redirect').length;
    const errors = this.events.filter(e => e.event === 'identifier_resolve_error').length;
    const undefinedDetected = this.events.filter(e => e.event === 'undefined_detected').length;

    return {
      totalResolves: total,
      successRate: total > 0 ? (successes / total) * 100 : 0,
      redirectCount: redirects,
      errorCount: errors,
      undefinedCount: undefinedDetected
    };
  }
}

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

class IdentifierResolverService {
  private telemetry = new TelemetryService();

  /**
   * Método principal para resolver um identificador
   */
  async resolveTrainer(identifier: string): Promise<ResolverResult> {
    try {
      // Validação inicial
      if (!identifier || typeof identifier !== 'string') {
        this.telemetry.track({
          event: 'invalid_identifier',
          identifier: identifier || 'null/undefined',
          method: 'validation',
          success: false,
          error: 'Identificador inválido ou vazio'
        });
        return {
          success: false,
          error: 'Identificador inválido ou vazio'
        };
      }

      // Detectar "undefined" explícito
      if (identifier.includes('undefined')) {
        this.telemetry.track({
          event: 'undefined_detected',
          identifier,
          method: 'validation',
          success: false,
          error: 'Identificador contém "undefined"'
        });
        return {
          success: false,
          error: 'Identificador inválido: contém "undefined"'
        };
      }

      const normalizedIdentifier = identifier.trim();

      this.telemetry.track({
        event: 'identifier_resolve_attempt',
        identifier: normalizedIdentifier,
        method: 'start',
        success: true
      });

      // Estratégia 1: Se é UUID, tentar buscar e redirecionar para slug
      if (isUUID(normalizedIdentifier)) {
        console.log('🔍 Identificador detectado como UUID:', normalizedIdentifier);
        const result = await this.resolveByUUID(normalizedIdentifier);
        
        // Se não encontrou pela view, tentar fallback
        if (!result.success) {
          console.log('🔄 Tentando fallback para UUID:', normalizedIdentifier);
          return await this.resolveFromUserProfiles(normalizedIdentifier);
        }
        
        return result;
      }

      // Estratégia 2: Se parece com slug, buscar diretamente
      const normalizedSlug = normalizeSlug(normalizedIdentifier);
      if (isValidSlug(normalizedSlug)) {
        console.log('🔍 Identificador detectado como slug:', normalizedSlug);
        const result = await this.resolveBySlug(normalizedSlug);
        
        // Se não encontrou pela view, tentar fallback
        if (!result.success) {
          console.log('🔄 Tentando fallback para slug:', normalizedSlug);
          return await this.resolveFromUserProfiles(normalizedSlug);
        }
        
        return result;
      }

      // Estratégia 3: Tentar normalizar e buscar novamente
      if (normalizedSlug) {
        console.log('🔄 Tentando slug normalizado:', normalizedSlug);
        const result = await this.resolveBySlug(normalizedSlug);
        
        // Se não encontrou pela view, tentar fallback
        if (!result.success) {
          console.log('🔄 Tentando fallback para slug normalizado:', normalizedSlug);
          return await this.resolveFromUserProfiles(normalizedSlug);
        }
        
        return result;
      }

      // Falha na validação
      this.telemetry.track({
        event: 'slug_validation_failed',
        identifier: normalizedIdentifier,
        method: 'validation',
        success: false,
        error: 'Formato de identificador não reconhecido'
      });

      return {
        success: false,
        error: 'Formato de identificador não reconhecido'
      };

    } catch (error) {
      this.telemetry.track({
        event: 'identifier_resolve_error',
        identifier,
        method: 'general',
        success: false,
        error: error.message
      });

      console.error('❌ Erro ao resolver identificador:', error);
      return {
        success: false,
        error: `Erro interno: ${error.message}`
      };
    }
  }

  /**
   * Resolver por UUID (buscar na tabela e redirecionar para slug)
   */
  private async resolveByUUID(uuid: string): Promise<ResolverResult> {
    try {
      console.log('🔍 Resolvendo por UUID:', uuid);

      // ✅ Buscar na view trainers_with_slugs - usando limit(1) para evitar PGRST116
      const { data, error } = await supabase
        .from('trainers_with_slugs')
        .select('id,user_id,name,slug,profile_data')
        .eq('id', uuid)
        .limit(1);

      if (error) {
        console.error('❌ Erro na busca por UUID:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ UUID não encontrado:', uuid);
        this.telemetry.track({
          event: 'identifier_resolve_error',
          identifier: uuid,
          method: 'uuid',
          success: false,
          error: 'UUID não encontrado'
        });
        return {
          success: false,
          error: 'Treinador não encontrado'
        };
      }

      const trainer = data[0];
      
      // Se tem slug, redirecionar
      if (trainer.slug) {
        console.log('✅ UUID encontrado, redirecionando para slug:', trainer.slug);
        this.telemetry.track({
          event: 'uuid_to_slug_redirect',
          identifier: uuid,
          method: 'uuid',
          success: true,
          metadata: { slug: trainer.slug }
        });

        const normalizedTrainer = normalizeTrainerVisual(trainer);
        return {
          success: true,
          trainer: normalizedTrainer,
          needsRedirect: true,
          redirectSlug: trainer.slug,
          resolveMethod: 'uuid'
        };
      }

      // Se não tem slug, retornar dados
      console.log('⚠️ UUID encontrado mas sem slug:', uuid);
      this.telemetry.track({
        event: 'identifier_resolve_success',
        identifier: uuid,
        method: 'uuid',
        success: true,
        metadata: { hasSlug: false }
      });

      const normalizedTrainer = normalizeTrainerVisual(trainer);
      return {
        success: true,
        trainer: normalizedTrainer,
        resolveMethod: 'uuid'
      };

    } catch (error) {
      this.telemetry.track({
        event: 'identifier_resolve_error',
        identifier: uuid,
        method: 'uuid',
        success: false,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Resolver por slug (buscar na view)
   */
  private async resolveBySlug(slug: string): Promise<ResolverResult> {
    try {
      console.log('🔍 Resolvendo por slug:', slug);

      // ✅ Buscar na view trainers_with_slugs - usando limit(1) para evitar PGRST116
      const { data, error } = await supabase
        .from('trainers_with_slugs')
        .select('id,user_id,name,slug,profile_data')
        .eq('slug', slug)
        .limit(1);

      if (error) {
        console.error('❌ Erro na busca por slug:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ Slug não encontrado:', slug);
        
        // 🎯 HIGIENE DEFENSIVA: tentar remover sufixo antigo se existir
        const suffixPattern = /-[0-9a-f]{8}$/;
        if (suffixPattern.test(slug)) {
          const normalizedSlug = slug.replace(suffixPattern, '');
          console.log('🔄 Tentando slug normalizado (sem sufixo):', normalizedSlug);
          
          // ✅ Tentativa com slug normalizado - usando limit(1) para evitar PGRST116
          const { data: normalizedData, error: normalizedError } = await supabase
            .from('trainers_with_slugs')
            .select('id,user_id,name,slug,profile_data')
            .eq('slug', normalizedSlug)
            .limit(1);
          
          if (!normalizedError && normalizedData && normalizedData.length > 0) {
            const trainer = normalizedData[0];
            console.log('✅ Treinador encontrado com slug normalizado:', trainer.name);
            
            this.telemetry.track({
              event: 'slug_normalization_success',
              identifier: slug,
              method: 'slug_normalized',
              success: true,
              metadata: { originalSlug: slug, normalizedSlug: normalizedSlug }
            });

            const normalizedTrainer = normalizeTrainerVisual(trainer);
            return {
              success: true,
              trainer: normalizedTrainer,
              resolveMethod: 'slug_normalized',
              needsRedirect: true,
              redirectSlug: normalizedSlug
            };
          }
        }
        
        this.telemetry.track({
          event: 'identifier_resolve_error',
          identifier: slug,
          method: 'slug',
          success: false,
          error: 'Slug não encontrado'
        });
        return {
          success: false,
          error: 'Treinador não encontrado'
        };
      }

      const trainer = data[0];
      console.log('✅ Treinador encontrado por slug:', trainer.name);
      
      this.telemetry.track({
        event: 'identifier_resolve_success',
        identifier: slug,
        method: 'slug',
        success: true
      });

      const normalizedTrainer = normalizeTrainerVisual(trainer);
      return {
        success: true,
        trainer: normalizedTrainer,
        resolveMethod: 'slug'
      };

    } catch (error) {
      this.telemetry.track({
        event: 'identifier_resolve_error',
        identifier: slug,
        method: 'slug',
        success: false,
        error: error.message
      });
      throw error;
    }
  }

  // ✅ mapTrainerData removido - usando normalizeTrainerVisual

  /**
   * Método para usar a RPC get_trainers_with_slugs_safe (fallback)
   */
  async resolveTrainerSafe(identifier: string): Promise<ResolverResult> {
    try {
      console.log('🔄 Usando método seguro (RPC) para:', identifier);

      const { data, error } = await supabase
        .rpc('get_trainers_with_slugs_safe', { limit_param: 1 });

      if (error) {
        throw error;
      }

      // Filtrar resultado localmente
      const trainer = data?.find(t => t.slug === identifier || t.id === identifier);
      
      if (!trainer) {
        return {
          success: false,
          error: 'Treinador não encontrado'
        };
      }

      const normalizedTrainer = normalizeTrainerVisual(trainer);
      return {
        success: true,
        trainer: normalizedTrainer,
        resolveMethod: 'fallback'
      };

    } catch (error) {
      console.error('❌ Erro no método seguro:', error);
      throw error;
    }
  }

  /**
   * ✅ Método para verificar se há dados na view trainers_with_slugs
   */
  async checkViewData(): Promise<{ hasData: boolean; count: number; sample?: any }> {
    try {
      console.log('🔍 Verificando dados na view trainers_with_slugs...');
      
      const { data, error, count } = await supabase
        .from('trainers_with_slugs')
        .select('id,user_id,name,slug', { count: 'exact' })
        .limit(1);

      if (error) {
        console.error('❌ Erro ao verificar view:', error);
        return { hasData: false, count: 0 };
      }

      const hasData = data && data.length > 0;
      console.log(`📊 View trainers_with_slugs - Count: ${count}, HasData: ${hasData}`);
      
      return { 
        hasData, 
        count: count || 0, 
        sample: hasData ? data[0] : null 
      };
    } catch (error) {
      console.error('❌ Erro na verificação de dados:', error);
      return { hasData: false, count: 0 };
    }
  }

  /**
   * ✅ Método para fallback quando não há dados na view
   */
  async resolveFromUserProfiles(identifier: string): Promise<ResolverResult> {
    try {
      console.log('🔄 Tentando fallback via user_profiles para:', identifier);

      // Buscar na tabela user_profiles diretamente
      let query = supabase
        .from('user_profiles')
        .select('id,user_id,name,slug,profile_data,role')
        .eq('role', 'trainer')
        .limit(1);

      // Se parece com UUID, buscar por user_id
      if (isUUID(identifier)) {
        query = query.eq('user_id', identifier);
      } else {
        // Se não, buscar por slug
        query = query.eq('slug', identifier);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'Treinador não encontrado (fallback)'
        };
      }

      const trainer = data[0];
      console.log('✅ Treinador encontrado via fallback:', trainer.name);

      const normalizedTrainer = normalizeTrainerVisual(trainer);
      return {
        success: true,
        trainer: normalizedTrainer,
        resolveMethod: 'fallback'
      };

    } catch (error) {
      console.error('❌ Erro no fallback:', error);
      return {
        success: false,
        error: `Erro no fallback: ${error.message}`
      };
    }
  }

  /**
   * Obter métricas de telemetria
   */
  getTelemetryMetrics() {
    return this.telemetry.getMetrics();
  }

  /**
   * Obter eventos de telemetria
   */
  getTelemetryEvents(): TelemetryEvent[] {
    return this.telemetry.getEvents();
  }

  /**
   * Limpar dados de telemetria
   */
  clearTelemetry(): void {
    this.telemetry = new TelemetryService();
  }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

export const identifierResolverService = new IdentifierResolverService();
export default identifierResolverService;

// Exportar utilitários
export { isUUID, isValidSlug, normalizeSlug };