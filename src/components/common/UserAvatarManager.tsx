import React from 'react';
import { AvatarUpload } from '../ui/avatar-upload';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { User, Camera } from 'lucide-react';
// ✅ Import the new trainer avatar manager with real persistence
import { TrainerAvatarManager as TrainerAvatarManagerPersistent } from '../trainer/TrainerAvatarManager';

interface UserAvatarManagerProps {
  currentAvatarUrl?: string;
  onAvatarChange: (url: string) => void;
  userType?: 'trainer' | 'client';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square';
  showCard?: boolean;
  allowRemove?: boolean;
  className?: string;
}

export const UserAvatarManager: React.FC<UserAvatarManagerProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  userType = 'trainer',
  size = 'lg',
  variant = 'circle',
  showCard = true,
  allowRemove = true,
  className
}) => {
  const getBucketName = () => {
    // Use the avatars bucket with correct RLS policies
    return 'avatars';
  };

  const getLabels = () => {
    const labels = {
      trainer: {
        title: 'Foto do Perfil',
        description: 'Esta foto será exibida no seu perfil público',
        emptyTitle: 'Adicione sua foto profissional',
        emptyDescription: 'Uma boa foto aumenta a confiança dos clientes'
      },
      client: {
        title: 'Sua Foto',
        description: 'Esta foto será exibida para os treinadores',
        emptyTitle: 'Adicione sua foto',
        emptyDescription: 'Ajude os treinadores a te conhecer melhor'
      }
    };
    return labels[userType];
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

      {/* Empty State - só aparece se realmente não tem avatar */}
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
    </div>
  );

  if (!showCard) {
    return AvatarComponent;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-brand" />
          {labels.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {AvatarComponent}
      </CardContent>
    </Card>
  );
};

// Specific components for trainer and client
// ✅ Use the new component for trainers (with real persistence)
export const TrainerAvatarManager: React.FC<{
  userId: string;
  currentAvatarUrl?: string | null;
  onAvatarChange?: (url: string) => void; // deprecated
  onProfileDataChange?: (data: any) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ userId, currentAvatarUrl, onAvatarChange, onProfileDataChange, size, className }) => {
  // Se tem onAvatarChange (callback antigo), avisar que é obsoleto
  if (onAvatarChange) {
    console.warn('⚠️ TrainerAvatarManager: onAvatarChange obsoleto, usando persistência automática');
  }
  
  return (
    <TrainerAvatarManagerPersistent 
      userId={userId}
      currentAvatarUrl={currentAvatarUrl}
      onProfileDataChange={onProfileDataChange}
      size={size}
      className={className}
    />
  );
};

export const ClientAvatarManager: React.FC<Omit<UserAvatarManagerProps, 'userType'>> = (props) => (
  <UserAvatarManager {...props} userType="client" />
);

export default UserAvatarManager;