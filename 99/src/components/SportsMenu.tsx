import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// Import dos esportes do banco de dados
import { useAllSports } from '../hooks/useSports';
import { useNavigation } from '../hooks/useNavigation';

interface SportsMenuProps {
  selectedSport?: string;
}

export const SportsMenu: React.FC<SportsMenuProps> = ({ 
  selectedSport = "futebol" 
}) => {
  const navigation = useNavigation();
  const { sports, loading, error } = useAllSports();
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    const scrollContainer = scrollAreaRef.current;
    if (scrollContainer) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left' 
        ? scrollContainer.scrollLeft - scrollAmount
        : scrollContainer.scrollLeft + scrollAmount;
      
      scrollContainer.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const updateButtonVisibility = () => {
    const scrollContainer = scrollAreaRef.current;
    if (scrollContainer) {
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      setShowLeftButton(scrollContainer.scrollLeft > 0);
      setShowRightButton(scrollContainer.scrollLeft < maxScroll - 10);
    }
  };

  const handleScrollEvent = () => {
    updateButtonVisibility();
  };

  useEffect(() => {
    updateButtonVisibility();
    window.addEventListener('resize', updateButtonVisibility);
    return () => window.removeEventListener('resize', updateButtonVisibility);
  }, []);

  const handleSportClick = (sportId: string) => {
    navigation.navigateToSport(sportId);
  };

  return (
    <section className="relative bg-card w-full z-10">
      <div className="relative w-full">
        {/* Left Navigation Button */}
        {showLeftButton && (
          <>
            {/* Background gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-16 lg:w-20 bg-gradient-to-r from-card/90 via-card/70 to-transparent z-[11] pointer-events-none max-w-[87.5rem] mx-auto" />
            <div className="absolute left-0 top-0 bottom-0 w-full max-w-[87.5rem] mx-auto px-6 lg:px-8 z-[12] pointer-events-none">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleScroll('left')}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full p-0 bg-card shadow-lg border-border hover:shadow-xl transition-all duration-200 pointer-events-auto"
                aria-label="Previous categories"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* Right Navigation Button */}
        {showRightButton && (
          <>
            {/* Background gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-16 lg:w-20 bg-gradient-to-l from-card/90 via-card/70 to-transparent z-[11] pointer-events-none max-w-[87.5rem] mx-auto" />
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-[87.5rem] mx-auto px-6 lg:px-8 z-[12] pointer-events-none">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleScroll('right')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full p-0 bg-card shadow-lg border-border hover:shadow-xl transition-all duration-200 pointer-events-auto"
                aria-label="Next categories"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* Categories Slider */}
        <div className="container">
          <div 
            ref={scrollAreaRef}
            onScroll={handleScrollEvent}
            className="overflow-x-auto overflow-y-hidden scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            } as React.CSSProperties}
          >
            <div className="flex items-center h-[75px] min-w-max">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 8 }, (_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="flex flex-col items-center justify-center px-2 py-2 mx-0.5 h-full min-w-[65px] sm:px-3 sm:mx-1 sm:min-w-[75px] lg:px-4 lg:min-w-[80px] animate-pulse"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 mb-1 bg-muted rounded-full" />
                  <div className="w-12 h-3 bg-muted rounded mt-1.5" />
                </div>
              ))
            ) : error ? (
              <div className="flex items-center justify-center h-full px-4 text-muted-foreground">
                <span className="text-sm">Erro ao carregar esportes</span>
              </div>
            ) : (
              sports.map((sport) => {
                const isSelected = sport.slug === selectedSport;
                
                return (
                  <button
                    key={sport.id}
                    onClick={() => handleSportClick(sport.slug)}
                    className={`
                      flex flex-col items-center justify-center px-2 py-2 mx-0.5 h-full min-w-[65px] 
                      sm:px-3 sm:mx-1 sm:min-w-[75px] lg:px-4 lg:min-w-[80px]
                      transition-all duration-200 border-b-2 group
                      ${isSelected 
                        ? 'border-[#e0093e] text-foreground opacity-100' 
                        : 'border-transparent text-muted-foreground opacity-70 hover:opacity-100 hover:border-[#e0093e]'
                      }
                    `}
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 mb-1 transition-all duration-200 group-hover:scale-110 flex items-center justify-center">
                      {sport.icon_url ? (
                        <img
                          src={sport.icon_url}
                          alt={sport.name}
                          className={`w-full h-full object-contain transition-all duration-200 ${
                            isSelected 
                              ? 'grayscale-0 opacity-100' 
                              : 'grayscale opacity-60 group-hover:opacity-80'
                          }`}
                          loading="lazy"
                        />
                      ) : (
                        <div className={`w-4 h-4 rounded-full bg-current transition-all duration-200 ${
                          isSelected 
                            ? 'opacity-100' 
                            : 'opacity-60 group-hover:opacity-80'
                        }`} />
                      )}
                    </div>
                    <span className="text-[11px] sm:text-xs font-medium text-center whitespace-nowrap mt-1.5">
                      {sport.name}
                    </span>
                  </button>
                );
              })
            )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};