/**
 * 🎯 TRAINER CARD DTO UNIFICADO
 * 
 * Contrato padronizado para todos os serviços que alimentam cards de treinadores.
 * Garante consistência e elimina divergências entre diferentes fontes de dados.
 */

export interface TrainerCardDTO {
  // CAMPOS OBRIGATÓRIOS
  id: string;           // UUID (compatibilidade)
  slug: string;         // NUNCA null/undefined - OBRIGATÓRIO
  name: string;         // Nome completo
  
  // CAMPOS OPCIONAIS
  profilePhoto?: string;// Avatar URL
  bio?: string;         // Bio resumida (max 100 chars)
  rating?: number;      // Rating médio (0-5)
  reviewCount?: number; // Número de avaliações
  location?: string;    // "Cidade, Estado" - SEM DUPLICAR
  specialties?: string[];// Array de especialidades
  isVerified?: boolean; // Status verificado
  priceFrom?: string;   // "R$ 65" ou "R$ 65-120"
  
  // METADADOS
  lastActive?: string;  // Data última atividade
  responseTime?: string;// Tempo resposta
}

/**
 * 🎯 VALIDADOR DE DTO - AJUSTADO para evitar duplicação de estado em location
 */
export function validateTrainerCardDTO(data: any): TrainerCardDTO {
  if (!data.id || !data.slug || !data.name) {
    throw new Error(`INVALID_TRAINER_DTO: Missing required fields - id: ${!!data.id}, slug: ${!!data.slug}, name: ${!!data.name}`);
  }
  
  if (data.slug.includes('undefined') || data.slug.trim() === '') {
    throw new Error(`INVALID_SLUG: "${data.slug}" contains undefined or is empty`);
  }
  
  // 🎯 Helper para location SEM DUPLICAR estado
  const buildLocation = (profileData: any): string | undefined => {
    if (!profileData?.city) return undefined;
    
    const city = profileData.city.trim();
    const state = profileData.state?.trim();
    
    // Se city já contém vírgula e estado (ex: "Londrina, PR"), não duplicar
    if (city.includes(',') && state) {
      // Verificar se o estado já está no final
      const cityParts = city.split(',');
      if (cityParts.length >= 2) {
        const existingState = cityParts[cityParts.length - 1].trim();
        if (existingState.toUpperCase() === state.toUpperCase()) {
          return city; // Já formatado corretamente
        }
      }
    }
    
    // Se city já tem vírgula mas sem estado válido
    if (city.includes(',')) {
      return city; // Manter como está
    }
    
    // Se não tem estado, só cidade
    if (!state) return city;
    
    // Montar "Cidade, Estado"
    return `${city}, ${state}`;
  };
  
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    profilePhoto: data.profilePhoto || data.profile_data?.profilePhoto,
    bio: data.bio || data.profile_data?.bio,
    rating: data.rating || data.profile_data?.rating || 0,
    reviewCount: data.reviewCount || 0,
    location: data.location || buildLocation(data.profile_data),
    specialties: data.specialties || data.profile_data?.specialties || [],
    isVerified: data.isVerified || data.is_verified || false,
    priceFrom: data.priceFrom || data.profile_data?.priceRange,
    lastActive: data.lastActive || data.updated_at,
    responseTime: data.responseTime || data.profile_data?.responseTime
  };
}