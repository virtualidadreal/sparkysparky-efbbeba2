/**
 * Tipos TypeScript para el módulo de Projects
 * Alineados con la tabla projects en Supabase
 */

/**
 * Interfaz principal de Project - alineada con DB
 * La tabla tiene: id, user_id, title, description, status, progress, due_date, tags, keywords, created_at, updated_at
 */
export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string | null;
  progress: number | null;
  due_date: string | null;
  tags: string[];
  keywords: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Input para crear un nuevo proyecto
 */
export interface CreateProjectInput {
  title: string;
  description?: string;
  status?: string;
  due_date?: string;
  tags?: string[];
  keywords?: string[];
}

/**
 * Input para actualizar un proyecto
 */
export interface UpdateProjectInput {
  title?: string;
  description?: string;
  status?: string;
  progress?: number;
  due_date?: string;
  tags?: string[];
  keywords?: string[];
}

/**
 * Filtros para listar proyectos
 */
export interface ProjectsFilters {
  status?: string;
  search?: string;
}
