import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { TaskKanban, TaskForm } from '@/components/tasks';
import { useProjects } from '@/hooks/useProjects';
import { useDeleteTask, useTask } from '@/hooks/useTasks';
import type { TasksFilters } from '@/types/Task.types';

/**
 * Página Tasks
 */
const Tasks = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<string>('todo');

  const { data: activeProjects } = useProjects({ status: 'active' });
  const deleteTask = useDeleteTask();
  const { data: editingTask } = useTask(editingTaskId || '');

  const filters: TasksFilters = {
    ...(selectedProjectId && { project_id: selectedProjectId }),
  };

  const handleCreateTask = (status: string) => {
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
      } catch (error) {}
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTaskId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mis Tareas</h1>
            <p className="text-muted-foreground">Organiza tus tareas con el tablero Kanban</p>
          </div>

          <div className="w-64">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/60 dark:bg-card/60 backdrop-blur-lg border border-white/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(217,91%,60%)]/50 text-foreground"
            >
              <option value="">Todos los proyectos</option>
              {activeProjects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <TaskKanban
          filters={filters}
          onCreateTask={handleCreateTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />

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
