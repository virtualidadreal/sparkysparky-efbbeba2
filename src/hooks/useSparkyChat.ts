import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const messageIdCounter = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isSendingRef = useRef(false); // Prevent double sends

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
  });

  // Memoize: Convert DB messages to ChatMessage format
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

  // Memoize: Combine persisted messages with streaming message
  const messages = useMemo(() => 
    streamingMessage 
      ? [...persistedMessages, streamingMessage]
      : persistedMessages,
    [persistedMessages, streamingMessage]
  );

  const generateId = () => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  };

  const saveMessage = async (msg: Omit<ChatMessage, 'id' | 'timestamp' | 'isStreaming'> & { id?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('sparky_messages')
      .insert({
        user_id: user.id,
        role: msg.role,
        content: msg.content,
        brain: msg.brain || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return null;
    }

    return data;
  };

  const sendMessage = useCallback(async (userMessage: string) => {
    // Use ref to prevent double sends (state updates are async)
    if (!userMessage.trim() || isSendingRef.current) return;
    
    isSendingRef.current = true;

    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);

    try {
      // Save user message to DB first
      await saveMessage({
        role: 'user',
        content: userMessage.trim(),
      });

      // Refresh to show user message
      await queryClient.invalidateQueries({ queryKey: ['sparky-messages'] });

      // Fetch fresh messages for history
      const { data: freshMessages } = await supabase
        .from('sparky_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(500);

      const historyMessages = (freshMessages || []).slice(-20).map((m: DbMessage) => ({
        role: m.role,
        content: m.content,
      }));

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      // Call edge function with streaming
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sparky-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message: userMessage.trim(),
            conversationHistory: historyMessages,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al procesar mensaje');
      }

      // Get brain info from headers
      const brain = response.headers.get('X-Sparky-Brain') || undefined;
      const brainName = response.headers.get('X-Sparky-Brain-Name') || undefined;

      // Initialize streaming message
      const streamingId = generateId();
      setStreamingMessage({
        id: streamingId,
        role: 'assistant',
        content: '',
        brain,
        brainName: brainName || (brain ? brainNames[brain] : undefined),
        timestamp: new Date(),
        isStreaming: true,
      });

      // Process SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          // Handle CRLF
          if (line.endsWith('\r')) line = line.slice(0, -1);
          
          // Skip empty lines and SSE comments
          if (!line.trim() || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              setStreamingMessage(prev => prev ? {
                ...prev,
                content: fullContent,
              } : null);
            }
          } catch {
            // Incomplete JSON - put line back and wait for more data
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Save assistant message to DB
      if (fullContent) {
        await saveMessage({
          role: 'assistant',
          content: fullContent,
          brain,
        });
      }

      // Clear streaming message and refresh
      setStreamingMessage(null);
      queryClient.invalidateQueries({ queryKey: ['sparky-messages'] });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
        isSendingRef.current = false;
        return;
      }
      
      console.error('Sparky chat error:', error);
      toast.error(error.message || 'Error al comunicarse con Sparky');
      setStreamingMessage(null);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    isLoading: isLoading || isLoadingMessages,
    sendMessage,
    clearChat,
  };
};
