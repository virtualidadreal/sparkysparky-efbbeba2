import { useSyncExternalStore, useCallback, useEffect } from 'react';
import { sparkyChatStore, ChatMessage } from '@/stores/sparkyChatStore';

export type { ChatMessage };

export const useSparkyChat = () => {
  // Subscribe to the external store with stable snapshot
  const snapshot = useSyncExternalStore(
    (callback) => sparkyChatStore.subscribe(callback),
    () => sparkyChatStore.getSnapshot()
  );

  // Load messages on mount
  useEffect(() => {
    sparkyChatStore.loadMessages();
  }, []);

  // Stable function references
  const sendMessage = useCallback((message: string) => {
    sparkyChatStore.sendMessage(message);
  }, []);

  const clearChat = useCallback(() => {
    sparkyChatStore.clearChat();
  }, []);

  return {
    messages: snapshot.messages,
    isLoading: snapshot.isLoading,
    sendMessage,
    clearChat,
  };
};
