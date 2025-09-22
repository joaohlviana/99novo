/**
 * 🏋️ TRAINER PROFILE HYBRID SERVICE - VERSÃO RESILIENTE
 * 
 * Serviço para gerenciar perfis de treinadores na tabela híbrida 99_trainer_profile
 * Usa JSON para máxima flexibilidade e performance
 * VERSÃO SIMPLIFICADA E ROBUSTA - evita loops infinitos
 */

import { supabase } from '../lib/supabase/client';
import { normalizeTrainerVisual } from './normalize';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface TrainerProfileData {
  // Dados básicos
  bio?: string;
  phone?: string;
  instagram?: string;
  
  // Experiência profissional
  experienceYears?: string;
  responseTime?: string;
  studentsCount?: string;
  credential?: string;
  
  // Especialidades e modalidades
  specialties?: string[];
  modalities?: string[];
  
  // Localização
  cities?: string[];
  address?: string;
  cep?: string;
  number?: string;
  complement?: string;
  city?: string;
  
  // Formação
  universities?: Array<{
    name: string;
    course: string;
    year: string;
  }>;
  courses?: Array<{
    name: string;
    institution: string;
    year: string;
  }>;
  
  // Mídia
  galleryImages?: Array<{
    url: string;
    description?: string;
    order?: number;
  }>;
  stories?: Array<{
    url: string;
    type: 'image' | 'video';
    description?: string;
  }>;
  profilePhoto?: string;
  
  // Metadados
  completionPercentage?: number;
  lastUpdated?: string;
  
  // Dados dinâmicos (para futuras expansões)
  [key: string]: any;
}

export interface TrainerProfile {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  phone?: string;
  status: 'draft' | 'active' | 'inactive' | 'suspended' | 'pending_verification';
  is_active: boolean;
  is_verified: boolean;
  profile_data: TrainerProfileData;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface CreateTrainerProfileInput {
  user_id: string;
  name?: string;
  email?: string;
  phone?: string;
  profile_data?: TrainerProfileData;
}

export interface UpdateTrainerProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  is_active?: boolean;
  is_verified?: boolean;
  profile_data?: Partial<TrainerProfileData>;
}

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

class TrainerProfileService {
  private readonly tableName = 'user_profiles';

  /**
   * Buscar perfil por user_id (SEM usar .single() que causa PGRST116)
   */
  async getByUserId(userId: string): Promise<TrainerProfile | null> {
    try {
      console.log('🔍 TrainerProfileService: Buscando perfil para user_id:', userId);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'trainer')
        .limit(1);

      if (error) {
        console.error('❌ Erro na busca:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log(`ℹ️ Nenhum trainer profile encontrado para user_id: ${userId}`);
        return null;
      }

      const profile = data[0] as TrainerProfile;
      console.log('✅ Perfil encontrado:', profile.name || 'Sem nome', 'ID:', profile.id);
      return profile;

    } catch (error) {
      console.error(`❌ Erro ao buscar perfil para user_id: ${userId}`, error);
      return null;
    }
  }

  /**
   * Buscar perfil por ID (UUID)
   */
  async getById(id: string): Promise<TrainerProfile | null> {
    try {
      console.log('🔍 TrainerProfileService: Buscando perfil para ID (UUID):', id);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq('role', 'trainer')
        .limit(1);

      if (error) {
        console.error('❌ Erro na busca por ID:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log(`ℹ️ Nenhum perfil encontrado para ID: ${id}`);
        return null;
      }

      const profile = data[0] as TrainerProfile;
      console.log('✅ Perfil encontrado por ID:', profile.name || 'Sem nome');
      return profile;

    } catch (error) {
      console.error(`❌ Erro ao buscar perfil por ID: ${id}`, error);
      return null;
    }
  }

  /**
   * Buscar perfil por slug
   */
  async getBySlug(slug: string): Promise<TrainerProfile | null> {
    try {
      console.log('🔍 TrainerProfileService: Buscando perfil para slug:', slug);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('slug', slug)
        .eq('role', 'trainer')
        .limit(1);

      if (error) {
        console.error('❌ Erro na busca por slug:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log(`ℹ️ Nenhum perfil encontrado para slug: ${slug}`);
        return null;
      }

      const profile = data[0] as TrainerProfile;
      console.log('✅ Perfil encontrado por slug:', profile.name || 'Sem nome');
      return profile;

    } catch (error) {
      console.error(`❌ Erro ao buscar perfil por slug: ${slug}`, error);
      return null;
    }
  }

  /**
   * UPSERT NATIVO - usa funcionalidade nativa do Supabase
   * Esta é a abordagem mais robusta e evita loops
   */
  async upsert(input: CreateTrainerProfileInput & UpdateTrainerProfileInput): Promise<TrainerProfile> {
    try {
      console.log('🔄 TrainerProfileService: Executando UPSERT NATIVO para user_id:', input.user_id);

      // Preparar dados completos
      const profileData: TrainerProfileData = {
        ...input.profile_data,
        completionPercentage: this.calculateCompletionPercentage(input.profile_data || {}),
        lastUpdated: new Date().toISOString()
      };

      const fullData = {
        user_id: input.user_id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        status: input.status || 'draft',
        is_active: input.is_active !== undefined ? input.is_active : true,
        is_verified: input.is_verified !== undefined ? input.is_verified : false,
        profile_data: profileData,
        updated_at: new Date().toISOString()
      };

      console.log('📊 Dados para upsert:', {
        user_id: fullData.user_id,
        name: fullData.name,
        hasProfileData: !!fullData.profile_data
      });

      // Adicionar role de trainer
      const dataWithRole = {
        ...fullData,
        role: 'trainer'
      };

      // Usar upsert nativo do Supabase com constraint correta
      const { data, error } = await supabase
        .from(this.tableName)
        .upsert(dataWithRole, {
          onConflict: ['user_id', 'role'],
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error('❌ Erro no upsert nativo:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhum perfil foi criado/atualizado');
      }

      const savedProfile = data[0] as TrainerProfile;
      console.log('✅ Upsert nativo executado com sucesso:', savedProfile.id);
      return savedProfile;

    } catch (error) {
      console.error('❌ Erro no upsert nativo:', error);
      throw new Error(`Erro ao salvar perfil: ${error.message}`);
    }
  }

  /**
   * Criar novo perfil (fallback manual se upsert falhar)
   */
  async create(input: CreateTrainerProfileInput): Promise<TrainerProfile> {
    try {
      console.log('➕ TrainerProfileService: Criando novo perfil (fallback):', input.name || 'Sem nome');

      const profileData: TrainerProfileData = {
        ...input.profile_data,
        completionPercentage: this.calculateCompletionPercentage(input.profile_data || {}),
        lastUpdated: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          user_id: input.user_id,
          name: input.name,
          email: input.email,
          phone: input.phone,
          role: 'trainer',
          status: 'draft',
          is_active: true,
          is_verified: false,
          profile_data: profileData
        })
        .select();

      if (error) {
        // Se foi erro de duplicata, buscar o existente
        if (error.code === '23505') {
          console.log('⚠️ Perfil duplicado, buscando existente...');
          const existingProfile = await this.getByUserId(input.user_id);
          if (existingProfile) {
            return existingProfile;
          }
        }
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhum perfil foi criado');
      }

      const newProfile = data[0] as TrainerProfile;
      console.log('✅ Perfil criado (fallback):', newProfile.id);
      return newProfile;

    } catch (error) {
      console.error('❌ Erro ao criar perfil (fallback):', error);
      throw new Error(`Erro ao criar perfil: ${error.message}`);
    }
  }

  /**
   * Atualizar perfil existente (não usado mais, mas mantido para compatibilidade)
   */
  async update(userId: string, input: UpdateTrainerProfileInput): Promise<TrainerProfile> {
    try {
      console.log('💾 TrainerProfileService: Redirecionando update para upsert...');
      
      // Redirecionar para upsert que é mais robusto
      return await this.upsert({ user_id: userId, ...input });

    } catch (error) {
      console.error('❌ Erro no update (redirecionado):', error);
      throw error;
    }
  }

  /**
   * Buscar todos os perfis (para testes)
   */
  async getAll(limit: number = 10): Promise<TrainerProfile[]> {
    try {
      console.log('📋 TrainerProfileService: Buscando todos os perfis (limite:', limit, ')');

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} perfis`);
      return data as TrainerProfile[] || [];

    } catch (error) {
      console.error('❌ Erro ao buscar todos os perfis:', error);
      throw new Error(`Erro ao buscar perfis: ${error.message}`);
    }
  }

  /**
   * Buscar trainers ativos por filtros
   */
  async searchTrainers(filters: {
    specialty?: string;
    city?: string;
    modality?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<TrainerProfile[]> {
    try {
      console.log('🔍 Buscando trainers com filtros:', filters);

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('role', 'trainer')
        .eq('is_active', true)
        .eq('status', 'active');

      // Filtros JSON usando operadores PostgreSQL
      if (filters.specialty) {
        query = query.contains('profile_data->specialties', [filters.specialty]);
      }

      if (filters.city) {
        query = query.contains('profile_data->cities', [filters.city]);
      }

      if (filters.modality) {
        query = query.contains('profile_data->modalities', [filters.modality]);
      }

      // Paginação
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} trainers`);
      return data as TrainerProfile[];

    } catch (error) {
      console.error('❌ Erro na busca de trainers:', error);
      throw new Error(`Erro na busca: ${error.message}`);
    }
  }

  /**
   * Listar todos os trainers ativos
   */
  async listActive(limit = 50, offset = 0): Promise<TrainerProfile[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('role', 'trainer')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data as TrainerProfile[];

    } catch (error) {
      console.error('❌ Erro ao listar trainers ativos:', error);
      throw new Error(`Erro ao listar trainers: ${error.message}`);
    }
  }

  /**
   * Atualizar status do trainer
   */
  async updateStatus(userId: string, status: TrainerProfile['status']): Promise<void> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhum registro foi atualizado');
      }

      console.log(`✅ Status atualizado para: ${status}`);

    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      throw new Error(`Erro ao atualizar status: ${error.message}`);
    }
  }

  /**
   * Deletar perfil (soft delete)
   */
  async delete(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ 
          is_active: false, 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ Nenhum registro foi atualizado no soft delete');
        return; // Não é erro se já não existe
      }

      console.log('✅ Perfil desativado (soft delete)');

    } catch (error) {
      console.error('❌ Erro ao deletar perfil:', error);
      throw new Error(`Erro ao deletar perfil: ${error.message}`);
    }
  }

  /**
   * Calcular percentual de completude do perfil
   */
  private calculateCompletionPercentage(profileData: TrainerProfileData): number {
    const requiredFields = [
      'bio', 'phone', 'experienceYears', 'responseTime', 
      'studentsCount', 'modalities', 'cities'
    ];
    
    const optionalFields = [
      'instagram', 'credential', 'specialties', 'universities', 
      'courses', 'galleryImages', 'profilePhoto'
    ];

    let score = 0;
    let maxScore = 0;

    // Campos obrigatórios (peso 10)
    requiredFields.forEach(field => {
      maxScore += 10;
      if (profileData[field] && 
          (Array.isArray(profileData[field]) 
            ? profileData[field].length > 0 
            : profileData[field].toString().trim().length > 0)) {
        score += 10;
      }
    });

    // Campos opcionais (peso 5)
    optionalFields.forEach(field => {
      maxScore += 5;
      if (profileData[field] && 
          (Array.isArray(profileData[field]) 
            ? profileData[field].length > 0 
            : profileData[field].toString().trim().length > 0)) {
        score += 5;
      }
    });

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Buscar trainers por especialidade (para testes)
   */
  async searchBySpecialty(specialty: string): Promise<TrainerProfile[]> {
    try {
      console.log('🔍 Buscando trainers por especialidade:', specialty);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('role', 'trainer')
        .eq('is_active', true)
        .contains('profile_data->specialties', [specialty]);

      if (error) {
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} trainers com especialidade "${specialty}"`);
      return data as TrainerProfile[] || [];

    } catch (error) {
      console.error('❌ Erro na busca por especialidade:', error);
      throw new Error(`Erro na busca por especialidade: ${error.message}`);
    }
  }

  /**
   * Buscar trainers por cidade (para testes)
   */
  async searchByCity(city: string): Promise<TrainerProfile[]> {
    try {
      console.log('🔍 Buscando trainers por cidade:', city);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('role', 'trainer')
        .eq('is_active', true)
        .contains('profile_data->cities', [city]);

      if (error) {
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} trainers na cidade "${city}"`);
      return data as TrainerProfile[] || [];

    } catch (error) {
      console.error('❌ Erro na busca por cidade:', error);
      throw new Error(`Erro na busca por cidade: ${error.message}`);
    }
  }

  /**
   * Estatísticas gerais
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    draft: number;
    verified: number;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('status, is_active, is_verified')
        .eq('role', 'trainer');

      if (error) {
        throw error;
      }

      const stats = {
        total: data.length,
        active: data.filter(p => p.is_active && p.status === 'active').length,
        draft: data.filter(p => p.status === 'draft').length,
        verified: data.filter(p => p.is_verified).length
      };

      return stats;

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }
  }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

// ============================================
// 3) ESCRITA REAL DO AVATAR (atualiza JSON + coluna simples)
// ============================================

/**
 * Salva avatar do treinador usando padrão de chave fixa e RLS público
 * Padrão: avatars/<uid>/avatar/avatar.jpg - evita acúmulo de arquivos
 * ✅ BUCKET PÚBLICO: URLs diretas funcionam sem autenticação
 * ✅ COMPATÍVEL: Funciona com configuração via Supabase Dashboard
 */
export async function saveTrainerAvatar(userId: string, file: File) {
  console.log('📤 Upload avatar iniciado', { 
    userId, 
    fileName: file.name, 
    fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    fileType: file.type 
  });

  // 1) Verificar autenticação (obrigatório para upload)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('❌ Erro de autenticação:', authError);
    throw new Error('Usuário não autenticado para upload');
  }

  // 2) Validar tamanho do arquivo (50MB limit)
  const maxSizeBytes = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSizeBytes) {
    throw new Error(`Arquivo muito grande. Máximo: 50MB, atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }

  // 3) Validar tipo de arquivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(', ')}`);
  }

  // 4) Configurar upload com padrão de chave fixa
  const bucket = 'avatars';
  const objectKey = `${userId}/avatar/avatar.jpg`;
  
  console.log('🔄 Fazendo upload para bucket público:', { 
    bucket, 
    objectKey, 
    userId: user.id === userId ? '✅ Mesmo usuário' : '⚠️ Usuários diferentes'
  });
  
  // 5) Executar upload com configurações otimizadas
  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(objectKey, file, {
      upsert: true,           // Sobrescrever arquivo anterior
      contentType: file.type, // Tipo explícito
      cacheControl: '3600'    // Cache de 1 hora
    });

  if (upErr) {
    console.error('❌ Erro detalhado no upload:', {
      error: upErr,
      bucket,
      objectKey,
      fileInfo: { name: file.name, size: file.size, type: file.type }
    });
    throw new Error(`Falha no upload: ${upErr.message}`);
  }

  // 6) Gerar URL pública (funciona devido ao bucket público)
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(objectKey);
  if (!publicUrl) {
    console.error('❌ Falha ao gerar URL pública');
    throw new Error('Falha ao obter publicUrl do avatar');
  }
  
  console.log('✅ Avatar salvo com sucesso:', {
    publicUrl,
    bucket,
    objectKey,
    cacheControl: '1 hora'
  });

  // 2) Buscar dados atuais para merge do JSON
  const { data: currentData, error: fetchError } = await supabase
    .from('user_profiles')
    .select('profile_data')
    .eq('user_id', userId)
    .eq('role', 'trainer')
    .limit(1);

  if (fetchError) throw fetchError;

  // 3) Merge do profile_data mantendo dados existentes
  const existingProfileData = (currentData && currentData.length > 0) ? currentData[0]?.profile_data : {};
  const updatedProfileData = {
    ...existingProfileData,
    profilePhoto: publicUrl
  };

  // 4) atualizar user_profiles (APENAS profile_data - sem avatar_url para evitar erro 42703)
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      profile_data: updatedProfileData
    })
    .eq('user_id', userId)
    .eq('role', 'trainer')
    .select('id,user_id,name,slug,profile_data')
    .limit(1);  // usar limit(1) ao invés de .single() para evitar PGRST116

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error('Nenhum perfil foi atualizado no upload de avatar');
  }

  // 5) normalizar p/ UI usando o primeiro resultado
  const profileData = data[0];
  const normalized = normalizeTrainerVisual({
    ...profileData,
    profile_data: updatedProfileData
  });

  console.log('✅ Avatar atualizado', { publicUrl });

  return normalized;
}

/**
 * 🧹 LIMPEZA OPCIONAL: Remove versões antigas com timestamp
 * Mantém apenas o arquivo padrão avatar.jpg
 */
export async function cleanOldAvatars(userId: string): Promise<void> {
  try {
    console.log('🧹 Iniciando limpeza de avatars antigos para userId:', userId);
    
    const bucket = 'avatars';
    const folder = `${userId}`;
    
    // Listar todos os arquivos do usuário
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list(folder, { limit: 100 });
    
    if (error) {
      console.error('❌ Erro ao listar arquivos para limpeza:', error);
      return; // Não propagar erro - limpeza é opcional
    }

    if (!files || files.length === 0) {
      console.log('ℹ️ Nenhum arquivo encontrado para limpeza');
      return;
    }

    // Filtrar arquivos antigos (manter apenas avatar/avatar.jpg)
    const toDelete = files
      .filter(f => {
        // Manter arquivos na subpasta avatar/ ou que sejam exatamente avatar.jpg
        const isNewStandard = f.name === 'avatar' || f.name.startsWith('avatar/');
        const isTimestampFile = f.name.includes('-') && (f.name.includes('.jpg') || f.name.includes('.jpeg') || f.name.includes('.png'));
        
        return isTimestampFile && !isNewStandard;
      })
      .map(f => `${folder}/${f.name}`);

    if (toDelete.length === 0) {
      console.log('✅ Nenhum arquivo antigo encontrado para remover');
      return;
    }

    console.log(`🗑️ Removendo ${toDelete.length} arquivos antigos:`, toDelete);

    // Remover arquivos antigos
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove(toDelete);

    if (deleteError) {
      console.error('⚠️ Erro na limpeza (não crítico):', deleteError);
      return; // Não propagar erro - limpeza é opcional
    }

    console.log(`✅ Limpeza concluída: ${toDelete.length} arquivos removidos`);

  } catch (error) {
    console.error('⚠️ Erro na limpeza de avatars (não crítico):', error);
    // Não propagar erro - limpeza é opcional
  }
}

/**
 * 🔍 UTILITÁRIO: Obter URL pública do avatar (funciona sem autenticação)
 * Útil para componentes que precisam exibir avatars sem contexto de auth
 */
export function getPublicAvatarUrl(userId: string): string {
  const bucket = 'avatars';
  const objectKey = `${userId}/avatar/avatar.jpg`;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(objectKey);
  
  return publicUrl;
}

/**
 * 🧪 DEBUG: Listar avatars de um usuário (para troubleshooting)
 * Funciona com bucket público - não requer autenticação para listar
 */
export async function listUserAvatars(userId: string): Promise<any[]> {
  try {
    const bucket = 'avatars';
    const folder = userId;
    
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list(folder, { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });
    
    if (error) {
      console.error('❌ Erro ao listar avatars:', error);
      return [];
    }

    return files || [];
  } catch (error) {
    console.error('❌ Erro na listagem de avatars:', error);
    return [];
  }
}

export const trainerProfileService = new TrainerProfileService();
export default trainerProfileService;