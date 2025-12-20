import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Task, CreateTaskInput, UpdateTaskInput, TasksFilters } from '@/types/Task.types';
import toast from 'react-hot-toast';
import { format, isToday, isTomorrow, isPast, addDays, startOfDay } from 'date-fns';

const QUERY_KEYS = {
  tasks: (filters?: TasksFilters) => ['tasks', filters],
  task: (id: string) => ['task', id],
  tasksWithSubtasks: (filters?: TasksFilters) => ['tasks-with-subtasks', filters],
};

/**
 * Helper para filtrar por fecha
 */
const applyDateFilter = (query: any, dateView?: string) => {
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const tomorrow = format(addDays(startOfDay(new Date()), 1), 'yyyy-MM-dd');
  const dayAfter = format(addDays(startOfDay(new Date()), 2), 'yyyy-MM-dd');

  switch (dateView) {
    case 'today':
      return query.eq('due_date', today);
    case 'tomorrow':
      return query.eq('due_date', tomorrow);
    case 'upcoming':
      return query.eq('due_date', dayAfter);
    case 'overdue':
      return query.lt('due_date', today).neq('status', 'done');
    case 'no-date':
      return query.is('due_date', null);
    default:
      return query;
  }
};

export const useTasks = (filters?: TasksFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.tasks(filters),
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      // Filter by date view
      if (filters?.dateView && filters.dateView !== 'all') {
        query = applyDateFilter(query, filters.dateView);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      if (filters?.list_id) {
        query = query.eq('list_id', filters.list_id);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.due_date) {
        query = query.eq('due_date', filters.due_date);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      // Filter by parent_task_id (null for root tasks)
      if (filters?.parent_task_id === null) {
        query = query.is('parent_task_id', null);
      } else if (filters?.parent_task_id) {
        query = query.eq('parent_task_id', filters.parent_task_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as Task[];
    },
  });
};

/**
 * Hook para obtener tareas con sus subtareas anidadas
 */
export const useTasksWithSubtasks = (filters?: TasksFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.tasksWithSubtasks(filters),
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      // Apply filters except parent_task_id
      if (filters?.dateView && filters.dateView !== 'all') {
        query = applyDateFilter(query, filters.dateView);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.list_id) {
        query = query.eq('list_id', filters.list_id);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      const tasks = (data || []) as Task[];

      // Build tree structure
      const taskMap = new Map<string, Task>();
      const rootTasks: Task[] = [];

      // First pass: index all tasks
      tasks.forEach(task => {
        taskMap.set(task.id, { ...task, subtasks: [] });
      });

      // Second pass: build hierarchy
      tasks.forEach(task => {
        const taskWithSubtasks = taskMap.get(task.id)!;
        if (task.parent_task_id && taskMap.has(task.parent_task_id)) {
          const parent = taskMap.get(task.parent_task_id)!;
          parent.subtasks = parent.subtasks || [];
          parent.subtasks.push(taskWithSubtasks);
        } else if (!task.parent_task_id) {
          rootTasks.push(taskWithSubtasks);
        }
      });

      return rootTasks;
    },
  });
};

/**
 * Hook para contar tareas por fecha
 */
export const useTaskCounts = () => {
  return useQuery({
    queryKey: ['task-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('due_date, status');

      if (error) throw error;

      const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
      const tomorrow = format(addDays(startOfDay(new Date()), 1), 'yyyy-MM-dd');
      const dayAfter = format(addDays(startOfDay(new Date()), 2), 'yyyy-MM-dd');

      const counts = {
        today: 0,
        tomorrow: 0,
        upcoming: 0,
        overdue: 0,
        all: 0,
        noDate: 0,
      };

      (data || []).forEach(task => {
        if (task.status === 'done') return;
        
        counts.all++;
        
        if (!task.due_date) {
          counts.noDate++;
        } else if (task.due_date === today) {
          counts.today++;
        } else if (task.due_date === tomorrow) {
          counts.tomorrow++;
        } else if (task.due_date === dayAfter) {
          counts.upcoming++;
        } else if (task.due_date < today) {
          counts.overdue++;
        }
      });

      return counts;
    },
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.task(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Tarea no encontrada');
      return data as Task;
    },
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: user.id,
            title: input.title,
            description: input.description,
            priority: input.priority || 'medium',
            status: input.status || 'todo',
            due_date: input.due_date,
            project_id: input.project_id,
            list_id: input.list_id,
            parent_task_id: input.parent_task_id,
            sort_order: input.sort_order || 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-with-subtasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-counts'] });
      queryClient.invalidateQueries({ queryKey: ['task-lists-with-counts'] });
    },
    onError: (error: Error) => {
      console.error('Error al crear tarea:', error);
      toast.error('Error al crear la tarea');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTaskInput }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-with-subtasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      queryClient.invalidateQueries({ queryKey: ['task-counts'] });
      queryClient.invalidateQueries({ queryKey: ['task-lists-with-counts'] });
    },
    onError: (error: Error) => {
      console.error('Error al actualizar tarea:', error);
      toast.error('Error al actualizar la tarea');
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: UpdateTaskInput = { status };
      
      // Set completed_at when marking as done
      if (status === 'done') {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-with-subtasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-counts'] });
      queryClient.invalidateQueries({ queryKey: ['task-lists-with-counts'] });
    },
    onError: (error: Error) => {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al mover la tarea');
    },
  });
};

export const useToggleTaskComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Task) => {
      const newStatus = task.status === 'done' ? 'todo' : 'done';
      const updates: UpdateTaskInput = { 
        status: newStatus,
        completed_at: newStatus === 'done' ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-with-subtasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-counts'] });
      queryClient.invalidateQueries({ queryKey: ['task-lists-with-counts'] });
    },
    onError: (error: Error) => {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar estado de la tarea');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-with-subtasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-counts'] });
      queryClient.invalidateQueries({ queryKey: ['task-lists-with-counts'] });
      toast.success('Tarea eliminada');
    },
    onError: (error: Error) => {
      console.error('Error al eliminar tarea:', error);
      toast.error('Error al eliminar la tarea');
    },
  });
};

/**
 * Hook para reordenar tareas
 */
export const useReorderTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tasks: { id: string; sort_order: number }[]) => {
      const updates = tasks.map(task => 
        supabase
          .from('tasks')
          .update({ sort_order: task.sort_order })
          .eq('id', task.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-with-subtasks'] });
    },
    onError: (error: Error) => {
      console.error('Error al reordenar:', error);
      toast.error('Error al reordenar tareas');
    },
  });
};
