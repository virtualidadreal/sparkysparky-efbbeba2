import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/common';
import { ProjectList, ProjectForm } from '@/components/projects';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useActiveProjectsCount, useProjects } from '@/hooks/useProjects';
import type { ProjectsFilters } from '@/types/Project.types';

/**
 * Página Projects
 * 
 * Vista principal del módulo de proyectos con:
 * - Header con contador y botón de nuevo proyecto
 * - Filtros por status (tabs)
 * - Buscador
 * - Lista de proyectos
 */
const Projects = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const { data: activeCount } = useActiveProjectsCount();
  const { data: allProjects } = useProjects();
  
  // Construir filtros según el tab activo
  const filters: ProjectsFilters = {
    ...(activeTab !== 'all' && { status: activeTab }),
    ...(searchTerm && { search: searchTerm }),
  };

  const tabs = [
    { id: 'all' as const, label: 'Todos' },
    { id: 'active' as const, label: 'Activos' },
    { id: 'paused' as const, label: 'Pausados' },
    { id: 'completed' as const, label: 'Completados' },
  ];

  const handleEdit = (projectId: string) => {
    setEditingProjectId(projectId);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProjectId(null);
  };

  // Obtener proyecto para edición
  const editingProject = editingProjectId 
    ? allProjects?.find(p => p.id === editingProjectId)
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mis Proyectos</h1>
            <p className="text-muted-foreground">
              {activeCount !== undefined && (
                <span className={activeCount >= 5 ? 'text-orange-500 font-medium' : ''}>
                  {activeCount}/5 proyectos activos
                </span>
              )}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={() => setIsFormOpen(true)}
          >
            Nuevo Proyecto
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white/60 dark:bg-card/60 backdrop-blur-lg rounded-[18px] p-4 border border-white/50 dark:border-white/10">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[hsl(217,91%,60%)] text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(217,91%,60%)]/50 focus:border-[hsl(217,91%,60%)] transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Lista de proyectos */}
        <ProjectList filters={filters} onEdit={handleEdit} />

        {/* Modal de formulario */}
        <ProjectForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          project={editingProject}
        />
      </div>
    </DashboardLayout>
  );
};

export default Projects;
