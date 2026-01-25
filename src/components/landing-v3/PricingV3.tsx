import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Check, Loader2 } from 'lucide-react';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';

/**
 * Pricing V3 - Planes con oferta de lanzamiento
 */
const PricingV3 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { stats, loading } = useEarlyAccess();

  // Safe defaults
  const spotsTaken = stats?.spots_taken ?? 0;
  const totalSpots = stats?.total_spots ?? 30;
  const spotsRemaining = totalSpots - spotsTaken;
  const isAvailable = spotsRemaining > 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const freePlanFeatures = [
    '10 ideas/mes',
    'Organización automática',
    'Captura por voz',
  ];

  const proPlanFeatures = [
    'Ideas ilimitadas',
    'Conexiones inteligentes',
    'Recordatorios proactivos',
    'Diario personal',
    'Gestión de proyectos',
  ];

  return (
    <section id="pricing" ref={sectionRef} className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Planes simples
          </h2>
          <p className="text-xl text-gray-500">
            Empieza gratis. Crece cuando quieras.
          </p>
        </div>

        {/* Launch offer banner */}
        <div className={`mb-12 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-gradient-to-r from-primary/10 to-amber-100/50 rounded-2xl p-6 text-center border border-primary/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-bold text-gray-900">Oferta de lanzamiento</span>
            </div>
            <p className="text-gray-600 mb-4">
              Los primeros <strong>30 usuarios</strong> obtienen <strong>3 meses de Pro gratis</strong>
            </p>
            
            {/* Progress bar */}
            <div className="max-w-xs mx-auto">
              <div className="h-3 bg-white rounded-full overflow-hidden border border-gray-200">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-amber-400 transition-all duration-1000 rounded-full"
                  style={{ width: `${(spotsTaken / totalSpots) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                {loading ? (
                  <span className="flex items-center gap-1 text-gray-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Cargando...
                  </span>
                ) : isAvailable ? (
                  <span className="text-primary font-bold">
                    ¡Quedan {spotsRemaining} plazas!
                  </span>
                ) : (
                  <span className="text-gray-500">Plazas agotadas</span>
                )}
                <span className="text-gray-400">{spotsTaken}/{totalSpots}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing cards */}
        <div className={`grid md:grid-cols-2 gap-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Free Plan */}
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gratis</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">0€</span>
                <span className="text-gray-500">/mes</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-8">
              {freePlanFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-gray-400" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <Link
              to="/signup"
              className="block w-full py-3 px-6 text-center bg-white text-gray-900 font-medium rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gray-900 rounded-3xl p-8 relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Sparky Pro</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">5€</span>
                    <span className="text-gray-400">/mes</span>
                  </div>
                </div>
                {isAvailable && (
                  <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-bold rounded-full">
                    3 meses gratis
                  </span>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {proPlanFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link
                to="/signup"
                className="group flex items-center justify-center gap-2 w-full py-3 px-6 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
              >
                {isAvailable ? 'Reclamar oferta' : 'Empezar ahora'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingV3;
