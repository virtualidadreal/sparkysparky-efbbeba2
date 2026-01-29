/**
 * JSON-LD Schema generators para GEO (Generative Engine Optimization)
 *
 * Estos schemas ayudan a LLMs y motores de búsqueda a entender
 * mejor el contenido de cada página.
 */

const BASE_URL = 'https://soysparky.com';

/**
 * Schema para artículos de blog
 */
export const createArticleSchema = ({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName = 'Sparky',
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  url: `${BASE_URL}${url}`,
  image: image || `${BASE_URL}/og-image.png`,
  datePublished,
  dateModified: dateModified || datePublished,
  author: {
    '@type': 'Person',
    name: authorName,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Sparky',
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/favicon.png`,
    },
  },
});

/**
 * Schema para páginas de producto/feature
 */
export const createProductSchema = ({
  name,
  description,
  image,
  price = '0',
  priceCurrency = 'EUR',
}: {
  name: string;
  description: string;
  image?: string;
  price?: string;
  priceCurrency?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name,
  description,
  image: image || `${BASE_URL}/og-image.png`,
  brand: {
    '@type': 'Brand',
    name: 'Sparky',
  },
  offers: {
    '@type': 'Offer',
    price,
    priceCurrency,
    availability: 'https://schema.org/InStock',
  },
});

/**
 * Schema para páginas HowTo (tutoriales/guías)
 */
export const createHowToSchema = ({
  name,
  description,
  steps,
  totalTime,
}: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  totalTime?: string; // ISO 8601 duration, e.g., "PT5M" for 5 minutes
}) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name,
  description,
  totalTime,
  step: steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.name,
    text: step.text,
    image: step.image,
  })),
});

/**
 * Schema para FAQs específicas de una página
 */
export const createFAQSchema = (
  faqs: Array<{ question: string; answer: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

/**
 * Schema para breadcrumbs
 */
export const createBreadcrumbSchema = (
  items: Array<{ name: string; url: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${BASE_URL}${item.url}`,
  })),
});

/**
 * Schema para la página de precios
 */
export const createPricingSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Sparky',
  description: 'Tu segundo cerebro con IA para capturar ideas y encontrar conexiones',
  brand: {
    '@type': 'Brand',
    name: 'Sparky',
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Plan Gratuito',
      price: '0',
      priceCurrency: 'EUR',
      description: '10 ideas al mes, captura por voz y texto',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Plan Premium',
      price: '9.99',
      priceCurrency: 'EUR',
      priceValidUntil: '2026-12-31',
      description: 'Ideas ilimitadas, 5 cerebros IA, conexiones automáticas',
      availability: 'https://schema.org/InStock',
    },
  ],
});
