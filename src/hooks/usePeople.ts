/**
 * Hook placeholder para People
 * 
 * La tabla 'people' aún no existe en la base de datos.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Person, CreatePersonInput, UpdatePersonInput, PeopleFilters } from '@/types/Person.types';

/**
 * Hook placeholder - retorna lista vacía hasta que se cree la tabla
 */
export const usePeople = (filters?: PeopleFilters) => {
  return useQuery({
    queryKey: ['people', filters],
    queryFn: async () => {
      console.log('Tabla people no implementada aún');
      return [] as Person[];
    },
  });
};

/**
 * Hook placeholder para obtener una persona
 */
export const usePerson = (id: string) => {
  return useQuery({
    queryKey: ['person', id],
    queryFn: async () => {
      return null as Person | null;
    },
    enabled: !!id,
  });
};

/**
 * Hook placeholder para crear persona
 */
export const useCreatePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePersonInput) => {
      console.warn('Tabla people no implementada');
      throw new Error('No implementado');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
};

/**
 * Hook placeholder para actualizar persona
 */
export const useUpdatePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdatePersonInput }) => {
      console.warn('Tabla people no implementada');
      throw new Error('No implementado');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
};

/**
 * Hook placeholder para eliminar persona
 */
export const useDeletePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      console.warn('Tabla people no implementada');
      throw new Error('No implementado');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
};
