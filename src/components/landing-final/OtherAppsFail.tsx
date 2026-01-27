/**
 * Other Apps Fail - Light Linear Style
 */
const OtherAppsFail = () => {
  return (
    <section className="py-32 px-6 bg-[#FAFAF9] relative">
      <div className="max-w-3xl mx-auto text-center">
        {/* Apps */}
        <div className="flex justify-center gap-3 mb-12">
          {['Notion', 'Obsidian', 'Apple Notes'].map((app, i) => (
            <span
              key={i}
              className="px-4 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-full"
            >
              {app}
            </span>
          ))}
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-gray-900 tracking-tight mb-6">
          El problema no es capturar.
        </h2>

        {/* Copy */}
        <div className="space-y-6 text-xl text-gray-500 mb-12">
          <p>
            Es que luego <span className="text-gray-900 font-medium">tú</span> tienes que organizarlo todo.
          </p>
          <p className="text-gray-400">
            Crear carpetas. Poner etiquetas. Conectar links.
          </p>
        </div>

        {/* Emphasis */}
        <div className="inline-block p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <p className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Y no tienes tiempo.
          </p>
          <p className="text-lg text-gray-500 mt-2">
            Al final, todo se queda ahí. Muerto.
          </p>
        </div>
      </div>
    </section>
  );
};

export default OtherAppsFail;
