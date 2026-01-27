import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

/**
 * FAQ Final - Light Linear Style
 */
const FAQFinal = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { question: '¿Otra app de notas más?', answer: 'No. Sparky no es una app de notas. Las apps de notas son almacenes donde tú organizas todo. Sparky es un compañero que entiende lo que piensas, lo organiza automáticamente y te avisa cuando algo es relevante.' },
    { question: '¿Y mi privacidad?', answer: 'Tus datos son tuyos. Todo está cifrado end-to-end. No vendemos ni compartimos nada. Puedes exportar o borrar todo en cualquier momento.' },
    { question: '¿Funciona bien con voz?', answer: 'Sparky es voice-first. Hablas y él transcribe, entiende el contexto, clasifica y conecta con ideas anteriores. No es solo transcripción: es comprensión real.' },
    { question: '¿Qué pasa si ya tengo Notion/Obsidian?', answer: 'Sparky los complementa. Úsalo para captura rápida y conexiones automáticas. Exporta lo que quieras a tu sistema principal.' },
    { question: '¿Y si me quiero ir?', answer: 'Exportas todo en markdown o JSON. Sin dramas. Tus datos son tuyos, no rehenes.' },
    { question: '¿Por qué es tan barato?', answer: 'Estamos empezando y queremos usuarios que realmente lo usen y nos den feedback. Los early adopters mantienen el precio de por vida.' },
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

export default FAQFinal;
