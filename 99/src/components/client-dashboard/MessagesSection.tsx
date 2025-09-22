import { useState } from 'react';
import { 
  MessageCircle, 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical,
  Phone,
  Video,
  Star,
  MapPin,
  Circle,
  CheckCircle2,
  Clock,
  Filter,
  Archive,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { useClientMessages } from '../../hooks/useClientMessages';

type FilterType = 'all' | 'unread' | 'trainers' | 'waiting';

export function MessagesSection() {
  // ✅ USAR EXCLUSIVAMENTE DADOS DO SUPABASE - NUNCA MOCK DATA
  const {
    conversations,
    messages,
    selectedConversation: selectedConversationData,
    selectedConversationId,
    loading,
    error,
    stats,
    sendMessage,
    selectConversation
  } = useClientMessages();
  
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredConversations = conversations
    .filter(conv => {
      if (filter === 'unread' && conv.unreadCount === 0) return false;
      if (filter === 'waiting' && conv.status !== 'waiting_response') return false;
      if (searchTerm && !conv.trainer.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      // Pinned conversations first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by last message timestamp
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Ontem';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting_response': return 'bg-yellow-100 text-yellow-800';
      case 'program_ready': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Conversa ativa';
      case 'waiting_response': return 'Aguardando resposta';
      case 'program_ready': return 'Programa pronto';
      default: return 'Conversa';
    }
  };

  return (
    <div className="p-4 md:p-6 w-full space-y-8">
      {/* Quick Stats */}
      <div className="flex gap-4 justify-end">
        <div className="text-center">
          <div className="text-lg font-bold text-[var(--brand)]">
            {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
          </div>
          <div className="text-xs text-gray-500">Não lidas</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {conversations.filter(c => c.trainer.isOnline).length}
          </div>
          <div className="text-xs text-gray-500">Online</div>
        </div>
      </div>

      <div className="w-full">
        <div className="h-[calc(100vh-300px)] flex bg-white rounded-lg border overflow-hidden">
          <div className="grid grid-cols-12 gap-0 w-full h-full">
            {/* Conversations List */}
            <div className="col-span-4 border-r bg-white flex flex-col">
              {/* Header da Sidebar */}
              <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg">Conversas</h2>
                  <div className="flex gap-2">
                    <div className="text-xs text-gray-500">
                      {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} não lidas
                    </div>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar conversas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-50 border-0 rounded-lg"
                    />
                  </div>
                  
                  <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
                    <SelectTrigger className="w-full">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as conversas</SelectItem>
                      <SelectItem value="unread">Não lidas ({conversations.filter(c => c.unreadCount > 0).length})</SelectItem>
                      <SelectItem value="waiting">Aguardando resposta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto p-2">
                {filteredConversations.length === 0 ? (
                  <Alert className="m-2">
                    <MessageCircle className="h-4 w-4" />
                    <AlertDescription>
                      {searchTerm ? 'Nenhuma conversa encontrada.' : 'Você ainda não tem conversas.'}
                    </AlertDescription>
                  </Alert>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`flex items-center gap-3 p-3 m-2 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conversation.id 
                          ? 'bg-[#e0093e]/10' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.trainer.avatar} alt={conversation.trainer.name} />
                          <AvatarFallback>
                            {conversation.trainer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.trainer.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {conversation.trainer.name}
                          </h4>
                          <span className="text-xs text-gray-500">{formatTime(conversation.lastMessage.timestamp)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <span>{conversation.trainer.specialty}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                            <span>{conversation.trainer.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate flex-1">
                            {conversation.lastMessage.content}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <div className="w-2 h-2 bg-[#e0093e] rounded-full ml-2"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-8 flex flex-col">
              {selectedConversationData ? (
                <div className="flex-1 flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedConversationData.trainer.avatar} alt={selectedConversationData.trainer.name} />
                            <AvatarFallback>
                              {selectedConversationData.trainer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {selectedConversationData.trainer.isOnline && (
                            <div className="absolute -bottom-0 -right-0 h-3 w-3 bg-green-500 border border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{selectedConversationData.trainer.name}</h3>
                          <p className="text-sm text-gray-500">
                            {selectedConversationData.trainer.specialty}
                            <span className="ml-2 text-green-600">
                              • {selectedConversationData.trainer.isOnline ? 'Online agora' : 'Offline'}
                            </span>
                          </p>
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

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromTrainer ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              message.isFromTrainer
                                ? 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                : 'bg-[#e0093e] text-white rounded-br-sm'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${
                              message.isFromTrainer ? 'justify-start' : 'justify-end'
                            }`}>
                              <span className={`text-xs ${
                                message.isFromTrainer ? 'text-gray-500' : 'text-white/70'
                              }`}>
                                {formatTime(message.timestamp)}
                              </span>
                              {!message.isFromTrainer && (
                                <>
                                  {message.status === 'sending' && <Clock className="h-3 w-3 text-white/70" />}
                                  {message.status === 'delivered' && <CheckCircle2 className="h-3 w-3 text-white/70" />}
                                  {message.status === 'read' && <CheckCircle2 className="h-3 w-3 text-blue-200" />}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Escreva uma mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1 rounded-full border-gray-200 px-4"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="rounded-full w-10 h-10 p-0 bg-[#e0093e] hover:bg-[#c40835]"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecione uma conversa
                    </h3>
                    <p className="text-gray-500">
                      Escolha um treinador para começar a conversar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}