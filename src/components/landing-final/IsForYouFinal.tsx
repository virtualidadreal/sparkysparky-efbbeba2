import { Check, X } from 'lucide-react';

/**
 * Is For You Final - Target audience section
 */
const IsForYouFinal = () => {
  const forYou = [
    'Tienes ideas constantemente y no sabes dónde guardarlas',
    'Manejas múltiples proyectos a la vez',
    'Quieres un compañero que piense contigo, no solo que ejecute',
  ];

  const notForYou = [
    'Prefieres organizar manualmente con carpetas y etiquetas',
    'Solo quieres un chatbot genérico',
    'No estás dispuesto a alimentar a Sparky con tus ideas',
  ];

  return (
    <section className="py-32 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#FACD1A] tracking-wider uppercase mb-6">
            Descubre
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
            ¿Es para ti?
          </h2>
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* For You */}
          <div className="bg-emerald-50/50 rounded-3xl p-8 border border-emerald-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Sparky <span className="text-emerald-600">ES</span> para ti si:
            </h3>
            <ul className="space-y-4">
              {forYou.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not For You */}
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Sparky <span className="text-gray-400">NO</span> es para ti si:
            </h3>
            <ul className="space-y-4">
              {notForYou.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-gray-500 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IsForYouFinal;
