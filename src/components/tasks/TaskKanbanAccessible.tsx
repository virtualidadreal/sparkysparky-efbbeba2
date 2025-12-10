import { TaskKanban } from './TaskKanban';
import type { TasksFilters } from '@/types/Task.types';

/**
 * Props del componente TaskKanbanAccessible
 */
interface TaskKanbanAccessibleProps {
  filters?: TasksFilters;
  onCreateTask?: (status: 'todo' | 'doing' | 'done') => void;
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

/**
 * Wrapper del TaskKanban con instrucciones de accesibilidad
 * 
 * Proporciona instrucciones visuales ocultas para navegación por teclado
 * del drag & drop para usuarios con lectores de pantalla.
 */
export const TaskKanbanAccessible = (props: TaskKanbanAccessibleProps) => {
  return (
    <div className="space-y-4">
      {/* Instrucciones de accesibilidad */}
      <div className="sr-only" role="region" aria-label="Instrucciones de accesibilidad">
        <p>
          Para mover tareas entre columnas con el teclado: 
          Selecciona una tarea con Tab, usa las teclas de flecha arriba/abajo para navegar 
          entre tareas, y usa la tecla Enter para editar una tarea.
        </p>
        <p>
          Alternativa: Haz clic en el botón "Editar" de cada tarea para cambiar su estado 
          manualmente en el formulario de edición.
        </p>
      </div>

      {/* Kanban board */}
      <TaskKanban {...props} />
    </div>
  );
};
