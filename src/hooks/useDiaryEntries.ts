import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  DiaryEntry, 
  CreateDiaryEntryInput, 
  UpdateDiaryEntryInput,
  DiaryEntriesFilters 
} from '@/types/DiaryEntry.types';
import toast from 'react-hot-toast';

/**
 * Keys para React Query
 */
const QUERY_KEYS = {
  diaryEntries: (filters?: DiaryEntriesFilters) => ['diary-entries', filters],
  diaryEntry: (id: string) => ['diary-entry', id],
};

/**
 * Hook para listar entradas de diario del usuario
 */
export const useDiaryEntries = (filters?: DiaryEntriesFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.diaryEntries(filters),
    queryFn: async () => {
      let query = supabase
        .from('diary_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.mood) {
        query = query.eq('mood', filters.mood);
      }

      if (filters?.date_from) {
        query = query.gte('entry_date', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('entry_date', filters.date_to);
      }

      if (filters?.search) {
        query = query.or(
          `content.ilike.%${filters.search}%,title.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(entry => ({
        ...entry,
        tags: entry.tags || [],
        related_people: entry.related_people || [],
        detected_emotions: entry.detected_emotions || [],
      })) as DiaryEntry[];
    },
  });
};

/**
 * Hook para obtener una entrada de diario por ID
 */
export const useDiaryEntry = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.diaryEntry(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Entrada de diario no encontrada');
      return data as DiaryEntry;
    },
    enabled: !!id,
  });
};

/**
 * Hook para crear una nueva entrada de diario
 */
export const useCreateDiaryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDiaryEntryInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('diary_entries')
        .insert([
          {
            user_id: user.id,
            content: input.content,
            title: input.title,
            mood: input.mood,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as DiaryEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      toast.success('Entrada de diario guardada');
    },
    onError: (error: Error) => {
      console.error('Error al crear entrada de diario:', error);
      toast.error('Error al guardar la entrada');
    },
  });
};

/**
 * Hook para actualizar una entrada de diario
 */
export const useUpdateDiaryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateDiaryEntryInput }) => {
      const { data, error } = await supabase
        .from('diary_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as DiaryEntry;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      queryClient.invalidateQueries({ queryKey: ['diary-entry', data.id] });
      toast.success('Entrada actualizada');
    },
    onError: (error: Error) => {
      console.error('Error al actualizar entrada:', error);
      toast.error('Error al actualizar la entrada');
    },
  });
};

/**
 * Hook para eliminar una entrada de diario
 */
export const useDeleteDiaryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      toast.success('Entrada eliminada');
    },
    onError: (error: Error) => {
      console.error('Error al eliminar entrada:', error);
      toast.error('Error al eliminar la entrada');
    },
  });
};
