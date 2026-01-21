import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Idea, CreateIdeaInput, UpdateIdeaInput, IdeasFilters, parseIdea } from '@/types/Idea.types';
import toast from 'react-hot-toast';

/**
 * Keys para React Query
 */
const QUERY_KEYS = {
  ideas: (filters?: IdeasFilters) => ['ideas', filters],
  idea: (id: string) => ['idea', id],
  unassignedCount: () => ['ideas', 'unassigned-count'],
};

/**
 * Helper para transformar datos de DB a tipo Idea
 */
const transformIdea = (data: any): Idea => ({
  ...data,
  tags: data.tags || [],
  suggested_improvements: data.suggested_improvements || [],
  next_steps: data.next_steps || [],
  related_people: data.related_people || [],
  detected_emotions: data.detected_emotions || [],
  metadata: data.metadata || {},
});

/**
 * Hook para listar ideas del usuario
 */
export const useIdeas = (filters?: IdeasFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.ideas(filters),
    queryFn: async () => {
      // Use decrypted view for reading
      let query = supabase
        .from('ideas_decrypted' as any)
        .select('*')
        .order('created_at', { ascending: false });

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
          `original_content.ilike.%${filters.search}%,title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(transformIdea);
    },
  });
};

/**
 * Hook para contar ideas sin proyecto asignado
 */
export const useUnassignedIdeasCount = () => {
  return useQuery({
    queryKey: QUERY_KEYS.unassignedCount(),
    queryFn: async () => {
      const { count, error } = await supabase
        .from('ideas')
        .select('*', { count: 'exact', head: true })
        .is('project_id', null)
        .neq('status', 'archived');

      if (error) throw error;
      return count || 0;
    },
  });
};

/**
 * Hook para obtener una idea por ID
 */
export const useIdea = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.idea(id),
    queryFn: async () => {
      // Use decrypted view for reading
      const { data, error } = await supabase
        .from('ideas_decrypted' as any)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Idea no encontrada');
      return transformIdea(data);
    },
    enabled: !!id,
  });
};

/**
 * Hook para crear una nueva idea
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
            title: input.title || 'Nueva idea',
            description: input.description,
            original_content: input.original_content,
            audio_url: input.audio_url,
            transcription: input.transcription,
            category: input.category || 'general',
            priority: input.priority || 'medium',
            status: 'active',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      // Trigger background connection analysis for the new idea
      supabase.functions.invoke('analyze-idea-connections', {
        body: { ideaId: data.id }
      }).catch(err => {
        console.log('Connection analysis background task:', err);
      });
      
      return transformIdea(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['intelligentConnections'] });
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
 */
export const useUpdateIdea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateIdeaInput }) => {
      const { data, error } = await supabase
        .from('ideas')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformIdea(data);
    },
    onSuccess: (data) => {
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
      return transformIdea(data);
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
