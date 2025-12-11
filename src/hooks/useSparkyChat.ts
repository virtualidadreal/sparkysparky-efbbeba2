import { useState, useCallback, useRef, useEffect } from 'react';
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
};

export const useSparkyChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const queryClient = useQueryClient();
  const messageIdCounter = useRef(0);

  // Fetch persistent messages from database
  const { data: dbMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['sparky-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sparky_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(500); // Limit to last 500 messages for performance

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }

      return (data || []) as DbMessage[];
    },
  });

  // Convert DB messages to ChatMessage format
  const messages: ChatMessage[] = (dbMessages || []).map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    brain: msg.brain || undefined,
    brainName: msg.brain ? brainNames[msg.brain] : undefined,
    timestamp: new Date(msg.created_at),
  }));

  // Combine persisted messages with any local pending messages
  const allMessages = [...messages, ...localMessages];

  const generateId = () => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  };

  const saveMessage = async (msg: ChatMessage) => {
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
    if (!userMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date(),
    };

    // Add to local messages immediately for responsiveness
    setLocalMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Save user message to DB
      await saveMessage(userMsg);

      // Build conversation history from persisted messages (last 20 for context)
      const historyMessages = messages.slice(-20).map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Add current message to history
      historyMessages.push({ role: 'user', content: userMessage.trim() });

      const { data, error } = await supabase.functions.invoke('sparky-chat', {
        body: { 
          message: userMessage.trim(),
          conversationHistory: historyMessages
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Error al procesar mensaje');
      }

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.response,
        brain: data.brain,
        brainName: data.brainName,
        timestamp: new Date(),
      };

      // Save assistant message to DB
      await saveMessage(assistantMsg);

      // Clear local messages and refetch from DB
      setLocalMessages([]);
      queryClient.invalidateQueries({ queryKey: ['sparky-messages'] });
    } catch (error: any) {
      console.error('Sparky chat error:', error);
      toast.error(error.message || 'Error al comunicarse con Sparky');
      
      // Add error message (not saved to DB)
      setLocalMessages(prev => [...prev.filter(m => m.id !== userMsg.id), {
        id: generateId(),
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, queryClient]);

  const clearChat = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('sparky_messages')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setLocalMessages([]);
      queryClient.invalidateQueries({ queryKey: ['sparky-messages'] });
      toast.success('Conversación limpiada');
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Error al limpiar la conversación');
    }
  }, [queryClient]);

  return {
    messages: allMessages,
    isLoading: isLoading || isLoadingMessages,
    sendMessage,
    clearChat,
  };
};
