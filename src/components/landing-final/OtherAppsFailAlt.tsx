/**
 * Other Apps Fail Alt - Con técnica "Muestra tus defectos" (Isra Bravo)
 */
const OtherAppsFailAlt = () => {
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

        {/* Headline - MANTENER */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-gray-900 tracking-tight mb-6">
          El problema no es capturar.
        </h2>

        {/* Copy - MANTENER */}
        <div className="space-y-6 text-xl text-gray-500 mb-12">
          <p>
            Es que luego <span className="text-gray-900 font-medium">tú</span> tienes que organizarlo todo.
          </p>
          <p className="text-gray-400">
            Crear carpetas. Poner etiquetas. Conectar links.
          </p>
        </div>

        {/* Emphasis - MANTENER */}
        <div className="inline-block p-8 rounded-2xl bg-white border border-gray-200 shadow-sm mb-12">
          <p className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Y no tienes tiempo.
          </p>
          <p className="text-lg text-gray-500 mt-2">
            Al final, todo se queda ahí. Muerto.
          </p>
        </div>

        {/* NUEVO: Técnica "Muestra tus defectos" */}
        <div className="p-6 rounded-xl bg-gray-100 border border-gray-200">
          <p className="text-gray-600 leading-relaxed">
            <span className="font-medium text-gray-900">Sparky no es perfecto.</span> No te va a escribir tus ideas por ti.
            <br />
            Pero sí va a hacer el trabajo aburrido que tú no quieres hacer.
          </p>
        </div>
      </div>
    </section>
  );
};

export default OtherAppsFailAlt;
