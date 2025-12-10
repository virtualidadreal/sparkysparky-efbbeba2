import { Link } from 'react-router-dom';
import { Card, Badge } from '@/components/common';
import type { Project } from '@/types/Project.types';
import { 
  PencilIcon, 
  ArchiveBoxIcon, 
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

/**
 * Props del componente ProjectCard
 */
interface ProjectCardProps {
  project: Project;
  onEdit?: () => void;
  onArchive?: () => void;
}

/**
 * Componente ProjectCard
 * 
 * Tarjeta para mostrar un proyecto con:
 * - Título y descripción
 * - Badge de estado
 * - Barra de progreso
 * - Fechas
 */
export const ProjectCard = ({ project, onEdit, onArchive }: ProjectCardProps) => {
  const [showActions, setShowActions] = useState(false);

  // Color del estado
  const statusColors: Record<string, string> = {
    active: 'success',
    paused: 'warning',
    completed: 'primary',
    archived: 'neutral',
  };

  const statusLabels: Record<string, string> = {
    active: 'Activo',
    paused: 'Pausado',
    completed: 'Completado',
    archived: 'Archivado',
  };

  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action?.();
  };

  const status = project.status || 'active';
  const progress = project.progress || 0;

  return (
    <Link 
      to={`/projects/${project.id}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="block group"
    >
      <Card 
        variant="hoverable" 
        padding="md" 
        className="h-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative"
      >
        {/* Botones de acción (visible en hover) */}
        {showActions && status !== 'archived' && (
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            {onEdit && (
              <button
                onClick={(e) => handleAction(e, onEdit)}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title="Editar"
                aria-label="Editar proyecto"
              >
                <PencilIcon className="h-4 w-4 text-gray-600" />
              </button>
            )}
            {onArchive && (
              <button
                onClick={(e) => handleAction(e, onArchive)}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title="Archivar"
                aria-label="Archivar proyecto"
              >
                <ArchiveBoxIcon className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </div>
        )}

        {/* Header con título y estado */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-gray-900 flex-1 line-clamp-1 pr-20">
            {project.title}
          </h3>
          <Badge
            text={statusLabels[status] || status}
            variant={(statusColors[status] || 'neutral') as any}
            size="sm"
          />
        </div>

        {/* Descripción */}
        {project.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Progreso */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Progreso</span>
            <span className="text-sm font-medium text-gray-700">
              {progress}%
            </span>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Fecha */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
          {project.due_date && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>
                Meta: {format(new Date(project.due_date), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
