import { useState, FormEvent } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/common';
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@/types/Project.types';
import clsx from 'clsx';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

/**
 * Props del componente ProjectForm
 */
interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

/**
 * Componente ProjectForm
 * 
 * Modal para crear o editar proyectos con:
 * - Formulario completo
 * - Validación
 * - Prioridad con estrellas interactivas
 * - Tags con chips
 */
export const ProjectForm = ({ isOpen, onClose, project }: ProjectFormProps) => {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [category, setCategory] = useState(project?.category || '');
  const [priority, setPriority] = useState(project?.priority || 3);
  const [startDate, setStartDate] = useState(project?.start_date || '');
  const [targetEndDate, setTargetEndDate] = useState(project?.target_end_date || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(project?.tags || []);

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isEditing = !!project;
  const isLoading = createProject.isPending || updateProject.isPending;

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      const projectData = {
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        priority,
        start_date: startDate || undefined,
        target_end_date: targetEndDate || undefined,
        tags,
      };

      if (isEditing) {
        await updateProject.mutateAsync({
          id: project.id,
          updates: projectData as UpdateProjectInput,
        });
        handleClose();
      } else {
        const newProject = await createProject.mutateAsync(projectData as CreateProjectInput);
        
        // Analyze project with AI in background
        setIsAnalyzing(true);
        const analyzeToast = toast.loading('Analizando proyecto con IA...');
        
        try {
          const { error } = await supabase.functions.invoke('analyze-project', {
            body: { projectId: newProject.id, action: 'analyze' }
          });
          
          if (error) throw error;
          
          toast.success('Proyecto analizado exitosamente', { id: analyzeToast });
        } catch (error) {
          console.error('Error analyzing project:', error);
          toast.error('Error al analizar proyecto', { id: analyzeToast });
        } finally {
          setIsAnalyzing(false);
          handleClose();
        }
      }
    } catch (error) {
      // Los errores se manejan en los hooks con toast
    }
  };

  /**
   * Cerrar modal y limpiar form
   */
  const handleClose = () => {
    if (!isLoading) {
      setName('');
      setDescription('');
      setCategory('');
      setPriority(3);
      setStartDate('');
      setTargetEndDate('');
      setTags([]);
      setTagInput('');
      onClose();
    }
  };

  /**
   * Agregar tag
   */
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  /**
   * Remover tag
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  /**
   * Renderizar estrellas de prioridad (interactivas)
   */
  const renderPriorityStars = () => {
    return (
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Prioridad del proyecto">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === priority}
            aria-label={`Prioridad ${star} de 5`}
            onClick={() => setPriority(star)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setPriority(star);
              }
            }}
            className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded transition-transform hover:scale-110"
          >
            {star <= priority ? (
              <StarSolid className="h-6 w-6 text-yellow-500" aria-hidden="true" />
            ) : (
              <StarOutline className="h-6 w-6 text-gray-300 hover:text-yellow-400" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del proyecto *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Lanzamiento de producto"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente el proyecto..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej: Desarrollo, Marketing, Personal..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              {renderPriorityStars()}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha meta de finalización
                </label>
                <input
                  type="date"
                  value={targetEndDate}
                  onChange={(e) => setTargetEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etiquetas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Escribe una etiqueta y presiona Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="secondary"
                  size="sm"
                  disabled={!tagInput.trim() || isLoading}
                >
                  Agregar
                </Button>
              </div>
              
              {/* Lista de tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2" role="list" aria-label="Etiquetas del proyecto">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      role="listitem"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        onKeyDown={(e) => {
                          if (e.key === 'Delete' || e.key === 'Backspace') {
                            handleRemoveTag(tag);
                          }
                        }}
                        className="hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                        disabled={isLoading}
                        aria-label={`Eliminar etiqueta ${tag}`}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={handleClose}
                variant="secondary"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isLoading || isAnalyzing}
                disabled={!name.trim() || isAnalyzing}
              >
                {isAnalyzing ? 'Analizando...' : isEditing ? 'Guardar cambios' : 'Crear proyecto'}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
