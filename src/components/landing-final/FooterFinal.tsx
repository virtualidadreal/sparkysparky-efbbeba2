import { Link } from 'react-router-dom';
import sparkyLogo from '@/assets/sparky-logo.png';

/**
 * Footer Final - With Sparky yellow logo
 */
const FooterFinal = () => {
  return (
    <footer className="py-16 px-6 bg-white border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={sparkyLogo}
              alt="Sparky"
              className="h-10 w-auto"
            />
          </Link>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacidad</Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">Términos</Link>
            <a href="mailto:hola@soysparky.com" className="hover:text-gray-900 transition-colors">Contacto</a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Sparky</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterFinal;
