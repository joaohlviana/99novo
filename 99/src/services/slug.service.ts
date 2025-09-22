/**
 * Serviço para gerenciamento de slugs
 * Resolve URLs amigáveis para trainers, sports e programs
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type TrainerProfile = Database['public']['Tables']['user_profiles']['Row'];
type TrainingProgram = Database['public']['Tables']['training_programs']['Row'];

export interface SlugResult {
  type: 'trainer' | 'sport' | 'program';
  id: string;
  slug: string;
  data?: any;
}

export interface TrainerSlugResult extends SlugResult {
  type: 'trainer';
  data: TrainerProfile;
}

export interface ProgramSlugResult extends SlugResult {
  type: 'program';
  data: TrainingProgram;
}

export interface SportSlugResult extends SlugResult {
  type: 'sport';
  data: {
    id: string;
    name: string;
    slug: string;
  };
}

class SlugService {
  /**
   * Resolve um slug para qualquer tipo de entidade
   */
  async resolveSlug(slug: string): Promise<SlugResult | null> {
    try {
      // Tentar resolver como trainer primeiro
      const trainerResult = await this.resolveTrainerSlug(slug);
      if (trainerResult) return trainerResult;

      // Tentar resolver como sport
      const sportResult = await this.resolveSportSlug(slug);
      if (sportResult) return sportResult;

      // Tentar resolver como program
      const programResult = await this.resolveProgramSlug(slug);
      if (programResult) return programResult;

      return null;
    } catch (error) {
      console.error('Erro ao resolver slug:', error);
      return null;
    }
  }

  /**
   * Resolve slug de trainer
   */
  async resolveTrainerSlug(slug: string): Promise<TrainerSlugResult | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('slug', slug)
        .eq('role', 'trainer')
        .eq('is_active', true)
        .single();

      if (error || !data) return null;

      return {
        type: 'trainer',
        id: data.id,
        slug: data.slug,
        data
      };
    } catch (error) {
      console.error('Erro ao resolver slug de trainer:', error);
      return null;
    }
  }

  /**
   * Resolve slug de sport usando função SQL existente
   */
  async resolveSportSlug(slug: string): Promise<SportSlugResult | null> {
    try {
      const { data, error } = await supabase
        .rpc('resolve_sport_slug', { input_slug: slug });

      if (error || !data) return null;

      return {
        type: 'sport',
        id: data.id,
        slug: data.slug,
        data: {
          id: data.id,
          name: data.name,
          slug: data.slug
        }
      };
    } catch (error) {
      console.error('Erro ao resolver slug de sport:', error);
      return null;
    }
  }

  /**
   * Resolve slug de program usando apenas programs_with_slugs
   * CORRIGIDO: não acessa tabela users diretamente
   */
  async resolveProgramSlug(slug: string): Promise<ProgramSlugResult | null> {
    try {
      const { data, error } = await supabase
        .rpc('resolve_program_slug_safe', { input_slug: slug });

      if (error || !data) return null;

      return {
        type: 'program',
        id: data.id,
        slug: data.slug,
        data
      };
    } catch (error) {
      console.error('Erro ao resolver slug de program:', error);
      return null;
    }
  }

  /**
   * Verifica se um UUID é válido
   */
  isValidUuid(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Tenta resolver como UUID primeiro, depois como slug
   */
  async resolveBySlugOrId(identifier: string): Promise<SlugResult | null> {
    // Se é UUID válido, tenta buscar por ID primeiro
    if (this.isValidUuid(identifier)) {
      const uuidResult = await this.resolveByUuid(identifier);
      if (uuidResult) return uuidResult;
    }

    // Senão, tenta resolver como slug
    return this.resolveSlug(identifier);
  }

  /**
   * Resolve por UUID (usado para fallbacks)
   */
  private async resolveByUuid(id: string): Promise<SlugResult | null> {
    try {
      // Tentar como trainer
      const { data: trainerData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'trainer')
        .eq('is_active', true)
        .single();

      if (trainerData) {
        return {
          type: 'trainer',
          id: trainerData.id,
          slug: trainerData.slug,
          data: trainerData
        };
      }

      // Tentar como program
      const { data: programData } = await supabase
        .from('training_programs')
        .select('*')
        .eq('id', id)
        .in('status', ['active', 'published'])
        .single();

      if (programData) {
        return {
          type: 'program',
          id: programData.id,
          slug: programData.slug || id, // fallback caso não tenha slug
          data: programData
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao resolver UUID:', error);
      return null;
    }
  }

  /**
   * Gera URL SEO-friendly baseada no tipo
   */
  generateSeoUrl(result: SlugResult): string {
    switch (result.type) {
      case 'trainer':
        return `/trainers/${result.slug}`;
      case 'sport':
        return `/sports/${result.slug}`;
      case 'program':
        return `/programs/${result.slug}`;
      default:
        return '/';
    }
  }

  /**
   * Cria slug a partir de string (usado para novos registros)
   */
  createSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/[\s_-]+/g, '-') // Substitui espaços e underscores por hífens
      .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
      .substring(0, 50); // Limita a 50 caracteres
  }
}

export const slugService = new SlugService();