/**
 * Sparky Chat Store - Simplified singleton
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

interface StoreState {
  messages: ChatMessage[];
  isLoading: boolean;
}

const brainNames: Record<string, string> = {
  'organizer': 'Organizador',
  'mentor': 'Mentor',
  'creative': 'Creativo',
  'business': 'Empresarial',
  'casual': 'Charleta',
};

class SparkyChatStore {
  private state: StoreState = { messages: [], isLoading: false };
  private listeners: Set<Listener> = new Set();
  private sendingMessageId: string | null = null;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): StoreState => this.state;

  private setState(partial: Partial<StoreState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(l => l());
  }

  async loadMessages(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('sparky_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(500);

      if (error) throw error;

      const messages = (data || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        brain: msg.brain || undefined,
        brainName: msg.brain ? brainNames[msg.brain] : undefined,
        timestamp: new Date(msg.created_at),
      }));

      this.setState({ messages });
    } catch (error) {
      console.error('[Store] Error loading:', error);
    }
  }

  async sendMessage(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Generate unique ID for this send attempt
    const sendId = `${Date.now()}-${Math.random()}`;
    
    // Check if already sending
    if (this.sendingMessageId) {
      console.log('[Store] BLOCKED - already sending:', this.sendingMessageId);
      return;
    }

    this.sendingMessageId = sendId;
    this.setState({ isLoading: true });
    console.log('[Store] Send started:', sendId, trimmed);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      // Insert user message
      await supabase.from('sparky_messages').insert({
        user_id: user.id,
        role: 'user',
        content: trimmed,
      });

      // Reload to get the new message with its DB-generated ID
      await this.loadMessages();

      // Build history from current messages (already loaded, no duplicates)
      const history = this.state.messages.slice(-20).map(m => ({
        role: m.role,
        content: m.content,
      }));

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
            conversationHistory: history,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const brain = response.headers.get('X-Sparky-Brain') || undefined;

      // Add streaming message
      const streamingMsg: ChatMessage = {
        id: 'streaming',
        role: 'assistant',
        content: '',
        brain,
        brainName: brain ? brainNames[brain] : undefined,
        timestamp: new Date(),
        isStreaming: true,
      };

      this.setState({ messages: [...this.state.messages, streamingMsg] });

      // Read stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No body');

      const decoder = new TextDecoder();
      let content = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;

          const json = line.slice(6).trim();
          if (json === '[DONE]') continue;

          try {
            const delta = JSON.parse(json).choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              // Update streaming message
              const msgs = [...this.state.messages];
              const last = msgs[msgs.length - 1];
              if (last?.isStreaming) {
                msgs[msgs.length - 1] = { ...last, content };
                this.setState({ messages: msgs });
              }
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Save assistant message
      if (content) {
        await supabase.from('sparky_messages').insert({
          user_id: user.id,
          role: 'assistant',
          content,
          brain: brain || null,
        });
      }

      // Reload final state
      await this.loadMessages();
      console.log('[Store] Send complete:', sendId);

    } catch (error) {
      console.error('[Store] Error:', error);
      await this.loadMessages(); // Reset to DB state
    } finally {
      this.sendingMessageId = null;
      this.setState({ isLoading: false });
    }
  }

  async clearChat(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('sparky_messages').delete().eq('user_id', user.id);
      this.setState({ messages: [] });
    } catch (error) {
      console.error('[Store] Clear error:', error);
    }
  }
}

export const sparkyChatStore = new SparkyChatStore();
