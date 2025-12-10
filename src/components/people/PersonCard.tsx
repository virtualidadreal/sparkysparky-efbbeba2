import { Link } from 'react-router-dom';
import { Card, Badge } from '@/components/common';
import type { Person } from '@/types/Person.types';
import { 
  PencilIcon, 
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

/**
 * Props del componente PersonCard
 */
interface PersonCardProps {
  person: Person;
  onEdit?: () => void;
  onLogInteraction?: () => void;
}

/**
 * Componente PersonCard
 * 
 * Tarjeta para mostrar una persona con:
 * - Avatar con iniciales
 * - Nombre y nickname
 * - Badge de categoría
 * - Nivel de importancia (estrellas)
 * - Último contacto
 * - Banner de atención si necesita
 * - Intereses
 * - Botones de acción
 */
export const PersonCard = ({ person, onEdit, onLogInteraction }: PersonCardProps) => {
  const [showActions, setShowActions] = useState(false);

  // Colores por categoría
  const categoryColors = {
    family: 'success',
    friend: 'primary',
    colleague: 'neutral',
    mentor: 'warning',
    client: 'error',
  };

  const categoryLabels = {
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

  // Renderizar estrellas de importancia
  const renderImportanceStars = () => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= person.importance_level ? (
            <StarSolid key={star} className="h-3 w-3 text-yellow-500" />
          ) : (
            <StarOutline key={star} className="h-3 w-3 text-gray-300" />
          )
        ))}
      </div>
    );
  };

  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action?.();
  };

  return (
    <Link 
      to={`/people/${person.id}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="block group"
    >
      <Card 
        variant="hoverable" 
        padding="md" 
        className="h-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative"
      >
        {/* Banner de atención */}
        {person.needs_attention && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-xs px-3 py-1 rounded-t-lg flex items-center gap-1">
            <ExclamationTriangleIcon className="h-3.5 w-3.5" />
            <span className="font-medium">Necesita atención</span>
          </div>
        )}

        <div className={person.needs_attention ? 'mt-6' : ''}>
          {/* Botones de acción (visible en hover) */}
          {showActions && (
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              {onLogInteraction && (
                <button
                  onClick={(e) => handleAction(e, onLogInteraction)}
                  className="p-2 bg-white rounded-lg shadow-sm hover:bg-primary/10 transition-colors"
                  title="Registrar interacción"
                  aria-label="Registrar interacción con persona"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4 text-primary" />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={(e) => handleAction(e, onEdit)}
                  className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                  title="Editar"
                  aria-label="Editar persona"
                >
                  <PencilIcon className="h-4 w-4 text-gray-600" />
                </button>
              )}
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

          {/* Categoría e importancia */}
          <div className="flex items-center justify-between mb-3">
            <Badge
              text={categoryLabels[person.category]}
              variant={categoryColors[person.category] as any}
              size="sm"
            />
            {renderImportanceStars()}
          </div>

          {/* Último contacto */}
          {person.last_contact_date && (
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>
                Último contacto: {formatDistanceToNow(new Date(person.last_contact_date), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>
          )}

          {/* Intereses */}
          {person.interests.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {person.interests.slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                >
                  {interest}
                </span>
              ))}
              {person.interests.length > 3 && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                  +{person.interests.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
