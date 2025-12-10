/**
 * Hook placeholder para Tags
 * 
 * La tabla 'tags' aún no existe en la base de datos.
 * Este archivo se actualizará cuando se cree la tabla.
 */

import { useQuery } from '@tanstack/react-query';

export interface Tag {
  id: string;
  name: string;
  type: string;
  color: string;
}

export interface TagsFilters {
  type?: string;
  search?: string;
}

/**
 * Hook placeholder - retorna lista vacía hasta que se cree la tabla
 */
export const useTags = (filters?: TagsFilters) => {
  return useQuery({
    queryKey: ['tags', filters],
    queryFn: async () => {
      console.log('Tabla tags no implementada aún');
      return [] as Tag[];
    },
  });
};

export const useIdeaTags = (ideaId: string) => {
  return useQuery({
    queryKey: ['idea-tags', ideaId],
    queryFn: async () => [] as Tag[],
    enabled: !!ideaId,
  });
};

export const useCreateTag = () => ({
  mutateAsync: async () => { throw new Error('No implementado'); },
  isPending: false,
});

export const useUpdateTag = () => ({
  mutateAsync: async () => { throw new Error('No implementado'); },
  isPending: false,
});

export const useDeleteTag = () => ({
  mutateAsync: async () => { throw new Error('No implementado'); },
  isPending: false,
});

export const useAddTagToIdea = () => ({
  mutateAsync: async () => { throw new Error('No implementado'); },
  isPending: false,
});

export const useRemoveTagFromIdea = () => ({
  mutateAsync: async () => { throw new Error('No implementado'); },
  isPending: false,
});
