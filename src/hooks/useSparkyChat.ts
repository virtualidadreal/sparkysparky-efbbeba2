import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sparkyChatService } from '@/services/sparkyChatService';
import toast from 'react-hot-toast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  brain?: string;
  brainName?: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface DbMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  brain: string | null;
  created_at: string;
}

const brainNames: Record<string, string> = {
  'sparky_brain_organizer': 'Organizador',
  'sparky_brain_mentor': 'Mentor',
  'sparky_brain_creative': 'Creativo',
  'sparky_brain_business': 'Empresarial',
  'sparky_brain_casual': 'Charleta',
  'organizer': 'Organizador',
  'mentor': 'Mentor',
  'creative': 'Creativo',
  'business': 'Empresarial',
  'casual': 'Charleta',
};

export const useSparkyChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null);
  const queryClient = useQueryClient();

  // Fetch persistent messages from database
  const { data: dbMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['sparky-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sparky_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(500);

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }

      return (data || []) as DbMessage[];
    },
    staleTime: 1000,
  });

  // Convert DB messages to ChatMessage format
  const persistedMessages = useMemo<ChatMessage[]>(() => 
    (dbMessages || []).map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      brain: msg.brain || undefined,
      brainName: msg.brain ? brainNames[msg.brain] : undefined,
      timestamp: new Date(msg.created_at),
    })),
    [dbMessages]
  );

  // Combine persisted messages with streaming message
  const messages = useMemo(() => 
    streamingMessage 
      ? [...persistedMessages, streamingMessage]
      : persistedMessages,
    [persistedMessages, streamingMessage]
  );

  const sendMessage = useCallback(async (userMessage: string) => {
    // Use the singleton service - it handles its own locking
    setIsLoading(true);
    
    // Refresh messages to show user message after insert
    const refreshMessages = () => {
      queryClient.invalidateQueries({ queryKey: ['sparky-messages'] });
    };

    const success = await sparkyChatService.sendMessage(userMessage, {
      onStreamStart: (brain, brainName) => {
        refreshMessages(); // Show user message
        setStreamingMessage({
          id: `streaming-${Date.now()}`,
          role: 'assistant',
          content: '',
          brain,
          brainName: brainName || (brain ? brainNames[brain] : undefined),
          timestamp: new Date(),
          isStreaming: true,
        });
      },
      onStreamChunk: (content) => {
        setStreamingMessage(prev => prev ? { ...prev, content } : null);
      },
      onStreamEnd: () => {
        setStreamingMessage(null);
        refreshMessages();
      },
      onError: (error) => {
        toast.error(error);
        setStreamingMessage(null);
      },
    });

    if (!success) {
      // Message was blocked or failed before streaming started
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }, [queryClient]);

  const clearChat = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('sparky_messages')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setStreamingMessage(null);
      queryClient.invalidateQueries({ queryKey: ['sparky-messages'] });
      toast.success('Conversación limpiada');
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Error al limpiar la conversación');
    }
  }, [queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sparkyChatService.abort();
    };
  }, []);

  return {
    messages,
    isLoading: isLoading || isLoadingMessages,
    sendMessage,
    clearChat,
  };
};
