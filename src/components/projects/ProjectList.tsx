import { useProjects, useArchiveProject } from '@/hooks/useProjects';
import { useUnassignedIdeasCount } from '@/hooks/useIdeas';
import { ProjectCard } from './ProjectCard';
import { LooseIdeasCard } from './LooseIdeasCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderIcon } from '@heroicons/react/24/outline';
import type { ProjectsFilters } from '@/types/Project.types';
import toast from 'react-hot-toast';

/**
 * Props del componente ProjectList
 */
interface ProjectListProps {
  filters?: ProjectsFilters;
  onEdit?: (projectId: string) => void;
}

/**
 * Componente ProjectList
 * 
 * Lista de proyectos con:
 * - Grid responsive
 * - Loading state
 * - Empty state
 * - Error handling
 * - Acciones (editar, archivar)
 */
export const ProjectList = ({ filters, onEdit }: ProjectListProps) => {
  const { data: projects, isLoading, error } = useProjects(filters);
  const { data: unassignedCount = 0 } = useUnassignedIdeasCount();
  const archiveProject = useArchiveProject();

  // Handlers para acciones
  const handleEdit = (projectId: string) => {
    onEdit?.(projectId);
  };

  const handleArchive = async (projectId: string) => {
    if (window.confirm('¿Estás seguro de que quieres archivar este proyecto?')) {
      try {
        await archiveProject.mutateAsync(projectId);
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
            className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
          >
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
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
        <p className="text-error font-medium mb-2">No pudimos cargar tus proyectos</p>
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

  // Empty state - aún mostramos Ideas sueltas
  if (!projects || projects.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Tarjeta especial de Ideas sueltas - siempre visible */}
        <LooseIdeasCard ideasCount={unassignedCount} />
        
        {/* Empty state para proyectos */}
        <div className="bg-card rounded-lg border-2 border-dashed border-border p-8 text-center col-span-1 sm:col-span-1 lg:col-span-2">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FolderIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2">
            No hay más proyectos
          </h3>
          <p className="text-sm text-muted-foreground">
            Crea un proyecto para organizar tus ideas
          </p>
        </div>
      </div>
    );
  }

  // Grid de proyectos
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Tarjeta especial de Ideas sueltas - siempre primero */}
      <LooseIdeasCard ideasCount={unassignedCount} />
      
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project}
          onEdit={() => handleEdit(project.id)}
          onArchive={() => handleArchive(project.id)}
        />
      ))}
    </div>
  );
};
