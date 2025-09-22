import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Story {
  id: string;
  title: string;
  image: string;
  content: {
    type: 'image' | 'video';
    url: string;
    duration?: number;
  };
  timestamp: string;
  viewed: boolean;
}

interface TrainerStoriesProps {
  stories: Story[];
}

export function TrainerStories({ stories }: TrainerStoriesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const openStory = (index: number) => {
    setCurrentStoryIndex(index);
    setIsOpen(true);
    setProgress(0);
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      setIsOpen(false);
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const closeStory = () => {
    setIsOpen(false);
    setProgress(0);
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextStory();
      } else if (e.key === 'ArrowLeft') {
        prevStory();
      } else if (e.key === 'Escape') {
        closeStory();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStoryIndex]);

  // Auto progress simulation
  useEffect(() => {
    if (!isOpen || !stories[currentStoryIndex]) return;

    const duration = stories[currentStoryIndex].content.duration || 5000;
    const increment = 100 / (duration / 50);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + increment;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, currentStoryIndex]);

  return (
    <>
      <div className="px-6 lg:px-8">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="flex-shrink-0 cursor-pointer"
              onClick={() => openStory(index)}
            >
              <div className={`relative w-16 h-16 rounded-full p-0.5 ${
                story.viewed 
                  ? 'bg-gray-300' 
                  : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'
              }`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                  <ImageWithFallback
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <p className="text-xs text-center mt-1 w-16 truncate">{story.title}</p>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={closeStory}>
        <DialogContent className="max-w-none w-full h-full p-0 bg-black flex items-center justify-center border-none">
          <DialogTitle className="sr-only">
            Story: {stories[currentStoryIndex]?.title || 'Carregando...'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Visualizando story de João: {stories[currentStoryIndex]?.title || 'Carregando...'} - {stories[currentStoryIndex]?.timestamp || ''}
          </DialogDescription>
          <div className="relative w-full max-w-md h-full flex flex-col">
            {/* Progress bars */}
            <div className="absolute top-4 left-4 right-4 z-50 flex gap-1">
              {stories.map((_, index) => (
                <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-100"
                    style={{ 
                      width: index < currentStoryIndex ? '100%' : 
                             index === currentStoryIndex ? `${progress}%` : '0%'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={closeStory}
              className="absolute top-4 right-4 z-50 text-white hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Story header */}
            <div className="absolute top-12 left-4 right-4 z-40 flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1540206063137-4a88ca974d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluZXIlMjBmaXRuZXNzJTIwY29hY2h8ZW58MXx8fHwxNzU1ODc3OTQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="João"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">João</p>
                <p className="text-xs text-white/70">{stories[currentStoryIndex].timestamp}</p>
              </div>
            </div>

            {/* Story content */}
            <div className="flex-1 relative">
              {stories[currentStoryIndex] && (
                <ImageWithFallback
                  src={stories[currentStoryIndex].content.url}
                  alt={stories[currentStoryIndex].title}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Navigation areas */}
              <button
                onClick={prevStory}
                className="absolute left-0 top-0 w-1/3 h-full z-30 flex items-center justify-start pl-4"
                disabled={currentStoryIndex === 0}
              >
                {currentStoryIndex > 0 && (
                  <ChevronLeft className="h-6 w-6 text-white/70 hover:text-white" />
                )}
              </button>
              
              <button
                onClick={nextStory}
                className="absolute right-0 top-0 w-1/3 h-full z-30 flex items-center justify-end pr-4"
              >
                <ChevronRight className="h-6 w-6 text-white/70 hover:text-white" />
              </button>
            </div>

            {/* Story text overlay */}
            <div className="absolute bottom-20 left-4 right-4 text-white">
              {stories[currentStoryIndex] && (
                <h4 className="font-medium mb-1">{stories[currentStoryIndex].title}</h4>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

