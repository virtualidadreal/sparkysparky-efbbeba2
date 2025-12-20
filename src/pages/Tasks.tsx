import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TaskKanban, TaskForm } from '@/components/tasks';
import { useProjects } from '@/hooks/useProjects';
import { useDeleteTask, useTask } from '@/hooks/useTasks';
import type { TasksFilters } from '@/types/Task.types';
import { useIsAdmin } from '@/hooks/useAdmin';
import { SparkyChat } from '@/components/chat/SparkyChat';
import { QuickCapturePopup } from '@/components/dashboard/QuickCapturePopup';
import {
  Home,
  Users,
  Settings,
  Plus,
  Lightbulb,
  TrendingUp,
  FolderOpen,
  CheckSquare,
  Brain,
  BarChart3,
  ShieldCheck,
  Mic,
} from 'lucide-react';

/**
 * Página Tasks con estilo Dashboard
 */
const Tasks = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<string>('todo');
  const location = useLocation();
  const { data: isAdmin } = useIsAdmin();

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
    <div className="min-h-screen bg-[hsl(220,14%,96%)] p-3">
      {/* 3-column grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-3 max-w-[1800px] mx-auto min-h-[calc(100vh-24px)]">
        
        {/* Left Sidebar */}
        <div className="flex flex-col">
          <div className="bg-card rounded-[24px] p-4 shadow-sm flex flex-col flex-1">
            {/* Nav Items */}
            <nav className="space-y-0.5 flex-1">
              {[
                { to: '/dashboard', icon: Home, label: 'Dashboard' },
                { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
                { to: '/projects', icon: FolderOpen, label: 'Proyectos' },
                { to: '/tasks', icon: CheckSquare, label: 'Tareas' },
                { to: '/people', icon: Users, label: 'Personas' },
                { to: '/memory', icon: Brain, label: 'Memoria' },
                { to: '/analytics', icon: BarChart3, label: 'Analytics' },
                { to: '/insights', icon: TrendingUp, label: 'Insights' },
                { to: '/settings', icon: Settings, label: 'Configuración' },
              ].map((item) => {
                const isActive = location.pathname === item.to || 
                  (item.to === '/dashboard' && location.pathname === '/');
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Admin link */}
              {isAdmin && (
                <>
                  <div className="border-t border-border my-3" />
                  <Link
                    to="/admin"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      location.pathname === '/admin'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Admin
                  </Link>
                </>
              )}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <QuickCapturePopup
                trigger={
                  <button className="w-full flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-xl text-muted-foreground text-sm hover:bg-muted transition-colors">
                    <Plus className="h-4 w-4" />
                    Captura rápida
                  </button>
                }
              />

              <SparkyChat
                trigger={
                  <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors">
                    <Mic className="h-4 w-4" />
                    Hablar con Sparky
                  </button>
                }
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between px-2">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Mis Tareas
              </h1>
              <p className="text-muted-foreground mt-1">
                Organiza tus tareas con el tablero Kanban
              </p>
            </div>

            <div className="w-64">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-4 py-3 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground shadow-sm"
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

          {/* Kanban */}
          <div className="bg-card rounded-[24px] p-5 shadow-sm flex-1 overflow-hidden">
            <TaskKanban
              filters={filters}
              onCreateTask={handleCreateTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="bg-card rounded-[24px] p-5 shadow-sm flex flex-col">
          {/* Nueva Tarea */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              ACCIONES RÁPIDAS
            </h3>
            <button 
              onClick={() => handleCreateTask('todo')}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nueva Tarea
            </button>
          </div>

          {/* Separador */}
          <div className="border-t border-border mb-6" />

          {/* Tips */}
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              CONSEJOS
            </h3>
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  ✅ Arrastra las tareas entre columnas para cambiar su estado.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  📅 Usa fechas límite para priorizar mejor.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  🎯 Filtra por proyecto para enfocarte.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        task={editingTask}
        defaultStatus={defaultStatus}
      />
    </div>
  );
};

export default Tasks;
