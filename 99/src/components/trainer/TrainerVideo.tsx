import { Play, Pause, Volume2, Maximize } from "lucide-react";
import { useState, useRef } from "react";

interface TrainerVideoProps {
  videoUrl: string;
  title: string;
  description?: string;
}

export function TrainerVideo({
  videoUrl,
  title,
  description,
}: TrainerVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="relative group rounded-xl overflow-hidden bg-black shadow-lg w-full">
        <video
          ref={videoRef}
          className="w-full aspect-video object-cover"
          poster="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwdHJhaW5pbmclMjB2aWRlb3xlbnwxfHx8fDE3NTYxMzE5NjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
        >
          <source src={videoUrl} type="video/mp4" />
          Seu navegador não suporta o elemento de vídeo.
        </video>

        {/* Overlay with controls */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="bg-white/90 hover:bg-white text-black rounded-full p-3 transition-all duration-200 hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <Volume2
                className={`h-4 w-4 ${isMuted ? "opacity-50" : ""}`}
              />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>

        {/* Play button overlay when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="bg-white/90 hover:bg-white text-black rounded-full p-4 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Play className="h-8 w-8 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Video info */}
      <div className="mt-4 text-sm text-muted-foreground">
        <p>Vídeo de apresentação • 2:30 min</p>
      </div>
    </div>
  );
}