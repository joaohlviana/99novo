import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserAvatarManager, TrainerAvatarManager, ClientAvatarManager } from '../common/UserAvatarManager';
import { Button } from '../ui/button';
import { User, Camera, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Exemplo completo de uso do sistema de avatar atualizado
export const AvatarUploadExample: React.FC = () => {
  const [trainerAvatar, setTrainerAvatar] = useState<string>('');
  const [clientAvatar, setClientAvatar] = useState<string>('');
  const [genericAvatar, setGenericAvatar] = useState<string>('');

  const handleAvatarChange = (type: string) => (url: string) => {
    toast.success(`Avatar ${type} atualizado com sucesso!`);
    console.log(`${type} avatar URL:`, url);
  };

  const resetAvatars = () => {
    setTrainerAvatar('');
    setClientAvatar('');
    setGenericAvatar('');
    toast.info('Avatares resetados');
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Sistema de Avatar - React Easy Crop + Supabase
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Sistema completo de upload de avatar com cropping profissional, 
          buckets privados seguros e políticas RLS rigorosas.
        </p>
        
        <div className="flex items-center justify-center gap-4 text-sm text-green-600">
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4" />
            react-easy-crop
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4" />
            Buckets privados
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4" />
            Signed URLs
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4" />
            Políticas RLS
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Trainer Avatar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-brand" />
              Treinador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrainerAvatarManager
              currentAvatarUrl={trainerAvatar}
              onAvatarChange={(url) => {
                setTrainerAvatar(url);
                handleAvatarChange('treinador')(url);
              }}
              size="xl"
              variant="circle"
              showCard={false}
              allowRemove={true}
              className="w-full"
            />
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Bucket:</strong> make-e547215c-avatars
              </p>
              <p className="text-sm text-gray-600">
                <strong>Formato:</strong> Circular, 400x400px
              </p>
              <p className="text-sm text-gray-600">
                <strong>Segurança:</strong> Bucket privado + Signed URL
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Client Avatar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClientAvatarManager
              currentAvatarUrl={clientAvatar}
              onAvatarChange={(url) => {
                setClientAvatar(url);
                handleAvatarChange('cliente')(url);
              }}
              size="xl"
              variant="circle"
              showCard={false}
              allowRemove={true}
              className="w-full"
            />
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Cropping:</strong> react-easy-crop
              </p>
              <p className="text-sm text-gray-600">
                <strong>Controles:</strong> Zoom + Pan
              </p>
              <p className="text-sm text-gray-600">
                <strong>Formatos:</strong> JPEG, PNG, WebP
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Generic User Avatar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Usuário Genérico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserAvatarManager
              currentAvatarUrl={genericAvatar}
              onAvatarChange={(url) => {
                setGenericAvatar(url);
                handleAvatarChange('usuário')(url);
              }}
              userType="client"
              size="xl"
              variant="square"
              showCard={false}
              allowRemove={true}
              className="w-full"
            />
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Variante:</strong> Quadrado
              </p>
              <p className="text-sm text-gray-600">
                <strong>Validação:</strong> 10MB máximo
              </p>
              <p className="text-sm text-gray-600">
                <strong>Auto-cleanup:</strong> Máximo 3 por usuário
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funcionalidades */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Interface & UX</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Drag & drop de arquivos</li>
                <li>✅ Cropping com react-easy-crop</li>
                <li>✅ Controle de zoom suave</li>
                <li>✅ Preview em tempo real</li>
                <li>✅ Estados de loading visuais</li>
                <li>✅ Feedback toast integrado</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Segurança & Performance</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>🔒 Buckets privados com RLS</li>
                <li>🔒 URLs assinadas (1 ano)</li>
                <li>🔒 Validação rigorosa de MIME</li>
                <li>⚡ Cache otimizado (3600s)</li>
                <li>🧹 Limpeza automática de arquivos</li>
                <li>🚫 Proteção contra overwrite</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button 
          variant="outline" 
          onClick={resetAvatars}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Reset Avatares
        </Button>
        
        <Button 
          className="bg-brand hover:bg-brand-hover text-white"
          onClick={() => {
            toast.success('Sistema funcionando perfeitamente!');
          }}
        >
          Testar Sistema
        </Button>
      </div>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle>Exemplo de Código</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`// Uso básico do sistema atualizado
import { TrainerAvatarManager } from './components/common/UserAvatarManager';

function TrainerProfile() {
  const [avatar, setAvatar] = useState('');
  
  return (
    <TrainerAvatarManager
      currentAvatarUrl={avatar}
      onAvatarChange={setAvatar}
      size="xl"
      variant="circle"
      showCard={true}
      allowRemove={true}
    />
  );
}`}
          </pre>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Requisitos de Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-blue-800">
            <p><strong>1. Instalar dependência:</strong></p>
            <code className="bg-blue-100 px-2 py-1 rounded">npm install react-easy-crop</code>
          </div>
          
          <div className="text-sm text-blue-800">
            <p><strong>2. Executar SQL setup:</strong></p>
            <code className="bg-blue-100 px-2 py-1 rounded">
              Execute /scripts/setup-avatar-buckets.sql no Supabase
            </code>
          </div>
          
          <div className="text-sm text-blue-800">
            <p><strong>3. Verificar buckets:</strong></p>
            <code className="bg-blue-100 px-2 py-1 rounded">
              make-e547215c-avatars, make-e547215c-trainer-assets, make-e547215c-documents
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarUploadExample;