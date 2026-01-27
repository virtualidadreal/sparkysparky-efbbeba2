import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Flame, Sparkles } from 'lucide-react';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';

/**
 * Pricing Section V2 - Empieza gratis. Crece cuando lo necesites.
 * Con oferta de lanzamiento para los primeros 30
 */
const PricingV2 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { stats } = useEarlyAccess();
  
  const spotsUsed = stats?.spots_taken ?? 0;
  const maxSpots = stats?.total_spots ?? 30;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const spotsAvailable = Math.max(0, maxSpots - spotsUsed);

  const freePlan = [
    '10 ideas/mes',
    'Organización automática',
    'Conexiones básicas',
    'Voz + texto',
  ];

  const proPlan = [
    'Ideas ilimitadas',
    'Conexiones avanzadas',
    'Sugerencias diarias personalizadas',
    'Compañero proactivo',
    'Soporte prioritario',
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-32 md:py-40 px-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h2 
          className={`font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground text-center mb-16 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Empieza gratis. Crece cuando lo necesites.
        </h2>

        {/* Launch offer banner */}
        <div 
          className={`mb-12 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 md:p-8 text-center transition-all duration-700 ease-out delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-primary mb-3">
            <Zap className="w-5 h-5" />
            <span className="font-semibold text-sm uppercase tracking-wide">Oferta de Lanzamiento</span>
          </div>
          <p className="text-white text-lg md:text-xl mb-2">
            Los primeros 30 usuarios tienen acceso completo a Sparky Pro <span className="font-bold">GRATIS durante 3 meses.</span>
          </p>
          <p className="text-slate-400 text-sm mb-6">
            Sin compromiso. Sin tarjeta.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-300">
            <span>{spotsUsed}/{maxSpots} plazas ocupadas</span>
            <span className="text-primary font-medium">{spotsAvailable} disponibles</span>
          </div>
          <div className="mt-3 w-full max-w-xs mx-auto bg-slate-700 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(spotsUsed / maxSpots) * 100}%` }}
            />
          </div>
        </div>

        {/* Pricing cards */}
        <div 
          className={`grid md:grid-cols-2 gap-6 transition-all duration-700 ease-out delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Free plan */}
          <div className="p-8 rounded-2xl border border-border/50 bg-background">
            <h3 className="font-semibold text-xl text-foreground mb-2">Gratis</h3>
            <p className="text-muted-foreground text-sm mb-6">Para empezar a guardar chispas</p>
            
            <div className="flex items-baseline gap-1 mb-8">
              <span className="font-serif text-5xl font-medium text-foreground">€0</span>
              <span className="text-muted-foreground">/mes</span>
            </div>

            <ul className="space-y-4 mb-8">
              {freePlan.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-muted-foreground">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              to="/signup"
              className="block w-full py-3 text-center rounded-xl border-2 border-border text-foreground font-medium hover:bg-muted/50 transition-colors"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Pro plan */}
          <div className="p-8 rounded-2xl border-2 border-primary/50 bg-gradient-to-b from-slate-800 to-slate-900 relative">
            {/* Recommended badge */}
            <div className="absolute -top-3 right-6 px-3 py-1 bg-primary rounded-full flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span className="text-xs font-semibold text-primary-foreground uppercase">Recomendado</span>
            </div>

            <h3 className="font-semibold text-xl text-white mb-2">Sparky Pro</h3>
            <p className="text-slate-400 text-sm mb-6">Desbloquea todo el potencial</p>
            
            <div className="flex items-baseline gap-1 mb-2">
              <span className="font-serif text-5xl font-medium text-primary">€2,99</span>
              <span className="text-slate-400">/mes</span>
            </div>
            <p className="text-sm text-slate-500 mb-2">Precio de lanzamiento</p>
            
            <div className="flex items-center gap-2 text-primary text-sm mb-8">
              <Flame className="w-4 h-4" />
              <span>3 meses gratis para los primeros {maxSpots}</span>
            </div>

            <ul className="space-y-4 mb-8">
              {proPlan.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-200">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              to="/beta"
              className="block w-full py-3 text-center rounded-xl bg-gradient-to-r from-primary to-amber-500 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Entrar antes de que se llene
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingV2;
