/**
 * Sparky Chat Store - Fixed version
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
  private isSending = false;

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
      // Use decrypted view for reading
      const { data, error } = await supabase
        .from('sparky_messages_decrypted' as any)
        .select('*')
        .order('created_at', { ascending: true })
        .limit(500);

      if (error) throw error;

      const messages = ((data as any[]) || []).map((msg: any) => ({
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

    // Prevent double sends
    if (this.isSending) {
      console.log('[Store] BLOCKED - already sending');
      return;
    }

    this.isSending = true;
    this.setState({ isLoading: true });
    console.log('[Store] Sending:', trimmed);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      // IMPORTANT: Build history BEFORE inserting the new message
      // This prevents the message from appearing twice
      const historyBeforeInsert = this.state.messages.slice(-19).map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Insert user message to DB
      await supabase.from('sparky_messages').insert({
        user_id: user.id,
        role: 'user',
        content: trimmed,
      });

      // Update UI to show user message immediately
      const userMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };
      this.setState({ messages: [...this.state.messages, userMsg] });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      // Call edge function with history that does NOT include current message
      // The edge function will add the current message at the end
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
            conversationHistory: historyBeforeInsert,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const brain = response.headers.get('X-Sparky-Brain') || undefined;

      // Read complete response (no streaming)
      const responseText = await response.text();
      
      // Parse SSE to extract content
      let content = '';
      const lines = responseText.split('\n');
      for (const line of lines) {
        const trimmed = line.replace(/\r$/, '').trim();
        if (!trimmed.startsWith('data: ')) continue;
        
        const jsonStr = trimmed.slice(6);
        if (jsonStr === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            content += delta;
          }
        } catch {
          // Skip malformed JSON
        }
      }

      // Add assistant message to UI
      const assistantMsg: ChatMessage = {
        id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content,
        brain,
        brainName: brain ? brainNames[brain] : undefined,
        timestamp: new Date(),
      };
      this.setState({ messages: [...this.state.messages, assistantMsg] });

      // Save assistant message to DB
      if (content) {
        await supabase.from('sparky_messages').insert({
          user_id: user.id,
          role: 'assistant',
          content,
          brain: brain || null,
        });
      }

      // Reload from DB to get correct IDs
      await this.loadMessages();
      console.log('[Store] Send complete');

    } catch (error) {
      console.error('[Store] Error:', error);
      await this.loadMessages();
    } finally {
      this.isSending = false;
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
