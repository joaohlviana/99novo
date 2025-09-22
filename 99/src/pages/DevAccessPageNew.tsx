/**
 * 🛠️ PÁGINA DE ACESSO PARA DESENVOLVEDORES - ATUALIZADA
 * 
 * Página centralizada com links para todas as ferramentas de desenvolvimento,
 * teste e validação do sistema unificado.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  TestTube, 
  Database, 
  Settings, 
  Search, 
  Users, 
  BookOpen,
  CheckCircle,
  Code,
  Cpu,
  Eye,
  FileText,
  Activity,
  Wrench
} from 'lucide-react';

interface DevLink {
  path: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'validation' | 'database' | 'services' | 'components' | 'profiles' | 'storage';
  priority: 'high' | 'medium' | 'low';
  status?: 'new' | 'updated' | 'fixed';
}

const devLinks: DevLink[] = [
  // VALIDAÇÃO DO SISTEMA (ALTA PRIORIDADE)
  {
    path: '/dev/system-validation-safe',
    title: '🔒 Validação Segura do Sistema',
    description: 'Testa APENAS nossas tabelas - SEM acesso a auth.users',
    icon: <CheckCircle className="w-5 h-5" />,
    category: 'validation',
    priority: 'high',
    status: 'new'
  },
  {
    path: '/dev/system-validation',
    title: '🧪 Validação Completa do Sistema',
    description: 'Testa estrutura SQL, views, funções (pode dar erro auth.users)',
    icon: <CheckCircle className="w-5 h-5" />,
    category: 'validation',
    priority: 'medium',
    status: 'new'
  },
  {
    path: '/dev/simple-services-test',
    title: '🧪 Teste Simples dos Serviços',
    description: 'Versão básica - testa serviços sem views complexas',
    icon: <TestTube className="w-5 h-5" />,
    category: 'validation',
    priority: 'high',
    status: 'new'
  },
  {
    path: '/dev/unified-services-test',
    title: '🚀 Teste Completo dos Serviços',
    description: 'Testa hooks React e serviços TypeScript (pode dar erro)',
    icon: <TestTube className="w-5 h-5" />,
    category: 'validation',
    priority: 'medium',
    status: 'new'
  },

  // TESTES DE SERVIÇOS
  {
    path: '/dev/services-test',
    title: 'Teste de Serviços v1',
    description: 'Testa serviços básicos da plataforma',
    icon: <Activity className="w-5 h-5" />,
    category: 'services',
    priority: 'medium'
  },
  {
    path: '/dev/services-test-v2',
    title: 'Teste de Serviços v2',
    description: 'Versão avançada dos testes de serviços',
    icon: <Activity className="w-5 h-5" />,
    category: 'services',
    priority: 'medium'
  },

  // TESTES DE BANCO DE DADOS
  {
    path: '/dev/database-diagnostic',
    title: 'Diagnóstico do Banco',
    description: 'Analisa estrutura e integridade do banco de dados',
    icon: <Database className="w-5 h-5" />,
    category: 'database',
    priority: 'medium'
  },
  {
    path: '/dev/database-tables-test',
    title: 'Teste de Tabelas',
    description: 'Valida estrutura e dados das tabelas principais',
    icon: <Database className="w-5 h-5" />,
    category: 'database',
    priority: 'medium'
  },
  {
    path: '/test/jsonb-filters',
    title: '🎯 Teste de Filtros JSONB',
    description: 'Valida correção do erro "invalid input syntax for type json"',
    icon: <Search className="w-5 h-5" />,
    category: 'database',
    priority: 'high',
    status: 'fixed'
  },
  {
    path: '/system/health',
    title: '🏥 System Health Monitor',
    description: 'Monitoramento completo da saúde do sistema em tempo real',
    icon: <Activity className="w-5 h-5" />,
    category: 'validation',
    priority: 'high',
    status: 'new'
  },
  {
    path: '/test/specialties-gin-basic',
    title: '🧪 Busca por Especialidades (Básico)',
    description: 'Teste básico mais simples - garante funcionamento mínimo',
    icon: <TestTube className="w-5 h-5" />,
    category: 'database',
    priority: 'high',
    status: 'new'
  },
  {
    path: '/test/specialties-gin-simple',
    title: '🚀 Busca Otimizada - ARRAY + GIN (Simples)',
    description: 'Teste simplificado da Materialized View com fallback automático',
    icon: <Activity className="w-5 h-5" />,
    category: 'database',
    priority: 'high',
    status: 'new'
  },
  {
    path: '/test/specialties-gin',
    title: '🚀 Busca Otimizada - ARRAY + GIN (Completa)',
    description: 'Teste completo da Materialized View com índice GIN para especialidades',
    icon: <Activity className="w-5 h-5" />,
    category: 'database',
    priority: 'medium',
    status: 'new'
  },

  // TESTES DE PERFIS
  {
    path: '/dev/trainer-profile-hybrid-test-simple',
    title: 'Teste de Perfil de Treinador',
    description: 'Versão simplificada do teste de perfil híbrido',
    icon: <Users className="w-5 h-5" />,
    category: 'profiles',
    priority: 'medium',
    status: 'fixed'
  },
  {
    path: '/dev/training-programs-hybrid-test',
    title: 'Teste de Programas Híbridos',
    description: 'Testa estrutura híbrida dos programas de treinamento',
    icon: <BookOpen className="w-5 h-5" />,
    category: 'profiles',
    priority: 'medium'
  },
  {
    path: '/dev/client-profile-system-diagnostic',
    title: 'Diagnóstico de Perfil de Cliente',
    description: 'Valida sistema de perfis de clientes',
    icon: <Users className="w-5 h-5" />,
    category: 'profiles',
    priority: 'medium'
  },

  // TESTES DE STORAGE
  {
    path: '/dev/storage-setup',
    title: 'Setup de Storage',
    description: 'Configura buckets e políticas de storage',
    icon: <Settings className="w-5 h-5" />,
    category: 'storage',
    priority: 'medium'
  },
  {
    path: '/dev/storage-rls-test',
    title: 'Teste RLS Storage',
    description: 'Testa políticas de segurança do Supabase Storage',
    icon: <Settings className="w-5 h-5" />,
    category: 'storage',
    priority: 'low'
  },

  // COMPONENTES DE DEMONSTRAÇÃO
  {
    path: '/dev/components',
    title: 'Índice de Componentes',
    description: 'Galeria de todos os componentes disponíveis',
    icon: <Code className="w-5 h-5" />,
    category: 'components',
    priority: 'low'
  }
];

const categoryConfig = {
  validation: {
    title: '✅ Validação do Sistema',
    color: 'bg-green-50 border-green-200',
    headerColor: 'text-green-700'
  },
  database: {
    title: '🗄️ Banco de Dados',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'text-blue-700'
  },
  services: {
    title: '⚙️ Serviços e APIs',
    color: 'bg-purple-50 border-purple-200',
    headerColor: 'text-purple-700'
  },
  profiles: {
    title: '👥 Perfis e Usuários',
    color: 'bg-orange-50 border-orange-200',
    headerColor: 'text-orange-700'
  },
  storage: {
    title: '💾 Storage e Upload',
    color: 'bg-yellow-50 border-yellow-200',
    headerColor: 'text-yellow-700'
  },
  components: {
    title: '🎨 Componentes UI',
    color: 'bg-pink-50 border-pink-200',
    headerColor: 'text-pink-700'
  }
};

const priorityBadges = {
  high: <Badge className="bg-red-600 text-white">Alta</Badge>,
  medium: <Badge variant="secondary">Média</Badge>,
  low: <Badge variant="outline">Baixa</Badge>
};

const statusBadges = {
  new: <Badge className="bg-green-600 text-white">Novo</Badge>,
  updated: <Badge className="bg-blue-600 text-white">Atualizado</Badge>,
  fixed: <Badge className="bg-orange-600 text-white">Corrigido</Badge>
};

export default function DevAccessPageNew() {
  const groupedLinks = devLinks.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, DevLink[]>);

  // Ordenar categorias por prioridade (validation primeiro)
  const sortedCategories = Object.keys(groupedLinks).sort((a, b) => {
    const order = ['validation', 'services', 'database', 'profiles', 'storage', 'components'];
    return order.indexOf(a) - order.indexOf(b);
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          🛠️ Ferramentas de Desenvolvimento
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Central de acesso para validação, testes e diagnósticos do sistema unificado.
          <strong className="text-brand block mt-2">
            Comece pelos testes de Validação do Sistema!
          </strong>
        </p>
      </div>

      {/* CORREÇÃO JSONB DESTACADA */}
      <Card className="border-2 border-orange-300 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800 flex items-center gap-2">
            <Search className="w-6 h-6" />
            🎯 CORREÇÃO IMPLEMENTADA - Filtros JSONB
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <Search className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-orange-800">✅ Erro "invalid input syntax for type json" CORRIGIDO</h3>
                    <Badge className="bg-green-600 text-white">FIXED</Badge>
                  </div>
                  <p className="text-sm text-orange-700 mb-3">
                    Correção completa do erro que ocorria ao buscar treinadores por especialidades. 
                    Sistema agora usa filtros JSONB seguros com fallbacks robustos.
                  </p>
                  <Link
                    to="/test/jsonb-filters"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    Testar Correção Agora
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access - High Priority */}
      <Card className="border-2 border-green-300 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />
            🎯 Acesso Rápido - Prioridade Alta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devLinks
              .filter(link => link.priority === 'high')
              .map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block p-4 bg-white rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                      {link.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-green-800">{link.title}</h3>
                        {link.status && statusBadges[link.status]}
                      </div>
                      <p className="text-sm text-green-600">{link.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* All Categories */}
      <div className="space-y-6">
        {sortedCategories.map((category) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          const links = groupedLinks[category];

          return (
            <Card key={category} className={`${config.color} border-2`}>
              <CardHeader>
                <CardTitle className={`${config.headerColor} flex items-center gap-2`}>
                  <Wrench className="w-5 h-5" />
                  {config.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {links
                    .sort((a, b) => {
                      const priorityOrder = { high: 0, medium: 1, low: 2 };
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    })
                    .map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="block p-4 bg-white rounded-lg border hover:shadow-md transition-all hover:scale-105"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                              {link.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm">
                                {link.title}
                              </h3>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {link.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            {priorityBadges[link.priority]}
                            {link.status && statusBadges[link.status]}
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              📋 <strong>Total:</strong> {devLinks.length} ferramentas disponíveis
            </p>
            <p className="text-xs text-gray-500">
              💡 <strong>Dica:</strong> Execute primeiro os testes de <strong>Validação do Sistema</strong> 
              para verificar se todas as correções funcionaram corretamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}