import { Link } from 'react-router-dom';

/**
 * Header Final - Floating header with logo and login
 */
const HeaderFinal = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 lg:px-12 py-4">
      <div className="w-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#FACD1A] flex items-center justify-center shadow-lg shadow-[#FACD1A]/20 group-hover:shadow-[#FACD1A]/40 transition-shadow">
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
