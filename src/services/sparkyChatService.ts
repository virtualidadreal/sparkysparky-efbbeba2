/**
 * Sparky Chat Service - Singleton service that handles message sending
 * Completely isolated from React to prevent double-send issues from StrictMode
 */

import { supabase } from '@/integrations/supabase/client';

export interface StreamCallbacks {
  onStreamStart: (brain?: string, brainName?: string) => void;
  onStreamChunk: (content: string) => void;
  onStreamEnd: (fullContent: string) => void;
  onError: (error: string) => void;
}

class SparkyChatService {
  private isSending = false;
  private abortController: AbortController | null = null;

  async sendMessage(
    message: string,
    callbacks: StreamCallbacks
  ): Promise<boolean> {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return false;

    // Strict lock check
    if (this.isSending) {
      console.log('[SparkyChatService] Blocked: already sending');
      return false;
    }

    // Set lock IMMEDIATELY
    this.isSending = true;
    console.log('[SparkyChatService] Starting send:', trimmedMessage);

    // Cancel any previous request
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
          content: trimmedMessage,
        });

      if (insertError) throw insertError;

      // Fetch conversation history
      const { data: freshMessages } = await supabase
        .from('sparky_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(500);

      const historyMessages = (freshMessages || []).slice(-20).map((m) => ({
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
            message: trimmedMessage,
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

      callbacks.onStreamStart(brain, brainName);

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
              callbacks.onStreamChunk(fullContent);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Save assistant response
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

      callbacks.onStreamEnd(fullContent);
      console.log('[SparkyChatService] Send complete');
      return true;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[SparkyChatService] Request aborted');
        return false;
      }

      console.error('[SparkyChatService] Error:', error);
      callbacks.onError(error.message || 'Error al comunicarse con Sparky');
      return false;

    } finally {
      this.isSending = false;
      console.log('[SparkyChatService] Lock released');
    }
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isSending = false;
  }

  get isCurrentlySending(): boolean {
    return this.isSending;
  }
}

// Export singleton instance
export const sparkyChatService = new SparkyChatService();
