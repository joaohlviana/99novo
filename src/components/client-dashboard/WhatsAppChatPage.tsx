import { useState } from 'react';
import { 
  ArrowLeft,
  MessageCircle,
  Star,
  User,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Image,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Settings,
  Archive,
  Download,
  Search,
  Filter,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';
import { PageShell } from '../layout/PageShell';
import { ContentGrid } from '../layout/ContentGrid';
import { Main } from '../layout/Main';
import { Aside } from '../layout/Aside';
import { Section } from '../layout/Section';
import { CardShell } from '../layout/CardShell';

interface WhatsAppChatPageProps {
  programId: string;
  onNavigateBack: () => void;
}

const getSubscriptionDetails = (id: string) => {
  return {
    id: '3',
    title: 'Consultoria Nutricional Personalizada',
    description: 'Acompanhamento nutricional completo via WhatsApp com resposta em até 2 horas',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    type: 'subscription',
    trainer: {
      id: '3',
      name: 'Dr. Carlos Nutrição',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
      initials: 'CN',
      specialty: 'Nutricionista Clínico',
      rating: 4.9,
      responseTime: '2h',
      phone: '+55 11 99999-9999',
      isOnline: true,
      lastSeen: 'Agora'
    },
    status: 'active',
    startDate: '2024-01-10',
    endDate: '2024-04-10',
    remainingDays: 67,
    price: 'R$ 197/mês',
    category: 'Nutrição',
    level: 'Personalizado',
    messagesExchanged: 156,
    averageResponseTime: '1h 45min',
    consultationHours: 24,
    planChanges: 3,
    features: [
      'Respostas em até 2 horas',
      'Planos alimentares personalizados',
      'Ajustes semanais',
      'Acompanhamento de resultados',
      'Grupo VIP de receitas',
      'Relatórios mensais'
    ],
    stats: {
      totalMessages: 156,
      trainerMessages: 78,
      clientMessages: 78,
      averagePerDay: 2.3,
      responseRate: 98,
      satisfactionScore: 4.9
    },
    recentConversations: [
      {
        id: '1',
        date: '2024-01-30',
        messages: [
          {
            id: 'm1',
            sender: 'client',
            content: 'Bom dia, Dr. Carlos! Como posso substituir o frango no almoço de hoje?',
            time: '08:15',
            status: 'read'
          },
          {
            id: 'm2',
            sender: 'trainer',
            content: 'Bom dia! Você pode usar peixe grelhado (mesmo peso), ovo mexido (2 ovos) ou tofu refogado. Qual prefere?',
            time: '08:47',
            status: 'read'
          },
          {
            id: 'm3',
            sender: 'client',
            content: 'Vou de peixe! Obrigada 😊',
            time: '08:50',
            status: 'read'
          }
        ]
      },
      {
        id: '2',
        date: '2024-01-29',
        messages: [
          {
            id: 'm4',
            sender: 'trainer',
            content: 'Como foi o fim de semana? Conseguiu seguir o plano?',
            time: '19:30',
            status: 'read'
          },
          {
            id: 'm5',
            sender: 'client',
            content: 'Segui certinho no sábado, mas no domingo exagerei um pouco no churrasco 😅',
            time: '20:15',
            status: 'read'
          },
          {
            id: 'm6',
            sender: 'trainer',
            content: 'Normal! É importante ter flexibilidade. Vamos ajustar segunda-feira para compensar. Sem culpa! 💪',
            time: '20:18',
            status: 'read'
          }
        ]
      }
    ]
  };
};

export function WhatsAppChatPage({ programId, onNavigateBack }: WhatsAppChatPageProps) {
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState('today');
  const [activeTab, setActiveTab] = useState('chat');

  const subscription = getSubscriptionDetails(programId);

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/${subscription.trainer.phone.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <PageShell>
      {/* Header */}
      <div className="bg-[#075e54] text-white sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onNavigateBack}
              className="gap-2 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Meus Programas
            </Button>
            <Separator orientation="vertical" className="h-6 bg-white/30" />
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                <Smartphone className="h-3 w-3 mr-1" />
                Consultoria
              </Badge>
              <h1 className="font-semibold text-white truncate">{subscription.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <ContentGrid hasAside>
        <Main>
          {/* WhatsApp Style Header */}
          <div className="bg-[#075e54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={subscription.trainer.avatar} />
                <AvatarFallback>{subscription.trainer.initials}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-medium">{subscription.trainer.name}</h2>
                <p className="text-xs text-green-200">
                  {subscription.trainer.isOnline ? 'Online' : `Visto por último ${subscription.trainer.lastSeen}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Phone className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Ver Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Mensagens
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    Exportar Conversa
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="bg-white border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat">Conversa</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
                <TabsTrigger value="files">Arquivos</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="chat" className="flex-1 flex flex-col h-[600px]">
              {/* Chat Messages */}
              <ScrollArea className="flex-1 bg-[#ece5dd] p-4">
                <div className="space-y-4">
                  {subscription.recentConversations.map((conversation) => (
                    <div key={conversation.id}>
                      {/* Date Separator */}
                      <div className="flex justify-center mb-4">
                        <div className="bg-white/80 rounded-lg px-3 py-1 text-xs text-gray-600">
                          {conversation.date}
                        </div>
                      </div>
                      
                      {/* Messages */}
                      {conversation.messages.map((msg) => (
                        <div 
                          key={msg.id}
                          className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'} mb-2`}
                        >
                          <div 
                            className={`max-w-[70%] rounded-lg px-3 py-2 ${
                              msg.sender === 'client' 
                                ? 'bg-[#dcf8c6] text-gray-800' 
                                : 'bg-white text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-xs text-gray-500">{msg.time}</span>
                              {msg.sender === 'client' && (
                                <CheckCircle className="h-3 w-3 text-blue-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Image className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Digite uma mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleSendMessage} className="bg-[#075e54] hover:bg-[#064e45]">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-3 text-center">
                  <Button onClick={openWhatsApp} className="bg-[#25d366] hover:bg-[#22c55e] text-white gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Abrir no WhatsApp
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="p-6">
              <CardShell>
                <h3 className="text-lg font-semibold mb-4">Histórico de Conversas</h3>
                
                <div className="flex gap-4 mb-6">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar por Data
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Mensagens
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <div className="text-2xl font-semibold">{subscription.stats.totalMessages}</div>
                      <div className="text-sm text-muted-foreground">Total de Mensagens</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-2xl font-semibold">{subscription.averageResponseTime}</div>
                      <div className="text-sm text-muted-foreground">Tempo Médio de Resposta</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <div className="text-2xl font-semibold">{subscription.stats.averagePerDay}</div>
                      <div className="text-sm text-muted-foreground">Mensagens por Dia</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {subscription.recentConversations.map((conversation) => (
                    <Card key={conversation.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{conversation.date}</h4>
                          <Badge variant="outline">{conversation.messages.length} mensagens</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Última mensagem: "{conversation.messages[conversation.messages.length - 1].content.substring(0, 50)}..."</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardShell>
            </TabsContent>
            
            <TabsContent value="files" className="p-6">
              <CardShell>
                <h3 className="text-lg font-semibold mb-4">Arquivos Compartilhados</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Download className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Plano Alimentar Janeiro</h4>
                          <p className="text-sm text-muted-foreground">PDF • 2.1MB • 25/01/2024</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Download className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Lista de Compras</h4>
                          <p className="text-sm text-muted-foreground">PDF • 840KB • 20/01/2024</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardShell>
            </TabsContent>
          </Tabs>
        </Main>

        <Aside>
          {/* Subscription Status */}
          <CardShell>
            <h3 className="font-medium mb-4">Status da Consultoria</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Ativo
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dias restantes</span>
                <span className="font-medium">{subscription.remainingDays} dias</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Próximo pagamento</span>
                <span className="font-medium">10/02/2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valor mensal</span>
                <span className="font-medium text-[var(--brand)]">{subscription.price}</span>
              </div>
            </div>
          </CardShell>

          {/* Trainer Contact */}
          <CardShell>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={subscription.trainer.avatar} />
                <AvatarFallback>{subscription.trainer.initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{subscription.trainer.name}</h3>
                <p className="text-sm text-muted-foreground">{subscription.trainer.specialty}</p>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                  <span>{subscription.trainer.rating} • Responde em ~{subscription.trainer.responseTime}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button className="w-full" size="sm" onClick={openWhatsApp}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Abrir WhatsApp
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <User className="h-4 w-4 mr-2" />
                Ver Perfil
              </Button>
            </div>
          </CardShell>

          {/* Quick Stats */}
          <CardShell>
            <h3 className="font-medium mb-4">Estatísticas</h3>
            <div className="space-y-4">
              <div className="text-center p-3 rounded-lg bg-green-50">
                <div className="text-2xl font-semibold text-green-600">{subscription.stats.responseRate}%</div>
                <div className="text-xs text-green-700">Taxa de Resposta</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-blue-50">
                  <div className="text-lg font-semibold text-blue-600">{subscription.consultationHours}h</div>
                  <div className="text-xs text-blue-700">Consultoria</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-50">
                  <div className="text-lg font-semibold text-purple-600">{subscription.planChanges}</div>
                  <div className="text-xs text-purple-700">Ajustes</div>
                </div>
              </div>
            </div>
          </CardShell>

          {/* Renewal Alert */}
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Sua consultoria será renovada automaticamente em 10/02/2024.
              <Button variant="link" className="p-0 h-auto text-sm ml-1">
                Gerenciar assinatura
              </Button>
            </AlertDescription>
          </Alert>
        </Aside>
      </ContentGrid>
    </PageShell>
  );
}