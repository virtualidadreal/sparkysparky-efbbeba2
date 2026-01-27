import HeaderFinal from '@/components/landing-final/HeaderFinal';
import HeroFinal from '@/components/landing-final/HeroFinal';
import ProblemFinal from '@/components/landing-final/ProblemFinal';
import AgitationFinal from '@/components/landing-final/AgitationFinal';
import OtherAppsFail from '@/components/landing-final/OtherAppsFail';
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
 */
const LandingFinal = () => {
  return (
    <main className="min-h-screen bg-white antialiased">
      <HeaderFinal />
      <HeroFinal />
      <ProblemFinal />
      <AgitationFinal />
      <SolutionFinal />
      <HowItWorksFinal />
      <OtherAppsFail />
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
