/**
 * Tipos TypeScript para el módulo de Tasks
 */

/**
 * Interfaz principal de Task
 */
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'doing' | 'done';
  priority: number; // 1-5
  urgency_score: number | null;
  due_date: string | null;
  completed_at: string | null;
  project_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Input para crear una nueva tarea
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: number;
  due_date?: string;
  project_id?: string;
  tags?: string[];
}

/**
 * Input para actualizar una tarea
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: 'todo' | 'doing' | 'done';
  priority?: number;
  due_date?: string;
  completed_at?: string;
  project_id?: string;
  tags?: string[];
}

/**
 * Filtros para listar tareas
 */
export interface TasksFilters {
  status?: 'todo' | 'doing' | 'done';
  project_id?: string;
  due_date?: string;
  tags?: string[];
  search?: string;
}
