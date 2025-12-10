import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useTasks, useUpdateTaskStatus } from '@/hooks/useTasks';
import type { Task, TasksFilters } from '@/types/Task.types';

/**
 * Props del componente TaskKanban
 */
interface TaskKanbanProps {
  filters?: TasksFilters;
  onCreateTask?: (status: 'todo' | 'doing' | 'done') => void;
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

/**
 * Componente TaskKanban
 * 
 * Kanban board con 3 columnas (To Do, Doing, Done) y drag & drop:
 * - Arrastra tareas entre columnas
 * - Actualiza estado automáticamente
 * - Botón para crear tarea en cada columna
 */
export const TaskKanban = ({ 
  filters, 
  onCreateTask, 
  onEditTask,
  onDeleteTask 
}: TaskKanbanProps) => {
  const { data: tasks, isLoading } = useTasks(filters);
  const updateTaskStatus = useUpdateTaskStatus();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showOverloadWarning, setShowOverloadWarning] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Agrupar tareas por estado
  const tasksByStatus = {
    todo: tasks?.filter(t => t.status === 'todo') || [],
    doing: tasks?.filter(t => t.status === 'doing') || [],
    done: tasks?.filter(t => t.status === 'done') || [],
  };

  // Check for overload (>5 tasks in Doing)
  const isOverloaded = tasksByStatus.doing.length > 5;
  
  // Show warning when overloaded
  if (isOverloaded && !showOverloadWarning) {
    setShowOverloadWarning(true);
  } else if (!isOverloaded && showOverloadWarning) {
    setShowOverloadWarning(false);
  }

  const columns = [
    { id: 'todo' as const, title: 'To Do', tasks: tasksByStatus.todo },
    { id: 'doing' as const, title: 'Doing', tasks: tasksByStatus.doing },
    { id: 'done' as const, title: 'Done', tasks: tasksByStatus.done },
  ];

  /**
   * Manejar inicio de drag
   */
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks?.find(t => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  /**
   * Manejar fin de drag
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as 'todo' | 'doing' | 'done';

    // Encontrar la tarea
    const task = tasks?.find(t => t.id === taskId);
    
    if (!task || task.status === newStatus) return;

    // Actualizar estado
    await updateTaskStatus.mutateAsync({ id: taskId, status: newStatus });
  };

  /**
   * Renderizar columna del Kanban
   */
  const renderColumn = (column: typeof columns[0]) => {
    return (
      <div
        key={column.id}
        className="flex-1 min-w-[280px] bg-gray-50 rounded-lg p-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {column.title} ({column.tasks.length})
          </h3>
          <button
            onClick={() => onCreateTask?.(column.id)}
            className="p-1 text-gray-500 hover:text-primary hover:bg-white rounded transition-colors"
            title={`Nueva tarea en ${column.title}`}
            aria-label={`Crear nueva tarea en ${column.title}`}
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Drop zone con tareas */}
        <SortableContext
          id={column.id}
          items={column.tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 min-h-[200px]">
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => onEditTask?.(task.id)}
                onDelete={() => onDeleteTask?.(task.id)}
              />
            ))}

            {/* Empty state */}
            {column.tasks.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No hay tareas aquí
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 min-w-[280px] bg-gray-50 rounded-lg p-4">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Overload Warning */}
      {showOverloadWarning && (
        <div className="mb-4 p-4 bg-warning/10 border border-warning/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              ⚠️
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-warning-dark mb-1">
                Sobrecarga Detectada
              </h4>
              <p className="text-sm text-gray-700">
                Tienes {tasksByStatus.doing.length} tareas en progreso. Se recomienda mantener máximo 5 
                para mantener el foco. Considera completar algunas antes de empezar nuevas.
              </p>
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(renderColumn)}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask && (
            <div className="opacity-90">
              <TaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
};
