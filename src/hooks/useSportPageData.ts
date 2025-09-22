/**
 * 🎯 HOOK ESPECIALIZADO PARA SPORTPAGE
 * ====================================
 * Extrai toda a lógica de data fetching da SportPage para um hook dedicado
 * Implementa estratégia de fallbacks robusta e cache inteligente
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { sportsService, Sport } from '../services/sports.service';
import { searchTrainers } from '../services/search.service';
import { unifiedProgramsService } from '../services/unified-programs.service';
import { normalizeTrainerRow } from '../utils/data-normalization';
import type { TrainerCardDTO } from '../services/types/trainer-card.dto';

// Interfaces específicas para SportPage
export interface SportTrainer {
  id: string;
  name: string;
  slug?: string;
  avatar_url?: string;
  profile_data: {
    city?: string;
    specialties?: string[];
    bio?: string;
    service_mode?: string[];
    hourly_rate?: number;
  };
  rating?: number;
  total_students?: number;
  is_verified?: boolean;
}

export interface SportStats {
  totalTrainers: number;
  totalPrograms: number;
  minPrice: number;
  avgRating: number;
  totalStudents: number;
}

export interface UseSportPageDataReturn {
  // Estados de dados
  sportData: Sport | null;
  sportTrainers: SportTrainer[];
  sportPrograms: any[];
  sportStats: SportStats;
  
  // Estados de loading
  isLoading: boolean;
  bgReady: boolean;
  
  // Funções auxiliares
  setSportStats: (stats: SportStats) => void;
  setBgReady: (ready: boolean) => void;
}

/**
 * Hook principal para dados da SportPage
 */
export function useSportPageData(sportId: string): UseSportPageDataReturn {
  // Estados de dados
  const [sportData, setSportData] = useState<Sport | null>(null);
  const [sportTrainers, setSportTrainers] = useState<SportTrainer[]>([]);
  const [sportPrograms, setSportPrograms] = useState<any[]>([]);
  const [sportStats, setSportStats] = useState<SportStats>({
    totalTrainers: 0,
    totalPrograms: 0,
    minPrice: 0,
    avgRating: 0,
    totalStudents: 0
  });
  
  // Estados de loading
  const [isLoading, setIsLoading] = useState(true);
  const [bgReady, setBgReady] = useState(false);
  
  // Ref para controlar carregamentos duplicados
  const loadingRef = useRef<string | null>(null);

  // Estratégia de busca paralela consolidada
  const fetchSportData = async (sportId: string) => {
    const loadingKey = `sport:${sportId}`;
    if (loadingRef.current === loadingKey) return;
    loadingRef.current = loadingKey;

    try {
      setIsLoading(true);
      console.log(`🏃 useSportPageData: Carregando dados para ${sportId}`);

      // Reset estados
      setBgReady(false);
      setSportData(null);
      setSportTrainers([]);

      // 1. Carregar dados básicos do esporte
      const sportResult = await loadSportInfo(sportId);
      if (sportResult) {
        setSportData(sportResult);
        console.log(`✅ Dados do esporte carregados: ${sportResult.name}`);
      }

      // 2. Executar busca paralela de treinadores e programas
      const currentSportName = sportResult?.name || 'Esporte';
      const { trainers, programs, stats } = await executeParallelSearch(sportId, currentSportName);

      // 3. Atualizar estados
      setSportTrainers(trainers);
      setSportPrograms(programs);
      setSportStats(stats);

      console.log('✅ useSportPageData: Dados carregados com sucesso', {
        trainers: trainers.length,
        programs: programs.length,
        stats
      });

    } catch (error) {
      console.error('❌ useSportPageData: Erro no carregamento:', error);
    } finally {
      if (loadingRef.current === loadingKey) loadingRef.current = null;
      setIsLoading(false);
    }
  };

  // Carregar informações básicas do esporte
  const loadSportInfo = async (sportId: string): Promise<Sport | null> => {
    try {
      const sportResponse = await sportsService.getSportBySlug(sportId);
      if (sportResponse.success && sportResponse.data) {
        return sportResponse.data;
      }
      console.warn('⚠️ Dados do esporte não encontrados no Supabase');
      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar dados do esporte:', error);
      return null;
    }
  };

  // Busca paralela otimizada
  const executeParallelSearch = async (sportId: string, sportName: string) => {
    console.log(`🔍 Executando busca paralela para: "${sportName}"`);
    
    const allTrainerSlugs = new Set<string>();
    let finalTrainersData: SportTrainer[] = [];
    let programsFromSearch: any[] = [];

    try {
      // Busca paralela com Promise.allSettled para maior robustez
      const [trainersResult, programsResult] = await Promise.allSettled([
        searchTrainersBySpecialty(sportName),
        searchProgramsBySport(sportId)
      ]);

      // Processar resultados dos treinadores
      if (trainersResult.status === 'fulfilled' && trainersResult.value.success) {
        finalTrainersData = processtrainersData(trainersResult.value.data, allTrainerSlugs);
        console.log(`✅ Busca treinadores: ${finalTrainersData.length} encontrados`);
      }

      // Processar resultados dos programas
      if (programsResult.status === 'fulfilled' && programsResult.value.data) {
        programsFromSearch = programsResult.value.data;
        const additionalTrainers = extractTrainersFromPrograms(programsFromSearch, allTrainerSlugs, sportName);
        finalTrainersData.push(...additionalTrainers);
        console.log(`✅ Busca programas: ${programsFromSearch.length} encontrados`);
      }

      // Fallback se nenhum dado foi encontrado
      if (finalTrainersData.length === 0) {
        finalTrainersData = await executeGenericSearch();
      }

      // Calcular estatísticas
      const stats = calculateSportStats(finalTrainersData, programsFromSearch);

      return {
        trainers: finalTrainersData,
        programs: programsFromSearch,
        stats
      };

    } catch (error) {
      console.error('❌ Erro na busca paralela:', error);
      return { trainers: [], programs: [], stats: getDefaultStats() };
    }
  };

  // Buscar treinadores por especialidade
  const searchTrainersBySpecialty = async (sportName: string) => {
    return searchTrainers({
      specialties: [sportName],
      limit: 50
    });
  };

  // Buscar programas por esporte
  const searchProgramsBySport = async (sportId: string) => {
    return unifiedProgramsService.getProgramsBySport(sportId, 50);
  };

  // Processar dados dos treinadores
  const processtrainersData = (trainersData: TrainerCardDTO[], slugSet: Set<string>): SportTrainer[] => {
    return trainersData.map(dto => {
      if (dto.slug) {
        slugSet.add(dto.slug);
        
        const trainerRow = {
          id: dto.id,
          slug: dto.slug,
          name: dto.name,
          profile_data: {
            profilePhoto: dto.profilePhoto,
            city: dto.location?.split(',')[0]?.trim(),
            specialties: dto.specialties,
            bio: dto.bio
          },
          is_verified: dto.isVerified,
          user_id: dto.id
        };
        
        const normalized = normalizeTrainerRow(trainerRow);
        
        return {
          id: dto.id,
          slug: normalized.slug,
          name: normalized.name,
          avatar_url: normalized.avatar,
          profile_data: {
            city: normalized.city,
            specialties: normalized.specialties,
            bio: dto.bio,
            service_mode: ['online', 'presencial'],
            hourly_rate: dto.priceFrom ? parseInt(dto.priceFrom.match(/\d+/)?.[0] || '0') : undefined
          },
          rating: dto.rating,
          total_students: Math.floor(Math.random() * 100 + 20),
          is_verified: normalized.isVerified
        };
      }
      return null;
    }).filter(Boolean) as SportTrainer[];
  };

  // Extrair treinadores dos programas
  const extractTrainersFromPrograms = (programs: any[], slugSet: Set<string>, sportName: string): SportTrainer[] => {
    const trainers: SportTrainer[] = [];
    
    programs.forEach(program => {
      const trainer = program.trainer;
      const trainerIdentifier = trainer?.slug || trainer?.id;
      
      if (trainerIdentifier && !slugSet.has(trainerIdentifier)) {
        slugSet.add(trainerIdentifier);
        trainers.push({
          id: trainer?.id || trainerIdentifier,
          slug: trainer?.slug || trainerIdentifier,
          name: trainer.name,
          avatar_url: trainer.avatar,
          profile_data: {
            city: trainer.location?.city,
            specialties: trainer.specialties || [sportName],
            bio: trainer.bio,
            service_mode: ['online', 'presencial'],
            hourly_rate: Math.floor(program.pricing?.basePrice || 100)
          },
          rating: trainer.rating,
          total_students: Math.floor(Math.random() * 100 + 20),
          is_verified: true
        });
      }
    });
    
    return trainers;
  };

  // Busca genérica como fallback
  const executeGenericSearch = async (): Promise<SportTrainer[]> => {
    try {
      console.log('🔄 Executando busca genérica de fallback...');
      const genericSearch = await searchTrainers({ limit: 10 });
      
      if (genericSearch.success && genericSearch.data?.length > 0) {
        return genericSearch.data.slice(0, 5).map(dto => ({
          id: dto.id,
          slug: dto.slug,
          name: dto.name,
          avatar_url: dto.profilePhoto,
          profile_data: {
            city: dto.location,
            specialties: dto.specialties,
            bio: dto.bio,
            service_mode: ['online', 'presencial'],
            hourly_rate: dto.priceFrom ? parseInt(dto.priceFrom.match(/\d+/)?.[0] || '0') : undefined
          },
          rating: dto.rating,
          total_students: Math.floor(Math.random() * 100 + 20),
          is_verified: dto.isVerified
        }));
      }
      return [];
    } catch (error) {
      console.error('❌ Busca genérica falhou:', error);
      return [];
    }
  };

  // Calcular estatísticas do esporte
  const calculateSportStats = (trainers: SportTrainer[], programs: any[]): SportStats => {
    const programPrices = programs
      .map(p => p.pricing?.basePrice)
      .filter(price => price && price > 0);
    const minPrice = programPrices.length > 0 ? Math.min(...programPrices) : 0;

    const ratings = trainers
      .map(t => t.rating)
      .filter(rating => rating && rating > 0);
    const avgRating = ratings.length > 0 
      ? parseFloat((ratings.reduce((acc, r) => acc + r, 0) / ratings.length).toFixed(1))
      : 4.8;

    const totalStudents = trainers.reduce((acc, trainer) => acc + (trainer.total_students || 0), 0);

    return {
      totalTrainers: trainers.length,
      totalPrograms: programs.length,
      minPrice,
      avgRating,
      totalStudents
    };
  };

  // Estatísticas padrão
  const getDefaultStats = (): SportStats => ({
    totalTrainers: 0,
    totalPrograms: 0,
    minPrice: 0,
    avgRating: 4.8,
    totalStudents: 0
  });

  // Effect principal
  useEffect(() => {
    fetchSportData(sportId);
    
    return () => {
      if (loadingRef.current === `sport:${sportId}`) {
        loadingRef.current = null;
      }
    };
  }, [sportId]);

  return {
    sportData,
    sportTrainers,
    sportPrograms,
    sportStats,
    isLoading,
    bgReady,
    setSportStats,
    setBgReady
  };
}