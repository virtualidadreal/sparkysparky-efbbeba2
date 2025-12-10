import { memo } from 'react';
import { PersonCard } from './PersonCard';
import type { Person } from '@/types/Person.types';

interface PersonCardProps {
  person: Person;
  onEdit?: () => void;
  onLogInteraction?: () => void;
}

/**
 * PersonCard memoizado para optimizar renders
 */
export const MemoizedPersonCard = memo(PersonCard, (prevProps, nextProps) => {
  return (
    prevProps.person.id === nextProps.person.id &&
    prevProps.person.updated_at === nextProps.person.updated_at
  );
});

MemoizedPersonCard.displayName = 'MemoizedPersonCard';
