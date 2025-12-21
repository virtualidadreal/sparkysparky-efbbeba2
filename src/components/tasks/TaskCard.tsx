import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/common';
import type { Task } from '@/types/Task.types';
import { 
  PencilIcon, 
  TrashIcon, 
  CalendarIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { format, isPast, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Nivel de anidamiento (0 = tarea principal, 1+ = subtarea) */
  nestingLevel?: number;
}

export const TaskCard = ({ task, onEdit, onDelete, nestingLevel = 0 }: TaskCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const { data: allProjects } = useProjects();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const project = task.project_id 
    ? allProjects?.find(p => p.id === task.project_id)
    : null;

  const getDueDateStatus = () => {
    if (!task.due_date) return null;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const daysUntilDue = differenceInDays(dueDate, today);

    if (isPast(dueDate) && daysUntilDue < 0) {
      return { label: 'Vencida', variant: 'error' };
    } else if (daysUntilDue <= 3) {
      return { label: format(dueDate, 'dd MMM', { locale: es }), variant: 'warning' };
    } else {
      return { label: format(dueDate, 'dd MMM', { locale: es }), variant: 'neutral' };
    }
  };

  const dueDateStatus = getDueDateStatus();
  const priorityLabel = task.priority === 'high' ? 'Alta' : task.priority === 'low' ? 'Baja' : 'Media';

  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    action?.();
  };

  // Calcular margen izquierdo basado en nivel de anidamiento
  const marginLeft = nestingLevel > 0 ? `${nestingLevel * 24}px` : '0';

  return (
    <div style={{ marginLeft }}>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        className={`bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative group ${
          nestingLevel > 0 ? 'border-gray-300 border-l-2 border-l-primary/40' : 'border-gray-200'
        }`}
      >
        {showActions && (
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            {onEdit && (
              <button onClick={(e) => handleAction(e, onEdit)} className="p-1.5 bg-white rounded shadow-sm hover:bg-gray-50">
                <PencilIcon className="h-3.5 w-3.5 text-gray-600" />
              </button>
            )}
            {onDelete && (
              <button onClick={(e) => handleAction(e, onDelete)} className="p-1.5 bg-white rounded shadow-sm hover:bg-red-50">
                <TrashIcon className="h-3.5 w-3.5 text-red-600" />
              </button>
            )}
          </div>
        )}

        <h4 className={`font-medium text-gray-900 mb-2 pr-16 line-clamp-2 ${nestingLevel > 0 ? 'text-sm' : ''}`}>
          {task.title}
        </h4>
        {task.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>}
        
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">Prioridad:</span>
          <Badge text={priorityLabel} variant={task.priority === 'high' ? 'error' : task.priority === 'low' ? 'neutral' : 'warning'} size="sm" />
        </div>

        {dueDateStatus && (
          <div className="flex items-center gap-1 mb-2">
            <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
            <Badge text={dueDateStatus.label} variant={dueDateStatus.variant as any} size="sm" />
          </div>
        )}

        {project && (
          <div className="flex items-center gap-1 mb-2">
            <FolderIcon className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-600 truncate">{project.title}</span>
          </div>
        )}
      </div>

      {/* Renderizar subtareas anidadas */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-2 space-y-2">
          {task.subtasks.map((subtask) => (
            <TaskCard
              key={subtask.id}
              task={subtask}
              onEdit={onEdit ? () => onEdit() : undefined}
              onDelete={onDelete ? () => onDelete() : undefined}
              nestingLevel={nestingLevel + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
