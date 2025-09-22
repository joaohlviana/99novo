/**
 * SELETOR DE TAGS PARA CLIENTES
 * ==============================
 * Componente para selecionar tags de busca como "emagrecimento", "hipertrofia", etc.
 */

import { useState, useMemo, useCallback } from 'react';
import { Hash, X, Plus, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

interface ClientTagsSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxSelection: number;
}

// Tags predefinidas organizadas por categoria
const SEARCH_TAGS = {
  body_goals: {
    name: 'Objetivos Corporais',
    tags: [
      'emagrecimento',
      'hipertrofia',
      'definição',
      'ganhar massa',
      'perder peso',
      'secar',
      'tonificar',
      'queimar gordura'
    ]
  },
  training_style: {
    name: 'Estilo de Treino',
    tags: [
      'cardio',
      'musculação',
      'funcional',
      'hiit',
      'crossfit',
      'pilates',
      'yoga',
      'aeróbico',
      'anaeróbico',
      'circuito'
    ]
  },
  focus_areas: {
    name: 'Áreas de Foco',
    tags: [
      'abdômen',
      'glúteos',
      'braços',
      'pernas',
      'core',
      'posterior',
      'superior',
      'inferior',
      'postura'
    ]
  },
  health_wellness: {
    name: 'Saúde e Bem-estar',
    tags: [
      'saúde',
      'bem-estar',
      'qualidade de vida',
      'energia',
      'disposição',
      'relaxamento',
      'alívio do estresse',
      'autoestima',
      'confiança'
    ]
  },
  performance: {
    name: 'Performance',
    tags: [
      'força',
      'resistência',
      'velocidade',
      'agilidade',
      'coordenação',
      'equilíbrio',
      'flexibilidade',
      'explosão',
      'condicionamento'
    ]
  },
  lifestyle: {
    name: 'Estilo de Vida',
    tags: [
      'sedentário',
      'iniciante',
      'intermediário',
      'avançado',
      'busy',
      'corrido',
      'tempo limitado',
      'flexível',
      'disciplinado'
    ]
  },
  preferences: {
    name: 'Preferências',
    tags: [
      'manhã',
      'tarde',
      'noite',
      'casa',
      'academia',
      'ar livre',
      'equipamentos',
      'peso livre',
      'máquinas',
      'sem equipamento'
    ]
  },
  motivation: {
    name: 'Motivação',
    tags: [
      'motivação',
      'disciplina',
      'foco',
      'determinação',
      'persistência',
      'desafio',
      'superação',
      'conquista',
      'resultado'
    ]
  }
};

export function ClientTagsSelector({
  selectedTags = [],
  onTagsChange,
  maxSelection
}: ClientTagsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customTag, setCustomTag] = useState('');

  // Criar lista plana de todas as tags
  const allTags = useMemo(() => {
    const tags: { name: string; category: string; categoryName: string }[] = [];
    
    Object.entries(SEARCH_TAGS).forEach(([categoryKey, category]) => {
      category.tags.forEach(tag => {
        tags.push({
          name: tag,
          category: categoryKey,
          categoryName: category.name
        });
      });
    });
    
    return tags;
  }, []);

  // Filtrar tags por busca e categoria
  const filteredTags = useMemo(() => {
    let tags = allTags;

    // Filtrar por busca
    if (searchTerm) {
      tags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoria selecionada
    if (selectedCategory) {
      tags = tags.filter(tag => tag.category === selectedCategory);
    }

    return tags;
  }, [allTags, searchTerm, selectedCategory]);

  // Separar tags selecionadas das disponíveis
  const { selectedTagsList, availableTags } = useMemo(() => {
    const selected = filteredTags.filter(tag =>
      selectedTags.includes(tag.name)
    );
    const available = filteredTags.filter(tag =>
      !selectedTags.includes(tag.name)
    );
    
    return {
      selectedTagsList: selected,
      availableTags: available
    };
  }, [filteredTags, selectedTags]);

  // Adicionar tag
  const handleAddTag = useCallback((tagName: string) => {
    if (selectedTags.length >= maxSelection) return;
    if (selectedTags.includes(tagName)) return;
    
    const newSelection = [...selectedTags, tagName];
    onTagsChange(newSelection);
  }, [selectedTags, maxSelection, onTagsChange]);

  // Remover tag
  const handleRemoveTag = useCallback((tagName: string) => {
    const newSelection = selectedTags.filter(t => t !== tagName);
    onTagsChange(newSelection);
  }, [selectedTags, onTagsChange]);

  // Adicionar tag customizada
  const handleAddCustomTag = useCallback(() => {
    const tag = customTag.trim().toLowerCase();
    if (tag && !selectedTags.includes(tag) && selectedTags.length < maxSelection) {
      handleAddTag(tag);
      setCustomTag('');
    }
  }, [customTag, selectedTags, maxSelection, handleAddTag]);

  // Agrupar tags disponíveis por categoria
  const groupedAvailableTags = useMemo(() => {
    const grouped: Record<string, { name: string; category: string; categoryName: string }[]> = {};
    
    availableTags.forEach(tag => {
      if (!grouped[tag.category]) {
        grouped[tag.category] = [];
      }
      grouped[tag.category].push(tag);
    });
    
    return grouped;
  }, [availableTags]);

  return (
    <div className="space-y-4">
      {/* Header com contador */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-brand" />
          <span className="text-sm font-medium text-gray-700">Tags de Busca</span>
        </div>
        <div className="text-xs text-gray-500">
          {selectedTags.length}/{maxSelection}
        </div>
      </div>

      {/* Tags selecionadas */}
      {selectedTags.length > 0 && (
        <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge 
                key={`selected-${tag}`}
                className="flex items-center gap-1 pr-1 bg-blue-600 text-white"
              >
                #{tag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-white/20 text-white"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar tags..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Campo para tag customizada */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Criar tag personalizada..."
            className="pl-10"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddCustomTag}
          disabled={!customTag.trim() || selectedTags.length >= maxSelection}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Filtros por categoria */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className="h-7 px-3 text-xs"
        >
          Todos
        </Button>
        {Object.entries(SEARCH_TAGS).map(([key, category]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
            className="h-7 px-3 text-xs"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Tags disponíveis por categoria */}
      {Object.keys(groupedAvailableTags).length > 0 ? (
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {Object.entries(groupedAvailableTags).map(([categoryKey, tags]) => {
            const categoryInfo = SEARCH_TAGS[categoryKey as keyof typeof SEARCH_TAGS];
            
            return (
              <div key={categoryKey} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
                  {categoryInfo.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Button
                      key={`available-${tag.name}`}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs flex items-center gap-1"
                      disabled={selectedTags.length >= maxSelection}
                      onClick={() => handleAddTag(tag.name)}
                    >
                      <Hash className="w-3 h-3" />
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? (
            <>
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhuma tag encontrada para "{searchTerm}"</p>
              <p className="text-xs text-gray-400 mt-1">
                Você pode criar uma tag personalizada acima
              </p>
            </>
          ) : selectedTags.length >= maxSelection ? (
            <>
              <Hash className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm">Limite máximo atingido ({maxSelection} tags)</p>
            </>
          ) : (
            <>
              <Hash className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Selecione ou crie suas tags de busca</p>
            </>
          )}
        </div>
      )}

      {/* Aviso de limite */}
      {selectedTags.length >= maxSelection && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>Limite atingido:</strong> Você selecionou o máximo de {maxSelection} tags.
          </p>
        </div>
      )}

      {/* Dica sobre tags */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica:</strong> As tags ajudam os treinadores a encontrarem clientes com objetivos específicos. 
          Use palavras-chave que descrevem o que você busca!
        </p>
      </div>
    </div>
  );
}