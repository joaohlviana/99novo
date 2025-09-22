"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { 
  Settings, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { ProgramData } from '../../../services/training-programs-simple.service';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';

interface StructureStepProps {
  data: ProgramData;
  onUpdate: (data: Partial<ProgramData>) => void;
  loading?: boolean;
}

const daysOfWeek = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo'
];

const focusAreas = [
  'Peito e Tríceps',
  'Costas e Bíceps',
  'Pernas e Glúteos',
  'Ombros e Abdomen',
  'Cardio HIIT',
  'Cardio Steady',
  'Full Body',
  'Upper Body',
  'Lower Body',
  'Core e Funcional',
  'Mobilidade',
  'Descanso Ativo'
];

export function StructureStep({ data, onUpdate, loading }: StructureStepProps) {
  const [openWeeks, setOpenWeeks] = useState<number[]>([1]);
  
  // Garantir que data existe e tem as propriedades necessárias  
  const schedule = data.schedule || [];

  const updateDuration = (duration: number) => {
    onUpdate({ duration });
    // Reset schedule if duration changes
    const newSchedule = Array.from({ length: duration }, (_, i) => ({
      week: i + 1,
      sessions: []
    }));
    onUpdate({ schedule: newSchedule });
  };

  const addSession = (weekIndex: number) => {
    const newSchedule = [...schedule];
    if (!newSchedule[weekIndex]) {
      newSchedule[weekIndex] = { week: weekIndex + 1, sessions: [] };
    }
    
    newSchedule[weekIndex].sessions.push({
      day: 'Segunda',
      focus: 'Full Body',
      exercises: 8
    });
    
    onUpdate({ schedule: newSchedule });
  };

  const removeSession = (weekIndex: number, sessionIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[weekIndex].sessions.splice(sessionIndex, 1);
    onUpdate({ schedule: newSchedule });
  };

  const updateSession = (weekIndex: number, sessionIndex: number, field: string, value: any) => {
    const newSchedule = [...schedule];
    newSchedule[weekIndex].sessions[sessionIndex] = {
      ...newSchedule[weekIndex].sessions[sessionIndex],
      [field]: value
    };
    onUpdate({ schedule: newSchedule });
  };

  const toggleWeek = (week: number) => {
    setOpenWeeks(prev => 
      prev.includes(week) 
        ? prev.filter(w => w !== week)
        : [...prev, week]
    );
  };

  const generateBasicSchedule = () => {
    const weeks = data.duration;
    const frequency = data.frequency;
    
    const basicSchedule = Array.from({ length: weeks }, (_, weekIndex) => {
      const sessions = [];
      
      // Generate sessions based on frequency
      if (frequency === 3) {
        sessions.push(
          { day: 'Segunda', focus: 'Upper Body', exercises: 8 },
          { day: 'Quarta', focus: 'Lower Body', exercises: 8 },
          { day: 'Sexta', focus: 'Full Body', exercises: 8 }
        );
      } else if (frequency === 4) {
        sessions.push(
          { day: 'Segunda', focus: 'Peito e Tríceps', exercises: 8 },
          { day: 'Terça', focus: 'Costas e Bíceps', exercises: 8 },
          { day: 'Quinta', focus: 'Pernas e Glúteos', exercises: 10 },
          { day: 'Sexta', focus: 'Ombros e Abdomen', exercises: 6 }
        );
      } else if (frequency === 5) {
        sessions.push(
          { day: 'Segunda', focus: 'Peito e Tríceps', exercises: 8 },
          { day: 'Terça', focus: 'Costas e Bíceps', exercises: 8 },
          { day: 'Quarta', focus: 'Pernas e Glúteos', exercises: 10 },
          { day: 'Quinta', focus: 'Ombros e Abdomen', exercises: 6 },
          { day: 'Sexta', focus: 'Cardio HIIT', exercises: 5 }
        );
      }
      
      return {
        week: weekIndex + 1,
        sessions
      };
    });
    
    onUpdate({ schedule: basicSchedule });
    setOpenWeeks([1, 2, 3]);
  };

  return (
    <div className="space-y-6">
      {/* Program Duration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Duração do Programa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="duration">Duração (semanas) *</Label>
      <Select 
        value={data.duration?.toString() || ""} 
        onValueChange={(value) => {
          console.log('💪 Duration changed to:', value);
          onUpdate({ duration: parseInt(value) });
        }}
      >
        <SelectTrigger 
          id="duration"
          className={loading ? 'opacity-50' : ''}
        >
          <SelectValue placeholder="Selecione a duração" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="4">4 semanas</SelectItem>
          <SelectItem value="6">6 semanas</SelectItem>
          <SelectItem value="8">8 semanas</SelectItem>
          <SelectItem value="12">12 semanas</SelectItem>
          <SelectItem value="16">16 semanas</SelectItem>
          <SelectItem value="20">20 semanas</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="frequency">Frequência (treinos/semana) *</Label>
      <Select 
        value={data.frequency?.toString() || ""} 
        onValueChange={(value) => {
          console.log('🏋️ Frequency changed to:', value);
          onUpdate({ frequency: parseInt(value) });
        }}
      >
        <SelectTrigger 
          id="frequency"
          className={loading ? 'opacity-50' : ''}
        >
          <SelectValue placeholder="Frequência semanal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2">2x por semana</SelectItem>
          <SelectItem value="3">3x por semana</SelectItem>
          <SelectItem value="4">4x por semana</SelectItem>
          <SelectItem value="5">5x por semana</SelectItem>
          <SelectItem value="6">6x por semana</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  {data.duration != null && data.frequency != null && (
    <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
      <div>
        <p className="text-sm font-medium">Estrutura sugerida disponível</p>
        <p className="text-xs text-muted-foreground">
          Gere uma estrutura básica baseada na duração e frequência escolhidas
        </p>
      </div>
      <Button onClick={generateBasicSchedule} variant="outline">
        <Settings className="h-4 w-4 mr-2" />
        Gerar Estrutura
      </Button>
    </div>
  )}
</CardContent>

      </Card>

      {/* Weekly Schedule */}
      {data.duration && schedule && schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cronograma Semanal</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure os treinos para cada semana do programa
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: data.duration }, (_, weekIndex) => {
                const weekData = schedule[weekIndex] || { week: weekIndex + 1, sessions: [] };
                const isOpen = openWeeks.includes(weekIndex + 1);
                
                return (
                  <Collapsible key={weekIndex} open={isOpen} onOpenChange={() => toggleWeek(weekIndex + 1)}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Semana {weekIndex + 1}</Badge>
                          <span className="font-medium">
                            {weekData.sessions.length} {weekData.sessions.length === 1 ? 'treino' : 'treinos'}
                          </span>
                          <div className="flex gap-1">
                            {weekData.sessions.map((session, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {session.day}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="pt-4">
                      <div className="space-y-3 pl-4 border-l-2 border-muted">
                        {weekData.sessions.map((session, sessionIndex) => (
                          <div key={sessionIndex} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <Select
                                value={session.day}
                                onValueChange={(value) => updateSession(weekIndex, sessionIndex, 'day', value)}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {daysOfWeek.map((day) => (
                                    <SelectItem key={day} value={day}>{day}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Select
                                value={session.focus}
                                onValueChange={(value) => updateSession(weekIndex, sessionIndex, 'focus', value)}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {focusAreas.map((area) => (
                                    <SelectItem key={area} value={area}>{area}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={session.exercises}
                                  onChange={(e) => updateSession(weekIndex, sessionIndex, 'exercises', parseInt(e.target.value) || 1)}
                                  className="h-9 w-20"
                                  min="1"
                                  max="15"
                                />
                                <span className="text-sm text-muted-foreground">exercícios</span>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSession(weekIndex, sessionIndex)}
                              className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSession(weekIndex)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Treino
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {data.duration && schedule && schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Resumo da Estrutura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-semibold text-primary">{data.duration}</div>
                <div className="text-sm text-muted-foreground">Semanas</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-semibold text-primary">
                  {schedule.reduce((total, week) => total + week.sessions.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total de Treinos</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-semibold text-primary">
                  {Math.round(schedule.reduce((total, week) => total + week.sessions.length, 0) / data.duration * 10) / 10}
                </div>
                <div className="text-sm text-muted-foreground">Treinos/Semana (média)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}