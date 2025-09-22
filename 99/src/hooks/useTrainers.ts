/**
 * 🧑‍🏫 TRAINERS HOOKS
 * 
 * Hooks customizados para gerenciar dados de treinadores
 * usando TanStack Query para cache e estados de requisição.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateQueries, mutationOptions } from '../lib/query-client';
import { trainersService } from '../services/trainers.service';
import { Trainer, SearchFilters, PaginationParams } from '../types';
import { supabase } from '../lib/supabase/client';

/**
 * Salva cidades de forma assíncrona (não bloqueia o save principal)
 */
async function saveCitiesAsync(cities: any[], userId: string) {
  try {
    console.log('🌍 Iniciando salvamento assíncrono de cidades:', cities);
    
    if (!cities || cities.length === 0) {
      console.log('📍 Nenhuma cidade para salvar');
      return;
    }

    // Limpar cidades existentes
    await supabase.from('trainer_service_cities')
      .delete()
      .eq('trainer_id', userId);

    const cityRecords = [];

    // Processar cada cidade
    for (const city of cities) {
      const cityName = typeof city === 'string' ? city : city.name;
      
      if (!cityName) continue;
      
      const cityId = await findOrCreateCity(cityName);
      
      if (cityId) {
        cityRecords.push({
          trainer_id: userId,
          city_id: cityId
        });
      }
    }

    // Inserir cidades válidas
    if (cityRecords.length > 0) {
      const { error } = await supabase.from('trainer_service_cities')
        .insert(cityRecords);

      if (error) {
        console.error('❌ Erro ao salvar cidades:', error);
      } else {
        console.log('✅ Cidades salvas com sucesso:', cityRecords.length);
      }
    }

  } catch (error) {
    console.error('❌ Erro no salvamento assíncrono de cidades:', error);
    // Não fazer throw - é processo assíncrono não crítico
  }
}

/**
 * Busca ou cria uma cidade no banco de dados
 */
async function findOrCreateCity(cityName: string): Promise<string | null> {
  try {
    // Limpar e extrair o nome da cidade
    let cleanCityName = cityName;
    let stateName = '';
    
    // Se tem formato "Cidade - Estado", separar
    if (cityName.includes(' - ')) {
      [cleanCityName, stateName] = cityName.split(' - ').map(s => s.trim());
    } else if (cityName.includes(', ')) {
      [cleanCityName, stateName] = cityName.split(', ').map(s => s.trim());
    }
    
    console.log('🔍 Buscando cidade:', { cityName, cleanCityName, stateName });
    
    // Primeiro, tentar encontrar a cidade existente
    let { data: existingCity, error: searchError } = await supabase
      .from('cities')
      .select('id, name, states(code)')
      .ilike('name', cleanCityName)
      .limit(1)
      .single();
    
    if (existingCity && !searchError) {
      console.log('✅ Cidade encontrada:', existingCity);
      return existingCity.id;
    }
    
    // Se não encontrou e temos o nome do estado, tentar buscar o estado primeiro
    if (stateName) {
      const { data: state } = await supabase
        .from('states')
        .select('id')
        .or(`code.ilike.${stateName},name.ilike.${stateName}`)
        .range(0, 0)
        .single();
      
      if (state) {
        // Criar nova cidade
        const { data: newCity, error: createError } = await supabase
          .from('cities')
          .insert({
            name: cleanCityName,
            state_id: state.id
          })
          .select('id')
          .single();
        
        if (newCity && !createError) {
          console.log('✅ Cidade criada:', newCity);
          return newCity.id;
        }
      }
    }
    
    console.warn('❌ Não foi possível encontrar ou criar cidade:', cityName);
    return null;
    
  } catch (error) {
    console.error('❌ Erro ao buscar/criar cidade:', error);
    return null;
  }
}
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para buscar todos os treinadores
 */
export const useTrainers = (
  filters?: SearchFilters,
  pagination?: PaginationParams
) => {
  return useQuery({
    queryKey: queryKeys.trainers.list({ filters, pagination }),
    queryFn: () => trainersService.searchTrainers(filters, pagination),
    select: (data) => data.success ? data.data : null,
    enabled: true
  });
};

/**
 * Hook para buscar um treinador específico por ID
 */
export const useTrainer = (trainerId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.trainers.detail(trainerId),
    queryFn: () => trainersService.getTrainerById(trainerId),
    select: (data) => data.success ? data.data : null,
    enabled: enabled && !!trainerId
  });
};

/**
 * Hook para buscar treinadores em destaque
 */
export const useFeaturedTrainers = (limit = 6) => {
  return useQuery({
    queryKey: queryKeys.trainers.featured(),
    queryFn: () => trainersService.getFeaturedTrainers(limit),
    select: (data) => data.success ? data.data : [],
    staleTime: 10 * 60 * 1000 // 10 minutos (dados que mudam pouco)
  });
};

/**
 * Hook para buscar treinadores próximos
 */
export const useNearbyTrainers = (
  coordinates: { latitude: number; longitude: number },
  radiusKm = 10,
  limit = 10,
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.trainers.nearby({ lat: coordinates.latitude, lng: coordinates.longitude }, radiusKm),
    queryFn: () => trainersService.getNearbyTrainers(coordinates, radiusKm, limit),
    select: (data) => data.success ? data.data : [],
    enabled: enabled && !!coordinates.latitude && !!coordinates.longitude
  });
};

/**
 * Hook para buscar reviews de um treinador
 */
export const useTrainerReviews = (trainerId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.trainers.reviews(trainerId),
    queryFn: () => trainersService.getTrainerReviews(trainerId),
    select: (data) => data.success ? data.data : [],
    enabled: enabled && !!trainerId
  });
};

/**
 * Hook para buscar stories de um treinador
 */
export const useTrainerStories = (trainerId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.trainers.stories(trainerId),
    queryFn: () => trainersService.getTrainerStories(trainerId),
    select: (data) => data.success ? data.data : [],
    enabled: enabled && !!trainerId
  });
};

/**
 * Hook para buscar preços de um treinador
 */
export const useTrainerPricing = (trainerId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.trainers.pricing(trainerId),
    queryFn: () => trainersService.getTrainerPricing(trainerId),
    select: (data) => data.success ? data.data : [],
    enabled: enabled && !!trainerId
  });
};

/**
 * Hook para buscar estatísticas de treinadores
 */
export const useTrainersStats = () => {
  return useQuery({
    queryKey: queryKeys.trainers.stats(),
    queryFn: () => trainersService.getTrainersStats(),
    select: (data) => data.success ? data.data : null,
    staleTime: 30 * 60 * 1000 // 30 minutos (estatísticas mudam devagar)
  });
};

/**
 * Hook para atualizar dados de um treinador
 */
export const useUpdateTrainer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Trainer> }) =>
      trainersService.updateTrainer(id, updates),
    ...mutationOptions.updateTrainer(''),
    onSuccess: (data, variables) => {
      // Atualizar cache local imediatamente
      if (data.success && data.data) {
        queryClient.setQueryData(
          queryKeys.trainers.detail(variables.id),
          { success: true, data: data.data }
        );
      }
      
      // Invalidar queries relacionadas
      invalidateQueries.trainer(variables.id);
      invalidateQueries.trainerLists();
    }
  });
};

/**
 * Hook para buscar com debounce (útil para busca em tempo real)
 */
export const useTrainersSearch = (
  query: string,
  filters?: SearchFilters,
  debounceMs = 300
) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [query, debounceMs]);
  
  return useQuery({
    queryKey: queryKeys.trainers.search(debouncedQuery, filters),
    queryFn: () => trainersService.searchTrainers({ ...filters, query: debouncedQuery }),
    select: (data) => data.success ? data.data : null,
    enabled: debouncedQuery.length >= 2, // Só buscar com 2+ caracteres
    staleTime: 2 * 60 * 1000 // 2 minutos para busca
  });
};

/**
 * Hook para prefetch de dados (otimização)
 */
export const usePrefetchTrainer = () => {
  const queryClient = useQueryClient();
  
  const prefetchTrainer = (trainerId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.trainers.detail(trainerId),
      queryFn: () => trainersService.getTrainerById(trainerId),
      staleTime: 5 * 60 * 1000 // 5 minutos
    });
  };
  
  const prefetchTrainerData = (trainerId: string) => {
    // Prefetch trainer details + reviews + stories + pricing
    Promise.all([
      prefetchTrainer(trainerId),
      queryClient.prefetchQuery({
        queryKey: queryKeys.trainers.reviews(trainerId),
        queryFn: () => trainersService.getTrainerReviews(trainerId)
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.trainers.stories(trainerId),
        queryFn: () => trainersService.getTrainerStories(trainerId)
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.trainers.pricing(trainerId),
        queryFn: () => trainersService.getTrainerPricing(trainerId)
      })
    ]);
  };
  
  return {
    prefetchTrainer,
    prefetchTrainerData
  };
};

/**
 * ===========================================
 * TRAINER PROFILE MANAGEMENT HOOK
 * ===========================================
 * Hook específico para gerenciar perfil de treinador
 * no dashboard e no become-trainer com integração Supabase
 */

// Tipos para o perfil do treinador
export type ServiceMode = 'online' | 'presencial' | 'ambos';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type TrainerSpecialty = {
  sport_id: string;
  sport_name?: string;
  experience_level: ExperienceLevel;
  years_of_experience: number | null;
  is_primary: boolean;
};

export type ServiceCity = { 
  id: string; 
  name: string; 
  uf: string; 
};

export type GalleryImage = { 
  id: string; 
  url: string; 
  alt?: string; 
  width?: number; 
  height?: number; 
};

export type TrainerProfileData = {
  // Basic Info
  name: string;
  title: string;
  bio: string;
  phone: string;
  email: string;
  instagram: string;
  youtube: string;

  // Location
  address: string;
  city: string;
  cep: string;
  number: string;
  complement: string;

  // Education
  universities: Array<{ id?: string; name: string; degree: string; year: string }>;
  credential: string;
  courses: Array<{ id?: string; name: string; institution: string; year: string }>;

  // Additional Info
  experienceYears: string;
  responseTime: string;
  studentsCount: string;

  // Profile specifics
  profilePhoto: string;
  specialties: TrainerSpecialty[];
  modalities: ServiceMode[];
  cities: ServiceCity[];

  // Gallery & Media
  galleryImages: GalleryImage[];
  videos: any[];
  stories: any[];
};

/**
 * Hook para gerenciar perfil do treinador
 * Usado tanto no dashboard quanto no become-trainer
 */
export const useTrainerProfile = (mode: 'dashboard' | 'onboarding' = 'dashboard') => {
  const { user } = useAuth();
  const [data, setData] = useState<TrainerProfileData | null>(null);
  const [originalData, setOriginalData] = useState<TrainerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // Prevent multiple loads

  // Stabilize user ID to prevent unnecessary re-renders
  const userId = user?.id;
  const [stableUserId, setStableUserId] = useState(userId);

  // Initial data structure
  const getInitialData = (): TrainerProfileData => ({
    name: '',
    title: '',
    bio: '',
    phone: '',
    email: '',
    instagram: '',
    youtube: '',
    address: '',
    city: '',
    cep: '',
    number: '',
    complement: '',
    universities: [],
    credential: '',
    courses: [],
    experienceYears: '',
    responseTime: '',
    studentsCount: '',
    profilePhoto: '',
    specialties: [],
    modalities: [],
    cities: [],
    galleryImages: [],
    videos: [],
    stories: []
  });

  /**
   * Carregar dados do perfil do Supabase
   */
  const loadProfile = useCallback(async () => {
    if (!userId) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous loads
    if (hasLoaded && data) {
      console.log('📋 Perfil já carregado, usando cache:', userId);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Carregando perfil do treinador:', userId);

      // Queries em paralelo
      const [
        { data: userRow, error: userRowErr },
        { data: userProfile, error: userProfileErr },
        { data: trainerProfile, error: trainerProfileErr },
        { data: specialties, error: specialtiesErr },
        { data: serviceCities, error: serviceCitiesErr },
        { data: gallery, error: galleryErr },
        { data: certifications, error: certificationsErr }
      ] = await Promise.all([
        // 1. Basic user info
        supabase.from('users').select('id, email, phone').eq('id', userId).single(),
        
        // 2. User profile
        supabase.from('user_profiles')
          .select('first_name, last_name, display_name, bio, avatar_url, instagram_url, city_id')
          .eq('user_id', userId)
          .single(),
        
        // 3. Trainer profile  
        supabase.from('trainer_profiles')
          .select('experience_years, response_time_hours, total_students, service_mode')
          .eq('user_id', userId)
          .single(),
        
        // 4. Specialties with sport names
        supabase.from('trainer_specialties')
          .select(`
            sport_id,
            experience_level,
            years_of_experience,
            is_primary,
            sports ( name )
          `)
          .eq('trainer_id', userId)
          .order('is_primary', { ascending: false }),
        
        // 5. Service cities with names and states
        supabase.from('trainer_service_cities')
          .select(`
            city_id,
            cities (
              name,
              states ( code )
            )
          `)
          .eq('trainer_id', userId),
        
        // 6. Gallery images
        supabase.from('media_files')
          .select('id, file_path, file_name, mime_type, width_px, height_px, alt_text, created_at')
          .eq('uploader_id', userId)
          .eq('file_type', 'image')
          .ilike('file_path', `${userId}/gallery/%`)
          .order('created_at', { ascending: false })
          .range(0, 49),
        
        // 7. Certifications
        supabase.from('trainer_certifications')
          .select('id, name, issuing_organization, issue_date, expiration_date, status, credential_id, credential_url')
          .eq('trainer_id', userId)
          .order('issue_date', { ascending: false, nullsFirst: false })
      ]);

      // Handle errors (ignore PGRST116 - no rows returned)
      if (userRowErr && userRowErr.code !== 'PGRST116') throw userRowErr;
      if (userProfileErr && userProfileErr.code !== 'PGRST116') throw userProfileErr;
      if (trainerProfileErr && trainerProfileErr.code !== 'PGRST116') throw trainerProfileErr;
      if (specialtiesErr) throw specialtiesErr;
      if (serviceCitiesErr) throw serviceCitiesErr;
      if (galleryErr) throw galleryErr;
      if (certificationsErr) throw certificationsErr;

      // Transform data from schema to UI format
      const transformedData = transformSchemaToUI({
        userRow,
        userProfile,
        trainerProfile,
        specialties,
        serviceCities,
        gallery,
        certifications
      });

      setData(transformedData);
      setOriginalData(transformedData);
      setIsDirty(false);
      setHasLoaded(true); // Mark as loaded to prevent reloads

      console.log('✅ Perfil carregado com sucesso:', transformedData);

    } catch (error: any) {
      console.error('❌ Erro ao carregar perfil:', error);
      setError(`Erro ao carregar perfil: ${error.message}`);
      toast.error('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  }, [userId]); // Simplified dependencies - only userId

  /**
   * Salvar dados do perfil no Supabase
   */
  const saveProfile = useCallback(async (profileData?: TrainerProfileData) => {
    if (!userId || !data) {
      toast.error('Dados insuficientes para salvar');
      return false;
    }

    const dataToSave = profileData || data;

    try {
      setSaving(true);
      setError(null);

      console.log('💾 Salvando perfil do treinador...', dataToSave);

      // Transform UI data to schema format
      const schemaData = transformUIToSchema(dataToSave, userId);
      console.log('💾 UI Data being saved:', dataToSave);
      console.log('💾 Schema Data transformed:', schemaData);

      // Save in parallel with error handling
      const savePromises = [];

      // 1. Update users table (phone)
      if (schemaData.users) {
        savePromises.push(
          supabase.from('users')
            .update(schemaData.users)
            .eq('id', user.id)
        );
      }

      // 2. Upsert user_profiles
      if (schemaData.user_profiles) {
        savePromises.push(
          supabase.from('user_profiles')
            .upsert({ 
              user_id: userId, 
              ...schemaData.user_profiles 
            })
        );
      }

      // 3. Upsert trainer_profiles
      if (schemaData.trainer_profiles) {
        console.log('💾 Saving trainer_profiles:', { 
          user_id: userId, 
          ...schemaData.trainer_profiles 
        });
        savePromises.push(
          supabase.from('trainer_profiles')
            .upsert({ 
              user_id: userId, 
              ...schemaData.trainer_profiles 
            })
        );
      }

      // Execute saves
      const results = await Promise.allSettled(savePromises);
      
      // Check for errors
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('❌ Erros no salvamento:', failures);
        failures.forEach((failure, index) => {
          console.error(`❌ Erro ${index + 1}:`, failure.reason);
        });
        throw new Error(`Falha ao salvar ${failures.length} seção(ões): ${failures.map(f => f.reason?.message || 'Erro desconhecido').join(', ')}`);
      }
      
      // Log successful saves
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`✅ Salvamento ${index + 1} realizado com sucesso:`, result.value);
        }
      });

      // Handle specialties separately (requires delete + insert)
      if (schemaData.trainer_specialties && schemaData.trainer_specialties.length > 0) {
        // Delete existing specialties
        await supabase.from('trainer_specialties')
          .delete()
          .eq('trainer_id', userId);

        // Insert new specialties
        const { error: specialtiesError } = await supabase.from('trainer_specialties')
          .insert(schemaData.trainer_specialties);

        if (specialtiesError) throw specialtiesError;
      }

      // Handle service cities separately (non-blocking)
      try {
        if (schemaData.trainer_service_cities && schemaData.trainer_service_cities.length > 0) {
          // Delete existing cities
          await supabase.from('trainer_service_cities')
            .delete()
            .eq('trainer_id', userId);

          // Insert new cities
          const { error: citiesError } = await supabase.from('trainer_service_cities')
            .insert(schemaData.trainer_service_cities);

          if (citiesError) {
            console.warn('⚠️ Erro ao salvar cidades (não crítico):', citiesError);
          }
        }
      } catch (cityError) {
        console.warn('⚠️ Erro nas cidades, continuando salvamento:', cityError);
        // Não fazer throw - cidades são opcionais
      }

      // Save cities asynchronously (non-blocking)
      saveCitiesAsync(dataToSave.cities || [], userId);

      // Update local state
      setOriginalData(dataToSave);
      setIsDirty(false);

      toast.success('Perfil salvo com sucesso!');
      console.log('✅ Perfil salvo com sucesso');

      return true;

    } catch (error: any) {
      console.error('❌ Erro ao salvar perfil:', error);
      
      // Tratamento de erros específicos
      let errorMessage = error.message;
      if (error.code === '22P02') {
        errorMessage = 'Erro nos dados de localização. Verifique as cidades selecionadas.';
      } else if (error.code === '23505') {
        errorMessage = 'Dados duplicados encontrados. Tente novamente.';
      } else if (error.code === '23503') {
        errorMessage = 'Referência inválida nos dados. Verifique as informações preenchidas.';
      }
      
      setError(`Erro ao salvar: ${errorMessage}`);
      toast.error(`Erro ao salvar perfil: ${error.message}`);
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, data]);

  /**
   * Atualizar campo específico
   */
  const updateField = useCallback((section: string, field: string, value: any) => {
    setData(prev => {
      if (!prev) return prev;
      
      const newData = { ...prev };
      
      if (section === 'root') {
        (newData as any)[field] = value;
      } else {
        if (!(newData as any)[section]) {
          (newData as any)[section] = {};
        }
        (newData as any)[section][field] = value;
      }
      
      return newData;
    });

    // Mark as dirty if changed from original
    setIsDirty(true);
  }, []); // Remove data dependency to prevent loops

  /**
   * Resetar para dados originais
   */
  const reset = useCallback(() => {
    setData(prev => {
      const resetData = originalData || prev;
      setIsDirty(false);
      return resetData;
    });
  }, []); // Remove originalData dependency to prevent loops

  /**
   * Recarregar dados
   */
  const refetch = useCallback(() => {
    setHasLoaded(false); // Force reload
    return loadProfile();
  }, []); // No dependencies to prevent loops

  // Load data on mount (only once per user)
  useEffect(() => {
    if (userId && !hasLoaded) {
      loadProfile();
    } else if (!userId) {
      setData(getInitialData());
      setLoading(false);
      setHasLoaded(false); // Reset when user logs out
    }
  }, [userId, hasLoaded]); // Removed loadProfile dependency to prevent loops

  // Reset cache when user changes
  useEffect(() => {
    if (stableUserId !== userId) {
      setStableUserId(userId);
      setHasLoaded(false);
      setData(null);
      setOriginalData(null);
      setError(null);
      setIsDirty(false);
    }
  }, [stableUserId, userId]);

  return {
    data,
    loading,
    saving,
    error,
    isDirty,
    updateField,
    saveProfile,
    reset,
    refetch,
    loadProfile
  };
};

/**
 * ===========================================
 * UTILITY FUNCTIONS
 * ===========================================
 */

/**
 * Transform schema data to UI format
 */
function transformSchemaToUI(schemaData: any): TrainerProfileData {
  const {
    userRow,
    userProfile,
    trainerProfile,
    specialties,
    serviceCities,
    gallery,
    certifications
  } = schemaData;

  return {
    // Basic info
    name: userProfile?.display_name || 
          (userProfile?.first_name && userProfile?.last_name 
            ? `${userProfile.first_name} ${userProfile.last_name}` 
            : '') ||
          userRow?.email?.split('@')[0] || '',
    title: trainerProfile?.professional_title || 'Personal Trainer',
    bio: userProfile?.bio || '',
    phone: userRow?.phone || '',
    email: userRow?.email || '',
    instagram: userProfile?.instagram_url || '',
    youtube: '', // Not in schema yet
    
    // Location (UI only for now)
    address: '',
    city: '',
    cep: '',
    number: '',
    complement: '',
    
    // Education from certifications
    universities: certifications?.filter((cert: any) => cert.name?.toLowerCase().includes('universidade') || cert.name?.toLowerCase().includes('faculdade'))
      .map((cert: any) => ({
        id: cert.id,
        name: cert.issuing_organization || '',
        degree: cert.name || '',
        year: cert.issue_date ? new Date(cert.issue_date).getFullYear().toString() : ''
      })) || [],
    credential: certifications?.find((cert: any) => cert.credential_id?.includes('CREF'))?.credential_id || '',
    courses: certifications?.filter((cert: any) => !cert.name?.toLowerCase().includes('universidade') && !cert.name?.toLowerCase().includes('faculdade'))
      .map((cert: any) => ({
        id: cert.id,
        name: cert.name || '',
        institution: cert.issuing_organization || '',
        year: cert.issue_date ? new Date(cert.issue_date).getFullYear().toString() : ''
      })) || [],
    
    // Additional info
    experienceYears: trainerProfile?.experience_years ? (
      trainerProfile.experience_years === 0 ? 'menos-1' :
      trainerProfile.experience_years <= 2 ? '1-2' :
      trainerProfile.experience_years <= 5 ? '3-5' :
      trainerProfile.experience_years <= 10 ? '6-10' :
      trainerProfile.experience_years > 10 ? 'mais-10' :
      ''
    ) : '',
    responseTime: trainerProfile?.response_time_hours ? `${trainerProfile.response_time_hours}-horas` : '',
    studentsCount: trainerProfile?.total_students ? (
      trainerProfile.total_students <= 5 ? 'iniciante' :
      trainerProfile.total_students <= 20 ? 'poucos' :
      trainerProfile.total_students <= 50 ? 'moderado' :
      trainerProfile.total_students <= 100 ? 'experiente' :
      trainerProfile.total_students <= 200 ? 'muito-experiente' :
      'expert'
    ) : '',
    
    // Profile specifics
    profilePhoto: userProfile?.avatar_url || '',
    specialties: specialties?.map((spec: any) => ({
      sport_id: spec.sport_id,
      sport_name: spec.sports?.name,
      experience_level: spec.experience_level,
      years_of_experience: spec.years_of_experience,
      is_primary: spec.is_primary
    })) || [],
    modalities: trainerProfile?.service_mode ? [trainerProfile.service_mode] : [],
    cities: serviceCities?.filter((sc: any) => sc.cities?.name)
      .map((sc: any) => {
        const cityName = sc.cities.name;
        const stateCode = sc.cities?.states?.code || '';
        
        // Retornar no formato string que a UI espera
        return stateCode ? `${cityName} - ${stateCode}` : cityName;
      }) || [],
    
    // Gallery
    galleryImages: gallery?.map((img: any) => ({
      id: img.id,
      url: img.file_path,
      alt: img.alt_text,
      width: img.width_px,
      height: img.height_px
    })) || [],
    videos: [], // Not implemented yet
    stories: [] // Not implemented yet
  };
}

/**
 * Transform UI data to schema format
 */
function transformUIToSchema(uiData: TrainerProfileData, userId: string) {
  return {
    users: {
      phone: uiData.phone
    },
    user_profiles: {
      display_name: uiData.name,
      bio: uiData.bio,
      instagram_url: uiData.instagram || null,
      avatar_url: uiData.profilePhoto
    },
    trainer_profiles: {
      experience_years: uiData.experienceYears ? (
        uiData.experienceYears === 'menos-1' ? 0 :
        uiData.experienceYears === '1-2' ? 2 :
        uiData.experienceYears === '3-5' ? 5 :
        uiData.experienceYears === '6-10' ? 10 :
        uiData.experienceYears === 'mais-10' ? 15 :
        parseInt(uiData.experienceYears) || null
      ) : null,
      response_time_hours: uiData.responseTime ? parseInt(uiData.responseTime.replace('-horas', '')) : null,
      total_students: uiData.studentsCount ? (
        uiData.studentsCount === 'iniciante' ? 5 :
        uiData.studentsCount === 'poucos' ? 20 :
        uiData.studentsCount === 'moderado' ? 50 :
        uiData.studentsCount === 'experiente' ? 100 :
        uiData.studentsCount === 'muito-experiente' ? 200 :
        uiData.studentsCount === 'expert' ? 300 :
        parseInt(uiData.studentsCount) || null
      ) : null,
      service_mode: uiData.modalities[0] || null
    },
    trainer_specialties: uiData.specialties.map(spec => ({
      trainer_id: userId,
      sport_id: spec.sport_id,
      experience_level: spec.experience_level,
      years_of_experience: spec.years_of_experience,
      is_primary: spec.is_primary
    })),
    // Cidades serão salvas separadamente via saveCitiesAsync
    trainer_service_cities: []
  };
}