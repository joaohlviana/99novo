import React from 'react';
import { Plus, X, GraduationCap, Award } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

// Componente para item de universidade
const UniversityItem = ({ university, index, onUpdate, onRemove }: {
  university: { name: string; year: string };
  index: number;
  onUpdate: (index: number, updatedUniversity: { name: string; year: string }) => void;
  onRemove: () => void;
}) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Universidade {index + 1}</span>
        </div>
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
          title="Remover universidade"
          aria-label={`Remover universidade ${index + 1}`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label htmlFor={`university-name-${index}`}>Nome da Universidade</Label>
          <Input 
            id={`university-name-${index}`}
            value={university.name || ''}
            onChange={(e) => onUpdate(index, { ...university, name: e.target.value })}
            placeholder="Ex: USP - Educação Física"
          />
        </div>
        <div>
          <Label htmlFor={`university-year-${index}`}>Ano de Formação</Label>
          <Input 
            id={`university-year-${index}`}
            type="number"
            value={university.year || ''}
            onChange={(e) => onUpdate(index, { ...university, year: e.target.value })}
            placeholder="Ex: 2020"
            min="1950"
            max={new Date().getFullYear() + 10}
          />
        </div>
      </div>
    </div>
  );
};

// Componente para item de curso
const CourseItem = ({ course, index, onUpdate, onRemove }: {
  course: { name: string; year: string };
  index: number;
  onUpdate: (index: number, updatedCourse: { name: string; year: string }) => void;
  onRemove: () => void;
}) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
      <Award className="h-4 w-4 text-gray-600 flex-shrink-0" />
      <div className="flex-1 grid grid-cols-2 gap-2">
        <Input
          value={course.name || ''}
          onChange={(e) => onUpdate(index, { ...course, name: e.target.value })}
          placeholder="Nome do curso"
          className="text-sm"
        />
        <Input
          type="number"
          value={course.year || ''}
          onChange={(e) => onUpdate(index, { ...course, year: e.target.value })}
          placeholder="Ano"
          min="1950"
          max={new Date().getFullYear()}
          className="text-sm"
        />
      </div>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
        title="Remover curso"
        aria-label={`Remover curso ${index + 1}`}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

interface EducationSectionProps {
  profileData: {
    universities: Array<{ name: string; year: string }>;
    credential: string;
    courses: Array<{ name: string; year: string }>;
  };
  onProfileDataChange: (data: any) => void;
  loading?: boolean;
}

const EducationSection: React.FC<EducationSectionProps> = ({ 
  profileData, 
  onProfileDataChange, 
  loading = false 
}) => {
  const addUniversity = () => {
    console.log('🎓 Adding university. Current universities:', universities);
    const newUniversities = [...universities, { name: '', year: '' }];
    onProfileDataChange({ universities: newUniversities });
  };

  const updateUniversity = (index: number, updatedUniversity: { name: string; year: string }) => {
    console.log('🎓 Updating university', index, updatedUniversity);
    const newUniversities = universities.map((uni, i) => i === index ? updatedUniversity : uni);
    onProfileDataChange({ universities: newUniversities });
  };

  const removeUniversity = (index: number) => {
    console.log('🎓 Removing university', index);
    const newUniversities = universities.filter((_, i) => i !== index);
    onProfileDataChange({ universities: newUniversities });
  };

  const addCourse = () => {
    console.log('🏆 Adding course. Current courses:', courses);
    const newCourses = [...courses, { name: '', year: '' }];
    onProfileDataChange({ courses: newCourses });
  };

  const updateCourse = (index: number, updatedCourse: { name: string; year: string }) => {
    console.log('🏆 Updating course', index, updatedCourse);
    const newCourses = courses.map((course, i) => i === index ? updatedCourse : course);
    onProfileDataChange({ courses: newCourses });
  };

  const removeCourse = (index: number) => {
    console.log('🏆 Removing course', index);
    const newCourses = courses.filter((_, i) => i !== index);
    onProfileDataChange({ courses: newCourses });
  };

  const universities = profileData.universities || [];
  const courses = profileData.courses || [];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                <div className="grid grid-cols-1 gap-3">
                  <div className="h-9 w-full bg-gray-200 animate-pulse rounded" />
                  <div className="h-9 w-full bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-lg">
            <GraduationCap className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Formação e Credenciais</h3>
            <p className="text-sm text-gray-600">Suas qualificações profissionais</p>
          </div>
        </div>
        
        {/* Universidades */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium text-gray-800">Universidades</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addUniversity}
              className="flex items-center gap-2 border-brand/20 text-brand hover:bg-brand/5 hover:border-brand/30"
            >
              <Plus className="h-4 w-4" />
              Adicionar Universidade
            </Button>
          </div>
          
          <div className="space-y-3">
            {universities.map((university, index) => (
              <UniversityItem
                key={index}
                university={university}
                index={index}
                onUpdate={updateUniversity}
                onRemove={() => removeUniversity(index)}
              />
            ))}
            
            {universities.length === 0 && (
              <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <GraduationCap className="h-8 w-8 mx-auto mb-2 text-gray-400" aria-hidden="true" />
                <p className="text-sm">Nenhuma universidade adicionada</p>
                <p className="text-xs text-gray-400">Clique em "Adicionar Universidade" para começar</p>
              </div>
            )}
          </div>
        </div>

        {/* Registro Profissional */}
        <div className="space-y-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-blue-600" />
            <Label htmlFor="credential" className="font-medium text-blue-900">Registro Profissional (CREF)</Label>
          </div>
          <Input 
            id="credential"
            value={profileData.credential || ''}
            onChange={(e) => onProfileDataChange({ credential: e.target.value })}
            placeholder="Ex: CREF 12345-G/SP"
            className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400"
          />
          <p className="text-xs text-blue-700">
            📋 Registro no Conselho Regional de Educação Física (obrigatório para Personal Trainers)
          </p>
        </div>

        {/* Cursos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium text-gray-800">Cursos e Certificações</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addCourse}
              className="flex items-center gap-2 border-brand/20 text-brand hover:bg-brand/5 hover:border-brand/30"
            >
              <Plus className="h-4 w-4" />
              Adicionar Curso
            </Button>
          </div>
          
          <div className="space-y-2">
            {courses.map((course, index) => (
              <CourseItem
                key={index}
                course={course}
                index={index}
                onUpdate={updateCourse}
                onRemove={() => removeCourse(index)}
              />
            ))}
            
            {courses.length === 0 && (
              <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <Award className="h-8 w-8 mx-auto mb-2 text-gray-400" aria-hidden="true" />
                <p className="text-sm">Nenhum curso adicionado</p>
                <p className="text-xs text-gray-400">Clique em "Adicionar Curso" para começar</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumo */}
        {(universities.length > 0 || courses.length > 0 || profileData.credential) && (
          <div className="mt-6 p-4 bg-green-50/50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">Resumo da Formação</span>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              {universities.length > 0 && (
                <p>✓ {universities.length} formação{universities.length !== 1 ? 'ões' : ''} universitária{universities.length !== 1 ? 's' : ''}</p>
              )}
              {profileData.credential && (
                <p>✓ Registro profissional informado</p>
              )}
              {courses.length > 0 && (
                <p>✓ {courses.length} curso{courses.length !== 1 ? 's' : ''} e certificaç{courses.length !== 1 ? 'ões' : 'ão'}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EducationSection;