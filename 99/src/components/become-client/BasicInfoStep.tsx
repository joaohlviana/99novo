import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { User, Mail, Phone, Calendar, Users } from 'lucide-react';
import { ClientFormData } from '../BecomeClient';

interface BasicInfoStepProps {
  formData: ClientFormData;
  updateFormData: (data: Partial<ClientFormData>) => void;
}

export function BasicInfoStep({ formData, updateFormData }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-medium text-foreground">Informações Básicas</h2>
        <p className="text-muted-foreground">Conte um pouco sobre você</p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Nome *
            </Label>
            <Input
              id="firstName"
              placeholder="Seu primeiro nome"
              value={formData.firstName}
              onChange={(e) => updateFormData({ firstName: e.target.value })}
              className="h-11"
            />
          </div>

          {/* Sobrenome */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Sobrenome *
            </Label>
            <Input
              id="lastName"
              placeholder="Seu sobrenome"
              value={formData.lastName}
              onChange={(e) => updateFormData({ lastName: e.target.value })}
              className="h-11"
            />
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className="h-11"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Telefone *
            </Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              className="h-11"
            />
          </div>

          {/* Data de Nascimento */}
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Data de Nascimento *
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => updateFormData({ birthDate: e.target.value })}
              className="h-11"
            />
          </div>

          {/* Gênero */}
          <div className="space-y-2">
            <Label htmlFor="gender" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Gênero *
            </Label>
            <Select value={formData.gender} onValueChange={(value) => updateFormData({ gender: value })}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione seu gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
                <SelectItem value="nao-informar">Prefiro não informar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">🔒 Proteção de Dados</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Suas informações pessoais são protegidas e criptografadas</li>
            <li>• Usamos seus dados apenas para conectá-lo com treinadores adequados</li>
            <li>• Você pode atualizar ou excluir suas informações a qualquer momento</li>
          </ul>
        </div>
      </div>
    </div>
  );
}