import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  User, 
  Users, 
  Shield, 
  Laptop,
  ChevronRight,
  Home,
  AlertTriangle,
  Code2,
  Palette,
  Database,
  TestTube
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

function DevAccessPage() {
  const dashboardRoutes = [
    {
      title: 'Dashboard do Treinador',
      description: 'Interface completa do treinador com gestão de programas, clientes e finanças',
      path: '/dashboard/dev/trainer',
      icon: User,
      status: 'Funcional',
      features: [
        'Visão geral e estatísticas',
        'Gestão de programas',
        'Chat com clientes', 
        'Gestão financeira',
        'Configurações de perfil'
      ]
    },
    {
      title: 'Dashboard do Cliente',
      description: 'Interface do cliente para acompanhar programas e comunicar com treinadores',
      path: '/dashboard/dev/client',
      icon: Users,
      status: 'Funcional',
      features: [
        'Meus programas',
        'Briefings',
        'Treinadores favoritos',
        'Mensagens',
        'Notícias e atualizações'
      ]
    },
    {
      title: 'Dashboard do Admin',
      description: 'Painel administrativo para gestão da plataforma',
      path: '/dashboard/dev/admin',
      icon: Shield,
      status: 'Funcional',
      features: [
        'Gestão de usuários',
        'Analytics da plataforma',
        'Moderação de conteúdo',
        'Configurações gerais',
        'Relatórios financeiros'
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
              <Laptop className="h-8 w-8 text-brand" />
              <h1>Acesso aos Dashboards - Desenvolvimento</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Acesse diretamente os dashboards para verificar suas estruturas e funcionalidades. 
              Essas rotas não requerem autenticação e são apenas para desenvolvimento.
            </p>
          </div>

          {/* Warning */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Ambiente de Desenvolvimento:</strong> Essas rotas são temporárias e serão removidas na produção. 
              O sistema de autenticação completo ainda está em desenvolvimento.
            </AlertDescription>
          </Alert>

          {/* Dashboard Cards */}
          <div className="grid gap-6">
            {dashboardRoutes.map((dashboard) => {
              const Icon = dashboard.icon;
              return (
                <Card key={dashboard.path} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-brand/10 text-brand">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-3">
                            {dashboard.title}
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              {dashboard.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {dashboard.description}
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Principais funcionalidades:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {dashboard.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                            {feature}
                          </div>
                        ))}
                      </div>
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

          {/* Supabase Connection Test - NOVO */}
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Database className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-green-900">🗄️ Supabase Connection Test</CardTitle>
                  <CardDescription className="text-green-700">
                    Teste a conexão com o banco Supabase e validação completa da integração
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to="/dev/supabase-test">
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                  <Database className="h-4 w-4 mr-2" />
                  Testar Conexão Supabase
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Database Schema Debug - NOVO */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-blue-900">🔍 Database Schema Debug</CardTitle>
                  <CardDescription className="text-blue-700">
                    Inspecione o schema do banco usando views e functions meta.*
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to="/dev/database-schema">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                  <Database className="h-4 w-4 mr-2" />
                  Visualizar Schema do Banco
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Database Tables Test - NOVO */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Database className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-purple-900">🧪 Database Tables Test</CardTitle>
                  <CardDescription className="text-purple-700">
                    Teste de acesso às tabelas necessárias para o sistema
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to="/dev/database-tables-test">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <Database className="h-4 w-4 mr-2" />
                  Testar Tabelas do Banco
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Database Diagnostic - NOVO */}
          <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Database className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-emerald-900">🏥 Database Diagnostic</CardTitle>
                  <CardDescription className="text-emerald-700">
                    Diagnóstico completo das funcionalidades do sistema baseado nas tabelas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to="/dev/database-diagnostic">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                  <Database className="h-4 w-4 mr-2" />
                  Executar Diagnóstico Completo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Server Diagnostic - NOVO */}
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-red-900">🚨 Server Connectivity Diagnostic</CardTitle>
                  <CardDescription className="text-red-700">
                    Diagnóstico de problemas "Failed to fetch" - Teste completo de conectividade
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to="/dev/server-diagnostic">
                <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Diagnosticar Problemas de Fetch
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Trainer Profile Hybrid Test - NOVO */}
          <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <TestTube className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-indigo-900">🧪 Trainer Profile Híbrido</CardTitle>
                  <CardDescription className="text-indigo-700">
                    Teste da nova estrutura híbrida 99_trainer_profile (Migração executada!)
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  ✅ Migração OK
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/dev/trainer-profile-hybrid-test-simple">
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  <TestTube className="h-4 w-4 mr-2" />
                  Teste Simples (Sem Auth)
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/dev/trainer-profile-hybrid-test">
                <Button variant="outline" className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                  <User className="h-4 w-4 mr-2" />
                  Teste Completo (Com Auth)
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Login Test - NOVO */}
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-orange-900">🔐 Login Test Pós-Correções</CardTitle>
                  <CardDescription className="text-orange-700">
                    Teste completo do sistema de login após correções de timeout
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <a href="/dev/login-test" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                  <User className="h-4 w-4 mr-2" />
                  Testar Sistema de Login
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Storage Fix - NOVO E ATUALIZADO */}
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-red-900">🔧 Storage System Fix & RLS Setup</CardTitle>
                  <CardDescription className="text-red-700">
                    Correção automática de buckets públicos + diagnóstico de políticas RLS
                  </CardDescription>
                </div>
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  🚨 URGENTE
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Problema detectado: Buckets públicos + RLS bloqueando uploads
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Use a correção automática abaixo para resolver rapidamente.
                </p>
              </div>
              
              <Link to="/dev/storage-fix">
                <Button className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  🔧 CORREÇÃO AUTOMÁTICA (Recomendado)
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              
              <Link to="/dev/storage-rls-test">
                <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                  <TestTube className="h-4 w-4 mr-2" />
                  Teste de Políticas RLS (Manual)
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Programs Debug - NOVO E CRÍTICO */}
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-red-900">🚨 Diagnóstico de Programas</CardTitle>
                  <CardDescription className="text-red-700">
                    Diagnóstico CRÍTICO - Programas não aparecem para usuários não logados
                  </CardDescription>
                </div>
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  🔥 URGENTE
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Problema: Programas só aparecem como mock data
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Teste para descobrir se é RLS, conectividade ou outro problema.
                </p>
              </div>
              
              <Link to="/dev/programs-debug">
                <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  🔍 DIAGNOSTICAR PROGRAMAS (Crítico)
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* NOVO: Sistema Unificado Validation */}
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <TestTube className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-green-900">🎯 Sistema Unificado - Validação</CardTitle>
                  <CardDescription className="text-green-700">
                    Teste a nova estrutura SQL otimizada após execução dos scripts
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  ✅ NOVO
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  🚀 Scripts SQL executados com sucesso!
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Estrutura unificada: user_profiles + training_programs + 15+ índices otimizados
                </p>
              </div>
              
              <Link to="/dev/system-validation">
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                  <TestTube className="h-4 w-4 mr-2" />
                  🔍 VALIDAR ESTRUTURA SQL
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              
              <Link to="/dev/unified-services-test">
                <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
                  <Code2 className="h-4 w-4 mr-2" />
                  🧪 Testar Hooks e Serviços
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Services Test - NOVO */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <TestTube className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-blue-900">🧪 Services Test Dashboard</CardTitle>
                  <CardDescription className="text-blue-700">
                    Diagnóstico completo dos services implementados - ETAPA 3
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to="/dev/services-test">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                  <Database className="h-4 w-4 mr-2" />
                  Testar Services (Migração Zustand)
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Components Library */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Code2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-purple-900">Components Library</CardTitle>
                  <CardDescription className="text-purple-700">
                    Explore todos os componentes de demonstração da plataforma
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to="/dev/components">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <Palette className="h-4 w-4 mr-2" />
                  Ver Biblioteca de Componentes
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Outras páginas da plataforma</CardTitle>
              <CardDescription>
                Links rápidos para outras seções da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link to="/">
                  <Button variant="outline" size="sm" className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Homepage
                  </Button>
                </Link>
                <Link to="/catalog">
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Catálogo
                  </Button>
                </Link>
                <Link to="/become-trainer">
                  <Button variant="outline" size="sm" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Ser Treinador
                  </Button>
                </Link>
                <Link to="/become-client">
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Ser Cliente
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center pt-4">
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

export default DevAccessPage;