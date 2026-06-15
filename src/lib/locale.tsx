import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'es' | 'en';
export type Currency = 'ARS' | 'USD';

const LANG_KEY = 'modeltex_lang';
const CURRENCY_KEY = 'modeltex_currency';
const FALLBACK_ARS_PER_USD = 1450; // tasa de respaldo si falla la API

// Diccionario solo para inglés. Si falta la clave (o el idioma es 'es'),
// se usa el texto en español que se pasa como fallback en t(key, es).
const EN: Record<string, string> = {
  'nav.home': 'Home',
  'nav.catalog': 'Catalog',
  'nav.custom': 'Custom design',
  'nav.signin': 'Sign in',
  'nav.register': 'Create account',
  'nav.myaccount': 'My account',
  'nav.profile': 'My profile',
  'nav.orders': 'My orders',
  'nav.downloads': 'My downloads',
  'nav.admin': 'Admin panel',
  'nav.logout': 'Log out',

  'common.addToCart': 'Add to cart',
  'common.added': 'Added',
  'common.viewCatalog': 'View catalog',
  'common.offer': 'SALE',
  'common.noImage': 'No image',

  'cart.emptyTitle': 'Your cart is empty',
  'cart.emptySubtitle': 'Browse our catalog and find the patterns you need',
  'cart.keepShopping': 'Keep shopping',
  'cart.title': 'Shopping cart',
  'cart.summary': 'Order summary',
  'cart.total': 'Total',
  'cart.checkout': 'Go to checkout',
  'cart.clear': 'Empty cart',

  'footer.tagline': 'Professional digital sewing patterns ready to print and produce. Digital store for manufacturers, entrepreneurs and designers.',
  'footer.location': 'Argentina - Digital delivery worldwide',
  'footer.categories': 'Categories',
  'footer.formats': 'Available formats',
  'footer.fullCatalog': 'Full catalog',
  'footer.packs': 'Pattern packs',
  'footer.rights': 'All rights reserved.',

  'home.hero.badge': 'We ship worldwide',
  'home.hero.title': 'Digital clothing patterns to print and produce in any country',
  'home.hero.subtitle': 'Buy professional patterns in A4 PDF, plotter and editable formats. Modeltex sells digital files for textile entrepreneurs, manufacturers, workshops and apparel designers worldwide.',
  'home.featured.title': 'Featured products',
  'home.featured.subtitle': 'Discover our most popular patterns and bestsellers',
  'home.featured.viewAll': 'View full catalog',
  'home.testimonials.title': 'What our customers say',
  'home.testimonials.subtitle': 'Entrepreneurs, workshops and designers across Latin America already produce with Modeltex',
  'home.cta.title': 'Ready to get started?',
  'home.visual.title': 'Professional digital patternmaking',
  'home.visual.subtitle': 'Graded industrial patterns, ready to produce',
  'home.visual.cta': 'Instant download after payment',
  'trust.title': 'Shop with confidence',
  'trust.subtitle': 'Digital patterns for entrepreneurs, workshops and apparel manufacturers worldwide',
  'trust.instant.title': 'Instant download',
  'trust.instant.desc': 'As soon as payment is confirmed, you access your files from your account.',
  'trust.pro.title': 'Professional files',
  'trust.pro.desc': 'Patterns graded in every size, ready to print and produce.',
  'trust.support.title': 'After-sale support',
  'trust.support.desc': 'We help you over WhatsApp with printing and using the patterns.',
  'trust.secure.title': 'Secure checkout',
  'trust.secure.desc': 'Your data and payment protected. Shop with peace of mind.',
  'trust.worldwide': 'Digital delivery worldwide',
  'trust.formats': 'PDF A4, Plotter, DXF, CDR and PLT',
  'trust.access': 'Permanent access from your account',
  'catalog.empty.filtered.title': 'No patterns match those filters',
  'catalog.empty.filtered.desc': 'Try another category or format, or browse the full catalog.',
  'catalog.empty.filtered.cta': 'View full catalog',
  'catalog.empty.none.title': 'New patterns coming soon',
  'catalog.empty.none.desc': 'We are expanding the catalog. Need a specific pattern? Request it and we make it for you.',
  'catalog.empty.none.cta': 'Request a custom pattern',
};

interface LocaleContextType {
  lang: Lang;
  currency: Currency;
  setLang: (l: Lang) => void;
  setCurrency: (c: Currency) => void;
  t: (key: string, es: string) => string;
  formatPrice: (ars: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem(LANG_KEY) as Lang) || 'es');
  const [currency, setCurrencyState] = useState<Currency>(() => (localStorage.getItem(CURRENCY_KEY) as Currency) || 'ARS');
  const [rate, setRate] = useState<number>(FALLBACK_ARS_PER_USD);

  // Tasa de cambio en vivo (con fallback). Solo se usa para mostrar en USD.
  useEffect(() => {
    let cancelled = false;
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => {
        const ars = d?.rates?.ARS;
        if (!cancelled && typeof ars === 'number' && ars > 0) setRate(ars);
      })
      .catch(() => { /* se mantiene el fallback */ });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency);
  }, [currency]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const setCurrency = useCallback((c: Currency) => setCurrencyState(c), []);

  const t = useCallback((key: string, es: string) => {
    if (lang === 'en' && EN[key]) return EN[key];
    return es;
  }, [lang]);

  const formatPrice = useCallback((ars: number) => {
    if (currency === 'USD') {
      const usd = ars / rate;
      return 'US$ ' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '$' + Math.round(ars).toLocaleString('es-AR');
  }, [currency, rate]);

  return (
    <LocaleContext.Provider value={{ lang, currency, setLang, setCurrency, t, formatPrice }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
  return ctx;
}
