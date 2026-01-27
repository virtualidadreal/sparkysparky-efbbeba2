/**
 * Testimonials Final - NUEVA SECCIÓN (Isra Bravo: testimonios que desactivan objeciones)
 */
const TestimonialsFinal = () => {
  const testimonials = [
    {
      quote: 'Al principio pensé "otra app más". Pero en 2 semanas Sparky me recordó una idea de hace meses que era EXACTAMENTE lo que necesitaba para un proyecto nuevo.',
      name: 'María G.',
      role: 'Product Manager',
      // Desactiva: "¿Otra app de notas más?"
    },
    {
      quote: 'Tengo Notion para documentación y Obsidian para notas. Sparky es diferente: es donde capturo todo rápido sabiendo que no se va a perder.',
      name: 'Carlos R.',
      role: 'Founder, SaaS',
      // Desactiva: "¿Qué pasa si ya tengo Notion/Obsidian?"
    },
    {
      quote: 'Lo uso principalmente con voz mientras conduzco. Antes perdía todas esas ideas. Ahora Sparky las tiene organizadas antes de llegar a la oficina.',
      name: 'Ana L.',
      role: 'Consultora',
      // Desactiva: "¿Funciona bien con voz?"
    },
  ];

  return (
    <section className="py-32 px-6 bg-white relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#FACD1A] tracking-wider uppercase mb-6">
            Testimonios
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4">
            Lo que dicen usuarios como tú
          </h2>
          <p className="text-xl text-gray-500">
            No lo decimos nosotros. Lo dicen ellos.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-[#FAFAF9] border border-gray-100 hover:border-[#FACD1A]/30 hover:shadow-lg hover:shadow-[#FACD1A]/5 transition-all duration-300"
            >
              {/* Quote */}
              <div className="mb-6">
                <span className="text-4xl text-[#FACD1A] font-serif">"</span>
              </div>
              <p className="text-gray-700 leading-relaxed mb-8">
                {testimonial.quote}
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsFinal;
