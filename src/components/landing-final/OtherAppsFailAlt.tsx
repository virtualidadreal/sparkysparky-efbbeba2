import { X, Folder, Tag, Link2 } from 'lucide-react';

/**
 * Other Apps Fail Alt - Diseño mejorado con más impacto visual
 */
const OtherAppsFailAlt = () => {
  const painPoints = [
    { icon: Folder, label: 'Crear carpetas' },
    { icon: Tag, label: 'Poner etiquetas' },
    { icon: Link2, label: 'Conectar links' },
  ];

  return (
    <section className="py-32 px-6 bg-gradient-to-b from-white to-[#FAFAF9] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FACD1A]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Apps badges with crossed out effect */}
        <div className="flex justify-center gap-4 mb-16">
          {['Notion', 'Obsidian', 'Apple Notes'].map((app, i) => (
            <div
              key={i}
              className="group relative px-5 py-2.5 text-sm font-medium text-gray-400 bg-white border border-gray-200 rounded-full shadow-sm hover:border-gray-300 transition-all duration-300"
            >
              <span className="relative">
                {app}
                <span className="absolute left-0 top-1/2 w-full h-px bg-gray-300 -rotate-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>
          ))}
        </div>

        {/* Main headline */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-8 leading-[1.1]">
            El problema no es{' '}
            <span className="relative inline-block">
              capturar
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 10C50 2 150 2 198 10" stroke="#FACD1A" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h2>
          
          <p className="text-xl sm:text-2xl text-gray-600 mb-4">
            Es que luego <span className="font-semibold text-gray-900">tú</span> tienes que organizarlo todo.
          </p>
        </div>

        {/* Pain points as visual cards */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {painPoints.map((point, i) => (
            <div
              key={i}
              className="group flex items-center gap-3 px-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#FACD1A]/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-[#FACD1A]/10 transition-colors">
                <point.icon className="w-5 h-5 text-gray-400 group-hover:text-[#FACD1A] transition-colors" />
              </div>
              <span className="text-gray-600 font-medium">{point.label}</span>
            </div>
          ))}
        </div>

        {/* Central emphasis card */}
        <div className="max-w-lg mx-auto mb-16">
          <div className="relative p-10 rounded-3xl bg-gray-900 text-center overflow-hidden shadow-2xl">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-[#FACD1A]/20 rounded-full blur-[80px]" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
                <X className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Y no tienes tiempo.
              </p>
              <p className="text-lg text-gray-400">
                Al final, todo se queda ahí. <span className="text-gray-300">Muerto.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Honesty card - "Muestra tus defectos" */}
        <div className="max-w-2xl mx-auto">
          <div className="relative p-8 rounded-2xl bg-gradient-to-br from-[#FACD1A]/10 to-[#FACD1A]/5 border border-[#FACD1A]/20">
            <div className="absolute -top-3 left-8">
              <span className="px-3 py-1 text-xs font-bold bg-[#FACD1A] text-gray-900 rounded-full">
                Siendo honestos
              </span>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed pt-2">
              <span className="font-semibold text-gray-900">Sparky no es perfecto.</span>{' '}
              No te va a escribir tus ideas por ti.
            </p>
            <p className="text-lg text-gray-600 mt-2">
              Pero sí va a hacer{' '}
              <span className="font-semibold text-gray-900">el trabajo aburrido</span>{' '}
              que tú no quieres hacer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OtherAppsFailAlt;
