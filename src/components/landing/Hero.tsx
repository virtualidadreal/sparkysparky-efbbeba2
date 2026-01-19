import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

/**
 * Hero Section - Hook principal con CTA
 * Headline con dolor + promesa
 */
const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        {/* Badge de urgencia */}
        <Badge 
          variant="outline" 
          className="mb-8 px-4 py-2 text-sm font-medium bg-primary/10 border-primary/30 text-foreground"
        >
          <span className="mr-2">🔥</span>
          Los primeros 100 usuarios: acceso completo gratis
        </Badge>

        {/* Headline con dolor */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
          <span className="text-foreground">Tus mejores ideas se pierden.</span>
        </h1>

        {/* Headline con promesa */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Sparky las guarda, las conecta
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            y las convierte en acción.
          </span>
        </h2>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
          El compañero de IA que recuerda lo que tú olvidas.
        </p>

        {/* CTA principal */}
        <div className="flex flex-col items-center gap-4">
          <Link to="/signup">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Guardar mi primera chispa →
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Gratis hasta 10 ideas/mes. Sin tarjeta.
          </p>
        </div>

        {/* App mockup placeholder */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none h-full" />
          <div className="bg-card/60 backdrop-blur-xl rounded-2xl border-2 border-border p-8 shadow-2xl max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">🧠</div>
                <div className="bg-muted/50 rounded-lg px-4 py-2 text-left">
                  <p className="text-sm text-muted-foreground">Sparky</p>
                  <p className="text-foreground">Buenos días. He encontrado una conexión interesante: tu idea sobre el podcast de hace 3 meses encaja con el proyecto que empezaste ayer...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
