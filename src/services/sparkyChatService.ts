/**
 * Sparky Chat Service - Singleton service with synchronous locking
 */

import { supabase } from '@/integrations/supabase/client';

export interface StreamCallbacks {
  onStreamStart: (brain?: string, brainName?: string) => void;
  onStreamChunk: (content: string) => void;
  onStreamEnd: (fullContent: string) => void;
  onError: (error: string) => void;
}

// CRITICAL: This lock must be checked and set SYNCHRONOUSLY before ANY async operation
let sendLock = false;
let lastSendTimestamp = 0;

class SparkyChatService {
  private abortController: AbortController | null = null;

  /**
   * Attempts to acquire the send lock. Returns true if acquired, false if already locked.
   * This MUST be called synchronously at the very start, before any await.
   */
  private tryAcquireLock(): boolean {
    const now = Date.now();
    
    // If locked and less than 30 seconds ago, reject
    if (sendLock && (now - lastSendTimestamp) < 30000) {
      console.log('[SparkyChatService] Lock check FAILED - already locked');
      return false;
    }
    
    // Acquire lock
    sendLock = true;
    lastSendTimestamp = now;
    console.log('[SparkyChatService] Lock ACQUIRED at', now);
    return true;
  }

  private releaseLock(): void {
    sendLock = false;
    console.log('[SparkyChatService] Lock RELEASED');
  }

  async sendMessage(
    message: string,
    callbacks: StreamCallbacks
  ): Promise<boolean> {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return false;

    // SYNCHRONOUS lock check - this happens BEFORE any async operation
    if (!this.tryAcquireLock()) {
      return false;
    }

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
      this.releaseLock();
    }
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.releaseLock();
  }

  get isLocked(): boolean {
    return sendLock;
  }
}

// Export singleton instance
export const sparkyChatService = new SparkyChatService();
