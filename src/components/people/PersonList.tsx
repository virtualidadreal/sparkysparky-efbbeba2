import { usePeople } from '@/hooks/usePeople';
import { PersonCard } from './PersonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import type { PeopleFilters } from '@/types/Person.types';

interface PersonListProps {
  filters?: PeopleFilters;
  onEdit?: (personId: string) => void;
}

/**
 * Componente PersonList
 */
export const PersonList = ({ filters, onEdit }: PersonListProps) => {
  const { data: people, isLoading, error } = usePeople(filters);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
            <div className="flex gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border-2 border-red-200 p-8 text-center">
        <p className="text-red-600">Error al cargar contactos</p>
      </div>
    );
  }

  if (!people || people.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <UserGroupIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay contactos aún</h3>
        <p className="text-gray-600">Añade personas importantes para mantener tus relaciones organizadas</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((person) => (
        <PersonCard 
          key={person.id} 
          person={person}
          onEdit={onEdit ? () => onEdit(person.id) : undefined}
        />
      ))}
    </div>
  );
};
