import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge } from '@/components/common';
import { useIdeas } from '@/hooks/useIdeas';
import { Skeleton } from '@/components/ui/skeleton';
import { LightBulbIcon, ClockIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { IdeaPreviewModal } from '@/components/ideas/IdeaPreviewModal';
import type { Idea } from '@/types/Idea.types';

/**
 * Componente RecentIdeas
 * 
 * Muestra las últimas 5 ideas capturadas
 */
export const RecentIdeas = () => {
  const { data: ideas, isLoading, error } = useIdeas({ status: 'active' });
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  if (isLoading) {
    return (
      <Card padding="lg">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
            <LightBulbIcon className="h-6 w-6 text-error" />
          </div>
          <div className="flex-1">
            <p className="text-error font-medium">No se pudieron cargar las ideas</p>
            <p className="text-sm text-gray-500">Intenta recargar la página</p>
          </div>
        </div>
      </Card>
    );
  }

  const recentIdeas = ideas?.slice(0, 5) || [];
  const hasIdeas = recentIdeas.length > 0;

  return (
    <>
      <Card variant="hoverable" padding="lg">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
            <LightBulbIcon className="h-6 w-6 text-warning" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Ideas Recientes
              </h3>
              {hasIdeas && (
                <Link
                  to="/ideas"
                  className="text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  Ver todas →
                </Link>
              )}
            </div>

            {!hasIdeas ? (
              <p className="text-sm text-gray-500">
                No hay ideas aún. ¡Captura tu primera idea arriba!
              </p>
            ) : (
              <div className="space-y-3 mt-4">
                {recentIdeas.map((idea) => (
                  <button
                    key={idea.id}
                    onClick={() => setSelectedIdea(idea)}
                    className="block w-full text-left group"
                  >
                    <div className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                          {idea.title || idea.original_content}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <ClockIcon className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(idea.created_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                          {idea.tags.length > 0 && (
                            <Badge
                              text={idea.tags[0]}
                              variant="neutral"
                              size="sm"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Modal de preview */}
      {selectedIdea && (
        <IdeaPreviewModal
          isOpen={!!selectedIdea}
          onClose={() => setSelectedIdea(null)}
          idea={selectedIdea}
        />
      )}
    </>
  );
};
