/**
 * 🎯 TRAINER AVATAR MANAGER
 * 
 * Componente especializado para upload de avatar de treinador
 * com persistência real via useSaveTrainerAvatar hook
 */

import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { SimpleAvatarUpload } from '../ui/simple-avatar-upload';
import { useSaveTrainerAvatar } from '../../hooks/useSaveTrainerAvatar';

interface TrainerAvatarManagerProps {
  userId: string;
  currentAvatarUrl?: string | null;
  onProfileDataChange?: (data: any) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// 5) Componente de upload não pode ser só local
export const TrainerAvatarManager: React.FC<TrainerAvatarManagerProps> = ({
  userId,
  currentAvatarUrl,
  onProfileDataChange,
  size = 'lg',
  className = ''
}) => {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const { mutateAsync: doSave, isPending } = useSaveTrainerAvatar();

  // Obter userId do contexto de auth se não foi fornecido
  const [currentUserId, setCurrentUserId] = React.useState(userId);
  
  React.useEffect(() => {
    if (!userId) {
      // Obter userId do Supabase auth
      import('../../lib/supabase').then(({ supabase }) => {
        supabase.auth.getUser().then(({ data: { user }, error }) => {
          if (user && !error) {
            console.log('🔐 userId obtido via auth:', user.id);
            setCurrentUserId(user.id);
          } else {
            console.error('❌ Erro ao obter usuário:', error);
          }
        });
      }).catch(error => {
        console.error('❌ Erro ao importar supabase:', error);
      });
    } else {
      console.log('✅ userId fornecido via props:', userId);
    }
  }, [userId]);

  // ✅ Persistir via hook e atualizar estado
  async function onAvatarChange(file: File) {
    // Se file está vazio, significa remoção
    if (!file.name) {
      setPreview(null);
      if (onProfileDataChange) {
        onProfileDataChange({ profilePhoto: null });
      }
      return;
    }

    // Validar se temos um userId válido
    const finalUserId = currentUserId || userId;
    if (!finalUserId || finalUserId === 'current-user') {
      console.error('❌ userId inválido para upload:', finalUserId);
      return;
    }

    // Validar formato UUID
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(finalUserId)) {
      console.error('❌ userId não é um UUID válido:', finalUserId);
      return;
    }

    setPreview(URL.createObjectURL(file));      // feedback instantâneo
    
    try {
      console.log('📤 Iniciando upload com userId válido:', finalUserId);
      const updated = await doSave({ userId: finalUserId, file }); // persistência real
      setPreview(updated.profilePhoto || updated.avatar); // usar profilePhoto primeiro
      
      // Sincronização visual opcional (se o pai precisa)
      if (onProfileDataChange) {
        onProfileDataChange({
          profilePhoto: updated.profilePhoto || updated.avatar
        });
      }
    } catch (error) {
      console.error('❌ Falha ao salvar avatar:', error);
      setPreview(currentAvatarUrl || null); // volta para o anterior
    }
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <SimpleAvatarUpload
        currentAvatarUrl={preview}
        onAvatarChange={onAvatarChange}
        size={size}
        isLoading={isPending}
        allowRemove={false}
        label="Foto do Perfil"
        description="Clique para alterar sua foto"
      />

      {/* Empty State - só aparece se realmente não tem avatar */}
      {!preview && !isPending && (
        <div className="text-center py-6 px-4 max-w-sm">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Camera className="h-6 w-6 text-gray-400" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            Adicione sua foto
          </h4>
          <p className="text-xs text-gray-500">
            Uma boa foto ajuda clientes a te encontrarem
          </p>
        </div>
      )}
    </div>
  );
};