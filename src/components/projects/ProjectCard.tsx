import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '@/components/common';
import type { Project } from '@/types/Project.types';
import { 
  PencilIcon, 
  ArchiveBoxIcon, 
  ClockIcon,
  CalendarIcon,
  StarIcon as StarOutline,
  SparklesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

/**
 * Props del componente ProjectCard
 */
interface ProjectCardProps {
  project: Project;
  onEdit?: () => void;
  onArchive?: () => void;
}

/**
 * Componente ProjectCard
 * 
 * Tarjeta para mostrar un proyecto con:
 * - Nombre y descripción
 * - Badge de estado
 * - Prioridad (estrellas)
 * - Barra de progreso
 * - Tags
 * - Fechas
 * - Botones de acción
 */
export const ProjectCard = ({ project, onEdit, onArchive }: ProjectCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const analysis = project.metadata?.analysis;
  const materials = project.metadata?.materials;

  // Color del estado
  const statusColors = {
    active: 'success',
    paused: 'warning',
    completed: 'primary',
    archived: 'neutral',
  };

  const statusLabels = {
    active: 'Activo',
    paused: 'Pausado',
    completed: 'Completado',
    archived: 'Archivado',
  };

  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action?.();
  };

  const handleGenerateTasks = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsGenerating(true);
    const loadingToast = toast.loading('Generando tareas...');
    
    try {
      const { error } = await supabase.functions.invoke('analyze-project', {
        body: { projectId: project.id, action: 'breakdown' }
      });
      
      if (error) throw error;
      
      toast.success('Tareas generadas exitosamente', { id: loadingToast });
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast.error('Error al generar tareas', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMaterials = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsGenerating(true);
    const loadingToast = toast.loading('Generando materiales de apoyo...');
    
    try {
      const { error } = await supabase.functions.invoke('analyze-project', {
        body: { projectId: project.id, action: 'materials' }
      });
      
      if (error) throw error;
      
      toast.success('Materiales generados', { id: loadingToast });
    } catch (error) {
      console.error('Error generating materials:', error);
      toast.error('Error al generar materiales', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  // Renderizar estrellas de prioridad
  const renderPriorityStars = () => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= project.priority ? (
            <StarSolid key={star} className="h-4 w-4 text-yellow-500" />
          ) : (
            <StarOutline key={star} className="h-4 w-4 text-gray-300" />
          )
        ))}
      </div>
    );
  };

  return (
    <Link 
      to={`/projects/${project.id}`}
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
        {showActions && project.status !== 'archived' && (
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            {onEdit && (
              <button
                onClick={(e) => handleAction(e, onEdit)}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title="Editar"
                aria-label="Editar proyecto"
              >
                <PencilIcon className="h-4 w-4 text-gray-600" />
              </button>
            )}
            {onArchive && (
              <button
                onClick={(e) => handleAction(e, onArchive)}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title="Archivar"
                aria-label="Archivar proyecto"
              >
                <ArchiveBoxIcon className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </div>
        )}

        {/* Header con nombre y estado */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-gray-900 flex-1 line-clamp-1 pr-20">
            {project.name}
          </h3>
          <Badge
            text={statusLabels[project.status]}
            variant={statusColors[project.status] as any}
            size="sm"
          />
        </div>

        {/* Descripción */}
        {project.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Prioridad y progreso */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Prioridad:</span>
              {renderPriorityStars()}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {project.progress_percentage}%
            </span>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress_percentage}%` }}
            />
          </div>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} text={tag} variant="primary" size="sm" />
            ))}
            {project.tags.length > 3 && (
              <Badge
                text={`+${project.tags.length - 3}`}
                variant="neutral"
                size="sm"
              />
            )}
          </div>
        )}

        {/* AI Analysis Section */}
        {analysis && (
          <div className="mt-3 p-3 bg-primary/5 rounded-lg">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAnalysis(!showAnalysis);
              }}
              className="w-full text-left font-medium flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4" />
                Análisis IA: {analysis.viability_score}/10
              </span>
              <span>{showAnalysis ? '▼' : '▶'}</span>
            </button>
            
            {showAnalysis && (
              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <strong>Fortalezas:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {analysis.strengths?.slice(0, 2).map((s: string, i: number) => (
                      <li key={i} className="text-gray-600">{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Próximos pasos:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {analysis.recommended_next_steps?.slice(0, 2).map((step: string, i: number) => (
                      <li key={i} className="text-gray-600">{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Actions */}
        {project.status === 'active' && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleGenerateTasks}
              disabled={isGenerating}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-secondary/10 text-secondary rounded-md hover:bg-secondary/20 disabled:opacity-50 transition-colors"
            >
              <SparklesIcon className="h-3 w-3" />
              {isGenerating ? 'Generando...' : 'Generar Tareas'}
            </button>
            
            {!materials && (
              <button
                onClick={handleGenerateMaterials}
                disabled={isGenerating}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-accent/10 text-accent rounded-md hover:bg-accent/20 disabled:opacity-50 transition-colors"
              >
                <DocumentTextIcon className="h-3 w-3" />
                Materiales
              </button>
            )}
          </div>
        )}

        {/* Fechas */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
          {project.start_date && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>
                Inicio: {format(new Date(project.start_date), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
          )}
          {project.target_end_date && (
            <div className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              <span>
                Meta: {format(new Date(project.target_end_date), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
