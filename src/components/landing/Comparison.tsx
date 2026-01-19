import { Check, X } from 'lucide-react';

/**
 * Comparison Section - Sparky vs Alternativas
 */
const Comparison = () => {
  const comparisons = [
    { feature: 'Organización', others: 'Tú organizas todo', sparky: 'Se organiza solo' },
    { feature: 'Estructura', others: 'Carpetas y subcarpetas', sparky: 'Solo 3: Ideas, Tareas, Diario' },
    { feature: 'Conexiones', others: 'Manuales (si te acuerdas)', sparky: 'Automáticas entre ideas' },
    { feature: 'Comportamiento', others: 'Pasivo (espera)', sparky: 'Proactivo (sugiere, recuerda)' },
    { feature: 'Input', others: 'Solo texto', sparky: 'Voz + texto' },
    { feature: 'Personalidad', others: 'Siempre de acuerdo', sparky: 'Te desafía cuando hace falta' },
    { feature: 'Contexto', others: 'No te conoce', sparky: 'Accede a TODO tu contexto' },
  ];

  return (
    <section className="py-24 px-6 bg-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Título */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
          No es otra app de notas.
        </h2>
        <p className="text-lg text-muted-foreground text-center mb-12">
          Es un compañero de IA que piensa contigo.
        </p>

        {/* Tabla de comparación */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border-2 border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 border-b border-border">
            <div className="font-bold text-foreground"></div>
            <div className="text-center font-bold text-muted-foreground">Otras apps</div>
            <div className="text-center font-bold text-primary">Sparky</div>
          </div>

          {/* Rows */}
          {comparisons.map((row, index) => (
            <div 
              key={index}
              className={`grid grid-cols-3 gap-4 p-4 ${index % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'} ${index !== comparisons.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className="font-medium text-foreground flex items-center">
                {row.feature}
              </div>
              <div className="text-center text-muted-foreground flex items-center justify-center gap-2">
                <X className="w-4 h-4 text-destructive/70 shrink-0 hidden sm:block" />
                <span className="text-sm">{row.others}</span>
              </div>
              <div className="text-center text-foreground flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-success shrink-0 hidden sm:block" />
                <span className="text-sm font-medium">{row.sparky}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Comparison;
