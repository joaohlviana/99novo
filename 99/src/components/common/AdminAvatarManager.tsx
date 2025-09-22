import React from 'react';
import { AvatarUpload } from '../ui/avatar-upload';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Shield, Camera } from 'lucide-react';

interface AdminAvatarManagerProps {
  currentAvatarUrl?: string;
  onAvatarChange: (url: string) => void;
  userId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square';
  showCard?: boolean;
  allowRemove?: boolean;
  className?: string;
  isEditingOtherUser?: boolean;
}

export const AdminAvatarManager: React.FC<AdminAvatarManagerProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  userId,
  size = 'lg',
  variant = 'circle',
  showCard = true,
  allowRemove = true,
  className,
  isEditingOtherUser = false
}) => {
  const getBucketName = () => {
    return 'admin-avatars';
  };

  const getLabels = () => {
    if (isEditingOtherUser) {
      return {
        title: 'Avatar do Usuário',
        description: 'Alterar foto de perfil do usuário',
        emptyTitle: 'Usuário sem foto',
        emptyDescription: 'Adicione uma foto para este usuário'
      };
    }
    
    return {
      title: 'Foto do Admin',
      description: 'Sua foto como administrador',
      emptyTitle: 'Adicione sua foto administrativa',
      emptyDescription: 'Uma foto profissional para o painel admin'
    };
  };

  const labels = getLabels();

  const AvatarComponent = (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <AvatarUpload
        currentAvatarUrl={currentAvatarUrl}
        onAvatarChange={onAvatarChange}
        size={size}
        variant={variant}
        bucketName={getBucketName()}
        allowRemove={allowRemove}
        label={labels.title}
        description={labels.description}
      />

      {/* Empty State */}
      {!currentAvatarUrl && (
        <div className="text-center py-6 px-4 max-w-sm">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Camera className="h-6 w-6 text-gray-400" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            {labels.emptyTitle}
          </h4>
          <p className="text-xs text-gray-500">
            {labels.emptyDescription}
          </p>
        </div>
      )}
      
      {isEditingOtherUser && (
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-md">
          <Shield className="h-4 w-4 text-amber-600" />
          <span className="text-xs text-amber-700">Editando como admin</span>
        </div>
      )}
    </div>
  );

  if (!showCard) {
    return AvatarComponent;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-brand" />
          {labels.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {AvatarComponent}
      </CardContent>
    </Card>
  );
};

export default AdminAvatarManager;