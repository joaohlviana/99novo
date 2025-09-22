/**
 * 🎨 NORMALIZE SERVICE
 * 
 * Funções de normalização visual para garantir consistência
 * em toda a aplicação - seguindo especificações do sistema de avatares
 */

import { validateTrainerInfo } from './types/trainer-resolver.dto';

// ============================================
// 2) NORMALIZAÇÃO ÚNICA (sem placeholder "fixo")
// ============================================

/**
 * Normaliza dados visuais de trainer (view trainers_with_slugs)
 * ✅ NÃO injeta placeholder - deixa null para UI cair em iniciais
 * ✅ Compatível com TrainerInfo (validação incluída)
 */
export function normalizeTrainerVisual(row: any) {
  const name =
    row?.name ??
    row?.profile_data?.name ??
    (row?.email ? row.email.split('@')[0] : 'Personal Trainer');

  // ✅ ordem: profilePhoto (json) -> null (não usa avatar_url para evitar erro 42703)
  // (NÃO coloque placeholder aqui)
  const avatar = row?.profile_data?.profilePhoto ?? null;

  const slug = row?.slug ?? '';
  const initials = (name || 'T').slice(0, 2).toUpperCase();

  // Preparar dados para validação TrainerInfo
  const trainerData = {
    id: row?.id ?? row?.profile_id ?? null, 
    user_id: row?.user_id ?? row?.trainer_user_id ?? row?.trainer_id ?? null, 
    slug, 
    name, 
    avatar, 
    initials,
    // Campos para compatibilidade com TrainerInfo
    bio: row?.bio || row?.profile_data?.bio,
    profilePhoto: avatar, // mesmo que avatar
    location: row?.location || row?.profile_data?.location,
    specialties: Array.isArray(row?.specialties) ? row?.specialties : (row?.profile_data?.specialties || []),
    rating: row?.rating || 0,
    reviewCount: row?.review_count || 0,
    priceFrom: row?.price_from,
    isVerified: row?.is_verified || false,
    isActive: row?.is_active || false,
    status: row?.status
  };

  // 🎯 TELEMETRIA: Log dos identificadores resolvidos
  console.log('🎯 Telemetria: normalize_trainer_visual', {
    resolved_profile_id: trainerData.id,
    resolved_user_id: trainerData.user_id, 
    slug,
    name,
    avatar: avatar ? 'SIM' : 'NÃO'
  });

  // Validar e retornar dados compatíveis com TrainerInfo
  try {
    return validateTrainerInfo(trainerData);
  } catch (validationError) {
    console.warn('⚠️ Erro na validação TrainerInfo, retornando dados básicos:', validationError.message);
    // Retornar dados mínimos se validação falhar
    return {
      id: trainerData.id || 'unknown',
      user_id: trainerData.user_id || 'unknown', 
      slug: trainerData.slug || 'unknown',
      name: trainerData.name || 'Personal Trainer',
      avatar,
      initials,
      bio: trainerData.bio,
      profilePhoto: avatar,
      location: trainerData.location,
      specialties: trainerData.specialties || [],
      rating: 0,
      reviewCount: 0,
      priceFrom: trainerData.priceFrom,
      isVerified: false,
      isActive: false,
      status: trainerData.status
    };
  }
}

/**
 * Normaliza dados de trainer em cards/páginas de programa
 * Para uso quando os dados vêm de views de programas
 */
export function normalizeProgramTrainer(row: any) {
  const name = row?.trainer_name ?? 'Personal Trainer';
  const avatar = row?.trainer_avatar ?? row?.profile_photo ?? null;
  const slug = row?.trainer_slug ?? null;
  const initials = (name || 'T').slice(0, 2).toUpperCase();
  return { name, avatar, slug, initials };
}

// ============================================
// EXPORTAÇÕES PRINCIPAIS
// ============================================

export { normalizeTrainerVisual as default };