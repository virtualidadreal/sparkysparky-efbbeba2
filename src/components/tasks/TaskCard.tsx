import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/common';
import type { Task } from '@/types/Task.types';
import { 
  PencilIcon, 
  TrashIcon, 
  CalendarIcon,
  FolderIcon,
  BoltIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { format, isPast, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';

/**
 * Props del componente TaskCard
 */
interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Componente TaskCard
 * 
 * Tarjeta de tarea con drag & drop para:
 * - Título y descripción
 * - Prioridad (estrellas)
 * - Due date con colores según urgencia
 * - Tags
 * - Proyecto asociado
 * - Botones de acción
 */
export const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
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

  // Obtener proyecto asociado
  const project = task.project_id 
    ? allProjects?.find(p => p.id === task.project_id)
    : null;

  // Calcular estado de due date
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

  // Extract energy level and time of day from tags
  const energyTag = task.tags.find(tag => tag.startsWith('energy:'));
  const timeTag = task.tags.find(tag => tag.startsWith('time:'));
  const energyLevel = energyTag ? parseInt(energyTag.split(':')[1]) : null;
  const bestTime = timeTag ? timeTag.split(':')[1] : null;

  // Get time emoji
  const getTimeEmoji = (time: string | null) => {
    switch(time) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌙';
      default: return '⏰';
    }
  };

  // Get time label
  const getTimeLabel = (time: string | null) => {
    switch(time) {
      case 'morning': return 'Mañana';
      case 'afternoon': return 'Tarde';
      case 'evening': return 'Noche';
      default: return 'Cualquier momento';
    }
  };

  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    action?.();
  };

  // Renderizar estrellas de prioridad
  const renderPriorityStars = () => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= task.priority ? (
            <StarSolid key={star} className="h-3 w-3 text-yellow-500" />
          ) : (
            <StarOutline key={star} className="h-3 w-3 text-gray-300" />
          )
        ))}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative group"
    >
      {/* Botones de acción (visible en hover) */}
      {showActions && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          {onEdit && (
            <button
              onClick={(e) => handleAction(e, onEdit)}
              className="p-1.5 bg-white rounded shadow-sm hover:bg-gray-50 transition-colors"
              title="Editar"
              aria-label="Editar tarea"
            >
              <PencilIcon className="h-3.5 w-3.5 text-gray-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => handleAction(e, onDelete)}
              className="p-1.5 bg-white rounded shadow-sm hover:bg-red-50 transition-colors"
              title="Eliminar"
              aria-label="Eliminar tarea"
            >
              <TrashIcon className="h-3.5 w-3.5 text-red-600" />
            </button>
          )}
        </div>
      )}

      {/* Título */}
      <h4 className="font-medium text-gray-900 mb-2 pr-16 line-clamp-2">
        {task.title}
      </h4>

      {/* Urgency Score */}
      {task.urgency_score && task.urgency_score > 0 && (
        <div className="flex items-center gap-1 mb-2">
          <FireIcon className={`h-4 w-4 ${
            task.urgency_score >= 8 ? 'text-red-500' : 
            task.urgency_score >= 5 ? 'text-orange-500' : 
            'text-yellow-500'
          }`} />
          <span className={`text-xs font-medium ${
            task.urgency_score >= 8 ? 'text-red-600' : 
            task.urgency_score >= 5 ? 'text-orange-600' : 
            'text-yellow-600'
          }`}>
            Urgencia: {task.urgency_score}/10
          </span>
        </div>
      )}

      {/* Energy Level & Best Time */}
      {(energyLevel || bestTime) && (
        <div className="flex items-center gap-3 mb-2">
          {energyLevel && (
            <div className="flex items-center gap-1">
              <BoltIcon className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-gray-600">
                Energía {energyLevel}/5
              </span>
            </div>
          )}
          {bestTime && (
            <div className="flex items-center gap-1">
              <span className="text-sm">{getTimeEmoji(bestTime)}</span>
              <span className="text-xs text-gray-600">
                {getTimeLabel(bestTime)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Descripción */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Prioridad */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500">Prioridad:</span>
        {renderPriorityStars()}
      </div>

      {/* Due date */}
      {dueDateStatus && (
        <div className="flex items-center gap-1 mb-2">
          <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
          <Badge
            text={dueDateStatus.label}
            variant={dueDateStatus.variant as any}
            size="sm"
          />
        </div>
      )}

      {/* Proyecto asociado */}
      {project && (
        <div className="flex items-center gap-1 mb-2">
          <FolderIcon className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs text-gray-600 truncate">
            {project.name}
          </span>
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags
            .filter(tag => !tag.startsWith('energy:') && !tag.startsWith('time:'))
            .slice(0, 2)
            .map((tag) => (
              <Badge key={tag} text={tag} variant="primary" size="sm" />
            ))}
          {task.tags.filter(tag => !tag.startsWith('energy:') && !tag.startsWith('time:')).length > 2 && (
            <Badge
              text={`+${task.tags.filter(tag => !tag.startsWith('energy:') && !tag.startsWith('time:')).length - 2}`}
              variant="neutral"
              size="sm"
            />
          )}
        </div>
      )}
    </div>
  );
};
