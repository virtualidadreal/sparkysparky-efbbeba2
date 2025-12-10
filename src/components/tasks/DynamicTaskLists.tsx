import { useState } from 'react';
import {
  CalendarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  FireIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useDynamicTaskLists } from '@/hooks/useDynamicTaskLists';
import { TaskCard } from './TaskCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Task } from '@/types/Task.types';

interface DynamicTaskListsProps {
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

interface ListSection {
  key: keyof ReturnType<typeof useDynamicTaskLists>;
  label: string;
  icon: React.ReactNode;
  color: string;
  emptyMessage: string;
}

const sections: ListSection[] = [
  {
    key: 'overdue',
    label: 'Vencidas',
    icon: <ExclamationTriangleIcon className="h-5 w-5" />,
    color: 'text-destructive',
    emptyMessage: 'Sin tareas vencidas',
  },
  {
    key: 'today',
    label: 'Hoy',
    icon: <FireIcon className="h-5 w-5" />,
    color: 'text-warning',
    emptyMessage: 'Sin tareas para hoy',
  },
  {
    key: 'tomorrow',
    label: 'Mañana',
    icon: <CalendarIcon className="h-5 w-5" />,
    color: 'text-primary',
    emptyMessage: 'Sin tareas para mañana',
  },
  {
    key: 'thisWeek',
    label: 'Esta semana',
    icon: <ClockIcon className="h-5 w-5" />,
    color: 'text-secondary',
    emptyMessage: 'Sin tareas esta semana',
  },
  {
    key: 'upcoming',
    label: 'Próximas',
    icon: <ArrowRightIcon className="h-5 w-5" />,
    color: 'text-muted-foreground',
    emptyMessage: 'Sin tareas próximas',
  },
];

/**
 * Componente que muestra listas dinámicas de tareas organizadas por contexto temporal
 */
export const DynamicTaskLists = ({ onEditTask, onDeleteTask }: DynamicTaskListsProps) => {
  const lists = useDynamicTaskLists();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overdue', 'today', 'tomorrow'])
  );

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  if (lists.isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const tasks = lists[section.key] as Task[];
        const isExpanded = expandedSections.has(section.key);
        const hasItems = tasks && tasks.length > 0;

        return (
          <div key={section.key} className="space-y-2">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.key)}
              className="flex items-center gap-2 w-full text-left group"
            >
              <span className={section.color}>{section.icon}</span>
              <h3 className="font-semibold text-foreground">{section.label}</h3>
              <span
                className={`text-sm px-2 py-0.5 rounded-full ${
                  section.key === 'overdue' && hasItems
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tasks?.length || 0}
              </span>
              <span className="text-muted-foreground text-sm ml-auto group-hover:text-foreground">
                {isExpanded ? '▼' : '▶'}
              </span>
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div className="pl-7 space-y-2">
                {hasItems ? (
                  tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => onEditTask?.(task.id)}
                      onDelete={() => onDeleteTask?.(task.id)}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {section.emptyMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* High Priority Section */}
      {lists.highPriority && lists.highPriority.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-foreground">Alta prioridad</h3>
            <span className="text-sm px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
              {lists.highPriority.length}
            </span>
          </div>
          <div className="pl-7 space-y-2">
            {lists.highPriority.slice(0, 5).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => onEditTask?.(task.id)}
                onDelete={() => onDeleteTask?.(task.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
