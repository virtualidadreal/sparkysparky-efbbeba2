import { memo } from 'react';
import { TaskCard } from './TaskCard';
import type { Task } from '@/types/Task.types';

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * TaskCard memoizado para optimizar renders
 */
export const MemoizedTaskCard = memo(TaskCard, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.updated_at === nextProps.task.updated_at
  );
});

MemoizedTaskCard.displayName = 'MemoizedTaskCard';
