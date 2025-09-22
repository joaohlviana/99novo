import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { sportsCategories } from '../../data/constants';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface SportsMegaMenuProps {
  currentCategory: string;
  onCategorySelect: (category: string) => void;
  buttonClassName?: string;
  isActive?: boolean;
}

const SportsMegaMenu = React.forwardRef<HTMLDivElement, SportsMegaMenuProps>(
  ({ currentCategory, onCategorySelect, buttonClassName, isActive }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    // Organizar esportes em categorias para o mega menu
    const sportsColumns = React.useMemo(() => {
      const columns = 4;
      const itemsPerColumn = Math.ceil(sportsCategories.length / columns);
      const result = [];
      
      for (let i = 0; i < columns; i++) {
        const start = i * itemsPerColumn;
        const end = start + itemsPerColumn;
        const columnSports = sportsCategories.slice(start, end);
        
        if (columnSports.length > 0) {
          result.push({
            title: `Categoria ${i + 1}`,
            sports: columnSports
          });
        }
      }
      
      return result;
    }, []);

    const handleSportSelect = (sportLabel: string) => {
      onCategorySelect(sportLabel);
      setIsOpen(false);
    };

    const handleShowAll = () => {
      onCategorySelect('Todas as categorias');
      setIsOpen(false);
    };

    return (
      <div 
        ref={ref}
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button 
          className={buttonClassName}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`${isActive ? 'text-white' : 'text-gray-700'} text-sm`}>
            {currentCategory === 'Todas as categorias' ? 'Categoria' : currentCategory}
          </span>
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${
            isActive ? 'text-white' : 'text-gray-400'
          } ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <div className="absolute left-0 top-full w-auto pt-2 z-[200]">
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-max border border-gray-200 bg-white rounded-xl shadow-xl p-6"
                style={{
                  minWidth: '800px',
                  maxWidth: '1000px'
                }}
              >
                {/* Header com "Ver Todas" */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Escolha sua modalidade
                  </h3>
                  <button
                    onClick={handleShowAll}
                    className="text-sm text-[#e0093e] hover:text-[#c40835] font-medium hover:underline"
                  >
                    Ver todas as categorias
                  </button>
                </div>

                {/* Grid de esportes */}
                <div className="grid grid-cols-4 gap-8">
                  {sportsColumns.map((column, columnIndex) => (
                    <div key={columnIndex}>
                      <ul className="space-y-3">
                        {column.sports.map((sport) => (
                          <li key={sport.id}>
                            <button
                              onClick={() => handleSportSelect(sport.label)}
                              className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors group text-left"
                            >
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 group-hover:border-[#e0093e] transition-colors">
                                <ImageWithFallback 
                                  src={sport.iconUrl}
                                  alt={sport.label}
                                  className="h-6 w-6 object-contain"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 group-hover:text-[#e0093e] transition-colors">
                                  {sport.label}
                                </p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500">
                    {sportsCategories.length} modalidades disponíveis • Encontre seu treinador ideal
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

SportsMegaMenu.displayName = "SportsMegaMenu";

export { SportsMegaMenu };