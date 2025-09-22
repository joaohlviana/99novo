/**
 * 🌐 PUBLIC PROGRAMS SERVICE
 * 
 * Serviço para acessar programas publicados na view public.published_training_programs
 * Para uso no client dashboard e páginas públicas
 */

import { supabase } from '../lib/supabase/client';

// ============================================
// INTERFACES
// ============================================

export interface PublicProgram {
  id: string;
  trainer_id: string;
  title: string;
  category: string;
  modality: 'PDF' | 'Consultoria' | 'Video';
  level: string;
  duration: string;
  frequency: string;
  base_price: number;
  thumbnail?: string;
  program_data: {
    shortDescription?: string;
    tags?: string[];
    objectives?: string[];
    requirements?: string[];
    whatYouGet?: string[];
    delivery_mode?: 'PDF' | 'Consultoria' | 'Video';
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  // Dados do trainer vindos da view
  trainer_name: string;
  trainer_avatar?: string;
  trainer_bio?: string;
  trainer_city?: string;
  trainer_cities?: string;
}

export interface ProgramFilters {
  category?: string;
  modality?: string;
  level?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

class PublicProgramsService {
  private readonly viewName = 'published_training_programs';

  /**
   * Buscar programas publicados com filtros
   */
  async getPublishedPrograms(filters: ProgramFilters = {}): Promise<PublicProgram[]> {
    try {
      console.log('🔍 PublicProgramsService: Buscando programas publicados', filters);

      let query = supabase
        .from(this.viewName)
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.modality) {
        query = query.eq('modality', filters.modality);
      }

      if (filters.level) {
        query = query.eq('level', filters.level);
      }

      if (filters.priceMin) {
        query = query.gte('base_price', filters.priceMin);
      }

      if (filters.priceMax) {
        query = query.lte('base_price', filters.priceMax);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,program_data->>shortDescription.ilike.%${filters.search}%`);
      }

      // Paginação
      if (filters.limit) {
        const offset = filters.offset || 0;
        query = query.range(offset, offset + filters.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro na query:', error);
        
        // Se a view não existe, retornar array vazio
        if (error.code === '42P01') {
          console.log('⚠️ View não existe - retornando array vazio');
          return [];
        }
        
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} programas publicados`);
      return data as PublicProgram[] || [];

    } catch (error: any) {
      console.error('❌ Erro ao buscar programas publicados:', error);
      
      // Se é erro de estrutura, retornar array vazio
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('⚠️ Estrutura não existe - retornando array vazio');
        return [];
      }
      
      throw new Error(`Erro ao buscar programas: ${error.message}`);
    }
  }

  /**
   * Buscar programa por ID (público)
   */
  async getProgramById(id: string): Promise<PublicProgram | null> {
    try {
      console.log('🔍 Buscando programa público por ID:', id);

      const { data, error } = await supabase
        .from(this.viewName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ Programa não encontrado');
          return null;
        }
        throw error;
      }

      console.log('✅ Programa encontrado:', data.title);
      return data as PublicProgram;

    } catch (error: any) {
      console.error('❌ Erro ao buscar programa por ID:', error);
      
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return null;
      }
      
      throw new Error(`Erro ao buscar programa: ${error.message}`);
    }
  }

  /**
   * Buscar programas por trainer
   */
  async getProgramsByTrainer(trainerId: string, limit = 10): Promise<PublicProgram[]> {
    try {
      const { data, error } = await supabase
        .from(this.viewName)
        .select('*')
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        if (error.code === '42P01') {
          return [];
        }
        throw error;
      }

      return data as PublicProgram[] || [];

    } catch (error: any) {
      console.error('❌ Erro ao buscar programas do trainer:', error);
      
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return [];
      }
      
      throw new Error(`Erro ao buscar programas do trainer: ${error.message}`);
    }
  }

  /**
   * Buscar programas por categoria
   */
  async getProgramsByCategory(category: string, limit = 20): Promise<PublicProgram[]> {
    return this.getPublishedPrograms({ category, limit });
  }

  /**
   * Buscar programas por modalidade
   */
  async getProgramsByModality(modality: 'PDF' | 'Consultoria' | 'Video', limit = 20): Promise<PublicProgram[]> {
    return this.getPublishedPrograms({ modality, limit });
  }

  /**
   * Buscar programas similares (mesma categoria/nível)
   */
  async getSimilarPrograms(programId: string, limit = 6): Promise<PublicProgram[]> {
    try {
      // Primeiro buscar o programa atual para pegar categoria e nível
      const currentProgram = await this.getProgramById(programId);
      if (!currentProgram) return [];

      // Buscar programas similares
      const { data, error } = await supabase
        .from(this.viewName)
        .select('*')
        .eq('category', currentProgram.category)
        .neq('id', programId) // Excluir o programa atual
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        if (error.code === '42P01') {
          return [];
        }
        throw error;
      }

      return data as PublicProgram[] || [];

    } catch (error: any) {
      console.error('❌ Erro ao buscar programas similares:', error);
      return [];
    }
  }

  /**
   * Buscar estatísticas dos programas públicos
   */
  async getPublicStats(): Promise<{
    total: number;
    byModality: Record<string, number>;
    byCategory: Record<string, number>;
    averagePrice: number;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.viewName)
        .select('modality, category, base_price');

      if (error) {
        if (error.code === '42P01') {
          return {
            total: 0,
            byModality: {},
            byCategory: {},
            averagePrice: 0
          };
        }
        throw error;
      }

      const stats = {
        total: data.length,
        byModality: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        averagePrice: 0
      };

      // Calcular estatísticas
      data.forEach(program => {
        // Por modalidade
        stats.byModality[program.modality] = (stats.byModality[program.modality] || 0) + 1;
        
        // Por categoria
        stats.byCategory[program.category] = (stats.byCategory[program.category] || 0) + 1;
      });

      // Preço médio
      const totalPrice = data.reduce((sum, p) => sum + (p.base_price || 0), 0);
      stats.averagePrice = data.length > 0 ? totalPrice / data.length : 0;

      return stats;

    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return {
        total: 0,
        byModality: {},
        byCategory: {},
        averagePrice: 0
      };
    }
  }

  /**
   * Buscar programas em destaque (mais recentes ou com mais avaliações)
   */
  async getFeaturedPrograms(limit = 8): Promise<PublicProgram[]> {
    return this.getPublishedPrograms({ limit });
  }

  /**
   * Buscar para autocomplete/sugestões
   */
  async searchPrograms(searchTerm: string, limit = 10): Promise<PublicProgram[]> {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    return this.getPublishedPrograms({ 
      search: searchTerm, 
      limit 
    });
  }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

export const publicProgramsService = new PublicProgramsService();
export default publicProgramsService;