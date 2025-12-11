import { DashboardLayout } from '@/components/layout';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  CheckCircleIcon,
  LightBulbIcon,
  FolderIcon,
  BookOpenIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/**
 * Tarjeta de métrica principal
 */
const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  iconColor: string;
}) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
            {change >= 0 ? (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4" />
            )}
            <span>{change >= 0 ? '+' : ''}{change}% vs semana anterior</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${iconColor}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

/**
 * Página de Analytics con gráficos de productividad
 */
export default function Analytics() {
  const { metrics } = useAnalytics();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Visualiza tu productividad y tendencias
          </p>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Tareas completadas"
            value={metrics.tasksCompleted}
            change={metrics.tasksCompletedChange}
            icon={CheckCircleIcon}
            iconColor="bg-success/10 text-success"
          />
          <MetricCard
            title="Ideas capturadas"
            value={metrics.ideasCaptured}
            change={metrics.ideasCapturedChange}
            icon={LightBulbIcon}
            iconColor="bg-warning/10 text-warning"
          />
          <MetricCard
            title="Proyectos activos"
            value={metrics.projectsActive}
            icon={FolderIcon}
            iconColor="bg-primary/10 text-primary"
          />
          <MetricCard
            title="Racha de diario"
            value={`${metrics.diaryStreak} días`}
            icon={BookOpenIcon}
            iconColor="bg-secondary/10 text-secondary"
          />
        </div>

        {/* Gráfico de actividad diaria */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Actividad últimos 14 días
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.dailyActivity}>
                <defs>
                  <linearGradient id="colorIdeas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
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
                <Area
                  type="monotone"
                  dataKey="ideas"
                  name="Ideas"
                  stroke="hsl(var(--warning))"
                  fillOpacity={1}
                  fill="url(#colorIdeas)"
                />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  name="Tareas"
                  stroke="hsl(var(--success))"
                  fillOpacity={1}
                  fill="url(#colorTasks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráficos en grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productividad semanal */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Productividad semanal
            </h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="created" name="Creadas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completadas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tareas por estado */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Tareas por estado
            </h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.tasksByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {metrics.tasksByStatus.map((entry, index) => (
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
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ideas por categoría */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Ideas por categoría
            </h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.ideasByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    type="number"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" name="Ideas" radius={[0, 4, 4, 0]}>
                    {metrics.ideasByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resumen rápido */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Resumen rápido
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Tareas promedio/día</span>
                </div>
                <span className="font-bold text-foreground">{metrics.avgTasksPerDay}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="h-5 w-5 text-secondary" />
                  <span className="text-foreground">Contactos totales</span>
                </div>
                <span className="font-bold text-foreground">{metrics.peopleTotalCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FolderIcon className="h-5 w-5 text-warning" />
                  <span className="text-foreground">Proyectos activos</span>
                </div>
                <span className="font-bold text-foreground">{metrics.projectsActive}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOpenIcon className="h-5 w-5 text-success" />
                  <span className="text-foreground">Racha de diario</span>
                </div>
                <span className="font-bold text-foreground">{metrics.diaryStreak} días</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
