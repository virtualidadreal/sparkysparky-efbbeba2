import { lazy, Suspense } from 'react';

// Lazy load sections for performance
const HeroV2 = lazy(() => import('@/components/landing-v2/HeroV2'));
const ProblemV2 = lazy(() => import('@/components/landing-v2/ProblemV2'));
const OtherAppsFailV2 = lazy(() => import('@/components/landing-v2/OtherAppsFailV2'));
const WhatIsSparkyV2 = lazy(() => import('@/components/landing-v2/WhatIsSparkyV2'));
const ComparisonV2 = lazy(() => import('@/components/landing-v2/ComparisonV2'));
const HowItWorksV2 = lazy(() => import('@/components/landing-v2/HowItWorksV2'));
const BrainsV2 = lazy(() => import('@/components/landing-v2/BrainsV2'));
const DifferentV2 = lazy(() => import('@/components/landing-v2/DifferentV2'));
const PricingV2 = lazy(() => import('@/components/landing-v2/PricingV2'));
const PrivacyV2 = lazy(() => import('@/components/landing-v2/PrivacyV2'));
const FinalCTAV2 = lazy(() => import('@/components/landing-v2/FinalCTAV2'));
const FooterV2 = lazy(() => import('@/components/landing-v2/FooterV2'));

const SectionLoader = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

/**
 * Landing V2 - Minimalismo cálido
 * Basada en PRD de diseño y copy
 */
const LandingV2 = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Suspense fallback={<SectionLoader />}>
        <HeroV2 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <ProblemV2 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <OtherAppsFailV2 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <WhatIsSparkyV2 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <ComparisonV2 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <HowItWorksV2 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <BrainsV2 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <DifferentV2 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <PricingV2 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <PrivacyV2 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <FinalCTAV2 />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <FooterV2 />
      </Suspense>
    </main>
  );
};

export default LandingV2;
