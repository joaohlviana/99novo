import { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Mail, 
  Database,
  Users,
  FileText,
  Palette,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';

export function PlatformSettings() {
  const [settings, setSettings] = useState({
    // General Settings
    platformName: '99coach',
    platformDescription: 'Plataforma para treinadores esportivos',
    defaultLanguage: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    maintenanceMode: false,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    
    // Security
    twoFactorRequired: false,
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    
    // Payments
    commissionRate: 15,
    minimumPayout: 50,
    paymentMethods: ['credit_card', 'pix', 'boleto'],
    
    // Content Moderation
    autoModerationEnabled: true,
    requireApprovalForPrograms: true,
    requireApprovalForTrainers: true,
    contentFilterLevel: 'medium'
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Simulate API call
    toast.success('Configurações salvas com sucesso!');
  };

  const systemHealth = [
    { component: 'API Principal', status: 'healthy', uptime: '99.9%' },
    { component: 'Banco de Dados', status: 'healthy', uptime: '99.8%' },
    { component: 'Armazenamento', status: 'warning', uptime: '98.2%' },
    { component: 'CDN', status: 'healthy', uptime: '99.9%' },
    { component: 'Email Service', status: 'healthy', uptime: '99.5%' },
    { component: 'Payment Gateway', status: 'healthy', uptime: '99.7%' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Configurações da Plataforma</h1>
          <p className="text-muted-foreground">
            Gerencie configurações globais e preferências do sistema
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={handleSave} className="bg-[#e0093e] hover:bg-[#c0082e]">
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="moderation">Moderação</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configurações básicas da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platformName">Nome da Plataforma</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => handleSettingChange('platformName', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="defaultLanguage">Idioma Padrão</Label>
                  <Select 
                    value={settings.defaultLanguage} 
                    onValueChange={(value) => handleSettingChange('defaultLanguage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="platformDescription">Descrição da Plataforma</Label>
                <Textarea
                  id="platformDescription"
                  value={settings.platformDescription}
                  onChange={(e) => handleSettingChange('platformDescription', e.target.value)}
                  placeholder="Descrição que aparece em mecanismos de busca..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select 
                    value={settings.timezone} 
                    onValueChange={(value) => handleSettingChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                      <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                      <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  />
                  <Label htmlFor="maintenanceMode">Modo Manutenção</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
              <CardDescription>
                Controle como as notificações são enviadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Notificações por Email', description: 'Enviar notificações importantes por email' },
                  { key: 'pushNotifications', label: 'Notificações Push', description: 'Notificações no navegador e aplicativo' },
                  { key: 'smsNotifications', label: 'Notificações SMS', description: 'Mensagens SMS para alertas críticos' },
                  { key: 'marketingEmails', label: 'Emails Marketing', description: 'Newsletters e comunicações promocionais' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                    <Switch
                      checked={settings[item.key as keyof typeof settings] as boolean}
                      onCheckedChange={(checked) => handleSettingChange(item.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Configurações de segurança e autenticação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="passwordMinLength">Tamanho Mínimo da Senha</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxLoginAttempts">Máximo Tentativas de Login</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="twoFactorRequired"
                    checked={settings.twoFactorRequired}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorRequired', checked)}
                  />
                  <Label htmlFor="twoFactorRequired">2FA Obrigatório</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Configurações de Pagamento
              </CardTitle>
              <CardDescription>
                Taxas e configurações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commissionRate">Taxa de Comissão (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    value={settings.commissionRate}
                    onChange={(e) => handleSettingChange('commissionRate', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="minimumPayout">Saque Mínimo (R$)</Label>
                  <Input
                    id="minimumPayout"
                    type="number"
                    value={settings.minimumPayout}
                    onChange={(e) => handleSettingChange('minimumPayout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Métodos de Pagamento Habilitados</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {[
                    { key: 'credit_card', label: 'Cartão de Crédito' },
                    { key: 'debit_card', label: 'Cartão de Débito' },
                    { key: 'pix', label: 'PIX' },
                    { key: 'boleto', label: 'Boleto' },
                    { key: 'paypal', label: 'PayPal' }
                  ].map((method) => (
                    <div key={method.key} className="flex items-center space-x-2">
                      <Switch
                        id={method.key}
                        checked={settings.paymentMethods.includes(method.key)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleSettingChange('paymentMethods', [...settings.paymentMethods, method.key]);
                          } else {
                            handleSettingChange('paymentMethods', settings.paymentMethods.filter(m => m !== method.key));
                          }
                        }}
                      />
                      <Label htmlFor={method.key}>{method.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Configurações de Moderação
              </CardTitle>
              <CardDescription>
                Controles de moderação e aprovação de conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: 'autoModerationEnabled', label: 'Moderação Automática', description: 'Usar IA para detectar conteúdo inadequado' },
                  { key: 'requireApprovalForPrograms', label: 'Aprovar Programas', description: 'Programas precisam de aprovação manual' },
                  { key: 'requireApprovalForTrainers', label: 'Aprovar Treinadores', description: 'Novos treinadores precisam de aprovação' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                    <Switch
                      checked={settings[item.key as keyof typeof settings] as boolean}
                      onCheckedChange={(checked) => handleSettingChange(item.key, checked)}
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="contentFilterLevel">Nível do Filtro de Conteúdo</Label>
                <Select 
                  value={settings.contentFilterLevel} 
                  onValueChange={(value) => handleSettingChange('contentFilterLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixo - Permite quase todo conteúdo</SelectItem>
                    <SelectItem value="medium">Médio - Filtragem moderada</SelectItem>
                    <SelectItem value="high">Alto - Filtragem rigorosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Status do Sistema
              </CardTitle>
              <CardDescription>
                Monitoramento de saúde dos componentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemHealth.map((component, index) => {
                  const StatusIcon = getStatusIcon(component.status);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 ${component.status === 'healthy' ? 'text-green-600' : component.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`} />
                        <div>
                          <div className="font-medium text-sm">{component.component}</div>
                          <div className="text-xs text-muted-foreground">Uptime: {component.uptime}</div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(component.status)}>
                        {component.status === 'healthy' ? 'OK' : component.status === 'warning' ? 'Alerta' : 'Erro'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações do Sistema</CardTitle>
              <CardDescription>
                Operações administrativas críticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <Database className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Backup do Banco</div>
                    <div className="text-sm text-muted-foreground">Criar backup manual</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <RefreshCw className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Limpar Cache</div>
                    <div className="text-sm text-muted-foreground">Limpar cache global</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <FileText className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Logs do Sistema</div>
                    <div className="text-sm text-muted-foreground">Ver logs recentes</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <Mail className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Teste de Email</div>
                    <div className="text-sm text-muted-foreground">Testar sistema de email</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}