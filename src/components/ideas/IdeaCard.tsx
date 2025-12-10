import { Card, Badge } from '@/components/common';
import { IdeaPreviewModal } from './IdeaPreviewModal';
import { TagSelector } from './TagSelector';
import type { Idea } from '@/types/Idea.types';
import { 
  MicrophoneIcon, 
  ClockIcon, 
  PencilIcon, 
  ArchiveBoxIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

/**
 * Props del componente IdeaCard
 */
interface IdeaCardProps {
  idea: Idea;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

/**
 * Componente IdeaCard
 * 
 * Tarjeta para mostrar una idea con:
 * - Título o preview del contenido
 * - Indicador de audio si existe
 * - Tags
 * - Timestamp
 * - Sentiment
 */
export const IdeaCard = ({ idea, onEdit, onArchive, onDelete }: IdeaCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const displayTitle = idea.title || idea.original_content;
  const hasAudio = !!idea.audio_url;

  // Color del sentimiento
  const sentimentColors = {
    positive: 'success',
    neutral: 'neutral',
    negative: 'error',
  };

  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action?.();
  };

  return (
    <>
      <div 
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onClick={() => setIsPreviewOpen(true)}
        className="block group cursor-pointer"
      >
      <Card 
        variant="hoverable" 
        padding="md" 
        className="h-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative"
      >
        {/* Botones de acción (visible en hover) */}
        {showActions && (
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            {onEdit && (
              <button
                onClick={(e) => handleAction(e, onEdit)}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title="Editar"
                aria-label="Editar idea"
              >
                <PencilIcon className="h-4 w-4 text-gray-600" />
              </button>
            )}
            {onArchive && (
              <button
                onClick={(e) => handleAction(e, onArchive)}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title="Archivar"
                aria-label="Archivar idea"
              >
                <ArchiveBoxIcon className="h-4 w-4 text-gray-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => handleAction(e, onDelete)}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                title="Eliminar"
                aria-label="Eliminar idea"
              >
                <TrashIcon className="h-4 w-4 text-red-600" />
              </button>
            )}
          </div>
        )}

        {/* Header con título e icono de audio */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-gray-900 flex-1 line-clamp-2 pr-24">
            {displayTitle}
          </h3>
          {hasAudio && (
            <div className="flex-shrink-0" title="Capturada por voz" aria-label="Idea capturada por voz">
              <MicrophoneIcon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Contenido (si hay título, mostrar preview del contenido) */}
        {idea.title && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {idea.original_content}
          </p>
        )}

        {/* Etiquetas inteligentes multidimensionales */}
        <div className="mb-3">
          <TagSelector ideaId={idea.id} />
        </div>

        {/* Footer: timestamp y sentiment */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(idea.created_at), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          </div>
          
          {idea.sentiment && (
            <Badge
              text={
                idea.sentiment === 'positive'
                  ? 'Positivo'
                  : idea.sentiment === 'negative'
                  ? 'Negativo'
                  : 'Neutral'
              }
              variant={sentimentColors[idea.sentiment] as any}
              size="sm"
            />
          )}
        </div>
      </Card>
    </div>

    <IdeaPreviewModal
      isOpen={isPreviewOpen}
      onClose={() => setIsPreviewOpen(false)}
      idea={idea}
    />
  </>
  );
};
