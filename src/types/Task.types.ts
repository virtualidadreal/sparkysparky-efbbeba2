/**
 * Tipos TypeScript para el módulo de Tasks
 * Alineados con la tabla tasks en Supabase
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

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date?: string;
  project_id?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  project_id?: string;
}

export interface TasksFilters {
  status?: string;
  project_id?: string;
  priority?: string;
  due_date?: string;
  search?: string;
}
