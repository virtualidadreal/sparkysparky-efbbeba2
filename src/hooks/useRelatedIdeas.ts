import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Idea } from '@/types/Idea.types';

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
 * Hook para obtener ideas relacionadas por tags
 */
export const useRelatedIdeas = (ideaId: string, tags: string[], limit = 5) => {
  return useQuery({
    queryKey: ['relatedIdeas', ideaId, tags],
    queryFn: async () => {
      if (!tags || tags.length === 0) return [];

      // Use decrypted view to get readable titles
      const { data, error } = await supabase
        .from('ideas_decrypted')
        .select('*')
        .neq('id', ideaId)
        .overlaps('tags', tags)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(transformIdea);
    },
    enabled: !!ideaId && tags.length > 0,
  });
};

/**
 * Hook para obtener ideas por proyecto
 */
export const useIdeasByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['ideasByProject', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformIdea);
    },
    enabled: !!projectId,
  });
};

/**
 * Hook para obtener el proyecto de una idea
 */
export const useIdeaProject = (projectId: string | null | undefined) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('projects')
        .select('id, title, tags, keywords')
        .eq('id', projectId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
};
