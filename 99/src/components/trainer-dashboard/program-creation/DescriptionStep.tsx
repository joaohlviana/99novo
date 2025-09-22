"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { X, Plus, FileText, Target, CheckCircle } from 'lucide-react';
import type { ProgramData } from '../../../services/training-programs-simple.service';

interface DescriptionStepProps {
  data: ProgramData;
  onUpdate: (data: Partial<ProgramData>) => void;
  loading?: boolean;
}

export function DescriptionStep({ data, onUpdate, loading }: DescriptionStepProps) {
  // Garantir que data existe e tem as propriedades necessárias
  const programData = data || {};
  const objectives = programData.objectives || [];
  const requirements = programData.requirements || [];
  const whatYouGet = programData.whatYouGet || [];
  const [newObjective, setNewObjective] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const handleAddObjective = () => {
    if (newObjective.trim() && !objectives.includes(newObjective.trim())) {
      onUpdate({
        objectives: [...objectives, newObjective.trim()]
      });
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (objectiveToRemove: string) => {
    onUpdate({
      objectives: objectives.filter(obj => obj !== objectiveToRemove)
    });
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      onUpdate({
        requirements: [...requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (requirementToRemove: string) => {
    onUpdate({
      requirements: requirements.filter(req => req !== requirementToRemove)
    });
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim() && !whatYouGet.includes(newBenefit.trim())) {
      onUpdate({
        whatYouGet: [...whatYouGet, newBenefit.trim()]
      });
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (benefitToRemove: string) => {
    onUpdate({
      whatYouGet: whatYouGet.filter(benefit => benefit !== benefitToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handler();
    }
  };

  return (
    <div className="space-y-6">
      {/* Program Description */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Descrição</h3>
          <div>
            <Label htmlFor="shortDescription">Descrição resumida</Label>
            <Textarea
              id="shortDescription"
              value={programData.shortDescription || ''}
              onChange={(e) => onUpdate({ shortDescription: e.target.value })}
              placeholder="Uma breve descrição do seu programa (máx. 200 caracteres)..."
              rows={3}
              className="resize-none"
              disabled={loading}
              maxLength={200}
            />
          </div>
          <div>
            <Label htmlFor="fullDescription">Descrição completa</Label>
            <Textarea
              id="fullDescription"
              value={programData.fullDescription || ''}
              onChange={(e) => onUpdate({ fullDescription: e.target.value })}
              placeholder="Descreva seu programa de forma detalhada..."
              rows={6}
              className="resize-none"
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Objectives */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Objetivos</h3>
          
          <div className="flex gap-2">
            <Input
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleAddObjective)}
              placeholder="Adicionar objetivo"
              className="flex-1"
            />
            <Button 
              type="button"
              onClick={handleAddObjective}
              disabled={!newObjective.trim()}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {objectives.length > 0 && (
            <div className="space-y-2">
              {objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="flex-1 text-sm">{objective}</span>
                  <button
                    onClick={() => handleRemoveObjective(objective)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Pré-requisitos</h3>
          
          <div className="flex gap-2">
            <Input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleAddRequirement)}
              placeholder="Adicionar pré-requisito"
              className="flex-1"
            />
            <Button 
              type="button"
              onClick={handleAddRequirement}
              disabled={!newRequirement.trim()}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {requirements.length > 0 && (
            <div className="space-y-2">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded">
                  <span className="flex-1 text-sm">{requirement}</span>
                  <button
                    onClick={() => handleRemoveRequirement(requirement)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* What You Get */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">O que está incluído</h3>
          
          <div className="flex gap-2">
            <Input
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleAddBenefit)}
              placeholder="Adicionar benefício"
              className="flex-1"
            />
            <Button 
              type="button"
              onClick={handleAddBenefit}
              disabled={!newBenefit.trim()}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {whatYouGet.length > 0 && (
            <div className="space-y-2">
              {whatYouGet.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="flex-1 text-sm">{benefit}</span>
                  <button
                    onClick={() => handleRemoveBenefit(benefit)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}