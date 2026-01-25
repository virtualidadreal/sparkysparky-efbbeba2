import { lazy, Suspense } from 'react';

// Lazy load sections
const HeroV3 = lazy(() => import('@/components/landing-v3/HeroV3'));
const VoiceSectionV3 = lazy(() => import('@/components/landing-v3/VoiceSectionV3'));
const ProblemV3 = lazy(() => import('@/components/landing-v3/ProblemV3'));
const ProblemCardsV3 = lazy(() => import('@/components/landing-v3/ProblemCardsV3'));
const OtherAppsFailV3 = lazy(() => import('@/components/landing-v3/OtherAppsFailV3'));
const WhatIsSparkyV3 = lazy(() => import('@/components/landing-v3/WhatIsSparkyV3'));
const HowItWorksV3 = lazy(() => import('@/components/landing-v3/HowItWorksV3'));
const BrainsV3 = lazy(() => import('@/components/landing-v3/BrainsV3'));
const ComparisonV3 = lazy(() => import('@/components/landing-v3/ComparisonV3'));
const DifferentV3 = lazy(() => import('@/components/landing-v3/DifferentV3'));
const WhySparkyV3 = lazy(() => import('@/components/landing-v3/WhySparkyV3'));
const PricingV3 = lazy(() => import('@/components/landing-v3/PricingV3'));
const DarkHeroV3 = lazy(() => import('@/components/landing-v3/DarkHeroV3'));
const PrivacyV3 = lazy(() => import('@/components/landing-v3/PrivacyV3'));
const FinalCTAV3 = lazy(() => import('@/components/landing-v3/FinalCTAV3'));
const FooterV3 = lazy(() => import('@/components/landing-v3/FooterV3'));

const SectionLoader = () => (
  <div className="min-h-[100px]" />
);

/**
 * Landing V3 - Estilo Notion con secciones adicionales
 * Minimal, limpio, con toques juguetones y warm beige background
 */
const LandingV3 = () => {
  return (
    <main className="min-h-screen bg-[#F5F3EE] overflow-x-hidden">
      <Suspense fallback={<SectionLoader />}>
        <HeroV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <VoiceSectionV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <ProblemV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <ProblemCardsV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <OtherAppsFailV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <WhatIsSparkyV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <HowItWorksV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <BrainsV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <ComparisonV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <DifferentV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <WhySparkyV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <PricingV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <DarkHeroV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <PrivacyV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <FinalCTAV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <FooterV3 />
      </Suspense>
    </main>
  );
};

export default LandingV3;
