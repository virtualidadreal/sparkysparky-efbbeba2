import { memo } from 'react';
import { ProjectCard } from './ProjectCard';
import type { Project } from '@/types/Project.types';

interface ProjectCardProps {
  project: Project;
  onEdit?: () => void;
  onArchive?: () => void;
}

/**
 * ProjectCard memoizado para optimizar renders
 */
export const MemoizedProjectCard = memo(ProjectCard, (prevProps, nextProps) => {
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.project.updated_at === nextProps.project.updated_at
  );
});

MemoizedProjectCard.displayName = 'MemoizedProjectCard';
