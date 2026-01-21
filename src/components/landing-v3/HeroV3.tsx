import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * Hero V3 - Estilo Notion
 * Grande, limpio, con elementos flotantes
 */
const HeroV3 = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative bg-white">
      {/* Floating elements - Notion style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-16 h-16 bg-amber-100 rounded-2xl rotate-12 animate-float opacity-60" />
        <div className="absolute top-[20%] right-[15%] w-12 h-12 bg-rose-100 rounded-full animate-float-delayed opacity-60" />
        <div className="absolute bottom-[25%] left-[15%] w-10 h-10 bg-sky-100 rounded-lg -rotate-6 animate-float opacity-60" />
        <div className="absolute bottom-[20%] right-[10%] w-14 h-14 bg-emerald-100 rounded-2xl rotate-6 animate-float-delayed opacity-60" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full mb-8 border border-amber-200/50">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-700">Tu compañero para pensar</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
          Piensa mejor.
        </h1>

        {/* Subheadline */}
        <p className="text-xl sm:text-2xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
          Sparky es un compañero que captura tus ideas, las conecta y te ayuda a pensar sobre ellas.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-medium text-lg rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-gray-900/10"
          >
            Empieza gratis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Microcopy */}
        <p className="mt-4 text-sm text-gray-400">
          Sin tarjetas. Sin configurar nada.
        </p>
      </div>

      {/* Mockup hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-300">
        <span className="text-xs">Scroll</span>
        <div className="w-5 h-8 border-2 border-gray-200 rounded-full flex justify-center pt-1">
          <div className="w-1 h-2 bg-gray-300 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroV3;
