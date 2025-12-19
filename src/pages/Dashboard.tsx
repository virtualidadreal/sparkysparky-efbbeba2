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
  FolderOpen,
  CheckSquare,
  BookOpen,
  Brain,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Mic,
  Send,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useAdmin';
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
  const { data: isAdmin } = useIsAdmin();
  const location = useLocation();

  const {
    alerts,
    suggestions,
    getAlerts,
    getSuggestions,
    initialized,
  } = useProactiveInsights();

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [quickInput, setQuickInput] = useState('');
  const [chatInput, setChatInput] = useState('');

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
    <div className="min-h-screen bg-[hsl(220,14%,96%)] p-2 lg:p-3">
      {/* 3-column grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_260px] gap-2 lg:gap-3 max-w-[1600px] mx-auto">
        
        {/* Left Sidebar */}
        <div className="flex flex-col gap-2 lg:gap-3">
          {/* Navigation Panel */}
          <div className="bg-card rounded-[24px] p-4 shadow-sm flex flex-col h-full">
            {/* Nav Items */}
            <nav className="space-y-0.5 flex-1">
              {[
                { to: '/dashboard', icon: Home, label: 'Dashboard' },
                { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
                { to: '/projects', icon: FolderOpen, label: 'Proyectos' },
                { to: '/tasks', icon: CheckSquare, label: 'Tareas' },
                { to: '/people', icon: Users, label: 'Personas' },
                { to: '/diary', icon: BookOpen, label: 'Diario' },
                { to: '/memory', icon: Brain, label: 'Memoria' },
                { to: '/analytics', icon: BarChart3, label: 'Analytics' },
                { to: '/insights', icon: TrendingUp, label: 'Insights' },
                { to: '/settings', icon: Settings, label: 'Configuración' },
              ].map((item) => {
                const isActive = location.pathname === item.to || 
                  (item.to === '/dashboard' && location.pathname === '/');
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-[hsl(217,91%,60%)]/10 text-[hsl(217,91%,60%)] font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Admin link (separated) */}
              {isAdmin && (
                <>
                  <div className="border-t border-border my-3" />
                  <Link
                    to="/admin"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      location.pathname === '/admin'
                        ? 'bg-[hsl(217,91%,60%)]/10 text-[hsl(217,91%,60%)] font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Admin
                  </Link>
                </>
              )}
            </nav>

            {/* Quick Input */}
            <div className="mt-4 space-y-3">
              <Link
                to="/ideas"
                className="flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-xl text-muted-foreground text-sm hover:bg-muted transition-colors"
              >
                <Plus className="h-4 w-4" />
                ¿Qué tienes en mente?
              </Link>

              {/* Sparky Button */}
              <Link
                to="/chat"
                className="flex items-center justify-center gap-2 bg-[hsl(217,91%,60%)] text-white px-4 py-3 rounded-xl font-medium text-sm hover:bg-[hsl(217,91%,55%)] transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Hablar con Sparky
              </Link>
            </div>
          </div>

        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-2 lg:gap-3">
          {/* Header with Chat Input */}
          <div className="bg-card rounded-[24px] p-4 lg:p-5 shadow-sm">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight mb-4">
              Haz una pregunta_
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="¿Qué tienes en mente?"
                  className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(217,91%,60%)]/50 focus:border-[hsl(217,91%,60%)] transition-all pr-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && chatInput.trim()) {
                      window.location.href = `/chat?q=${encodeURIComponent(chatInput)}`;
                    }
                  }}
                />
                {chatInput.trim() && (
                  <button
                    onClick={() => window.location.href = `/chat?q=${encodeURIComponent(chatInput)}`}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                )}
              </div>
              <button
                className="flex items-center justify-center w-14 h-14 bg-foreground rounded-full hover:opacity-90 transition-opacity shrink-0"
                onClick={() => {
                  // TODO: Implement voice recording
                  console.log('Voice recording');
                }}
              >
                <Mic className="h-6 w-6 text-card" />
              </button>
            </div>
          </div>

          {/* Get Started Banner */}
          <div className="bg-card rounded-[24px] p-2 shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground px-4 pt-3 pb-2">
              Explorar
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {/* Past */}
              <Link
                to="/diary"
                className="relative overflow-hidden rounded-[18px] aspect-[2/1] group"
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
                className="relative overflow-hidden rounded-[18px] aspect-[2/1] group"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {recentIdeas.length > 0 ? (
              recentIdeas.map((idea, idx) => {
                const icons = [iconSphere, iconCube, iconTorus];
                return (
                  <button
                    key={idea.id}
                    onClick={() => setSelectedIdea(idea)}
                    className="bg-card rounded-[18px] p-4 shadow-sm text-left hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        {idea.category || 'Idea'}
                      </span>
                      <img
                        src={icons[idx % 3]}
                        alt=""
                        className="w-8 h-8 object-contain group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <p className="text-foreground font-medium leading-relaxed line-clamp-3 text-sm">
                      {idea.title}
                    </p>
                  </button>
                );
              })
            ) : (
              <>
                <div className="bg-card rounded-[18px] p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                      Ideas
                    </span>
                    <img src={iconSphere} alt="" className="w-8 h-8 object-contain" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Captura tu primera idea para verla aquí
                  </p>
                </div>
                <div className="bg-card rounded-[18px] p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                      Tareas
                    </span>
                    <img src={iconCube} alt="" className="w-8 h-8 object-contain" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Organiza tus tareas y proyectos
                  </p>
                </div>
                <div className="bg-card rounded-[18px] p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                      Análisis
                    </span>
                    <img src={iconTorus} alt="" className="w-8 h-8 object-contain" />
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
        <div className="bg-card rounded-[24px] p-4 shadow-sm flex flex-col">
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

          {/* Timeline / Recent Activity */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              ACTIVIDAD RECIENTE
            </h3>
            <div className="space-y-4">
              {timelineItems.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                    {idx < timelineItems.length - 1 && (
                      <div className="w-px h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-semibold text-foreground text-sm">{item.month}</span>
                      <span className="text-xs text-muted-foreground">{item.year}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.text}
                    </p>
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
