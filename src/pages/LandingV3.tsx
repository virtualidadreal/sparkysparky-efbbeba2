import { lazy, Suspense } from 'react';

// Lazy load sections
const HeroV3 = lazy(() => import('@/components/landing-v3/HeroV3'));
const ProblemV3 = lazy(() => import('@/components/landing-v3/ProblemV3'));
const WhatIsSparkyV3 = lazy(() => import('@/components/landing-v3/WhatIsSparkyV3'));
const HowItWorksV3 = lazy(() => import('@/components/landing-v3/HowItWorksV3'));
const BrainsV3 = lazy(() => import('@/components/landing-v3/BrainsV3'));
const DifferentV3 = lazy(() => import('@/components/landing-v3/DifferentV3'));
const PrivacyV3 = lazy(() => import('@/components/landing-v3/PrivacyV3'));
const FinalCTAV3 = lazy(() => import('@/components/landing-v3/FinalCTAV3'));
const FooterV3 = lazy(() => import('@/components/landing-v3/FooterV3'));

const SectionLoader = () => (
  <div className="min-h-[100px]" />
);

/**
 * Landing V3 - Estilo Notion
 * Minimal, limpio, con toques juguetones
 */
const LandingV3 = () => {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Suspense fallback={<SectionLoader />}>
        <HeroV3 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <ProblemV3 />
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
        <DifferentV3 />
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
