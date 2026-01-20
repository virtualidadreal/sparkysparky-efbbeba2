import { useSyncExternalStore, useCallback, useEffect } from 'react';
import { sparkyChatStore, ChatMessage } from '@/stores/sparkyChatStore';

export type { ChatMessage };

export const useSparkyChat = () => {
  // Subscribe to the external store
  const messages = useSyncExternalStore(
    (callback) => sparkyChatStore.subscribe(callback),
    () => sparkyChatStore.getMessages()
  );

  const isLoading = useSyncExternalStore(
    (callback) => sparkyChatStore.subscribe(callback),
    () => sparkyChatStore.getIsLoading()
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
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
};
