import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tag, CreateTagInput, UpdateTagInput, TagsFilters, IdeaTag } from '@/types/Tag.types';
import toast from 'react-hot-toast';

/**
 * Keys para React Query
 */
const QUERY_KEYS = {
  tags: (filters?: TagsFilters) => ['tags', filters],
  tag: (id: string) => ['tag', id],
  ideaTags: (ideaId: string) => ['idea-tags', ideaId],
};

/**
 * Hook para listar etiquetas del usuario
 */
export const useTags = (filters?: TagsFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.tags(filters),
    queryFn: async () => {
      let query = supabase
        .from('tags')
        .select('*')
        .order('usage_count', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Tag[];
    },
  });
};

/**
 * Hook para obtener etiquetas de una idea específica
 */
export const useIdeaTags = (ideaId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ideaTags(ideaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('idea_tags')
        .select(`
          id,
          tag_id,
          tags (*)
        `)
        .eq('idea_id', ideaId);

      if (error) throw error;
      
      // Extraer los tags del resultado
      return (data || []).map((item: any) => item.tags).filter(Boolean) as Tag[];
    },
    enabled: !!ideaId,
  });
};

/**
 * Hook para crear una nueva etiqueta
 */
export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTagInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('tags')
        .insert([
          {
            user_id: user.id,
            name: input.name,
            type: input.type,
            color: input.color || '#6B7280',
            parent_tag_id: input.parent_tag_id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Etiqueta creada');
    },
    onError: (error: Error) => {
      console.error('Error al crear etiqueta:', error);
      toast.error('Error al crear la etiqueta');
    },
  });
};

/**
 * Hook para actualizar una etiqueta
 */
export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTagInput }) => {
      const { data, error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Etiqueta actualizada');
    },
    onError: (error: Error) => {
      console.error('Error al actualizar etiqueta:', error);
      toast.error('Error al actualizar la etiqueta');
    },
  });
};

/**
 * Hook para eliminar una etiqueta
 */
export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Etiqueta eliminada');
    },
    onError: (error: Error) => {
      console.error('Error al eliminar etiqueta:', error);
      toast.error('Error al eliminar la etiqueta');
    },
  });
};

/**
 * Hook para agregar una etiqueta a una idea
 */
export const useAddTagToIdea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ideaId, tagId }: { ideaId: string; tagId: string }) => {
      const { data, error } = await supabase
        .from('idea_tags')
        .insert([{ idea_id: ideaId, tag_id: tagId }])
        .select()
        .single();

      if (error) throw error;
      return data as IdeaTag;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ideaTags(variables.ideaId) });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Etiqueta agregada');
    },
    onError: (error: Error) => {
      console.error('Error al agregar etiqueta:', error);
      toast.error('Error al agregar la etiqueta');
    },
  });
};

/**
 * Hook para remover una etiqueta de una idea
 */
export const useRemoveTagFromIdea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ideaId, tagId }: { ideaId: string; tagId: string }) => {
      const { error } = await supabase
        .from('idea_tags')
        .delete()
        .eq('idea_id', ideaId)
        .eq('tag_id', tagId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ideaTags(variables.ideaId) });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Etiqueta removida');
    },
    onError: (error: Error) => {
      console.error('Error al remover etiqueta:', error);
      toast.error('Error al remover la etiqueta');
    },
  });
};
