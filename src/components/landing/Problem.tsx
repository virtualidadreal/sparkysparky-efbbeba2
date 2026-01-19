/**
 * Problem Section - El dolor cuantificado
 */
const Problem = () => {
  const stats = [
    { number: '47', label: 'notas en el móvil', sublabel: '(no sabes qué hay en 43)' },
    { number: '12', label: 'documentos abiertos', sublabel: '(sin revisar)' },
    { number: '∞', label: 'ideas perdidas', sublabel: '(que podrían haber sido algo)' },
  ];

  return (
    <section className="py-24 px-6 bg-muted/20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline de problema */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-foreground">
          El 90% de tus ideas nunca llegan a nada.
        </h2>

        {/* Explicación empática */}
        <div className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-16 space-y-4">
          <p className="font-medium text-foreground">No porque sean malas.</p>
          <p>
            Sino porque las apuntas en una nota, las olvidas en una carpeta, 
            o directamente se evaporan antes de que llegues a escribirlas.
          </p>
        </div>

        {/* Stats de dolor */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-card/60 backdrop-blur-sm rounded-2xl border-2 border-border p-8 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="text-5xl sm:text-6xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-medium text-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.sublabel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
