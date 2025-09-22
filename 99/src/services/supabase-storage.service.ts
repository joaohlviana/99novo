/**
 * 🗂️ SUPABASE STORAGE SERVICE
 * ===========================
 * Service para gerenciar URLs do Supabase Storage com fallbacks robustos
 */

export interface StorageUrlInfo {
  url: string;
  isSupabase: boolean;
  isExpired: boolean;
  expirationDate?: Date;
}

export class SupabaseStorageService {
  /**
   * Detecta se uma URL é do Supabase Storage
   */
  static isSupabaseStorageUrl(url: string): boolean {
    return url?.includes('supabase.co/storage') || false;
  }

  /**
   * Verifica se uma URL do Supabase Storage está expirada
   */
  static isUrlExpired(url: string): boolean {
    if (!this.isSupabaseStorageUrl(url)) return false;
    
    try {
      const urlObj = new URL(url);
      const token = urlObj.searchParams.get('token');
      if (!token) return false;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp < now;
    } catch {
      return true; // Se não conseguir decodificar, assume que pode estar problemática
    }
  }

  /**
   * Analisa uma URL e retorna informações sobre ela
   */
  static analyzeUrl(url: string): StorageUrlInfo {
    const isSupabase = this.isSupabaseStorageUrl(url);
    let isExpired = false;
    let expirationDate: Date | undefined;

    if (isSupabase) {
      try {
        const urlObj = new URL(url);
        const token = urlObj.searchParams.get('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp) {
            expirationDate = new Date(payload.exp * 1000);
            isExpired = payload.exp < Math.floor(Date.now() / 1000);
          }
        }
      } catch {
        isExpired = true;
      }
    }

    return {
      url,
      isSupabase,
      isExpired,
      expirationDate
    };
  }

  /**
   * Gera URLs de fallback para diferentes tipos de conteúdo
   */
  static getFallbackUrls(type: 'cover' | 'avatar' | 'general' = 'general', size: 'large' | 'small' = 'large'): string[] {
    const dimensions = size === 'large' ? '800x600' : '400x225';
    
    const fallbacks = {
      cover: [
        `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=${dimensions}&fit=crop&auto=format&q=80`,
        `https://images.unsplash.com/photo-1606889803107-66dd7d7c9bfb?w=${dimensions}&fit=crop&auto=format&q=80`,
        `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=${dimensions}&fit=crop&auto=format&q=80`,
      ],
      avatar: [
        `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80`,
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face&auto=format&q=80`,
      ],
      general: [
        `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=${dimensions}&fit=crop&auto=format&q=80`,
        `https://images.unsplash.com/photo-1606889803107-66dd7d7c9bfb?w=${dimensions}&fit=crop&auto=format&q=80`,
      ]
    };

    return fallbacks[type] || fallbacks.general;
  }

  /**
   * Seleciona a melhor URL disponível de uma lista
   */
  static selectBestUrl(urls: (string | null | undefined)[], type: 'cover' | 'avatar' | 'general' = 'general', size: 'large' | 'small' = 'large'): string {
    // Filtra URLs válidas
    const validUrls = urls.filter((url): url is string => Boolean(url));
    
    // Procura por URLs não expiradas
    for (const url of validUrls) {
      if (!this.isUrlExpired(url)) {
        return url;
      }
    }

    // Se todas estão expiradas ou não há URLs, usa fallback
    const fallbacks = this.getFallbackUrls(type, size);
    return fallbacks[0];
  }

  /**
   * Debug: Analisa múltiplas URLs e retorna relatório
   */
  static debugUrls(urls: (string | null | undefined)[]): StorageUrlInfo[] {
    return urls
      .filter((url): url is string => Boolean(url))
      .map(url => this.analyzeUrl(url));
  }
}

// Funções de conveniência para usar nos componentes
export const isSupabaseUrlExpired = SupabaseStorageService.isUrlExpired;
export const isSupabaseStorageUrl = SupabaseStorageService.isSupabaseStorageUrl;
export const selectBestImageUrl = SupabaseStorageService.selectBestUrl;
export const getFallbackImageUrls = SupabaseStorageService.getFallbackUrls;