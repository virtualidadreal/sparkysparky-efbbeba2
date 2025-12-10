/**
 * Tipos TypeScript para el módulo de Projects
 */

/**
 * Interfaz principal de Project
 */
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: 'active' | 'paused' | 'completed' | 'archived';
  priority: number; // 1-5
  start_date: string | null;
  target_end_date: string | null;
  progress_percentage: number; // 0-100
  tags: string[];
  metadata: {
    analysis?: {
      viability_score: number;
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
      key_success_factors: string[];
      critical_questions: Array<{ question: string; why_important: string }>;
      recommended_next_steps: string[];
      estimated_effort: string;
      estimated_timeline: string;
    };
    materials?: {
      outline: any;
      briefing: string;
      checklist: any[];
      key_questions: string[];
    };
  } | null;
  created_at: string;
  updated_at: string;
}

/**
 * Input para crear un nuevo proyecto
 */
export interface CreateProjectInput {
  name: string;
  description?: string;
  category?: string;
  priority?: number;
  start_date?: string;
  target_end_date?: string;
  tags?: string[];
}

/**
 * Input para actualizar un proyecto
 */
export interface UpdateProjectInput {
  name?: string;
  description?: string;
  category?: string;
  status?: 'active' | 'paused' | 'completed' | 'archived';
  priority?: number;
  start_date?: string;
  target_end_date?: string;
  progress_percentage?: number;
  tags?: string[];
}

/**
 * Filtros para listar proyectos
 */
export interface ProjectsFilters {
  status?: 'active' | 'paused' | 'completed' | 'archived';
  category?: string;
  tags?: string[];
  search?: string;
}
