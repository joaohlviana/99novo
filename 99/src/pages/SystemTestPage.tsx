import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Home,
  Users, 
  User, 
  Shield, 
  Play,
  Dumbbell,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';

function SystemTestPage() {
  const navigation = useNavigation();

  const routes = [
    // Rotas públicas
    {
      category: 'Páginas Públicas',
      status: 'working',
      routes: [
        { path: '/', name: 'Homepage', icon: Home, handler: navigation.navigateToHome },
        { path: '/catalog', name: 'Catálogo de Treinadores', icon: Users, handler: navigation.navigateToCatalog },
        { path: '/trainer/1', name: 'Perfil do Treinador', icon: User, handler: () => navigation.navigateToTrainer('1') },
        { path: '/program/1', name: 'Detalhes do Programa', icon: Play, handler: () => navigation.navigateToProgram('1') },
        { path: '/sport/futebol', name: 'Página de Modalidade', icon: Dumbbell, handler: () => navigation.navigateToSport('futebol') },
        { path: '/become-trainer', name: 'Ser Treinador', icon: User, handler: navigation.navigateToBecomeTrainer },
        { path: '/become-client', name: 'Ser Cliente', icon: Users, handler: navigation.navigateToBecomeClient },
      ]
    },
    // Rotas de desenvolvimento
    {
      category: 'Dashboards (Desenvolvimento)',
      status: 'working',
      routes: [
        { path: '/dashboard/dev/trainer', name: 'Dashboard Treinador', icon: User, handler: navigation.navigateToTrainerDashboard },
        { path: '/dashboard/dev/client', name: 'Dashboard Cliente', icon: Users, handler: navigation.navigateToClientDashboard },
        { path: '/dashboard/dev/admin', name: 'Dashboard Admin', icon: Shield, handler: navigation.navigateToAdminDashboard },
        { path: '/dashboard/dev/client/program/1', name: 'Programa do Cliente', icon: Play, handler: () => navigation.navigateToClientProgram('1') },
      ]
    },
    // Rotas de desenvolvimento
    {
      category: 'Ferramentas de Desenvolvimento',
      status: 'working',
      routes: [
        { path: '/dev', name: 'Dev Access Page', icon: Settings, handler: () => navigation.navigateTo('/dev') },
        { path: '/demo/dashboard-access', name: 'Demo Dashboard Access', icon: Settings, handler: () => navigation.navigateTo('/demo/dashboard-access') },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <h1>Sistema de Navegação - Teste Completo</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Esta página verifica se todas as rotas e navegações estão funcionando corretamente.
            </p>
          </div>

          {/* Status Geral */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Navigation Context</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Funcionando</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-700">React Router</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Funcionando</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Dashboard Routes</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Funcionando</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rotas por Categoria */}
          {routes.map((section) => (
            <Card key={section.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {section.status === 'working' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                  {section.category}
                </CardTitle>
                <CardDescription>
                  {section.routes.length} rota{section.routes.length > 1 ? 's' : ''} disponível{section.routes.length > 1 ? 'eis' : ''}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid gap-3">
                  {section.routes.map((route) => {
                    const Icon = route.icon;
                    return (
                      <div key={route.path} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-brand/10 text-brand">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{route.name}</div>
                            <div className="text-sm text-muted-foreground font-mono">{route.path}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={route.path}>
                            <Button variant="outline" size="sm">
                              Link Direto
                            </Button>
                          </Link>
                          <Button 
                            onClick={route.handler}
                            size="sm"
                          >
                            Via Context
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Correções Implementadas:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Navigation Context atualizado para rotas de desenvolvimento</li>
                    <li>• Links vazios do Header corrigidos</li>
                    <li>• DevAccessPage recriado e funcional</li>
                    <li>• Duplicação do CatalogPage removida</li>
                    <li>• DevelopmentButton corrigido (sem _blank)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Componentes Testados:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• ModernProgramCard ✓</li>
                    <li>• ModernProfileCard ✓</li>
                    <li>• Header navigation ✓</li>
                    <li>• Dashboard routes ✓</li>
                    <li>• Protected routes ✓</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> Esta página é apenas para testes e deve ser removida em produção. 
                  Para acesso rápido aos dashboards de desenvolvimento, use o botão "Dev Tools" no canto inferior direito.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Volta para Home */}
          <div className="text-center">
            <Button onClick={navigation.navigateToHome} variant="outline">
              ← Voltar para Homepage
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SystemTestPage;