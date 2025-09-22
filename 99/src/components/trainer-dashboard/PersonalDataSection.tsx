import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TrainerAvatarManager } from '../trainer/TrainerAvatarManager';
import { formatPhoneNumber, formatInstagramUrl, validateEmail, validateInstagramUrl } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';



// Empty State Component
const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
    <Icon className="h-8 w-8 mx-auto mb-3 text-muted-foreground/60" />
    <h4 className="font-medium mb-1">{title}</h4>
    <p className="text-sm text-muted-foreground/80">{description}</p>
  </div>
);

// Validation helpers
const validateField = (field: string, value: string) => {
  switch (field) {
    case 'email':
      return validateEmail(value) ? null : 'Email inválido';
    case 'instagram':
      return validateInstagramUrl(value) ? null : 'URL do Instagram inválida';
    case 'phone':
      const cleanPhone = value.replace(/\D/g, '');
      return cleanPhone.length >= 10 ? null : 'Telefone inválido';
    default:
      return null;
  }
};

// Componente de Input com máscara de telefone
const PhoneInput = ({ value, onChange, error, ...props }) => {
  const handleChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhoneNumber(rawValue);
    
    // Chama o onChange com o valor formatado
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

// Componente de Input para Instagram
const InstagramInput = ({ value, onChange, error, ...props }) => {
  const handleChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatInstagramUrl(rawValue);
    
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
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};



interface PersonalDataSectionProps {
  profileData: {
    user_id?: string;
    profilePhoto: string;
    name: string;
    title: string;
    bio: string;
    phone: string;
    email: string;
    instagram: string;
    youtube: string;
    experienceYears: string;
    responseTime: string;
    studentsCount: string;
  };
  onProfileDataChange: (data: any) => void;
  errors?: Record<string, string>;
  loading?: boolean;
}

const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({ 
  profileData, 
  onProfileDataChange, 
  errors = {}, 
  loading = false 
}) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  
  // Obter userId válido
  const validUserId = profileData.user_id || user?.id;

  const handleFieldChange = (field: string, value: string) => {
    // Validate field
    const error = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));

    // Update data
    onProfileDataChange({ [field]: value });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-32 h-32 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardContent className="p-6 space-y-4">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-9 w-full bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Foto */}
      <div className="lg:col-span-1">
        {validUserId ? (
          <TrainerAvatarManager
            userId={validUserId}
            currentAvatarUrl={profileData.profilePhoto}
            onProfileDataChange={onProfileDataChange}
            size="lg"
            className="bg-white rounded-xl border border-gray-200 p-6"
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-3 flex items-center justify-center">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Aguardando autenticação...</p>
          </div>
        )}
      </div>

      {/* Dados Pessoais */}
      <Card className="lg:col-span-3">
        <CardContent className="p-6 space-y-6">
          <h3 className="font-semibold">Dados Pessoais</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input 
                id="name"
                value={profileData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Seu nome completo"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título Profissional</Label>
              <Input 
                id="title"
                value={profileData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Ex: Personal Trainer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia *</Label>
            <Textarea 
              id="bio"
              value={profileData.bio}
              rows={3}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              className={`resize-none ${errors.bio ? 'border-destructive' : ''}`}
              placeholder="Conte um pouco sobre você e sua experiência profissional..."
            />
            {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
            <p className="text-xs text-muted-foreground">
              {profileData.bio?.length || 0}/500 caracteres
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <PhoneInput 
                id="phone"
                value={profileData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                error={fieldErrors.phone || errors.phone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input 
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="seu@email.com"
                className={fieldErrors.email || errors.email ? 'border-destructive' : ''}
                disabled // Email usually comes from auth
              />
              {(fieldErrors.email || errors.email) && (
                <p className="text-sm text-destructive">{fieldErrors.email || errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <InstagramInput 
                id="instagram"
                value={profileData.instagram}
                onChange={(e) => handleFieldChange('instagram', e.target.value)}
                placeholder="@seuusuario ou URL completa"
                error={fieldErrors.instagram || errors.instagram}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input 
                id="youtube"
                value={profileData.youtube}
                onChange={(e) => handleFieldChange('youtube', e.target.value)}
                placeholder="Canal do YouTube"
              />
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Experiência Profissional */}
      <Card className="lg:col-span-4">
        <CardContent className="p-6 space-y-6">
          <h3 className="font-semibold">Experiência Profissional</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experienceYears">Anos de Experiência *</Label>
              <Select 
                value={profileData.experienceYears || ""} 
                onValueChange={(value) => {
                  console.log('💼 ExperienceYears changed to:', value);
                  onProfileDataChange({ experienceYears: value });
                }}
              >
                <SelectTrigger 
                  id="experienceYears"
                  className={errors.experienceYears ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder="Selecione os anos de experiência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="menos-1">Menos de 1 ano</SelectItem>
                  <SelectItem value="1-2">1 a 2 anos</SelectItem>
                  <SelectItem value="3-5">3 a 5 anos</SelectItem>
                  <SelectItem value="6-10">6 a 10 anos</SelectItem>
                  <SelectItem value="mais-10">Mais de 10 anos</SelectItem>
                </SelectContent>
              </Select>
              {errors.experienceYears && (
                <p className="text-sm text-destructive">{errors.experienceYears}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responseTime">Tempo de Resposta</Label>
              <Select 
                value={profileData.responseTime} 
                onValueChange={(value) => onProfileDataChange({ responseTime: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="imediato">Até 30 min</SelectItem>
                  <SelectItem value="1-hora">Até 1 hora</SelectItem>
                  <SelectItem value="2-horas">Até 2 horas</SelectItem>
                  <SelectItem value="4-horas">Até 4 horas</SelectItem>
                  <SelectItem value="12-horas">Até 12 horas</SelectItem>
                  <SelectItem value="24-horas">Até 24 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentsCount">Alunos Atendidos</Label>
              <Select 
                value={profileData.studentsCount} 
                onValueChange={(value) => onProfileDataChange({ studentsCount: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciante">0-5 alunos</SelectItem>
                  <SelectItem value="poucos">5-20 alunos</SelectItem>
                  <SelectItem value="moderado">20-50 alunos</SelectItem>
                  <SelectItem value="experiente">50-100 alunos</SelectItem>
                  <SelectItem value="muito-experiente">100-200 alunos</SelectItem>
                  <SelectItem value="expert">200+ alunos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Empty State para experiência profissional */}
          {!profileData.experienceYears && !profileData.responseTime && !profileData.studentsCount && (
            <EmptyState
              icon={User}
              title="Experiência profissional não preenchida"
              description="Selecione suas informações profissionais para completar seu perfil"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalDataSection;