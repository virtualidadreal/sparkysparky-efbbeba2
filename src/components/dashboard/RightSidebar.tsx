import { Link } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { usePeople } from '@/hooks/usePeople';
import { useIdeas } from '@/hooks/useIdeas';
import { useTasks } from '@/hooks/useTasks';
import { useUserQuota } from '@/hooks/useUserQuota';
import { QuickCapturePopup } from './QuickCapturePopup';
import { SparkyChat } from '@/components/chat/SparkyChat';
import { Button } from '@/components/ui/button';
import { PlusIcon, SparklesIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';

export const RightSidebar = () => {
  const { data: projects } = useProjects();
  const { data: people } = usePeople();
  const { data: ideas } = useIdeas({ status: 'active' });
  const { data: tasks } = useTasks();
  const { quota, isPro } = useUserQuota();

  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  const pendingTasks = tasks?.filter(t => t.status !== 'done').length || 0;
  const recentPeople = people?.slice(0, 4) || [];

  return (
    <aside className="w-72 space-y-6 sticky top-24 h-fit hidden xl:block">
      {/* Quick Actions */}
      <div className="bg-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <QuickCapturePopup
            trigger={
              <Button variant="outline" className="rounded-full gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Nueva idea
              </Button>
            }
          />
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* People Avatars */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex -space-x-2">
            {recentPeople.map((person, i) => (
              <div
                key={person.id}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-card flex items-center justify-center text-xs font-medium"
                style={{ zIndex: recentPeople.length - i }}
              >
                {person.full_name?.charAt(0) || 'P'}
              </div>
            ))}
            {recentPeople.length > 0 && (
              <Link
                to="/people"
                className="w-10 h-10 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs hover:bg-muted/80 transition-colors"
                style={{ zIndex: 0 }}
              >
                <PlusIcon className="w-4 h-4" />
              </Link>
            )}
          </div>
          <div className="ml-auto text-right">
            <Link to="/people" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Ver personas
            </Link>
            <p className="text-xs text-muted-foreground">{people?.length || 0} contactos</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3 text-sm">
          <Link to="/ideas" className="block text-muted-foreground hover:text-foreground transition-colors">
            Lista de ideas
          </Link>
          <Link to="/projects" className="block text-muted-foreground hover:text-foreground transition-colors">
            Proyectos activos
          </Link>
          <Link to="/insights" className="block text-muted-foreground hover:text-foreground transition-colors">
            Insights IA
          </Link>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-card rounded-3xl p-6">
        <p className="text-sm text-muted-foreground mb-2">Proyectos completados</p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-5xl font-bold text-foreground">{activeProjects}</span>
          <span className="text-sm text-muted-foreground">activos</span>
        </div>

        {/* Progress bars */}
        <div className="space-y-2 mb-4">
          <div className="h-2 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-400" style={{ width: '80%' }} />
          <div className="h-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-400" style={{ width: '60%' }} />
          <div className="h-2 rounded-full bg-gradient-to-r from-pink-300 to-pink-400" style={{ width: '40%' }} />
        </div>
      </div>

      {/* Recent Project Card */}
      {projects?.[0] && (
        <div className="bg-gradient-to-br from-rose-100 to-orange-100 rounded-3xl p-6 relative overflow-hidden">
          <Link to={`/projects`} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card/80 flex items-center justify-center hover:bg-card transition-colors">
            <ArrowUpRightIcon className="w-4 h-4" />
          </Link>
          <p className="text-sm text-muted-foreground mb-2">{projects[0].title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
            {projects[0].description || 'Sin descripción'}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progreso</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {ideas?.filter(i => i.project_id === projects[0].id).length || 0}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
                {projects[0].progress || 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Usage Stats for Free Users */}
      {!isPro && quota && (
        <div className="bg-card rounded-3xl p-6">
          <p className="text-sm text-muted-foreground mb-2">Uso mensual</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{quota.used}</span>
            <span className="text-sm text-muted-foreground">/ {quota.limit}</span>
          </div>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {quota.remaining} generaciones restantes
          </p>
        </div>
      )}

      {/* Sparky Chat Button */}
      <SparkyChat
        trigger={
          <Button className="w-full rounded-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-12">
            <SparklesIcon className="h-5 w-5" />
            Hablar con Sparky
          </Button>
        }
      />
    </aside>
  );
};
