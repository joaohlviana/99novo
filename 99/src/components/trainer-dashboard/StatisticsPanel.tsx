import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MessageCircle, 
  DollarSign,
  Calendar,
  Target,
  Star,
  Activity,
  Clock,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

type PeriodFilter = '7d' | '30d' | '90d' | '6m' | '1y';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: any;
  color: string;
}

// Dados simplificados para evitar timeout
const getBasicStatsData = (period: PeriodFilter) => {
  // Dados mínimos para funcionalidade básica
  const is7Days = period === '7d';
  
  return {
    profileViews: is7Days ? [
      { date: 'Hoje', visits: 45, leads: 12, conversions: 3 }
    ] : [
      { date: 'Esta semana', visits: 310, leads: 85, conversions: 18 }
    ],
    revenue: is7Days ? [
      { date: 'Hoje', amount: 320 }
    ] : [
      { date: 'Esta semana', amount: 2850 }
    ],
    demographics: [
      { name: '26-35', value: 45, color: '#e0093e' },
      { name: '18-25', value: 25, color: '#ff6b9d' },
      { name: '36-45', value: 20, color: '#a855f7' },
      { name: '46+', value: 10, color: '#3b82f6' }
    ],
    topSports: [
      { sport: 'Musculação', leads: is7Days ? 35 : 145, color: '#e0093e' },
      { sport: 'Funcional', leads: is7Days ? 22 : 92, color: '#a855f7' },
      { sport: 'Corrida', leads: is7Days ? 15 : 65, color: '#3b82f6' }
    ]
  };
};

export function StatisticsPanel() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('30d');
  const [activeChart, setActiveChart] = useState<'visits' | 'revenue'>('visits');
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  // Carregar estatísticas do servidor
  useEffect(() => {
    const loadStatistics = async () => {
      if (!session?.access_token) {
        console.log('⚠️ [StatisticsPanel] Sessão não disponível');
        setStatsData(getBasicStatsData(selectedPeriod)); // Fallback para dados mock
        setIsLoading(false);
        return;
      }

      try {
        console.log('📊 [StatisticsPanel] Carregando estatísticas do servidor...');
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e547215c/statistics`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ [StatisticsPanel] Estatísticas carregadas:', Object.keys(result.data));
          setStatsData(result.data);
        } else {
          throw new Error(result.error || 'Erro desconhecido');
        }

      } catch (error) {
        console.error('❌ [StatisticsPanel] Erro ao carregar estatísticas:', error);
        setError(error.message);
        // Fallback para dados mock em caso de erro
        setStatsData(getBasicStatsData(selectedPeriod));
      } finally {
        setIsLoading(false);
      }
    };

    loadStatistics();
  }, [session, selectedPeriod]);

  const currentData = statsData || getBasicStatsData(selectedPeriod);
  
  // Assegurar compatibilidade entre dados do servidor e mock
  const safeCurrentData = {
    ...currentData,
    topSports: currentData.top_sports || currentData.topSports || [],
    demographics: currentData.demographics || []
  };

  const statCards: StatCard[] = [
    {
      title: 'Visualizações do Perfil',
      value: currentData?.profile_views?.toString() || '387',
      change: '+23.5%',
      changeType: 'increase',
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: 'Novos Leads',
      value: currentData?.new_leads?.toString() || '107',
      change: '+18.2%',
      changeType: 'increase',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Taxa de Conversão',
      value: `${currentData?.conversion_rate || 3.1}%`,
      change: '+0.8%',
      changeType: 'increase',
      icon: Target,
      color: 'text-purple-600'
    },
    {
      title: 'Receita',
      value: `R$ ${currentData?.revenue?.toLocaleString() || '3.790'}`,
      change: '+12.4%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-[#e0093e]'
    },
    {
      title: 'Mensagens Recebidas',
      value: currentData?.messages?.toString() || '89',
      change: '+31.2%',
      changeType: 'increase',
      icon: MessageCircle,
      color: 'text-orange-600'
    },
    {
      title: 'Avaliação Média',
      value: currentData?.rating?.toString() || '4.9',
      change: '+0.1',
      changeType: 'increase',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      title: 'Tempo de Resposta',
      value: currentData?.response_time || '1.8h',
      change: '-0.3h',
      changeType: 'increase',
      icon: Clock,
      color: 'text-cyan-600'
    },
    {
      title: 'Alunos Ativos',
      value: currentData?.active_clients?.toString() || '127',
      change: '+15.6%',
      changeType: 'increase',
      icon: UserCheck,
      color: 'text-indigo-600'
    }
  ];

  return (
    <div className="w-full min-h-screen space-y-8">
      {/* Header Section */}
      <div className="space-y-2 px-4 lg:px-6">
        <h1 className="text-2xl font-semibold mt-[20px] mr-[0px] mb-[7px] ml-[0px]">Estatísticas</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho do seu perfil e métricas de negócio
        </p>
        
        {/* Loading and Error states */}
        {isLoading && (
          <div className="text-sm text-muted-foreground">
            ⏳ Carregando estatísticas...
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-600">
            ⚠️ Usando dados de exemplo: {error}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="w-full px-4 lg:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={(value: PeriodFilter) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'increase' ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">vs período anterior</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits & Leads Chart */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Desempenho ao Longo do Tempo</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={activeChart === 'visits' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveChart('visits')}
                  className={activeChart === 'visits' ? 'bg-[#e0093e] hover:bg-[#c40835]' : ''}
                >
                  Visitas & Leads
                </Button>
                <Button
                  variant={activeChart === 'revenue' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveChart('revenue')}
                  className={activeChart === 'revenue' ? 'bg-[#e0093e] hover:bg-[#c40835]' : ''}
                >
                  Receita
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              {activeChart === 'visits' ? (
                <AreaChart data={currentData.profile_views_chart || currentData.profileViews}>
                  <defs>
                    <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e0093e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#e0093e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="#e0093e" 
                    strokeWidth={2}
                    fill="url(#visitGradient)" 
                    name="Visitas"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill="url(#leadGradient)" 
                    name="Leads"
                  />
                </AreaChart>
              ) : (
                <BarChart data={currentData.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                  <Bar dataKey="amount" fill="#e0093e" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demographics Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Faixa Etária dos Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={safeCurrentData.demographics}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {safeCurrentData.demographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentual']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Sports */}
        <Card>
          <CardHeader>
            <CardTitle>Modalidades Mais Procuradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeCurrentData.topSports.map((sport, index) => (
                <div key={sport.sport} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: sport.color }}
                    />
                    <span className="font-medium">{sport.sport}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{sport.leads} leads</span>
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bars */}
            <div className="mt-6 space-y-2">
              {safeCurrentData.topSports.map((sport) => {
                const maxLeads = safeCurrentData.topSports[0]?.leads || 1;
                const percentage = (sport.leads / maxLeads) * 100;
                
                return (
                  <div key={sport.sport} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{sport.sport}</span>
                      <span>{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: sport.color 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Response Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tempo de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Média atual</span>
                <span className="text-xl font-semibold">{currentData?.response_time || '1.8h'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Meta</span>
                <span className="text-sm font-medium text-green-600">≤ 2h</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: '90%' }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Excelente! Você está respondendo mais rápido que 85% dos treinadores.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Taxa de Engajamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taxa atual</span>
                <span className="text-xl font-semibold">12.4%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Média da plataforma</span>
                <span className="text-sm font-medium text-gray-600">8.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#e0093e] h-2 rounded-full"
                  style={{ width: '75%' }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Sua taxa de engajamento está 51% acima da média!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Visualizações</span>
                <span className="text-sm font-medium">{currentData?.profile_views || '1,635'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-full" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Leads gerados</span>
                <span className="text-sm font-medium">{currentData?.new_leads || '435'} (26.6%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '26.6%' }} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Conversões</span>
                <span className="text-sm font-medium">96 ({currentData?.conversion_rate || '5.8'}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#e0093e] h-2 rounded-full" style={{ width: `${currentData?.conversion_rate || 5.8}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Novo lead interessado em Musculação</p>
                <p className="text-xs text-muted-foreground">Maria Silva, 28 anos - há 5 minutos</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Novo</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Avaliação 5 estrelas recebida</p>
                <p className="text-xs text-muted-foreground">Carlos Santos avaliou seu programa - há 2 horas</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Avaliação</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg bg-purple-50 border border-purple-200">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Meta de conversão atingida</p>
                <p className="text-xs text-muted-foreground">Você converteu 15 leads este mês - há 1 dia</p>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">Meta</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}