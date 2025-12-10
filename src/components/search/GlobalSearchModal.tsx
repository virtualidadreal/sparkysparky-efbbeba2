import { Fragment, useState, useCallback, useEffect } from 'react';
import { Dialog, Transition, Combobox } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  LightBulbIcon,
  CheckCircleIcon,
  FolderIcon,
  UserIcon,
  BookOpenIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useGlobalSearch, type SearchResult, type SearchResultType } from '@/hooks/useGlobalSearch';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeIcons: Record<SearchResultType, React.ReactNode> = {
  idea: <LightBulbIcon className="h-5 w-5 text-warning" />,
  task: <CheckCircleIcon className="h-5 w-5 text-success" />,
  project: <FolderIcon className="h-5 w-5 text-primary" />,
  person: <UserIcon className="h-5 w-5 text-secondary" />,
  diary: <BookOpenIcon className="h-5 w-5 text-muted-foreground" />,
};

const typeLabels: Record<SearchResultType, string> = {
  idea: 'Idea',
  task: 'Tarea',
  project: 'Proyecto',
  person: 'Persona',
  diary: 'Diario',
};

const typeRoutes: Record<SearchResultType, string> = {
  idea: '/ideas',
  task: '/tasks',
  project: '/projects',
  person: '/people',
  diary: '/diary',
};

/**
 * Modal de búsqueda global con navegación por teclado
 */
export const GlobalSearchModal = ({ isOpen, onClose }: GlobalSearchModalProps) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { results } = useGlobalSearch(query);

  // Reset query on close
  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  const handleSelect = useCallback(
    (result: SearchResult | null) => {
      if (!result) return;
      onClose();
      navigate(typeRoutes[result.type]);
    },
    [navigate, onClose]
  );

  // Keyboard shortcut to open (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // This would need to be triggered from parent
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-[15vh]">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-card border border-border shadow-2xl transition-all">
                <Combobox onChange={handleSelect}>
                  {/* Search Input */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-4 h-6 w-6 text-muted-foreground" />
                    <Combobox.Input
                      className="h-14 w-full border-0 bg-transparent pl-12 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 text-lg"
                      placeholder="Buscar ideas, tareas, proyectos, personas..."
                      displayValue={() => query}
                      onChange={(e) => setQuery(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={onClose}
                      className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Results */}
                  {query.length >= 2 && (
                    <div className="border-t border-border">
                      {results.length === 0 ? (
                        <div className="px-6 py-10 text-center">
                          <p className="text-muted-foreground">
                            No se encontraron resultados para "{query}"
                          </p>
                        </div>
                      ) : (
                        <Combobox.Options
                          static
                          className="max-h-[400px] scroll-py-2 overflow-y-auto p-2"
                        >
                          {results.slice(0, 10).map((result) => (
                            <Combobox.Option
                              key={`${result.type}-${result.id}`}
                              value={result}
                              className={({ active }) =>
                                `flex cursor-pointer items-start gap-3 rounded-lg px-4 py-3 ${
                                  active ? 'bg-muted' : ''
                                }`
                              }
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                {typeIcons[result.type]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground truncate">
                                    {result.title}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {typeLabels[result.type]}
                                  </span>
                                </div>
                                {result.description && (
                                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                                    {result.description}
                                  </p>
                                )}
                                {result.tags && result.tags.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {result.tags.slice(0, 3).map((tag, i) => (
                                      <span
                                        key={i}
                                        className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(result.createdAt), {
                                  addSuffix: true,
                                  locale: es,
                                })}
                              </div>
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                    </div>
                  )}

                  {/* Footer hint */}
                  <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground flex items-center justify-between">
                    <span>
                      <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        ↑↓
                      </kbd>{' '}
                      navegar{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        ↵
                      </kbd>{' '}
                      seleccionar{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        esc
                      </kbd>{' '}
                      cerrar
                    </span>
                    <span>{results.length} resultados</span>
                  </div>
                </Combobox>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
