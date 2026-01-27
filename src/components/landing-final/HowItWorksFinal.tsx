/**
 * How It Works Final - Light Linear Style
 */
const HowItWorksFinal = () => {
  const steps = [
    { number: '01', title: 'Captura', desc: 'Habla, escribe o graba. Sin formato. Sin estructura. Como te salga.' },
    { number: '02', title: 'Sparky trabaja', desc: 'Organiza, conecta con ideas anteriores y detecta patrones automáticamente.' },
    { number: '03', title: 'Tú actúas', desc: 'Cuando una idea es relevante, Sparky te avisa. Tú decides qué hacer.' },
  ];

  return (
    <section className="py-32 px-6 bg-[#FAFAF9] relative">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-sm font-semibold text-[#FACD1A] tracking-wider uppercase mb-6">
            Cómo funciona
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-gray-900 tracking-tight">
            Así de simple.
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="group flex gap-6 sm:gap-8 items-start p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 hover:border-[#FACD1A]/50 hover:shadow-lg hover:shadow-[#FACD1A]/10 transition-all duration-300"
            >
              {/* Number */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#FACD1A] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#FACD1A]/25">
                <span className="text-sm sm:text-base font-mono font-bold text-gray-900">{step.number}</span>
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksFinal;
