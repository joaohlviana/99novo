/**
 * 🏃‍♂️ SPORTS SERVICE
 * 
 * Gerencia todas as modalidades esportivas da plataforma.
 * Centraliza dados de esportes, categorias, ícones e metadados.
 */

import { createClient } from '../lib/supabase/client';
import { ServiceResponse, BaseEntity, FilterParams, PaginatedResponse } from './index';

export interface Sport extends BaseEntity {
  name: string;
  slug: string;
  iconUrl?: string;
  icon_name?: string;
  icon_url?: string;
  cover_image_url?: string;
  category: SportCategory | string;
  popularity?: number;
  description?: string;
  equipment?: string[];
  benefits?: string[];
  avgDuration?: number; // minutos por sessão
  caloriesBurn?: number; // calorias por hora
  difficulty?: 'easy' | 'medium' | 'hard';
  isActive?: boolean;
  is_active?: boolean;
  sort_order?: number;
  aliases?: string[]; // nomes alternativos
  relatedSports?: string[]; // IDs de esportes relacionados
  metadata?: SportMetadata;
}

export interface SportCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  description?: string;
  sports: string[]; // IDs dos esportes
}

export interface SportMetadata {
  targetAudience: string[];
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  intensity: number; // 1-10
  equipmentRequired: boolean;
  outdoorActivity: boolean;
  teamSport: boolean;
  competitiveLevel: number; // 1-10
  accessibilityScore: number; // 1-10
}

export interface SportStats {
  totalTrainers: number;
  totalPrograms: number;
  averagePrice: number;
  averageRating: number;
  popularityRank: number;
  growthRate: number; // % último mês
}

// Interface do serviço
export interface ISportsService {
  getAllSports(): Promise<ServiceResponse<Sport[]>>;
  getSportById(id: string): Promise<ServiceResponse<Sport>>;
  getSportBySlug(slug: string): Promise<ServiceResponse<Sport>>;
  getSportsByCategory(categoryId: string): Promise<ServiceResponse<Sport[]>>;
  searchSports(filters: SportFilters): Promise<ServiceResponse<PaginatedResponse<Sport>>>;
  getCategories(): Promise<ServiceResponse<SportCategory[]>>;
  getCategoryById(id: string): Promise<ServiceResponse<SportCategory>>;
  getPopularSports(limit?: number): Promise<ServiceResponse<Sport[]>>;
  getSportStats(sportId: string): Promise<ServiceResponse<SportStats>>;
  getSuggestedSports(userId?: string): Promise<ServiceResponse<Sport[]>>;
}

export interface SportFilters extends FilterParams {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  equipment?: 'none' | 'minimal' | 'full';
  location?: 'indoor' | 'outdoor' | 'both';
  teamSport?: boolean;
  intensity?: [number, number]; // range 1-10
  popularity?: number; // mínimo de popularidade
}

// Implementação do serviço com dados do Supabase
export class SportsService implements ISportsService {
  private supabase = createClient();
  private sports: Sport[] = [];
  private categories: SportCategory[] = [];
  private initialized = false;

  constructor() {
    // Não inicializar automaticamente - será inicializado sob demanda
  }

  private async initializeData(): Promise<void> {
    if (this.initialized) return;

    // Buscar dados do Supabase
    try {
      console.log('🔄 Inicializando dados dos esportes do Supabase...');
      
      const { data: sportsData, error } = await this.supabase
        .from('sports')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar esportes do Supabase:', error);
        throw error;
      }

      console.log('✅ Esportes carregados do Supabase:', sportsData?.length || 0);
      
      // Criar categorias padrão (categorias não vem do DB ainda)
      this.categories = [
        {
          id: 'fitness',
          name: 'Fitness & Academia',
          slug: 'fitness',
          color: '#e0093e',
          icon: '🏋️‍♂️',
          description: 'Atividades focadas em condicionamento físico e força',
          sports: ['musculacao', 'crossfit', 'funcionais', 'yoga', 'alongamento']
        },
        {
          id: 'cardio',
          name: 'Cardio & Resistência',
          slug: 'cardio', 
          color: '#ff6b35',
          icon: '🏃‍♀️',
          description: 'Exercícios cardiovasculares e de resistência',
          sports: ['corrida', 'ciclismo', 'natacao', 'escalada']
        },
        {
          id: 'sports',
          name: 'Esportes',
          slug: 'sports',
          color: '#4ecdc4',
          icon: '⚽',
          description: 'Modalidades esportivas tradicionais',
          sports: ['futebol', 'basquete', 'volei', 'tenis', 'tenis-mesa', 'baseball']
        },
        {
          id: 'combat',
          name: 'Lutas & Artes Marciais',
          slug: 'combat',
          color: '#ff4757',
          icon: '🥊',
          description: 'Modalidades de combate e defesa pessoal',
          sports: ['boxe', 'karate', 'lutas']
        }
      ];

      // Mapear dados do Supabase para formato interno
      this.sports = sportsData?.map(sportData => ({
        id: sportData.id,
        name: sportData.name,
        slug: sportData.slug,
        iconUrl: sportData.icon_url,
        icon_name: sportData.icon_name,
        icon_url: sportData.icon_url,
        cover_image_url: sportData.cover_image_url,
        category: this.findCategoryBySportSlug(sportData.slug) || 'sports',
        popularity: this.calculatePopularity(sportData.slug),
        description: sportData.description,
        equipment: this.getSportEquipment(sportData.slug),
        benefits: this.getSportBenefits(sportData.slug),
        avgDuration: this.getAvgDuration(sportData.slug),
        caloriesBurn: this.getCaloriesBurn(sportData.slug),
        difficulty: this.getDifficulty(sportData.slug),
        isActive: sportData.is_active,
        is_active: sportData.is_active,
        sort_order: sportData.sort_order,
        aliases: this.getAliases(sportData.slug),
        relatedSports: this.getRelatedSports(sportData.slug),
        metadata: this.getSportMetadata(sportData.slug),
        createdAt: sportData.created_at || new Date().toISOString(),
        updatedAt: sportData.updated_at || new Date().toISOString()
      })) || [];

    this.initialized = true;
    } catch (error) {
      console.error('❌ Erro ao inicializar dados dos esportes:', error);
      this.initialized = false;
      throw error;
    }
  }

  async getAllSports(): Promise<ServiceResponse<Sport[]>> {
    try {
      await this.initializeData();
    } catch (error) {
      console.error('❌ Erro ao inicializar dados dos esportes:', error);
      return {
        success: false,
        error: {
          code: 'INITIALIZATION_ERROR',
          message: 'Erro ao carregar dados dos esportes'
        }
      };
    }
    
    return {
      success: true,
      data: this.sports.filter(s => s.isActive),
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }

  async getSportById(id: string): Promise<ServiceResponse<Sport>> {
    return this.getSportByIdOrSlug(id);
  }

  async getSportBySlug(slug: string): Promise<ServiceResponse<Sport>> {
    return this.getSportByIdOrSlug(slug);
  }

  private async getSportByIdOrSlug(identifier: string): Promise<ServiceResponse<Sport>> {
    try {
      console.log(`🔍 Buscando esporte por identificador: ${identifier}`);
      
      // Determinar se é UUID ou slug
      const isUUIDValue = this.isUUID(identifier);
      const field = isUUIDValue ? 'id' : 'slug';
      
      console.log(`📋 Buscando por ${field}: ${identifier}`);
      
      // Buscar direto do Supabase para ter dados sempre atualizados
      const { data: sportData, error } = await this.supabase
        .from('sports')
        .select('*')
        .eq(field, identifier)
        .eq('is_active', true)
        .single();

      if (error || !sportData) {
        console.warn(`⚠️ Esporte não encontrado no Supabase por ${field}: ${identifier}`, error);
        
        // Fallback para dados internos se disponível
        await this.initializeData();
        const sport = this.sports.find(s => s.slug === identifier || s.id === identifier);
        
        if (!sport) {
          return {
            success: false,
            error: {
              code: 'SPORT_NOT_FOUND',
              message: `Esporte com ${field} '${identifier}' não encontrado`
            }
          };
        }
        
        return {
          success: true,
          data: sport,
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'fallback',
            requestId: this.generateRequestId()
          }
        };
      }

      // Mapear dados do Supabase
      const sport: Sport = {
        id: sportData.id,
        name: sportData.name,
        slug: sportData.slug,
        iconUrl: sportData.icon_url,
        icon_name: sportData.icon_name,
        icon_url: sportData.icon_url,
        cover_image_url: sportData.cover_image_url,
        category: this.findCategoryBySportSlug(sportData.slug),
        popularity: this.calculatePopularity(sportData.slug),
        description: sportData.description,
        equipment: this.getSportEquipment(sportData.slug),
        benefits: this.getSportBenefits(sportData.slug),
        avgDuration: this.getAvgDuration(sportData.slug),
        caloriesBurn: this.getCaloriesBurn(sportData.slug),
        difficulty: this.getDifficulty(sportData.slug),
        isActive: sportData.is_active,
        is_active: sportData.is_active,
        sort_order: sportData.sort_order,
        aliases: this.getAliases(sportData.slug),
        relatedSports: this.getRelatedSports(sportData.slug),
        metadata: this.getSportMetadata(sportData.slug),
        createdAt: sportData.created_at || new Date().toISOString(),
        updatedAt: sportData.updated_at || new Date().toISOString()
      };

      console.log(`✅ Esporte encontrado:`, sport.name, sport.cover_image_url ? '(com imagem)' : '(sem imagem)');

      return {
        success: true,
        data: sport,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'supabase',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      console.error('❌ Erro ao buscar esporte:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: `Erro ao buscar esporte: ${error.message}`
        }
      };
    }
  }

  async getSportsByCategory(categoryId: string): Promise<ServiceResponse<Sport[]>> {
    await this.initializeData();
    
    const sports = this.sports.filter(s => s.category.id === categoryId && s.isActive);
    
    return {
      success: true,
      data: sports,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }

  async searchSports(filters: SportFilters): Promise<ServiceResponse<PaginatedResponse<Sport>>> {
    await this.initializeData();
    
    let results = this.sports.filter(s => s.isActive);

    // Aplicar filtros
    if (filters.search) {
      const query = filters.search.toLowerCase();
      results = results.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.aliases?.some(alias => alias.toLowerCase().includes(query))
      );
    }

    if (filters.category) {
      results = results.filter(s => s.category.id === filters.category);
    }

    if (filters.difficulty) {
      results = results.filter(s => s.difficulty === filters.difficulty);
    }

    if (filters.intensity && filters.intensity.length === 2) {
      const [min, max] = filters.intensity;
      results = results.filter(s => s.metadata.intensity >= min && s.metadata.intensity <= max);
    }

    if (filters.teamSport !== undefined) {
      results = results.filter(s => s.metadata.teamSport === filters.teamSport);
    }

    if (filters.equipment) {
      const equipmentRequired = filters.equipment !== 'none';
      results = results.filter(s => s.metadata.equipmentRequired === equipmentRequired);
    }

    if (filters.location) {
      const isOutdoor = filters.location === 'outdoor';
      results = results.filter(s => 
        filters.location === 'both' || s.metadata.outdoorActivity === isOutdoor
      );
    }

    // Ordenação
    if (filters.sortBy) {
      results = this.sortSports(results, filters.sortBy);
    }

    // Paginação
    const page = 1;
    const limit = 50;
    const total = results.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        data: paginatedResults,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: endIndex < total,
          hasPrev: page > 1
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }

  async getCategories(): Promise<ServiceResponse<SportCategory[]>> {
    await this.initializeData();
    
    return {
      success: true,
      data: this.categories,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }

  async getCategoryById(id: string): Promise<ServiceResponse<SportCategory>> {
    await this.initializeData();
    
    const category = this.categories.find(c => c.id === id);
    
    if (!category) {
      return {
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: `Categoria com ID '${id}' não encontrada`
        }
      };
    }

    return {
      success: true,
      data: category,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }

  async getPopularSports(limit = 10): Promise<ServiceResponse<Sport[]>> {
    await this.initializeData();
    
    const popularSports = this.sports
      .filter(s => s.isActive)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);

    return {
      success: true,
      data: popularSports,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }

  async getSportStats(sportId: string): Promise<ServiceResponse<SportStats>> {
    // Mock de estatísticas - em produção viria de analytics
    const mockStats: SportStats = {
      totalTrainers: Math.floor(Math.random() * 100) + 10,
      totalPrograms: Math.floor(Math.random() * 200) + 20,
      averagePrice: Math.floor(Math.random() * 300) + 150,
      averageRating: 4.2 + Math.random() * 0.7,
      popularityRank: Math.floor(Math.random() * 50) + 1,
      growthRate: Math.random() * 30 - 5 // -5% a +25%
    };

    return {
      success: true,
      data: mockStats,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }

  async getSuggestedSports(userId?: string): Promise<ServiceResponse<Sport[]>> {
    await this.initializeData();
    
    // Mock de sugestões baseadas em popularidade
    // Em produção, seria baseado em preferências do usuário, histórico, etc.
    const suggested = this.sports
      .filter(s => s.isActive)
      .sort(() => 0.5 - Math.random()) // randomizar
      .slice(0, 6);

    return {
      success: true,
      data: suggested,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }

  // Métodos auxiliares privados
  private findCategoryBySportId(sportId: string): SportCategory | undefined {
    return this.categories.find(cat => cat.sports.includes(sportId));
  }

  private findCategoryBySportSlug(sportSlug: string): SportCategory | string {
    const category = this.categories.find(cat => cat.sports.includes(sportSlug));
    return category || 'sports';
  }

  private isUUID(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  private calculatePopularity(sportId: string): number {
    const popularityMap: Record<string, number> = {
      'musculacao': 95,
      'corrida': 90,
      'yoga': 85,
      'futebol': 88,
      'natacao': 82,
      'ciclismo': 75,
      'crossfit': 70,
      'basquete': 65,
      'boxe': 60,
      'tenis': 58
    };
    return popularityMap[sportId] || Math.floor(Math.random() * 50) + 30;
  }

  private getSportDescription(sportId: string): string {
    const descriptions: Record<string, string> = {
      'musculacao': 'Treinamento de força com pesos para desenvolvimento muscular e condicionamento físico.',
      'corrida': 'Exercício cardiovascular que melhora resistência, queima calorias e fortalece o sistema cardiorrespiratório.',
      'yoga': 'Prática que combina posturas físicas, respiração e meditação para bem-estar integral.',
      'futebol': 'Esporte coletivo que desenvolve coordenação, resistência e trabalho em equipe.',
      'natacao': 'Exercício completo que trabalha todos os grupos musculares com baixo impacto articular.'
    };
    return descriptions[sportId] || 'Modalidade esportiva para desenvolvimento físico e bem-estar.';
  }

  private getSportEquipment(sportId: string): string[] {
    const equipmentMap: Record<string, string[]> = {
      'musculacao': ['Halteres', 'Barras', 'Anilhas', 'Máquinas'],
      'corrida': ['Tênis adequado', 'Roupas confortáveis'],
      'yoga': ['Tapete de yoga', 'Blocos', 'Cintas'],
      'natacao': ['Maiô/Sunga', 'Óculos', 'Touca'],
      'boxe': ['Luvas', 'Bandagens', 'Saco de pancadas']
    };
    return equipmentMap[sportId] || ['Equipamentos básicos'];
  }

  private getSportBenefits(sportId: string): string[] {
    return [
      'Melhora condicionamento físico',
      'Reduz estresse',
      'Aumenta autoestima',
      'Fortalece músculos',
      'Melhora flexibilidade'
    ];
  }

  private getAvgDuration(sportId: string): number {
    const durationMap: Record<string, number> = {
      'musculacao': 60,
      'corrida': 45,
      'yoga': 90,
      'futebol': 90,
      'natacao': 60
    };
    return durationMap[sportId] || 60;
  }

  private getCaloriesBurn(sportId: string): number {
    const caloriesMap: Record<string, number> = {
      'musculacao': 300,
      'corrida': 500,
      'yoga': 200,
      'futebol': 400,
      'natacao': 450
    };
    return caloriesMap[sportId] || 250;
  }

  private getDifficulty(sportId: string): 'easy' | 'medium' | 'hard' {
    const difficultyMap: Record<string, 'easy' | 'medium' | 'hard'> = {
      'yoga': 'easy',
      'corrida': 'medium',
      'musculacao': 'medium',
      'crossfit': 'hard',
      'ginastica-artistica': 'hard'
    };
    return difficultyMap[sportId] || 'medium';
  }

  private getAliases(sportId: string): string[] {
    const aliasMap: Record<string, string[]> = {
      'musculacao': ['Bodybuilding', 'Malhação', 'Academia'],
      'corrida': ['Running', 'Jogging', 'Cooper'],
      'futebol': ['Soccer', 'Football']
    };
    return aliasMap[sportId] || [];
  }

  private getRelatedSports(sportId: string): string[] {
    const relatedMap: Record<string, string[]> = {
      'musculacao': ['crossfit', 'funcionais'],
      'corrida': ['ciclismo', 'natacao'],
      'yoga': ['alongamento', 'funcionais']
    };
    return relatedMap[sportId] || [];
  }

  private getSportMetadata(sportId: string): SportMetadata {
    return {
      targetAudience: ['Adultos', 'Jovens'],
      primaryMuscles: ['Core', 'Pernas'],
      skillLevel: 'beginner',
      intensity: Math.floor(Math.random() * 6) + 5, // 5-10
      equipmentRequired: !['corrida', 'yoga', 'alongamento'].includes(sportId),
      outdoorActivity: ['corrida', 'ciclismo', 'futebol'].includes(sportId),
      teamSport: ['futebol', 'basquete', 'volei'].includes(sportId),
      competitiveLevel: Math.floor(Math.random() * 10) + 1,
      accessibilityScore: Math.floor(Math.random() * 5) + 6
    };
  }

  private sortSports(sports: Sport[], sortBy: string): Sport[] {
    switch (sortBy) {
      case 'popularity':
        return sports.sort((a, b) => b.popularity - a.popularity);
      case 'name':
        return sports.sort((a, b) => a.name.localeCompare(b.name));
      case 'difficulty':
        const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
        return sports.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
      default:
        return sports;
    }
  }

  private generateRequestId(): string {
    return `sports_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

// Instância singleton do serviço
export const sportsService = new SportsService();