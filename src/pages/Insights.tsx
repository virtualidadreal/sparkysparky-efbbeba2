import { DashboardLayout } from '@/components/layout';
import { useInsights } from '@/hooks/useInsights';
import {
  LightBulbIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  BookOpenIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  trendLabel?: string;
}) => (
  <div className="bg-white/60 dark:bg-card/60 backdrop-blur-lg rounded-[18px] border border-white/50 dark:border-white/10 p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        {trend !== undefined && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <ArrowTrendingUpIcon className="h-3 w-3 text-[hsl(217,91%,60%)]" />
            {trend} {trendLabel}
          </p>
        )}
      </div>
      <div className="h-12 w-12 rounded-xl bg-[hsl(217,91%,60%)]/10 flex items-center justify-center">
        <Icon className="h-6 w-6 text-[hsl(217,91%,60%)]" />
      </div>
    </div>
  </div>
);

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white/60 dark:bg-card/60 backdrop-blur-lg rounded-[18px] border border-white/50 dark:border-white/10 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
    {children}
  </div>
);

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--muted-foreground))',
  'hsl(221, 83%, 53%)',
  'hsl(262, 83%, 58%)',
];

const Insights = () => {
  const { data: insights, isLoading } = useInsights();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!insights) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Insights</h1>
          <p className="text-muted-foreground mt-1">
            Análisis y estadísticas de tu actividad
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Ideas"
            value={insights.totals.ideas}
            icon={LightBulbIcon}
            trend={insights.recentTrends.ideasThisWeek}
            trendLabel="esta semana"
          />
          <StatCard
            title="Proyectos"
            value={insights.totals.projects}
            icon={FolderIcon}
            trend={insights.recentTrends.projectsActive}
            trendLabel="activos"
          />
          <StatCard
            title="Tareas"
            value={insights.totals.tasks}
            icon={ClipboardDocumentListIcon}
            trend={insights.recentTrends.tasksCompletedThisWeek}
            trendLabel="completadas"
          />
          <StatCard
            title="Contactos"
            value={insights.totals.people}
            icon={UserGroupIcon}
          />
          <StatCard
            title="Entradas Diario"
            value={insights.totals.diaryEntries}
            icon={BookOpenIcon}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity */}
          <ChartCard title="Actividad Semanal">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar dataKey="ideas" name="Ideas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tasks" name="Tareas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="diary" name="Diario" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Tasks by Status */}
          <ChartCard title="Estado de Tareas">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={insights.tasksByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {insights.tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects by Status */}
          <ChartCard title="Estado de Proyectos">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={insights.projectsByStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {insights.projectsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Ideas by Category */}
          <ChartCard title="Ideas por Categoría">
            <div className="h-48">
              {insights.ideasByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insights.ideasByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sin datos
                </div>
              )}
            </div>
          </ChartCard>

          {/* Ideas by Sentiment */}
          <ChartCard title="Sentimiento de Ideas">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={insights.ideasBySentiment}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                  >
                    {insights.ideasBySentiment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-[hsl(217,91%,60%)]/10 via-[hsl(217,91%,60%)]/5 to-transparent rounded-[18px] border border-white/50 dark:border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Resumen Rápido</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <LightBulbIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{insights.recentTrends.ideasThisWeek}</p>
                <p className="text-sm text-muted-foreground">Ideas esta semana</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{insights.recentTrends.tasksCompletedThisWeek}</p>
                <p className="text-sm text-muted-foreground">Tareas completadas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <FolderIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{insights.recentTrends.projectsActive}</p>
                <p className="text-sm text-muted-foreground">Proyectos activos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Insights;
