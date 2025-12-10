import { useMemo } from 'react';
import { useTasks } from './useTasks';
import type { Task } from '@/types/Task.types';
import { isToday, isTomorrow, isThisWeek, isPast, addDays, isWithinInterval } from 'date-fns';

export interface DynamicTaskLists {
  today: Task[];
  tomorrow: Task[];
  thisWeek: Task[];
  overdue: Task[];
  upcoming: Task[];
  highPriority: Task[];
  noDueDate: Task[];
}

/**
 * Hook que organiza tareas en listas dinámicas por contexto temporal y prioridad
 */
export const useDynamicTaskLists = (): DynamicTaskLists & { isLoading: boolean } => {
  const { data: tasks, isLoading } = useTasks();

  const lists = useMemo<DynamicTaskLists>(() => {
    if (!tasks) {
      return {
        today: [],
        tomorrow: [],
        thisWeek: [],
        overdue: [],
        upcoming: [],
        highPriority: [],
        noDueDate: [],
      };
    }

    // Filtrar tareas pendientes (no completadas)
    const pendingTasks = tasks.filter((t) => t.status !== 'done');

    const today: Task[] = [];
    const tomorrow: Task[] = [];
    const thisWeek: Task[] = [];
    const overdue: Task[] = [];
    const upcoming: Task[] = [];
    const noDueDate: Task[] = [];

    const now = new Date();
    const weekEnd = addDays(now, 7);

    pendingTasks.forEach((task) => {
      if (!task.due_date) {
        noDueDate.push(task);
        return;
      }

      const dueDate = new Date(task.due_date);

      if (isPast(dueDate) && !isToday(dueDate)) {
        overdue.push(task);
      } else if (isToday(dueDate)) {
        today.push(task);
      } else if (isTomorrow(dueDate)) {
        tomorrow.push(task);
      } else if (isThisWeek(dueDate)) {
        thisWeek.push(task);
      } else if (isWithinInterval(dueDate, { start: now, end: weekEnd })) {
        thisWeek.push(task);
      } else {
        upcoming.push(task);
      }
    });

    // Alta prioridad (de las pendientes)
    const highPriority = pendingTasks.filter((t) => t.priority === 'high');

    // Ordenar por fecha y prioridad
    const sortByDueDateAndPriority = (a: Task, b: Task) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const aPriority = priorityOrder[(a.priority as keyof typeof priorityOrder) || 'medium'];
      const bPriority = priorityOrder[(b.priority as keyof typeof priorityOrder) || 'medium'];
      
      if (a.due_date && b.due_date) {
        const dateDiff = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        if (dateDiff !== 0) return dateDiff;
      }
      return aPriority - bPriority;
    };

    return {
      today: today.sort(sortByDueDateAndPriority),
      tomorrow: tomorrow.sort(sortByDueDateAndPriority),
      thisWeek: thisWeek.sort(sortByDueDateAndPriority),
      overdue: overdue.sort(sortByDueDateAndPriority),
      upcoming: upcoming.sort(sortByDueDateAndPriority),
      highPriority: highPriority.sort(sortByDueDateAndPriority),
      noDueDate: noDueDate.sort(sortByDueDateAndPriority),
    };
  }, [tasks]);

  return { ...lists, isLoading };
};
