import { usePeople, useDeletePerson } from '@/hooks/usePeople';
import { PersonCard } from './PersonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import type { PeopleFilters } from '@/types/Person.types';

/**
 * Props del componente PersonList
 */
interface PersonListProps {
  filters?: PeopleFilters;
  onEdit?: (personId: string) => void;
  onLogInteraction?: (personId: string) => void;
}

/**
 * Componente PersonList
 * 
 * Lista de personas con:
 * - Grid responsive
 * - Loading state
 * - Empty state
 * - Error handling
 */
export const PersonList = ({ filters, onEdit, onLogInteraction }: PersonListProps) => {
  const { data: people, isLoading, error } = usePeople(filters);
  const deletePerson = useDeletePerson();

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
          >
            <div className="flex gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-full" />
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
    const handleRetry = () => window.location.reload();
    
    return (
      <div className="bg-white rounded-lg border-2 border-error/20 p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-error font-medium mb-2">No pudimos cargar tus contactos</p>
        <p className="text-sm text-gray-600 mb-4">
          Verifica tu conexión e intenta nuevamente
        </p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Empty state
  if (!people || people.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <UserGroupIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay contactos aún
        </h3>
        <p className="text-gray-600 mb-6">
          Añade personas importantes para mantener tus relaciones organizadas
        </p>
      </div>
    );
  }

  // Grid de personas
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((person) => (
        <PersonCard 
          key={person.id} 
          person={person}
          onEdit={() => onEdit?.(person.id)}
          onLogInteraction={() => onLogInteraction?.(person.id)}
        />
      ))}
    </div>
  );
};
