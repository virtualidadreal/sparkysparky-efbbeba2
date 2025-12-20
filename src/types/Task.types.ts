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
  list_id: string | null;
  parent_task_id: string | null;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Virtual field for subtasks
  subtasks?: Task[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date?: string;
  project_id?: string;
  list_id?: string;
  parent_task_id?: string;
  sort_order?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  project_id?: string;
  list_id?: string;
  parent_task_id?: string;
  sort_order?: number;
  completed_at?: string | null;
}

export interface TasksFilters {
  status?: string;
  project_id?: string;
  priority?: string;
  due_date?: string;
  search?: string;
  list_id?: string;
  parent_task_id?: string | null;
  // Date-based views
  dateView?: 'today' | 'tomorrow' | 'upcoming' | 'overdue' | 'all' | 'no-date';
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
