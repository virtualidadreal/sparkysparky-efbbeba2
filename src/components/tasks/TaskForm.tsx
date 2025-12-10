import { useState, FormEvent, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types/Task.types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultStatus?: string;
}

export const TaskForm = ({ isOpen, onClose, task }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');

  const { data: projects } = useProjects({ status: 'active' });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isEditing = !!task;
  const isLoading = createTask.isPending || updateTask.isPending;

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.due_date || '');
      setProjectId(task.project_id || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setProjectId('');
    }
  }, [task]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const taskData: CreateTaskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        project_id: projectId || undefined,
      };

      if (isEditing && task) {
        await updateTask.mutateAsync({ id: task.id, updates: taskData as UpdateTaskInput });
      } else {
        await createTask.mutateAsync(taskData);
      }
      handleClose();
    } catch (error) {}
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle(''); setDescription(''); setPriority('medium'); setDueDate(''); setProjectId('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-xl font-semibold">{isEditing ? 'Editar Tarea' : 'Nueva Tarea'}</Dialog.Title>
            <button onClick={handleClose} disabled={isLoading}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" required disabled={isLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-md resize-none" disabled={isLoading} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white" disabled={isLoading}>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" disabled={isLoading} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white" disabled={isLoading}>
                <option value="">Sin proyecto</option>
                {projects?.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" onClick={handleClose} variant="secondary" disabled={isLoading}>Cancelar</Button>
              <Button type="submit" variant="primary" loading={isLoading} disabled={!title.trim()}>{isEditing ? 'Guardar' : 'Crear'}</Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
