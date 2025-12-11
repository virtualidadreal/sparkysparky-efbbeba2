import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type SearchResultType = 'idea' | 'task' | 'project' | 'person' | 'diary';

export interface SemanticSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  score: number;
  reason: string;
}

export interface Connection {
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: SearchResultType;
  targetTitle: string;
  relationship: string;
  strength: number;
  reasoning: string;
}

/**
 * Hook para búsqueda semántica con IA
 */
export const useSemanticSearch = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!user || !query || query.length < 2) {
      setResults([]);
      return [];
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: { query, userId: user.id, mode: 'search' },
      });

      if (error) throw error;
      
      const searchResults = data?.results || [];
      setResults(searchResults);
      return searchResults;
    } catch (error) {
      console.error('Semantic search error:', error);
      toast.error('Error en la búsqueda semántica');
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    results,
    isSearching,
    search,
    clearResults,
  };
};

/**
 * Hook para encontrar conexiones inteligentes
 */
export const useIntelligentConnections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const findConnections = useCallback(async (itemId: string, itemType: SearchResultType) => {
    if (!user) {
      setConnections([]);
      return [];
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: { 
          userId: user.id, 
          mode: 'connections',
          itemId,
          itemType,
        },
      });

      if (error) throw error;
      
      const foundConnections = data?.connections || [];
      setConnections(foundConnections);
      return foundConnections;
    } catch (error) {
      console.error('Connections error:', error);
      toast.error('Error buscando conexiones');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const clearConnections = useCallback(() => {
    setConnections([]);
  }, []);

  return {
    connections,
    isLoading,
    findConnections,
    clearConnections,
  };
};
