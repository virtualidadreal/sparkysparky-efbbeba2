import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

/**
 * FAQ Final Alt - Respuestas cortas + pregunta sobre precio (Isra Bravo)
 */
const FAQFinalAlt = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // MEJORADO: Respuestas más cortas (máximo 2-3 líneas)
  const faqs = [
    {
      question: '¿Otra app de notas más?',
      answer: 'No. Las apps de notas son almacenes. Tú organizas. Sparky es un compañero. Él organiza.'
    },
    {
      question: '¿Y mi privacidad?',
      answer: 'Cifrado end-to-end. No vendemos nada. Exporta o borra todo cuando quieras. Tus datos son tuyos.'
    },
    {
      question: '¿Funciona bien con voz?',
      answer: 'Es voice-first. Hablas, Sparky transcribe, entiende contexto y conecta con ideas anteriores. No solo transcripción: comprensión real.'
    },
    {
      question: '¿Qué pasa si ya tengo Notion/Obsidian?',
      answer: 'Sparky los complementa. Captura rápida aquí, exporta a tu sistema principal cuando quieras.'
    },
    {
      question: '¿Y si me quiero ir?',
      answer: 'Exportas todo en markdown o JSON. Sin dramas. Tus datos son tuyos, no rehenes.'
    },
    // NUEVO: Pregunta sobre precio (objeción común)
    {
      question: '¿5€/mes por una app de notas?',
      answer: 'No es una app de notas. Es un compañero que trabaja 24/7 para ti. ¿Cuánto vale no perder la próxima idea que podría cambiar tu negocio?'
    },
    {
      question: '¿Por qué es tan barato?',
      answer: 'Queremos early adopters que lo usen de verdad. A cambio, mantienen el precio para siempre.'
    },
  ];

  return (
    <section className="py-32 px-6 bg-white relative">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#FACD1A] tracking-wider uppercase mb-6">
            FAQ
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-gray-900 tracking-tight">
            Preguntas frecuentes
          </h2>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-300 ${
                openIndex === i ? 'bg-[#FAFAF9] border-gray-200' : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-gray-900 font-medium pr-4">{faq.question}</span>
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  openIndex === i ? 'bg-[#FACD1A] text-gray-900' : 'bg-gray-100 text-gray-500'
                }`}>
                  {openIndex === i ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="px-6 pb-6 text-gray-500 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQFinalAlt;
