import { useState, FormEvent, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/common';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types/Task.types';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

/**
 * Props del componente TaskForm
 */
interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultStatus?: 'todo' | 'doing' | 'done';
}

/**
 * Componente TaskForm
 * 
 * Modal para crear o editar tareas
 */
export const TaskForm = ({ isOpen, onClose, task, defaultStatus }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(3);
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const { data: projects } = useProjects({ status: 'active' });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isEditing = !!task;
  const isLoading = createTask.isPending || updateTask.isPending;

  // Sincronizar estados cuando cambie la tarea
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 3);
      setDueDate(task.due_date || '');
      setProjectId(task.project_id || '');
      setTags(task.tags || []);
    } else {
      // Limpiar cuando no hay tarea (modo creación)
      setTitle('');
      setDescription('');
      setPriority(3);
      setDueDate('');
      setProjectId('');
      setTags([]);
    }
    setTagInput('');
  }, [task]);

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        project_id: projectId || undefined,
        tags,
      };

      if (isEditing) {
        await updateTask.mutateAsync({
          id: task.id,
          updates: taskData as UpdateTaskInput,
        });
        handleClose();
      } else {
        const newTask = await createTask.mutateAsync(taskData as CreateTaskInput);
        
        // Analyze task with AI in background
        setIsAnalyzing(true);
        const analyzeToast = toast.loading('Analizando tarea con IA...');
        
        try {
          const { error } = await supabase.functions.invoke('analyze-task', {
            body: { taskId: newTask.id }
          });
          
          if (error) throw error;
          
          toast.success('Tarea analizada exitosamente', { id: analyzeToast });
        } catch (error) {
          console.error('Error analyzing task:', error);
          toast.error('Error al analizar tarea', { id: analyzeToast });
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
      setTitle('');
      setDescription('');
      setPriority(3);
      setDueDate('');
      setProjectId('');
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
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Prioridad de la tarea">
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
              {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
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
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Completar presentación"
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
                placeholder="Detalles de la tarea..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Prioridad y Fecha */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                {renderPriorityStars()}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha límite
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Proyecto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proyecto
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                disabled={isLoading}
              >
                <option value="">Sin proyecto</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
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
                <div className="flex flex-wrap gap-2" role="list" aria-label="Etiquetas de la tarea">
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
                disabled={!title.trim() || isAnalyzing}
              >
                {isAnalyzing ? 'Analizando...' : isEditing ? 'Guardar cambios' : 'Crear tarea'}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
