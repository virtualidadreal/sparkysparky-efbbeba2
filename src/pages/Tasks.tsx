import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { TaskKanban, TaskForm } from '@/components/tasks';
import { useProjects } from '@/hooks/useProjects';
import { useDeleteTask, useTask } from '@/hooks/useTasks';
import type { TasksFilters } from '@/types/Task.types';

/**
 * Página Tasks
 * 
 * Vista principal del módulo de tareas con:
 * - Filtro por proyecto
 * - Kanban board con drag & drop
 * - Modal de formulario
 */
const Tasks = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<'todo' | 'doing' | 'done'>('todo');

  const { data: activeProjects } = useProjects({ status: 'active' });
  const deleteTask = useDeleteTask();
  
  // Cargar tarea si se está editando
  const { data: editingTask } = useTask(editingTaskId || '');

  // Construir filtros
  const filters: TasksFilters = {
    ...(selectedProjectId && { project_id: selectedProjectId }),
  };

  const handleCreateTask = (status: 'todo' | 'doing' | 'done') => {
    setDefaultStatus(status);
    setEditingTaskId(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
    setIsFormOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await deleteTask.mutateAsync(taskId);
      } catch (error) {
        // Error ya manejado en el hook
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTaskId(null);
  };

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Tareas</h1>
            <p className="text-gray-600">
              Organiza tus tareas con el tablero Kanban
            </p>
          </div>

          {/* Filtro por proyecto */}
          <div className="w-64">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="">Todos los proyectos</option>
              {activeProjects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Kanban Board */}
        <TaskKanban
          filters={filters}
          onCreateTask={handleCreateTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />

        {/* Modal de formulario */}
        <TaskForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          task={editingTask}
          defaultStatus={defaultStatus}
        />
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
