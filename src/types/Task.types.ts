/**
 * Tipos TypeScript para el módulo de Tasks
 * Alineados con la tabla tasks en Supabase
 */

/**
 * Interfaz principal de Task - alineada con DB actual
 */
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  due_date: string | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Input para crear una nueva tarea
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
  project_id?: string;
}

/**
 * Input para actualizar una tarea
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  project_id?: string;
}

/**
 * Filtros para listar tareas
 */
export interface TasksFilters {
  status?: string;
  project_id?: string;
  due_date?: string;
  search?: string;
}
