/**
 * SELETOR DE OBJETIVOS PARA CLIENTES
 * ===================================
 * Componente para selecionar objetivos de fitness e wellness
 */

import { useState, useMemo, useCallback } from 'react';
import { Target, X, Plus, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

interface ClientGoalsSelectorProps {
  selectedGoals: string[];
  onGoalsChange: (goals: string[]) => void;
  type: 'primary' | 'secondary';
  maxSelection: number;
}

// Objetivos predefinidos categorizados
const FITNESS_GOALS = {
  body_composition: {
    name: 'Composição Corporal',
    goals: [
      'Emagrecimento',
      'Ganhar massa muscular',
      'Definição muscular',
      'Reduzir gordura corporal',
      'Aumentar peso',
      'Recomposição corporal'
    ]
  },
  performance: {
    name: 'Performance',
    goals: [
      'Melhorar condicionamento',
      'Aumentar força',
      'Ganhar resistência',
      'Melhorar flexibilidade',
      'Aumentar velocidade',
      'Melhorar coordenação',
      'Aumentar potência'
    ]
  },
  health: {
    name: 'Saúde e Bem-estar',
    goals: [
      'Reduzir estresse',
      'Melhorar postura',
      'Aliviar dores nas costas',
      'Controlar pressão arterial',
      'Melhorar diabetes',
      'Fortalecer ossos',
      'Melhorar sono',
      'Aumentar disposição'
    ]
  },
  functional: {
    name: 'Funcional',
    goals: [
      'Atividades do dia a dia',
      'Subir escadas sem cansar',
      'Carregar peso',
      'Brincar com filhos',
      'Praticar esportes',
      'Viajar com disposição',
      'Envelhecer com saúde'
    ]
  },
  aesthetic: {
    name: 'Estético',
    goals: [
      'Tonificar o corpo',
      'Definir abdômen',
      'Fortalecer glúteos',
      'Afinar cintura',
      'Definir braços',
      'Melhorar aparência',
      'Aumentar autoestima'
    ]
  },
  sport_specific: {
    name: 'Esporte Específico',
    goals: [
      'Melhorar no futebol',
      'Correr uma maratona',
      'Competir em natação',
      'Jogar tênis melhor',
      'Pedalar longas distâncias',
      'Praticar artes marciais',
      'Dançar com habilidade'
    ]
  }
};

export function ClientGoalsSelector({
  selectedGoals = [],
  onGoalsChange,
  type,
  maxSelection
}: ClientGoalsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Criar lista plana de todos os objetivos
  const allGoals = useMemo(() => {
    const goals: { name: string; category: string; categoryName: string }[] = [];
    
    Object.entries(FITNESS_GOALS).forEach(([categoryKey, category]) => {
      category.goals.forEach(goal => {
        goals.push({
          name: goal,
          category: categoryKey,
          categoryName: category.name
        });
      });
    });
    
    return goals;
  }, []);

  // Filtrar objetivos por busca e categoria
  const filteredGoals = useMemo(() => {
    let goals = allGoals;

    // Filtrar por busca
    if (searchTerm) {
      goals = goals.filter(goal =>
        goal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoria selecionada
    if (selectedCategory) {
      goals = goals.filter(goal => goal.category === selectedCategory);
    }

    return goals;
  }, [allGoals, searchTerm, selectedCategory]);

  // Separar objetivos selecionados dos disponíveis
  const { selectedGoalsList, availableGoals } = useMemo(() => {
    const selected = filteredGoals.filter(goal =>
      selectedGoals.includes(goal.name)
    );
    const available = filteredGoals.filter(goal =>
      !selectedGoals.includes(goal.name)
    );
    
    return {
      selectedGoalsList: selected,
      availableGoals: available
    };
  }, [filteredGoals, selectedGoals]);

  // Adicionar objetivo
  const handleAddGoal = useCallback((goalName: string) => {
    if (selectedGoals.length >= maxSelection) return;
    
    const newSelection = [...selectedGoals, goalName];
    onGoalsChange(newSelection);
  }, [selectedGoals, maxSelection, onGoalsChange]);

  // Remover objetivo
  const handleRemoveGoal = useCallback((goalName: string) => {
    const newSelection = selectedGoals.filter(g => g !== goalName);
    onGoalsChange(newSelection);
  }, [selectedGoals, onGoalsChange]);

  // Agrupar objetivos disponíveis por categoria
  const groupedAvailableGoals = useMemo(() => {
    const grouped: Record<string, { name: string; category: string; categoryName: string }[]> = {};
    
    availableGoals.forEach(goal => {
      if (!grouped[goal.category]) {
        grouped[goal.category] = [];
      }
      grouped[goal.category].push(goal);
    });
    
    return grouped;
  }, [availableGoals]);

  return (
    <div className="space-y-4">
      {/* Header com contador */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-brand" />
          <span className="text-sm font-medium text-gray-700">
            Objetivos {type === 'primary' ? 'Principais' : 'Secundários'}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {selectedGoals.length}/{maxSelection}
        </div>
      </div>

      {/* Objetivos selecionados */}
      {selectedGoals.length > 0 && (
        <div className="p-3 rounded-lg border bg-brand/5 border-brand/20">
          <div className="flex flex-wrap gap-2">
            {selectedGoalsList.map((goal) => (
              <Badge 
                key={`selected-${goal.name}`}
                className="flex items-center gap-1 pr-1 bg-brand text-white"
              >
                {goal.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-white/20 text-white"
                  onClick={() => handleRemoveGoal(goal.name)}
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
          placeholder="Buscar objetivos..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
        {Object.entries(FITNESS_GOALS).map(([key, category]) => (
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

      {/* Objetivos disponíveis por categoria */}
      {Object.keys(groupedAvailableGoals).length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedAvailableGoals).map(([categoryKey, goals]) => {
            const categoryInfo = FITNESS_GOALS[categoryKey as keyof typeof FITNESS_GOALS];
            
            return (
              <div key={categoryKey} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
                  {categoryInfo.name}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {goals.map((goal) => (
                    <Button
                      key={`available-${goal.name}`}
                      variant="outline"
                      size="sm"
                      className="h-auto p-2 flex items-center gap-2 text-left justify-start"
                      disabled={selectedGoals.length >= maxSelection}
                      onClick={() => handleAddGoal(goal.name)}
                    >
                      <Plus className="w-3 h-3 flex-shrink-0 text-brand" />
                      <span className="text-xs">{goal.name}</span>
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
              <p className="text-sm">Nenhum objetivo encontrado para "{searchTerm}"</p>
            </>
          ) : selectedGoals.length >= maxSelection ? (
            <>
              <Target className="w-8 h-8 mx-auto mb-2 text-brand" />
              <p className="text-sm">Limite máximo atingido ({maxSelection} objetivos)</p>
            </>
          ) : (
            <>
              <Target className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Selecione seus objetivos</p>
            </>
          )}
        </div>
      )}

      {/* Aviso de limite */}
      {selectedGoals.length >= maxSelection && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>Limite atingido:</strong> Você selecionou o máximo de {maxSelection} objetivos.
          </p>
        </div>
      )}
    </div>
  );
}