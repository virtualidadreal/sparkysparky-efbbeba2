import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SidebarVisibility {
  dashboard: boolean;
  ideas: boolean;
  projects: boolean;
  tasks: boolean;
  people: boolean;
  diary: boolean;
  memory: boolean;
  analytics: boolean;
  insights: boolean;
  settings: boolean;
}

const DEFAULT_VISIBILITY: SidebarVisibility = {
  dashboard: true,
  ideas: true,
  projects: true,
  tasks: true,
  people: true,
  diary: true,
  memory: true,
  analytics: true,
  insights: true,
  settings: true,
};

/**
 * Hook para obtener la visibilidad del sidebar configurada por admin
 * Este hook usa una edge function para evitar problemas de RLS
 */
export const useSidebarVisibility = () => {
  return useQuery({
    queryKey: ['sidebarVisibility'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-sidebar-visibility');
        
        if (error) {
          console.error('Error fetching sidebar visibility:', error);
          return DEFAULT_VISIBILITY;
        }
        
        return (data?.visibility || DEFAULT_VISIBILITY) as SidebarVisibility;
      } catch (error) {
        console.error('Error fetching sidebar visibility:', error);
        return DEFAULT_VISIBILITY;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};
