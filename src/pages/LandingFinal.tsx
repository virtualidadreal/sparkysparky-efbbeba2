import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import HeaderFinal from '@/components/landing-final/HeaderFinal';
import HeroFinal from '@/components/landing-final/HeroFinal';
import ProblemFinal from '@/components/landing-final/ProblemFinal';
import AgitationFinal from '@/components/landing-final/AgitationFinal';
import SolutionFinal from '@/components/landing-final/SolutionFinal';
import HowItWorksFinal from '@/components/landing-final/HowItWorksFinal';
import ComparisonFinal from '@/components/landing-final/ComparisonFinal';
import WhySparkyFinal from '@/components/landing-final/WhySparkyFinal';
import PricingFinal from '@/components/landing-final/PricingFinal';
import FAQFinal from '@/components/landing-final/FAQFinal';
import IsForYouFinal from '@/components/landing-final/IsForYouFinal';
import FinalCTAFinal from '@/components/landing-final/FinalCTAFinal';
import FooterFinal from '@/components/landing-final/FooterFinal';

/**
 * Landing Final - Light Linear Style + Yellow Brand + Floating Elements
 * Redirects authenticated users to dashboard
 */
const LandingFinal = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
        </div>
      </div>
    );
  }

  // Don't render landing if user is authenticated (will redirect)
  if (user) {
    return null;
  }
  return (
    <main className="min-h-screen bg-white antialiased">
      <HeaderFinal />
      <HeroFinal />
      <ProblemFinal />
      <AgitationFinal />
      <SolutionFinal />
      <HowItWorksFinal />
      <ComparisonFinal />
      <WhySparkyFinal />
      <IsForYouFinal />
      <PricingFinal />
      <FAQFinal />
      <FinalCTAFinal />
      <FooterFinal />
    </main>
  );
};

export default LandingFinal;
