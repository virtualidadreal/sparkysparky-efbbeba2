import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface MemoryEntry {
  id: string;
  user_id: string;
  entry_type: 'fact' | 'preference' | 'pattern' | 'insight' | 'goal' | 'habit';
  category: string | null;
  content: string;
  source_type: string | null;
  source_id: string | null;
  confidence: number | null;
  last_referenced_at: string | null;
  reference_count: number | null;
  is_active: boolean | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Summary {
  id: string;
  user_id: string;
  summary_type: 'daily' | 'weekly' | 'monthly' | 'topic' | 'project';
  period_start: string | null;
  period_end: string | null;
  topic: string | null;
  project_id: string | null;
  title: string;
  content: string;
  key_insights: string[];
  patterns_detected: Array<{ type: string; title: string; description: string }>;
  action_items: string[];
  metrics: Record<string, unknown>;
  sources: Record<string, unknown>;
  created_at: string;
}

export interface DetectedPattern {
  id: string;
  user_id: string;
  pattern_type: 'recurring_theme' | 'behavior' | 'productivity' | 'emotional' | 'goal_progress' | 'blocker';
  title: string;
  description: string | null;
  evidence: Array<Record<string, unknown>>;
  occurrences: number | null;
  first_detected_at: string;
  last_detected_at: string;
  status: 'active' | 'resolved' | 'acknowledged' | 'dismissed';
  suggestions: string[];
  created_at: string;
  updated_at: string;
}

// Memory Entries Hooks
export const useMemoryEntries = (type?: string) => {
  return useQuery({
    queryKey: ['memory-entries', type],
    queryFn: async () => {
      let query = supabase
        .from('memory_entries')
        .select('*')
        .eq('is_active', true)
        .order('reference_count', { ascending: false });

      if (type) {
        query = query.eq('entry_type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MemoryEntry[];
    },
  });
};

export const useCreateMemoryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Partial<MemoryEntry>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('memory_entries')
        .insert([{
          user_id: user.id,
          entry_type: entry.entry_type || 'fact',
          content: entry.content || '',
          category: entry.category || null,
          source_type: entry.source_type || null,
          source_id: entry.source_id || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-entries'] });
      toast.success('Memoria guardada');
    },
    onError: () => {
      toast.error('Error al guardar memoria');
    },
  });
};

export const useDeleteMemoryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('memory_entries')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-entries'] });
      toast.success('Memoria eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar memoria');
    },
  });
};

// Summaries Hooks
export const useSummaries = (type?: string) => {
  return useQuery({
    queryKey: ['summaries', type],
    queryFn: async () => {
      let query = supabase
        .from('summaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('summary_type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Summary[];
    },
  });
};

export const useGenerateSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      type: 'weekly' | 'monthly' | 'topic' | 'project';
      periodStart?: string;
      periodEnd?: string;
      topic?: string;
      projectId?: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await supabase.functions.invoke('generate-summary', {
        body: params,
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summaries'] });
      queryClient.invalidateQueries({ queryKey: ['detected-patterns'] });
      toast.success('Resumen generado');
    },
    onError: (error: Error) => {
      console.error('Error generating summary:', error);
      toast.error('Error al generar resumen');
    },
  });
};

// Detected Patterns Hooks
export const useDetectedPatterns = (status?: string) => {
  return useQuery({
    queryKey: ['detected-patterns', status],
    queryFn: async () => {
      let query = supabase
        .from('detected_patterns')
        .select('*')
        .order('last_detected_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DetectedPattern[];
    },
  });
};

export const useAnalyzePatterns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await supabase.functions.invoke('analyze-patterns', {
        body: {},
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detected-patterns'] });
      queryClient.invalidateQueries({ queryKey: ['memory-entries'] });
      toast.success('Análisis completado');
    },
    onError: (error: Error) => {
      console.error('Error analyzing patterns:', error);
      toast.error('Error al analizar patrones');
    },
  });
};

export const useUpdatePatternStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('detected_patterns')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detected-patterns'] });
    },
    onError: () => {
      toast.error('Error al actualizar patrón');
    },
  });
};
