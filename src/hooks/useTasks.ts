import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Task, CreateTaskInput, UpdateTaskInput, TasksFilters } from '@/types/Task.types';
import toast from 'react-hot-toast';

/**
 * Keys para React Query
 */
const QUERY_KEYS = {
  tasks: (filters?: TasksFilters) => ['tasks', filters],
  task: (id: string) => ['task', id],
};

/**
 * Hook para listar tareas del usuario
 * 
 * @param filters - Filtros opcionales (status, project_id, due_date, tags, search)
 * @returns Query de React Query con lista de tareas
 */
export const useTasks = (filters?: TasksFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.tasks(filters),
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      if (filters?.due_date) {
        query = query.eq('due_date', filters.due_date);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Task[];
    },
  });
};

/**
 * Hook para obtener una tarea por ID
 * 
 * @param id - UUID de la tarea
 * @returns Query de React Query con la tarea
 */
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

/**
 * Hook para crear una nueva tarea
 * 
 * @returns Mutation de React Query
 */
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
            priority: input.priority || 3,
            due_date: input.due_date,
            project_id: input.project_id,
            tags: input.tags || [],
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarea creada exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error al crear tarea:', error);
      toast.error('Error al crear la tarea');
    },
  });
};

/**
 * Hook para actualizar una tarea
 * 
 * @returns Mutation de React Query
 */
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
      queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      toast.success('Tarea actualizada');
    },
    onError: (error: Error) => {
      console.error('Error al actualizar tarea:', error);
      toast.error('Error al actualizar la tarea');
    },
  });
};

/**
 * Hook para actualizar el estado de una tarea (cambiar columna en Kanban)
 * 
 * @returns Mutation de React Query
 */
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'todo' | 'doing' | 'done' }) => {
      const updates: UpdateTaskInput = { status };
      
      // Si se marca como done, registrar completed_at
      if (status === 'done') {
        updates.completed_at = new Date().toISOString();
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
    },
    onError: (error: Error) => {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al mover la tarea');
    },
  });
};

/**
 * Hook para eliminar una tarea
 * 
 * @returns Mutation de React Query
 */
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
      toast.success('Tarea eliminada');
    },
    onError: (error: Error) => {
      console.error('Error al eliminar tarea:', error);
      toast.error('Error al eliminar la tarea');
    },
  });
};
