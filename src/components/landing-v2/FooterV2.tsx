import { Link } from 'react-router-dom';

/**
 * Footer Section V2 - Minimal y limpio
 */
const FooterV2 = () => {
  return (
    <footer className="py-12 px-6 border-t border-border/30">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="font-serif text-xl font-medium text-foreground">
            Sparky
          </div>

          {/* Links */}
          <nav className="flex items-center gap-8">
            <Link 
              to="/privacy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacidad
            </Link>
            <Link 
              to="/terms" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Términos
            </Link>
            <a 
              href="mailto:hola@sparky.app" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contacto
            </a>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center sm:text-left">
          <p className="text-xs text-muted-foreground/60">
            © 2026 Sparky
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterV2;
