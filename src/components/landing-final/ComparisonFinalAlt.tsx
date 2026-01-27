import { Check, X, Minus } from 'lucide-react';

/**
 * Comparison Final Alt - Con cierre mejorado (Isra Bravo)
 */
const ComparisonFinalAlt = () => {
  const comparisons = [
    {
      feature: 'Organización',
      featureDesc: '¿Quién hace el trabajo?',
      notion: { text: 'Manual', bad: true },
      notas: { text: 'Ninguna', bad: true },
      sparky: { text: 'Automática', good: true }
    },
    {
      feature: 'Conexiones',
      featureDesc: 'Entre tus ideas',
      notion: { text: 'Links manuales', bad: true },
      notas: { text: 'No existen', bad: true },
      sparky: { text: 'Automáticas', good: true }
    },
    {
      feature: 'Recordatorios',
      featureDesc: 'Cuándo te avisa',
      notion: { text: 'Tú configuras', neutral: true },
      notas: { text: 'Básicos', bad: true },
      sparky: { text: 'Inteligentes', good: true }
    },
    {
      feature: 'Captura por voz',
      featureDesc: 'Hablar para guardar',
      notion: { text: 'No nativo', bad: true },
      notas: { text: 'Solo transcribe', neutral: true },
      sparky: { text: 'Voice-first', good: true }
    },
    {
      feature: 'Curva de aprendizaje',
      featureDesc: 'Tiempo hasta usarlo bien',
      notion: { text: 'Semanas', bad: true },
      notas: { text: 'Minutos', good: true },
      sparky: { text: 'Cero', good: true }
    },
  ];

  return (
    <section className="py-32 px-6 bg-[#F8F7F4] relative">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#FACD1A] tracking-wider uppercase mb-6">
            Comparativa
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4">
            ¿Por qué Sparky?
          </h2>
          <p className="text-xl text-gray-500">
            La diferencia está en quién hace el trabajo.
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-4 border-b border-gray-200">
            <div className="p-6 bg-gray-50/50" />
            <div className="p-6 text-center border-l border-gray-200">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Notion</span>
            </div>
            <div className="p-6 text-center border-l border-gray-200">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Notas</span>
            </div>
            <div className="p-6 text-center border-l border-gray-200 bg-[#FACD1A]/10">
              <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Sparky</span>
            </div>
          </div>

          {/* Rows */}
          {comparisons.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
            >
              {/* Feature */}
              <div className="p-6 bg-gray-50/50">
                <p className="font-semibold text-gray-900">{row.feature}</p>
                <p className="text-sm text-gray-400 mt-0.5">{row.featureDesc}</p>
              </div>

              {/* Notion */}
              <div className="p-6 flex items-center justify-center border-l border-gray-50">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  row.notion.bad ? 'bg-red-50 text-red-600' :
                  row.notion.neutral ? 'bg-gray-100 text-gray-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {row.notion.bad && <X className="w-3.5 h-3.5" />}
                  {row.notion.neutral && <Minus className="w-3.5 h-3.5" />}
                  {row.notion.good && <Check className="w-3.5 h-3.5" />}
                  <span className="font-medium">{row.notion.text}</span>
                </div>
              </div>

              {/* Notas */}
              <div className="p-6 flex items-center justify-center border-l border-gray-50">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  row.notas.bad ? 'bg-red-50 text-red-600' :
                  row.notas.neutral ? 'bg-gray-100 text-gray-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {row.notas.bad && <X className="w-3.5 h-3.5" />}
                  {row.notas.neutral && <Minus className="w-3.5 h-3.5" />}
                  {row.notas.good && <Check className="w-3.5 h-3.5" />}
                  <span className="font-medium">{row.notas.text}</span>
                </div>
              </div>

              {/* Sparky */}
              <div className="p-6 flex items-center justify-center border-l border-gray-50 bg-[#FACD1A]/5">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-[#FACD1A]/20 text-gray-900">
                  <Check className="w-4 h-4 text-[#FACD1A]" strokeWidth={3} />
                  <span className="font-semibold">{row.sparky.text}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MEJORADO: Cierre más directo */}
        <p className="text-center mt-8 text-lg text-gray-900 font-medium">
          La pregunta no es cuál es mejor.
          <span className="text-gray-500 font-normal"> Es: ¿quién quieres que haga el trabajo?</span>
        </p>
      </div>
    </section>
  );
};

export default ComparisonFinalAlt;
