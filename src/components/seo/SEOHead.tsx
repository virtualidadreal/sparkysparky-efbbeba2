import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const BASE_URL = 'https://soysparky.com';
const DEFAULT_TITLE = 'Sparky - Tu Segundo Cerebro con IA';
const DEFAULT_DESCRIPTION = 'Sparky es tu compañero de IA que captura ideas por voz, conecta patrones automáticamente y te devuelve lo importante cuando lo necesitas.';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * SEOHead - Componente para meta tags dinámicos por página
 *
 * Usa document API directamente para compatibilidad con React 19.
 * Los meta tags base están en index.html, este componente los sobrescribe
 * para páginas específicas.
 */
export const SEOHead = ({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  jsonLd,
}: SEOHeadProps) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | Sparky` : DEFAULT_TITLE;
    const fullDescription = description || DEFAULT_DESCRIPTION;
    const fullCanonical = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
    const fullImage = ogImage || DEFAULT_IMAGE;

    // Title
    document.title = fullTitle;

    // Meta tags helper
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Link tags helper
    const setLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;

      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
    };

    // SEO Meta
    setMeta('description', fullDescription);
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setLink('canonical', fullCanonical);

    // Open Graph
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', fullDescription, true);
    setMeta('og:url', fullCanonical, true);
    setMeta('og:image', fullImage, true);
    setMeta('og:type', ogType, true);

    // Twitter
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', fullDescription);
    setMeta('twitter:image', fullImage);

    // JSON-LD dinámico
    if (jsonLd) {
      const existingScript = document.querySelector('script[data-seo-jsonld]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);

      return () => {
        script.remove();
      };
    }
  }, [title, description, canonical, ogImage, ogType, noindex, jsonLd]);

  return null;
};

export default SEOHead;
