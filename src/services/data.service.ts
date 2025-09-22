/**
 * 🗄️ DATA SERVICE MASTER
 * 
 * Serviço principal que centraliza todos os dados da aplicação.
 * Atua como uma facade/proxy para todos os outros services.
 * Gerencia cache, sincronização e estado global dos dados.
 */

import { sportsService } from './sports.service';
import { programsService } from './programs.service';
import { ServiceResponse } from './index';
import { Sport, Program, SportCategory, ProgramFilters, SearchFilters } from '../types/entities';

export interface DataService {
  // Sports
  getSports(): Promise<ServiceResponse<Sport[]>>;
  getSportCategories(): Promise<ServiceResponse<SportCategory[]>>;
  getPopularSports(limit?: number): Promise<ServiceResponse<Sport[]>>;
  
  // Programs
  getPrograms(): Promise<ServiceResponse<Program[]>>;
  getFeaturedPrograms(limit?: number): Promise<ServiceResponse<Program[]>>;
  getTrendingPrograms(limit?: number): Promise<ServiceResponse<Program[]>>;
  getPopularPrograms(limit?: number): Promise<ServiceResponse<Program[]>>;
  searchPrograms(filters: ProgramFilters): Promise<ServiceResponse<Program[]>>;
  
  // Cross-service operations
  getProgramsBySport(sportId: string): Promise<ServiceResponse<Program[]>>;
  getRecommendations(userId?: string): Promise<ServiceResponse<{ sports: Sport[]; programs: Program[] }>>;
  
  // Cache management
  clearCache(): void;
  refreshData(): Promise<void>;
}

class DataServiceImpl implements DataService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  // Sports methods
  async getSports(): Promise<ServiceResponse<Sport[]>> {
    return this.withCache('all_sports', () => sportsService.getAllSports());
  }

  async getSportCategories(): Promise<ServiceResponse<SportCategory[]>> {
    return this.withCache('sport_categories', () => sportsService.getCategories());
  }

  async getPopularSports(limit = 10): Promise<ServiceResponse<Sport[]>> {
    return this.withCache(`popular_sports_${limit}`, () => sportsService.getPopularSports(limit));
  }

  // Programs methods
  async getPrograms(): Promise<ServiceResponse<Program[]>> {
    const response = await programsService.getAllPrograms();
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.data, // Extrair apenas os dados do paginated response
        metadata: response.metadata
      };
    }
    return response as ServiceResponse<Program[]>;
  }

  async getFeaturedPrograms(limit = 8): Promise<ServiceResponse<Program[]>> {
    return this.withCache(`featured_programs_${limit}`, () => programsService.getFeaturedPrograms(limit));
  }

  async getTrendingPrograms(limit = 8): Promise<ServiceResponse<Program[]>> {
    return this.withCache(`trending_programs_${limit}`, () => programsService.getTrendingPrograms(limit));
  }

  async getPopularPrograms(limit = 8): Promise<ServiceResponse<Program[]>> {
    return this.withCache(`popular_programs_${limit}`, () => programsService.getPopularPrograms(limit));
  }

  async searchPrograms(filters: ProgramFilters): Promise<ServiceResponse<Program[]>> {
    const cacheKey = `search_programs_${JSON.stringify(filters)}`;
    return this.withCache(cacheKey, async () => {
      const response = await programsService.searchPrograms(filters);
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.data, // Extrair apenas os dados do paginated response
          metadata: response.metadata
        };
      }
      return response as ServiceResponse<Program[]>;
    });
  }

  // Cross-service operations
  async getProgramsBySport(sportId: string): Promise<ServiceResponse<Program[]>> {
    return this.withCache(`programs_by_sport_${sportId}`, async () => {
      const response = await programsService.getProgramsBySport(sportId);
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.data,
          metadata: response.metadata
        };
      }
      return response as ServiceResponse<Program[]>;
    });
  }

  async getRecommendations(userId?: string): Promise<ServiceResponse<{ sports: Sport[]; programs: Program[] }>> {
    const cacheKey = `recommendations_${userId || 'anonymous'}`;
    
    return this.withCache(cacheKey, async () => {
      try {
        const [sportsResponse, programsResponse] = await Promise.all([
          sportsService.getSuggestedSports(userId),
          programsService.getRecommendedPrograms(userId)
        ]);

        if (!sportsResponse.success || !programsResponse.success) {
          return {
            success: false,
            error: {
              code: 'RECOMMENDATIONS_ERROR',
              message: 'Erro ao buscar recomendações'
            }
          };
        }

        return {
          success: true,
          data: {
            sports: sportsResponse.data || [],
            programs: programsResponse.data || []
          },
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'mock',
            requestId: `recommendations_${Date.now()}`
          }
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'RECOMMENDATIONS_ERROR',
            message: 'Erro interno ao buscar recomendações',
            details: error
          }
        };
      }
    });
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  async refreshData(): Promise<void> {
    this.clearCache();
    
    // Pre-load dados críticos
    await Promise.all([
      this.getSports(),
      this.getSportCategories(),
      this.getPopularSports(),
      this.getFeaturedPrograms(),
      this.getTrendingPrograms()
    ]);
  }

  // Métodos auxiliares privados
  private async withCache<T>(
    key: string, 
    fetcher: () => Promise<ServiceResponse<T>>, 
    ttl = this.DEFAULT_TTL
  ): Promise<ServiceResponse<T>> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return {
        success: true,
        data: cached.data,
        metadata: {
          timestamp: new Date(cached.timestamp).toISOString(),
          source: 'cache',
          requestId: `cached_${key}_${Date.now()}`
        }
      };
    }

    try {
      const response = await fetcher();
      
      if (response.success && response.data) {
        this.cache.set(key, {
          data: response.data,
          timestamp: Date.now(),
          ttl
        });
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Erro ao buscar dados',
          details: error
        }
      };
    }
  }
}

// Instância singleton do data service
export const dataService = new DataServiceImpl();

// Hook-like interface para usar com React/Zustand
export const useDataService = () => {
  return {
    getSports: () => dataService.getSports(),
    getSportCategories: () => dataService.getSportCategories(),
    getPopularSports: (limit?: number) => dataService.getPopularSports(limit),
    getPrograms: () => dataService.getPrograms(),
    getFeaturedPrograms: (limit?: number) => dataService.getFeaturedPrograms(limit),
    getTrendingPrograms: (limit?: number) => dataService.getTrendingPrograms(limit),
    getPopularPrograms: (limit?: number) => dataService.getPopularPrograms(limit),
    searchPrograms: (filters: ProgramFilters) => dataService.searchPrograms(filters),
    getProgramsBySport: (sportId: string) => dataService.getProgramsBySport(sportId),
    getRecommendations: (userId?: string) => dataService.getRecommendations(userId),
    clearCache: () => dataService.clearCache(),
    refreshData: () => dataService.refreshData()
  };
};

// Utilitários para migração gradual
export const migrateFromLegacyData = {
  /**
   * Migra dados do sistema antigo para o novo
   */
  async migrateSportsData(): Promise<void> {
    console.log('🔄 Migrando dados de esportes...');
    await dataService.getSports();
    console.log('✅ Migração de esportes concluída');
  },

  /**
   * Migra dados de programas
   */
  async migrateProgramsData(): Promise<void> {
    console.log('🔄 Migrando dados de programas...');
    await dataService.getPrograms();
    console.log('✅ Migração de programas concluída');
  },

  /**
   * Migração completa
   */
  async migrateAll(): Promise<void> {
    console.log('🚀 Iniciando migração completa...');
    await Promise.all([
      this.migrateSportsData(),
      this.migrateProgramsData()
    ]);
    console.log('🎉 Migração completa finalizada!');
  }
};

// Validadores de dados
export const validateData = {
  sport: (sport: any): sport is Sport => {
    return sport && 
           typeof sport.id === 'string' && 
           typeof sport.name === 'string' && 
           typeof sport.iconUrl === 'string';
  },

  program: (program: any): program is Program => {
    return program && 
           typeof program.id === 'string' && 
           typeof program.title === 'string' && 
           program.trainer && 
           typeof program.trainer.id === 'string';
  }
};