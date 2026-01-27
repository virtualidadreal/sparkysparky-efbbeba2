import HeaderFinal from '@/components/landing-final/HeaderFinal';
import HeroFinalAlt from '@/components/landing-final/HeroFinalAlt';
import ProblemFinalAlt from '@/components/landing-final/ProblemFinalAlt';
import AgitationFinalAlt from '@/components/landing-final/AgitationFinalAlt';
import OtherAppsFailAlt from '@/components/landing-final/OtherAppsFailAlt';
import SolutionFinalAlt from '@/components/landing-final/SolutionFinalAlt';
import HowItWorksFinal from '@/components/landing-final/HowItWorksFinal';
import ComparisonFinalAlt from '@/components/landing-final/ComparisonFinalAlt';
import TestimonialsFinal from '@/components/landing-final/TestimonialsFinal';
import WhySparkyFinalAlt from '@/components/landing-final/WhySparkyFinalAlt';
import IsForYouFinalAlt from '@/components/landing-final/IsForYouFinalAlt';
import PricingFinalAlt from '@/components/landing-final/PricingFinalAlt';
import FAQFinalAlt from '@/components/landing-final/FAQFinalAlt';
import FinalCTAFinalAlt from '@/components/landing-final/FinalCTAFinalAlt';
import FooterFinal from '@/components/landing-final/FooterFinal';

/**
 * Landing Final Alt - Versión con técnicas Isra Bravo aplicadas
 *
 * Cambios respecto a LandingFinal:
 * - Hero: CTA específico "Guardar mi primera idea", subheadline emocional
 * - Problem: Cierre emocional "oportunidad que regalas"
 * - Agitation: Viaje del Villano añadido + card emocional
 * - OtherAppsFail: Técnica "Muestra tus defectos"
 * - Solution: Features como beneficios
 * - Comparison: Cierre más directo
 * - NUEVO: Testimonials que desactivan objeciones
 * - WhySparky: Metáfora + David vs Goliat
 * - IsForYou: "No" más fuerte (Fuerza del No)
 * - Pricing: Técnica del Incendio mejorada + urgencia específica
 * - FAQ: Respuestas cortas + pregunta sobre precio
 * - FinalCTA: Viaje del Villano + CTA específico
 */
const LandingFinalAlt = () => {
  return (
    <main className="min-h-screen bg-white antialiased">
      <HeaderFinal />
      <HeroFinalAlt />
      <ProblemFinalAlt />
      <AgitationFinalAlt />
      <OtherAppsFailAlt />
      <SolutionFinalAlt />
      <HowItWorksFinal />
      <ComparisonFinalAlt />
      <TestimonialsFinal />
      <WhySparkyFinalAlt />
      <IsForYouFinalAlt />
      <PricingFinalAlt />
      <FAQFinalAlt />
      <FinalCTAFinalAlt />
      <FooterFinal />
    </main>
  );
};

export default LandingFinalAlt;
