import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useInsights } from '@/hooks/useInsights';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  LightBulbIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  BookOpenIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  SparklesIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsAdmin } from '@/hooks/useAdmin';
import { SparkyChat } from '@/components/chat/SparkyChat';
import { QuickCapturePopup } from '@/components/dashboard/QuickCapturePopup';
import {
  Home,
  Users,
  Settings,
  Plus,
  Lightbulb,
  TrendingUp,
  FolderOpen,
  CheckSquare,
  Brain,
  BarChart3,
  ShieldCheck,
  Mic,
} from 'lucide-react';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--muted-foreground))',
  'hsl(221, 83%, 53%)',
  'hsl(262, 83%, 58%)',
];

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  trendPositive,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  trendLabel?: string;
  trendPositive?: boolean;
}) => (
  <div className="bg-muted/30 rounded-xl p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        {trend !== undefined && (
          <p className={`text-xs mt-2 flex items-center gap-1 ${trendPositive !== false ? 'text-green-600' : 'text-red-600'}`}>
            {trendPositive !== false ? (
              <ArrowTrendingUpIcon className="h-3 w-3" />
            ) : (
              <ArrowTrendingDownIcon className="h-3 w-3" />
            )}
            {trend >= 0 ? '+' : ''}{trend} {trendLabel}
          </p>
        )}
      </div>
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
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
  <div className="bg-muted/30 rounded-xl p-5">
    <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
    {children}
  </div>
);

/**
 * Página Estadísticas - Combina Insights y Analytics
 */
const Estadisticas = () => {
  const [activeTab, setActiveTab] = useState('resumen');
  const location = useLocation();
  const { data: isAdmin } = useIsAdmin();
  
  const { data: insights, isLoading: loadingInsights } = useInsights();
  const { metrics } = useAnalytics();

  const isLoading = loadingInsights;

  return (
    <div className="min-h-screen bg-[hsl(220,14%,96%)] p-3">
      {/* 3-column grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-3 max-w-[1800px] mx-auto min-h-[calc(100vh-24px)]">
        
        {/* Left Sidebar */}
        <div className="flex flex-col">
          <div className="bg-card rounded-[24px] p-4 shadow-sm flex flex-col flex-1">
            {/* Nav Items */}
            <nav className="space-y-0.5 flex-1">
              {[
                { to: '/dashboard', icon: Home, label: 'Dashboard' },
                { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
                { to: '/projects', icon: FolderOpen, label: 'Proyectos' },
                { to: '/tasks', icon: CheckSquare, label: 'Tareas' },
                { to: '/people', icon: Users, label: 'Personas' },
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
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <QuickCapturePopup
                trigger={
                  <button className="w-full flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-xl text-muted-foreground text-sm hover:bg-muted transition-colors">
                    <Plus className="h-4 w-4" />
                    Captura rápida
                  </button>
                }
              />

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

        {/* Main Content */}
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="px-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Estadísticas
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualiza tu productividad y tendencias
            </p>
          </div>

          {/* Content */}
          <div className="bg-card rounded-[24px] p-5 shadow-sm flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
                  <TabsTrigger value="resumen" className="rounded-lg">
                    Resumen
                  </TabsTrigger>
                  <TabsTrigger value="actividad" className="rounded-lg">
                    Actividad
                  </TabsTrigger>
                  <TabsTrigger value="distribucion" className="rounded-lg">
                    Distribución
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Resumen */}
                <TabsContent value="resumen" className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="Ideas"
                      value={insights?.totals.ideas || 0}
                      icon={LightBulbIcon}
                      trend={insights?.recentTrends.ideasThisWeek}
                      trendLabel="esta semana"
                    />
                    <StatCard
                      title="Proyectos"
                      value={insights?.totals.projects || 0}
                      icon={FolderIcon}
                      trend={insights?.recentTrends.projectsActive}
                      trendLabel="activos"
                    />
                    <StatCard
                      title="Tareas"
                      value={insights?.totals.tasks || 0}
                      icon={ClipboardDocumentListIcon}
                      trend={insights?.recentTrends.tasksCompletedThisWeek}
                      trendLabel="completadas"
                    />
                    <StatCard
                      title="Contactos"
                      value={insights?.totals.people || 0}
                      icon={UserGroupIcon}
                    />
                  </div>

                  {/* Quick Stats Banner */}
                  <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <SparklesIcon className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Resumen Rápido</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <LightBulbIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">{insights?.recentTrends.ideasThisWeek || 0}</p>
                          <p className="text-xs text-muted-foreground">Ideas esta semana</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">{insights?.recentTrends.tasksCompletedThisWeek || 0}</p>
                          <p className="text-xs text-muted-foreground">Tareas completadas</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <FolderIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">{insights?.recentTrends.projectsActive || 0}</p>
                          <p className="text-xs text-muted-foreground">Proyectos activos</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <BookOpenIcon className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">{metrics.diaryStreak}</p>
                          <p className="text-xs text-muted-foreground">Días de racha diario</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ChartCard title="Actividad Semanal">
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={insights?.weeklyActivity || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                              }}
                            />
                            <Bar dataKey="ideas" name="Ideas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="tasks" name="Tareas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>

                    <ChartCard title="Estado de Tareas">
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={insights?.tasksByStatus || []}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {(insights?.tasksByStatus || []).map((entry, index) => (
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
                </TabsContent>

                {/* Tab: Actividad */}
                <TabsContent value="actividad" className="space-y-6">
                  {/* Daily Activity Chart */}
                  <ChartCard title="Actividad últimos 14 días">
                    <div className="h-64">
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
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="ideas" name="Ideas" stroke="hsl(var(--warning))" fillOpacity={1} fill="url(#colorIdeas)" />
                          <Area type="monotone" dataKey="tasks" name="Tareas" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#colorTasks)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>

                  {/* Weekly Stats */}
                  <ChartCard title="Productividad semanal">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics.weeklyStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
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
                  </ChartCard>
                </TabsContent>

                {/* Tab: Distribución */}
                <TabsContent value="distribucion" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Projects by Status */}
                    <ChartCard title="Estado de Proyectos">
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={insights?.projectsByStatus || []}
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
                              dataKey="value"
                            >
                              {(insights?.projectsByStatus || []).map((entry, index) => (
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

                    {/* Ideas by Sentiment */}
                    <ChartCard title="Sentimiento de Ideas">
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={insights?.ideasBySentiment || []}
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
                              dataKey="value"
                            >
                              {(insights?.ideasBySentiment || []).map((entry, index) => (
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

                    {/* Ideas by Category */}
                    <ChartCard title="Ideas por Categoría">
                      <div className="h-48">
                        {(insights?.ideasByCategory?.length || 0) > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={insights?.ideasByCategory} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                              <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
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

                    {/* Quick Summary */}
                    <ChartCard title="Resumen rápido">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CalendarDaysIcon className="h-5 w-5 text-primary" />
                            <span className="text-sm text-foreground">Tareas promedio/día</span>
                          </div>
                          <span className="font-bold text-foreground">{metrics.avgTasksPerDay}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <UserGroupIcon className="h-5 w-5 text-secondary" />
                            <span className="text-sm text-foreground">Contactos totales</span>
                          </div>
                          <span className="font-bold text-foreground">{metrics.peopleTotalCount}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <BookOpenIcon className="h-5 w-5 text-orange-500" />
                            <span className="text-sm text-foreground">Entradas de diario</span>
                          </div>
                          <span className="font-bold text-foreground">{insights?.totals.diaryEntries || 0}</span>
                        </div>
                      </div>
                    </ChartCard>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="bg-card rounded-[24px] p-5 shadow-sm flex flex-col">
          {/* Métricas rápidas */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              MÉTRICAS CLAVE
            </h3>
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tareas completadas</span>
                <span className="text-lg font-semibold text-foreground">{metrics.tasksCompleted}</span>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ideas capturadas</span>
                <span className="text-lg font-semibold text-foreground">{metrics.ideasCaptured}</span>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Racha diario</span>
                <span className="text-lg font-semibold text-foreground">{metrics.diaryStreak} días</span>
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-border mb-6" />

          {/* Tips */}
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              CONSEJOS
            </h3>
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  📊 Revisa tus estadísticas semanalmente para identificar patrones.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  🎯 Establece metas basadas en tu actividad promedio.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  ✍️ Mantén tu racha de diario para mejores insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;
