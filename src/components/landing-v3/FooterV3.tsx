import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

/**
 * Footer V3 - Simple y limpio
 */
const FooterV3 = () => {
  return (
    <footer className="py-12 px-6 bg-white border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-lg font-bold text-gray-900">Sparky</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-8">
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Privacidad
            </Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Términos
            </Link>
            <a href="mailto:hola@sparky.app" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Contacto
            </a>
          </nav>
        </div>

        <div className="mt-8 text-center sm:text-left">
          <p className="text-xs text-gray-400">© 2026 Sparky</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterV3;
