/**
 * UTILITÁRIOS DE NORMALIZAÇÃO - NOMES & AVATARES (SISTEMA INTEIRO)
 * ==================================================================
 * 
 * Funções centralizadas para normalizar dados de treinadores e programas
 * seguindo as regras rígidas definidas para usar apenas:
 * - public.trainers_with_slugs
 * - public.published_programs_with_trainer
 */

// ===============================================
// TIPOS DE APOIO
// ===============================================

export interface NormalizedTrainer {
  id: string;           // usado como key
  slug: string | null;  // navegação por slug
  name: string;
  avatar: string | null;
  initials: string;
  userId: string | null;
  city: string | null;
  specialties: string[];
  isVerified: boolean;
}

export interface NormalizedProgram {
  id: string;
  content: {
    title: string;
    shortDescription: string;
  };
  media: {
    coverImage: string | null;
  };
  details: {
    category: string | null;
    level: string | null;
    modality: string | null;
    duration: number | null;
    durationType: string;
    primarySport: any | null;
  };
  pricing: {
    basePrice: number;
    currency: string;
  };
  trainer: {
    id: string | null;
    slug: string | null;
    name: string;
    avatar: string | null;
    initials: string;
  };
  flags: {
    isPublished: boolean;
    isActive: boolean;
  };
  createdAt: string | null;
}

// ===============================================
// FUNÇÃO 1: NORMALIZAR TRAINER
// ===============================================

/**
 * Normaliza dados de treinador vindo de trainers_with_slugs
 * Garante fallbacks previsíveis para todos os campos críticos
 */
export function normalizeTrainerRow(row: any): NormalizedTrainer {
  console.log('🔧 Normalizando trainer:', { 
    name: row?.name, 
    slug: row?.slug,
    profilePhoto: row?.profile_data?.profilePhoto,
    avatar_url: row?.avatar_url 
  });

  // Nome com fallback inteligente
  const rawName = row?.name ?? 
                  row?.profile_data?.name ?? 
                  row?.email?.split('@')?.[0] ?? 
                  'Personal Trainer';

  // Avatar com prioridade: profilePhoto > avatar_url > null
  const avatar = row?.profile_data?.profilePhoto ?? 
                 row?.avatar_url ?? 
                 null;

  const cleanName = String(rawName).trim();
  const cleanAvatar = avatar && String(avatar).trim().length > 0 ? String(avatar).trim() : null;

  const normalized = {
    id: row?.slug || row?.id,           // usado como key
    slug: row?.slug || null,            // navegação por slug
    name: cleanName,
    avatar: cleanAvatar,
    initials: cleanName.slice(0, 2).toUpperCase(),
    userId: row?.user_id ?? row?.id ?? null,
    city: row?.profile_data?.city ?? null,
    specialties: Array.isArray(row?.profile_data?.specialties) ? row.profile_data.specialties : [],
    isVerified: !!row?.is_verified,
  };

  console.log('✅ Trainer normalizado:', {
    name: normalized.name,
    avatar: normalized.avatar ? 'SIM' : 'NÃO',
    slug: normalized.slug,
    initials: normalized.initials
  });

  return normalized;
}

// ===============================================
// FUNÇÃO 2: NORMALIZAR PROGRAM
// ===============================================

/**
 * Normaliza dados de programa vindo de published_programs_with_trainer
 * Usa os campos enriquecidos trainer_name, trainer_avatar, trainer_slug
 */
export function normalizeProgramRow(p: any): NormalizedProgram {
  console.log('🔧 Normalizando program:', { 
    id: p?.id,
    title: p?.title,
    trainer_name: p?.trainer_name,
    trainer_avatar: p?.trainer_avatar,
    trainer_slug: p?.trainer_slug
  });

  // Dados do trainer vindos da view enriquecida
  const trainerName = p?.trainer_name ?? 'Personal Trainer';
  const trainerAvatar = p?.trainer_avatar ?? null;
  const trainerSlug = p?.trainer_slug ?? null;

  const cleanTrainerName = String(trainerName).trim();
  const cleanTrainerAvatar = trainerAvatar && String(trainerAvatar).trim().length > 0 ? String(trainerAvatar).trim() : null;

  const normalized = {
    id: p?.id,
    content: {
      title: p?.title ?? 'Programa',
      shortDescription: p?.short_description ?? '',
    },
    media: {
      coverImage: p?.cover_image ?? null,
    },
    details: {
      category: p?.category ?? null,
      level: p?.level ?? null,
      modality: p?.modality_norm ?? p?.modality ?? null,
      duration: p?.duration ?? null,
      durationType: p?.duration_type ?? 'weeks',
      primarySport: null, // se existir no program_data, mapear aqui
    },
    pricing: {
      basePrice: Number(p?.base_price ?? 0),
      currency: 'BRL',
    },
    trainer: {
      id: p?.trainer_user_id ?? p?.trainer_id ?? null,
      slug: trainerSlug,
      name: cleanTrainerName,
      avatar: cleanTrainerAvatar,
      initials: cleanTrainerName.slice(0, 2).toUpperCase(),
    },
    flags: {
      isPublished: !!p?.is_published,
      isActive: p?.status_norm === 'published',
    },
    createdAt: p?.created_at,
  };

  console.log('✅ Program normalizado:', {
    title: normalized.content.title,
    trainerName: normalized.trainer.name,
    trainerAvatar: normalized.trainer.avatar ? 'SIM' : 'NÃO',
    trainerSlug: normalized.trainer.slug,
    trainerInitials: normalized.trainer.initials
  });

  return normalized;
}

// ===============================================
// FUNÇÕES AUXILIARES
// ===============================================

/**
 * Extrai iniciais de um nome para fallback do avatar
 */
export function getInitialsFromName(name: string): string {
  const cleanName = String(name || 'TR').trim();
  const words = cleanName.split(' ').filter(word => word.length > 0);
  
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  } else if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  
  return 'TR';
}

/**
 * Valida se uma URL de avatar é válida
 */
export function isValidAvatarUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  
  // Verificar se parece com URL
  try {
    new URL(trimmed);
    return true;
  } catch {
    // Se não for URL absoluta, verificar se é path relativo válido
    return trimmed.startsWith('/') || trimmed.startsWith('http');
  }
}

/**
 * Normaliza nome removendo caracteres especiais e limitando tamanho
 */
export function normalizeName(name: string | null | undefined): string {
  if (!name) return 'Personal Trainer';
  
  const cleaned = String(name).trim();
  if (cleaned.length === 0) return 'Personal Trainer';
  
  // Limitar a 50 caracteres para evitar overflow na UI
  return cleaned.length > 50 ? `${cleaned.slice(0, 47)}...` : cleaned;
}

// ===============================================
// LOGGING E DEBUG
// ===============================================

/**
 * Log debug para acompanhar normalização
 */
export function logNormalization(type: 'trainer' | 'program', before: any, after: any) {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔧 Normalização ${type}`);
    console.log('ANTES:', before);
    console.log('DEPOIS:', after);
    console.groupEnd();
  }
}