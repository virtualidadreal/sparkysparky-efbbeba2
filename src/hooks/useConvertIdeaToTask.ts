import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Idea } from '@/types/Idea.types';
import type { CreateTaskInput } from '@/types/Task.types';
import toast from 'react-hot-toast';

interface ConvertIdeaToTaskInput {
  idea: Idea;
  priority?: string;
  dueDate?: string;
}

/**
 * Hook para convertir una idea en tarea
 * Crea una tarea con el título y descripción de la idea, vinculada al mismo proyecto
 */
export const useConvertIdeaToTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ idea, priority = 'medium', dueDate }: ConvertIdeaToTaskInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Construir descripción con contexto de la idea
      const descriptionParts = [];
      if (idea.summary) {
        descriptionParts.push(`Resumen: ${idea.summary}`);
      }
      if (idea.original_content && idea.original_content !== idea.title) {
        descriptionParts.push(`Contenido original: ${idea.original_content}`);
      }
      if (idea.next_steps && idea.next_steps.length > 0) {
        descriptionParts.push(`\nPróximos pasos:\n${idea.next_steps.map((s, i) => `${i + 1}. ${s.step}`).join('\n')}`);
      }

      const taskData: CreateTaskInput = {
        title: idea.title || 'Tarea desde idea',
        description: descriptionParts.join('\n\n') || idea.description || undefined,
        priority,
        status: 'todo',
        due_date: dueDate,
        project_id: idea.project_id || undefined,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: user.id,
            ...taskData,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Opcionalmente actualizar la idea para marcarla como convertida
      await supabase
        .from('ideas')
        .update({ status: 'converted' })
        .eq('id', idea.id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast.success('Idea convertida a tarea exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error al convertir idea a tarea:', error);
      toast.error('Error al convertir la idea');
    },
  });
};
