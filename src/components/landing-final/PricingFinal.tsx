import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';

/**
 * Pricing Final - Light Linear Style with dark section
 */
const PricingFinal = () => {
  const { stats } = useEarlyAccess();

  const spotsTaken = stats?.spots_taken ?? 0;
  const totalSpots = stats?.total_spots ?? 100;
  const spotsRemaining = totalSpots - spotsTaken;
  const isAvailable = spotsRemaining > 0;
  const percentageFilled = (spotsTaken / totalSpots) * 100;

  const freePlanFeatures = ['10 ideas/mes', 'Organización automática', 'Captura por voz'];
  const proPlanFeatures = ['Ideas ilimitadas', 'Conexiones inteligentes', 'Recordatorios proactivos', 'Diario personal', 'Gestión de proyectos', 'Soporte prioritario'];

  return (
    <section id="pricing" className="py-32 px-6 bg-gray-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#FACD1A]/10 rounded-full blur-[150px]" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-[#FACD1A] tracking-wider uppercase mb-6">
            Pricing
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight mb-4">
            Planes simples.
          </h2>
          <p className="text-xl text-gray-400">
            Empieza gratis. Crece cuando quieras.
          </p>
        </div>

        {/* Launch offer */}
        <div className="mb-12 p-8 rounded-2xl bg-[#FACD1A]/10 border border-[#FACD1A]/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-[#FACD1A] mb-2">Oferta de lanzamiento</p>
              <p className="text-white">
                Los primeros <span className="font-semibold">30 usuarios</span> tienen Sparky Pro gratis <span className="font-semibold">3 meses</span>.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Porque necesitamos feedback real.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className="text-3xl font-semibold text-white">{spotsTaken}</span>
                <span className="text-gray-500 text-lg">/{totalSpots}</span>
              </div>
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#FACD1A] rounded-full" style={{ width: `${percentageFilled}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-400 mb-2">Gratis</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-semibold text-white">0€</span>
                <span className="text-gray-500">/mes</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10">
              {freePlanFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-400">
                  <Check className="w-4 h-4 text-gray-600" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              to="/signup"
              className="block w-full py-4 text-center text-white font-medium rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Pro */}
          <div className="relative p-8 rounded-2xl bg-white border border-gray-200">
            {isAvailable && (
              <div className="absolute -top-3 left-8">
                <span className="px-3 py-1 text-xs font-bold bg-[#FACD1A] text-gray-900 rounded-full shadow-lg shadow-[#FACD1A]/25">
                  3 meses gratis
                </span>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-lg font-medium text-[#FACD1A] mb-2">Sparky Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-semibold text-gray-900">2,99€</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Precio de lanzamiento</p>
            </div>

            <ul className="space-y-4 mb-10">
              {proPlanFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <Check className="w-4 h-4 text-[#FACD1A]" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              to="/signup"
              className="group flex items-center justify-center gap-2 w-full py-4 bg-[#FACD1A] text-gray-900 font-semibold rounded-full hover:bg-[#E5BA17] transition-colors shadow-lg shadow-[#FACD1A]/25"
            >
              {isAvailable ? 'Reclamar oferta' : 'Empezar ahora'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingFinal;
