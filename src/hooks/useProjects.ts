import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Project, CreateProjectInput, UpdateProjectInput, ProjectsFilters } from '@/types/Project.types';
import toast from 'react-hot-toast';

/**
 * Keys para React Query
 */
const QUERY_KEYS = {
  projects: (filters?: ProjectsFilters) => ['projects', filters],
  project: (id: string) => ['project', id],
  activeCount: () => ['projects', 'active-count'],
};

/**
 * Hook para listar proyectos del usuario
 * 
 * @param filters - Filtros opcionales (status, category, tags, search)
 * @returns Query de React Query con lista de proyectos
 */
export const useProjects = (filters?: ProjectsFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.projects(filters),
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Project[];
    },
  });
};

/**
 * Hook para obtener un proyecto por ID
 * 
 * @param id - UUID del proyecto
 * @returns Query de React Query con el proyecto
 */
export const useProject = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.project(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Proyecto no encontrado');
      return data as Project;
    },
    enabled: !!id,
  });
};

/**
 * Hook para obtener el conteo de proyectos activos
 */
export const useActiveProjectsCount = () => {
  return useQuery({
    queryKey: QUERY_KEYS.activeCount(),
    queryFn: async () => {
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (error) throw error;
      return count || 0;
    },
  });
};

/**
 * Hook para crear un nuevo proyecto
 * 
 * Valida que no haya más de 5 proyectos activos
 * 
 * @returns Mutation de React Query
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Validar límite de 5 proyectos activos
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (count && count >= 5) {
        throw new Error('Ya tienes 5 proyectos activos. Por favor pausa o completa uno antes de crear otro.');
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            name: input.name,
            description: input.description,
            category: input.category,
            priority: input.priority || 3,
            start_date: input.start_date,
            target_end_date: input.target_end_date,
            tags: input.tags || [],
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto creado exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error al crear proyecto:', error);
      toast.error(error.message || 'Error al crear el proyecto');
    },
  });
};

/**
 * Hook para actualizar un proyecto
 * 
 * @returns Mutation de React Query
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateProjectInput }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
      toast.success('Proyecto actualizado');
    },
    onError: (error: Error) => {
      console.error('Error al actualizar proyecto:', error);
      toast.error('Error al actualizar el proyecto');
    },
  });
};

/**
 * Hook para archivar un proyecto
 * 
 * @returns Mutation de React Query
 */
export const useArchiveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto archivado');
    },
    onError: (error: Error) => {
      console.error('Error al archivar proyecto:', error);
      toast.error('Error al archivar el proyecto');
    },
  });
};

/**
 * Hook para eliminar un proyecto
 * 
 * @returns Mutation de React Query
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto eliminado');
    },
    onError: (error: Error) => {
      console.error('Error al eliminar proyecto:', error);
      toast.error('Error al eliminar el proyecto');
    },
  });
};
