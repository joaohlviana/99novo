import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  MessageCircle,
  Star,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Clock,
  Target,
  TrendingUp,
  Settings,
  Download
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { PageShell } from '../layout/PageShell';
import { ContentGrid } from '../layout/ContentGrid';
import { Main } from '../layout/Main';
import { Aside } from '../layout/Aside';
import { Section } from '../layout/Section';
import { CardShell } from '../layout/CardShell';
import { CourseVideoPage } from './CourseVideoPage';
import { EbookDownloadPage } from './EbookDownloadPage';

import { useNavigation } from '../../hooks/useNavigation';

interface ClientProgramDetailsProps {}

// Mock data para determinar o tipo do programa
const getProgramType = (id: string) => {
  const programs = {
    '1': 'course',
    '2': 'ebook', 
    '3': 'subscription'
  };
  return programs[id as keyof typeof programs] || 'course';
};

// Mock data para consultoria
const getSubscriptionDetails = (id: string) => {
  return {
    id: '3',
    title: 'Consultoria Fitness Personalizada',
    description: 'Acompanhamento mensal via WhatsApp com treinos e dieta personalizados para seus objetivos específicos',
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
    category: 'Consultoria',
    level: 'Personalizado',
    messagesExchanged: 156,
    averageResponseTime: '1h 45min',
    consultationHours: 24,
    planChanges: 3,
    features: [
      'Respostas em até 2 horas',
      'Planos alimentares personalizados',
      'Ajustes semanais nos treinos',
      'Acompanhamento de resultados',
      'Suporte completo via WhatsApp',
      'Relatórios de progresso mensais'
    ],
    stats: {
      totalMessages: 156,
      responseRate: 98,
      satisfactionScore: 4.9,
      averagePerDay: 2.3
    }
  };
};

function SubscriptionDetailsPage({ programId }: { programId: string }) {
  const navigation = useAppNavigation();
  const subscription = getSubscriptionDetails(programId);

  const openWhatsApp = () => {
    const message = `Olá ${subscription.trainer.name}! Estou entrando em contato sobre minha consultoria "${subscription.title}".`;
    const whatsappUrl = `https://wa.me/${subscription.trainer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <PageShell>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={navigation.navigateToClientDashboard}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Meus Programas
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                <Smartphone className="h-3 w-3 mr-1" />
                Consultoria
              </Badge>
              <h1 className="font-semibold text-gray-900 truncate">{subscription.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <ContentGrid hasAside>
        <Main>
          {/* Hero Section */}
          <CardShell className="text-center">
            <div className="relative inline-block mb-6">
              <img 
                src={subscription.image}
                alt={subscription.title}
                className="w-48 h-64 object-cover rounded-lg shadow-lg mx-auto"
              />
              <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2 rounded-full">
                <MessageCircle className="h-4 w-4" />
              </div>
            </div>

            <h1 className="text-3xl font-semibold mb-2">{subscription.title}</h1>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{subscription.description}</p>

            {/* Main Action Button */}
            <Button size="lg" onClick={openWhatsApp} className="bg-[#25d366] hover:bg-[#22c55e] text-white gap-2 mb-8">
              <MessageCircle className="h-5 w-5" />
              Falar com {subscription.trainer.name.split(' ')[0]} no WhatsApp
            </Button>

            {/* Status Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-semibold text-orange-500">{subscription.remainingDays}</div>
                <div className="text-sm text-muted-foreground">Dias Restantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-orange-500">{subscription.averageResponseTime}</div>
                <div className="text-sm text-muted-foreground">Tempo de Resposta</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-orange-500">{subscription.messagesExchanged}</div>
                <div className="text-sm text-muted-foreground">Mensagens Trocadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-orange-500">{subscription.stats.satisfactionScore}</div>
                <div className="text-sm text-muted-foreground">Satisfação</div>
              </div>
            </div>
          </CardShell>

          {/* What's Included */}
          <CardShell>
            <h3 className="text-lg font-semibold mb-4">O que está incluído na sua consultoria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscription.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardShell>

          {/* How it Works */}
          <CardShell>
            <h3 className="text-lg font-semibold mb-4">Como funciona</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-medium text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium mb-1">Entre em contato via WhatsApp</h4>
                  <p className="text-sm text-muted-foreground">Clique no botão acima e envie uma mensagem para seu treinador</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-medium text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium mb-1">Receba acompanhamento personalizado</h4>
                  <p className="text-sm text-muted-foreground">Treinos, dietas e orientações adaptados aos seus objetivos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-medium text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium mb-1">Acompanhe seu progresso</h4>
                  <p className="text-sm text-muted-foreground">Relatórios regulares e ajustes conforme sua evolução</p>
                </div>
              </div>
            </div>
          </CardShell>
        </Main>

        <Aside>
          {/* Trainer Info */}
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
                WhatsApp
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <User className="h-4 w-4 mr-2" />
                Ver Perfil
              </Button>
            </div>
          </CardShell>

          {/* Subscription Status */}
          <CardShell>
            <h3 className="font-medium mb-4">Status da Assinatura</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Ativo
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Renovação</span>
                <span className="font-medium">10/04/2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valor mensal</span>
                <span className="font-medium text-[var(--brand)]">{subscription.price}</span>
              </div>
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
              Sua consultoria será renovada automaticamente em 10/04/2024.
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

export function ClientProgramDetails({}: ClientProgramDetailsProps) {
  const { programId } = useParams<{ programId: string }>();
  const programType = getProgramType(programId || '1');

  // Redirecionar para a página específica baseada no tipo
  switch (programType) {
    case 'course':
      return <CourseVideoPage programId={programId || '1'} />;
    case 'ebook':
      return <EbookDownloadPage programId={programId || '1'} />;
    case 'subscription':
      return <SubscriptionDetailsPage programId={programId || '1'} />;
    default:
      return <CourseVideoPage programId={programId || '1'} />;
  }
}

// Default export para o lazy loading
export default ClientProgramDetails;