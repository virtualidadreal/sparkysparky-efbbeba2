import { Card } from '@/components/common';
import type { DiaryEntry } from '@/types/DiaryEntry.types';
import { ClockIcon, MapPinIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import clsx from 'clsx';

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TIME_OF_DAY_LABELS = {
  morning: '🌅 Mañana',
  afternoon: '☀️ Tarde',
  evening: '🌆 Noche',
  night: '🌙 Noche',
};

const SENTIMENT_COLORS = {
  positive: 'bg-green-100 text-green-800',
  neutral: 'bg-gray-100 text-gray-800',
  negative: 'bg-red-100 text-red-800',
};

const SENTIMENT_LABELS = {
  positive: 'Positivo',
  neutral: 'Neutral',
  negative: 'Negativo',
};

/**
 * Componente DiaryEntryCard
 * 
 * Tarjeta para mostrar una entrada de diario con:
 * - Contenido y título
 * - Análisis emocional
 * - Momento del día
 * - Ubicación
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
          <h3 className="font-semibold text-gray-900 mb-2 pr-20">
            {entry.title}
          </h3>
        )}

        {/* Contenido */}
        <p className="text-gray-700 mb-3 whitespace-pre-wrap line-clamp-4">
          {entry.content}
        </p>

        {/* Mood score visual */}
        {entry.mood_score && (
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Estado de ánimo:</span>
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'w-2 h-6 rounded-sm',
                      i < entry.mood_score!
                        ? entry.mood_score! >= 7
                          ? 'bg-green-500'
                          : entry.mood_score! >= 4
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                        : 'bg-gray-200'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {entry.mood_score}/10
              </span>
            </div>
          </div>
        )}

        {/* Emociones */}
        {entry.emotions && entry.emotions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {entry.emotions.slice(0, 4).map((emotion, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-medium"
              >
                {emotion.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center gap-3">
            {/* Timestamp */}
            <div className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(entry.created_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>

            {/* Momento del día */}
            {entry.time_of_day && (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                {TIME_OF_DAY_LABELS[entry.time_of_day]}
              </span>
            )}

            {/* Ubicación */}
            {entry.location_name && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-3 w-3" />
                <span>{entry.location_name}</span>
              </div>
            )}
          </div>

          {/* Sentimiento */}
          {entry.sentiment && (
            <span
              className={clsx(
                'px-2 py-1 rounded-md text-xs font-medium',
                SENTIMENT_COLORS[entry.sentiment]
              )}
            >
              {SENTIMENT_LABELS[entry.sentiment]}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};
