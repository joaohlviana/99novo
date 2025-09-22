import React, { useState, useCallback, useMemo } from 'react';
import { User, MapPin, Save, Target, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ClientAvatarManager } from '../common/UserAvatarManager';
import { ClientSportsSelector } from './ClientSportsSelector';
import { ClientGoalsSelector } from './ClientGoalsSelector';
import ClientLocationSection from './ClientLocationSection';
import { toast } from 'sonner@2.0.3';
import { formatPhoneNumber, validateEmail } from '../../lib/utils';

// Types (seguindo padrão do trainer)
interface ClientProfileData {
  // Dados básicos
  name: string;
  email: string;
  phone: string;
  bio?: string;
  gender?: string;
  profilePhoto?: string;
  
  // Localização
  city?: string;
  state?: string;
  
  // Fitness
  fitnessLevel?: string;
  budget?: string;
  medicalConditions?: string;
  
  // Arrays
  sportsInterest?: string[];
  sportsTrained?: string[];
  primaryGoals?: string[];
}

interface ClientProfileManagementProps {
  profileData: ClientProfileData;
  onProfileDataChange: (data: Partial<ClientProfileData>) => void;
  onSave?: () => Promise<void>;
  loading?: boolean;
  saving?: boolean;
  errors?: Record<string, string>;
}

// Validation helper (mesmo padrão do trainer)
const validateField = (field: string, value: string) => {
  switch (field) {
    case 'email':
      return validateEmail(value) ? null : 'Email inválido';
    case 'phone':
      const cleanPhone = value.replace(/\D/g, '');
      return cleanPhone.length >= 10 ? null : 'Telefone inválido';
    case 'name':
      return value.trim().length >= 2 ? null : 'Nome deve ter pelo menos 2 caracteres';
    default:
      return null;
  }
};

// Phone input component (mesmo padrão do trainer)
const PhoneInput = ({ value, onChange, error, ...props }) => {
  const handleChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhoneNumber(rawValue);
    
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formattedValue
      }
    };
    onChange(syntheticEvent);
  };

  return (
    <div className="space-y-1">
      <Input
        {...props}
        value={value}
        onChange={handleChange}
        maxLength={15}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export const ClientProfileManagement: React.FC<ClientProfileManagementProps> = ({
  profileData,
  onProfileDataChange,
  onSave,
  loading = false,
  saving = false,
  errors = {}
}) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // ✅ HANDLER ÚNICO (mesmo padrão do trainer)
  const handleFieldChange = useCallback((field: string, value: string) => {
    // Validate field
    const error = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));

    // Update data - CHAMADA DIRETA (mesmo padrão do trainer)
    onProfileDataChange({ [field]: value });
  }, [onProfileDataChange]);

  // ✅ HANDLER PARA ARRAYS (mesmo padrão do trainer)
  const handleArrayFieldChange = useCallback((field: string, values: string[]) => {
    onProfileDataChange({ [field]: values });
  }, [onProfileDataChange]);

  // Calculate completion (mesmo padrão do trainer)
  const calculateCompletion = useCallback(() => {
    const requiredFields = ['name', 'email', 'phone', 'city', 'fitnessLevel'];
    const optionalFields = ['bio', 'gender', 'sportsInterest', 'primaryGoals'];
    
    const completedRequired = requiredFields.filter(field => 
      profileData[field] && profileData[field].length > 0
    ).length;
    
    const completedOptional = optionalFields.filter(field => {
      const value = profileData[field];
      return value && (Array.isArray(value) ? value.length > 0 : value.length > 0);
    }).length;
    
    const totalWeight = requiredFields.length * 2 + optionalFields.length;
    const completedWeight = completedRequired * 2 + completedOptional;
    
    return Math.round((completedWeight / totalWeight) * 100);
  }, [profileData]);

  const completion = useMemo(() => calculateCompletion(), [calculateCompletion]);

  // Save handler (mesmo padrão do trainer)
  const handleSave = useCallback(async () => {
    if (!onSave) return;
    
    try {
      await onSave();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }, [onSave]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-200 rounded-lg h-64"></div>
            <div className="lg:col-span-2 bg-gray-200 rounded-lg h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header com Save */}
      <div className="bg-gradient-to-r from-brand to-brand-hover rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Meu Perfil</h1>
            <p className="text-white/80">Complete seu perfil para ser encontrado por treinadores</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{completion}%</div>
            <p className="text-white/80 text-sm">Completo</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mb-4 bg-white/20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        
        {/* Save Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saving && (
              <div className="flex items-center gap-2 text-sm text-white/90">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Salvando...</span>
              </div>
            )}
            {!saving && (
              <div className="flex items-center gap-2 text-sm text-white/90">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Pronto para salvar</span>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="bg-white text-brand hover:bg-white/90 font-medium"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <ClientAvatarManager
            currentAvatarUrl={profileData.profilePhoto}
            onAvatarChange={(url) => handleFieldChange('profilePhoto', url)}
            size="xl"
            variant="circle"
            showCard={true}
            allowRemove={true}
          />
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-brand" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={profileData.name || ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Seu nome completo"
                    className={fieldErrors.name || errors.name ? 'border-destructive' : ''}
                  />
                  {(fieldErrors.name || errors.name) && (
                    <p className="text-sm text-destructive">{fieldErrors.name || errors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email || ''}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    className={fieldErrors.email || errors.email ? 'border-destructive' : ''}
                  />
                  {(fieldErrors.email || errors.email) && (
                    <p className="text-sm text-destructive">{fieldErrors.email || errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <PhoneInput
                    id="phone"
                    value={profileData.phone || ''}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    error={fieldErrors.phone || errors.phone}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero</Label>
                  <Select 
                    value={profileData.gender || ''} 
                    onValueChange={(value) => handleFieldChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="nao-binario">Não-binário</SelectItem>
                      <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Sobre Você</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio || ''}
                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                  placeholder="Conte um pouco sobre você, seus objetivos e o que procura em um treinador..."
                  rows={3}
                  className="resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">
                  {(profileData.bio || '').length}/500 caracteres
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand" />
                Localização *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClientLocationSection 
                profileData={profileData}
                onProfileDataChange={onProfileDataChange}
                loading={loading}
              />
            </CardContent>
          </Card>

          {/* Sports Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-brand" />
                Interesses Esportivos *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Esportes que tenho interesse *</Label>
                <p className="text-sm text-gray-500 mb-3">Selecione pelo menos um esporte</p>
                <ClientSportsSelector
                  selectedSports={profileData.sportsInterest || []}
                  onSportsChange={(sports) => handleArrayFieldChange('sportsInterest', sports)}
                  type="interest"
                  maxSelection={6}
                />
              </div>

              <div>
                <Label>Esportes que já pratiquei</Label>
                <p className="text-sm text-gray-500 mb-3">Modalidades com experiência anterior</p>
                <ClientSportsSelector
                  selectedSports={profileData.sportsTrained || []}
                  onSportsChange={(sports) => handleArrayFieldChange('sportsTrained', sports)}
                  type="trained"
                  maxSelection={8}
                />
              </div>
            </CardContent>
          </Card>

          {/* Fitness Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand" />
                Objetivos e Nível
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Objetivos Principais *</Label>
                <p className="text-sm text-gray-500">Selecione até 3 objetivos</p>
                <ClientGoalsSelector
                  selectedGoals={profileData.primaryGoals || []}
                  onGoalsChange={(goals) => handleArrayFieldChange('primaryGoals', goals)}
                  type="primary"
                  maxSelection={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fitnessLevel">Nível de Condicionamento *</Label>
                <Select 
                  value={profileData.fitnessLevel || ''} 
                  onValueChange={(value) => handleFieldChange('fitnessLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="basico">Básico</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                    <SelectItem value="atleta">Atleta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento Mensal</Label>
                <Select 
                  value={profileData.budget || ''} 
                  onValueChange={(value) => handleFieldChange('budget', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Faixa de investimento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ate-200">Até R$ 200</SelectItem>
                    <SelectItem value="200-400">R$ 200 - R$ 400</SelectItem>
                    <SelectItem value="400-600">R$ 400 - R$ 600</SelectItem>
                    <SelectItem value="600-1000">R$ 600 - R$ 1.000</SelectItem>
                    <SelectItem value="acima-1000">Acima de R$ 1.000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Observações Médicas</Label>
                <Textarea
                  id="medicalConditions"
                  value={profileData.medicalConditions || ''}
                  onChange={(e) => handleFieldChange('medicalConditions', e.target.value)}
                  placeholder="Lesões, limitações ou condições que o treinador deve saber..."
                  rows={2}
                  className="resize-none"
                  maxLength={300}
                />
                <p className="text-xs text-gray-500">
                  Informações confidenciais para um treino seguro
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileManagement;