import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';

/**
 * Pricing Section - Planes + Oferta de lanzamiento
 */
const Pricing = () => {
  const freePlan = {
    name: 'Gratis',
    price: '0€',
    period: '/mes',
    features: [
      '10 ideas/mes',
      'Organización automática',
      'Conexiones básicas',
      'Voz + texto',
    ],
    cta: 'Empezar gratis',
    variant: 'outline' as const,
  };

  const proPlan = {
    name: 'Sparky Pro',
    price: 'X,XX€',
    period: '/mes',
    badge: 'Próximamente',
    features: [
      'Ideas ilimitadas',
      'Conexiones avanzadas',
      'Sugerencias diarias personalizadas',
      'Compañero proactivo',
      'Soporte prioritario',
    ],
    cta: 'Unirse a la lista',
    variant: 'default' as const,
  };

  const currentUsers = 42; // This would come from backend

  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Título */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
          Empieza gratis. Crece cuando lo necesites.
        </h2>
        <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
          Sin compromisos, sin sorpresas. Prueba Sparky y decide.
        </p>

        {/* Cards de pricing */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          {/* Free Plan */}
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl border-2 border-border p-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">{freePlan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-foreground">{freePlan.price}</span>
              <span className="text-muted-foreground">{freePlan.period}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {freePlan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-success shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="block">
              <Button variant="outline" className="w-full" size="lg">
                {freePlan.cta}
              </Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-b from-primary/10 to-card/60 backdrop-blur-sm rounded-2xl border-2 border-primary/50 p-8 relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
              {proPlan.badge}
            </Badge>
            <h3 className="text-2xl font-bold text-foreground mb-2">{proPlan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-foreground">{proPlan.price}</span>
              <span className="text-muted-foreground">{proPlan.period}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {proPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button className="w-full bg-primary hover:bg-primary/90" size="lg" disabled>
              {proPlan.cta}
            </Button>
          </div>
        </div>

        {/* Oferta de lanzamiento */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl border-2 border-primary/30 p-8 text-center max-w-2xl mx-auto">
          <Badge className="mb-4 bg-primary text-primary-foreground">
            <span className="mr-2">🔥</span>
            Oferta de lanzamiento
          </Badge>
          <p className="text-lg text-foreground mb-6">
            Los primeros <span className="font-bold">100 usuarios</span> tienen acceso completo a Sparky Pro 
            gratis durante <span className="font-bold">2 meses</span>. Sin compromiso. Sin tarjeta.
          </p>

          {/* Counter */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-card/80 rounded-lg px-6 py-3">
              <div className="text-3xl font-bold text-primary">{currentUsers}</div>
              <div className="text-xs text-muted-foreground">plazas ocupadas</div>
            </div>
            <div className="text-2xl text-muted-foreground">/</div>
            <div className="bg-card/80 rounded-lg px-6 py-3">
              <div className="text-3xl font-bold text-foreground">100</div>
              <div className="text-xs text-muted-foreground">plazas totales</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted/50 rounded-full h-3 mb-6">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all"
              style={{ width: `${(currentUsers / 100) * 100}%` }}
            />
          </div>

          <Link to="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
              <Sparkles className="w-5 h-5 mr-2" />
              Entrar antes de que se llene →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
