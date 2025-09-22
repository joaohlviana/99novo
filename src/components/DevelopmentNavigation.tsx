import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Settings, 
  User, 
  Users, 
  Shield, 
  ChevronRight,
  Laptop,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function DevelopmentNavigation() {
  const dashboards = [
    {
      title: 'Dashboard do Treinador',
      description: 'Interface para gestão de programas, clientes e perfil do treinador',
      path: '/dashboard/dev/trainer',
      icon: User,
      color: 'bg-blue-50 text-blue-600',
      features: [
        'Gestão de programas',
        'Análise financeira',
        'Chat com clientes',
        'Configurações de perfil'
      ]
    },
    {
      title: 'Dashboard do Cliente',
      description: 'Interface para acompanhar programas, mensagens e progresso',
      path: '/dashboard/dev/client',
      icon: Users,
      color: 'bg-green-50 text-green-600',
      features: [
        'Meus programas',
        'Treinos e exercícios',
        'Mensagens com treinador',
        'Acompanhamento de progresso'
      ]
    },
    {
      title: 'Dashboard do Admin',
      description: 'Painel administrativo para gestão da plataforma',
      path: '/dashboard/dev/admin',
      icon: Shield,
      color: 'bg-purple-50 text-purple-600',
      features: [
        'Gestão de usuários',
        'Analytics da plataforma',
        'Configurações gerais',
        'Moderação de conteúdo'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Laptop className="h-8 w-8 text-brand" />
              <h1>Navegação de Desenvolvimento</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Acesse diretamente os dashboards para verificar suas estruturas e funcionalidades 
              durante o desenvolvimento. Estas rotas não requerem autenticação.
            </p>
          </div>

          {/* Warning Alert */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Modo de Desenvolvimento:</strong> Estas rotas são apenas para desenvolvimento 
              e não estarão disponíveis na versão de produção.
            </AlertDescription>
          </Alert>

          {/* Dashboard Cards */}
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            {dashboards.map((dashboard) => {
              const Icon = dashboard.icon;
              return (
                <Card key={dashboard.path} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${dashboard.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {dashboard.title}
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {dashboard.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Features List */}
                    <div className="grid grid-cols-2 gap-2">
                      {dashboard.features.map((feature, index) => (
                        <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    {/* Access Button */}
                    <Link to={dashboard.path}>
                      <Button className="w-full group-hover:bg-brand-hover transition-colors">
                        Acessar Dashboard
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Links Rápidos de Desenvolvimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link to="/">
                  <Button variant="outline" size="sm" className="w-full">
                    Homepage
                  </Button>
                </Link>
                <Link to="/catalog">
                  <Button variant="outline" size="sm" className="w-full">
                    Catálogo
                  </Button>
                </Link>
                <Link to="/become-trainer">
                  <Button variant="outline" size="sm" className="w-full">
                    Ser Treinador
                  </Button>
                </Link>
                <Link to="/become-client">
                  <Button variant="outline" size="sm" className="w-full">
                    Ser Cliente
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center">
            <Link to="/">
              <Button variant="ghost">
                ← Voltar para Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DevelopmentNavigation;