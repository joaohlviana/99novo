/**
 * 👤 USERS SERVICE
 * 
 * Gerencia autenticação, perfis de usuários e operações relacionadas.
 * Suporta tanto clientes quanto treinadores.
 */

import { 
  User, 
  Client, 
  Trainer, 
  UserRole,
  ServiceResponse,
  BaseEntity
} from '../types';

// ===============================
// INTERFACES
// ===============================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  userType: 'client' | 'trainer';
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserPrefs {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
}

// ===============================
// MOCK DATA
// ===============================

const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Ana Silva",
    email: "ana@exemplo.com",
    phone: "+55 11 99999-9999",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&q=80",
    bio: "Apaixonada por fitness e vida saudável",
    isVerified: true,
    isActive: true,
    createdAt: "2023-06-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    roles: [{
      type: "client",
      isActive: true,
      activatedAt: "2023-06-15T10:00:00Z",
      permissions: ["book_sessions", "view_programs", "leave_reviews"]
    }],
    preferences: {
      language: "pt-BR",
      theme: "light",
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
        updates: true,
        reminders: true
      },
      privacy: {
        profileVisibility: "trainers",
        showLocation: false,
        showProgress: true,
        allowMessaging: true,
        allowDiscovery: true
      },
      communication: {
        preferredMethod: "app",
        languages: ["pt-BR"],
        timezone: "America/Sao_Paulo"
      }
    },
    location: {
      country: "Brasil",
      state: "São Paulo",
      city: "São Paulo",
      zipCode: "01234-567",
      timezone: "America/Sao_Paulo"
    },
    socialLinks: {
      instagram: "@ana_fitness"
    },
    onboardingCompleted: true,
    lastLoginAt: "2024-01-15T08:30:00Z",
    metadata: {
      registrationSource: "mobile_app",
      tags: ["active", "premium"],
      customFields: {}
    }
  },
  {
    id: "user-2", 
    name: "Carlos Mendes",
    email: "carlos@exemplo.com",
    phone: "+55 11 88888-8888",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    bio: "Iniciante no mundo fitness, buscando qualidade de vida",
    isVerified: false,
    isActive: true,
    createdAt: "2023-12-01T14:00:00Z",
    updatedAt: "2024-01-10T14:00:00Z",
    roles: [{
      type: "client",
      isActive: true,
      activatedAt: "2023-12-01T14:00:00Z",
      permissions: ["book_sessions", "view_programs"]
    }],
    preferences: {
      language: "pt-BR",
      theme: "dark",
      notifications: {
        email: true,
        push: false,
        sms: false,
        marketing: false,
        updates: false,
        reminders: true
      },
      privacy: {
        profileVisibility: "private",
        showLocation: false,
        showProgress: false,
        allowMessaging: false,
        allowDiscovery: false
      },
      communication: {
        preferredMethod: "email",
        languages: ["pt-BR"],
        timezone: "America/Sao_Paulo"
      }
    },
    location: {
      country: "Brasil",
      state: "Rio de Janeiro",
      city: "Rio de Janeiro",
      timezone: "America/Sao_Paulo"
    },
    socialLinks: {},
    onboardingCompleted: false,
    metadata: {
      registrationSource: "website",
      tags: ["new_user"],
      customFields: {}
    }
  }
];

let currentUser: User | null = null;

// ===============================
// SERVICE IMPLEMENTATION
// ===============================

export class UsersService {
  private static instance: UsersService;
  private authToken: string | null = null;

  static getInstance(): UsersService {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService();
    }
    return UsersService.instance;
  }

  /**
   * Login do usuário
   */
  async login(credentials: LoginCredentials): Promise<ServiceResponse<AuthResponse>> {
    try {
      await this.simulateDelay();

      // Simula autenticação
      const user = mockUsers.find(u => u.email === credentials.email);

      if (!user) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email ou senha incorretos'
          }
        };
      }

      // Simula token JWT
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken();
      
      currentUser = {
        ...user,
        lastLoginAt: new Date().toISOString()
      };

      this.authToken = token;

      return {
        success: true,
        data: {
          user: currentUser,
          token,
          refreshToken,
          expiresIn: 3600 // 1 hora
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Registro de novo usuário
   */
  async register(data: RegisterData): Promise<ServiceResponse<AuthResponse>> {
    try {
      await this.simulateDelay();

      // Verifica se email já existe
      const existingUser = mockUsers.find(u => u.email === data.email);
      if (existingUser) {
        return {
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Este email já está sendo utilizado'
          }
        };
      }

      // Cria novo usuário
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        isVerified: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roles: [{
          type: data.userType,
          isActive: true,
          activatedAt: new Date().toISOString(),
          permissions: this.getDefaultPermissions(data.userType)
        }],
        preferences: {
          language: "pt-BR",
          theme: "light",
          notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: true,
            updates: true,
            reminders: true
          },
          privacy: {
            profileVisibility: "public",
            showLocation: true,
            showProgress: false,
            allowMessaging: true,
            allowDiscovery: true
          },
          communication: {
            preferredMethod: "email",
            languages: ["pt-BR"],
            timezone: "America/Sao_Paulo"
          }
        },
        location: {
          country: "Brasil",
          state: "",
          city: "",
          timezone: "America/Sao_Paulo"
        },
        socialLinks: {},
        onboardingCompleted: false,
        metadata: {
          registrationSource: "website",
          tags: ["new_user"],
          customFields: {}
        }
      };

      mockUsers.push(newUser);
      currentUser = newUser;

      const token = this.generateToken(newUser);
      const refreshToken = this.generateRefreshToken();
      this.authToken = token;

      return {
        success: true,
        data: {
          user: newUser,
          token,
          refreshToken,
          expiresIn: 3600
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Logout do usuário
   */
  async logout(): Promise<ServiceResponse<boolean>> {
    try {
      await this.simulateDelay(100);

      currentUser = null;
      this.authToken = null;

      return {
        success: true,
        data: true,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Obtém usuário atual
   */
  async getCurrentUser(): Promise<ServiceResponse<User | null>> {
    try {
      return {
        success: true,
        data: currentUser,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'cache',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<ServiceResponse<User>> {
    try {
      await this.simulateDelay();

      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado'
          }
        };
      }

      const updatedUser = {
        ...mockUsers[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      mockUsers[userIndex] = updatedUser;
      
      if (currentUser?.id === userId) {
        currentUser = updatedUser;
      }

      return {
        success: true,
        data: updatedUser,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Alterna entre modo Cliente e Treinador
   */
  async switchUserMode(userId: string, newMode: 'client' | 'trainer'): Promise<ServiceResponse<User>> {
    try {
      await this.simulateDelay();

      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado'
          }
        };
      }

      // Verifica se usuário já tem o role
      const existingRole = user.roles.find(r => r.type === newMode);
      
      if (!existingRole) {
        // Adiciona novo role
        user.roles.push({
          type: newMode,
          isActive: true,
          activatedAt: new Date().toISOString(),
          permissions: this.getDefaultPermissions(newMode)
        });
      }

      // Ativa o role desejado e desativa os outros
      user.roles.forEach(role => {
        role.isActive = role.type === newMode;
      });

      user.updatedAt = new Date().toISOString();

      if (currentUser?.id === userId) {
        currentUser = user;
      }

      return {
        success: true,
        data: user,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    return currentUser !== null && this.authToken !== null;
  }

  /**
   * Obtém role ativo do usuário
   */
  getActiveUserRole(user?: User): UserRole | null {
    const targetUser = user || currentUser;
    if (!targetUser) return null;
    
    return targetUser.roles.find(role => role.isActive) || null;
  }

  /**
   * Verifica se usuário tem permissão específica
   */
  hasPermission(permission: string, user?: User): boolean {
    const activeRole = this.getActiveUserRole(user);
    return activeRole?.permissions.includes(permission) || false;
  }

  /**
   * Completa onboarding do usuário
   */
  async completeOnboarding(userId: string): Promise<ServiceResponse<User>> {
    try {
      await this.simulateDelay();

      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado'
          }
        };
      }

      mockUsers[userIndex].onboardingCompleted = true;
      mockUsers[userIndex].updatedAt = new Date().toISOString();

      if (currentUser?.id === userId) {
        currentUser = mockUsers[userIndex];
      }

      return {
        success: true,
        data: mockUsers[userIndex],
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mock',
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===============================
  // MÉTODOS PRIVADOS
  // ===============================

  private getDefaultPermissions(userType: 'client' | 'trainer'): string[] {
    const basePermissions = ['view_programs', 'update_profile'];
    
    if (userType === 'client') {
      return [...basePermissions, 'book_sessions', 'leave_reviews', 'view_progress'];
    } else {
      return [...basePermissions, 'create_programs', 'manage_students', 'view_analytics', 'receive_payments'];
    }
  }

  private generateToken(user: User): string {
    // Em produção, usar JWT real
    const payload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.filter(r => r.isActive),
      iat: Date.now(),
      exp: Date.now() + (3600 * 1000) // 1 hora
    };
    
    return btoa(JSON.stringify(payload));
  }

  private generateRefreshToken(): string {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
  }

  private async simulateDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private handleError(error: any): ServiceResponse<any> {
    console.error('UsersService Error:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
        details: error.message
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'mock',
        requestId: this.generateRequestId()
      }
    };
  }
}

// Export singleton instance
export const usersService = UsersService.getInstance();