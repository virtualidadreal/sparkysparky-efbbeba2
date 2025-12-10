import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Idea, CreateIdeaInput, UpdateIdeaInput, IdeasFilters } from '@/types/Idea.types';
import toast from 'react-hot-toast';

/**
 * Keys para React Query
 */
const QUERY_KEYS = {
  ideas: (filters?: IdeasFilters) => ['ideas', filters],
  idea: (id: string) => ['idea', id],
};

/**
 * Hook para listar ideas del usuario
 * 
 * @param filters - Filtros opcionales (status, category, tags, search)
 * @returns Query de React Query con lista de ideas
 */
export const useIdeas = (filters?: IdeasFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.ideas(filters),
    queryFn: async () => {
      let query = supabase
        .from('ideas')
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
          `original_content.ilike.%${filters.search}%,title.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Idea[];
    },
  });
};

/**
 * Hook para obtener una idea por ID
 * 
 * @param id - UUID de la idea
 * @returns Query de React Query con la idea
 */
export const useIdea = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.idea(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Idea no encontrada');
      return data as Idea;
    },
    enabled: !!id,
  });
};

/**
 * Hook para crear una nueva idea
 * 
 * @returns Mutation de React Query
 */
export const useCreateIdea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateIdeaInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('ideas')
        .insert([
          {
            user_id: user.id,
            original_content: input.original_content,
            audio_url: input.audio_url,
            transcription: input.transcription,
            title: input.title,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Idea;
    },
    onSuccess: (data) => {
      // Invalidar queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast.success('Idea guardada exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error al crear idea:', error);
      toast.error('Error al guardar la idea');
    },
  });
};

/**
 * Hook para actualizar una idea
 * 
 * @returns Mutation de React Query
 */
export const useUpdateIdea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateIdeaInput }) => {
      const { data, error } = await supabase
        .from('ideas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Idea;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['idea', data.id] });
      toast.success('Idea actualizada');
    },
    onError: (error: Error) => {
      console.error('Error al actualizar idea:', error);
      toast.error('Error al actualizar la idea');
    },
  });
};

/**
 * Hook para archivar una idea
 * 
 * @returns Mutation de React Query
 */
export const useArchiveIdea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('ideas')
        .update({ status: 'archived' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Idea;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast.success('Idea archivada');
    },
    onError: (error: Error) => {
      console.error('Error al archivar idea:', error);
      toast.error('Error al archivar la idea');
    },
  });
};

/**
 * Hook para eliminar una idea
 * 
 * @returns Mutation de React Query
 */
export const useDeleteIdea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast.success('Idea eliminada');
    },
    onError: (error: Error) => {
      console.error('Error al eliminar idea:', error);
      toast.error('Error al eliminar la idea');
    },
  });
};
