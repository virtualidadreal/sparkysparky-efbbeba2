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

// Global singleton to prevent double sends across all instances
let globalSendLock = false;
let globalLastMessageId = '';

export const useSparkyChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null);
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

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
    staleTime: 1000, // Reduce refetching
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

  const sendMessage = useCallback(async (userMessage: string) => {
    const trimmedMessage = userMessage.trim();
    if (!trimmedMessage) return;
    
    // Generate unique ID for this message
    const messageId = `${trimmedMessage}-${Date.now()}`;
    
    // Check global lock - this is synchronous and immediate
    if (globalSendLock) {
      console.log('[Sparky] Send blocked: global lock active');
      return;
    }
    
    // Check if same message was just sent
    if (globalLastMessageId === messageId.substring(0, trimmedMessage.length + 5)) {
      console.log('[Sparky] Send blocked: duplicate message');
      return;
    }
    
    // Set lock immediately (synchronous)
    globalSendLock = true;
    globalLastMessageId = messageId.substring(0, trimmedMessage.length + 5);
    
    console.log('[Sparky] Starting send:', trimmedMessage);

    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);

    try {
      // Get user first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      // Save user message to DB
      const { error: insertError } = await supabase
        .from('sparky_messages')
        .insert({
          user_id: user.id,
          role: 'user',
          content: trimmedMessage,
        });

      if (insertError) {
        console.error('Error saving user message:', insertError);
        throw insertError;
      }

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
            message: trimmedMessage,
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
      setStreamingMessage({
        id: `streaming-${Date.now()}`,
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

          if (line.endsWith('\r')) line = line.slice(0, -1);
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
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Save assistant message to DB
      if (fullContent) {
        await supabase
          .from('sparky_messages')
          .insert({
            user_id: user.id,
            role: 'assistant',
            content: fullContent,
            brain: brain || null,
          });
      }

      // Clear streaming message and refresh
      setStreamingMessage(null);
      queryClient.invalidateQueries({ queryKey: ['sparky-messages'] });
      console.log('[Sparky] Send complete');

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[Sparky] Request aborted');
        return;
      }
      
      console.error('[Sparky] Error:', error);
      toast.error(error.message || 'Error al comunicarse con Sparky');
      setStreamingMessage(null);
    } finally {
      setIsLoading(false);
      // Release lock after a short delay
      setTimeout(() => {
        globalSendLock = false;
        console.log('[Sparky] Lock released');
      }, 1000);
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
      globalLastMessageId = '';
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
