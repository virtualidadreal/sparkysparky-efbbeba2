import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Final CTA Final Alt - Cierre emocional con Viaje del Villano (Isra Bravo)
 */
const FinalCTAFinalAlt = () => {
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
            {/* MEJORADO: Viaje del Villano - proyectar el futuro negativo */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight mb-4">
              Dentro de un año,
            </h2>
            <p className="text-2xl sm:text-3xl text-gray-400 mb-4">
              ¿seguirás perdiendo ideas?
            </p>
            <p className="text-2xl sm:text-3xl text-[#FACD1A] font-medium mb-12">
              O habrás construido algo con ellas.
            </p>

            {/* CTA MEJORADO: Específico */}
            <Link
              to="/signup"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-[#FACD1A] text-gray-900 font-semibold text-lg rounded-full hover:bg-[#E5BA17] transition-all duration-300 shadow-xl shadow-[#FACD1A]/25"
            >
              Guardar mi primera idea
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="mt-8 text-sm text-gray-500">
              Sin tarjeta · 2 minutos · 10 ideas gratis/mes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTAFinalAlt;
