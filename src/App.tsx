import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary, ProtectedRoute } from '@/components/common';

// Lazy load de páginas
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Ideas = lazy(() => import('@/pages/Ideas'));
const Projects = lazy(() => import('@/pages/Projects'));
const Tasks = lazy(() => import('@/pages/Tasks'));
const People = lazy(() => import('@/pages/People'));
const Diary = lazy(() => import('@/pages/Diary'));
const Insights = lazy(() => import('@/pages/Insights'));
const Settings = lazy(() => import('@/pages/Settings'));
const Admin = lazy(() => import('@/pages/Admin'));
const Memory = lazy(() => import('@/pages/Memory'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
      <p className="text-muted-foreground">Cargando...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Ruta pública */}
              <Route path="/auth" element={<Auth />} />

              {/* Rutas protegidas */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/ideas" element={<ProtectedRoute><Ideas /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
              <Route path="/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
              <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />
              <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/memory" element={<ProtectedRoute><Memory /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

              {/* Catch-all para 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#2ECC71',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#E74C3C',
                secondary: '#fff',
              },
            },
          }}
        />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
