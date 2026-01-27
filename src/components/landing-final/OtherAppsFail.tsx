import { motion } from 'framer-motion';

/**
 * Other Apps Fail - Redesigned with more visual impact
 */
const OtherAppsFail = () => {
  const apps = [
    { name: 'Notion', icon: '📝' },
    { name: 'Obsidian', icon: '💎' },
    { name: 'Apple Notes', icon: '📒' },
  ];

  const tasks = [
    { text: 'Crear carpetas', delay: 0 },
    { text: 'Poner etiquetas', delay: 0.1 },
    { text: 'Conectar links', delay: 0.2 },
    { text: 'Organizar todo', delay: 0.3 },
  ];

  return (
    <section className="py-32 px-6 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Apps badges with hover effects */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {apps.map((app, i) => (
            <motion.span
              key={i}
              className="group px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-default flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-lg">{app.icon}</span>
              {app.name}
            </motion.span>
          ))}
        </motion.div>

        {/* Main headline with animation */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">
            El problema no es{' '}
            <span className="relative">
              capturar
              <motion.span 
                className="absolute -bottom-2 left-0 w-full h-1 bg-[#FACD1A] rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.4 }}
              />
            </span>
            .
          </h2>
          
          <motion.p 
            className="text-xl sm:text-2xl text-gray-500 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Es que luego <span className="text-gray-900 font-semibold">tú</span> tienes que organizarlo todo.
          </motion.p>
        </motion.div>

        {/* Task list with staggered animation */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          {tasks.map((task, i) => (
            <motion.div
              key={i}
              className="px-4 py-2 text-gray-400 bg-gray-100/80 rounded-lg text-sm font-medium line-through decoration-gray-300"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + task.delay, duration: 0.3 }}
            >
              {task.text}
            </motion.div>
          ))}
        </motion.div>

        {/* Emphasis card with gradient border */}
        <motion.div 
          className="max-w-lg mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="relative p-[2px] rounded-3xl bg-gradient-to-br from-red-200 via-orange-200 to-yellow-200">
            <div className="bg-white rounded-3xl p-10 text-center">
              <motion.div
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center"
                initial={{ rotate: 0 }}
                whileInView={{ rotate: [0, -5, 5, 0] }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <span className="text-3xl">⏰</span>
              </motion.div>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Y no tienes tiempo.
              </h3>
              <p className="text-lg text-gray-500">
                Al final, todo se queda ahí.{' '}
                <span className="text-red-400 font-medium">Muerto.</span>
              </p>
              
              {/* Decorative skulls */}
              <div className="flex justify-center gap-2 mt-6 opacity-30">
                <span className="text-2xl">💀</span>
                <span className="text-2xl">💀</span>
                <span className="text-2xl">💀</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom connector arrow */}
        <motion.div 
          className="flex justify-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
        >
          <div className="w-px h-16 bg-gradient-to-b from-gray-300 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
};

export default OtherAppsFail;
