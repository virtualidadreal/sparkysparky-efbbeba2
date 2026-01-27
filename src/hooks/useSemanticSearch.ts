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
 * Hook para obtener conexiones inteligentes (desde DB, pre-calculadas)
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
      // Fetch from pre-calculated connections table
      const { data, error } = await supabase
        .from('intelligent_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('source_id', itemId)
        .eq('source_type', itemType)
        .order('strength', { ascending: false });

      if (error) throw error;
      
      const rawConnections = data || [];
      
      // Get unique idea target IDs to fetch decrypted titles and verify they exist
      const ideaTargetIds = rawConnections
        .filter((c: any) => c.target_type === 'idea')
        .map((c: any) => c.target_id);
      
      // Map to store decrypted titles for ideas
      const ideaTitlesMap = new Map<string, string>();
      
      if (ideaTargetIds.length > 0) {
        // Fetch from decrypted view to get actual titles and verify active status
        const { data: validIdeas } = await supabase
          .from('ideas_decrypted')
          .select('id, title')
          .in('id', ideaTargetIds)
          .eq('status', 'active');
        
        (validIdeas || []).forEach((i: any) => {
          ideaTitlesMap.set(i.id, i.title);
        });
      }
      
      // Filter connections: keep non-idea types, and only active ideas with valid titles
      const filteredConnections = rawConnections.filter((c: any) => {
        if (c.target_type === 'idea') {
          return ideaTitlesMap.has(c.target_id);
        }
        return true; // Keep other types (tasks, projects, people, diary)
      });
      
      const foundConnections: Connection[] = filteredConnections.map((c: any) => ({
        sourceId: c.source_id,
        sourceType: c.source_type,
        targetId: c.target_id,
        targetType: c.target_type as SearchResultType,
        // Use decrypted title for ideas, fallback to stored title for other types
        targetTitle: c.target_type === 'idea' 
          ? ideaTitlesMap.get(c.target_id) || c.target_title 
          : c.target_title,
        relationship: c.relationship,
        strength: Number(c.strength),
        reasoning: c.reasoning,
      }));
      
      setConnections(foundConnections);
      return foundConnections;
    } catch (error) {
      console.error('Connections error:', error);
      setConnections([]);
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
