import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

interface SwitcherOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

interface ContentSwitcherProps {
  options: SwitcherOption[];
  activeOption: string;
  onOptionChange: (optionId: string) => void;
  className?: string;
}

export function ContentSwitcher({ 
  options, 
  activeOption, 
  onOptionChange, 
  className
}: ContentSwitcherProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Controle de transição suave
  const handleOptionChange = (optionId: string) => {
    if (optionId === activeOption || isTransitioning) return;
    
    setIsTransitioning(true);
    onOptionChange(optionId);
    
    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), 250);
  };

  // Suporte para navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      
      const currentIndex = options.findIndex(opt => opt.id === activeOption);
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        handleOptionChange(options[prevIndex].id);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        handleOptionChange(options[nextIndex].id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeOption, options, isTransitioning]);

  return (
    <div 
      ref={containerRef}
      role="tablist"
      aria-label="Content switcher"
      className={cn(
        "relative inline-flex items-center rounded-full bg-[#8B5CF6] p-1.5 min-w-fit shadow-lg",
        "focus-within:ring-2 focus-within:ring-[#8B5CF6]/30 focus-within:ring-offset-2",
        className
      )}
    >
      {/* Indicador de fundo animado */}
      <div 
        className="absolute bg-white rounded-full transition-all duration-250 ease-out shadow-sm"
        style={{
          width: `calc(${100 / options.length}% - 6px)`,
          height: 'calc(100% - 12px)',
          left: `calc(${(options.findIndex(opt => opt.id === activeOption) * 100) / options.length}% + 3px)`,
          top: '6px'
        }}
      />
      
      {options.map((option) => {
        const isActive = activeOption === option.id;
        const Icon = option.icon;
        
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${option.id}`}
            tabIndex={isActive ? 0 : -1}
            disabled={isTransitioning}
            onClick={() => handleOptionChange(option.id)}
            className={cn(
              "relative z-10 px-6 py-3 rounded-full font-medium text-lg transition-all duration-250",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#8B5CF6]",
              "disabled:cursor-wait disabled:opacity-70",
              "hover:scale-[1.02] active:scale-[0.98]",
              isActive 
                ? "text-[#8B5CF6]" 
                : "text-white hover:text-white/90",
              "flex-1 min-w-0"
            )}
            style={{ 
              minWidth: `calc(${100 / options.length}% - 6px)`,
              margin: '0 3px'
            }}
          >
            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
              {Icon && (
                <Icon 
                  className={cn(
                    "h-4 w-4 transition-all duration-250",
                    isActive && "scale-110"
                  )} 
                />
              )}
              <span className="font-medium">{option.label}</span>
              {option.count !== undefined && (
                <span 
                  className={cn(
                    "ml-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-250 min-w-[20px] text-center",
                    isActive 
                      ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" 
                      : "bg-white/20 text-white"
                  )}
                >
                  {option.count}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}