import { useState } from 'react';
import { 
  Search, 
  MoreVertical, 
  Send, 
  Phone, 
  Video, 
  Info,
  Clock,
  CheckCheck,
  Star,
  MapPin,
  UserCheck,
  CheckCircle,
  Award,
  DollarSign,
  MessageCircle
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isFromTrainer: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface ConversionInfo {
  convertedAt: string;
  serviceType: 'program' | 'personal-training' | 'consultation';
  serviceName: string;
  value: string;
}

interface Lead {
  id: string;
  name: string;
  age: number;
  location: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  unreadCount: number;
  messages: Message[];
  sport: string;
  isSubscribed?: boolean;
  isConverted?: boolean;
  conversionInfo?: ConversionInfo;
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Nathyyy97',
    age: 36,
    location: 'Londrina, PR',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612ff3f?w=400&q=80',
    lastMessage: 'Assine para ler',
    timestamp: '18/08, 00:02',
    isOnline: true,
    unreadCount: 1,
    sport: 'Musculação',
    isSubscribed: false,
    messages: [
      {
        id: '1',
        content: 'Oi! Gostaria de saber mais sobre seus treinos de musculação.',
        timestamp: '18/08, 00:02',
        isFromTrainer: false,
        status: 'read'
      }
    ]
  },
  {
    id: '2',
    name: 'Rheves',
    age: 27,
    location: 'Ourinhos, SP',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    lastMessage: 'Assine para ler',
    timestamp: '16/08, 23:05',
    isOnline: false,
    unreadCount: 1,
    sport: 'Crossfit',
    isSubscribed: false,
    messages: [
      {
        id: '1',
        content: 'Bom dia! Quero começar um treino funcional, você pode me ajudar?',
        timestamp: '16/08, 23:05',
        isFromTrainer: false,
        status: 'delivered'
      }
    ]
  },
  {
    id: '3',
    name: 'ceciveira',
    age: 18,
    location: 'Assis, SP',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    lastMessage: 'Assine para ler',
    timestamp: '14/08, 12:58',
    isOnline: false,
    unreadCount: 1,
    sport: 'Yoga',
    isSubscribed: false,
    messages: [
      {
        id: '1',
        content: 'Oi! Sou iniciante em yoga, você tem algum programa para iniciantes?',
        timestamp: '14/08, 12:58',
        isFromTrainer: false,
        status: 'sent'
      }
    ]
  },
  {
    id: '4',
    name: 'Jhenniffer ca11ti',
    age: 25,
    location: 'São Paulo, SP',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    lastMessage: 'Você pediu o acesso às fotos privadas',
    timestamp: '12/08, 08:36',
    isOnline: true,
    unreadCount: 0,
    sport: 'Pilates',
    isSubscribed: true,
    isConverted: true,
    conversionInfo: {
      convertedAt: '2024-01-12',
      serviceType: 'program',
      serviceName: 'Programa de Pilates - 8 semanas',
      value: 'R$ 197'
    },
    messages: [
      {
        id: '1',
        content: 'Oi João! Gostaria de saber sobre seus treinos de pilates.',
        timestamp: '12/08, 07:30',
        isFromTrainer: false,
        status: 'read'
      },
      {
        id: '2',
        content: 'Olá! Tenho várias opções de pilates. Qual seu nível de experiência?',
        timestamp: '12/08, 07:45',
        isFromTrainer: true,
        status: 'read'
      },
      {
        id: '3',
        content: 'Sou iniciante, mas já pratiquei um pouco antes.',
        timestamp: '12/08, 08:15',
        isFromTrainer: false,
        status: 'read'
      },
      {
        id: '4',
        content: 'Perfeito! Posso criar um programa personalizado para você. Você prefere presencial ou online?',
        timestamp: '12/08, 08:30',
        isFromTrainer: true,
        status: 'read'
      },
      {
        id: '5',
        content: 'Você pediu o acesso às fotos privadas',
        timestamp: '12/08, 08:36',
        isFromTrainer: false,
        status: 'read'
      }
    ]
  },
  {
    id: '5',
    name: '9044',
    age: 25,
    location: 'Porto Alegre, RS',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    lastMessage: 'Você pediu o acesso às fotos privadas',
    timestamp: '09/08, 23:46',
    isOnline: false,
    unreadCount: 0,
    sport: 'Running',
    isSubscribed: true,
    isConverted: true,
    conversionInfo: {
      convertedAt: '2024-01-09',
      serviceType: 'personal-training',
      serviceName: 'Treino Presencial Individual',
      value: 'R$ 80/sessão'
    },
    messages: [
      {
        id: '1',
        content: 'Olá! Preciso de ajuda com treinos de corrida.',
        timestamp: '09/08, 23:00',
        isFromTrainer: false,
        status: 'read'
      },
      {
        id: '2',
        content: 'Claro! Qual é seu objetivo? Perda de peso, resistência ou performance?',
        timestamp: '09/08, 23:15',
        isFromTrainer: true,
        status: 'read'
      },
      {
        id: '3',
        content: 'Você pediu o acesso às fotos privadas',
        timestamp: '09/08, 23:46',
        isFromTrainer: false,
        status: 'read'
      }
    ]
  }
];

export function ChatSystem() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(mockLeads[3]); // Start with Jhenniffer selected
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'converted'>('all');
  const [isConversionDialogOpen, setIsConversionDialogOpen] = useState(false);
  const [conversionData, setConversionData] = useState({
    serviceType: '',
    serviceName: '',
    value: ''
  });

  const filteredLeads = mockLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.sport.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'converted' ? lead.isConverted :
      false; // favorites tab logic can be added later
    
    return matchesSearch && matchesTab;
  });

  const totalUnreadCount = mockLeads.reduce((sum, lead) => sum + lead.unreadCount, 0);
  const convertedCount = mockLeads.filter(lead => lead.isConverted).length;

  // Available services/programs for conversion
  const availableServices = [
    { type: 'program', name: 'Transformação Corporal Completa', value: 'R$ 297', duration: '12 semanas' },
    { type: 'program', name: 'Programa de Pilates', value: 'R$ 197', duration: '8 semanas' },
    { type: 'program', name: 'Hipertrofia Avançada', value: 'R$ 397', duration: '16 semanas' },
    { type: 'personal-training', name: 'Treino Presencial Individual', value: 'R$ 80/sessão', duration: 'Por sessão' },
    { type: 'personal-training', name: 'Pacote Mensal (4 sessões)', value: 'R$ 280/mês', duration: 'Mensal' },
    { type: 'consultation', name: 'Consultoria Online Mensal', value: 'R$ 150/mês', duration: 'Mensal' },
    { type: 'consultation', name: 'Avaliação Física + Plano', value: 'R$ 120', duration: 'Única' }
  ];

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedLead) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isFromTrainer: true,
      status: 'sent'
    };

    // Update the selected lead's messages
    const updatedLead = {
      ...selectedLead,
      messages: [...selectedLead.messages, newMessage],
      lastMessage: messageInput,
      timestamp: 'Agora'
    };

    setSelectedLead(updatedLead);
    setMessageInput('');
  };

  const handleConvertLead = () => {
    if (!selectedLead || !conversionData.serviceType || !conversionData.serviceName || !conversionData.value) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const updatedLead: Lead = {
      ...selectedLead,
      isConverted: true,
      conversionInfo: {
        convertedAt: new Date().toISOString().split('T')[0],
        serviceType: conversionData.serviceType as 'program' | 'personal-training' | 'consultation',
        serviceName: conversionData.serviceName,
        value: conversionData.value
      }
    };

    setSelectedLead(updatedLead);
    setIsConversionDialogOpen(false);
    setConversionData({ serviceType: '', serviceName: '', value: '' });
    
    toast.success('Lead convertido em cliente!', {
      description: `${selectedLead.name} adquiriu: ${conversionData.serviceName}`,
      duration: 4000
    });
  };

  const handleServiceSelect = (serviceName: string) => {
    const service = availableServices.find(s => s.name === serviceName);
    if (service) {
      setConversionData({
        serviceType: service.type,
        serviceName: service.name,
        value: service.value
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full min-h-screen space-y-8">
      {/* Header Section */}
      <div className="space-y-2 px-4 lg:px-6">
        <h1 className="text-2xl font-semibold mt-[20px] mr-[0px] mb-[7px] ml-[0px]">Mensagens</h1>
        <p className="text-muted-foreground">
          Gerencie suas conversas com leads e alunos em potencial.
        </p>
      </div>

      {/* Chat Interface */}
      <div className="w-full px-4 lg:px-6">
        <div className="h-[calc(100vh-300px)] flex bg-white rounded-lg border overflow-hidden">
      {/* Sidebar - Lista de Leads */}
      <div className="w-80 border-r bg-white flex flex-col">
        {/* Header da Sidebar */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">Mensagens</h2>
              {totalUnreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="bg-[#e0093e] hover:bg-[#c40835] text-xs h-5 min-w-5 rounded-full flex items-center justify-center px-1.5"
                >
                  {totalUnreadCount}
                </Badge>
              )}
            </div>
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </div>

          {/* Premium Banner */}
          

          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            <Button
              variant={activeTab === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className={`flex-1 rounded-full h-8 ${
                activeTab === 'all' 
                  ? 'bg-[#e0093e] hover:bg-[#c40835] text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todas
            </Button>
            <Button
              variant={activeTab === 'converted' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('converted')}
              className={`flex-1 rounded-full h-8 ${
                activeTab === 'converted' 
                  ? 'bg-[#e0093e] hover:bg-[#c40835] text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <span>Clientes</span>
                {convertedCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="bg-white/20 text-current text-xs h-4 min-w-4 rounded-full flex items-center justify-center px-1"
                  >
                    {convertedCount}
                  </Badge>
                )}
              </div>
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-0 rounded-lg"
            />
          </div>
        </div>

        {/* Lista de Leads */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedLead?.id === lead.id 
                    ? 'bg-[#e0093e]/10' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={lead.avatar} alt={lead.name} />
                    <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {lead.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {lead.name}, {lead.age}
                    </h4>
                    <span className="text-xs text-gray-500">{lead.timestamp}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>{lead.location}</span>
                    {lead.isConverted && (
                      <Badge 
                        variant="secondary" 
                        className="ml-2 bg-green-100 text-green-700 text-xs px-1 py-0"
                      >
                        Cliente
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate flex-1">
                      {lead.lastMessage}
                    </p>
                    {lead.unreadCount > 0 && (
                      <div className="w-2 h-2 bg-[#e0093e] rounded-full ml-2"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Área Principal do Chat */}
      {selectedLead ? (
        <div className="flex-1 flex flex-col">
          {/* Header do Chat */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedLead.avatar} alt={selectedLead.name} />
                    <AvatarFallback>{selectedLead.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {selectedLead.isConverted && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{selectedLead.name}, {selectedLead.age}</h3>
                    {selectedLead.isConverted && (
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-700 text-xs"
                      >
                        Cliente
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedLead.location}
                    {selectedLead.conversionInfo && (
                      <span className="ml-2 text-green-600">
                        • {selectedLead.conversionInfo.serviceName}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!selectedLead.isConverted && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsConversionDialogOpen(true)}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Virou Cliente
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Área de Mensagens */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {selectedLead.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isFromTrainer ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.isFromTrainer
                        ? 'bg-[#e0093e] text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center gap-1 mt-1 ${
                      message.isFromTrainer ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className={`text-xs ${
                        message.isFromTrainer ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </span>
                      {message.isFromTrainer && (
                        <CheckCheck className={`h-3 w-3 ${
                          message.status === 'read' ? 'text-blue-200' : 'text-white/70'
                        }`} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Warning Banner para usuários não suscritos */}
          {!selectedLead.isSubscribed && (
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-200">
              <div className="flex items-center justify-center gap-2 text-amber-700">
                <Info className="h-4 w-4" />
                <span className="text-sm">
                  Atividades ilícitas e/ou comerciais como prostituição são proibidas.
                </span>
              </div>
            </div>
          )}

          {/* Input de Mensagem */}
          <div className="p-4 border-t bg-white">
            {selectedLead.isSubscribed ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Escreva uma mensagem..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 rounded-full border-gray-200 px-4"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="rounded-full w-10 h-10 p-0 bg-[#e0093e] hover:bg-[#c40835]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="rounded-full border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Assine para ler
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedLead.timestamp}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione uma conversa
            </h3>
            <p className="text-gray-500">
              Escolha um lead para começar a conversar
            </p>
          </div>
        </div>
      )}
        </div>
      </div>

      {/* Conversion Dialog */}
      <Dialog open={isConversionDialogOpen} onOpenChange={setIsConversionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Converter Lead em Cliente
            </DialogTitle>
            <DialogDescription>
              {selectedLead?.name} se tornou seu cliente! Selecione qual serviço foi adquirido para registrar a conversão.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Client Info Summary */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedLead?.avatar} alt={selectedLead?.name} />
                <AvatarFallback>{selectedLead?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{selectedLead?.name}, {selectedLead?.age}</h4>
                <p className="text-sm text-gray-500">{selectedLead?.location}</p>
              </div>
            </div>

            {/* Service Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Serviço Adquirido</label>
              <Select value={conversionData.serviceName} onValueChange={handleServiceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço adquirido" />
                </SelectTrigger>
                <SelectContent>
                  <div className="text-xs font-medium text-gray-500 px-2 py-1">PROGRAMAS</div>
                  {availableServices.filter(s => s.type === 'program').map((service) => (
                    <SelectItem key={service.name} value={service.name}>
                      <div className="flex justify-between items-center w-full">
                        <span>{service.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{service.value}</span>
                      </div>
                    </SelectItem>
                  ))}
                  
                  <div className="text-xs font-medium text-gray-500 px-2 py-1 mt-2">TREINO PRESENCIAL</div>
                  {availableServices.filter(s => s.type === 'personal-training').map((service) => (
                    <SelectItem key={service.name} value={service.name}>
                      <div className="flex justify-between items-center w-full">
                        <span>{service.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{service.value}</span>
                      </div>
                    </SelectItem>
                  ))}
                  
                  <div className="text-xs font-medium text-gray-500 px-2 py-1 mt-2">CONSULTORIAS</div>
                  {availableServices.filter(s => s.type === 'consultation').map((service) => (
                    <SelectItem key={service.name} value={service.name}>
                      <div className="flex justify-between items-center w-full">
                        <span>{service.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{service.value}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Details Preview */}
            {conversionData.serviceName && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    {conversionData.serviceType === 'program' && <Award className="h-4 w-4 text-green-600" />}
                    {conversionData.serviceType === 'personal-training' && <UserCheck className="h-4 w-4 text-green-600" />}
                    {conversionData.serviceType === 'consultation' && <MessageCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800">{conversionData.serviceName}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-green-700">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{conversionData.value}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{availableServices.find(s => s.name === conversionData.serviceName)?.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsConversionDialogOpen(false);
                setConversionData({ serviceType: '', serviceName: '', value: '' });
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConvertLead}
              disabled={!conversionData.serviceName}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Conversão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}