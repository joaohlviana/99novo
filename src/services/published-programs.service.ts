/**
 * 📊 PUBLISHED PROGRAMS SERVICE
 * 
 * Serviço otimizado para buscar programas publicados usando a view
 * published_programs_by_trainer com filtros de status normalizados
 */

import { supabase } from '../lib/supabase/client';

// ============================================
// INTERFACES
// ============================================

export interface PublishedProgram {
  id: string;
  trainer_id: string;
  trainer_slug: string;
  trainer_name: string;
  trainer_avatar: string;
  title: string;
  category: string;
  modality: 'PDF' | 'Consultoria' | 'Video';
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  duration: string;
  frequency: string;
  base_price: number;
  thumbnail?: string;
  program_data: {
    shortDescription?: string;
    tags?: string[];
    objectives?: string[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface ProgramSearchFilters {
  trainer_id?: string;
  trainer_slug?: string;
  category?: string;
  modality?: string;
  level?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

class PublishedProgramsService {
  private readonly viewName = 'published_programs_by_trainer';

  /**
   * 🎯 NORMALIZAR STATUS (mesmo processo do service principal)
   */
  private normalizeStatus(status: string | null | undefined): string {
    if (!status) return '';
    return status.trim().toLowerCase();
  }

  /**
   * 🎯 VERIFICAR SE PROGRAMA DEVE SER APROVADO
   */
  private shouldApproveProgram(isPublished: boolean, status: string | null | undefined): boolean {
    if (!isPublished) return false;
    
    const normalizedStatus = this.normalizeStatus(status);
    const rejectedStatuses = ['archived', 'draft'];
    
    // ✅ LÓGICA FLEXÍVEL: Aprovar se não está em estados rejeitados
    // Aceita: 'published\n', 'published ', '', 'active', etc.
    // Rejeita apenas: 'draft' e 'archived'
    return !rejectedStatuses.includes(normalizedStatus);
  }

  /**
   * Buscar programas publicados por trainer
   * 🎯 CORREÇÃO: Filtro flexível de status + chave correta
   */
  async getProgramsByTrainer(
    identifier: string,
    useSlug = false,
    filters: Omit<ProgramSearchFilters, 'trainer_id' | 'trainer_slug'> = {}
  ): Promise<PublishedProgram[]> {
    try {
      console.log(`🔍 Buscando programas ${useSlug ? 'por slug' : 'por user_id'}:`, identifier);

      let query = supabase
        .from(this.viewName)
        .select('*')
        .order('created_at', { ascending: false });

      // 🎯 FILTRO POR IDENTIFICADOR CORRETO
      if (useSlug) {
        query = query.eq('trainer_slug', identifier);
      } else {
        query = query.eq('trainer_id', identifier); // user_id
      }

      // Aplicar filtros adicionais
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.modality) {
        query = query.eq('modality', filters.modality);
      }

      if (filters.level) {
        query = query.eq('level', filters.level);
      }

      if (filters.priceMin !== undefined) {
        query = query.gte('base_price', filters.priceMin);
      }

      if (filters.priceMax !== undefined) {
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
        console.error('❌ Erro na query da view:', error);
        
        // Se a view não existe, tentar busca na tabela direta
        if (error.code === '42P01') {
          console.log('⚠️ View não existe, tentando busca direta...');
          return await this.fallbackDirectQuery(identifier, useSlug, filters);
        }
        
        throw error;
      }

      if (!data || data.length === 0) {
        console.log(`ℹ️ Nenhum programa encontrado para ${useSlug ? 'slug' : 'user_id'}: ${identifier}`);
        return [];
      }

      console.log(`📊 Encontrados ${data.length} programas brutos na view`);

      // 🎯 NÃO APLICAR FILTRO ADICIONAL - A VIEW JÁ DEVE TER FEITO O FILTRO
      // (A view published_programs_by_trainer já filtra por is_published = true)
      
      console.log(`✅ Retornando ${data.length} programas da view`);
      
      return data as PublishedProgram[];

    } catch (error: any) {
      console.error('❌ Erro ao buscar programas do trainer:', error);
      
      // Fallback para busca direta se view falhar
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('🔄 Fallback para busca direta...');
        return await this.fallbackDirectQuery(identifier, useSlug, filters);
      }
      
      return [];
    }
  }

  /**
   * Fallback: busca direta na tabela com filtros manuais
   */
  private async fallbackDirectQuery(
    identifier: string,
    useSlug: boolean,
    filters: Omit<ProgramSearchFilters, 'trainer_id' | 'trainer_slug'>
  ): Promise<PublishedProgram[]> {
    try {
      console.log('🔄 Executando busca direta na tabela...');

      // Se useSlug = true, precisamos primeiro resolver o trainer_id
      let targetTrainerId = identifier;
      
      if (useSlug) {
        // Buscar trainer por slug para pegar user_id
        const { data: trainerData, error: trainerError } = await supabase
          .from('trainers_with_slugs')
          .select('id, user_id')
          .eq('slug', identifier)
          .single();

        if (trainerError || !trainerData) {
          console.log('⚠️ Trainer não encontrado para slug:', identifier);
          return [];
        }

        targetTrainerId = trainerData.user_id || trainerData.id;
        console.log('🔗 Slug resolvido para user_id:', targetTrainerId);
      }

      // Buscar na tabela direta
      let query = supabase
        .from('99_training_programs')
        .select(`
          id,
          trainer_id,
          title,
          category,
          modality,
          level,
          duration,
          frequency,
          base_price,
          thumbnail,
          program_data,
          created_at,
          updated_at,
          is_published,
          status
        `)
        .eq('trainer_id', targetTrainerId)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro na busca direta:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ Nenhum programa encontrado na busca direta');
        return [];
      }

      console.log(`📊 Encontrados ${data.length} programas na busca direta`);

      // 🎯 APLICAR FILTRO FLEXÍVEL MANUALMENTE
      const approvedPrograms = data.filter(record => {
        const shouldApprove = this.shouldApproveProgram(record.is_published, record.status);
        
        console.log(`📋 [Busca Direta] Programa ${record.id}: is_published=${record.is_published}, status="${record.status}" -> aprovado=${shouldApprove}`);
        
        return shouldApprove;
      });

      console.log(`✅ ${approvedPrograms.length} programas aprovados na busca direta`);

      // Transformar para formato PublishedProgram (sem dados do trainer)
      return approvedPrograms.map(record => ({
        id: record.id,
        trainer_id: record.trainer_id,
        trainer_slug: '', // não disponível na busca direta
        trainer_name: 'Trainer', // não disponível na busca direta
        trainer_avatar: '', // não disponível na busca direta
        title: record.title,
        category: record.category,
        modality: record.modality,
        level: record.level,
        duration: record.duration,
        frequency: record.frequency,
        base_price: record.base_price,
        thumbnail: record.thumbnail,
        program_data: record.program_data || {},
        created_at: record.created_at,
        updated_at: record.updated_at
      } as PublishedProgram));

    } catch (error: any) {
      console.error('❌ Erro na busca direta de fallback:', error);
      return [];
    }
  }

  /**
   * Buscar todos os programas publicados
   */
  async getAllPublishedPrograms(filters: ProgramSearchFilters = {}): Promise<PublishedProgram[]> {
    try {
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

      if (filters.priceMin !== undefined) {
        query = query.gte('base_price', filters.priceMin);
      }

      if (filters.priceMax !== undefined) {
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
        if (error.code === '42P01') {
          console.log('⚠️ View não existe - retornando array vazio');
          return [];
        }
        throw error;
      }

      return data as PublishedProgram[] || [];

    } catch (error: any) {
      console.error('❌ Erro ao buscar todos os programas:', error);
      return [];
    }
  }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

export const publishedProgramsService = new PublishedProgramsService();
export default publishedProgramsService;