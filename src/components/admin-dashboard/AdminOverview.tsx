import { 
  Users, 
  FileText, 
  Trophy, 
  TrendingUp, 
  Activity,
  DollarSign,
  UserCheck,
  AlertTriangle,
  Calendar,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';

export function AdminOverview() {
  const stats = [
    {
      title: "Total de Usuários",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      description: "vs. último mês"
    },
    {
      title: "Treinadores Ativos",
      value: "324",
      change: "+8.2%",
      trend: "up",
      icon: UserCheck,
      description: "vs. último mês"
    },
    {
      title: "Programas Publicados",
      value: "1,156",
      change: "+15.3%",
      trend: "up",
      icon: FileText,
      description: "vs. último mês"
    },
    {
      title: "Faturamento",
      value: "R$ 127.8k",
      change: "+23.1%",
      trend: "up",
      icon: DollarSign,
      description: "vs. último mês"
    }
  ];

  const recentActivities = [
    {
      type: "new_trainer",
      message: "Novo treinador cadastrado: Maria Silva",
      time: "2 min atrás",
      status: "pending"
    },
    {
      type: "program_published",
      message: "Programa 'Yoga Matinal' foi publicado",
      time: "15 min atrás",
      status: "success"
    },
    {
      type: "payment",
      message: "Pagamento de R$ 297 processado",
      time: "32 min atrás",
      status: "success"
    },
    {
      type: "report",
      message: "Denúncia sobre programa reportada",
      time: "1h atrás",
      status: "warning"
    },
    {
      type: "new_user",
      message: "15 novos usuários se cadastraram",
      time: "2h atrás",
      status: "info"
    }
  ];

  const pendingActions = [
    {
      title: "Treinadores Pendentes",
      count: 8,
      description: "Aguardando aprovação",
      action: "Revisar"
    },
    {
      title: "Programas para Moderar",
      count: 23,
      description: "Programas reportados ou pendentes",
      action: "Moderar"
    },
    {
      title: "Solicitações de Suporte",
      count: 12,
      description: "Tickets abertos",
      action: "Responder"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'pending': return 'text-blue-600 bg-blue-50';
      case 'info': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">
          Visão geral completa da plataforma e ações pendentes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600">{stat.change}</span>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Ações Pendentes
            </CardTitle>
            <CardDescription>
              Itens que precisam da sua atenção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingActions.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{item.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Button size="sm" variant="outline" className="ml-3">
                  {item.action}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas atividades na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getStatusColor(activity.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats & Growth Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crescimento Mensal</CardTitle>
            <CardDescription>
              Métricas de crescimento da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Novos Usuários</span>
                <span className="font-medium">547 / 800</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Meta de Receita</span>
                <span className="font-medium">127.8k / 150k</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Satisfação (NPS)</span>
                <span className="font-medium">4.7 / 5.0</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">94.2%</div>
                <div className="text-xs text-muted-foreground">Taxa de Retenção</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">8.7</div>
                <div className="text-xs text-muted-foreground">Avg. Session Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Modalidades</CardTitle>
            <CardDescription>
              Modalidades mais populares da semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { sport: 'Musculação', trainers: 89, programs: 234, growth: '+12%' },
                { sport: 'Yoga', trainers: 56, programs: 145, growth: '+8%' },
                { sport: 'Crossfit', trainers: 34, programs: 89, growth: '+15%' },
                { sport: 'Pilates', trainers: 28, programs: 67, growth: '+5%' },
                { sport: 'Funcional', trainers: 45, programs: 112, growth: '+18%' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{item.sport}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.trainers} treinadores • {item.programs} programas
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    {item.growth}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <div className="font-medium text-sm">API Principal</div>
                <div className="text-xs text-muted-foreground">99.9% uptime</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <div className="font-medium text-sm">Banco de Dados</div>
                <div className="text-xs text-muted-foreground">Saudável</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div>
                <div className="font-medium text-sm">CDN</div>
                <div className="text-xs text-muted-foreground">Latência: 45ms</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <div className="font-medium text-sm">Pagamentos</div>
                <div className="text-xs text-muted-foreground">Operacional</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}