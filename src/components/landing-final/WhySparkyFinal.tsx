import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Why Sparky Final - Light Linear Style
 */
const WhySparkyFinal = () => {
  return (
    <section className="py-32 px-6 bg-[#FAFAF9] relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FACD1A]/10 rounded-full blur-[150px]" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">
          Tus mejores ideas se pierden.
        </h2>

        <div className="space-y-2 mb-12">
          <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">
            Sparky las guarda, las conecta
          </p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#FACD1A]">
            y las convierte en acción.
          </p>
          <p className="text-lg text-gray-500 pt-4">
            El compañero de IA que recuerda lo que tú olvidas.
          </p>
        </div>

        {/* CTA Card */}
        <div className="p-10 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <p className="text-xl sm:text-2xl text-gray-900 mb-8">
            Tus ideas merecen algo mejor que una nota olvidada.
          </p>

          <Link
            to="/signup"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-[#FACD1A] text-gray-900 font-semibold rounded-full hover:bg-[#E5BA17] transition-all duration-300 shadow-lg shadow-[#FACD1A]/25"
          >
            Guardar mi primera idea
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="mt-6 text-sm text-gray-400">
            Gratis · Sin tarjeta · 10 ideas/mes
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhySparkyFinal;
