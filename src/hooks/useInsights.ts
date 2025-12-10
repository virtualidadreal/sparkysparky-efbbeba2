import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InsightsData {
  totals: {
    ideas: number;
    projects: number;
    tasks: number;
    people: number;
    diaryEntries: number;
  };
  tasksByStatus: { name: string; value: number; color: string }[];
  projectsByStatus: { name: string; value: number; color: string }[];
  ideasByCategory: { name: string; value: number }[];
  ideasBySentiment: { name: string; value: number; color: string }[];
  weeklyActivity: { day: string; ideas: number; tasks: number; diary: number }[];
  recentTrends: {
    ideasThisWeek: number;
    tasksCompletedThisWeek: number;
    projectsActive: number;
  };
}

const getWeekDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('es-ES', { weekday: 'short' }),
    });
  }
  return days;
};

export const useInsights = () => {
  return useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      // Fetch all data in parallel
      const [
        { data: ideas },
        { data: projects },
        { data: tasks },
        { data: people },
        { data: diaryEntries },
      ] = await Promise.all([
        supabase.from('ideas').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('people').select('*'),
        supabase.from('diary_entries').select('*'),
      ]);

      const weekDays = getWeekDays();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Calculate totals
      const totals = {
        ideas: ideas?.length || 0,
        projects: projects?.length || 0,
        tasks: tasks?.length || 0,
        people: people?.length || 0,
        diaryEntries: diaryEntries?.length || 0,
      };

      // Tasks by status
      const taskStatusCount = {
        todo: 0,
        in_progress: 0,
        done: 0,
      };
      tasks?.forEach((task) => {
        const status = task.status || 'todo';
        if (status in taskStatusCount) {
          taskStatusCount[status as keyof typeof taskStatusCount]++;
        }
      });
      const tasksByStatus = [
        { name: 'Por hacer', value: taskStatusCount.todo, color: 'hsl(var(--muted-foreground))' },
        { name: 'En progreso', value: taskStatusCount.in_progress, color: 'hsl(var(--primary))' },
        { name: 'Completadas', value: taskStatusCount.done, color: 'hsl(var(--accent))' },
      ];

      // Projects by status
      const projectStatusCount = {
        active: 0,
        paused: 0,
        completed: 0,
      };
      projects?.forEach((project) => {
        const status = project.status || 'active';
        if (status in projectStatusCount) {
          projectStatusCount[status as keyof typeof projectStatusCount]++;
        }
      });
      const projectsByStatus = [
        { name: 'Activos', value: projectStatusCount.active, color: 'hsl(var(--primary))' },
        { name: 'Pausados', value: projectStatusCount.paused, color: 'hsl(var(--muted-foreground))' },
        { name: 'Completados', value: projectStatusCount.completed, color: 'hsl(var(--accent))' },
      ];

      // Ideas by category
      const categoryCount: Record<string, number> = {};
      ideas?.forEach((idea) => {
        const category = idea.category || 'general';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      const ideasByCategory = Object.entries(categoryCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      // Ideas by sentiment
      const sentimentCount = {
        positive: 0,
        neutral: 0,
        negative: 0,
      };
      ideas?.forEach((idea) => {
        const sentiment = idea.sentiment || 'neutral';
        if (sentiment in sentimentCount) {
          sentimentCount[sentiment as keyof typeof sentimentCount]++;
        }
      });
      const ideasBySentiment = [
        { name: 'Positivo', value: sentimentCount.positive, color: 'hsl(142, 76%, 36%)' },
        { name: 'Neutral', value: sentimentCount.neutral, color: 'hsl(var(--muted-foreground))' },
        { name: 'Negativo', value: sentimentCount.negative, color: 'hsl(0, 84%, 60%)' },
      ];

      // Weekly activity
      const weeklyActivity = weekDays.map(({ date, label }) => {
        const ideasCount = ideas?.filter(
          (i) => i.created_at?.split('T')[0] === date
        ).length || 0;
        const tasksCount = tasks?.filter(
          (t) => t.created_at?.split('T')[0] === date
        ).length || 0;
        const diaryCount = diaryEntries?.filter(
          (d) => d.entry_date === date
        ).length || 0;

        return {
          day: label,
          ideas: ideasCount,
          tasks: tasksCount,
          diary: diaryCount,
        };
      });

      // Recent trends
      const recentTrends = {
        ideasThisWeek: ideas?.filter(
          (i) => new Date(i.created_at) >= oneWeekAgo
        ).length || 0,
        tasksCompletedThisWeek: tasks?.filter(
          (t) => t.status === 'done' && new Date(t.updated_at) >= oneWeekAgo
        ).length || 0,
        projectsActive: projectStatusCount.active,
      };

      return {
        totals,
        tasksByStatus,
        projectsByStatus,
        ideasByCategory,
        ideasBySentiment,
        weeklyActivity,
        recentTrends,
      } as InsightsData;
    },
  });
};
