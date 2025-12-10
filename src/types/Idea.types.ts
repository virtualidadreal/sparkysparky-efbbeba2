/**
 * Tipos TypeScript para el módulo de Ideas
 * Alineados con la tabla ideas en Supabase
 */

import type { Json } from '@/integrations/supabase/types';

/**
 * Interfaz para sugerencias de mejora
 */
export interface SuggestedImprovement {
  version: number;
  content: string;
  reasoning?: string;
}

/**
 * Interfaz para próximos pasos
 */
export interface NextStep {
  step: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Status posibles de una idea
 */
export type IdeaStatus = 'draft' | 'active' | 'archived' | 'converted';

/**
 * Sentimiento detectado
 */
export type IdeaSentiment = 'positive' | 'neutral' | 'negative';

/**
 * Interfaz principal de Idea - alineada con DB
 */
export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  original_content: string | null;
  improved_content: string | null;
  summary: string | null;
  audio_url: string | null;
  transcription: string | null;
  category: string | null;
  priority: string | null;
  status: string | null;
  tags: string[];
  suggested_improvements: SuggestedImprovement[];
  next_steps: NextStep[];
  related_people: string[];
  sentiment: IdeaSentiment | null;
  detected_emotions: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Helper para parsear Json a tipos específicos
 */
export function parseIdea(data: Record<string, unknown>): Idea {
  return {
    ...data,
    tags: (data.tags as string[]) || [],
    suggested_improvements: (data.suggested_improvements as SuggestedImprovement[]) || [],
    next_steps: (data.next_steps as NextStep[]) || [],
    related_people: (data.related_people as string[]) || [],
    detected_emotions: (data.detected_emotions as string[]) || [],
    metadata: (data.metadata as Record<string, unknown>) || {},
  } as Idea;
}

/**
 * Input para crear una nueva idea
 */
export interface CreateIdeaInput {
  title?: string;
  description?: string;
  original_content?: string;
  audio_url?: string;
  transcription?: string;
  category?: string;
  priority?: string;
}

/**
 * Input para actualizar una idea
 */
export interface UpdateIdeaInput {
  title?: string;
  description?: string;
  original_content?: string;
  improved_content?: string;
  summary?: string;
  category?: string;
  priority?: string;
  tags?: string[];
  status?: IdeaStatus;
  sentiment?: IdeaSentiment | null;
}

/**
 * Filtros para listar ideas
 */
export interface IdeasFilters {
  status?: string;
  category?: string;
  tags?: string[];
  search?: string;
}
