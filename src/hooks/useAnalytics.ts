import { useMemo } from 'react';
import { useIdeas } from './useIdeas';
import { useTasks } from './useTasks';
import { useProjects } from './useProjects';
import { useDiaryEntries } from './useDiaryEntries';
import { usePeople } from './usePeople';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, format, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export interface DailyActivity {
  date: string;
  ideas: number;
  tasks: number;
  diary: number;
  total: number;
}

export interface WeeklyStats {
  week: string;
  completed: number;
  created: number;
  productivity: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface ProductivityMetrics {
  tasksCompleted: number;
  tasksCompletedChange: number;
  ideasCaptured: number;
  ideasCapturedChange: number;
  projectsActive: number;
  diaryStreak: number;
  avgTasksPerDay: number;
  topCategories: CategoryDistribution[];
  dailyActivity: DailyActivity[];
  weeklyStats: WeeklyStats[];
  tasksByStatus: CategoryDistribution[];
  tasksByPriority: CategoryDistribution[];
  ideasByCategory: CategoryDistribution[];
  peopleTotalCount: number;
}

const CATEGORY_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--secondary))',
  'hsl(142, 76%, 36%)',
  'hsl(280, 65%, 60%)',
  'hsl(25, 95%, 53%)',
];

/**
 * Hook para calcular métricas de productividad y analytics
 */
export const useAnalytics = () => {
  const { data: ideas = [] } = useIdeas();
  const { data: tasks = [] } = useTasks();
  const { data: projects = [] } = useProjects();
  const { data: diaryEntries = [] } = useDiaryEntries();
  const { data: people = [] } = usePeople();

  const metrics = useMemo<ProductivityMetrics>(() => {
    const now = new Date();
    const last7Days = subDays(now, 7);
    const last14Days = subDays(now, 14);
    const last30Days = subDays(now, 30);

    // Tasks completed this week vs last week
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const tasksCompletedThisWeek = tasks.filter(t => 
      t.status === 'done' && 
      t.updated_at && 
      isWithinInterval(parseISO(t.updated_at), { start: thisWeekStart, end: now })
    ).length;

    const tasksCompletedLastWeek = tasks.filter(t => 
      t.status === 'done' && 
      t.updated_at && 
      isWithinInterval(parseISO(t.updated_at), { start: lastWeekStart, end: lastWeekEnd })
    ).length;

    const tasksCompletedChange = tasksCompletedLastWeek > 0 
      ? Math.round(((tasksCompletedThisWeek - tasksCompletedLastWeek) / tasksCompletedLastWeek) * 100)
      : tasksCompletedThisWeek > 0 ? 100 : 0;

    // Ideas captured this week vs last week
    const ideasThisWeek = ideas.filter(i => 
      isWithinInterval(parseISO(i.created_at), { start: thisWeekStart, end: now })
    ).length;

    const ideasLastWeek = ideas.filter(i => 
      isWithinInterval(parseISO(i.created_at), { start: lastWeekStart, end: lastWeekEnd })
    ).length;

    const ideasCapturedChange = ideasLastWeek > 0 
      ? Math.round(((ideasThisWeek - ideasLastWeek) / ideasLastWeek) * 100)
      : ideasThisWeek > 0 ? 100 : 0;

    // Active projects
    const projectsActive = projects.filter(p => p.status === 'active').length;

    // Diary streak calculation
    let diaryStreak = 0;
    const sortedDiary = [...diaryEntries].sort((a, b) => 
      new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    );
    
    if (sortedDiary.length > 0) {
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      for (const entry of sortedDiary) {
        const entryDate = new Date(entry.entry_date);
        entryDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          diaryStreak++;
          currentDate = entryDate;
        } else {
          break;
        }
      }
    }

    // Average tasks per day (last 30 days)
    const tasksLast30Days = tasks.filter(t => 
      t.status === 'done' && 
      t.updated_at && 
      isWithinInterval(parseISO(t.updated_at), { start: last30Days, end: now })
    ).length;
    const avgTasksPerDay = Math.round((tasksLast30Days / 30) * 10) / 10;

    // Daily activity (last 14 days)
    const dailyActivity: DailyActivity[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'dd MMM', { locale: es });
      
      const dayIdeas = ideas.filter(item => item.created_at.startsWith(dateStr)).length;
      const dayTasks = tasks.filter(item => 
        item.status === 'done' && item.updated_at?.startsWith(dateStr)
      ).length;
      const dayDiary = diaryEntries.filter(item => item.entry_date === dateStr).length;
      
      dailyActivity.push({
        date: displayDate,
        ideas: dayIdeas,
        tasks: dayTasks,
        diary: dayDiary,
        total: dayIdeas + dayTasks + dayDiary,
      });
    }

    // Weekly stats (last 8 weeks)
    const weeklyStats: WeeklyStats[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      
      const completed = tasks.filter(t => 
        t.status === 'done' && 
        t.updated_at && 
        isWithinInterval(parseISO(t.updated_at), { start: weekStart, end: weekEnd })
      ).length;
      
      const created = [...ideas, ...tasks].filter(item => 
        isWithinInterval(parseISO(item.created_at), { start: weekStart, end: weekEnd })
      ).length;
      
      weeklyStats.push({
        week: format(weekStart, 'dd MMM', { locale: es }),
        completed,
        created,
        productivity: created > 0 ? Math.round((completed / created) * 100) : 0,
      });
    }

    // Tasks by status
    const statusCounts = tasks.reduce((acc, task) => {
      const status = task.status || 'todo';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusLabels: Record<string, string> = {
      todo: 'Pendiente',
      in_progress: 'En progreso',
      done: 'Completada',
    };

    const tasksByStatus: CategoryDistribution[] = Object.entries(statusCounts).map(([status, count], i) => ({
      name: statusLabels[status] || status,
      value: count,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

    // Tasks by priority
    const priorityCounts = tasks.reduce((acc, task) => {
      const priority = task.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityLabels: Record<string, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
    };

    const tasksByPriority: CategoryDistribution[] = Object.entries(priorityCounts).map(([priority, count], i) => ({
      name: priorityLabels[priority] || priority,
      value: count,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

    // Ideas by category
    const categoryCounts = ideas.reduce((acc, idea) => {
      const category = idea.category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ideasByCategory: CategoryDistribution[] = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, count], i) => ({
        name: category,
        value: count,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }));

    // Top categories (from ideas)
    const topCategories = ideasByCategory.slice(0, 4);

    return {
      tasksCompleted: tasksCompletedThisWeek,
      tasksCompletedChange,
      ideasCaptured: ideasThisWeek,
      ideasCapturedChange,
      projectsActive,
      diaryStreak,
      avgTasksPerDay,
      topCategories,
      dailyActivity,
      weeklyStats,
      tasksByStatus,
      tasksByPriority,
      ideasByCategory,
      peopleTotalCount: people.length,
    };
  }, [ideas, tasks, projects, diaryEntries, people]);

  return { metrics };
};
