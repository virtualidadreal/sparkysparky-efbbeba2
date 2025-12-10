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

      // Aplicar filtros
      if (filters?.sentiment) {
        query = query.eq('sentiment', filters.sentiment);
      }

      if (filters?.time_of_day) {
        query = query.eq('time_of_day', filters.time_of_day);
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      if (filters?.search) {
        query = query.or(
          `content.ilike.%${filters.search}%,title.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map((entry: any) => ({
        ...entry,
        emotions: (entry.emotions as any) || [],
        location_coordinates: entry.location_coordinates || null,
      })) as unknown as DiaryEntry[];
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
      return {
        ...data,
        emotions: (data.emotions as any) || [],
        location_coordinates: data.location_coordinates || null,
      } as unknown as DiaryEntry;
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

      // Determinar el momento del día basado en la hora actual
      const hour = new Date().getHours();
      let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
      if (hour >= 5 && hour < 12) timeOfDay = 'morning';
      else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
      else timeOfDay = 'night';

      const { data, error } = await supabase
        .from('diary_entries')
        .insert([
          {
            user_id: user.id,
            content: input.content,
            title: input.title,
            audio_url: input.audio_url,
            transcription: input.transcription,
            location_name: input.location_name,
            location_coordinates: input.location_coordinates,
            time_of_day: timeOfDay,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        emotions: (data.emotions as any) || [],
        location_coordinates: data.location_coordinates || null,
      } as unknown as DiaryEntry;
    },
    onSuccess: (data) => {
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
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        emotions: (data.emotions as any) || [],
        location_coordinates: data.location_coordinates || null,
      } as unknown as DiaryEntry;
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
