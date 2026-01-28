/**
 * Hook para People - Conectado a Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Person, CreatePersonInput, UpdatePersonInput, PeopleFilters } from '@/types/Person.types';

/**
 * Hook para obtener lista de personas
 */
export const usePeople = (filters?: PeopleFilters) => {
  return useQuery({
    queryKey: ['people', filters],
    queryFn: async () => {
      let query = supabase
        .from('people')
        .select('*')
        .order('full_name', { ascending: true });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Person[];
    },
  });
};

/**
 * Hook para obtener una persona por ID
 */
export const usePerson = (id: string) => {
  return useQuery({
    queryKey: ['person', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Person | null;
    },
    enabled: !!id,
  });
};

/**
 * Hook para crear persona
 */
export const useCreatePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePersonInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data, error } = await supabase
        .from('people')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
};

/**
 * Hook para actualizar persona
 */
export const useUpdatePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdatePersonInput }) => {
      const { data, error } = await supabase
        .from('people')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
};

/**
 * Hook para eliminar persona
 */
export const useDeletePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
};
