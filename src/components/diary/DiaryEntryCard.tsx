import { Card } from '@/components/common';
import type { DiaryEntry } from '@/types/DiaryEntry.types';
import { ClockIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Componente DiaryEntryCard
 * 
 * Tarjeta para mostrar una entrada de diario con:
 * - Contenido y título
 * - Mood (estado de ánimo)
 * - Acciones
 */
export const DiaryEntryCard = ({ entry, onEdit, onDelete }: DiaryEntryCardProps) => {
  const [showActions, setShowActions] = useState(false);

  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action?.();
  };

  return (
    <div 
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="group"
    >
      <Card 
        variant="hoverable" 
        padding="md" 
        className="relative"
      >
        {/* Botones de acción */}
        {showActions && (
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            {onEdit && (
              <button
                onClick={(e) => handleAction(e, onEdit)}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title="Editar"
              >
                <PencilIcon className="h-4 w-4 text-gray-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => handleAction(e, onDelete)}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                title="Eliminar"
              >
                <TrashIcon className="h-4 w-4 text-red-600" />
              </button>
            )}
          </div>
        )}

        {/* Header con título */}
        {entry.title && (
          <h3 className="font-semibold text-foreground mb-2 pr-20">
            {entry.title}
          </h3>
        )}

        {/* Resumen */}
        {entry.summary && (
          <p className="text-sm text-muted-foreground mb-3 italic">
            {entry.summary}
          </p>
        )}

        {/* Contenido */}
        <p className="text-foreground/80 mb-3 whitespace-pre-wrap line-clamp-4">
          {entry.content}
        </p>

        {/* Tags y personas */}
        <div className="flex flex-wrap gap-2 mb-3">
          {entry.tags?.map((tag, i) => (
            <span key={`tag-${i}`} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
              #{tag}
            </span>
          ))}
          {entry.related_people?.map((person, i) => (
            <span key={`person-${i}`} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
              👤 {person}
            </span>
          ))}
        </div>

        {/* Mood badge */}
        {entry.mood && (
          <div className="mb-3">
            <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-md text-xs font-medium">
              {entry.mood}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(entry.created_at), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
