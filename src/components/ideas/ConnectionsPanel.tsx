import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SparklesIcon,
  ArrowPathIcon,
  LinkIcon,
  LightBulbIcon,
  CheckCircleIcon,
  FolderIcon,
  UserIcon,
  BookOpenIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useIntelligentConnections, type SearchResultType, type Connection } from '@/hooks/useSemanticSearch';

interface ConnectionsPanelProps {
  itemId: string;
  itemType: SearchResultType;
  className?: string;
}

const typeIcons: Record<SearchResultType, React.ReactNode> = {
  idea: <LightBulbIcon className="h-4 w-4 text-warning" />,
  task: <CheckCircleIcon className="h-4 w-4 text-success" />,
  project: <FolderIcon className="h-4 w-4 text-primary" />,
  person: <UserIcon className="h-4 w-4 text-secondary" />,
  diary: <BookOpenIcon className="h-4 w-4 text-muted-foreground" />,
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

const relationshipLabels: Record<string, string> = {
  complementa: 'Complementa',
  depende_de: 'Depende de',
  relacionado_con: 'Relacionado con',
  persona_involucrada: 'Persona involucrada',
  proyecto_asociado: 'Proyecto asociado',
  referencia: 'Hace referencia a',
};

export const ConnectionsPanel = ({ itemId, itemType, className = '' }: ConnectionsPanelProps) => {
  const navigate = useNavigate();
  const { connections, isLoading, findConnections } = useIntelligentConnections();

  useEffect(() => {
    if (itemId && itemType) {
      findConnections(itemId, itemType);
    }
  }, [itemId, itemType, findConnections]);

  const handleConnectionClick = (connection: Connection) => {
    navigate(typeRoutes[connection.targetType]);
  };

  if (isLoading) {
    return (
      <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <LinkIcon className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">Conexiones Inteligentes</h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Analizando conexiones...</span>
        </div>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <LinkIcon className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">Conexiones Inteligentes</h3>
        </div>
        <div className="text-center py-4">
          <SparklesIcon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No se encontraron conexiones</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <LinkIcon className="h-5 w-5 text-primary" />
        <h3 className="font-medium text-foreground">Conexiones Inteligentes</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {connections.length} encontradas
        </span>
      </div>

      <div className="space-y-2">
        {connections.map((connection, index) => (
          <button
            key={`${connection.targetType}-${connection.targetId}-${index}`}
            onClick={() => handleConnectionClick(connection)}
            className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left group"
          >
            <div className="flex-shrink-0 mt-0.5">
              {typeIcons[connection.targetType]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground text-sm truncate">
                  {connection.targetTitle}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {typeLabels[connection.targetType]}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-primary">
                  {relationshipLabels[connection.relationship] || connection.relationship}
                </span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${connection.strength * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(connection.strength * 100)}%
                </span>
              </div>
              {connection.reasoning && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  <SparklesIcon className="h-3 w-3 inline mr-1" />
                  {connection.reasoning}
                </p>
              )}
            </div>
            <ArrowRightIcon className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
};
