/**
 * 🔐 AUTH CONTEXT - PADRÃO OFICIAL SUPABASE
 * 
 * Implementação seguindo exatamente a documentação oficial:
 * https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// ✅ REMOVIDO HEALTH CHECK - Era fonte de lentidão desnecessária

export type UserMode = 'client' | 'trainer';

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  avatar?: string | null;
  roles: ('client' | 'trainer')[];
  currentMode: UserMode;
  // Propriedades opcionais para compatibilidade com RouteGuard
  clientProfile?: { is_complete?: boolean };
  trainerProfile?: { is_complete?: boolean };
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  switchModeAndRedirect: (mode: UserMode) => void;
  logoutAndRedirect: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ⚡ FUNÇÃO SIMPLIFICADA - SEM CONSULTAS EXTERNAS
function mapSupabaseUser(supabaseUser: SupabaseUser): AppUser {
  console.log('👤 Mapeando usuário:', supabaseUser.email);
  
  const metadataRoles = supabaseUser.user_metadata?.roles || ['client'];
  const roles = metadataRoles.filter((role: string) => ['client', 'trainer'].includes(role));
  
  // 🚀 USAR APENAS DADOS DO AUTH - MUITO MAIS RÁPIDO
  const fullName = supabaseUser.user_metadata?.name || 
                   supabaseUser.user_metadata?.full_name || 
                   supabaseUser.user_metadata?.display_name ||
                   supabaseUser.email?.split('@')[0] || 
                   'Usuário';
                   
  const avatarUrl = supabaseUser.user_metadata?.avatar_url || 
                    supabaseUser.user_metadata?.picture || 
                    null;
  
  const finalUser = {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: fullName,
    avatar: avatarUrl,
    roles: roles.length > 0 ? roles : ['client'],
    currentMode: (supabaseUser.user_metadata?.current_mode || 'client') as UserMode,
    // Por enquanto, considerar sempre completo para evitar bloqueios
    clientProfile: { is_complete: true },
    trainerProfile: { is_complete: true }
  };
  
  console.log('✅ Usuário mapeado:', { 
    name: finalUser.name, 
    roles: finalUser.roles, 
    mode: finalUser.currentMode 
  });
  
  return finalUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log('🏗️ AuthProvider: Inicializando com isLoading:', isLoading);

  useEffect(() => {
    // ⚡ CARREGAMENTO SIMPLES E DIRETO
    const loadInitialSession = async () => {
      try {
        console.log('🔑 AuthContext: Carregando sessão inicial');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('⚠️ Erro ao obter sessão:', error.message);
          setUser(null);
          setSession(null);
        } else {
          console.log('✅ Sessão carregada com sucesso');
          setSession(session);
          
          if (session?.user) {
            const appUser = mapSupabaseUser(session.user);
            setUser(appUser);
            console.log('👤 Usuário processado:', appUser.name);
          } else {
            setUser(null);
          }
        }
        
      } catch (error) {
        console.warn('⚠️ Erro na inicialização da sessão:', error);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    // 🚀 Iniciar carregamento
    loadInitialSession();

    // 🔄 Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change:', event);
        
        // Pular evento inicial e eventos duplicados para evitar loops
        if (event === 'INITIAL_SESSION') {
          console.log('⏭️ Pulando INITIAL_SESSION');
          return;
        }
        
        // Verificar se a sessão realmente mudou para evitar loops
        if (event === 'SIGNED_IN' && session?.access_token) {
          // Só processar se realmente for uma nova sessão
          try {
            setSession(prevSession => {
              // Se já temos a mesma sessão, não fazer nada
              if (prevSession?.access_token === session.access_token) {
                console.log('⏭️ Mesma sessão, pulando atualização');
                return prevSession;
              }
              
              console.log('🔄 Nova sessão detectada, atualizando...');
              return session;
            });
            
            if (session?.user) {
              const appUser = mapSupabaseUser(session.user);
              setUser(prevUser => {
                // Se já temos o mesmo usuário, não fazer nada
                if (prevUser?.id === appUser.id && prevUser?.email === appUser.email) {
                  console.log('⏭️ Mesmo usuário, pulando atualização');
                  return prevUser;
                }
                
                console.log('✅ Usuário atualizado via listener:', appUser.name);
                return appUser;
              });
            } else {
              setUser(null);
              console.log('🚪 Usuário deslogado via listener');
            }
          } catch (error) {
            console.error('🚨 Erro no listener auth:', error);
            setUser(null);
            setSession(null);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 Logout detectado');
          setUser(null);
          setSession(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const clearError = () => {
    setError(null);
  };

  const switchModeAndRedirect = (mode: UserMode) => {
    if (!user) return;
    
    if (!user.roles.includes(mode)) {
      if (mode === 'trainer') {
        window.location.href = '/become-trainer';
      } else {
        window.location.href = '/become-client';
      }
      return;
    }
    
    if (mode === 'trainer') {
      window.location.href = '/app/trainer';
    } else {
      window.location.href = '/app/client';
    }
  };

  const logoutAndRedirect = async () => {
    try {
      console.log('🚪 Iniciando logout...');
      console.log('📍 Localização atual:', window.location.href);
      
      // Limpar estado local PRIMEIRO para evitar conflitos
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('🧹 Storage local limpo');
      } catch (storageError) {
        console.warn('⚠️ Erro ao limpar storage:', storageError);
      }
      
      // Fazer logout do Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro no logout do Supabase:', error);
      } else {
        console.log('✅ Logout do Supabase bem-sucedido');
      }
      
      console.log('🏠 Redirecionando para home...');
      
      // Usar uma abordagem mais agressiva para garantir o redirecionamento
      const redirectToHome = () => {
        try {
          // Primeira tentativa: replace
          window.location.replace('/');
        } catch (replaceError) {
          console.warn('⚠️ location.replace falhou:', replaceError);
          try {
            // Segunda tentativa: href
            window.location.href = '/';
          } catch (hrefError) {
            console.warn('⚠️ location.href falhou:', hrefError);
            try {
              // Terceira tentativa: assign
              window.location.assign('/');
            } catch (assignError) {
              console.warn('⚠️ location.assign falhou:', assignError);
              // Última tentativa: reload
              window.location.reload();
            }
          }
        }
      };
      
      // Executar imediatamente
      redirectToHome();
      
      // Fallback com timeout para garantir
      setTimeout(() => {
        if (window.location.pathname !== '/') {
          console.log('🔄 Fallback timeout: tentando novamente...');
          redirectToHome();
        }
      }, 500);
      
      // Fallback de emergência
      setTimeout(() => {
        if (window.location.pathname !== '/') {
          console.log('🚨 Fallback de emergência: forçando reload completo...');
          window.location.reload();
        }
      }, 1000);
      
    } catch (error) {
      console.error('🚨 Erro crítico durante logout:', error);
      // Em caso de erro crítico, forçar reload da página
      try {
        window.location.replace('/');
      } catch {
        window.location.reload();
      }
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    clearError,
    switchModeAndRedirect,
    logoutAndRedirect
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};