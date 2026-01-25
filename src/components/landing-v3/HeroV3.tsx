import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * Hero V3 - Estilo warm/beige con headline impactante
 */
const HeroV3 = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative bg-[#F5F3EE]">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Headline - Black + Primary */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-4">
          Tus mejores ideas se pierden.
        </h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight leading-[1.1] mb-6">
          Sparky las guarda, las conecta
          <br className="hidden sm:block" />
          y las convierte en acción.
        </h2>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
          El compañero de IA que recuerda lo que tú olvidas.
        </p>

        {/* CTA */}
        <Link
          to="/signup"
          className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium text-lg rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20"
        >
          <Sparkles className="w-5 h-5" />
          Guardar mi primera chispa
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-300">
        <div className="w-5 h-8 border-2 border-gray-300 rounded-full flex justify-center pt-1">
          <div className="w-1 h-2 bg-gray-300 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroV3;
