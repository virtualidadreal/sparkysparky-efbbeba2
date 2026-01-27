import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary, ProtectedRoute, InstallPWAPrompt } from '@/components/common';

// Lazy load de páginas
const Landing = lazy(() => import('@/pages/Landing'));
const LandingV2 = lazy(() => import('@/pages/LandingV2'));
const LandingV3 = lazy(() => import('@/pages/LandingV3'));
const LandingV4 = lazy(() => import('@/pages/LandingV4'));
const LandingFinal = lazy(() => import('@/pages/LandingFinal'));
const LandingFinalAlt = lazy(() => import('@/pages/LandingFinalAlt'));
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Ideas = lazy(() => import('@/pages/Ideas'));
const Projects = lazy(() => import('@/pages/Projects'));
const Tasks = lazy(() => import('@/pages/Tasks'));
const People = lazy(() => import('@/pages/People'));
const Diary = lazy(() => import('@/pages/Diary'));
const Estadisticas = lazy(() => import('@/pages/Estadisticas'));
const Settings = lazy(() => import('@/pages/Settings'));
const Admin = lazy(() => import('@/pages/Admin'));
const Memory = lazy(() => import('@/pages/Memory'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Signup = lazy(() => import('@/pages/Signup'));
const BetaSignup = lazy(() => import('@/pages/BetaSignup'));
const SubscriptionSuccess = lazy(() => import('@/pages/SubscriptionSuccess'));
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
              {/* Rutas públicas */}
              <Route path="/" element={<Landing />} />
              <Route path="/landing-v2" element={<LandingV2 />} />
              <Route path="/landing-v4" element={<LandingV4 />} />
              <Route path="/landing-v3" element={<LandingV3 />} />
              <Route path="/landing-final" element={<LandingFinal />} />
              <Route path="/landing-final-alt" element={<LandingFinalAlt />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/beta" element={<BetaSignup />} />
              <Route path="/subscription-success" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />

              {/* Rutas protegidas */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/ideas" element={<ProtectedRoute><Ideas /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
              <Route path="/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
              <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />
              <Route path="/estadisticas" element={<ProtectedRoute><Estadisticas /></ProtectedRoute>} />
              <Route path="/insights" element={<Navigate to="/estadisticas" replace />} />
              <Route path="/analytics" element={<Navigate to="/estadisticas" replace />} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/memory" element={<ProtectedRoute><Memory /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

              {/* Catch-all para 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        
        {/* PWA Install Prompt for mobile */}
        <InstallPWAPrompt />
        
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
