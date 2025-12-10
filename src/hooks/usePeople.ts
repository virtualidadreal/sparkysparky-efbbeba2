import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Person, CreatePersonInput, UpdatePersonInput, PeopleFilters } from '@/types/Person.types';
import toast from 'react-hot-toast';

/**
 * Keys para React Query
 */
const QUERY_KEYS = {
  people: (filters?: PeopleFilters) => ['people', filters],
  person: (id: string) => ['person', id],
};

/**
 * Hook para listar personas del usuario
 * 
 * @param filters - Filtros opcionales (category, needs_attention, search)
 * @returns Query de React Query con lista de personas
 */
export const usePeople = (filters?: PeopleFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.people(filters),
    queryFn: async () => {
      let query = supabase
        .from('people')
        .select('*')
        .order('full_name', { ascending: true });

      // Aplicar filtros
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.needs_attention !== undefined) {
        query = query.eq('needs_attention', filters.needs_attention);
      }

      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,nickname.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Person[];
    },
  });
};

/**
 * Hook para obtener una persona por ID
 * 
 * @param id - UUID de la persona
 * @returns Query de React Query con la persona
 */
export const usePerson = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.person(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Persona no encontrada');
      return data as Person;
    },
    enabled: !!id,
  });
};

/**
 * Hook para crear una nueva persona
 * 
 * @returns Mutation de React Query
 */
export const useCreatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePersonInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('people')
        .insert([
          {
            user_id: user.id,
            full_name: input.full_name,
            nickname: input.nickname,
            email: input.email,
            category: input.category,
            importance_level: input.importance_level || 3,
            desired_contact_frequency: input.desired_contact_frequency,
            birthday: input.birthday,
            interests: input.interests || [],
            tags: input.tags || [],
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Contacto añadido exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error al crear persona:', error);
      toast.error('Error al añadir el contacto');
    },
  });
};

/**
 * Hook para actualizar una persona
 * 
 * @returns Mutation de React Query
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['person', data.id] });
      toast.success('Contacto actualizado');
    },
    onError: (error: Error) => {
      console.error('Error al actualizar persona:', error);
      toast.error('Error al actualizar el contacto');
    },
  });
};

/**
 * Hook para eliminar una persona
 * 
 * @returns Mutation de React Query
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
      toast.success('Contacto eliminado');
    },
    onError: (error: Error) => {
      console.error('Error al eliminar persona:', error);
      toast.error('Error al eliminar el contacto');
    },
  });
};
