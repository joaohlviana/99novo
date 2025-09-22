import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * =============================================
 * TRAINER PROFILE UTILITIES
 * =============================================
 * Funções utilitárias para formatação e validação
 * de dados do perfil do treinador
 */

/**
 * Formatar número de telefone brasileiro
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara baseada no tamanho
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

/**
 * Validar CEP brasileiro
 */
export const validateCEP = (cep: string): boolean => {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
};

/**
 * Formatar CEP brasileiro
 */
export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 5) return numbers;
  return numbers.replace(/(\d{5})(\d{0,3})/, '$1-$2');
};

/**
 * Validar email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar URL do Instagram
 */
export const validateInstagramUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/;
  return instagramRegex.test(url) || url.startsWith('@');
};

/**
 * Formatar URL do Instagram
 */
export const formatInstagramUrl = (value: string): string => {
  if (!value) return '';
  
  // Se começa com @, mantém assim
  if (value.startsWith('@')) return value;
  
  // Se já é URL completa, mantém
  if (value.includes('instagram.com/')) return value;
  
  // Se é só username, adiciona @
  if (!value.includes('/') && !value.includes('@')) {
    return `@${value}`;
  }
  
  return value;
};

/**
 * Extrair username do Instagram de uma URL
 */
export const extractInstagramUsername = (url: string): string => {
  if (!url) return '';
  
  if (url.startsWith('@')) return url;
  
  const match = url.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
  return match ? `@${match[1]}` : url;
};

/**
 * Calcular completude do perfil
 */
export const calculateProfileCompletion = (profileData: any): number => {
  const requiredFields = [
    'name',
    'bio', 
    'phone',
    'email',
    'profilePhoto',
    'specialties',
    'modalities',
    'experienceYears'
  ];
  
  const completedFields = requiredFields.filter(field => {
    const value = profileData[field];
    if (Array.isArray(value)) return value.length > 0;
    return value && value.toString().trim() !== '';
  });
  
  return Math.round((completedFields.length / requiredFields.length) * 100);
};

/**
 * Gerar slug a partir de string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9 -]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
};

/**
 * Formatar experiência em anos
 */
export const formatExperienceYears = (years: string | number): string => {
  const num = typeof years === 'string' ? parseInt(years) : years;
  
  if (isNaN(num) || num <= 0) return 'Iniciante';
  if (num === 1) return '1 ano';
  if (num < 5) return `${num} anos`;
  if (num < 10) return `${num} anos`;
  return `${num}+ anos`;
};

/**
 * Validar arquivo de imagem
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Tipos permitidos
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não permitido. Use JPG, PNG ou WebP.'
    };
  }
  
  // Tamanho máximo: 5MB
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Máximo 5MB.'
    };
  }
  
  return { valid: true };
};

/**
 * Formatar tamanho de arquivo
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(null, args);
    }
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * Compare objects for equality (shallow)
 */
export const isEqual = (obj1: any, obj2: any): boolean => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
};

/**
 * Remove empty values from object
 */
export const removeEmptyValues = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      result[key] = value;
    }
  }
  
  return result;
};

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Generate random ID
 */
export const generateId = (prefix = ''): string => {
  const random = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return `${prefix}${random}${timestamp}`.toLowerCase();
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format currency (BRL)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
};