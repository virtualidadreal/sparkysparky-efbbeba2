import { useState, useEffect } from 'react';
import { useUpdateTask, useCreateTask } from '@/hooks/useTasks';
import { TaskList } from '@/hooks/useTaskLists';
import type { Task } from '@/types/Task.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  X,
  Trash2,
  Calendar,
  Flag,
  List,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskEditPanelProps {
  task: Task;
  taskLists: TaskList[];
  onClose: () => void;
  onDelete: () => void;
}

export const TaskEditPanel = ({ task, taskLists, onClose, onDelete }: TaskEditPanelProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [listId, setListId] = useState(task.list_id || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const updateTask = useUpdateTask();
  const createTask = useCreateTask();

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.due_date || '');
    setPriority(task.priority || 'medium');
    setListId(task.list_id || '');
  }, [task]);

  const handleSave = () => {
    updateTask.mutate({
      id: task.id,
      updates: {
        title,
        description: description || null,
        due_date: dueDate || null,
        priority,
        list_id: listId || null,
      },
    });
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      await createTask.mutateAsync({
        title: newSubtaskTitle.trim(),
        parent_task_id: task.id,
        list_id: task.list_id || undefined,
      });
      setNewSubtaskTitle('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const priorities = [
    { value: 'low', label: 'Baja', color: 'text-muted-foreground' },
    { value: 'medium', label: 'Media', color: 'text-yellow-500' },
    { value: 'high', label: 'Alta', color: 'text-destructive' },
  ];

  const selectedList = taskLists.find(l => l.id === listId);
  const selectedPriority = priorities.find(p => p.value === priority);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-96 bg-card shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Editar tarea</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Eliminar tarea"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              className="w-full text-lg font-medium text-foreground bg-transparent border-none focus:outline-none focus:ring-0"
              placeholder="Título de la tarea"
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              placeholder="Añadir detalles..."
              rows={4}
              className="w-full text-sm text-foreground bg-muted/30 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Fecha</p>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  updateTask.mutate({
                    id: task.id,
                    updates: { due_date: e.target.value || null },
                  });
                }}
                className="w-full bg-transparent text-sm text-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Priority */}
          <div className="relative">
            <button
              onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
              className="w-full flex items-center gap-3 p-3 bg-muted/30 rounded-xl text-left"
            >
              <Flag className={cn('h-4 w-4', selectedPriority?.color)} />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Prioridad</p>
                <p className="text-sm text-foreground">{selectedPriority?.label || 'Sin prioridad'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showPriorityDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-xl shadow-lg py-1">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setPriority(p.value);
                      setShowPriorityDropdown(false);
                      updateTask.mutate({
                        id: task.id,
                        updates: { priority: p.value },
                      });
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors',
                      priority === p.value && 'bg-muted/50'
                    )}
                  >
                    <Flag className={cn('h-4 w-4', p.color)} />
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List */}
          <div className="relative">
            <button
              onClick={() => setShowListDropdown(!showListDropdown)}
              className="w-full flex items-center gap-3 p-3 bg-muted/30 rounded-xl text-left"
            >
              <List className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Lista</p>
                <p className="text-sm text-foreground">{selectedList?.name || 'Sin lista'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showListDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-xl shadow-lg py-1 max-h-48 overflow-y-auto">
                <button
                  onClick={() => {
                    setListId('');
                    setShowListDropdown(false);
                    updateTask.mutate({
                      id: task.id,
                      updates: { list_id: null },
                    });
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors',
                    !listId && 'bg-muted/50'
                  )}
                >
                  Sin lista
                </button>
                {taskLists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => {
                      setListId(list.id);
                      setShowListDropdown(false);
                      updateTask.mutate({
                        id: task.id,
                        updates: { list_id: list.id },
                      });
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors',
                      listId === list.id && 'bg-muted/50'
                    )}
                  >
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: list.color }}
                    />
                    {list.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Subtareas
            </p>

            {task.subtasks && task.subtasks.length > 0 && (
              <div className="space-y-2 mb-3">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2 text-sm">
                    <div className={cn(
                      'w-4 h-4 rounded border',
                      subtask.status === 'done' ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                    )} />
                    <span className={cn(
                      subtask.status === 'done' && 'line-through text-muted-foreground'
                    )}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Añadir subtarea..."
                className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Creada {format(new Date(task.created_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
          </p>
        </div>
      </div>
    </div>
  );
};
