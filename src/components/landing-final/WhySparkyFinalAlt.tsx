import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Why Sparky Final Alt - Con metáfora y David vs Goliat (Isra Bravo)
 */
const WhySparkyFinalAlt = () => {
  return (
    <section className="py-32 px-6 bg-[#FAFAF9] relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FACD1A]/10 rounded-full blur-[150px]" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* NUEVO: Metáfora (técnica David Ogilvy) */}
        <div className="mb-16">
          <p className="text-xl text-gray-500 mb-6">
            Tu mente es como un río de ideas.
          </p>
          <p className="text-2xl sm:text-3xl text-gray-900 font-medium mb-2">
            La mayoría se van corriente abajo.
          </p>
          <p className="text-2xl sm:text-3xl text-[#FACD1A] font-semibold">
            Sparky es la red que atrapa las que importan.
          </p>
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-gray-300 mx-auto mb-16" />

        {/* NUEVO: David vs Goliat */}
        <div className="text-left p-8 rounded-2xl bg-white border border-gray-200 shadow-sm mb-12">
          <p className="text-gray-500 leading-relaxed mb-4">
            No somos Notion con 400 millones de usuarios.
          </p>
          <p className="text-gray-500 leading-relaxed mb-4">
            Somos un equipo pequeño que cree que tus ideas merecen algo mejor que una carpeta llamada <span className="font-mono text-gray-700">"Ideas 2026 (2)"</span>.
          </p>
          <p className="text-gray-900 font-medium">
            Por eso construimos Sparky.
          </p>
        </div>

        {/* CTA Card */}
        <div className="p-10 rounded-2xl bg-gray-900 text-center">
          <p className="text-xl sm:text-2xl text-white mb-8">
            Tus ideas merecen algo mejor que una nota olvidada.
          </p>

          <Link
            to="/signup"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-[#FACD1A] text-gray-900 font-semibold rounded-full hover:bg-[#E5BA17] transition-all duration-300 shadow-lg shadow-[#FACD1A]/25"
          >
            Guardar mi primera idea
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="mt-6 text-sm text-gray-500">
            Gratis · Sin tarjeta · 10 ideas/mes
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhySparkyFinalAlt;
