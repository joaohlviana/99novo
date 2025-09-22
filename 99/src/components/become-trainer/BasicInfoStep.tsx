import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { User, Mail, Phone, Instagram } from 'lucide-react';
import { FormData } from '../BecomeTrainer';

interface BasicInfoStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
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
          {/* Nome Completo */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Nome Completo *
            </Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
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

          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-muted-foreground" />
              Instagram (opcional)
            </Label>
            <Input
              id="instagram"
              placeholder="@seuinstagram"
              value={formData.instagram}
              onChange={(e) => updateFormData({ instagram: e.target.value })}
              className="h-11"
            />
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-2">
          <Label htmlFor="bio" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Biografia *
          </Label>
          <Textarea
            id="bio"
            placeholder="Conte um pouco sobre você, sua experiência e metodologia. Esta será sua apresentação para os alunos."
            value={formData.bio}
            onChange={(e) => updateFormData({ bio: e.target.value })}
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Mínimo 50 caracteres. Seja autêntico e profissional.
          </p>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Dicas para um perfil atrativo:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use uma foto profissional no seu Instagram</li>
            <li>• Descreva sua especialidade de forma clara na bio</li>
            <li>• Mencione resultados que você já ajudou alunos a alcançar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}