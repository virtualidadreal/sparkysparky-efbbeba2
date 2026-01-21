import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import App from '@/App';
import '@/index.css';

/**
 * Entry point de Sparky
 * 
 * Providers:
 * - StrictMode: Detección de problemas en desarrollo
 * - App: QueryClient y Router configurados internamente
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
