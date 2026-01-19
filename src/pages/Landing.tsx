import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Hero,
  VoiceSection,
  Problem,
  Agitate,
  Credibility,
  Solution,
  Comparison,
  Proof,
  HowItWorks,
  Pricing,
  FAQ,
  FinalCTA,
  Footer,
} from '@/components/landing';

/**
 * Landing Page - Página pública de marketing
 * 
 * Estructura basada en framework de Vibe Marketing Skills:
 * Hero → VoiceSection → Problem → Agitate → Credibility → Solution → 
 * Comparison → HowItWorks → Proof → Pricing → FAQ → FinalCTA → Footer
 */
const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <VoiceSection />
      <Problem />
      <Agitate />
      <Credibility />
      <Solution />
      <Comparison />
      <HowItWorks />
      <Proof />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default Landing;
