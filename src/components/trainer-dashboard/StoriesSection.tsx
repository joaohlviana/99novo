import React, { useState } from 'react';
import { Plus, X, Camera, Upload } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

// TODO: Implementar integração real com Supabase para Stories
// Por enquanto, versão simplificada para evitar timeout

// Versão simplificada para evitar timeout - TODO: Implementar upload real
const StoryModal = ({ isOpen, onClose, story, onSave }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            Stories em Desenvolvimento
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center py-6">
          <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">
            A funcionalidade de Stories será implementada em breve!
          </p>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

interface StoriesSectionProps {
  profileData: {
    stories?: Array<{
      id: string;
      title: string;
      description: string;
      media: Array<{ id: string; type: 'image' | 'video'; url: string }>;
      isActive: boolean;
    }>;
  };
  onProfileDataChange: (data: any) => void;
}

const StoriesSection: React.FC<StoriesSectionProps> = ({ profileData, onProfileDataChange }) => {
  const [showStoryModal, setShowStoryModal] = useState(false);

  const handleCreateStory = () => {
    setShowStoryModal(true);
  };

  const stories = profileData.stories || [];

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold">Stories</h3>
              <span className="text-sm text-gray-500">(0)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateStory}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Criar Story
            </Button>
          </div>

          {/* Empty State */}
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium">Stories em desenvolvimento</p>
            <p className="text-xs text-gray-400">Funcionalidade será implementada em breve</p>
          </div>

          {/* Dica */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>Em breve:</strong> Stories permitirão mostrar seu trabalho de forma dinâmica com fotos e vídeos.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal simplificado */}
      <StoryModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        story={null}
        onSave={() => {}}
      />
    </>
  );
};

export default StoriesSection;