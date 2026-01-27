import { Ear, FolderSync, Link2, Bell, Lightbulb, Mic } from 'lucide-react';

/**
 * Solution Final Alt - Features como BENEFICIOS, no como lista (Isra Bravo)
 */
const SolutionFinalAlt = () => {
  // MEJORADO: Descripciones enfocadas en beneficios, no en features
  const features = [
    {
      icon: Ear,
      title: 'Reconoce',
      desc: 'Deja de explicar contexto. Sparky ya sabe de qué hablas.'
    },
    {
      icon: FolderSync,
      title: 'Organiza',
      desc: 'Nunca más perderás 20 minutos buscando "esa nota".'
    },
    {
      icon: Link2,
      title: 'Conecta',
      desc: 'Descubre que la idea de hoy y la de hace 3 meses eran la misma.'
    },
    {
      icon: Bell,
      title: 'Recuerda',
      desc: 'Esa idea olvidada aparece justo cuando la necesitas.'
    },
    {
      icon: Lightbulb,
      title: 'Sugiere',
      desc: 'No solo guarda. Te dice qué hacer con lo que piensas.'
    },
    {
      icon: Mic,
      title: 'Escucha',
      desc: 'Habla mientras caminas. Sparky hace el resto.'
    },
  ];

  return (
    <section className="py-32 px-6 bg-white relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FACD1A]/5 rounded-full blur-[150px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header - MANTENER */}
        <div className="text-center mb-20">
          <p className="text-gray-500 text-lg mb-4">Sparky no es una app de notas.</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-gray-900 tracking-tight">
            Es un compañero que
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">piensa contigo.</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#FACD1A]/40 -z-0" />
            </span>
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group p-8 rounded-2xl bg-[#FAFAF9] border border-gray-100 hover:border-[#FACD1A]/50 hover:shadow-lg hover:shadow-[#FACD1A]/10 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-[#FACD1A]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#FACD1A]/20 transition-colors">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SolutionFinalAlt;
