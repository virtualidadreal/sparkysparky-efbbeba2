import { MessageSquareQuote } from 'lucide-react';

/**
 * Proof Section - Testimonios
 */
const Proof = () => {
  const testimonials = [
    {
      quote: 'Ayer Sparky me conectó una idea de hace 2 meses con un proyecto que empecé esta semana. Llevaba meses ahí, esperando. Yo solo no la habría encontrado.',
      author: 'Fran',
      role: 'Creador de Sparky (sí, lo uso yo mismo)',
    },
  ];

  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Título */}
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-foreground">
          De usuarios reales:
        </h2>

        {/* Testimonios */}
        <div className="grid gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-card/60 backdrop-blur-sm rounded-2xl border-2 border-border p-8 relative"
            >
              <MessageSquareQuote className="absolute top-6 left-6 w-8 h-8 text-primary/30" />
              <blockquote className="text-lg sm:text-xl text-foreground mb-6 pl-12">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center gap-4 pl-12">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xl">
                  👨‍💻
                </div>
                <div>
                  <p className="font-bold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder para más testimonios */}
        <div className="mt-12 bg-muted/30 rounded-2xl border-2 border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">
            🚀 Pronto: testimonios de los primeros 100 usuarios
          </p>
        </div>
      </div>
    </section>
  );
};

export default Proof;
