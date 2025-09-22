/**
 * 🔄 ADAPTADOR ÚNICO - toUiProgram
 * ================================
 * Converte dados das tabelas reais para formato consumido pelo JSX
 * Adaptação mínima baseada na estrutura real do banco
 */

import type { DbProgramRow, DbTrainerRow, DbPublishedProgramRow, UiProgram } from '../types/database-views';

export function toUiProgram(p: DbProgramRow, t?: DbTrainerRow): UiProgram {
  console.log('[PROGRAM_DETAILS] Adaptando programa:', p.title, 'com treinador:', t?.name || 'desconhecido');

  // Extrair dados do JSONB program_data
  const basicInfo = p.program_data?.basic_info || {};
  const description = p.program_data?.description || {};
  const analytics = p.program_data?.analytics || {};
  const media = p.program_data?.media || [];
  const objectives = p.program_data?.objectives || [];

  // Fallback para features (objetivos do programa)
  const features = objectives.length > 0 ? objectives : [
    'Programa personalizado',
    'Acompanhamento profissional',
    'Resultados garantidos'
  ];

  return {
    id: p.id,
    title: p.title,
    description: description.overview || p.title || '',
    shortDescription: description.shortDescription || undefined,
    category: p.category || undefined,
    level: p.level || undefined,
    media: Array.isArray(media) ? media : (p.cover_image || p.thumbnail ? [{ url: p.cover_image || p.thumbnail!, alt: p.title }] : []),
    features: Array.isArray(features) ? features : [],

    stats: {
      reviewCount: Number(analytics.reviews_count || 0),
      enrollments: Number(analytics.conversions || 0),
      averageRating: analytics.average_rating || undefined,
      activeStudents: Number(analytics.inquiries || 0),
    },

    duration: {
      weeks: basicInfo.duration || (typeof p.duration === 'string' ? parseInt(p.duration) : p.duration) || 12,
      hoursPerWeek: basicInfo.hoursPerWeek || 4, // Padrão estimado
      totalHours: basicInfo.totalHours || ((basicInfo.duration || (typeof p.duration === 'string' ? parseInt(p.duration) : p.duration) || 12) * 4),
    },

    pricing: {
      amount: p.base_price || basicInfo.base_price || undefined,
      currency: 'BRL',
    },

    trainer: {
      id: p.trainer_id,
      slug: t?.slug || undefined,
      name: t?.name || 'Treinador(a)',
      avatar: t?.profile_data?.profilePhoto || undefined,
      isVerified: t?.is_verified || false,
      rating: 4.5, // Valor padrão
      title: 'Personal Trainer',
      bio: t?.profile_data?.bio || undefined,
    },
  };
}

// Função utilitária para formatar nível
export function getLevelDisplay(level?: string): string {
  if (!level) return 'Todos os níveis';
  
  switch (level.toLowerCase()) {
    case 'beginner': return 'Iniciante';
    case 'intermediate': return 'Intermediário';
    case 'advanced': return 'Avançado';
    default: return level;
  }
}

// Função utilitária para fallback de programa legado (compatibilidade)
export function adaptLegacyProgram(program: any): UiProgram | null {
  if (!program) return null;
  
  console.log('[PROGRAM_DETAILS] Adaptando programa legado:', program.title);
  
  return {
    id: program.id || '',
    title: program.title || '',
    description: program.description || '',
    shortDescription: program.shortDescription,
    category: program.category,
    level: program.level,
    media: Array.isArray(program.media) ? program.media : [],
    features: Array.isArray(program.features) ? program.features : [],

    stats: {
      reviewCount: program.stats?.reviewCount || 0,
      enrollments: program.stats?.enrollments || 0,
      averageRating: program.stats?.averageRating,
      activeStudents: program.stats?.activeStudents,
    },

    duration: {
      weeks: program.duration?.weeks,
      hoursPerWeek: program.duration?.hoursPerWeek,
      totalHours: program.duration?.totalHours,
    },

    pricing: {
      amount: program.pricing?.amount,
      currency: program.pricing?.currency,
    },

    trainer: {
      id: program.trainer?.id || '',
      slug: program.trainer?.slug,
      name: program.trainer?.name || 'Treinador(a)',
      avatar: program.trainer?.avatar,
      isVerified: program.trainer?.isVerified,
      rating: program.trainer?.rating,
      title: program.trainer?.title,
      bio: program.trainer?.bio,
    },
  };
}

// 🎯 Função otimizada para view published_programs_by_trainer (já tem dados do trainer)
export function toUiProgramFromView(p: DbPublishedProgramRow): UiProgram {
  console.log('[UI_ADAPTER] Adaptando programa da view:', p.title, 'do treinador:', p.trainer_name);
  console.log('[UI_ADAPTER] 🐛 TODOS OS CAMPOS DA VIEW:', Object.keys(p as any));
  console.log('[UI_ADAPTER] 🐛 PROGRAM_DATA RAW COMPLETO:', JSON.stringify(p.program_data, null, 2));

  // Extrair dados do JSONB program_data com mais detalhes
  const programData = p.program_data || {};
  const analytics = programData.analytics || {};
  const media = programData.media || [];
  const objectives = programData.objectives || [];
  const whatYouGet = programData.whatYouGet || [];
  const requirements = programData.requirements || [];
  const schedule = programData.schedule || [];
  const packages = programData.packages || [];
  const basicInfo = programData.basic_info || {};
  const tags = programData.tags || [];
  
  console.log('[UI_ADAPTER] 🐛 JSONB ESTRUTURADO EXTRAÍDO:', {
    analytics,
    media,
    objectives,
    whatYouGet,
    requirements,
    schedule: schedule.length + ' weeks',
    packages: packages.length + ' packages',
    basicInfo,
    tags,
    fullDescription: programData.fullDescription,
    shortDescription: programData.shortDescription,
    isActive: programData.isActive,
    lastUpdated: programData.lastUpdated
  });

  // Priorizar features dos dados JSONB
  let features = [];
  if (objectives.length > 0) features = [...features, ...objectives];
  if (whatYouGet.length > 0) features = [...features, ...whatYouGet];
  
  // Fallback se não houver features
  if (features.length === 0) {
    features = [
      'Programa personalizado',
      'Acompanhamento profissional',
      'Resultados garantidos'
    ];
  }

  // Extrair preço dos packages se disponível
  const packagePrice = packages.length > 0 ? packages[0].price : undefined;
  const finalPrice = packagePrice || p.display_price || p.base_price || 0;

  // Extrair descrições do JSON
  const fullDescription = programData.fullDescription || programData.description || '';
  const shortDesc = programData.shortDescription || p.short_description || '';

  return {
    id: p.id,
    title: p.title,
    description: fullDescription || shortDesc || p.title,
    shortDescription: shortDesc || undefined,
    category: p.category || undefined,
    level: p.level || undefined,
    media: Array.isArray(media) && media.length > 0 ? media : (p.cover_image ? [{ url: p.cover_image, alt: p.title }] : []),
    features: Array.isArray(features) ? features : [],

    stats: {
      reviewCount: Number(analytics.reviews_count || analytics.reviewCount || 0),
      enrollments: Number(analytics.conversions || analytics.enrollments || 0),
      averageRating: analytics.average_rating || analytics.averageRating || undefined,
      activeStudents: Number(analytics.inquiries || analytics.activeStudents || 0),
    },

    duration: {
      weeks: p.duration || basicInfo.duration || 12,
      hoursPerWeek: basicInfo.hoursPerWeek || 4,
      totalHours: basicInfo.totalHours || ((p.duration || 12) * 4),
    },

    pricing: {
      amount: finalPrice,
      currency: 'BRL',
      originalPrice: packages.length > 0 ? packages[0].suggested_price : undefined,
    },

    trainer: {
      id: p.trainer_id,
      slug: p.slug || undefined,
      name: p.trainer_name || 'Treinador(a)',
      avatar: basicInfo.trainerAvatar || undefined,
      isVerified: false, // Não disponível na view
      rating: analytics.averageRating || 4.5,
      title: 'Personal Trainer',
      bio: undefined, // Não disponível na view
    },

    // Campos extras do JSONB para debug
    _rawData: {
      requirements,
      schedule: schedule.length,
      packages: packages.length,
      tags,
      isActive: programData.isActive,
      lastUpdated: programData.lastUpdated,
      status: (p as any).status,
      modality: p.modality,
      frequency: p.frequency,
    }
  };
}