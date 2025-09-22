/**
 * 🏥 SYSTEM HEALTH PAGE
 * 
 * Página centralizada para monitoramento da saúde do sistema.
 * Verifica se todos os componentes essenciais estão funcionando.
 */

import React from 'react';
import { HealthCheck } from '../components/HealthCheck';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Database, 
  Search, 
  Settings, 
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

export default function SystemHealthPage() {
  const quickLinks = [
    {
      title: 'Teste Básico de Especialidades',
      path: '/test/specialties-gin-basic',
      description: 'Teste simples da busca por especialidades',
      icon: <Search className="h-4 w-4" />,
      priority: 'high'
    },
    {
      title: 'Teste de Filtros JSONB',
      path: '/test/jsonb-filters',
      description: 'Validação dos filtros JSONB corrigidos',
      icon: <Database className="h-4 w-4" />,
      priority: 'high'
    },
    {
      title: 'Diagnóstico do Sistema',
      path: '/dev/system-validation-safe',
      description: 'Validação completa do sistema',
      icon: <Activity className="h-4 w-4" />,
      priority: 'medium'
    },
    {
      title: 'Central de Desenvolvimento',
      path: '/dev',
      description: 'Acesso a todas as ferramentas de desenvolvimento',
      icon: <Settings className="h-4 w-4" />,
      priority: 'medium'
    }
  ];

  const systemInfo = {
    version: '1.0.0',
    environment: 'Development',
    database: 'Supabase PostgreSQL',
    framework: 'React + TypeScript',
    styling: 'Tailwind CSS v4',
    lastUpdate: new Date().toLocaleDateString('pt-BR')
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/dev"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Dev
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Activity className="h-8 w-8 text-green-500" />
              System Health Monitor
            </h1>
            <p className="text-lg text-gray-600">
              Monitoramento em tempo real da saúde do sistema
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Health Check */}
          <HealthCheck />

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Links Rápidos para Testes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.path}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                        {link.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{link.title}</h3>
                          <Badge 
                            variant={link.priority === 'high' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {link.priority === 'high' ? 'Alta' : 'Média'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{link.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(systemInfo).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Componentes Principais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Busca por Especialidades</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Otimizada</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Filtros JSONB</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Corrigidos</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Sistema de Fallback</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Materialized View</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">Opcional</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}