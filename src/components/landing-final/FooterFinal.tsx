import { Link } from 'react-router-dom';

/**
 * Footer Final - With logo image
 */
const FooterFinal = () => {
  return (
    <footer className="py-16 px-6 bg-white border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#FACD1A] flex items-center justify-center shadow-lg shadow-[#FACD1A]/20">
              <img
                src="/favicon.png"
                alt="Sparky"
                className="w-6 h-6"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden text-gray-900 text-lg font-bold">S</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Sparky</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacidad</Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">Términos</Link>
            <a href="mailto:hola@soysparky.com" className="hover:text-gray-900 transition-colors">Contacto</a>
            <a href="https://twitter.com/soysparky" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Twitter</a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Sparky</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterFinal;
