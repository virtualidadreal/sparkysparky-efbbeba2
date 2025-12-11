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

/**
 * Hook para crear un nuevo prompt del sistema
 */
export const useCreateSystemPrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promptData: { key: string; name: string; description: string; prompt: string; category: string }) => {
      const { data, error } = await supabase
        .from('system_prompts')
        .insert({
          key: promptData.key,
          name: promptData.name,
          description: promptData.description,
          prompt: promptData.prompt,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemPrompts'] });
      toast.success('Prompt creado correctamente');
    },
    onError: (error: Error) => {
      console.error('Error creating prompt:', error);
      toast.error('Error al crear el prompt');
    },
  });
};

/**
 * Hook para eliminar un prompt del sistema
 */
export const useDeleteSystemPrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('system_prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemPrompts'] });
      toast.success('Prompt eliminado correctamente');
    },
    onError: (error: Error) => {
      console.error('Error deleting prompt:', error);
      toast.error('Error al eliminar el prompt');
    },
  });
};

/**
 * Categorías de prompts predefinidas
 */
export const PROMPT_CATEGORIES = {
  capture: {
    name: 'Captura',
    icon: 'DocumentTextIcon',
    description: 'Procesamiento de texto y voz',
    prompts: [
      { key: 'text_classification', name: 'Clasificación de Contenido', description: 'Clasificar texto como idea, tarea, diario o persona' },
      { key: 'voice_processing', name: 'Procesamiento de Voz', description: 'Analizar transcripciones de audio' },
    ],
  },
  memory: {
    name: 'Memoria y Análisis',
    icon: 'CpuChipIcon',
    description: 'Sistema de memoria a largo plazo',
    prompts: [
      { key: 'weekly_summary', name: 'Resumen Semanal', description: 'Generar super-resúmenes semanales del usuario' },
      { key: 'pattern_detection', name: 'Detección de Patrones', description: 'Identificar patrones de comportamiento y hábitos' },
      { key: 'memory_extraction', name: 'Extracción de Memoria', description: 'Extraer hechos importantes para memoria a largo plazo' },
    ],
  },
  proactivity: {
    name: 'Proactividad',
    icon: 'SparklesIcon',
    description: 'Alertas y sugerencias inteligentes',
    prompts: [
      { key: 'morning_briefing', name: 'Briefing Matutino', description: 'Generar resumen diario personalizado con prioridades' },
      { key: 'smart_suggestions', name: 'Sugerencias Inteligentes', description: 'Proponer acciones basadas en contexto' },
      { key: 'proactive_alerts', name: 'Alertas Proactivas', description: 'Detectar riesgos y oportunidades' },
      { key: 'smart_reminders', name: 'Recordatorios Inteligentes', description: 'Sugerir recordatorios basados en patrones' },
    ],
  },
  connections: {
    name: 'Conexiones Inteligentes',
    icon: 'LinkIcon',
    description: 'Búsqueda semántica y relaciones',
    prompts: [
      { key: 'semantic_search', name: 'Búsqueda Semántica', description: 'Encontrar contenido por significado' },
      { key: 'connection_finder', name: 'Buscador de Conexiones', description: 'Vincular ideas, tareas y personas relacionadas' },
    ],
  },
  ideas: {
    name: 'Mejora de Ideas',
    icon: 'LightBulbIcon',
    description: 'Enriquecimiento de ideas',
    prompts: [
      { key: 'idea_enhancement', name: 'Mejora de Ideas', description: 'Generar variantes mejoradas de ideas' },
      { key: 'next_steps_generator', name: 'Generador de Pasos', description: 'Sugerir próximos pasos accionables' },
      { key: 'emotion_analysis', name: 'Análisis Emocional', description: 'Detectar sentimiento y emociones' },
    ],
  },
  tasks: {
    name: 'Proyectos y Tareas',
    icon: 'CheckIcon',
    description: 'Gestión de productividad',
    prompts: [
      { key: 'task_prioritization', name: 'Priorización de Tareas', description: 'Ordenar tareas por urgencia/importancia' },
      { key: 'project_matching', name: 'Asociación a Proyectos', description: 'Vincular contenido a proyectos existentes' },
      { key: 'deadline_estimation', name: 'Estimación de Plazos', description: 'Sugerir fechas límite realistas' },
    ],
  },
  people: {
    name: 'Personas',
    icon: 'UsersIcon',
    description: 'Gestión de contactos',
    prompts: [
      { key: 'contact_enrichment', name: 'Enriquecimiento de Contactos', description: 'Extraer info de personas mencionadas' },
      { key: 'relationship_insights', name: 'Insights de Relaciones', description: 'Analizar interacciones con contactos' },
    ],
  },
};
