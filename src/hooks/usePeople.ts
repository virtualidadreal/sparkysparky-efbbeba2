/**
 * Hook placeholder para People
 * 
 * La tabla 'people' aún no existe en la base de datos.
 * Este archivo se actualizará cuando se cree la tabla.
 */

import { useQuery } from '@tanstack/react-query';

export interface Person {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string | null;
  email: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface PeopleFilters {
  category?: string;
  search?: string;
}

/**
 * Hook placeholder - retorna lista vacía hasta que se cree la tabla
 */
export const usePeople = (filters?: PeopleFilters) => {
  return useQuery({
    queryKey: ['people', filters],
    queryFn: async () => {
      // Tabla 'people' no existe aún
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

// Placeholders para mutaciones
export const useCreatePerson = () => ({
  mutateAsync: async () => { throw new Error('No implementado'); },
  isPending: false,
});

export const useUpdatePerson = () => ({
  mutateAsync: async () => { throw new Error('No implementado'); },
  isPending: false,
});

export const useDeletePerson = () => ({
  mutateAsync: async () => { throw new Error('No implementado'); },
  isPending: false,
});
