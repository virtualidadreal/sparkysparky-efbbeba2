/**
 * Problem Final - Light Linear Style
 * White cards, yellow accents
 */
const ProblemFinal = () => {
  const stats = [
    { number: '47', label: 'notas en el móvil', sublabel: 'No sabes qué hay en 43' },
    { number: '12', label: 'apps diferentes', sublabel: 'Ninguna habla con otra' },
    { number: '∞', label: 'conexiones perdidas', sublabel: 'Que podrían haber sido algo' },
  ];

  return (
    <section className="py-32 px-6 bg-white relative">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="max-w-4xl mx-auto text-center">
        {/* Label */}
        <p className="text-sm font-semibold text-[#FACD1A] tracking-wider uppercase mb-6">
          El problema
        </p>

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-gray-900 tracking-tight mb-6 leading-tight">
          El 90% de tus mejores ideas
          <br />
          <span className="text-gray-400">mueren en 24 horas.</span>
        </h2>

        {/* Copy */}
        <div className="space-y-2 mb-20">
          <p className="text-xl text-gray-900">No porque sean malas.</p>
          <p className="text-xl text-gray-500">Sino porque las anotas en un lugar que nunca vuelves a abrir.</p>
        </div>

        {/* Stats grid */}
        <div className="grid sm:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl bg-[#FAFAF9] border border-gray-100 hover:border-[#FACD1A]/50 hover:shadow-lg hover:shadow-[#FACD1A]/10 transition-all duration-300"
            >
              <span className="text-5xl sm:text-6xl font-semibold text-gray-900 block mb-4">
                {stat.number}
              </span>
              <p className="text-gray-900 font-medium mb-1">{stat.label}</p>
              <p className="text-sm text-gray-400">{stat.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemFinal;
