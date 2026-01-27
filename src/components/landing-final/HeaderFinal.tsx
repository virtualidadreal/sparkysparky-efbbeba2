import { Link } from 'react-router-dom';
import sparkyLogo from '@/assets/sparky-logo.png';

/**
 * Header Final - Floating header with logo and login
 */
const HeaderFinal = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 lg:px-12 py-4">
      <div className="w-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={sparkyLogo}
            alt="Sparky"
            className="h-10 w-auto"
          />
        </Link>

        {/* Login button */}
        <Link
          to="/auth"
          className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full hover:bg-white hover:text-gray-900 hover:border-gray-300 transition-all duration-200 shadow-sm"
        >
          Iniciar sesión
        </Link>
      </div>
    </header>
  );
};

export default HeaderFinal;
