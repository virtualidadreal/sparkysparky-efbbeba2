import { Card } from '@/components/common';
import { IdeaPreviewModal } from './IdeaPreviewModal';
import type { Idea } from '@/types/Idea.types';
import { 
  PencilIcon, 
  ArchiveBoxIcon, 
  TrashIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { useIdeaProject } from '@/hooks/useRelatedIdeas';

interface IdeaCardProps {
  idea: Idea;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

/**
 * IdeaCard compacta - Muestra título + summary truncado + proyecto + fecha
 */
export const IdeaCard = ({ idea, onEdit, onArchive, onDelete }: IdeaCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { data: linkedProject } = useIdeaProject(idea.project_id);

  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action?.();
  };

  // Usar summary o description para el preview
  const previewText = idea.summary || idea.description || idea.original_content || '';
  const projectName = linkedProject?.title || 'Ideas sueltas';

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
          className="h-full transition-all duration-200 hover:shadow-md hover:scale-[1.01] relative"
        >
          {/* Botones de acción (visible en hover) */}
          {showActions && (
            <div className="absolute top-3 right-3 flex gap-1.5 z-10">
              {onEdit && (
                <button
                  onClick={(e) => handleAction(e, onEdit)}
                  className="p-1.5 bg-card rounded-lg shadow-sm border border-border hover:bg-muted transition-colors"
                  title="Editar"
                >
                  <PencilIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
              {onArchive && (
                <button
                  onClick={(e) => handleAction(e, onArchive)}
                  className="p-1.5 bg-card rounded-lg shadow-sm border border-border hover:bg-muted transition-colors"
                  title="Archivar"
                >
                  <ArchiveBoxIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => handleAction(e, onDelete)}
                  className="p-1.5 bg-card rounded-lg shadow-sm border border-border hover:bg-destructive/10 transition-colors"
                  title="Eliminar"
                >
                  <TrashIcon className="h-3.5 w-3.5 text-destructive" />
                </button>
              )}
            </div>
          )}

          {/* Título */}
          <h3 className="font-semibold text-foreground line-clamp-2 pr-20 mb-2">
            {idea.title}
          </h3>

          {/* Summary truncado */}
          {previewText && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {previewText}
            </p>
          )}

          {/* Footer: Proyecto + Fecha */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <FolderIcon className="h-3.5 w-3.5" />
              {projectName}
            </span>
            <span>
              {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true, locale: es })}
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
