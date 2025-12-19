import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useIdeas } from '@/hooks/useIdeas';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useProactiveInsights } from '@/hooks/useProactiveInsights';
import { IdeaPreviewModal } from '@/components/ideas/IdeaPreviewModal';
import { MorningBriefingCard } from '@/components/planning/MorningBriefingCard';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight, SparklesIcon } from 'lucide-react';
import { Idea } from '@/types/Idea.types';
import clsx from 'clsx';

export const CentralContent = () => {
  const { data: ideas } = useIdeas({ status: 'active' });
  const { data: tasks } = useTasks();
  const { data: projects } = useProjects();
  const { isLoading, morningBriefing, getMorningBriefing } = useProactiveInsights();

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [showBriefing, setShowBriefing] = useState(false);

  const recentIdeas = ideas?.slice(0, 6) || [];
  const activeProjects = projects?.filter(p => p.status === 'active') || [];
  const currentProject = activeProjects[currentProjectIndex];
  const pendingTasks = tasks?.filter(t => t.status !== 'done').length || 0;

  const handleGetBriefing = async () => {
    setShowBriefing(true);
    await getMorningBriefing();
  };

  const nextProject = () => {
    setCurrentProjectIndex((prev) => (prev + 1) % Math.max(activeProjects.length, 1));
  };

  const prevProject = () => {
    setCurrentProjectIndex((prev) => (prev - 1 + Math.max(activeProjects.length, 1)) % Math.max(activeProjects.length, 1));
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Header with back button and featured project */}
      <div className="flex items-center gap-4 mb-2">
        <Link
          to="/dashboard"
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1" />
        <Button
          onClick={handleGetBriefing}
          disabled={isLoading}
          variant="outline"
          className="rounded-full gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SparklesIcon className="h-4 w-4" />
          )}
          Morning Briefing
        </Button>
      </div>

      {/* Morning Briefing */}
      {showBriefing && morningBriefing && (
        <div className="mb-6">
          <MorningBriefingCard briefing={morningBriefing} />
        </div>
      )}

      {/* Featured Project Card */}
      {currentProject && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-200 via-slate-100 to-amber-50 aspect-[16/10] group">
          {/* Project Counter */}
          <div className="absolute top-6 left-6 text-6xl font-bold text-foreground/20">
            {String(currentProjectIndex + 1).padStart(2, '0')}
          </div>

          {/* Download/Action Button */}
          <div className="absolute top-6 right-6 flex gap-2">
            <Link
              to="/projects"
              className="px-4 py-2 bg-card/80 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-card transition-colors"
            >
              Ver proyectos
            </Link>
          </div>

          {/* Project Info */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <p className="text-sm text-muted-foreground mb-2">Proyecto reciente</p>
            <h2 className="text-2xl font-semibold text-foreground mb-2">{currentProject.title}</h2>
            <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
              {currentProject.description || 'Sin descripción'}
            </p>
          </div>

          {/* Navigation Arrows */}
          {activeProjects.length > 1 && (
            <div className="absolute bottom-8 right-8 flex gap-2">
              <button
                onClick={prevProject}
                className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextProject}
                className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* No projects fallback */}
      {!currentProject && (
        <div className="rounded-3xl bg-gradient-to-br from-slate-200 via-slate-100 to-amber-50 aspect-[16/10] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No tienes proyectos activos</p>
            <Link to="/projects">
              <Button className="rounded-full">Crear proyecto</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Title Section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Tu espacio
          </h1>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            creativo
          </h2>
          <p className="text-sm text-muted-foreground mt-4 max-w-xs">
            Captura ideas, gestiona proyectos y mantén tus relaciones importantes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Recent people/ideas avatars */}
          <div className="flex -space-x-2">
            {recentIdeas.slice(0, 3).map((idea, i) => (
              <button
                key={idea.id}
                onClick={() => setSelectedIdea(idea)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 border-2 border-background flex items-center justify-center text-xs font-medium hover:scale-110 transition-transform"
                style={{ zIndex: 3 - i }}
              >
                {idea.title?.charAt(0) || 'I'}
              </button>
            ))}
          </div>
          <Link
            to="/ideas"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver ideas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Link to="/ideas">
          <Button variant="outline" className="rounded-full gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Ver ideas
          </Button>
        </Link>
        <Link
          to="/tasks"
          className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-6">
          <p className="text-sm text-muted-foreground mb-1">Ideas</p>
          <p className="text-3xl font-bold text-foreground">{ideas?.length || 0}</p>
        </div>
        <div className="bg-card rounded-2xl p-6">
          <p className="text-sm text-muted-foreground mb-1">Tareas</p>
          <p className="text-3xl font-bold text-foreground">{pendingTasks}</p>
        </div>
        <div className="bg-card rounded-2xl p-6">
          <p className="text-sm text-muted-foreground mb-1">Proyectos</p>
          <p className="text-3xl font-bold text-foreground">{activeProjects.length}</p>
        </div>
      </div>

      {/* Recent Ideas Grid */}
      {recentIdeas.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {recentIdeas.map((idea, index) => (
            <button
              key={idea.id}
              onClick={() => setSelectedIdea(idea)}
              className={clsx(
                'rounded-2xl p-5 text-left transition-all hover:scale-[1.02]',
                index % 4 === 0 && 'bg-gradient-to-br from-amber-100 to-orange-100',
                index % 4 === 1 && 'bg-gradient-to-br from-blue-100 to-cyan-100',
                index % 4 === 2 && 'bg-gradient-to-br from-emerald-100 to-teal-100',
                index % 4 === 3 && 'bg-gradient-to-br from-rose-100 to-pink-100'
              )}
            >
              <p className="font-medium text-foreground line-clamp-2 mb-2">{idea.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {idea.description || idea.summary || 'Sin descripción'}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Idea Preview Modal */}
      <IdeaPreviewModal
        idea={selectedIdea}
        isOpen={!!selectedIdea}
        onClose={() => setSelectedIdea(null)}
      />
    </div>
  );
};
