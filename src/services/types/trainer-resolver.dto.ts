/**
 * 🔍 TRAINER RESOLVER DTO
 * 
 * Tipos específicos para o serviço de resolução de identificadores
 */

export interface TrainerInfo {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  bio?: string;
  profilePhoto?: string;
  location?: string;
  specialties?: string[];
  rating?: number;
  reviewCount?: number;
  priceFrom?: string;
  isVerified?: boolean;
  isActive?: boolean;
  status?: string;
}

export interface ResolverResult {
  success: boolean;
  trainer?: TrainerInfo;
  error?: string;
  needsRedirect?: boolean;
  redirectSlug?: string;
  resolveMethod?: 'slug' | 'uuid' | 'fallback';
}

export interface TelemetryEvent {
  event: 'identifier_resolve_attempt' | 'identifier_resolve_success' | 'identifier_resolve_error' | 
         'uuid_to_slug_redirect' | 'invalid_identifier' | 'slug_validation_failed' | 'undefined_detected';
  identifier: string;
  method: string;
  success: boolean;
  error?: string;
  timestamp: string;
  metadata?: any;
}

/**
 * Validador para TrainerInfo
 */
export function validateTrainerInfo(data: any): TrainerInfo {
  if (!data.id || !data.user_id || !data.slug || !data.name) {
    throw new Error(`INVALID_TRAINER_INFO: Missing required fields - id: ${!!data.id}, user_id: ${!!data.user_id}, slug: ${!!data.slug}, name: ${!!data.name}`);
  }
  
  if (data.slug.includes('undefined') || data.slug.trim() === '') {
    throw new Error(`INVALID_SLUG: "${data.slug}" contains undefined or is empty`);
  }
  
  return {
    id: data.id,
    user_id: data.user_id,
    slug: data.slug,
    name: data.name,
    bio: data.bio,
    profilePhoto: data.profilePhoto || data.profile_photo,
    location: data.location,
    specialties: Array.isArray(data.specialties) ? data.specialties : [],
    rating: data.rating || 0,
    reviewCount: data.reviewCount || data.review_count || 0,
    priceFrom: data.priceFrom || data.price_from,
    isVerified: data.isVerified || data.is_verified || false,
    isActive: data.isActive || data.is_active || false,
    status: data.status
  };
}