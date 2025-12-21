import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIdeas } from '@/hooks/useIdeas';
import { useProjects } from '@/hooks/useProjects';
import { useProactiveInsights } from '@/hooks/useProactiveInsights';
import { useProfile } from '@/hooks/useProfile';
import { Link } from 'react-router-dom';
import {
  Home,
  Users,
  Settings,
  Plus,
  Lightbulb,
  FolderOpen,
  CheckSquare,
  Brain,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Mic,
  BookOpen,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useAdmin';
import { IdeaPreviewModal } from '@/components/ideas/IdeaPreviewModal';
import { QuickCapturePopup } from '@/components/dashboard/QuickCapturePopup';
import { SparkyChat } from '@/components/chat/SparkyChat';
import { MobileFooter } from '@/components/layout/MobileFooter';
import { Idea } from '@/types/Idea.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: ideas } = useIdeas({ status: 'active' });
  const { data: projects } = useProjects();
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

  const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    };
    const formatted = date.toLocaleDateString('es-ES', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const recentIdeas = ideas?.slice(0, 3) || [];

  // En tu cabeza - proyectos activos
  const activeProjects = projects?.filter(p => p.status === 'active').slice(0, 4) || [];

  // Sparky message - usar suggestion si existe, sino mensaje default
  const sparkyMessage = suggestions?.[0]?.description || 
    "¿Tienes alguna idea nueva que quieras explorar conmigo?";

  const getRelativeTime = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: false, locale: es });
  };

  return (
    <div className="h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3 pb-24 lg:pb-3 overflow-hidden">
      {/* 3-column grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-3 max-w-[1800px] mx-auto h-[calc(100vh-24px)]">
        
        {/* Left Sidebar - fixed height */}
        <div className="hidden lg:flex flex-col h-full">
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-4 flex flex-col h-full overflow-hidden border-2 border-border/50">
            {/* Nav Items */}
            <nav className="space-y-0.5 flex-1 overflow-y-auto">
              {[
                { to: '/dashboard', icon: Home, label: 'Dashboard' },
                { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
                { to: '/projects', icon: FolderOpen, label: 'Proyectos' },
                { to: '/tasks', icon: CheckSquare, label: 'Tareas' },
                { to: '/people', icon: Users, label: 'Personas' },
                { to: '/diary', icon: BookOpen, label: 'Diario' },
                { to: '/memory', icon: Brain, label: 'Memoria' },
                { to: '/estadisticas', icon: BarChart3, label: 'Estadísticas' },
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
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Admin link */}
              {isAdmin && (
                <>
                  <div className="border-t border-border my-3" />
                  <Link
                    to="/admin"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      location.pathname === '/admin'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Admin
                  </Link>
                </>
              )}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-4 pt-4 border-t border-border space-y-3 shrink-0">
              <Link
                to="/ideas"
                className="flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-xl text-muted-foreground text-sm hover:bg-muted transition-colors"
              >
                <Plus className="h-4 w-4" />
                Captura rápida
              </Link>

              <SparkyChat
                trigger={
                  <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors">
                    <Mic className="h-4 w-4" />
                    Hablar con Sparky
                  </button>
                }
              />
            </div>
          </div>
        </div>

        {/* Main Content - scrollable */}
        <div className="flex flex-col gap-4 h-full overflow-y-auto">
          {/* Greeting */}
          <div className="px-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              {getGreeting()}, {getUserName()}
            </h1>
            <p className="text-muted-foreground mt-1">{getCurrentDate()}</p>
          </div>

          {/* Sparky Card */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-[24px] p-6 border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-primary">SPARKY</span>
                </div>
                <p className="text-foreground leading-relaxed mb-4">
                  "{sparkyMessage}"
                </p>
                <div className="flex gap-3">
                  <SparkyChat
                    trigger={
                      <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors">
                        Sí, cuéntame
                      </button>
                    }
                  />
                  <button
                    className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl font-medium text-sm transition-colors"
                  >
                    Ahora no
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Ideas */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground tracking-wider mb-3 px-1">
              ÚLTIMAS IDEAS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentIdeas.length > 0 ? (
                recentIdeas.map((idea) => (
                  <button
                    key={idea.id}
                    onClick={() => setSelectedIdea(idea)}
                    className="bg-transparent backdrop-blur-sm rounded-[18px] p-5 text-left hover:bg-muted/30 transition-all group border-2 border-border/50"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">💡</span>
                    </div>
                    <p className="text-foreground font-medium leading-relaxed line-clamp-2 text-sm mb-3">
                      {idea.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hace {getRelativeTime(idea.created_at)}
                    </p>
                  </button>
                ))
              ) : (
                <>
                  <div className="bg-transparent backdrop-blur-sm rounded-[18px] p-5 border-2 border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">💡</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Captura tu primera idea
                    </p>
                  </div>
                  <div className="bg-transparent backdrop-blur-sm rounded-[18px] p-5 border-2 border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">💡</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Dicta o escribe ideas
                    </p>
                  </div>
                  <div className="bg-transparent backdrop-blur-sm rounded-[18px] p-5 border-2 border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">💡</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Sparky las organiza
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Chat Input - Bottom (hidden on mobile) */}
          <div className="hidden lg:block">
            <QuickCapturePopup
              trigger={
                <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-4 cursor-pointer hover:bg-muted/30 transition-all border-2 border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <div className="w-full px-4 py-3.5 bg-muted/50 border border-border rounded-2xl text-muted-foreground">
                        🎙️ ¿Qué tienes en mente?
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 bg-foreground rounded-full shrink-0">
                      <Mic className="h-5 w-5 text-card" />
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </div>

        {/* Right Sidebar - fixed height */}
        <div className="hidden lg:flex flex-col h-full">
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-5 flex flex-col h-full overflow-hidden border-2 border-border/50">
          {/* En tu cabeza */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              EN TU CABEZA
            </h3>
            <div className="space-y-3">
              {activeProjects.length > 0 ? (
                activeProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects`}
                    className="flex items-start gap-2 group cursor-pointer"
                  >
                    <span className="text-muted-foreground mt-0.5">•</span>
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-relaxed">
                      {project.title}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay proyectos activos
                </p>
              )}
              <Link
                to="/projects"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mt-2"
              >
                <Plus className="h-4 w-4" />
                añadir
              </Link>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-border mb-6" />

          {/* Sparky Recuerda */}
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              SPARKY RECUERDA
            </h3>
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-sm text-foreground leading-relaxed italic">
                {alerts?.[0]?.message || 
                  "Estoy analizando tus ideas y patrones. Pronto tendré algo interesante que compartir contigo."}
              </p>
            </div>
          </div>
          </div>
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

      {/* Mobile Footer */}
      <MobileFooter />
    </div>
  );
};

export default Dashboard;
