import { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Palette, 
  Lock, 
  Globe, 
  Smartphone, 
  Mail, 
  MessageCircle,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  LogOut,
  Trash2,
  Download,
  Upload,
  Settings,
  Key,
  Wifi,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';

interface SettingsFormData {
  // Account Settings
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  website: string;
  
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  newMessageSound: boolean;
  newLeadSound: boolean;
  
  // Privacy Settings
  profileVisibility: 'public' | 'private' | 'clients-only';
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowDirectMessages: boolean;
  
  // Appearance Settings
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
  timezone: string;
  
  // Security Settings
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
}

export function SettingsManagement() {
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState<SettingsFormData>({
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao.silva@99coach.com',
    phone: '+55 11 99999-9999',
    bio: 'Personal trainer especializado em transformação corporal com mais de 8 anos de experiência.',
    website: 'https://joaosilva.coach',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    newMessageSound: true,
    newLeadSound: true,
    profileVisibility: 'public',
    showOnlineStatus: true,
    showLastSeen: true,
    allowDirectMessages: true,
    theme: 'light',
    language: 'pt',
    timezone: 'America/Sao_Paulo',
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom scroll function that considers the sticky menu offset
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - 70; // 70px offset for sticky menu

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Intersection Observer to update active section based on scroll position
  useEffect(() => {
    const sections = ['account', 'notifications', 'privacy', 'payments', 'appearance', 'security'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      { 
        threshold: 0.3,
        rootMargin: '-20% 0px -70% 0px'
      }
    );

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (field: keyof SettingsFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (section: string) => {
    toast.success(`${section} atualizadas!`, {
      description: 'Suas configurações foram salvas com sucesso.',
      duration: 3000
    });
  };

  const handleDeleteAccount = () => {
    setIsDeleting(true);
    // Simulate deletion process
    setTimeout(() => {
      toast.error('Conta excluída!', {
        description: 'Sua conta foi permanentemente excluída.',
        duration: 5000
      });
      setIsDeleting(false);
    }, 2000);
  };

  const handleExportData = () => {
    toast.success('Dados exportados!', {
      description: 'Um arquivo com seus dados será enviado por email.',
      duration: 3000
    });
  };

  const handleEnable2FA = () => {
    handleInputChange('twoFactorEnabled', !formData.twoFactorEnabled);
    toast.success(
      formData.twoFactorEnabled ? 'Autenticação de dois fatores desativada!' : 'Autenticação de dois fatores ativada!',
      {
        description: formData.twoFactorEnabled 
          ? 'Sua conta agora usa apenas senha para login.' 
          : 'Sua conta agora está mais segura com 2FA.',
        duration: 3000
      }
    );
  };

  return (
    <div className="w-full min-h-screen space-y-8">
      {/* Header Section */}
      <div className="space-y-2 px-4 lg:px-6">
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      {/* Layout Responsivo Full-Width */}
      <div className="w-full px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Mobile: Horizontal scroll, Desktop: Vertical fixo */}
          <div className="w-full lg:w-64 lg:flex-shrink-0 lg:relative">
            {/* Mobile: Menu horizontal com scroll */}
            <div className="lg:hidden mb-6">
              <div className="overflow-x-auto">
                <nav className="flex gap-1 pb-2 min-w-max">
                  <button
                    onClick={() => {
                      setActiveTab('account');
                      scrollToSection('account');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-colors whitespace-nowrap ${
                      activeTab === 'account' 
                        ? 'bg-muted text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <User className="h-4 w-4 flex-shrink-0" />
                    Conta
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      scrollToSection('notifications');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-colors whitespace-nowrap ${
                      activeTab === 'notifications' 
                        ? 'bg-muted text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Bell className="h-4 w-4 flex-shrink-0" />
                    Notificações
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab('privacy');
                      scrollToSection('privacy');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-colors whitespace-nowrap ${
                      activeTab === 'privacy' 
                        ? 'bg-muted text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    Privacidade
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab('payments');
                      scrollToSection('payments');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-colors whitespace-nowrap ${
                      activeTab === 'payments' 
                        ? 'bg-muted text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <CreditCard className="h-4 w-4 flex-shrink-0" />
                    Pagamentos
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab('appearance');
                      scrollToSection('appearance');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-colors whitespace-nowrap ${
                      activeTab === 'appearance' 
                        ? 'bg-muted text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Palette className="h-4 w-4 flex-shrink-0" />
                    Aparência
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab('security');
                      scrollToSection('security');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-colors whitespace-nowrap ${
                      activeTab === 'security' 
                        ? 'bg-muted text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Lock className="h-4 w-4 flex-shrink-0" />
                    Segurança
                  </button>
                </nav>
              </div>
            </div>

            {/* Desktop: Sidebar vertical fixo */}
            <div className="hidden lg:block">
              <div 
                className="bg-white rounded-lg border p-4 max-h-[calc(100vh-120px)] overflow-y-auto shadow-sm"
                style={{ 
                  position: 'sticky', 
                  top: '70px',
                  zIndex: 10
                }}
              >
                <nav className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('account');
                      scrollToSection('account');
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors text-left ${
                      activeTab === 'account' 
                        ? 'bg-muted text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <User className="h-4 w-4 mr-3 flex-shrink-0" />
                    Conta
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      scrollToSection('notifications');
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors text-left ${
                      activeTab === 'notifications' 
                        ? 'bg-muted text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Bell className="h-4 w-4 mr-3 flex-shrink-0" />
                    Notificações
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab('privacy');
                      scrollToSection('privacy');
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors text-left ${
                      activeTab === 'privacy' 
                        ? 'bg-muted text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Shield className="h-4 w-4 mr-3 flex-shrink-0" />
                    Privacidade
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab('payments');
                      scrollToSection('payments');
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors text-left ${
                      activeTab === 'payments' 
                        ? 'bg-muted text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <CreditCard className="h-4 w-4 mr-3 flex-shrink-0" />
                    Pagamentos
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab('appearance');
                      scrollToSection('appearance');
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors text-left ${
                      activeTab === 'appearance' 
                        ? 'bg-muted text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Palette className="h-4 w-4 mr-3 flex-shrink-0" />
                    Aparência
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab('security');
                      scrollToSection('security');
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors text-left ${
                      activeTab === 'security' 
                        ? 'bg-muted text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Lock className="h-4 w-4 mr-3 flex-shrink-0" />
                    Segurança
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Área de Conteúdo Principal - Agora ocupa toda largura disponível */}
          <div className="w-full lg:flex-1 space-y-8">
          {/* Account Settings */}
          <section className="space-y-6" id="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" alt="João Silva" />
                    <AvatarFallback className="text-xl">JS</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Alterar Foto
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Recomendamos uma imagem quadrada de pelo menos 200x200px
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://seusite.com"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    className="min-h-24"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.bio.length}/500 caracteres
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('Informações da conta')} className="bg-[#e0093e] hover:bg-[#c40835]">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Notifications Settings */}
          <section className="space-y-6" id="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Preferências de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="space-y-4">
                  <h4 className="font-medium">Notificações por Email</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Notificações gerais</Label>
                        <p className="text-sm text-muted-foreground">Receba emails sobre atividades importantes</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={formData.emailNotifications}
                        onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketingEmails">Emails de marketing</Label>
                        <p className="text-sm text-muted-foreground">Dicas, novidades e promoções</p>
                      </div>
                      <Switch
                        id="marketingEmails"
                        checked={formData.marketingEmails}
                        onCheckedChange={(checked) => handleInputChange('marketingEmails', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Push Notifications */}
                <div className="space-y-4">
                  <h4 className="font-medium">Notificações Push</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pushNotifications">Notificações push</Label>
                        <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={formData.pushNotifications}
                        onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsNotifications">SMS</Label>
                        <p className="text-sm text-muted-foreground">Notificações por mensagem de texto</p>
                      </div>
                      <Switch
                        id="smsNotifications"
                        checked={formData.smsNotifications}
                        onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sound Notifications */}
                <div className="space-y-4">
                  <h4 className="font-medium">Sons de Notificação</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="newMessageSound">Som de nova mensagem</Label>
                        <p className="text-sm text-muted-foreground">Toque quando receber mensagens</p>
                      </div>
                      <Switch
                        id="newMessageSound"
                        checked={formData.newMessageSound}
                        onCheckedChange={(checked) => handleInputChange('newMessageSound', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="newLeadSound">Som de novo lead</Label>
                        <p className="text-sm text-muted-foreground">Toque quando receber novos leads</p>
                      </div>
                      <Switch
                        id="newLeadSound"
                        checked={formData.newLeadSound}
                        onCheckedChange={(checked) => handleInputChange('newLeadSound', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('Notificações')} className="bg-[#e0093e] hover:bg-[#c40835]">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Preferências
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Privacy Settings */}
          <section className="space-y-6" id="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configurações de Privacidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profileVisibility">Visibilidade do Perfil</Label>
                    <Select 
                      value={formData.profileVisibility} 
                      onValueChange={(value: 'public' | 'private' | 'clients-only') => handleInputChange('profileVisibility', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <div>
                              <div>Público</div>
                              <div className="text-xs text-muted-foreground">Visível para todos</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="clients-only">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <div>
                              <div>Apenas Clientes</div>
                              <div className="text-xs text-muted-foreground">Visível apenas para seus clientes</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <div>
                              <div>Privado</div>
                              <div className="text-xs text-muted-foreground">Não visível na busca</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showOnlineStatus">Status online</Label>
                        <p className="text-sm text-muted-foreground">Mostrar quando você está online</p>
                      </div>
                      <Switch
                        id="showOnlineStatus"
                        checked={formData.showOnlineStatus}
                        onCheckedChange={(checked) => handleInputChange('showOnlineStatus', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showLastSeen">Última visualização</Label>
                        <p className="text-sm text-muted-foreground">Mostrar quando foi visto pela última vez</p>
                      </div>
                      <Switch
                        id="showLastSeen"
                        checked={formData.showLastSeen}
                        onCheckedChange={(checked) => handleInputChange('showLastSeen', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allowDirectMessages">Mensagens diretas</Label>
                        <p className="text-sm text-muted-foreground">Permitir que qualquer pessoa envie mensagens</p>
                      </div>
                      <Switch
                        id="allowDirectMessages"
                        checked={formData.allowDirectMessages}
                        onCheckedChange={(checked) => handleInputChange('allowDirectMessages', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('Privacidade')} className="bg-[#e0093e] hover:bg-[#c40835]">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Privacidade
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exportar Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Baixe uma cópia de todos os seus dados da plataforma.
                </p>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Solicitar Exportação
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Payments Settings */}
          <section className="space-y-6" id="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Métodos de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Methods */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-semibold">
                      VISA
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expira em 12/26</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Principal</Badge>
                    <Button variant="ghost" size="sm">Editar</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-semibold">
                      MC
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 8888</p>
                      <p className="text-sm text-muted-foreground">Expira em 08/25</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">Editar</Button>
                    <Button variant="ghost" size="sm" className="text-destructive">Remover</Button>
                  </div>
                </div>
              </div>

              <Button variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Adicionar Cartão
              </Button>

              <Separator />

              {/* Billing Address */}
              <div className="space-y-4">
                <h4 className="font-medium">Endereço de Cobrança</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Endereço" />
                  <Input placeholder="Cidade" />
                  <Input placeholder="CEP" />
                  <Input placeholder="Estado" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Pagamentos')} className="bg-[#e0093e] hover:bg-[#c40835]">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Pagamentos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Plano Pro - Janeiro 2024</p>
                    <p className="text-sm text-muted-foreground">15/01/2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ 97,00</p>
                    <Badge variant="secondary" className="text-xs">Pago</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Plano Pro - Dezembro 2023</p>
                    <p className="text-sm text-muted-foreground">15/12/2023</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ 97,00</p>
                    <Badge variant="secondary" className="text-xs">Pago</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </section>

          {/* Appearance Settings */}
          <section className="space-y-6" id="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="theme">Tema</Label>
                  <Select value={formData.theme} onValueChange={(value: 'light' | 'dark' | 'system') => handleInputChange('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Claro
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Escuro
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Sistema
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={formData.language} onValueChange={(value: 'pt' | 'en' | 'es') => handleInputChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">🇧🇷 Português</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="es">🇪🇸 Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">(GMT-3) São Paulo</SelectItem>
                      <SelectItem value="America/New_York">(GMT-5) New York</SelectItem>
                      <SelectItem value="Europe/London">(GMT+0) London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Aparência')} className="bg-[#e0093e] hover:bg-[#c40835]">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Aparência
                </Button>
              </div>
            </CardContent>
          </Card>
          </section>

          {/* Security Settings */}
          <section className="space-y-6" id="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Segurança da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div className="space-y-4">
                <h4 className="font-medium">Alterar Senha</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha atual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Digite sua nova senha"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirme sua nova senha"
                    />
                  </div>
                  <Button variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Alterar Senha
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Two-Factor Authentication */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                  </div>
                  <Button
                    variant={formData.twoFactorEnabled ? "destructive" : "default"}
                    onClick={handleEnable2FA}
                    className={!formData.twoFactorEnabled ? "bg-[#e0093e] hover:bg-[#c40835]" : ""}
                  >
                    {formData.twoFactorEnabled ? "Desativar 2FA" : "Ativar 2FA"}
                  </Button>
                </div>
                
                {formData.twoFactorEnabled && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Autenticação de dois fatores está ativa. Sua conta está protegida com 2FA.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator />

              {/* Session Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Configurações de Sessão</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="loginAlerts">Alertas de login</Label>
                      <p className="text-sm text-muted-foreground">Receba notificações sobre novos logins</p>
                    </div>
                    <Switch
                      id="loginAlerts"
                      checked={formData.loginAlerts}
                      onCheckedChange={(checked) => handleInputChange('loginAlerts', checked)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sessionTimeout">Timeout da sessão (minutos)</Label>
                    <Select 
                      value={formData.sessionTimeout.toString()} 
                      onValueChange={(value) => handleInputChange('sessionTimeout', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                        <SelectItem value="0">Nunca</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Segurança')} className="bg-[#e0093e] hover:bg-[#c40835]">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Segurança
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Sessões Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Chrome no Windows</p>
                      <p className="text-sm text-muted-foreground">São Paulo, Brasil • Agora</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Atual</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Mobile Safari</p>
                      <p className="text-sm text-muted-foreground">São Paulo, Brasil • Há 2 horas</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    Encerrar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Excluir Conta</h4>
                <p className="text-sm text-muted-foreground">
                  Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
                </p>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Conta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tem certeza?</DialogTitle>
                    <DialogDescription>
                      Esta ação é irreversível. Sua conta e todos os dados associados serão permanentemente excluídos.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancelar</Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}