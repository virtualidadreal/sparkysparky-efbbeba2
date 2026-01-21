import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Flame } from 'lucide-react';
import sparkyLogo from '@/assets/sparky-logo.png';

const FooterV4 = () => {
  return (
    <footer className="py-12 px-6 bg-[#12121F]">
      <div className="max-w-5xl mx-auto">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={sparkyLogo} alt="Sparky" className="h-8 w-auto brightness-0 invert" />
          </Link>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/terms" className="text-[#FAFAFA]/60 hover:text-[#FFB800] transition-colors">
              Términos
            </Link>
            <Link to="/privacy" className="text-[#FAFAFA]/60 hover:text-[#FFB800] transition-colors">
              Privacidad
            </Link>
            <a href="mailto:hola@sparky.app" className="text-[#FAFAFA]/60 hover:text-[#FFB800] transition-colors">
              Contacto
            </a>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#FAFAFA]/10 flex items-center justify-center text-[#FAFAFA]/60 hover:bg-[#FFB800] hover:text-white transition-all"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#FAFAFA]/10 flex items-center justify-center text-[#FAFAFA]/60 hover:bg-[#FFB800] hover:text-white transition-all"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#FAFAFA]/10 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#FAFAFA]/40">
          <p>© 2026 Sparky by SAINI</p>
          <p className="flex items-center gap-1">
            Hecho con <Flame className="w-4 h-4 text-[#FF6B35]" /> por Fran
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterV4;
