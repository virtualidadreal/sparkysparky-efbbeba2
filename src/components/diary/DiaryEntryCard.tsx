import { Card } from '@/components/common';
import type { DiaryEntry } from '@/types/DiaryEntry.types';
import { ClockIcon, TrashIcon, PencilIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onClick?: () => void;
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
 * - Click para ver detalles
 */
export const DiaryEntryCard = ({ entry, onClick, onEdit, onDelete }: DiaryEntryCardProps) => {
  const [showActions, setShowActions] = useState(false);

  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action?.();
  };

  const handleClick = () => {
    onClick?.();
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
        className="relative cursor-pointer"
        onClick={handleClick}
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

        {/* Emociones detectadas */}
        {entry.detected_emotions && entry.detected_emotions.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {entry.detected_emotions.map((emotion, i) => (
              <span 
                key={`emotion-${i}`} 
                className="px-2 py-1 bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 rounded-md text-xs font-medium"
              >
                {emotion}
              </span>
            ))}
          </div>
        )}

        {/* Sentimiento */}
        {entry.sentiment && (
          <div className="mb-3">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
              entry.sentiment === 'positive' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                : entry.sentiment === 'negative'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
            }`}>
              {entry.sentiment === 'positive' ? '😊 Positivo' : entry.sentiment === 'negative' ? '😔 Negativo' : '😐 Neutral'}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>{format(new Date(entry.entry_date), "d 'de' MMMM yyyy", { locale: es })}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              <span>{format(new Date(entry.created_at), 'HH:mm', { locale: es })}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
