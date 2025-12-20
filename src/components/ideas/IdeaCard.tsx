import { Card, Badge } from '@/components/common';
import { IdeaPreviewModal } from './IdeaPreviewModal';
import { TagSelector } from './TagSelector';
import type { Idea } from '@/types/Idea.types';
import { 
  MicrophoneIcon, 
  ClockIcon, 
  PencilIcon, 
  ArchiveBoxIcon, 
  TrashIcon,
  UserIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { useIdeaProject } from '@/hooks/useRelatedIdeas';

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
 */
export const IdeaCard = ({ idea, onEdit, onArchive, onDelete }: IdeaCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { data: linkedProject } = useIdeaProject(idea.project_id);
  const displayTitle = idea.title || idea.original_content;
  const hasAudio = !!idea.audio_url;

  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action?.();
  };

  const relatedPeople = idea.related_people || [];
  const tags = idea.tags || [];

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
                className="p-2 bg-card rounded-lg shadow-sm border border-border hover:bg-muted transition-colors"
                title="Editar"
                aria-label="Editar idea"
              >
                <PencilIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            {onArchive && (
              <button
                onClick={(e) => handleAction(e, onArchive)}
                className="p-2 bg-card rounded-lg shadow-sm border border-border hover:bg-muted transition-colors"
                title="Archivar"
                aria-label="Archivar idea"
              >
                <ArchiveBoxIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => handleAction(e, onDelete)}
                className="p-2 bg-card rounded-lg shadow-sm border border-border hover:bg-destructive/10 transition-colors"
                title="Eliminar"
                aria-label="Eliminar idea"
              >
                <TrashIcon className="h-4 w-4 text-destructive" />
              </button>
            )}
          </div>
        )}

        {/* Header con título e icono de audio */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-foreground flex-1 line-clamp-2 pr-24">
            {displayTitle}
          </h3>
          {hasAudio && (
            <div className="flex-shrink-0" title="Capturada por voz" aria-label="Idea capturada por voz">
              <MicrophoneIcon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Contenido (si hay título, mostrar preview del contenido) */}
        {idea.title && idea.original_content && idea.original_content !== idea.title && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {idea.original_content}
          </p>
        )}

        {/* Proyecto vinculado */}
        {linkedProject && (
          <div className="flex items-center gap-2 mb-3">
            <FolderIcon className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {linkedProject.title}
            </span>
          </div>
        )}


        {/* Personas relacionadas */}
        {relatedPeople.length > 0 && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <UserIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            {relatedPeople.slice(0, 2).map((person, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
              >
                {person}
              </span>
            ))}
            {relatedPeople.length > 2 && (
              <span className="text-xs text-muted-foreground">+{relatedPeople.length - 2}</span>
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="text-xs text-muted-foreground">+{tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Etiquetas inteligentes multidimensionales */}
        <div className="mb-3">
          <TagSelector ideaId={idea.id} />
        </div>

        {/* Footer: timestamp */}
        <div className="flex items-center text-xs text-muted-foreground">
          <ClockIcon className="h-3 w-3 mr-1" />
          <span>
            {format(new Date(idea.created_at), "d MMM yyyy, HH:mm", { locale: es })}
          </span>
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
