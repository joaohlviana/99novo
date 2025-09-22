import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

export function AnalyticsPanel() {
  const [timeRange, setTimeRange] = useState('30d');

  const metrics = [
    {
      title: "Receita Total",
      value: "R$ 487.2k",
      change: "+23.1%",
      trend: "up",
      icon: DollarSign,
      description: "vs. período anterior"
    },
    {
      title: "Novos Usuários",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      description: "vs. período anterior"
    },
    {
      title: "Taxa de Conversão",
      value: "14.8%",
      change: "-2.1%",
      trend: "down",
      icon: TrendingUp,
      description: "vs. período anterior"
    },
    {
      title: "Visualizações de Página",
      value: "125.4k",
      change: "+8.7%",
      trend: "up",
      icon: Eye,
      description: "vs. período anterior"
    }
  ];

  const topPrograms = [
    { 
      name: "Transformação Corporal Completa", 
      trainer: "João Silva",
      revenue: 45200,
      students: 89,
      growth: "+28%"
    },
    { 
      name: "Yoga para Iniciantes", 
      trainer: "Maria Santos",
      revenue: 23400,
      students: 156,
      growth: "+18%"
    },
    { 
      name: "CrossFit Intensivo", 
      trainer: "Carlos Oliveira",
      revenue: 34100,
      students: 67,
      growth: "+32%"
    },
    { 
      name: "Pilates Clínico", 
      trainer: "Ana Costa",
      revenue: 19800,
      students: 92,
      growth: "+15%"
    },
    { 
      name: "Natação Técnica", 
      trainer: "Pedro Almeida",
      revenue: 18600,
      students: 45,
      growth: "+22%"
    }
  ];

  const trafficSources = [
    { source: "Busca Orgânica", visitors: 12400, percentage: 42, change: "+5.2%" },
    { source: "Redes Sociais", visitors: 8900, percentage: 31, change: "+12.1%" },
    { source: "Acesso Direto", visitors: 5200, percentage: 18, change: "-2.4%" },
    { source: "Referências", visitors: 2600, percentage: 9, change: "+8.7%" }
  ];

  const regionData = [
    { region: "São Paulo", users: 8450, percentage: 29.7 },
    { region: "Rio de Janeiro", users: 5230, percentage: 18.4 },
    { region: "Belo Horizonte", users: 3890, percentage: 13.7 },
    { region: "Brasília", users: 2910, percentage: 10.2 },
    { region: "Salvador", users: 2340, percentage: 8.2 },
    { region: "Outros", users: 5680, percentage: 19.8 }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? ArrowUpRight : ArrowDownRight;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Analytics & Relatórios</h1>
          <p className="text-muted-foreground">
            Análises detalhadas de performance da plataforma
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const TrendIcon = getTrendIcon(metric.trend);
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <TrendIcon className={`h-3 w-3 ${getTrendColor(metric.trend)}`} />
                  <span className={getTrendColor(metric.trend)}>{metric.change}</span>
                  <span>{metric.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Programs */}
        <Card>
          <CardHeader>
            <CardTitle>Top Programas por Receita</CardTitle>
            <CardDescription>
              Programas com melhor performance financeira
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPrograms.map((program, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{program.name}</div>
                    <div className="text-xs text-muted-foreground">
                      por {program.trainer} • {program.students} alunos
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      R$ {(program.revenue / 1000).toFixed(1)}k
                    </div>
                    <Badge variant="secondary" className="text-green-600 bg-green-50">
                      {program.growth}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Fontes de Tráfego</CardTitle>
            <CardDescription>
              De onde vêm nossos usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficSources.map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{source.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {source.visitors.toLocaleString()}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={source.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}
                      >
                        {source.change}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-[#e0093e] h-2 rounded-full" 
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {source.percentage}% do total
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição Geográfica</CardTitle>
          <CardDescription>
            Usuários por região do Brasil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionData.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <div className="font-medium text-sm">{region.region}</div>
                  <div className="text-xs text-muted-foreground">
                    {region.users.toLocaleString()} usuários
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{region.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>
            Jornada do usuário desde visita até compra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { stage: "Visitantes", count: 125400, percentage: 100, color: "bg-blue-500" },
              { stage: "Cadastros", count: 18750, percentage: 14.9, color: "bg-green-500" },
              { stage: "Perfis Completos", count: 12340, percentage: 9.8, color: "bg-yellow-500" },
              { stage: "Primeira Compra", count: 4567, percentage: 3.6, color: "bg-purple-500" },
              { stage: "Clientes Recorrentes", count: 2890, percentage: 2.3, color: "bg-red-500" }
            ].map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{stage.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {stage.count.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({stage.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className={`${stage.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}