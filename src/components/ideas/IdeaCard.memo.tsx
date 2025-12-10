import { memo } from 'react';
import { IdeaCard } from './IdeaCard';
import type { Idea } from '@/types/Idea.types';

interface IdeaCardProps {
  idea: Idea;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

/**
 * IdeaCard memoizado para optimizar renders
 */
export const MemoizedIdeaCard = memo(IdeaCard, (prevProps, nextProps) => {
  return (
    prevProps.idea.id === nextProps.idea.id &&
    prevProps.idea.updated_at === nextProps.idea.updated_at
  );
});

MemoizedIdeaCard.displayName = 'MemoizedIdeaCard';
