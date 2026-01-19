import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

/**
 * FinalCTA Section - Por qué Sparky + CTA final
 */
const FinalCTA = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-3xl mx-auto text-center">
        {/* Por qué el nombre */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
            ¿Por qué Sparky?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Cada pensamiento es una chispa.
            <br />
            La mayoría se apagan antes de convertirse en algo.
            <br /><br />
            <span className="text-foreground font-medium">
              Sparky las guarda, las protege, las conecta.
            </span>
            <br /><br />
            <span className="text-2xl">Y las convierte en fuego. 🔥</span>
          </p>
        </div>

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-2xl border-2 border-primary/30 p-10">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Tus ideas merecen algo mejor que una nota olvidada.
          </h3>

          <Link to="/signup">
            <Button 
              size="lg" 
              className="text-lg px-10 py-7 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/40 hover:scale-105"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              Guardar mi primera chispa →
            </Button>
          </Link>

          <p className="mt-4 text-muted-foreground">
            Gratis. Sin tarjeta. 10 ideas/mes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
