/**
 * Tipos TypeScript para el módulo de Ideas
 */

/**
 * Interfaz principal de Idea
 */
export interface Idea {
  id: string;
  user_id: string;
  title: string | null;
  original_content: string;
  improved_content: string | null;
  summary: string | null;
  audio_url: string | null;
  transcription: string | null;
  category: string | null;
  tags: string[];
  suggested_improvements: Array<{
    version: number;
    content: string;
    reasoning?: string;
  }>;
  next_steps: Array<{
    step: string;
    priority?: 'low' | 'medium' | 'high';
  }>;
  status: 'active' | 'archived' | 'converted';
  related_people: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  detected_emotions: string[];
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

/**
 * Input para crear una nueva idea
 */
export interface CreateIdeaInput {
  original_content: string;
  audio_url?: string;
  transcription?: string;
  title?: string;
}

/**
 * Input para actualizar una idea
 */
export interface UpdateIdeaInput {
  title?: string;
  original_content?: string;
  improved_content?: string;
  summary?: string;
  category?: string;
  tags?: string[];
  status?: 'active' | 'archived' | 'converted';
  sentiment?: 'positive' | 'neutral' | 'negative' | null;
}

/**
 * Filtros para listar ideas
 */
export interface IdeasFilters {
  status?: 'active' | 'archived' | 'converted';
  category?: string;
  tags?: string[];
  search?: string;
}
