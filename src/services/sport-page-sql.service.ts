/**
 * 🎯 SPORT PAGE SQL SERVICE
 * ========================
 * Integra as funções SQL otimizadas com o frontend da SportPage
 * 
 * FUNÇÕES INTEGRADAS:
 * - trainers_search_by_sports() - busca treinadores via perfil OU programas  
 * - sportpage_kpis() - estatísticas da página (total trainers, programs, min price)
 * 
 * CARACTERÍSTICAS:
 * ✅ Suporte a acentos/case insensitive (norm_text + expand_sports)
 * ✅ União perfil + programas (treinadores aparecem mesmo só tendo programa no esporte)
 * ✅ KPIs corretos e consistentes
 * ✅ Títulos de programas incluídos (sample_program_titles)
 */

import { supabase } from '../lib/supabase/client';
import sportMappingService from './sport-mapping.service';

// Interface para trainer retornado pela função SQL
export interface SqlTrainerResult {
  trainer_id: string;
  slug: string;
  name: string;
  avatar: string | null;
  sources: string[]; // ['profile'] | ['program'] | ['profile', 'program']
  sample_program_titles: string[] | null;
}

// Interface para KPIs da SportPage
export interface SportPageKpis {
  total_trainers: number;
  total_programs: number;
  min_price: number | null;
}

// Interface para dados consolidados da SportPage
export interface SportPageData {
  trainers: SqlTrainerResult[];
  kpis: SportPageKpis;
  sportName: string;
  searchVariations: string[];
}

/**
 * Service para integrar com as funções SQL da SportPage
 */
export class SportPageSqlService {
  
  /**
   * Busca treinadores por esporte usando função SQL otimizada
   * @param sports Array de esportes para buscar
   * @param limit Número máximo de resultados
   * @param offset Offset para paginação
   */
  async searchTrainersBySports(
    sports: string[],
    limit: number = 30,
    offset: number = 0
  ): Promise<{ success: boolean; data: SqlTrainerResult[]; error?: any }> {
    try {
      console.log(`🔍 SportPageSQL: Buscando treinadores para esportes:`, sports);
      
      const { data, error } = await supabase.rpc('trainers_search_by_sports', {
        _sports: sports,
        _limit: limit,
        _offset: offset
      });

      if (error) {
        console.error('❌ Erro na busca SQL de treinadores:', error);
        return { success: false, data: [], error };
      }

      console.log(`✅ SportPageSQL: ${data?.length || 0} treinadores encontrados`);
      
      // Log das fontes dos treinadores
      if (data?.length > 0) {
        const sourceStats = data.reduce((acc, trainer) => {
          trainer.sources.forEach(source => {
            acc[source] = (acc[source] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>);
        console.log(`📊 Fontes dos treinadores:`, sourceStats);
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Erro crítico na busca SQL de treinadores:', error);
      return { success: false, data: [], error };
    }
  }

  /**
   * Busca KPIs da SportPage usando função SQL otimizada
   * @param sports Array de esportes para calcular estatísticas
   */
  async getSportPageKpis(
    sports: string[]
  ): Promise<{ success: boolean; data: SportPageKpis | null; error?: any }> {
    try {
      console.log(`📊 SportPageSQL: Calculando KPIs para esportes:`, sports);
      
      const { data, error } = await supabase.rpc('sportpage_kpis', {
        _sports: sports
      });

      if (error) {
        console.error('❌ Erro no cálculo de KPIs:', error);
        return { success: false, data: null, error };
      }

      const kpis = data?.[0];
      if (kpis) {
        console.log(`✅ SportPageSQL: KPIs calculados:`, {
          total_trainers: kpis.total_trainers,
          total_programs: kpis.total_programs,
          min_price: kpis.min_price
        });
      }

      return { success: true, data: kpis || null };
    } catch (error) {
      console.error('❌ Erro crítico no cálculo de KPIs:', error);
      return { success: false, data: null, error };
    }
  }

  /**
   * Método consolidado para buscar todos os dados da SportPage
   * @param sportSlug Slug do esporte (ex: 'crossfit', 'musculacao')
   * @param limit Número máximo de treinadores
   * @param offset Offset para paginação
   */
  async getSportPageData(
    sportSlug: string,
    limit: number = 30,
    offset: number = 0
  ): Promise<{ success: boolean; data: SportPageData | null; error?: any }> {
    try {
      console.log(`🏃 SportPageSQL: Carregando dados completos para esporte: ${sportSlug}`);
      
      // 1. Obter variações de busca usando SportMappingService
      const searchVariations = sportMappingService.getSearchVariationsForSport(sportSlug);
      console.log(`🎯 SportMapping: ${searchVariations.length} variações para "${sportSlug}":`, searchVariations);
      
      // 2. Buscar treinadores e KPIs em paralelo
      const [trainersResponse, kpisResponse] = await Promise.allSettled([
        this.searchTrainersBySports(searchVariations, limit, offset),
        this.getSportPageKpis(searchVariations)
      ]);

      // 3. Processar resultados
      let trainersData: SqlTrainerResult[] = [];
      let kpisData: SportPageKpis | null = null;
      let hasErrors = false;

      // Processar treinadores
      if (trainersResponse.status === 'fulfilled' && trainersResponse.value.success) {
        trainersData = trainersResponse.value.data;
      } else {
        console.warn('⚠️ Falha na busca de treinadores:', 
          trainersResponse.status === 'rejected' 
            ? trainersResponse.reason 
            : trainersResponse.value.error
        );
        hasErrors = true;
      }

      // Processar KPIs
      if (kpisResponse.status === 'fulfilled' && kpisResponse.value.success) {
        kpisData = kpisResponse.value.data;
      } else {
        console.warn('⚠️ Falha no cálculo de KPIs:', 
          kpisResponse.status === 'rejected' 
            ? kpisResponse.reason 
            : kpisResponse.value.error
        );
        hasErrors = true;
      }

      // 4. Fallback para KPIs se necessário
      if (!kpisData) {
        kpisData = {
          total_trainers: trainersData.length,
          total_programs: 0,
          min_price: null
        };
        console.log('🔄 Usando KPIs de fallback:', kpisData);
      }

      // 5. Determinar nome do esporte (usar primeira variação como fallback)
      const sportName = searchVariations[0] || sportSlug;

      const result: SportPageData = {
        trainers: trainersData,
        kpis: kpisData,
        sportName,
        searchVariations
      };

      console.log(`✅ SportPageSQL: Dados consolidados carregados:`, {
        trainers: result.trainers.length,
        kpis: result.kpis,
        variations: result.searchVariations.length
      });

      return { 
        success: !hasErrors || trainersData.length > 0, // Sucesso se pelo menos treinadores funcionaram
        data: result, 
        error: hasErrors ? 'Alguns dados podem estar incompletos' : undefined 
      };

    } catch (error) {
      console.error('❌ Erro crítico ao carregar dados da SportPage:', error);
      return { success: false, data: null, error };
    }
  }

  /**
   * Converte SqlTrainerResult para formato SportTrainer (compatibilidade)
   */
  convertToSportTrainer(sqlResult: SqlTrainerResult): any {
    return {
      id: sqlResult.trainer_id,
      slug: sqlResult.slug,
      name: sqlResult.name,
      avatar_url: sqlResult.avatar,
      profile_data: {
        city: null, // Pode ser adicionado posteriormente se necessário
        specialties: [], // Inferir das sources se necessário
        bio: null,
        service_mode: ['online', 'presencial'], // Fallback
        hourly_rate: undefined
      },
      rating: 4.8, // Fallback - pode ser calculado posteriormente
      total_students: Math.floor(Math.random() * 100 + 20), // Mock para compatibilidade
      is_verified: sqlResult.sources.includes('profile'), // Verificado se tem perfil
      // Campos extras do SQL
      sources: sqlResult.sources,
      sample_program_titles: sqlResult.sample_program_titles
    };
  }
}

// Singleton export
export const sportPageSqlService = new SportPageSqlService();
export default sportPageSqlService;