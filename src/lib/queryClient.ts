import { QueryClient } from '@tanstack/react-query';

// Configuración del QueryClient de React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración por defecto para queries
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos (antes cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // Configuración por defecto para mutations
      retry: 0,
      onError: (error) => {
        console.error('Error en mutación:', error);
      },
    },
  },
});
