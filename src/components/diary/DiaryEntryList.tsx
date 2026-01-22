import { useDiaryEntries, useDeleteDiaryEntry } from '@/hooks/useDiaryEntries';
import { DiaryEntryCard } from './DiaryEntryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import type { DiaryEntriesFilters, DiaryEntry } from '@/types/DiaryEntry.types';

interface DiaryEntryListProps {
  filters?: DiaryEntriesFilters;
  onEdit?: (entryId: string) => void;
  onView?: (entry: DiaryEntry) => void;
}

/**
 * Componente DiaryEntryList
 * 
 * Lista de entradas de diario con:
 * - Grid responsive
 * - Loading state
 * - Empty state
 * - Acciones (ver, editar, eliminar)
 */
export const DiaryEntryList = ({ filters, onEdit, onView }: DiaryEntryListProps) => {
  const { data: entries, isLoading, error } = useDiaryEntries(filters);
  const deleteEntry = useDeleteDiaryEntry();

  const handleView = (entry: DiaryEntry) => {
    onView?.(entry);
  };

  const handleEdit = (entryId: string) => {
    onEdit?.(entryId);
  };

  const handleDelete = async (entryId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
      try {
        await deleteEntry.mutateAsync(entryId);
      } catch (error) {
        // Error ya manejado en el hook
      }
    }
  };

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
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-transparent rounded-lg border border-dashed border-destructive/30 p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-destructive font-medium mb-2">No pudimos cargar tus entradas</p>
        <p className="text-sm text-muted-foreground">Verifica tu conexión e intenta nuevamente</p>
      </div>
    );
  }

  // Empty state
  if (!entries || entries.length === 0) {
    return (
      <div className="bg-transparent rounded-lg border border-dashed border-border/70 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          <BookOpenIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No hay entradas aún
        </h3>
        <p className="text-muted-foreground mb-2">
          Pulsa el botón <span className="inline-flex items-center justify-center w-6 h-6 bg-primary rounded-full text-primary-foreground text-xs font-bold mx-1">+</span> y escribe "diario:" para crear tu primera entrada
        </p>
      </div>
    );
  }

  // Grid de entradas
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <DiaryEntryCard 
          key={entry.id} 
          entry={entry}
          onClick={() => handleView(entry)}
          onEdit={() => handleEdit(entry.id)}
          onDelete={() => handleDelete(entry.id)}
        />
      ))}
    </div>
  );
};
