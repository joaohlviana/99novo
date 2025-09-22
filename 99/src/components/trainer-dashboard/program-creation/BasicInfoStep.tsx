"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { X, Plus, Info } from 'lucide-react';
import type { ProgramData } from '../../../services/training-programs-simple.service';

interface BasicInfoStepProps {
  data: ProgramData;
  onUpdate: (data: Partial<ProgramData>) => void;
  loading?: boolean;
}

const categories = [
  'Musculação',
  'Crossfit',
  'Funcional',
  'Cardio',
  'Yoga',
  'Pilates',
  'Boxe/Muay Thai',
  'Natação',
  'Corrida',
  'Ciclismo',
  'Dança',
  'Reabilitação'
];

const modalities = [
  'Presencial',
  'Online',
  'Híbrido'
];

const levels = [
  'Iniciante',
  'Intermediário',
  'Avançado',
  'Todos os níveis'
];

const suggestedTags = [
  'emagrecimento',
  'hipertrofia',
  'definição',
  'resistência',
  'força',
  'flexibilidade',
  'condicionamento',
  'iniciante',
  'intermediário',
  'avançado',
  'casa',
  'academia',
  'equipamentos',
  'sem equipamentos',
  'mulheres',
  'homens',
  'idosos',
  'reabilitação'
];

export function BasicInfoStep({ data, onUpdate, loading }: BasicInfoStepProps) {
  const [newTag, setNewTag] = useState('');
  
  // Garantir que data existe e tem as propriedades necessárias
  const programData = data || {};
  const tags = programData.tags || [];

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim().toLowerCase())) {
      onUpdate({
        tags: [...tags, tag.trim().toLowerCase()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdate({
      tags: tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(newTag);
    }
  };

  return (
    <div className="space-y-6">
      {/* Program Title */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Informações Básicas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título do programa</Label>
              <Input
                id="title"
                value={programData.title || ''}
                onChange={(e) => {
                  console.log('🔍 Debug - Título atual:', programData.title, '| Novo valor:', e.target.value);
                  console.log('🔍 Debug - Data completa:', programData);
                  onUpdate({ title: e.target.value });
                }}
                placeholder="Ex: Transformação Corporal em 12 Semanas"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={programData.category || ''}
                onValueChange={(value) => onUpdate({ category: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="modality">Modalidade</Label>
              <Select
                value={programData.modality || ''}
                onValueChange={(value) => onUpdate({ modality: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {modalities.map((modality) => (
                    <SelectItem key={modality} value={modality}>
                      {modality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Nível</Label>
              <Select
                value={programData.level || ''}
                onValueChange={(value) => onUpdate({ level: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Tags</h3>
          
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Adicionar tag"
              className="flex-1"
              disabled={loading}
            />
            <Button 
              type="button"
              onClick={() => handleAddTag(newTag)}
              disabled={!newTag.trim() || loading}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                    disabled={loading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Suggested Tags */}
          <div className="flex flex-wrap gap-2">
            {suggestedTags
              .filter(tag => !tags.includes(tag))
              .slice(0, 8)
              .map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  disabled={tags.length >= 10 || loading}
                  className="text-xs px-2 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + {tag}
                </button>
              ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}