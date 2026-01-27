import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Hero Final - Light with floating elements background
 */
const HeroFinal = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 bg-[#F8F7F4] relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FACD1A]/5 via-transparent to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 tracking-tight leading-[1.05] mb-4">
          Recuerda todo.
        </h1>
        <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#FACD1A] tracking-tight leading-[1.05] mb-8">
          Piensa mejor.
        </p>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-12">
          Sparky es tu nuevo compañero IA que captura tus ideas, las conecta y organiza para ti.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-[#FACD1A] text-gray-900 font-semibold text-lg rounded-full hover:bg-[#E5BA17] transition-all duration-300 shadow-lg shadow-[#FACD1A]/25 hover:shadow-xl hover:shadow-[#FACD1A]/30"
          >
            Empezar gratis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Microcopy */}
        <p className="mt-6 text-sm text-gray-400">
          Sin tarjeta de crédito · Configuración en 2 minutos
        </p>
      </div>

    </section>
  );
};

export default HeroFinal;
