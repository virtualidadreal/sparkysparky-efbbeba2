/**
 * Agitation Final Alt - Con Viaje del Villano (Isra Bravo)
 */
const AgitationFinalAlt = () => {
  const problems = [
    {
      title: 'La idea de las 3am',
      desc: 'Brillante en ese momento. Inexistente a la mañana siguiente.',
    },
    {
      title: 'La conexión obvia',
      desc: 'Que nunca hiciste porque tus notas viven en silos separados.',
    },
    {
      title: 'El proyecto fantasma',
      desc: 'Que nunca arrancó porque olvidaste el trigger que lo habría activado.',
    },
    // NUEVO: Card más emocional
    {
      title: 'El "ya lo tenía"',
      desc: 'La frustración de saber que ya habías pensado eso. Pero no recuerdas dónde ni cuándo.',
    },
  ];

  return (
    <section className="py-32 px-6 bg-gray-900 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FACD1A]/10 rounded-full blur-[150px]" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Headline - MANTENER */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight mb-4">
            Tu cerebro es increíble generando ideas.
          </h2>
          <p className="text-3xl sm:text-4xl font-semibold text-[#FACD1A]">
            Terrible guardándolas.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          {problems.map((problem, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FACD1A]/30 hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-2 h-2 bg-[#FACD1A] rounded-full mb-6" />
              <h3 className="text-xl font-medium text-white mb-3">{problem.title}</h3>
              <p className="text-gray-400 leading-relaxed">{problem.desc}</p>
            </div>
          ))}
        </div>

        {/* NUEVO: Viaje del Villano - qué pierdes si no actúas */}
        <div className="text-center p-8 rounded-2xl bg-[#FACD1A]/10 border border-[#FACD1A]/20 mb-8">
          <p className="text-xl sm:text-2xl text-white font-medium mb-2">
            Dentro de un año, ¿cuántas ideas más habrás perdido?
          </p>
          <p className="text-lg text-gray-400">
            ¿Cuántos proyectos seguirán siendo "algún día"?
          </p>
        </div>

        {/* Closing */}
        <div className="text-center">
          <p className="text-lg text-gray-500">
            El conocimiento que no puedes encontrar{' '}
            <span className="text-white">es conocimiento que no tienes.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default AgitationFinalAlt;
