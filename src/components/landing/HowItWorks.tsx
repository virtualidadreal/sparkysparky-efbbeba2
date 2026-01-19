import { Mic, Sparkles, Link } from 'lucide-react';

/**
 * HowItWorks Section - 3 pasos simples
 */
const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      icon: Mic,
      title: 'Habla o escribe',
      description: 'Suelta tu idea, tarea o reflexión. Por voz o texto.',
    },
    {
      number: 2,
      icon: Sparkles,
      title: 'Sparky lo organiza',
      description: 'Categoriza, etiqueta y guarda automáticamente.',
    },
    {
      number: 3,
      icon: Link,
      title: 'Recibe conexiones',
      description: 'Sparky encuentra patrones y te sugiere acciones.',
    },
  ];

  return (
    <section className="py-24 px-6 bg-muted/20">
      <div className="max-w-5xl mx-auto">
        {/* Título */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
          Cómo funciona
        </h2>

        {/* Pasos */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Línea conectora (desktop) */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center">
              {/* Número y icono */}
              <div className="relative z-10 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-card border-2 border-primary flex items-center justify-center text-sm font-bold text-primary">
                  {step.number}
                </div>
              </div>

              {/* Contenido */}
              <h3 className="text-xl font-bold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Visual del resultado */}
        <div className="mt-16 bg-card/60 backdrop-blur-sm rounded-2xl border-2 border-border p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Ejemplo de conexión automática</span>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 text-foreground">
            <p className="text-sm">
              <span className="text-primary font-medium">💡 Idea guardada hace 3 meses:</span>
              <br />
              "Podcast sobre productividad para creativos"
            </p>
            <div className="my-3 flex items-center gap-2 text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              <Link className="w-4 h-4" />
              <div className="flex-1 h-px bg-border" />
            </div>
            <p className="text-sm">
              <span className="text-primary font-medium">📋 Proyecto nuevo:</span>
              <br />
              "Curso online de gestión del tiempo"
            </p>
          </div>
          <p className="mt-4 text-sm text-center text-muted-foreground italic">
            "Sparky detectó que ambos comparten audiencia y podrían complementarse"
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
