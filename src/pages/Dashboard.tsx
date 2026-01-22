import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIdeas } from '@/hooks/useIdeas';
import { useProjects } from '@/hooks/useProjects';
import { useProactiveInsights } from '@/hooks/useProactiveInsights';
import { useProfile } from '@/hooks/useProfile';
import { useDiaryEntries } from '@/hooks/useDiaryEntries';
import { Link } from 'react-router-dom';
import {
  Plus,
  Sparkles,
  Mic,
} from 'lucide-react';
import { IdeaPreviewModal } from '@/components/ideas/IdeaPreviewModal';
import { SparkyChat } from '@/components/chat/SparkyChat';
import { MobileFooter } from '@/components/layout/MobileFooter';
import { FloatingCaptureButton } from '@/components/layout/FloatingCaptureButton';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Idea } from '@/types/Idea.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { OnboardingTour, useOnboarding } from '@/components/onboarding';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: ideas } = useIdeas({ status: 'active' });
  const { data: projects } = useProjects();
  const { data: profile } = useProfile();
  const { data: diaryEntries } = useDiaryEntries();
  const { showOnboarding, completeOnboarding } = useOnboarding();

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
    // Prioridad: display_name del perfil > full_name de metadata > first_name de metadata
    if (profile?.display_name) return profile.display_name;
    const fullName = user?.user_metadata?.full_name;
    if (fullName) return fullName.split(' ')[0];
    const firstName = user?.user_metadata?.first_name;
    if (firstName) return firstName;
    // No usar email, mostrar nombre genérico
    return 'Usuario';
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
  const recentDiaryEntries = diaryEntries?.slice(0, 3) || [];

  // En tu cabeza - proyectos activos
  const activeProjects = projects?.filter(p => p.status === 'active').slice(0, 4) || [];

  // Sparky message - usar suggestion si existe, sino mensaje default
  const sparkyMessage = suggestions?.[0]?.description || 
    "¿Tienes alguna idea nueva que quieras explorar conmigo?";

  const getRelativeTime = (dateStr: string) => {
    // Si es solo una fecha (YYYY-MM-DD), parsearla como fecha local (no UTC)
    let date: Date;
    if (dateStr.length === 10 && dateStr.includes('-')) {
      // Es solo fecha, parsear como local añadiendo T12:00:00 para evitar problemas de timezone
      const [year, month, day] = dateStr.split('-').map(Number);
      date = new Date(year, month - 1, day, 12, 0, 0);
    } else {
      date = new Date(dateStr);
    }
    return formatDistanceToNow(date, { addSuffix: false, locale: es });
  };

  return (
    <div className="h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3 pb-24 lg:pb-3 overflow-hidden">
      {/* 3-column grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-3 max-w-[1800px] mx-auto h-[calc(100vh-24px)]">
        
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Main Content - scrollable */}
        <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-4 flex flex-col gap-4 h-full overflow-y-auto border border-border/50">
          {/* Greeting */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              {getGreeting()}, {getUserName()}
            </h1>
            <p className="text-muted-foreground mt-1">{getCurrentDate()}</p>
          </div>

          {/* Sparky Card */}
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-6 border border-primary/30">
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
                    className="bg-transparent backdrop-blur-sm rounded-[18px] p-5 text-left hover:bg-muted/30 transition-all group border border-border/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">💡</span>
                    </div>
                    <p className="text-foreground font-medium leading-relaxed line-clamp-1 text-sm mb-1">
                      {idea.title}
                    </p>
                    {idea.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {idea.description.length > 80 ? idea.description.substring(0, 80) + '...' : idea.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/70">
                      Hace {getRelativeTime(idea.created_at)}
                    </p>
                  </button>
                ))
              ) : (
                <div className="md:col-span-3 bg-transparent backdrop-blur-sm rounded-[18px] p-8 border border-dashed border-border/70 text-center">
                  <div className="flex justify-center mb-4">
                    <span className="text-4xl">💡</span>
                  </div>
                  <p className="text-foreground font-medium mb-2">
                    Aquí aparecerán tus ideas
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Pulsa el botón <span className="inline-flex items-center justify-center w-6 h-6 bg-primary rounded-full text-primary-foreground text-xs font-bold mx-1">+</span> amarillo para capturar tu primera idea
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Latest Diary Entries */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground tracking-wider mb-3 px-1">
              ÚLTIMAS ENTRADAS DEL DIARIO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentDiaryEntries.length > 0 ? (
                recentDiaryEntries.map((entry) => (
                  <Link
                    key={entry.id}
                    to="/diary"
                    className="bg-transparent backdrop-blur-sm rounded-[18px] p-5 text-left hover:bg-muted/30 transition-all group border border-border/50"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">📖</span>
                      {entry.mood && (
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary rounded-md">
                          {entry.mood === 'great' ? 'Genial' : entry.mood === 'good' ? 'Bien' : entry.mood === 'neutral' ? 'Normal' : entry.mood === 'bad' ? 'Mal' : entry.mood === 'terrible' ? 'Terrible' : entry.mood}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground font-medium leading-relaxed line-clamp-2 text-sm mb-3">
                      {entry.title || entry.content.substring(0, 50)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hace {getRelativeTime(entry.entry_date)}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="md:col-span-3 bg-transparent backdrop-blur-sm rounded-[18px] p-8 border border-dashed border-border/70 text-center">
                  <div className="flex justify-center mb-4">
                    <span className="text-4xl">📖</span>
                  </div>
                  <p className="text-foreground font-medium mb-2">
                    Aquí aparecerán tus entradas de diario
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Pulsa el botón <span className="inline-flex items-center justify-center w-6 h-6 bg-primary rounded-full text-primary-foreground text-xs font-bold mx-1">+</span> amarillo y escribe "diario:" para crear tu primera entrada
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />
        </div>

        {/* Right Sidebar - fixed height */}
        <div className="hidden lg:flex flex-col h-full">
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-5 flex flex-col h-full overflow-hidden border border-border/50">
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

          {/* Botón Hablar con Sparky */}
          <div className="mt-auto pt-4">
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

      {/* Floating Capture Button - Desktop */}
      <FloatingCaptureButton />

      {/* Onboarding Tour - First time users */}
      {showOnboarding && (
        <OnboardingTour 
          onComplete={completeOnboarding}
          userName={profile?.display_name?.split(' ')[0]}
        />
      )}
    </div>
  );
};

export default Dashboard;
