import { Card, Badge } from '@/components/common';
import type { Person } from '@/types/Person.types';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

/**
 * Props del componente PersonCard
 */
interface PersonCardProps {
  person: Person;
  onEdit?: () => void;
}

/**
 * Componente PersonCard (simplificado)
 * 
 * Tarjeta para mostrar una persona
 * Nota: La tabla "people" no existe aún, este es un placeholder
 */
export const PersonCard = ({ person, onEdit }: PersonCardProps) => {
  const [showActions, setShowActions] = useState(false);

  const categoryLabels: Record<string, string> = {
    family: 'Familia',
    friend: 'Amigo/a',
    colleague: 'Colega',
    mentor: 'Mentor',
    client: 'Cliente',
  };

  // Generar iniciales
  const getInitials = () => {
    const names = person.full_name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return person.full_name.substring(0, 2).toUpperCase();
  };

  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action?.();
  };

  return (
    <div 
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="block group"
    >
      <Card 
        variant="hoverable" 
        padding="md" 
        className="h-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative"
      >
        {/* Botones de acción (visible en hover) */}
        {showActions && onEdit && (
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button
              onClick={(e) => handleAction(e, onEdit)}
              className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              title="Editar"
              aria-label="Editar persona"
            >
              <PencilIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        )}

        {/* Avatar y nombre */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar con iniciales */}
          <div 
            className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold flex-shrink-0"
            role="img"
            aria-label={`Avatar de ${person.full_name}`}
          >
            {getInitials()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Nombre */}
            <h3 className="font-semibold text-gray-900 line-clamp-1 pr-16">
              {person.full_name}
            </h3>
            {/* Nickname */}
            {person.nickname && (
              <p className="text-sm text-gray-500 italic">
                "{person.nickname}"
              </p>
            )}
            {/* Email */}
            {person.email && (
              <p className="text-xs text-gray-500 line-clamp-1">
                {person.email}
              </p>
            )}
          </div>
        </div>

        {/* Categoría */}
        <div className="flex items-center justify-between mb-3">
          <Badge
            text={categoryLabels[person.category] || person.category}
            variant="primary"
            size="sm"
          />
        </div>

        {/* Notas */}
        {person.notes && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {person.notes}
          </p>
        )}
      </Card>
    </div>
  );
};
