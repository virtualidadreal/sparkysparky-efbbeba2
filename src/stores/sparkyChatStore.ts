/**
 * Sparky Chat Store - Global singleton that manages ALL chat state outside React
 * This eliminates any React StrictMode double-mounting issues
 */

import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  brain?: string;
  brainName?: string;
  timestamp: Date;
  isStreaming?: boolean;
}

type Listener = () => void;

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

class SparkyChatStore {
  private messages: ChatMessage[] = [];
  private streamingMessage: ChatMessage | null = null;
  private isLoading = false;
  private isSending = false;
  private listeners: Set<Listener> = new Set();
  private abortController: AbortController | null = null;
  private initialized = false;

  // Subscribe to changes
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  // Getters
  getMessages(): ChatMessage[] {
    return this.streamingMessage 
      ? [...this.messages, this.streamingMessage]
      : [...this.messages];
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  // Load messages from DB
  async loadMessages(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const { data, error } = await supabase
        .from('sparky_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(500);

      if (error) throw error;

      this.messages = (data || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        brain: msg.brain || undefined,
        brainName: msg.brain ? brainNames[msg.brain] : undefined,
        timestamp: new Date(msg.created_at),
      }));
      
      this.initialized = true;
      this.notify();
    } catch (error) {
      console.error('[SparkyChatStore] Error loading messages:', error);
    }
  }

  // Refresh messages from DB
  async refreshMessages(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('sparky_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(500);

      if (error) throw error;

      this.messages = (data || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        brain: msg.brain || undefined,
        brainName: msg.brain ? brainNames[msg.brain] : undefined,
        timestamp: new Date(msg.created_at),
      }));
      
      this.notify();
    } catch (error) {
      console.error('[SparkyChatStore] Error refreshing messages:', error);
    }
  }

  // Send message - THE CRITICAL FUNCTION
  async sendMessage(userMessage: string): Promise<void> {
    const trimmed = userMessage.trim();
    if (!trimmed) return;

    // CRITICAL: Check if already sending
    if (this.isSending) {
      console.log('[SparkyChatStore] BLOCKED - already sending');
      return;
    }

    // Set sending flag IMMEDIATELY
    this.isSending = true;
    this.isLoading = true;
    this.notify();

    console.log('[SparkyChatStore] Starting send:', trimmed);

    // Cancel any existing stream
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      // Save user message to DB
      const { error: insertError } = await supabase
        .from('sparky_messages')
        .insert({
          user_id: user.id,
          role: 'user',
          content: trimmed,
        });

      if (insertError) throw insertError;

      // Refresh to show user message
      await this.refreshMessages();

      // Get conversation history
      const historyMessages = this.messages.slice(-20).map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      // Call edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sparky-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message: trimmed,
            conversationHistory: historyMessages,
          }),
          signal: this.abortController.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al procesar mensaje');
      }

      // Get brain info
      const brain = response.headers.get('X-Sparky-Brain') || undefined;
      const brainName = response.headers.get('X-Sparky-Brain-Name') || undefined;

      // Create streaming message
      this.streamingMessage = {
        id: `streaming-${Date.now()}`,
        role: 'assistant',
        content: '',
        brain,
        brainName: brainName || (brain ? brainNames[brain] : undefined),
        timestamp: new Date(),
        isStreaming: true,
      };
      this.notify();

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
              if (this.streamingMessage) {
                this.streamingMessage = { ...this.streamingMessage, content: fullContent };
                this.notify();
              }
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Save assistant message
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

      // Clear streaming and refresh
      this.streamingMessage = null;
      await this.refreshMessages();
      console.log('[SparkyChatStore] Send complete');

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[SparkyChatStore] Request aborted');
      } else {
        console.error('[SparkyChatStore] Error:', error);
      }
      this.streamingMessage = null;
    } finally {
      this.isSending = false;
      this.isLoading = false;
      this.notify();
      console.log('[SparkyChatStore] Finished, isSending reset to false');
    }
  }

  // Clear chat
  async clearChat(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('sparky_messages')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      this.messages = [];
      this.streamingMessage = null;
      this.notify();
    } catch (error) {
      console.error('[SparkyChatStore] Error clearing chat:', error);
    }
  }

  // Abort current request
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

// SINGLETON - only one instance ever exists
export const sparkyChatStore = new SparkyChatStore();
