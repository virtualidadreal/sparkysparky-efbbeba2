import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface SystemPrompt {
  id: string;
  key: string;
  name: string;
  description: string | null;
  prompt: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook para verificar si el usuario actual es admin
 */
export const useIsAdmin = () => {
  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return false;

      const { data, error } = await supabase
        .from('admin_emails')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return !!data;
    },
  });
};

/**
 * Hook para obtener los prompts del sistema
 */
export const useSystemPrompts = () => {
  return useQuery({
    queryKey: ['systemPrompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_prompts')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as SystemPrompt[];
    },
  });
};

/**
 * Hook para actualizar un prompt del sistema
 */
export const useUpdateSystemPrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, prompt }: { id: string; prompt: string }) => {
      const { data, error } = await supabase
        .from('system_prompts')
        .update({ prompt })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemPrompts'] });
      toast.success('Prompt actualizado correctamente');
    },
    onError: (error: Error) => {
      console.error('Error updating prompt:', error);
      toast.error('Error al actualizar el prompt');
    },
  });
};
