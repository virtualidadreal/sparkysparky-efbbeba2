import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIdeas } from '@/hooks/useIdeas';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { usePeople } from '@/hooks/usePeople';
import { useProactiveInsights } from '@/hooks/useProactiveInsights';
import { useProfile } from '@/hooks/useProfile';
import { Link } from 'react-router-dom';
import {
  Home,
  Users,
  Settings,
  Plus,
  Zap,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  Calendar,
  Target,
  User,
} from 'lucide-react';
import { IdeaPreviewModal } from '@/components/ideas/IdeaPreviewModal';
import { Idea } from '@/types/Idea.types';

// Import images
import pastBg from '@/assets/dashboard-past-bg.jpg';
import futureBg from '@/assets/dashboard-future-bg.jpg';
import iconSphere from '@/assets/icon-sphere.png';
import iconCube from '@/assets/icon-cube.png';
import iconTorus from '@/assets/icon-torus.png';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: ideas } = useIdeas({ status: 'active' });
  const { data: tasks } = useTasks();
  const { data: projects } = useProjects();
  const { data: people } = usePeople();
  const { data: profile } = useProfile();

  const {
    alerts,
    suggestions,
    getAlerts,
    getSuggestions,
    initialized,
  } = useProactiveInsights();

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  useEffect(() => {
    if (initialized) {
      getAlerts();
      getSuggestions();
    }
  }, [initialized, getAlerts, getSuggestions]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getUserName = () => {
    if (profile?.display_name) return profile.display_name;
    const fullName = user?.user_metadata?.full_name;
    if (fullName) return fullName.split(' ')[0];
    return user?.email?.split('@')[0] || 'Usuario';
  };

  const pendingTasks = tasks?.filter(t => t.status !== 'done').length || 0;
  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  const recentIdeas = ideas?.slice(0, 3) || [];

  // Timeline data
  const timelineItems = [
    { month: 'DIC', year: '2024', text: 'Últimas ideas capturadas y proyectos activos.' },
    { month: 'NOV', year: '2024', text: 'Progreso en tareas y nuevas conexiones.' },
  ];

  // Insights
  const insightItems = [
    {
      icon: Lightbulb,
      title: 'Ideas activas',
      desc: `${ideas?.length || 0} ideas esperando ser desarrolladas`,
    },
    {
      icon: Target,
      title: 'Tareas pendientes',
      desc: `${pendingTasks} tareas por completar`,
    },
    {
      icon: TrendingUp,
      title: 'Proyectos activos',
      desc: `${activeProjects} proyectos en progreso`,
    },
    {
      icon: Calendar,
      title: 'Personas conectadas',
      desc: `${people?.length || 0} contactos guardados`,
    },
  ];

  return (
    <div className="min-h-screen bg-[hsl(220,14%,96%)] p-4 lg:p-6">
      {/* 3-column grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-4 lg:gap-6 max-w-[1600px] mx-auto">
        
        {/* Left Sidebar */}
        <div className="flex flex-col gap-4 lg:gap-6">
          {/* Navigation Panel */}
          <div className="bg-card rounded-[32px] p-6 shadow-sm">
            {/* New Button */}
            <Link
              to="/ideas"
              className="flex items-center gap-2 bg-foreground text-card px-5 py-3 rounded-full font-medium text-sm mb-6 hover:opacity-90 transition-opacity w-fit"
            >
              <Plus className="h-4 w-4" />
              NEW
            </Link>

            {/* Nav Items */}
            <nav className="space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 text-foreground font-medium rounded-xl hover:bg-muted/50 transition-colors"
              >
                <Home className="h-5 w-5" />
                Home
              </Link>
              <Link
                to="/people"
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground rounded-xl hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <Users className="h-5 w-5" />
                Personas
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground rounded-xl hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <Settings className="h-5 w-5" />
                Configuración
              </Link>
            </nav>
          </div>

          {/* Timeline Panel */}
          <div className="bg-card rounded-[32px] p-6 shadow-sm flex-1">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-6">
              ACTIVIDAD RECIENTE
            </h3>
            <div className="space-y-6">
              {timelineItems.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                    {idx < timelineItems.length - 1 && (
                      <div className="w-px h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-foreground">{item.month}</span>
                      <span className="text-xs text-muted-foreground">{item.year}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-4 lg:gap-6">
          {/* Header */}
          <div className="bg-card rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                Haz una pregunta_
              </h1>
              <Link
                to="/chat"
                className="flex items-center justify-center w-14 h-14 bg-foreground rounded-full hover:opacity-90 transition-opacity"
              >
                <Zap className="h-6 w-6 text-card" />
              </Link>
            </div>
          </div>

          {/* Get Started Banner */}
          <div className="bg-card rounded-[32px] p-2 shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground px-6 pt-4 pb-3">
              Explorar
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {/* Past */}
              <Link
                to="/diary"
                className="relative overflow-hidden rounded-[24px] aspect-[2/1] group"
              >
                <img
                  src={pastBg}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center gap-3">
                  <ArrowLeft className="h-5 w-5 text-white" />
                  <span className="text-white font-bold text-xl tracking-wide">DIARIO</span>
                </div>
              </Link>

              {/* Future */}
              <Link
                to="/projects"
                className="relative overflow-hidden rounded-[24px] aspect-[2/1] group"
              >
                <img
                  src={futureBg}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center gap-3">
                  <span className="text-foreground/70 font-bold text-xl tracking-wide">PROYECTOS</span>
                  <ArrowRight className="h-5 w-5 text-foreground/70" />
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Ideas Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentIdeas.length > 0 ? (
              recentIdeas.map((idea, idx) => {
                const icons = [iconSphere, iconCube, iconTorus];
                return (
                  <button
                    key={idea.id}
                    onClick={() => setSelectedIdea(idea)}
                    className="bg-card rounded-[24px] p-6 shadow-sm text-left hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        {idea.category || 'Idea'}
                      </span>
                      <img
                        src={icons[idx % 3]}
                        alt=""
                        className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <p className="text-foreground font-medium leading-relaxed line-clamp-3">
                      {idea.title}
                    </p>
                  </button>
                );
              })
            ) : (
              <>
                <div className="bg-card rounded-[24px] p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                      Ideas
                    </span>
                    <img src={iconSphere} alt="" className="w-10 h-10 object-contain" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Captura tu primera idea para verla aquí
                  </p>
                </div>
                <div className="bg-card rounded-[24px] p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                      Tareas
                    </span>
                    <img src={iconCube} alt="" className="w-10 h-10 object-contain" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Organiza tus tareas y proyectos
                  </p>
                </div>
                <div className="bg-card rounded-[24px] p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                      Análisis
                    </span>
                    <img src={iconTorus} alt="" className="w-10 h-10 object-contain" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Analiza patrones en tu información
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="bg-card rounded-[32px] p-6 shadow-sm flex flex-col">
          {/* Profile */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{getGreeting()},</p>
              <p className="font-semibold text-foreground">{getUserName()}</p>
            </div>
          </div>

          {/* Insights */}
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              INSIGHTS
            </h3>
            <div className="space-y-4">
              {insightItems.map((item, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="flex items-start gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground mt-0.5 group-hover:text-foreground transition-colors" />
                    <div>
                      <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Button */}
          <Link
            to="/settings"
            className="mt-6 flex items-center justify-center gap-2 bg-foreground text-card px-6 py-3 rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <User className="h-4 w-4" />
            Mi cuenta
          </Link>
        </div>
      </div>

      {/* Idea Preview Modal */}
      {selectedIdea && (
        <IdeaPreviewModal
          idea={selectedIdea}
          isOpen={!!selectedIdea}
          onClose={() => setSelectedIdea(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
