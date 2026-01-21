import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface SystemPrompt {
  id: string;
  key: string;
  name: string;
  description: string | null;
  prompt: string;
  is_active: boolean;
  model: string;
  temperature: number;
  max_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface AdminSetting {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string;
  value: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Modelos de IA disponibles
 */
export const AI_MODELS = [
  // Gemini models
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Rápido y económico (recomendado)' },
  { value: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', description: 'Más rápido, menos preciso' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Más potente, más lento' },
  { value: 'google/gemini-3-pro-preview', label: 'Gemini 3 Pro Preview', description: 'Próxima generación (beta)' },
  // GPT-5 models
  { value: 'openai/gpt-5', label: 'GPT-5', description: 'Muy potente pero costoso' },
  { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini', description: 'Balance potencia/costo' },
  { value: 'openai/gpt-5-nano', label: 'GPT-5 Nano', description: 'Rápido y económico' },
  // GPT-4.1 models
  { value: 'openai/gpt-4.1', label: 'GPT-4.1', description: 'Flagship GPT-4, fiable y potente' },
  { value: 'openai/gpt-4.1-mini', label: 'GPT-4.1 Mini', description: 'Versión ligera de GPT-4.1' },
  { value: 'openai/gpt-4.1-nano', label: 'GPT-4.1 Nano', description: 'Muy rápido y económico' },
  // Reasoning models
  { value: 'openai/o3', label: 'O3', description: 'Razonamiento multi-paso avanzado' },
  { value: 'openai/o4-mini', label: 'O4 Mini', description: 'Razonamiento rápido' },
];

/**
 * Categorías de configuraciones globales
 */
export const SETTINGS_CATEGORIES = {
  insights: { name: 'Sugerencias e Insights', icon: 'LightBulbIcon' },
  analysis: { name: 'Análisis', icon: 'CpuChipIcon' },
  memory: { name: 'Memoria', icon: 'CircleStackIcon' },
  notifications: { name: 'Notificaciones', icon: 'BellIcon' },
  summaries: { name: 'Resúmenes', icon: 'DocumentTextIcon' },
  ai: { name: 'IA General', icon: 'SparklesIcon' },
};

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
 * Hook para obtener las configuraciones globales
 */
export const useAdminSettings = () => {
  return useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      return data as AdminSetting[];
    },
  });
};

/**
 * Hook para actualizar un prompt del sistema
 */
export const useUpdateSystemPrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      id: string; 
      prompt?: string;
      model?: string;
      temperature?: number;
      max_tokens?: number;
    }) => {
      const { id, ...updateData } = data;
      const { data: result, error } = await supabase
        .from('system_prompts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
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
    mutationFn: async (promptData: { 
      key: string; 
      name: string; 
      description: string; 
      prompt: string; 
      category: string;
      model?: string;
      temperature?: number;
      max_tokens?: number;
    }) => {
      const { data, error } = await supabase
        .from('system_prompts')
        .insert({
          key: promptData.key,
          name: promptData.name,
          description: promptData.description,
          prompt: promptData.prompt,
          is_active: true,
          model: promptData.model || 'google/gemini-2.5-flash',
          temperature: promptData.temperature ?? 0.7,
          max_tokens: promptData.max_tokens ?? 2048,
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
 * Hook para actualizar una configuración global
 */
export const useUpdateAdminSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, value }: { id: string; value: Record<string, any> }) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ value })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      queryClient.invalidateQueries({ queryKey: ['sidebarVisibility'] });
      toast.success('Configuración actualizada');
    },
    onError: (error: Error) => {
      console.error('Error updating setting:', error);
      toast.error('Error al actualizar la configuración');
    },
  });
};

/**
 * Categorías de prompts predefinidas
 */
export const PROMPT_CATEGORIES = {
  sparky: {
    name: 'Cerebros de Sparky',
    icon: 'SparklesIcon',
    description: 'Personalidades del asistente de chat',
    prompts: [
      { key: 'sparky_brain_organizer', name: 'Cerebro Organizador', description: 'Productividad, tareas y gestión del tiempo' },
      { key: 'sparky_brain_mentor', name: 'Cerebro Mentor', description: 'Guía personal, reflexión y desarrollo' },
      { key: 'sparky_brain_creative', name: 'Cerebro Creativo', description: 'Brainstorming, innovación y exploración' },
      { key: 'sparky_brain_business', name: 'Cerebro Empresarial', description: 'Estrategia de negocio y emprendimiento' },
      { key: 'sparky_brain_selector', name: 'Selector de Cerebro', description: 'Clasifica qué cerebro usar según el mensaje' },
    ],
  },
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
