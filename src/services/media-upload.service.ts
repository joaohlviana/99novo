/**
 * 🖼️ MEDIA UPLOAD SERVICE
 * 
 * Serviço para upload de imagens e mídia para Supabase Storage
 * Usado pelo sistema de programas de treinamento
 */

import { supabase } from '../lib/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface UploadResult {
  url: string;
  path: string;
  publicUrl: string;
}

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  resize?: {
    width: number;
    height: number;
    quality?: number;
  };
}

// ============================================
// CONFIGURAÇÕES
// ============================================

const DEFAULT_BUCKET = 'make-e547215c-program-media';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

class MediaUploadService {
  
  /**
   * Inicializar bucket se não existir
   */
  async initializeBucket(bucketName: string = DEFAULT_BUCKET): Promise<void> {
    try {
      // Verificar se bucket existe
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`📦 Bucket ${bucketName} não existe - assumindo que será criado via servidor`);
        // Não tentamos criar o bucket aqui - deixamos para o servidor fazer isso
        // Isso evita problemas de RLS no client-side
        console.log(`⚠️ Bucket ${bucketName} será criado automaticamente no primeiro upload`);
      } else {
        console.log(`✅ Bucket ${bucketName} já existe`);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar bucket:', error);
      // Não propagamos o erro - tentaremos usar o bucket mesmo assim
      console.log(`⚠️ Continuando upload mesmo com erro na verificação do bucket`);
    }
  }

  /**
   * Validar arquivo antes do upload
   */
  private validateFile(file: File): void {
    // Verificar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Tipo de arquivo não permitido: ${file.type}`);
    }
    
    // Verificar tamanho
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      throw new Error(`Arquivo muito grande: ${sizeMB}MB (máx: 5MB)`);
    }
  }

  /**
   * Gerar nome único para arquivo
   */
  private generateFileName(originalName: string, folder?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${timestamp}-${random}.${extension}`;
    
    return folder ? `${folder}/${fileName}` : fileName;
  }

  /**
   * Upload de arquivo único (via servidor para evitar RLS)
   */
  async uploadFile(
    file: File, 
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Validar arquivo
      this.validateFile(file);
      
      console.log(`📤 Fazendo upload via servidor: ${file.name}`);
      
      // Converter arquivo para base64
      const base64Data = await this.fileToBase64(file);
      
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }
      
      // Fazer upload via servidor
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e547215c/program-media/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: file.name,
          folder: options.folder
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro no upload');
      }
      
      console.log(`✅ Upload concluído via servidor: ${result.data.path}`);
      return result.data;
      
    } catch (error) {
      console.error('❌ Erro no upload via servidor:', error);
      throw error;
    }
  }

  /**
   * Converter arquivo para base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Upload de múltiplos arquivos
   */
  async uploadMultipleFiles(
    files: File[], 
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    try {
      console.log(`📤 Fazendo upload de ${files.length} arquivos`);
      
      const uploadPromises = files.map(file => this.uploadFile(file, options));
      const results = await Promise.all(uploadPromises);
      
      console.log(`✅ Upload de ${files.length} arquivos concluído`);
      return results;
      
    } catch (error) {
      console.error('❌ Erro no upload múltiplo:', error);
      throw error;
    }
  }

  /**
   * Deletar arquivo
   */
  async deleteFile(filePath: string, bucketName: string = DEFAULT_BUCKET): Promise<void> {
    try {
      console.log(`🗑️ Deletando arquivo: ${filePath}`);
      
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
      
      if (error) {
        console.error('❌ Erro ao deletar:', error);
        throw new Error(`Erro ao deletar arquivo: ${error.message}`);
      }
      
      console.log(`✅ Arquivo deletado: ${filePath}`);
      
    } catch (error) {
      console.error('❌ Erro ao deletar arquivo:', error);
      throw error;
    }
  }

  /**
   * Deletar múltiplos arquivos
   */
  async deleteMultipleFiles(filePaths: string[], bucketName: string = DEFAULT_BUCKET): Promise<void> {
    try {
      console.log(`🗑️ Deletando ${filePaths.length} arquivos`);
      
      const { error } = await supabase.storage
        .from(bucketName)
        .remove(filePaths);
      
      if (error) {
        console.error('❌ Erro ao deletar múltiplos arquivos:', error);
        throw new Error(`Erro ao deletar arquivos: ${error.message}`);
      }
      
      console.log(`✅ ${filePaths.length} arquivos deletados`);
      
    } catch (error) {
      console.error('❌ Erro ao deletar múltiplos arquivos:', error);
      throw error;
    }
  }

  /**
   * Obter URL assinada para arquivo existente
   */
  async getSignedUrl(filePath: string, bucketName: string = DEFAULT_BUCKET, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);
      
      if (error) {
        throw new Error(`Erro ao gerar URL: ${error.message}`);
      }
      
      return data.signedUrl;
      
    } catch (error) {
      console.error('❌ Erro ao obter URL assinada:', error);
      throw error;
    }
  }

  /**
   * Listar arquivos em uma pasta
   */
  async listFiles(folder?: string, bucketName: string = DEFAULT_BUCKET): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folder || '', {
          limit: 100,
          offset: 0
        });
      
      if (error) {
        throw new Error(`Erro ao listar arquivos: ${error.message}`);
      }
      
      return data?.map(file => file.name) || [];
      
    } catch (error) {
      console.error('❌ Erro ao listar arquivos:', error);
      throw error;
    }
  }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

export const mediaUploadService = new MediaUploadService();
export default mediaUploadService;

// ============================================
// HELPERS UTILITÁRIOS
// ============================================

/**
 * Converter File para base64 (para preview)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Redimensionar imagem (client-side)
 */
export const resizeImage = (
  file: File, 
  maxWidth: number, 
  maxHeight: number, 
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calcular dimensões mantendo proporção
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Converter para blob
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};