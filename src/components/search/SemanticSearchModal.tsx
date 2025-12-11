import { Fragment, useState, useCallback, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  LightBulbIcon,
  CheckCircleIcon,
  FolderIcon,
  UserIcon,
  BookOpenIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useSemanticSearch, type SemanticSearchResult, type SearchResultType } from '@/hooks/useSemanticSearch';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface SemanticSearchModalProps {
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

export const SemanticSearchModal = ({ isOpen, onClose }: SemanticSearchModalProps) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { results, isSearching, search, clearResults } = useSemanticSearch();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      clearResults();
    }
  }, [isOpen, clearResults]);

  const handleSearch = useCallback(async () => {
    if (query.length >= 2) {
      await search(query);
    }
  }, [query, search]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  const handleSelect = useCallback((result: SemanticSearchResult) => {
    onClose();
    navigate(typeRoutes[result.type]);
  }, [navigate, onClose]);

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
          <div className="flex min-h-full items-start justify-center p-4 pt-[10vh]">
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
                {/* Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                  <SparklesIcon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Búsqueda Semántica con IA</span>
                  <span className="text-xs text-muted-foreground ml-auto">Busca por significado, no solo palabras</span>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-4 h-6 w-6 text-muted-foreground" />
                  <input
                    type="text"
                    className="h-14 w-full border-0 bg-transparent pl-12 pr-24 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 text-lg"
                    placeholder="Describe lo que buscas..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                  <div className="absolute right-4 top-3 flex items-center gap-2">
                    <button
                      onClick={handleSearch}
                      disabled={query.length < 2 || isSearching}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {isSearching ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <SparklesIcon className="h-4 w-4" />
                      )}
                      Buscar
                    </button>
                    <button
                      onClick={onClose}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Results */}
                <div className="border-t border-border">
                  {isSearching ? (
                    <div className="px-6 py-10 text-center">
                      <ArrowPathIcon className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                      <p className="text-muted-foreground">Analizando semánticamente tu consulta...</p>
                    </div>
                  ) : results.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <SparklesIcon className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        {query.length >= 2 
                          ? 'No se encontraron resultados semánticos'
                          : 'Escribe lo que buscas y presiona Buscar'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Ejemplo: "ideas sobre mejorar ventas" encontrará contenido sobre marketing, clientes, etc.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto p-2">
                      {results.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleSelect(result)}
                          className="w-full flex items-start gap-3 rounded-lg px-4 py-3 hover:bg-muted text-left transition-colors"
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
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {Math.round(result.score * 100)}%
                              </span>
                            </div>
                            {result.reason && (
                              <p className="text-sm text-primary/80 mt-0.5 flex items-center gap-1">
                                <SparklesIcon className="h-3 w-3" />
                                {result.reason}
                              </p>
                            )}
                            {result.content && (
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {result.content}
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
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <SparklesIcon className="h-3.5 w-3.5" />
                    Potenciado por IA semántica
                  </span>
                  <span>{results.length} resultados</span>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
