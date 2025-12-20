import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTasks, useTasksWithSubtasks, useCreateTask, useToggleTaskComplete, useDeleteTask, useTaskCounts } from '@/hooks/useTasks';
import { useTaskListsWithCounts, useCreateTaskList } from '@/hooks/useTaskLists';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { TaskEditPanel } from '@/components/tasks/TaskEditPanel';
import type { Task } from '@/types/Task.types';
import { format, isToday, isTomorrow, isPast, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Home,
  Users,
  Settings,
  Plus,
  Lightbulb,
  FolderOpen,
  CheckSquare,
  Brain,
  BarChart3,
  ShieldCheck,
  Mic,
  BookOpen,
  Calendar,
  CalendarDays,
  Clock,
  AlertCircle,
  List,
  Search,
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SparkyChat } from '@/components/chat/SparkyChat';
import { QuickCapturePopup } from '@/components/dashboard/QuickCapturePopup';

type DateView = 'today' | 'tomorrow' | 'upcoming' | 'overdue' | 'all' | null;

const Tasks = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();
  
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedDateView, setSelectedDateView] = useState<DateView>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  
  const newTaskInputRef = useRef<HTMLInputElement>(null);
  
  const { data: taskLists } = useTaskListsWithCounts();
  const { data: taskCounts } = useTaskCounts();
  const createTask = useCreateTask();
  const toggleComplete = useToggleTaskComplete();
  const deleteTask = useDeleteTask();
  const createList = useCreateTaskList();

  const { data: tasks, isLoading } = useTasksWithSubtasks(
    searchTerm ? { search: searchTerm } : 
    selectedDateView ? { dateView: selectedDateView, ...(!showCompleted && { status: 'todo' }) } :
    selectedListId ? { list_id: selectedListId, ...(!showCompleted && { status: 'todo' }) } :
    { ...(!showCompleted && { status: 'todo' }) }
  );

  const { data: allTasks } = useTasks({});
  const completedCount = allTasks?.filter(t => t.status === 'done').length || 0;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await createTask.mutateAsync({
        title: newTaskTitle.trim(),
        list_id: selectedListId || undefined,
        due_date: selectedDateView === 'today' ? format(new Date(), 'yyyy-MM-dd') :
                  selectedDateView === 'tomorrow' ? format(addDays(new Date(), 1), 'yyyy-MM-dd') :
                  selectedDateView === 'upcoming' ? format(addDays(new Date(), 2), 'yyyy-MM-dd') :
                  undefined,
      });
      setNewTaskTitle('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      await createList.mutateAsync({ name: newListName.trim() });
      setNewListName('');
      setIsCreatingList(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const getViewTitle = () => {
    if (searchTerm) return `Resultados para "${searchTerm}"`;
    if (selectedDateView === 'today') return 'Hoy';
    if (selectedDateView === 'tomorrow') return 'Mañana';
    if (selectedDateView === 'upcoming') return 'Pasado mañana';
    if (selectedDateView === 'overdue') return 'Vencidas';
    if (selectedDateView === 'all') return 'Todas las tareas';
    if (selectedListId) {
      const list = taskLists?.find(l => l.id === selectedListId);
      return list?.name || 'Lista';
    }
    return 'Todas las tareas';
  };

  const getUserDisplayName = () => {
    if (profile?.display_name) return profile.display_name;
    return user?.email?.split('@')[0] || 'Usuario';
  };

  const dateViews = [
    { id: 'today' as DateView, label: 'Hoy', icon: Calendar, count: taskCounts?.today || 0 },
    { id: 'tomorrow' as DateView, label: 'Mañana', icon: CalendarDays, count: taskCounts?.tomorrow || 0 },
    { id: 'upcoming' as DateView, label: 'Pasado mañana', icon: Clock, count: taskCounts?.upcoming || 0 },
    { id: 'overdue' as DateView, label: 'Vencidas', icon: AlertCircle, count: taskCounts?.overdue || 0, danger: true },
    { id: 'all' as DateView, label: 'Todas', icon: List, count: taskCounts?.all || 0 },
  ];

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
    { to: '/projects', icon: FolderOpen, label: 'Proyectos' },
    { to: '/tasks', icon: CheckSquare, label: 'Tareas' },
    { to: '/people', icon: Users, label: 'Personas' },
    { to: '/diary', icon: BookOpen, label: 'Diario' },
    { to: '/memory', icon: Brain, label: 'Memoria' },
    { to: '/estadisticas', icon: BarChart3, label: 'Estadísticas' },
    { to: '/settings', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="min-h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-3 max-w-[1800px] mx-auto min-h-[calc(100vh-24px)]">
        
        {/* Left Sidebar - Navigation (same as Dashboard) */}
        <div className="hidden lg:flex flex-col">
          <div className="bg-card rounded-[24px] p-4 shadow-sm flex flex-col flex-1">
            <nav className="space-y-0.5 flex-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              {isAdmin && (
                <>
                  <div className="border-t border-border my-3" />
                  <Link
                    to="/admin"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      location.pathname === '/admin'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Admin
                  </Link>
                </>
              )}
            </nav>

            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <QuickCapturePopup
                trigger={
                  <button className="w-full flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-xl text-muted-foreground text-sm hover:bg-muted transition-colors">
                    <Plus className="h-4 w-4" />
                    Captura rápida
                  </button>
                }
              />

              <SparkyChat
                trigger={
                  <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors">
                    <Mic className="h-4 w-4" />
                    Hablar con Sparky
                  </button>
                }
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="bg-card rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">{getViewTitle()}</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDragMode(!dragMode)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                    dragMode ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  <GripVertical className="h-4 w-4" />
                  Reordenar
                </button>
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                    showCompleted ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  {showCompleted ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {completedCount} completadas
                </button>
              </div>
            </div>
          </div>

          {/* Task List Card */}
          <div className="bg-card rounded-[24px] shadow-sm flex-1 flex flex-col overflow-hidden">
            {/* New Task Input */}
            <div className="px-6 py-4 border-b border-border">
              <form onSubmit={handleCreateTask} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                <input
                  ref={newTaskInputRef}
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Añadir tarea..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {newTaskTitle && (
                  <button
                    type="submit"
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Añadir
                  </button>
                )}
              </form>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : tasks && tasks.length > 0 ? (
                <div className="divide-y divide-border">
                  {tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => toggleComplete.mutate(task)}
                      onClick={() => setSelectedTask(task)}
                      dragMode={dragMode}
                      level={0}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <CheckSquare className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No hay tareas</p>
                  <p className="text-sm">Añade una tarea para empezar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Task Filters */}
        <div className="bg-card rounded-[24px] p-5 shadow-sm flex flex-col">
          {/* User Profile */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {getUserDisplayName().charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{getUserDisplayName()}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value) {
                    setSelectedListId(null);
                    setSelectedDateView(null);
                  }
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Date Views */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-3">
              VISTAS POR FECHA
            </h3>
            <nav className="space-y-1">
              {dateViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => {
                    setSelectedDateView(view.id);
                    setSelectedListId(null);
                    setSearchTerm('');
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                    selectedDateView === view.id && !selectedListId && !searchTerm
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-muted/50',
                    view.danger && view.count > 0 && 'text-destructive'
                  )}
                >
                  <view.icon className={cn('h-4 w-4', view.danger && view.count > 0 && 'text-destructive')} />
                  <span className="flex-1 text-left">{view.label}</span>
                  {view.count > 0 && (
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full',
                      view.danger ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                    )}>
                      {view.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-6" />

          {/* Lists */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wider">
                MIS LISTAS
              </h3>
              <button
                onClick={() => setIsCreatingList(true)}
                className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {isCreatingList && (
              <form onSubmit={handleCreateList} className="mb-3">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Nombre de la lista..."
                  autoFocus
                  onBlur={() => {
                    if (!newListName.trim()) {
                      setIsCreatingList(false);
                    }
                  }}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </form>
            )}

            <nav className="space-y-1">
              {taskLists?.map((list) => (
                <button
                  key={list.id}
                  onClick={() => {
                    setSelectedListId(list.id);
                    setSelectedDateView(null);
                    setSearchTerm('');
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors group',
                    selectedListId === list.id && !selectedDateView && !searchTerm
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-muted/50'
                  )}
                >
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: list.color }}
                  />
                  <span className="flex-1 text-left truncate">{list.name}</span>
                  {(list.task_count || 0) > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {list.task_count}
                    </span>
                  )}
                </button>
              ))}

              {(!taskLists || taskLists.length === 0) && !isCreatingList && (
                <p className="text-sm text-muted-foreground">
                  No hay listas creadas
                </p>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Task Edit Panel */}
      {selectedTask && (
        <TaskEditPanel
          task={selectedTask}
          taskLists={taskLists || []}
          onClose={() => setSelectedTask(null)}
          onDelete={() => {
            deleteTask.mutate(selectedTask.id);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

interface TaskRowProps {
  task: Task;
  onToggle: () => void;
  onClick: () => void;
  dragMode: boolean;
  level: number;
}

const TaskRow = ({ task, onToggle, onClick, dragMode, level }: TaskRowProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const toggleComplete = useToggleTaskComplete();

  const getDateLabel = () => {
    if (!task.due_date) return null;
    const date = new Date(task.due_date);
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    if (isPast(date)) return format(date, 'd MMM', { locale: es });
    return format(date, 'd MMM', { locale: es });
  };

  const dateLabel = getDateLabel();
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done';

  return (
    <>
      <div
        className={cn(
          'group flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors cursor-pointer',
          task.status === 'done' && 'opacity-60'
        )}
        style={{ paddingLeft: `${24 + level * 24}px` }}
      >
        {dragMode && (
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        )}
        
        {hasSubtasks && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-muted rounded"
          >
            <ChevronDown className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              !isExpanded && '-rotate-90'
            )} />
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
            task.status === 'done'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-muted-foreground/30 hover:border-primary'
          )}
        >
          {task.status === 'done' && (
            <CheckSquare className="h-3 w-3" />
          )}
        </button>

        <div className="flex-1 min-w-0" onClick={onClick}>
          <p className={cn(
            'text-sm text-foreground truncate',
            task.status === 'done' && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </p>
        </div>

        {dateLabel && (
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            isOverdue 
              ? 'bg-destructive/10 text-destructive' 
              : 'bg-muted text-muted-foreground'
          )}>
            {dateLabel}
          </span>
        )}

        {hasSubtasks && (
          <span className="text-xs text-muted-foreground">
            {task.subtasks?.filter(s => s.status === 'done').length}/{task.subtasks?.length}
          </span>
        )}
      </div>

      {/* Subtasks */}
      {hasSubtasks && isExpanded && (
        <>
          {task.subtasks?.map((subtask) => (
            <TaskRow
              key={subtask.id}
              task={subtask}
              onToggle={() => toggleComplete.mutate(subtask)}
              onClick={onClick}
              dragMode={dragMode}
              level={level + 1}
            />
          ))}
        </>
      )}
    </>
  );
};

export default Tasks;
