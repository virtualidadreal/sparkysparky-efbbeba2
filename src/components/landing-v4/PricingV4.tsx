import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Zap } from 'lucide-react';

const PricingV4 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Simulated spots taken (would be dynamic in production)
  const spotsTaken = 12;
  const totalSpots = 50;

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
    'Conexiones básicas',
    'Voz + texto',
  ];

  const proPlanFeatures = [
    'Ideas ilimitadas',
    'Conexiones avanzadas',
    'Sugerencias diarias personalizadas',
    'Compañero proactivo',
    'Soporte prioritario',
  ];

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="py-24 px-6 bg-[#1A1A2E]"
    >
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <h2
          className={`font-serif text-3xl sm:text-4xl font-bold text-[#FAFAFA] text-center mb-4 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Empieza gratis. Crece cuando lo necesites.
        </h2>

        {/* Launch offer banner */}
        <div
          className={`bg-gradient-to-r from-[#FF6B35] to-[#FFB800] rounded-2xl p-6 mb-12 text-center transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-lg">OFERTA DE LANZAMIENTO</span>
          </div>
          <p className="text-white text-lg">
            Los primeros 50 usuarios tienen acceso completo a Sparky Pro{' '}
            <span className="font-bold">GRATIS durante 3 meses.</span>
          </p>
          <p className="text-white/80 text-sm mt-2">Sin compromiso. Sin tarjeta.</p>

          {/* Progress bar */}
          <div className="mt-4 max-w-xs mx-auto">
            <div className="flex justify-between text-sm text-white mb-1">
              <span>{spotsTaken}/{totalSpots} plazas ocupadas</span>
              <span>{totalSpots - spotsTaken} disponibles</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${(spotsTaken / totalSpots) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div
            className={`bg-[#12121F] rounded-2xl p-8 border border-[#FFB800]/10 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h3 className="text-xl font-bold text-[#FAFAFA] mb-2">Gratis</h3>
            <p className="text-[#636E72] mb-6">Para empezar a guardar chispas</p>
            <div className="text-4xl font-bold text-[#FAFAFA] mb-6">
              €0<span className="text-lg font-normal text-[#636E72]">/mes</span>
            </div>
            <ul className="space-y-3 mb-8">
              {freePlanFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-[#FAFAFA]/80">
                  <Check className="w-5 h-5 text-[#00B894]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="block w-full text-center py-3 px-6 rounded-xl border-2 border-[#FFB800]/30 text-[#FFB800] font-semibold hover:bg-[#FFB800]/10 transition-colors"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Pro Plan */}
          <div
            className={`relative bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB800]/10 rounded-2xl p-8 border-2 border-[#FF6B35] transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Popular badge */}
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-[#FF6B35] to-[#FFB800] px-4 py-1 rounded-full text-white text-sm font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              RECOMENDADO
            </div>

            <h3 className="text-xl font-bold text-[#FAFAFA] mb-2">Sparky Pro</h3>
            <p className="text-[#636E72] mb-6">Desbloquea todo el potencial</p>
            <div className="text-4xl font-bold text-[#FAFAFA] mb-2">
              €3.99<span className="text-lg font-normal text-[#636E72]">/mes</span>
            </div>
            <p className="text-sm text-[#FF6B35] mb-6">
              🔥 3 meses gratis para los primeros 50
            </p>
            <ul className="space-y-3 mb-8">
              {proPlanFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-[#FAFAFA]/80">
                  <Check className="w-5 h-5 text-[#FFB800]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="block w-full text-center py-3 px-6 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB800] text-white font-bold shadow-lg shadow-[#FF6B35]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Entrar antes de que se llene
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingV4;
