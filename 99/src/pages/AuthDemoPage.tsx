/**
 * 🚀 DEMO DE AUTENTICAÇÃO
 * 
 * Página para demonstrar todas as funcionalidades do sistema de autenticação.
 */

import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Heart, MessageCircle, User, LogOut, Star, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProtectedAction } from '../hooks/useProtectedAction';
import { useNavigation } from '../hooks/useNavigation';
import { LoginModal } from '../components/auth/LoginModal';

export default function AuthDemoPage() {
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;
  const { executeProtectedAction, showLoginModal, handleLoginSuccess, handleLoginCancel } = useProtectedAction();
  const { navigateToHome, navigateToLogin } = useNavigation();

  // Ações de demonstração
  const handleFollowTrainer = () => {
    executeProtectedAction(() => {
      alert('🎉 Agora você está seguindo este treinador!');
    });
  };

  const handleContactTrainer = () => {
    executeProtectedAction(() => {
      alert('💬 Abrindo chat com o treinador...');
    });
  };

  const handleJoinProgram = () => {
    executeProtectedAction(() => {
      alert('📚 Inscrição no programa realizada com sucesso!');
    });
  };

  const handleBookSession = () => {
    executeProtectedAction(() => {
      alert('📅 Sessão de treino agendada!');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      <div className="container py-8">
        {/* Header da Demo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-4">🔐 Sistema de Autenticação 99coach</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Demonstração do sistema de login com interações protegidas. Todas as ações que exigem autenticação 
            abrirão o modal de login automaticamente se você não estiver logado.
          </p>
        </div>

        {/* Status de Autenticação */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">
                  Status: {isAuthenticated ? 'Logado' : 'Não logado'}
                </span>
              </div>
              
              {isAuthenticated && user && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <div className="flex gap-1">
                      {user.userTypes.map(type => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type === 'trainer' ? 'Treinador' : 'Cliente'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {isAuthenticated ? (
                <Button onClick={logout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              ) : (
                <Button onClick={() => navigateToLogin()} size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Fazer Login
                </Button>
              )}
              
              <Button onClick={() => navigateToHome()} variant="outline" size="sm">
                Voltar ao Home
              </Button>
            </div>
          </div>
        </Card>

        {/* Usuários de Teste */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl mb-4">👥 Usuários de Teste</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">João Silva</p>
                  <p className="text-sm text-muted-foreground">joao@99coach.com.br</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                <Badge variant="secondary" className="text-xs bg-brand/10 text-brand">Treinador</Badge>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Cliente</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Senha: 123456</p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&q=80" />
                  <AvatarFallback>MS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Maria Santos</p>
                  <p className="text-sm text-muted-foreground">maria@email.com</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Cliente</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Senha: 123456</p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80" />
                  <AvatarFallback>CO</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Carlos Oliveira</p>
                  <p className="text-sm text-muted-foreground">carlos@email.com</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                <Badge variant="secondary" className="text-xs bg-brand/10 text-brand">Treinador</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Senha: 123456</p>
            </div>
          </div>
        </Card>

        {/* Interações Protegidas */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl mb-4">🔒 Demonstração de Ações Protegidas</h2>
          <p className="text-muted-foreground mb-6">
            Clique nos botões abaixo para testar as interações. Se você não estiver logado, 
            um modal de login será aberto automaticamente.
          </p>

          {/* Exemplo de Card de Treinador */}
          <div className="border rounded-lg p-6 mb-6 bg-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">João Silva</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    São Paulo, SP
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">4.9 (127 avaliações)</span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFollowTrainer}
                className="p-2"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-muted-foreground mb-4">
              Especialista em treinamento personalizado com foco em resultados sustentáveis.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={handleContactTrainer}
                variant="outline"
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contatar
              </Button>
              <Button
                onClick={handleBookSession}
                size="sm"
                className="bg-brand hover:bg-brand-hover"
              >
                Agendar Sessão
              </Button>
            </div>
          </div>

          {/* Exemplo de Card de Programa */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600" />
            <div className="p-4">
              <h3 className="font-semibold mb-2">Programa Completo de Musculação</h3>
              <p className="text-sm text-muted-foreground mb-4">
                12 semanas de treino estruturado para hipertrofia
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-brand">R$ 197</span>
                  <span className="text-sm text-muted-foreground ml-1">/programa</span>
                </div>
                <Button
                  onClick={handleJoinProgram}
                  size="sm"
                  className="bg-brand hover:bg-brand-hover"
                >
                  Participar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Observações Técnicas */}
        <Card className="p-6">
          <h2 className="text-xl mb-4">🛠️ Características Técnicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">✅ Implementado</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Zustand store para auth (`auth-store.ts`)</li>
                <li>• Persistência local com localStorage</li>
                <li>• Modal de login para ações protegidas</li>
                <li>• Header com estado logado/deslogado</li>
                <li>• Hook `useProtectedAction` reutilizável</li>
                <li>• Suporte a múltiplos tipos de usuário</li>
                <li>• Navegação fluida sem quebrar layout</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🔮 Próximos Passos</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Integração com Supabase Auth</li>
                <li>• JWT tokens para segurança</li>
                <li>• Refresh token automático</li>
                <li>• Verificação de email</li>
                <li>• Login social (Google, Facebook)</li>
                <li>• Recuperação de senha</li>
                <li>• Rate limiting para tentativas</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Modal de Login para Interações Protegidas */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={handleLoginCancel}
          onSuccess={handleLoginSuccess}
          title="Entre para continuar"
          description="Você precisa estar logado para realizar esta ação."
        />
      </div>
    </div>
  );
}