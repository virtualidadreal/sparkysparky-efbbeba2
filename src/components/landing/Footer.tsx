import { Link } from 'react-router-dom';
import { Sparkles, Linkedin, Mail } from 'lucide-react';

/**
 * Footer - Links y copyright
 */
const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-muted/30 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Sparky</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
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
              href="mailto:fran@sparky.app" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contacto
            </a>
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a 
              href="mailto:fran@sparky.app"
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Sparky. Hecho con ❤️ por Fran.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
