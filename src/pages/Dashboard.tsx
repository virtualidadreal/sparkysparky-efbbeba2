import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/common';
import { QuickCapture, RecentIdeas } from '@/components/dashboard';
import { MorningBriefingCard } from '@/components/planning/MorningBriefingCard';
import { AlertsPanel } from '@/components/planning/AlertsPanel';
import { SuggestionsPanel } from '@/components/planning/SuggestionsPanel';
import { useIdeas } from '@/hooks/useIdeas';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { usePeople } from '@/hooks/usePeople';
import { useProactiveInsights } from '@/hooks/useProactiveInsights';
import {
  CalendarIcon,
  CheckCircleIcon,
  SparklesIcon,
  BellAlertIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: ideas } = useIdeas({ status: 'active' });
  const { data: tasks } = useTasks();
  const { data: projects } = useProjects();
  const { data: people } = usePeople();

  const {
    isLoading,
    morningBriefing,
    alerts,
    suggestions,
    getMorningBriefing,
    getAlerts,
    getSuggestions,
    dismissAlert,
    dismissSuggestion,
    usage,
  } = useProactiveInsights();

  const [showBriefing, setShowBriefing] = useState(false);

  // Load alerts and suggestions on mount
  useEffect(() => {
    getAlerts();
    getSuggestions();
  }, [getAlerts, getSuggestions]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getUserName = () => {
    const fullName = user?.user_metadata?.full_name;
    if (fullName) {
      return fullName.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'Usuario';
  };

  const handleGetBriefing = async () => {
    setShowBriefing(true);
    await getMorningBriefing();
  };

  const pendingTasks = tasks?.filter(t => t.status !== 'done').length || 0;
  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;

  return (
    <DashboardLayout>
      {/* Header con saludo y briefing button */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {getGreeting()}, {getUserName()}
          </h1>
          <p className="text-muted-foreground">
            Aquí tienes un resumen de tu día
          </p>
        </div>
        <Button
          onClick={handleGetBriefing}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SparklesIcon className="h-4 w-4" />
          )}
          {morningBriefing ? 'Actualizar Briefing' : 'Morning Briefing IA'}
        </Button>
      </div>

      {/* Morning Briefing */}
      {showBriefing && morningBriefing && (
        <div className="mb-6">
          <MorningBriefingCard briefing={morningBriefing} />
        </div>
      )}

      {/* Alerts Panel - Show if there are alerts */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <AlertsPanel
            alerts={alerts}
            onDismiss={dismissAlert}
          />
        </div>
      )}

      {/* Quick Capture */}
      <div className="mb-6">
        <QuickCapture />
      </div>

      {/* Grid de widgets */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {/* Widget: Suggestions */}
        {suggestions.length > 0 && (
          <div className="md:col-span-2">
            <SuggestionsPanel
              suggestions={suggestions}
              onDismiss={dismissSuggestion}
            />
          </div>
        )}

        {/* Widget: Upcoming Events */}
        <Card variant="hoverable" padding="lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <CalendarIcon className="h-6 w-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Próximos Eventos
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                No hay eventos próximos
              </p>
              <p className="text-xs text-muted-foreground">
                Conecta tu calendario para ver eventos aquí
              </p>
            </div>
          </div>
        </Card>

        {/* Widget: MITs del día */}
        <Card variant="hoverable" padding="lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircleIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                MITs del Día
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {pendingTasks} tareas pendientes
              </p>
              <Link to="/tasks" className="text-sm text-primary hover:underline">
                Ver todas las tareas →
              </Link>
            </div>
          </div>
        </Card>

        {/* Widget: Recent Ideas */}
        <div className="md:col-span-2">
          <RecentIdeas />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Ideas capturadas</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {ideas?.length || 0}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Proyectos activos</p>
          <p className="text-2xl font-bold text-foreground mt-1">{activeProjects}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Tareas pendientes</p>
          <p className="text-2xl font-bold text-foreground mt-1">{pendingTasks}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Personas</p>
          <p className="text-2xl font-bold text-foreground mt-1">{people?.length || 0}</p>
        </div>
      </div>

      {/* Refresh insights button */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            getAlerts();
            getSuggestions();
          }}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar insights
        </Button>
        {usage && (
          <p className="text-xs text-muted-foreground">
            {usage.remaining} generaciones restantes hoy (de {usage.limit})
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
