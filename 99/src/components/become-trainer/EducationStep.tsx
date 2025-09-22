import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { GraduationCap, Award, Plus, X } from 'lucide-react';
import { FormData } from '../BecomeTrainer';

interface EducationStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export function EducationStep({ formData, updateFormData }: EducationStepProps) {
  const [newCourse, setNewCourse] = useState('');

  const addCourse = () => {
    if (newCourse.trim()) {
      updateFormData({ 
        courses: [...formData.courses, newCourse.trim()] 
      });
      setNewCourse('');
    }
  };

  const removeCourse = (index: number) => {
    updateFormData({ 
      courses: formData.courses.filter((_, i) => i !== index) 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCourse();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-medium text-foreground">Formação Profissional</h2>
        <p className="text-muted-foreground">Suas credenciais aumentam a confiança dos alunos</p>
      </div>

      <div className="space-y-5 max-w-2xl mx-auto">
        {/* Faculdade de Formação */}
        <div className="space-y-2">
          <Label htmlFor="university" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            Faculdade de Formação *
          </Label>
          <Input
            id="university"
            placeholder="Ex: Universidade de São Paulo - Educação Física"
            value={formData.university}
            onChange={(e) => updateFormData({ university: e.target.value })}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Nome da instituição e curso realizado
          </p>
        </div>

        {/* CRM ou Título */}
        <div className="space-y-2">
          <Label htmlFor="credential" className="flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            CRM ou Título de Especialidade *
          </Label>
          <Input
            id="credential"
            placeholder="Ex: CREF 123456-G/SP ou Personal Trainer Certificado"
            value={formData.credential}
            onChange={(e) => updateFormData({ credential: e.target.value })}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Número do registro profissional ou certificação principal
          </p>
        </div>

        {/* Cursos Complementares */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
            Cursos Complementares (opcional)
          </Label>
          
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Certificação em Pilates, Nutrição Esportiva..."
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-11"
            />
            <Button 
              type="button"
              onClick={addCourse}
              variant="outline"
              className="px-4 h-11"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Lista de Cursos */}
          {formData.courses.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Cursos adicionados:</p>
              <div className="flex flex-wrap gap-2">
                {formData.courses.map((course, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2 py-1 px-2 text-sm"
                  >
                    {course}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCourse(index)}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Dicas importantes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Certifique-se de que suas informações são verídicas</li>
          <li>• Quanto mais certificações relevantes, maior sua credibilidade</li>
          <li>• Adicione cursos mesmo que sejam de plataformas online</li>
        </ul>
      </div>
    </div>
  );
}