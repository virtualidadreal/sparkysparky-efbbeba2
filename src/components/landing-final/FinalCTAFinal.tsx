import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Final CTA Final - Light Linear Style
 */
const FinalCTAFinal = () => {
  return (
    <section className="py-32 px-6 bg-[#FAFAF9] relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Card */}
        <div className="relative rounded-3xl bg-gray-900 p-12 md:p-20 text-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FACD1A]/20 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight mb-6">
              Deja de perder ideas.
            </h2>
            <p className="text-xl sm:text-2xl text-gray-400 mb-12">
              Empieza a construir con ellas.
            </p>

            <Link
              to="/signup"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-[#FACD1A] text-gray-900 font-semibold text-lg rounded-full hover:bg-[#E5BA17] transition-all duration-300 shadow-xl shadow-[#FACD1A]/25"
            >
              Empezar ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="mt-8 text-sm text-gray-500">
              Sin tarjeta de crédito · Configuración en 2 minutos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTAFinal;
