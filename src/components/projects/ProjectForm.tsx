import { useState, useEffect, FormEvent } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PlusIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common';
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@/types/Project.types';
import clsx from 'clsx';

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
 * Modal para crear o editar proyectos con soporte para tags y keywords
 */
export const ProjectForm = ({ isOpen, onClose, project }: ProjectFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  // Sincronizar estado cuando cambia el proyecto o se abre el modal
  useEffect(() => {
    if (isOpen && project) {
      setTitle(project.title || '');
      setDescription(project.description || '');
      setStatus(project.status || 'active');
      setDueDate(project.due_date || '');
      setTags(project.tags || []);
      setKeywords(project.keywords || []);
    } else if (isOpen && !project) {
      // Reset para nuevo proyecto
      setTitle('');
      setDescription('');
      setStatus('active');
      setDueDate('');
      setTags([]);
      setKeywords([]);
    }
  }, [isOpen, project]);

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const isEditing = !!project;
  const isLoading = createProject.isPending || updateProject.isPending;

  const statuses = [
    { value: 'active', label: 'Activo' },
    { value: 'paused', label: 'Pausado' },
    { value: 'completed', label: 'Completado' },
    { value: 'archived', label: 'Archivado' },
  ];

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddKeyword = () => {
    const keyword = newKeyword.trim().toLowerCase();
    if (keyword && !keywords.includes(keyword)) {
      setKeywords([...keywords, keyword]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      const projectData = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        due_date: dueDate || undefined,
        tags,
        keywords,
      };

      if (isEditing && project) {
        await updateProject.mutateAsync({
          id: project.id,
          updates: projectData as UpdateProjectInput,
        });
      } else {
        await createProject.mutateAsync(projectData as CreateProjectInput);
      }

      handleClose();
    } catch (error) {
      // Los errores se manejan en los hooks con toast
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle('');
      setDescription('');
      setStatus('active');
      setDueDate('');
      setTags([]);
      setKeywords([]);
      setNewTag('');
      setNewKeyword('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-card rounded-lg shadow-xl border border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Dialog.Title className="text-xl font-semibold text-foreground">
              {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Título del proyecto *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Lanzamiento de producto"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente el proyecto..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Tags para auto-vinculación */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Etiquetas (para auto-vincular ideas)
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Las ideas con estas etiquetas se vincularán automáticamente
              </p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Añadir etiqueta..."
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || isLoading}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Keywords para auto-vinculación */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Palabras clave (para detectar en contenido)
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Si el contenido menciona estas palabras, se vincula al proyecto
              </p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  placeholder="Añadir palabra clave..."
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddKeyword}
                  disabled={!newKeyword.trim() || isLoading}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="hover:text-destructive"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Fecha meta
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              />
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
                loading={isLoading}
                disabled={!title.trim()}
              >
                {isEditing ? 'Guardar cambios' : 'Crear proyecto'}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
