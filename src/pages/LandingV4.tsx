import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/playfair-display/700.css';

import HeaderV4 from '@/components/landing-v4/HeaderV4';
import HeroV4 from '@/components/landing-v4/HeroV4';
import ProblemV4 from '@/components/landing-v4/ProblemV4';
import OtherAppsFailV4 from '@/components/landing-v4/OtherAppsFailV4';
import StoryV4 from '@/components/landing-v4/StoryV4';
import FeaturesV4 from '@/components/landing-v4/FeaturesV4';
import DifferentiatorV4 from '@/components/landing-v4/DifferentiatorV4';
import ComparisonV4 from '@/components/landing-v4/ComparisonV4';
import TestimonialV4 from '@/components/landing-v4/TestimonialV4';
import PricingV4 from '@/components/landing-v4/PricingV4';
import PrivacyBadgesV4 from '@/components/landing-v4/PrivacyBadgesV4';
import FAQV4 from '@/components/landing-v4/FAQV4';
import WhySparkyV4 from '@/components/landing-v4/WhySparkyV4';
import FinalCTAV4 from '@/components/landing-v4/FinalCTAV4';
import FooterV4 from '@/components/landing-v4/FooterV4';

/**
 * Landing V4 - Warm Spark Design
 * Based on the detailed PRD with:
 * - Warm color palette (orange #FF6B35, amber #FFB800)
 * - Cream backgrounds (#FFF8F0, #FFF5EB)
 * - Dark sections in navy (#1A1A2E)
 * - Outfit for body, Playfair Display for headings
 * - Spark particle animations
 * - 13 sections following the marketing framework
 */
const LandingV4 = () => {
  return (
    <main className="min-h-screen bg-[#FFF8F0] font-sans" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <HeaderV4 />
      <HeroV4 />
      <ProblemV4 />
      <OtherAppsFailV4 />
      <StoryV4 />
      <FeaturesV4 />
      <DifferentiatorV4 />
      <ComparisonV4 />
      <TestimonialV4 />
      <PricingV4 />
      <PrivacyBadgesV4 />
      <FAQV4 />
      <WhySparkyV4 />
      <FinalCTAV4 />
      <FooterV4 />
    </main>
  );
};

export default LandingV4;
