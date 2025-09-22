import { useState } from 'react';
import { Play, Pause, Volume2, Maximize, Plus, Video as VideoIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views?: number;
}

interface TrainerVideosProps {
  videos: Video[];
  onAddVideo?: () => void;
  canEdit?: boolean;
}

export function TrainerVideos({ videos, onAddVideo, canEdit = false }: TrainerVideosProps) {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const handleVideoPlay = (videoId: string) => {
    setPlayingVideo(videoId);
  };

  const handleVideoPause = () => {
    setPlayingVideo(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <VideoIcon className="h-5 w-5" />
            Vídeos
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {videos.length} vídeo{videos.length !== 1 ? 's' : ''} disponível{videos.length !== 1 ? 'eis' : ''}
          </p>
        </div>
        
        {canEdit && (
          <Button 
            onClick={onAddVideo}
            size="sm" 
            className="bg-[#e0093e] hover:bg-[#c0082e]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Vídeo
          </Button>
        )}
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            isPlaying={playingVideo === video.id}
            onPlay={() => handleVideoPlay(video.id)}
            onPause={handleVideoPause}
          />
        ))}
      </div>

      {/* Empty state */}
      {videos.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <VideoIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h4 className="font-medium text-muted-foreground mb-2">Nenhum vídeo adicionado</h4>
          <p className="text-sm text-muted-foreground">
            {canEdit 
              ? "Adicione vídeos para mostrar sua metodologia e resultados" 
              : "Este treinador ainda não adicionou vídeos"}
          </p>
          {canEdit && (
            <Button 
              onClick={onAddVideo}
              className="mt-4 bg-[#e0093e] hover:bg-[#c0082e]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Vídeo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface VideoCardProps {
  video: Video;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

function VideoCard({ video, isPlaying, onPlay, onPause }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const togglePlay = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <div className="group relative bg-card rounded-xl overflow-hidden shadow-sm border">
      {/* Thumbnail */}
      <div 
        className="relative aspect-video cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={togglePlay}
      >
        <ImageWithFallback
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/30 transition-opacity duration-300 flex items-center justify-center ${
          isHovered || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={togglePlay}
            className="bg-white/90 hover:bg-white text-black rounded-full p-3 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </button>
        </div>

        {/* Duration */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>

        {/* Views (if available) */}
        {video.views && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {video.views.toLocaleString()} views
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h4 className="font-medium text-sm mb-1 line-clamp-2">{video.title}</h4>
        {video.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
        )}
      </div>
    </div>
  );
}