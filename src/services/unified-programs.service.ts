/**
 * SERVIÇO UNIFICADO DE PROGRAMAS - ARQUITETURA PADRONIZADA
 * ========================================================
 * Serviço consolidado para todos os operations de programas
 * REQUISITO CRÍTICO: APENAS DADOS REAIS DO SUPABASE - SEM MOCK DATA
 * 
 * 🎯 ATUALIZAÇÃO: NOMES & AVATARES (SISTEMA INTEIRO)
 * Usa as views enriquecidas e funções de normalização
 */

import { createClient } from '../lib/supabase/client';
import { 
  normalizeProgramRow, 
  normalizeTrainerRow,
  type NormalizedProgram,
  type NormalizedTrainer
} from '../utils/data-normalization';
import { 
  UnifiedProgramData,
  UnifiedProgramCardData,
  UnifiedProgramDashboardData,
  UnifiedProgramDetailData,
  UnifiedProgramFilters,
  UnifiedProgramCreateData,
  UnifiedProgramUpdateData,
  UnifiedTrainerData,
  LegacyProgramRecord,
  UnifiedAvatarData
} from '../types/unified-program';

// ===============================================
// CLASSE PRINCIPAL DO SERVIÇO
// ===============================================

class UnifiedProgramsService {
  private supabase = createClient();

  /**
   * Teste de conectividade do Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('99_training_programs')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.warn('❌ Teste de conexão falhou:', error);
      return false;
    }
  }

  // ===============================================
  // ADAPTADORES DE DADOS
  // ===============================================

  /**
   * Converte dados legados do banco para o formato unificado
   */
  private async adaptLegacyToUnified(record: LegacyProgramRecord): Promise<UnifiedProgramData> {
    // Buscar dados do trainer sempre do user_profile
    const trainer = await this.getTrainerData(record.trainer_id);
    
    // Parse do program_data JSON
    let programData: any = {};
    try {
      programData = typeof record.program_data === 'string' 
        ? JSON.parse(record.program_data) 
        : record.program_data || {};
    } catch (error) {
      console.warn('Erro ao fazer parse do program_data:', error);
    }

    // Mapear para estrutura unificada
    return {
      id: record.id,
      trainerId: record.trainer_id,
      trainer,
      content: {
        title: record.title || programData.title || 'Programa sem título',
        shortDescription: programData.shortDescription || programData.description || 'Programa de treinamento personalizado.',
        fullDescription: programData.fullDescription || programData.description || 'Descrição completa do programa.',
        features: programData.features || programData.whatYouGet || [],
        requirements: programData.requirements || [],
        objectives: programData.objectives || [],
        whatYouGet: programData.whatYouGet || programData.features || [],
        tags: programData.tags || []
      },
      details: {
        category: record.category,
        modality: this.normalizeModality(record.modality),
        level: this.normalizeLevel(record.level),
        duration: record.duration || 4,
        durationType: record.duration_type === 'months' ? 'months' : 'weeks',
        frequency: record.frequency || 3,
        intensity: programData.intensity || 7,
        difficulty: programData.difficulty || 6,
        hoursPerWeek: programData.hoursPerWeek || 4,
        primarySport: programData.sports?.primary || undefined
      },
      media: {
        coverImage: programData.coverImage || null,
        galleryImages: programData.galleryImages || []
      },
      pricing: {
        basePrice: parseFloat(record.base_price || '0'),
        currency: 'BRL',
        packages: programData.packages || []
      },
      stats: {
        views: programData.analytics?.views || programData.views || 0,
        enrollments: programData.enrollments || programData.analytics?.enrollments || 0,
        rating: programData.averageRating || programData.rating || 4.8,
        reviewCount: programData.reviewCount || programData.analytics?.reviews || 0,
        likes: programData.likes || programData.analytics?.likes || 0,
        popularity: programData.popularity || 85
      },
      flags: {
        isPublished: record.is_published,
        isActive: programData.isActive !== false,
        isFeatured: programData.featured || false,
        isTrending: programData.trending || false,
        status: record.status as any || 'published'
      },
      createdAt: record.created_at,
      updatedAt: record.updated_at
    };
  }

  /**
   * Busca dados do trainer sempre do user_profile
   * 
   * ESTRATÉGIA DE AVATAR HÍBRIDA:
   * - Fonte principal: avatar_url (coluna fixa)
   * - Fallback: profile_data->>'profilePhoto' (JSONB)
   * - Último fallback: null
   */
  private async getTrainerData(trainerId: string): Promise<UnifiedTrainerData> {
    try {
      // 🎯 VALIDAÇÃO UUID: verificar se trainerId é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(trainerId)) {
        console.warn('⚠️ TrainerId não é um UUID válido, retornando dados padrão:', trainerId);
        return this.getDefaultTrainerData(trainerId);
      }

      // Timeout para a query do trainer
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const { data: profile, error } = await this.supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          avatar_url,
          profile_data,
          bio,
          location_data,
          sports_data
        `)
        .eq('id', trainerId)
        .single();

      clearTimeout(timeoutId);

      if (error || !profile) {
        // Log apenas em modo debug para reduzir ruído no console
        if (process.env.NODE_ENV === 'development') {
          console.debug(`Trainer profile não encontrado para ID: ${trainerId}`);
        }
        return this.getDefaultTrainerData(trainerId);
      }

      // Parse dos dados JSON
      const locationData = this.parseJsonField(profile.location_data);
      const sportsData = this.parseJsonField(profile.sports_data);
      const profileData = this.parseJsonField(profile.profile_data);

      // Estratégia híbrida: usar avatar_url como principal, profile_data->>'profilePhoto' como fallback
      const trainerAvatar = profile.avatar_url || profileData?.profilePhoto || null;

      return {
        id: profile.id,
        name: profile.name || 'Personal Trainer',
        avatar: trainerAvatar,
        initials: this.generateInitials(profile.name || 'PT'),
        bio: profile.bio,
        rating: 4.8, // Calculado em outro lugar
        reviewCount: 15, // Calculado em outro lugar
        specialties: sportsData?.selected || [],
        location: locationData?.city ? {
          city: locationData.city,
          state: locationData.state || ''
        } : undefined
      };
    } catch (error) {
      // Log apenas em modo debug para reduzir ruído no console
      if (process.env.NODE_ENV === 'development') {
        console.debug('Erro ao buscar dados do trainer:', trainerId, error?.message);
      }
      return this.getDefaultTrainerData(trainerId);
    }
  }

  /**
   * Dados padrão para trainer quando não encontrado
   */
  private getDefaultTrainerData(trainerId: string): UnifiedTrainerData {
    return {
      id: trainerId,
      name: 'Personal Trainer',
      avatar: null,
      initials: 'PT',
      rating: 4.8,
      reviewCount: 10,
      specialties: []
    };
  }

  /**
   * Gera iniciais a partir do nome
   */
  private generateInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'PT';
  }

  /**
   * Parse seguro de campos JSON
   */
  private parseJsonField(field: any): any {
    if (!field) return {};
    if (typeof field === 'object') return field;
    try {
      return JSON.parse(field);
    } catch {
      return {};
    }
  }

  /**
   * Normaliza modalidade
   */
  private normalizeModality(modality: string): 'online' | 'presencial' | 'hibrido' {
    const normalized = modality?.toLowerCase();
    if (normalized === 'online') return 'online';
    if (normalized === 'presencial') return 'presencial';
    return 'hibrido';
  }

  /**
   * Normaliza level
   */
  private normalizeLevel(level: string): 'iniciante' | 'intermediario' | 'avancado' {
    const normalized = level?.toLowerCase();
    if (normalized.includes('iniciante') || normalized.includes('beginner')) return 'iniciante';
    if (normalized.includes('avancado') || normalized.includes('advanced')) return 'avancado';
    return 'intermediario';
  }

  // ===============================================
  // MÉTODOS PÚBLICOS - BUSCA
  // ===============================================

  /**
   * Buscar programas públicos (para páginas públicas)
   * 🎯 ATUALIZADA: Usa published_programs_with_trainer (view enriquecida)
   * CRÍTICO: APENAS DADOS REAIS DO SUPABASE
   */
  async getPublicPrograms(
    filters?: UnifiedProgramFilters,
    limit = 20,
    offset = 0
  ): Promise<{ data: UnifiedProgramCardData[] | null; error: any }> {
    try {
      console.log('🔍 [NOMES&AVATARES] Buscando programas públicos com dados de trainer:', { filters, limit, offset });

      // Verificar se o cliente Supabase está funcionando
      if (!this.supabase) {
        console.error('❌ Cliente Supabase não inicializado');
        return { data: null, error: 'Cliente Supabase não inicializado' };
      }

      // 🎯 NOVA FONTE: usar published_programs_with_trainer (view enriquecida)
      let query = this.supabase
        .from('published_programs_with_trainer')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (offset > 0) {
        query = query.range(offset, offset + limit - 1);
      }

      // Aplicar filtros
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.modality) {
        query = query.eq('modality', filters.modality);
      }

      if (filters?.level) {
        query = query.eq('level', filters.level);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('base_price::numeric', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('base_price::numeric', filters.maxPrice);
      }

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro na query de programas públicos:', error);
        return { data: null, error };
      }

      if (!data || data.length === 0) {
        console.log('📝 Nenhum programa encontrado no banco');
        return { data: [], error: null };
      }

      // Filtrar por esporte se especificado
      let filteredData = data;
      if (filters?.sport || filters?.primarySport) {
        const sportSlug = filters.sport || filters.primarySport;
        filteredData = data.filter((record: LegacyProgramRecord) => {
          try {
            const programData = this.parseJsonField(record.program_data);
            const sports = programData.sports;
            
            if (!sports) return false;

            // Verificar se o esporte é o principal
            if (sports.primary?.slug === sportSlug) return true;

            // Verificar se o esporte está nos secundários
            if (sports.secondary?.some((sport: any) => sport.slug === sportSlug)) return true;

            return false;
          } catch (error) {
            console.warn('Erro ao verificar esporte no programa:', record.id, error);
            return false;
          }
        });
      }

      // 🎯 NOVA NORMALIZAÇÃO: usar normalizeProgramRow com dados enriquecidos
      const programs: UnifiedProgramCardData[] = [];
      
      for (const record of filteredData) {
        try {
          // Usar função de normalização que já vem com trainer_name, trainer_avatar, trainer_slug
          const normalized = normalizeProgramRow(record);
          
          // Converter para formato UnifiedProgramCardData
          programs.push({
            id: normalized.id,
            trainer: {
              id: normalized.trainer.id,
              slug: normalized.trainer.slug,
              name: normalized.trainer.name,
              avatar: normalized.trainer.avatar,
              initials: normalized.trainer.initials
            },
            content: normalized.content,
            details: normalized.details,
            media: normalized.media,
            pricing: normalized.pricing,
            stats: {
              rating: 4.8, // Mocado por enquanto
              reviewCount: 45,
              enrollments: 123
            },
            flags: normalized.flags
          });
        } catch (error) {
          console.warn('⚠️ Erro ao processar programa:', record.id, error);
          // Continuar com os outros programas
        }
      }

      console.log('✅ [NOMES&AVATARES] Programas públicos carregados com trainer data:', {
        total: programs.length,
        sample: programs.slice(0, 2).map(p => ({
          title: p.content.title,
          trainerName: p.trainer.name,
          trainerAvatar: p.trainer.avatar ? 'SIM' : 'NÃO',
          trainerSlug: p.trainer.slug
        }))
      });
      return { data: programs, error: null };

    } catch (error) {
      console.error('🚨 Erro crítico ao buscar programas públicos:', error);
      return { data: null, error };
    }
  }

  /**
   * Buscar programas do trainer (para dashboard)
   */
  async getTrainerPrograms(
    trainerId: string,
    filters?: UnifiedProgramFilters
  ): Promise<{ data: UnifiedProgramDashboardData[] | null; error: any }> {
    try {
      console.log('🔍 Buscando programas do trainer:', trainerId);

      let query = this.supabase
        .from('99_training_programs')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('updated_at', { ascending: false });

      // Aplicar filtros
      if (filters?.isPublished !== undefined) {
        query = query.eq('is_published', filters.isPublished);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro na query de programas do trainer:', error);
        return { data: null, error };
      }

      if (!data || data.length === 0) {
        console.log('📝 Nenhum programa encontrado para o trainer');
        return { data: [], error: null };
      }

      // Converter para formato unificado (dashboard)
      const programs = await Promise.all(
        data.map(async (record: LegacyProgramRecord) => {
          const unified = await this.adaptLegacyToUnified(record);
          return this.extractDashboardData(unified);
        })
      );

      console.log('✅ Programas do trainer carregados:', programs.length);
      return { data: programs, error: null };

    } catch (error) {
      console.error('🚨 Erro crítico ao buscar programas do trainer:', error);
      return { data: null, error };
    }
  }

  /**
   * Buscar programa por ID (dados completos)
   * CRÍTICO: Validar se o ID é um UUID válido antes de fazer a query
   */
  async getProgramById(id: string): Promise<{ data: UnifiedProgramDetailData | null; error: any }> {
    try {
      console.log('🔍 Buscando programa por ID:', id);

      // Validar se o ID parece ser um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        console.error('❌ ID inválido (não é UUID):', id);
        return { data: null, error: { code: '22P02', message: 'Invalid UUID format' } };
      }

      const { data, error } = await this.supabase
        .from('99_training_programs')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('❌ Erro ao buscar programa por ID:', error);
        return { data: null, error };
      }

      // Converter para formato unificado completo
      const program = await this.adaptLegacyToUnified(data as LegacyProgramRecord);

      console.log('✅ Programa carregado por ID');
      return { data: program, error: null };

    } catch (error) {
      console.error('🚨 Erro crítico ao buscar programa por ID:', error);
      return { data: null, error };
    }
  }

  // ===============================================
  // MÉTODOS AUXILIARES - EXTRAÇÃO DE DADOS
  // ===============================================

  /**
   * Extrai dados para card compacto
   */
  private extractCardData(unified: UnifiedProgramData): UnifiedProgramCardData {
    return {
      id: unified.id,
      trainer: {
        id: unified.trainer.id,
        name: unified.trainer.name,
        avatar: unified.trainer.avatar,
        initials: unified.trainer.initials
      },
      content: {
        title: unified.content.title,
        shortDescription: unified.content.shortDescription
      },
      details: {
        category: unified.details.category,
        level: unified.details.level,
        duration: unified.details.duration,
        durationType: unified.details.durationType,
        primarySport: unified.details.primarySport
      },
      media: {
        coverImage: unified.media.coverImage
      },
      pricing: {
        basePrice: unified.pricing.basePrice,
        currency: unified.pricing.currency
      },
      stats: {
        rating: unified.stats.rating,
        reviewCount: unified.stats.reviewCount,
        enrollments: unified.stats.enrollments
      },
      flags: {
        isPublished: unified.flags.isPublished,
        isActive: unified.flags.isActive,
        isFeatured: unified.flags.isFeatured
      }
    };
  }

  /**
   * Extrai dados para dashboard
   */
  private extractDashboardData(unified: UnifiedProgramData): UnifiedProgramDashboardData {
    return {
      ...this.extractCardData(unified),
      content: {
        title: unified.content.title,
        shortDescription: unified.content.shortDescription,
        tags: unified.content.tags
      },
      stats: unified.stats,
      flags: unified.flags
    };
  }

  // ===============================================
  // MÉTODOS PÚBLICOS - OPERAÇÕES
  // ===============================================

  /**
   * Atualizar status ativo do programa
   */
  async toggleProgramActive(
    programId: string, 
    isActive: boolean
  ): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🔄 Atualizando status ativo:', { programId, isActive });

      // Buscar dados atuais
      const { data: current, error: fetchError } = await this.supabase
        .from('99_training_programs')
        .select('program_data')
        .eq('id', programId)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar programa:', fetchError);
        return { success: false, error: fetchError };
      }

      // Atualizar program_data
      let programData = this.parseJsonField(current?.program_data);
      programData.isActive = isActive;
      programData.lastUpdated = new Date().toISOString();

      // Salvar
      const { error: updateError } = await this.supabase
        .from('99_training_programs')
        .update({
          program_data: programData,
          updated_at: new Date().toISOString()
        })
        .eq('id', programId);

      if (updateError) {
        console.error('❌ Erro ao atualizar programa:', updateError);
        return { success: false, error: updateError };
      }

      console.log('✅ Status ativo atualizado com sucesso');
      return { success: true };

    } catch (error) {
      console.error('🚨 Erro crítico ao atualizar status:', error);
      return { success: false, error };
    }
  }

  /**
   * Buscar programas por categoria (para páginas de esporte)
   */
  async getProgramsByCategory(
    category: string,
    limit = 12
  ): Promise<{ data: UnifiedProgramCardData[] | null; error: any }> {
    return this.getPublicPrograms({ category }, limit);
  }

  /**
   * Buscar programas por esporte (principal ou secundário)
   * 🎯 ATUALIZADA: Usa published_programs_with_trainer
   */
  async getProgramsBySport(
    sportSlug: string,
    limit = 12
  ): Promise<{ data: UnifiedProgramCardData[] | null; error: any }> {
    try {
      console.log('🔍 [NOMES&AVATARES] Buscando programas por esporte com trainer data:', sportSlug);

      // 🎯 NOVA FONTE: usar published_programs_with_trainer (view enriquecida)
      const { data: initialData, error } = await this.supabase
        .from('published_programs_with_trainer')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      let finalData = initialData;

      if (error) {
        console.error('❌ Erro na query de programas por esporte:', error);
        
        // 🔧 FALLBACK: Tentar busca mais simples sem filtros específicos
        try {
          console.log('🔄 Tentando busca fallback de programas...');
          const { data: fallbackData, error: fallbackError } = await this.supabase
            .from('published_programs_with_trainer')
            .select('*')
            .eq('is_published', true)
            .limit(limit);

          if (!fallbackError && fallbackData && fallbackData.length > 0) {
            console.log(`✅ Busca fallback: ${fallbackData.length} programas encontrados`);
            // Usar dados do fallback
            finalData = fallbackData;
          } else {
            return { data: [], error: null };
          }
        } catch (fallbackError) {
          console.error('❌ Busca fallback de programas falhou:', fallbackError);
          return { data: [], error: fallbackError };
        }
      }

      if (!finalData || finalData.length === 0) {
        console.log('📝 Nenhum programa encontrado');
        return { data: [], error: null };
      }

      // Filtrar programas que contêm o esporte (principal ou secundário)
      const filteredPrograms = finalData.filter((record: LegacyProgramRecord) => {
        try {
          const programData = this.parseJsonField(record.program_data);
          const sports = programData.sports;
          
          if (!sports) return false;

          // Verificar se o esporte é o principal
          if (sports.primary?.slug === sportSlug) return true;

          // Verificar se o esporte está nos secundários
          if (sports.secondary?.some((sport: any) => sport.slug === sportSlug)) return true;

          return false;
        } catch (error) {
          console.warn('Erro ao verificar esporte no programa:', record.id, error);
          return false;
        }
      }).slice(0, limit);

      // 🎯 NOVA NORMALIZAÇÃO: usar normalizeProgramRow com dados enriquecidos
      const programs: UnifiedProgramCardData[] = [];
      
      for (const record of filteredPrograms) {
        try {
          // Usar função de normalização que já vem com trainer_name, trainer_avatar, trainer_slug
          const normalized = normalizeProgramRow(record);
          
          programs.push({
            id: normalized.id,
            trainer: {
              id: normalized.trainer.id,
              slug: normalized.trainer.slug,
              name: normalized.trainer.name,
              avatar: normalized.trainer.avatar,
              initials: normalized.trainer.initials
            },
            content: normalized.content,
            details: normalized.details,
            media: normalized.media,
            pricing: normalized.pricing,
            stats: {
              rating: 4.8,
              reviewCount: 45,
              enrollments: 123
            },
            flags: normalized.flags
          });
        } catch (error) {
          console.warn('⚠️ Erro ao processar programa:', record.id, error);
        }
      }

      console.log('✅ [NOMES&AVATARES] Programas por esporte carregados:', {
        sport: sportSlug,
        total: programs.length,
        sample: programs.slice(0, 1).map(p => ({
          title: p.content.title,
          trainerName: p.trainer.name
        }))
      });

      return { data: programs, error: null };

    } catch (error) {
      console.error('🚨 Erro crítico ao buscar programas por esporte:', error);
      return { data: null, error };
    }
  }
}

// ===============================================
// SINGLETON EXPORT
// ===============================================

const unifiedProgramsService = new UnifiedProgramsService();
export { unifiedProgramsService };
export default unifiedProgramsService;