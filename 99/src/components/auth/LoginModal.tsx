/**
 * 🔐 LOGIN MODAL
 * 
 * Modal de login para interações que exigem autenticação.
 * Após login bem-sucedido, executa a ação pendente.
 */

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export function LoginModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = "Entre para continuar",
  description = "Você precisa estar logado para realizar esta ação"
}: LoginModalProps) {
  const { login, isLoading: authLoading, error: authError, clearError } = useAuth();
  const isLoading = authLoading;
  const loginError = authError;
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showTestUsers, setShowTestUsers] = useState(false);

  // Limpar estado quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      clearError();
      setFormData({ email: '', password: '' });
      setShowPassword(false);
    }
  }, [isOpen, clearError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (loginError) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    console.log('🔐 Tentando login com:', { email: formData.email, password: formData.password.substring(0, 3) + '***' });

    try {
      await login(formData.email, formData.password);
      console.log('✅ Login bem-sucedido');
      
      // Callback personalizado
      onSuccess?.();
      
      // Fechar modal
      onClose();
    } catch (error: any) {
      console.error('❌ Falha no login:', error.message);
      // O erro já está sendo tratado pelo AuthContext
    }
  };

  const fillTestUser = (email: string, password: string = 'Demo!12345') => {
    setFormData({ email, password });
    clearError();
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-brand rounded-lg flex items-center justify-center mr-2">
                <span className="text-white text-xs font-semibold">99</span>
              </div>
              <DialogTitle>{title}</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Usuários de Teste */}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTestUsers(!showTestUsers)}
              className="text-xs w-full"
              disabled={isLoading}
            >
              {showTestUsers ? 'Ocultar' : 'Ver'} usuários de teste
            </Button>
            
            {showTestUsers && (
              <div className="mt-3 p-3 bg-muted rounded-lg text-xs space-y-2">
                <div className="font-medium text-muted-foreground mb-2">Clique para preencher:</div>
                <button
                  onClick={() => fillTestUser('ana@demo.fit', 'Demo!12345')}
                  className="block w-full text-left p-2 hover:bg-background rounded text-green-600"
                  disabled={isLoading}
                >
                  <strong>Ana (Trainer)</strong> — Usuário Principal ✅
                </button>
                <button
                  onClick={() => fillTestUser('ana@demo.fit', 'Demo!12345')}
                  className="block w-full text-left p-2 hover:bg-background rounded text-brand"
                  disabled={isLoading}
                >
                  <strong>Ana Souza</strong> — Treinadora
                </button>
                <button
                  onClick={() => fillTestUser('carlos@demo.fit', 'Demo!12345')}
                  className="block w-full text-left p-2 hover:bg-background rounded text-blue-600"
                  disabled={isLoading}
                >
                  <strong>Carlos Oliveira</strong> — Cliente
                </button>
                <button
                  onClick={() => fillTestUser('admin@demo.fit', 'Demo!12345')}
                  className="block w-full text-left p-2 hover:bg-background rounded text-green-600"
                  disabled={isLoading}
                >
                  <strong>Admin Demo</strong> — Admin
                </button>
                <div className="text-muted-foreground mt-2">
                  <div>Todos os usuários: <strong>Demo!12345</strong></div>
                </div>
                <div className="mt-2 pt-2 border-t space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        console.log('🔗 Iniciando teste direto de login...');
                        
                        const { supabase } = await import('../../lib/supabase/client');
                        
                        console.log('🔗 Cliente Supabase carregado:', !!supabase);
                        
                        // Teste direto de login com usuário de teste válido
                        const testPromise = supabase.auth.signInWithPassword({
                          email: 'ana@demo.fit',
                          password: 'Demo!12345'
                        });
                        
                        const timeoutPromise = new Promise((_, reject) => {
                          setTimeout(() => reject(new Error('TIMEOUT - 5 segundos')), 5000);
                        });
                        
                        console.log('🔗 Fazendo teste de login com timeout...');
                        const result = await Promise.race([testPromise, timeoutPromise]);
                        
                        console.log('🔗 Resultado do teste:', result);
                        alert('✅ Teste concluído - veja o console');
                        
                      } catch (error: any) {
                        console.error('🔗 Erro no teste direto:', error);
                        alert(`❌ Erro: ${error.message}`);
                      }
                    }}
                    className="w-full text-xs"
                    disabled={isLoading}
                  >
                    🔗 Teste Direto de Login
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
                        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e547215c/create-test-users`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${publicAnonKey}`,
                            'Content-Type': 'application/json',
                          },
                        });
                        
                        const result = await response.json();
                        console.log('🔧 Resultado da criação de usuários de teste:', result);
                        
                        if (result.success) {
                          alert(`✅ Usuários de teste verificados: ${result.statistics.successful} prontos para uso`);
                        } else {
                          alert(`❌ Erro ao criar usuários: ${result.error}`);
                        }
                      } catch (error) {
                        console.error('Erro ao criar usuários de teste:', error);
                        alert('❌ Erro ao conectar com o servidor');
                      }
                    }}
                    className="w-full text-xs"
                    disabled={isLoading}
                  >
                    🔧 Criar Usuários de Teste
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email-modal">Email</Label>
              <Input
                id="email-modal"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  if (loginError) clearError();
                }}
                placeholder="Digite seu email"
                className="mt-1"
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <Label htmlFor="password-modal">Senha</Label>
              <div className="relative mt-1">
                <Input
                  id="password-modal"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password || ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, password: e.target.value }));
                    if (loginError) clearError();
                  }}
                  placeholder="Digite sua senha"
                  className="pr-10"
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Erro */}
            {loginError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{loginError}</p>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-brand hover:bg-brand-hover"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
          </form>

          {/* Link para Cadastro */}
          <div className="text-center pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Novo no 99coach?{' '}
              <button
                onClick={() => {
                  onClose();
                  // Navegar para cadastro (implementar depois)
                }}
                className="text-brand hover:underline"
                disabled={isLoading}
              >
                Comece agora
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}