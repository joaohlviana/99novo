/**
 * 🔐 LOGIN PAGE
 * 
 * Página de login em duas colunas: formulário à esquerda, imagem à direita.
 * Visual limpo e minimalista seguindo o design do 99coach.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  
  const { login, isLoading, error, clearError, user } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showTestUsers, setShowTestUsers] = useState(false);

  // Limpar erro quando componente monta
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirecionar automaticamente se já está autenticado
  useEffect(() => {
    if (user && user.roles.length > 0) {
      if (redirectTo !== '/') {
        navigate(redirectTo, { replace: true });
      } else {
        // Determinar dashboard baseado nos roles do usuário
        const hasTrainerRole = user.roles.includes('trainer');
        const hasClientRole = user.roles.includes('client');
        
        if (hasTrainerRole) {
          navigate('/app/trainer', { replace: true });
        } else if (hasClientRole) {
          navigate('/app/client', { replace: true });
        } else {
          // Fallback para client se não tiver roles definidos
          navigate('/app/client', { replace: true });
        }
      }
    }
  }, [user, redirectTo, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      await login(formData.email, formData.password);
      
      // Se chegou aqui, o login foi bem-sucedido
      toast.success('Login realizado com sucesso!');
      
      // O redirecionamento será feito pelo useEffect acima
      // que monitora mudanças no user
    } catch (error) {
      // O erro já está sendo tratado no contexto
      console.error('Login error:', error);
    }
  };

  const fillTestUser = (email: string, password: string = 'Demo!12345') => {
    setFormData({ email, password });
    clearError();
  };

  return (
    <div className="min-h-screen flex">
      {/* Coluna da Esquerda - Formulário */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24">
        <div className="max-w-md mx-auto w-full">
          {/* Botão Voltar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-8 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-semibold">99</span>
              </div>
              <span className="text-xl font-semibold">coach</span>
            </div>
            
            <h1 className="text-2xl mb-2">Entre na sua conta</h1>
            <p className="text-muted-foreground">
              Acesse sua conta para continuar sua jornada fitness
            </p>
          </div>

          {/* Usuários de Teste */}
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTestUsers(!showTestUsers)}
              className="text-xs"
            >
              {showTestUsers ? 'Ocultar' : 'Ver'} usuários de teste
            </Button>
            
            {showTestUsers && (
              <div className="mt-3 p-3 bg-muted rounded-lg text-xs space-y-2">
                <div className="font-medium text-muted-foreground mb-2">Clique para preencher:</div>
                <button
                  onClick={() => fillTestUser('ana@demo.fit')}
                  className="block w-full text-left p-2 hover:bg-background rounded text-brand"
                >
                  <strong>Ana Souza</strong> — Treinadora
                  <br />ana@demo.fit
                </button>
                <button
                  onClick={() => fillTestUser('carlos@demo.fit')}
                  className="block w-full text-left p-2 hover:bg-background rounded text-blue-600"
                >
                  <strong>Carlos Oliveira</strong> — Cliente
                  <br />carlos@demo.fit
                </button>
                <button
                  onClick={() => fillTestUser('admin@demo.fit')}
                  className="block w-full text-left p-2 hover:bg-background rounded text-green-600"
                >
                  <strong>Admin Demo</strong> — Admin
                  <br />admin@demo.fit
                </button>
                <div className="text-muted-foreground mt-2">Senha para todos: <strong>Demo!12345</strong></div>
              </div>
            )}
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Digite seu email"
                className="mt-1"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Digite sua senha"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Botão Submit */}
            <Button
              type="submit"
              className="w-full bg-brand hover:bg-brand-hover"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Novo no 99coach?{' '}
              <button
                onClick={() => navigate('/become-client')}
                className="text-brand hover:underline"
              >
                Comece agora
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Coluna da Direita - Imagem */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand/5 to-brand/10 items-center justify-center p-8">
        <div className="max-w-lg w-full">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1734668484998-c943d1fcb48a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHw5OWNvYWNoJTIwZml0bmVzcyUyMG1vdGl2YXRpb258ZW58MXx8fHwxNzU3MTY4MTkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="99coach - Transforme sua paixão em profissão"
            className="w-full h-auto rounded-2xl shadow-2xl"
          />
          
          <div className="mt-8 text-center">
            <h2 className="text-xl mb-2">Transforme sua paixão em profissão</h2>
            <p className="text-muted-foreground">
              Conecte-se com os melhores treinadores e alcance seus objetivos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}