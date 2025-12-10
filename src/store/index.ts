import { configureStore } from '@reduxjs/toolkit';

// Store de Redux - por ahora vacío, se añadirán slices progresivamente
export const store = configureStore({
  reducer: {
    // Los slices se añadirán aquí (auth, settings, etc.)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones de Redux Toolkit que no son serializables
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Tipos inferidos del store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
