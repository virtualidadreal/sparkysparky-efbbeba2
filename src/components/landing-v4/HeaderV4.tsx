import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import sparkyLogo from '@/assets/sparky-logo.png';

const HeaderV4 = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FFF8F0]/90 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={sparkyLogo} alt="Sparky" className="h-8 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('como-funciona')}
            className="text-[#2D3436] hover:text-[#FF6B35] transition-colors font-medium"
          >
            Cómo funciona
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="text-[#2D3436] hover:text-[#FF6B35] transition-colors font-medium"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="text-[#2D3436] hover:text-[#FF6B35] transition-colors font-medium"
          >
            FAQ
          </button>
          <Link
            to="/signup"
            className="bg-gradient-to-r from-[#FF6B35] to-[#FFB800] text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-[#FF6B35]/30 hover:shadow-xl hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            Empezar gratis
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-[#2D3436] p-2"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#FFF8F0] border-t border-[#FFB800]/20 px-6 py-4 space-y-4">
          <button
            onClick={() => scrollToSection('como-funciona')}
            className="block w-full text-left text-[#2D3436] hover:text-[#FF6B35] py-2 font-medium"
          >
            Cómo funciona
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="block w-full text-left text-[#2D3436] hover:text-[#FF6B35] py-2 font-medium"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="block w-full text-left text-[#2D3436] hover:text-[#FF6B35] py-2 font-medium"
          >
            FAQ
          </button>
          <Link
            to="/signup"
            className="block w-full text-center bg-gradient-to-r from-[#FF6B35] to-[#FFB800] text-white px-6 py-3 rounded-xl font-semibold"
          >
            Empezar gratis
          </Link>
        </div>
      )}
    </header>
  );
};

export default HeaderV4;
