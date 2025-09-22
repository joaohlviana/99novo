/**
 * 🎯 TIPOS PARA AS TABELAS REAIS - FONTE ÚNICA DE VERDADE
 * ======================================================
 * Tipos TypeScript que espelham exatamente as tabelas do Postgres/Supabase
 * usando estrutura real identificada nos services existentes.
 */

// TABELA REAL: 99_training_programs (baseado no training-programs.service.ts)
export type DbProgramRow = {
  id: string;
  trainer_id: string;
  title: string;
  category: string;
  modality: 'PDF' | 'Consultoria' | 'Video';
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  duration: string;
  frequency: string;
  base_price: number;
  cover_image?: string; // Campo real no banco
  thumbnail?: string; // Mapeamento para compatibilidade
  program_data: {
    basic_info?: {
      title?: string;
      category?: string;
      modality?: string;
      level?: string;
      base_price?: number;
      duration?: number;
      tags?: string[];
    };
    description?: {
      overview?: string;
      shortDescription?: string;
    };
    media?: { url: string; alt?: string }[];
    analytics?: {
      views?: number;
      inquiries?: number;
      conversions?: number;
      reviews_count?: number;
      average_rating?: number;
    };
    objectives?: string[];
    [key: string]: any;
  };
  is_published: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

// VIEW REAL: published_programs_by_trainer (estrutura exata do banco)
export type DbPublishedProgramRow = {
  id: string;
  trainer_id: string;
  trainer_user_id: string;
  slug: string; // slug do trainer
  trainer_name: string;
  title: string;
  category: string;
  level: string;
  modality: string;
  modality_norm: string;
  base_price: number;
  display_price: number;
  status_norm: string;
  is_published: boolean;
  duration: number; // integer
  duration_type: string;
  frequency: number; // integer
  program_data: {
    description?: string;
    objectives?: string[];
    media?: { url: string; alt?: string }[];
    analytics?: {
      views?: number;
      inquiries?: number;
      conversions?: number;
      reviews_count?: number;
      average_rating?: number;
    };
    [key: string]: any;
  };
  cover_image?: string;
  short_description?: string;
  created_at: string;
  updated_at: string;
};

// VIEW REAL: trainers_with_slugs (estrutura exata do banco)
export type DbTrainerRow = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  role: string; // USER-DEFINED enum
  is_active: boolean;
  is_verified: boolean;
  profile_data: {
    bio?: string;
    profilePhoto?: string;
    location_data?: {
      city?: string;
      state?: string;
      country?: string;
    };
    specialties?: string[];
    serviceMode?: string[];
    [key: string]: any;
  };
  slug: string;
  created_at: string;
  updated_at: string;
};

// Tipo consolidado para o componente UI
export type UiProgram = {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category?: string;
  level?: string;
  media: { url: string; alt?: string }[];

  stats: {
    reviewCount: number;
    enrollments: number;
    averageRating?: number;
    activeStudents?: number;
  };

  duration: {
    weeks?: number;
    hoursPerWeek?: number;
    totalHours?: number;
  };

  pricing?: {
    amount?: number;
    currency?: string;
    originalPrice?: number;
  };

  trainer: {
    id: string;
    slug?: string;
    name: string;
    avatar?: string;
    isVerified?: boolean;
    rating?: number;
    title?: string;
    bio?: string;
  };

  // Campos extras para compatibilidade com JSX existente
  features?: string[];

  // Dados RAW para debug (opcional)
  _rawData?: {
    requirements?: string[];
    schedule?: number;
    packages?: number;
    tags?: string[];
    isActive?: boolean;
    lastUpdated?: string;
    status?: string;
    modality?: string;
    frequency?: number;
    [key: string]: any;
  };
};