import { useIdeas, useArchiveIdea, useDeleteIdea } from '@/hooks/useIdeas';
import { IdeaCard } from './IdeaCard';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import { Skeleton } from '@/components/ui/skeleton';
import type { IdeasFilters } from '@/types/Idea.types';
import toast from 'react-hot-toast';

/**
 * Props del componente IdeaList
 */
interface IdeaListProps {
  filters?: IdeasFilters;
}

/**
 * Componente IdeaList
 * 
 * Lista de ideas con:
 * - Grid responsive
 * - Loading state
 * - Empty state
 * - Error handling
 * - Acciones (editar, archivar, eliminar)
 */
export const IdeaList = ({ filters }: IdeaListProps) => {
  const { data: ideas, isLoading, error } = useIdeas(filters);
  const archiveIdea = useArchiveIdea();
  const deleteIdea = useDeleteIdea();

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-transparent rounded-lg border border-border/50 p-4 space-y-3"
          >
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    const handleRetry = () => window.location.reload();
    
    return (
      <div className="bg-transparent rounded-lg border border-dashed border-destructive/30 p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-destructive font-medium mb-2">No pudimos cargar tus ideas</p>
        <p className="text-sm text-muted-foreground mb-4">
          Verifica tu conexión e intenta nuevamente
        </p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Empty state
  if (!ideas || ideas.length === 0) {
    return (
      <div className="bg-transparent rounded-lg border border-dashed border-border/70 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          <LightBulbIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No hay ideas aún
        </h3>
        <p className="text-muted-foreground mb-2">
          Pulsa el botón <span className="inline-flex items-center justify-center w-6 h-6 bg-primary rounded-full text-primary-foreground text-xs font-bold mx-1">+</span> amarillo para capturar tu primera idea
        </p>
      </div>
    );
  }

  // Handlers para acciones
  const handleEdit = (ideaId: string) => {
    // TODO: Navegar a edición o abrir modal
    toast.success('Función de edición próximamente');
  };

  const handleArchive = async (ideaId: string) => {
    try {
      await archiveIdea.mutateAsync(ideaId);
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const handleDelete = async (ideaId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta idea?')) {
      try {
        await deleteIdea.mutateAsync(ideaId);
      } catch (error) {
        // Error ya manejado en el hook
      }
    }
  };

  // Grid de ideas
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ideas.map((idea) => (
        <IdeaCard 
          key={idea.id} 
          idea={idea}
          onEdit={() => handleEdit(idea.id)}
          onArchive={() => handleArchive(idea.id)}
          onDelete={() => handleDelete(idea.id)}
        />
      ))}
    </div>
  );
};
