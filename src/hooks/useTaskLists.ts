import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export interface TaskList {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  task_count?: number;
}

export interface CreateTaskListInput {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateTaskListInput {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

/**
 * Hook para obtener todas las listas de tareas del usuario
 */
export const useTaskLists = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['task-lists', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('task_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as TaskList[];
    },
    enabled: !!user?.id,
  });
};

/**
 * Hook para obtener listas con conteo de tareas pendientes
 */
export const useTaskListsWithCounts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['task-lists-with-counts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get lists
      const { data: lists, error: listsError } = await supabase
        .from('task_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (listsError) throw listsError;

      // Get task counts per list
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('list_id, status')
        .eq('user_id', user.id)
        .neq('status', 'done');

      if (tasksError) throw tasksError;

      // Calculate counts
      const countsMap = tasks?.reduce((acc, task) => {
        const listId = task.list_id || 'no-list';
        acc[listId] = (acc[listId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return (lists || []).map(list => ({
        ...list,
        task_count: countsMap[list.id] || 0,
      })) as TaskList[];
    },
    enabled: !!user?.id,
  });
};

/**
 * Hook para crear una lista de tareas
 */
export const useCreateTaskList = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateTaskListInput) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('task_lists')
        .insert({
          user_id: user.id,
          name: input.name,
          color: input.color || '#3b82f6',
          icon: input.icon || 'list',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-lists'] });
      queryClient.invalidateQueries({ queryKey: ['task-lists-with-counts'] });
      toast.success('Lista creada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear la lista');
    },
  });
};

/**
 * Hook para actualizar una lista de tareas
 */
export const useUpdateTaskList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTaskListInput) => {
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from('task_lists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-lists'] });
      queryClient.invalidateQueries({ queryKey: ['task-lists-with-counts'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar la lista');
    },
  });
};

/**
 * Hook para eliminar una lista de tareas
 */
export const useDeleteTaskList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('task_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-lists'] });
      queryClient.invalidateQueries({ queryKey: ['task-lists-with-counts'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Lista eliminada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar la lista');
    },
  });
};
