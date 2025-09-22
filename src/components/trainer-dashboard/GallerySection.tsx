import React, { useState } from 'react';
import { Camera, Video, Upload, X, Play, Plus, Image as ImageIcon } from 'lucide-react';
import { useFileUpload } from '../../hooks/use-file-upload';

// Componentes UI
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={className}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  variant = "default", 
  size = "default", 
  className = "", 
  onClick = () => {}, 
  disabled = false
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-700",
    outline: "border border-gray-300 hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
    success: "bg-green-600 text-white hover:bg-green-700",
    suggest: "bg-blue-600 text-white hover:bg-blue-700"
  };
  
  const sizes = {
    default: "h-9 px-4 text-sm",
    sm: "h-8 px-3 text-sm",
    xs: "h-7 px-2 text-xs",
    icon: "h-9 w-9"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }) => (
  <input
    className={`flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Componente de Upload de Galeria
const GalleryUpload = ({ images, onImagesChange, maxImages = 12 }) => {
  const [
    { files, isDragging },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile
    }
  ] = useFileUpload({
    accept: "image/*",
    multiple: true
  });

  // Combinar imagens existentes com novos uploads
  const allImages = [...(images || []), ...files.map(f => ({ id: f.id, url: f.preview, isNew: true }))];

  const handleRemoveImage = (imageId) => {
    // Verificar se é uma imagem nova (do upload) ou existente
    const isNewImage = files.find(f => f.id === imageId);
    
    if (isNewImage) {
      removeFile(imageId);
    } else {
      // Remover das imagens existentes
      onImagesChange((images || []).filter(img => img.id !== imageId));
    }
  };

  const handleSaveNewImages = () => {
    const newImages = files.map(f => ({
      id: f.id,
      url: f.preview,
      isNew: false
    }));
    
    onImagesChange([...(images || []), ...newImages]);
    
    // Limpar arquivos temporários
    files.forEach(f => removeFile(f.id));
  };

  const canAddMore = allImages.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Grid de Imagens */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allImages.map((image) => (
            <div key={image.id} className="relative group aspect-square">
              <img
                src={image.url}
                alt="Galeria"
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                <Button
                  size="icon"
                  variant="outline"
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-red-50 hover:border-red-300"
                  onClick={() => handleRemoveImage(image.id)}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              {image.isNew && (
                <div className="absolute top-2 left-2">
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Novo
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Área de Upload */}
      {canAddMore && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
          `}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">
            Clique ou arraste fotos aqui
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {allImages.length}/{maxImages} fotos • PNG, JPG até 5MB
          </p>
        </div>
      )}

      {/* Botões de Ação */}
      {files.length > 0 && (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => files.forEach(f => removeFile(f.id))}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={handleSaveNewImages}
          >
            Salvar {files.length} foto{files.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {allImages.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium">Nenhuma foto adicionada</p>
          <p className="text-xs text-gray-400">Clique no botão acima para adicionar fotos</p>
        </div>
      )}
    </div>
  );
};

// Componente de Vídeos do Trainer
const TrainerVideos = ({ videos, onVideosChange, maxVideos = 8 }) => {
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  const extractVideoId = (url) => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return { platform: 'youtube', id: youtubeMatch[1] };
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return { platform: 'vimeo', id: vimeoMatch[1] };
    }
    
    return null;
  };

  const getVideoThumbnail = (platform, id) => {
    if (platform === 'youtube') {
      return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }
    if (platform === 'vimeo') {
      return `https://vumbnail.com/${id}.jpg`;
    }
    return null;
  };

  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) return;
    
    const videoInfo = extractVideoId(newVideoUrl);
    if (!videoInfo) {
      alert('URL inválida. Use links do YouTube ou Vimeo.');
      return;
    }

    const newVideo = {
      id: Date.now().toString(),
      url: newVideoUrl,
      platform: videoInfo.platform,
      videoId: videoInfo.id,
      thumbnail: getVideoThumbnail(videoInfo.platform, videoInfo.id),
      title: `Vídeo ${(videos || []).length + 1}`
    };

    onVideosChange([...(videos || []), newVideo]);
    setNewVideoUrl('');
    setIsAddingVideo(false);
  };

  const handleRemoveVideo = (videoId) => {
    onVideosChange((videos || []).filter(v => v.id !== videoId));
  };

  const canAddMore = (videos || []).length < maxVideos;

  return (
    <div className="space-y-4">
      {/* Grid de Vídeos */}
      {videos && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {videos.map((video) => (
            <div key={video.id} className="relative group">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                {video.thumbnail ? (
                  <div className="relative w-full h-full">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-white hover:bg-red-50 hover:border-red-300"
                  onClick={() => handleRemoveVideo(video.id)}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              
              <p className="text-xs text-gray-600 mt-2 truncate">{video.title}</p>
            </div>
          ))}
        </div>
      )}

      {/* Formulário de Adicionar Vídeo */}
      {canAddMore && (
        <div>
          {!isAddingVideo ? (
            <Button
              variant="outline"
              onClick={() => setIsAddingVideo(true)}
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Vídeo
            </Button>
          ) : (
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
              <div>
                <Input
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Cole o link do YouTube ou Vimeo aqui..."
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingVideo(false);
                    setNewVideoUrl('');
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleAddVideo}
                  disabled={!newVideoUrl.trim()}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contador */}
      {videos && videos.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          {videos.length}/{maxVideos} vídeos adicionados
        </p>
      )}

      {/* Empty State */}
      {(!videos || videos.length === 0) && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium">Nenhum vídeo adicionado</p>
          <p className="text-xs text-gray-400">Adicione vídeos do YouTube ou Vimeo</p>
        </div>
      )}
    </div>
  );
};

interface GallerySectionProps {
  profileData: {
    galleryImages?: Array<{ id: string; url: string }>;
    videos?: Array<{ id: string; url: string; platform: string; videoId: string; thumbnail: string; title: string }>;
  };
  onProfileDataChange: (data: any) => void;
}

const GallerySection: React.FC<GallerySectionProps> = ({ profileData, onProfileDataChange }) => {
  return (
    <div className="space-y-4">
      {/* Galeria */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Camera className="h-4 w-4" />
            Fotos
          </h3>
          <GalleryUpload
            images={profileData.galleryImages || []}
            onImagesChange={(images) => {
              console.log('📸 Gallery images changed:', images);
              onProfileDataChange(prev => ({ ...prev, galleryImages: images }));
            }}
            maxImages={12}
          />
        </CardContent>
      </Card>

      {/* Vídeos */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Video className="h-4 w-4" />
            Vídeos
          </h3>
          
          <TrainerVideos
            videos={profileData.videos || []}
            onVideosChange={(videos) => {
              console.log('🎬 Videos changed:', videos);
              onProfileDataChange(prev => ({ ...prev, videos: videos }));
            }}
            maxVideos={8}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GallerySection;