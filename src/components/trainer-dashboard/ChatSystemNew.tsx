import { useState, useEffect } from 'react';
import { 
  Search, 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  UserCheck,
  MapPin,
  CheckCheck,
  Info
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner@2.0.3';

// Imports do novo messages store
import { 
  useMessagesStore,
  useConversations,
  useMessages,
  useMessagesLoading,
  useMessagesErrors
} from '../../stores/messages-store';

export function ChatSystemNew() {
  // State local
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'clients'>('all');

  // Messages store
  const {
    loadConversations,
    sendMessage,
    markAsRead,
    setActiveConversation,
    activeConversation
  } = useMessagesStore();

  const conversations = useConversations();
  const messages = useMessages();
  const loading = useMessagesLoading();
  const errors = useMessagesErrors();

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Get current conversation
  const currentConversation = conversations.find(c => c.id === activeConversation);

  // Filter conversations
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.participants.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || conversation.metadata?.program?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'clients' ? conversation.metadata?.program : false;
    
    return matchesSearch && matchesTab;
  });

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;

    try {
      await sendMessage({
        conversationId: activeConversation,
        content: messageInput,
        type: 'text'
      });
      setMessageInput('');
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    
    // Mark messages as read
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation && conversation.unreadCount > 0) {
      markAsRead(conversationId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return timestamp.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (loading.conversations) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  if (errors.conversations) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar conversas</p>
          <Button onClick={() => loadConversations()}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen space-y-8">
      {/* Header */}
      <div className="space-y-2 px-4 lg:px-6">
        <h1 className="text-2xl font-semibold mt-5 mb-2">Mensagens</h1>
        <p className="text-muted-foreground">
          Gerencie suas conversas com clientes e alunos.
        </p>
      </div>

      {/* Chat Interface */}
      <div className="w-full px-4 lg:px-6">
        <div className="h-[calc(100vh-300px)] flex bg-white rounded-lg border overflow-hidden">
          
          {/* Sidebar - Lista de Conversas */}
          <div className="w-80 border-r bg-white flex flex-col">
            
            {/* Header da Sidebar */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg">Mensagens</h2>
                  {totalUnreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="bg-brand hover:bg-brand-hover text-xs h-5 min-w-5 rounded-full flex items-center justify-center px-1.5"
                    >
                      {totalUnreadCount}
                    </Badge>
                  )}
                </div>
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-4">
                <Button
                  variant={activeTab === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 rounded-full h-8 ${
                    activeTab === 'all' 
                      ? 'bg-brand hover:bg-brand-hover text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Todas
                </Button>
                <Button
                  variant={activeTab === 'clients' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('clients')}
                  className={`flex-1 rounded-full h-8 ${
                    activeTab === 'clients' 
                      ? 'bg-brand hover:bg-brand-hover text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Clientes
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

            {/* Lista de Conversas */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma conversa encontrada</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const otherParticipant = conversation.participants.find(p => p.role !== 'trainer');
                    if (!otherParticipant) return null;

                    return (
                      <div
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          activeConversation === conversation.id 
                            ? 'bg-brand/10' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
                            <AvatarFallback>{otherParticipant.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {otherParticipant.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {otherParticipant.name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessage && formatTimestamp(conversation.lastMessage.timestamp)}
                            </span>
                          </div>
                          
                          {conversation.metadata?.program && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <span>{conversation.metadata.program}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate flex-1">
                              {conversation.lastMessage?.content || 'Sem mensagens'}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <div className="w-2 h-2 bg-brand rounded-full ml-2"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Área Principal do Chat */}
          {currentConversation ? (
            <div className="flex-1 flex flex-col">
              
              {/* Header do Chat */}
              <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {(() => {
                        const otherParticipant = currentConversation.participants.find(p => p.role !== 'trainer');
                        return otherParticipant ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
                            <AvatarFallback>{otherParticipant.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        ) : null;
                      })()}
                    </div>
                    <div className="flex-1">
                      {(() => {
                        const otherParticipant = currentConversation.participants.find(p => p.role !== 'trainer');
                        return otherParticipant ? (
                          <div>
                            <h3 className="font-medium">{otherParticipant.name}</h3>
                            <p className="text-sm text-gray-500">
                              {otherParticipant.isOnline ? 'Online' : 
                                otherParticipant.lastSeen ? 
                                `Visto por último ${formatTimestamp(otherParticipant.lastSeen)}` : 
                                'Offline'
                              }
                              {currentConversation.metadata?.program && (
                                <span className="ml-2">• {currentConversation.metadata.program}</span>
                              )}
                            </p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
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
                {loading.messages ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        Nenhuma mensagem ainda. Comece a conversa!
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === 'current_user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              message.senderId === 'current_user'
                                ? 'bg-brand text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${
                              message.senderId === 'current_user' ? 'justify-end' : 'justify-start'
                            }`}>
                              <span className={`text-xs ${
                                message.senderId === 'current_user' ? 'text-white/70' : 'text-gray-500'
                              }`}>
                                {formatTimestamp(message.timestamp)}
                              </span>
                              {message.senderId === 'current_user' && (
                                <CheckCheck className={`h-3 w-3 ${
                                  message.status === 'read' ? 'text-blue-200' : 'text-white/70'
                                }`} />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input de Mensagem */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Escreva uma mensagem..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 rounded-full border-gray-200 px-4"
                    disabled={loading.sending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || loading.sending}
                    className="rounded-full w-10 h-10 p-0 bg-brand hover:bg-brand-hover"
                  >
                    {loading.sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
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
                  Escolha uma conversa para começar a conversar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}