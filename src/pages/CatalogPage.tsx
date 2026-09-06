import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  PackageOpen,
  Sparkles,
  Sun,
  Snowflake,
  CalendarDays,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import { FloatingPatterns } from '../components/ui/FloatingPatterns';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ui/ProductCard';
import { useSeo } from '../lib/seo';
import { useLocale } from '../lib/locale';
import type { Product, ProductCategory } from '../lib/types';
import { CATEGORIES, FORMATS } from '../lib/types';
import { isPromoActive } from '../lib/promo';

type SortOption = 'reciente' | 'precio_asc' | 'precio_desc' | 'nombre';
type SmartIntent = {
  category: ProductCategory | '';
  format: string;
  season: string;
  labels: string[];
  tokens: string[];
  correctedQuery: string;
  corrected: boolean;
};

type SearchSuggestion = {
  label: string;
  value: string;
  hint: string;
};

const SEASON_OPTIONS = [
  { value: '', label: 'Todas', Icon: CalendarDays },
  { value: 'verano', label: 'Verano', Icon: Sun },
  { value: 'invierno', label: 'Invierno', Icon: Snowflake },
  { value: 'todo-el-anio', label: 'Todo el ano', Icon: CalendarDays },
] as const;

const SORT_LABELS: Record<SortOption, string> = {
  reciente: 'Variado',
  precio_asc: 'Menor precio',
  precio_desc: 'Mayor precio',
  nombre: 'Nombre A-Z',
};

/** Hash simple y estable de un string a un numero (no aleatorio real: mismo id, mismo resultado siempre). */
const hashId = (id: string): number => {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return h;
};

const SMART_SEARCH_EXAMPLES = [
  'short nina verano',
  'buzo oversize frisa',
  'remera hombre pdf a4',
  'bebe sublimacion',
  'pantalon nino invierno',
];

const CATEGORY_ALIASES: Record<ProductCategory, string[]> = {
  dama: ['dama', 'mujer', 'mujeres', 'femenino'],
  hombre: ['hombre', 'hombres', 'masculino', 'caballero'],
  nina: ['nina', 'ninas', 'nena', 'nenas', 'chica', 'chicas', 'niia', 'nias'],
  nino: ['nino', 'ninos', 'nene', 'nenes', 'varon', 'varones', 'nio', 'nios'],
  bebes: ['bebe', 'bebes', 'bb', 'baby', 'bebesito'],
  'adultos-unisex': ['adulto', 'adultos', 'unisex'],
  'ninos-unisex': ['infantil', 'infantiles', 'unisex ninos', 'unisex nino'],
};

const FORMAT_ALIASES: Array<{ value: string; aliases: string[] }> = [
  { value: 'PDF A4', aliases: ['pdf a4', 'a4', 'hoja a4', 'imprimir en casa'] },
  { value: 'PDF Plotter', aliases: ['plotter', 'ploter', 'pdf plotter', 'pdf ploter', 'rollo'] },
  { value: 'PLT', aliases: ['plt'] },
  { value: 'DXF', aliases: ['dxf', 'cad', 'aama', 'gerber', 'lectra'] },
  { value: 'PDS (Optitex)', aliases: ['pds', 'optitex'] },
  { value: 'MRK (Tizado)', aliases: ['mrk', 'tizado', 'marker'] },
  { value: 'ADS (Audaces)', aliases: ['audaces'] },
  { value: 'CDR', aliases: ['cdr', 'corel', 'coreldraw'] },
  { value: 'Sublimacion', aliases: ['sublimacion', 'sublimar', 'sublimable', 'subli'] },
];

const SEASON_ALIASES = [
  { value: 'verano', aliases: ['verano', 'calor'] },
  { value: 'invierno', aliases: ['invierno', 'frio', 'abrigo'] },
  { value: 'todo-el-anio', aliases: ['todo el ano', 'todo ano', 'todo uso'] },
];

const TOKEN_CORRECTIONS: Record<string, string> = {
  ploter: 'plotter',
  buso: 'buzo',
  buzos: 'buzo',
  niia: 'nina',
  niias: 'ninas',
  nio: 'nino',
  nios: 'ninos',
  bebesito: 'bebe',
  subimacion: 'sublimacion',
  subtimacion: 'sublimacion',
  oversise: 'oversize',
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const applyTokenCorrections = (query: string) => {
  const normalized = normalizeText(query);
  if (!normalized) return { correctedQuery: '', corrected: false };

  const correctedTokens = normalized.split(' ').map((token) => TOKEN_CORRECTIONS[token] || token);
  const correctedQuery = correctedTokens.join(' ').trim();
  return { correctedQuery, corrected: correctedQuery !== normalized };
};

const getLowestPrice = (product: Product) => {
  const values = [
    product.sale_price,
    product.precio_pdf_a4,
    product.precio_pdf_ploter,
    product.precio_carton,
    product.price,
  ].filter((value): value is number => value != null && value > 0);

  return values.length ? Math.min(...values) : Number.MAX_SAFE_INTEGER;
};

const inferSmartIntent = (query: string): SmartIntent => {
  const { correctedQuery, corrected } = applyTokenCorrections(query);
  if (!correctedQuery) {
    return { category: '', format: '', season: '', labels: [], tokens: [], correctedQuery: '', corrected: false };
  }

  const labels: string[] = [];
  let inferredCategory: ProductCategory | '' = '';
  let inferredFormat = '';
  let inferredSeason = '';

  for (const [categoryValue, aliases] of Object.entries(CATEGORY_ALIASES) as Array<[ProductCategory, string[]]>) {
    if (aliases.some((alias) => correctedQuery.includes(alias))) {
      inferredCategory = categoryValue;
      const label = CATEGORIES.find((item) => item.value === categoryValue)?.label;
      if (label) labels.push(label);
      break;
    }
  }

  for (const item of FORMAT_ALIASES) {
    if (item.aliases.some((alias) => correctedQuery.includes(alias))) {
      inferredFormat = item.value;
      labels.push(item.value);
      break;
    }
  }

  for (const item of SEASON_ALIASES) {
    if (item.aliases.some((alias) => correctedQuery.includes(alias))) {
      inferredSeason = item.value;
      const seasonLabel = SEASON_OPTIONS.find((option) => option.value === item.value)?.label;
      if (seasonLabel) labels.push(seasonLabel);
      break;
    }
  }

  const tokens = correctedQuery.split(' ').filter((token) => token.length > 1);
  return { category: inferredCategory, format: inferredFormat, season: inferredSeason, labels, tokens, correctedQuery, corrected };
};

const getProductSearchText = (product: Product) => {
  const categoryAliases = CATEGORY_ALIASES[product.category] || [];
  return normalizeText([
    product.name,
    product.short_description,
    product.long_description,
    product.garment_type,
    product.codigo || '',
    product.category,
    categoryAliases.join(' '),
    (product.categories || []).join(' '),
    (product.formats || []).join(' '),
    (product.sizes || []).join(' '),
    (product.recommended_fabrics || []).join(' '),
    product.season || '',
  ].join(' '));
};

const scoreProduct = (product: Product, query: string, intent: SmartIntent) => {
  const normalizedQuery = intent.correctedQuery || normalizeText(query);
  if (!normalizedQuery) return 0;

  const normalizedName = normalizeText(product.name);
  const normalizedGarment = normalizeText(product.garment_type || '');
  const normalizedDesc = normalizeText(`${product.short_description || ''} ${product.long_description || ''}`);
  const searchText = getProductSearchText(product);

  let score = 0;

  if (normalizedName.includes(normalizedQuery)) score += 18;
  if (normalizedGarment.includes(normalizedQuery)) score += 12;
  if (normalizedDesc.includes(normalizedQuery)) score += 8;

  for (const token of intent.tokens) {
    if (normalizedName.includes(token)) score += 7;
    else if (normalizedGarment.includes(token)) score += 5;
    else if (normalizedDesc.includes(token)) score += 3;
    else if (searchText.includes(token)) score += 2;
  }

  if (intent.category && product.category === intent.category) score += 8;
  if (product.is_featured) score += 4;
  if (intent.season && (product.season || 'todo-el-anio') === intent.season) score += 6;
  if (intent.format && (product.formats || []).includes(intent.format)) score += 6;

  return score;
};

const sortProducts = (items: Product[], sort: SortOption) => {
  const sorted = [...items];
  switch (sort) {
    case 'precio_asc':
      sorted.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
      break;
    case 'precio_desc':
      sorted.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
      break;
    case 'nombre':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      break;
    default:
      // Orden mezclado y estable (no por fecha de subida): usa un hash del id
      // asi el mismo producto siempre cae en la misma posicion relativa, pero
      // sin agrupar por categoria ni por tanda de carga.
      sorted.sort((a, b) => hashId(a.id) - hashId(b.id));
      break;
  }
  return sorted;
};

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { t } = useLocale();

  const category = (searchParams.get('categoria') || '') as ProductCategory | '';
  const format = searchParams.get('formato') || '';
  const sort = (searchParams.get('orden') || 'reciente') as SortOption;
  const busqueda = searchParams.get('busqueda') || '';
  const temporada = searchParams.get('temporada') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const buildQuery = (useCategoriesArray: boolean) => {
      let query = supabase.from('products').select('*').eq('is_active', true);
      if (category) {
        query = useCategoriesArray
          ? query.or(`categories.cs.{${category}},category.eq.${category}`)
          : query.eq('category', category);
      }
      if (format) {
        query = query.contains('formats', [format]);
      }
      return query;
    };

    try {
      let { data, error } = await buildQuery(true);
      if (error && /categories/i.test(error.message || '')) {
        ({ data, error } = await buildQuery(false));
      }
      if (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } else {
        setProducts(((data as Product[]) || []).filter((product) => !isPromoActive(product)));
      }
    } catch (err) {
      console.error('Unexpected error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, format]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSearch(busqueda);
  }, [busqueda]);

  // Si venimos de un link con busqueda ya cargada (ej. sugerencia del home), mostramos el buscador abierto en mobile.
  useEffect(() => {
    if (busqueda) setMobileSearchOpen(true);
  }, [busqueda]);

  const buildSearchParams = (value: string, replaceDetectedFilters: boolean) => {
    const params = new URLSearchParams(searchParams);
    const trimmed = value.trim();

    if (trimmed) {
      const intent = inferSmartIntent(trimmed);
      const finalQuery = intent.correctedQuery || trimmed;
      params.set('busqueda', finalQuery);

      if (intent.category && (replaceDetectedFilters || !category)) {
        params.set('categoria', intent.category);
      }
      if (intent.format && (replaceDetectedFilters || !format)) {
        params.set('formato', intent.format);
      }
      if (intent.season && (replaceDetectedFilters || !temporada)) {
        params.set('temporada', intent.season);
      }
    } else {
      params.delete('busqueda');
      if (replaceDetectedFilters) {
        params.delete('categoria');
        params.delete('formato');
        params.delete('temporada');
      }
    }

    return params;
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params, { replace: true });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(buildSearchParams(search, false), { replace: true });
  };

  const runSuggestedSearch = (value: string) => {
    const intent = inferSmartIntent(value);
    setSearch(intent.correctedQuery || value);
    setSearchParams(buildSearchParams(value, true), { replace: true });
  };

  const clearFilters = () => {
    setSearch('');
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = Boolean(category || format || busqueda || temporada);
  const activeFiltersCount = [category, format, busqueda, temporada].filter(Boolean).length;

  const seasonMatches = (product: Product): boolean => {
    if (!temporada) return true;
    const season = product.season || 'todo-el-anio';
    if (temporada === 'todo-el-anio') return season === 'todo-el-anio';
    return season === temporada || season === 'todo-el-anio';
  };

  const smartIntent = useMemo(() => inferSmartIntent(busqueda), [busqueda]);
  const liveIntent = useMemo(() => inferSmartIntent(search), [search]);

  const visibleProducts = useMemo(() => {
    const seasonalProducts = products.filter(seasonMatches);
    const sortedBase = sortProducts(seasonalProducts, sort);

    if (!busqueda.trim()) {
      return sortedBase;
    }

    return seasonalProducts
      .map((product) => ({ product, score: scoreProduct(product, busqueda, smartIntent) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return sortProducts([a.product, b.product], sort)[0].id === a.product.id ? -1 : 1;
      })
      .map((item) => item.product);
  }, [products, busqueda, smartIntent, sort, temporada]);

  const liveSuggestions = useMemo(() => {
    const query = liveIntent.correctedQuery;
    if (!query || query.length < 2) return [] as SearchSuggestion[];

    const fromExamples = SMART_SEARCH_EXAMPLES
      .filter((example) => normalizeText(example).includes(query))
      .map((example) => ({ label: example, value: example, hint: t('catalog.suggestedHint', 'Busqueda sugerida') }));

    const fromProducts = products
      .map((product) => ({
        product,
        score: scoreProduct(product, query, liveIntent),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ product }) => ({
        label: product.name,
        value: `${product.garment_type || product.name} ${product.category}`,
        hint: `${product.category.replace('-', ' ')}${product.formats?.[0] ? ` · ${product.formats[0]}` : ''}`,
      }));

    return [...fromExamples, ...fromProducts]
      .filter((item, index, list) => list.findIndex((candidate) => candidate.label === item.label) === index)
      .slice(0, 6);
  }, [liveIntent, products, t]);

  const currentCategoryLabel = CATEGORIES.find((item) => item.value === category)?.label || 'Todos los productos';
  const currentSeasonLabel = SEASON_OPTIONS.find((item) => item.value === temporada)?.label || 'Todas';

  useSeo({
    title: category ? `Moldes de ${currentCategoryLabel} - molderia digital` : 'Catalogo de molderia digital y moldes de ropa',
    description: category
      ? `Moldes de ${currentCategoryLabel.toLowerCase()}: molderia digital y en carton en PDF A4, plotter, DXF, CDR y PLT. Escalado completo y descarga inmediata.`
      : 'Catalogo de molderia digital y moldes de ropa: dama, hombre, ninos, bebes y unisex. Moldes en carton y PDF A4, plotter, DXF, CDR y PLT, con escalado completo y descarga inmediata.',
    path: category ? `/catalogo?categoria=${category}` : '/catalogo',
  });

  return (
    <div className="min-h-screen bg-petroleum-50">
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <FloatingPatterns variant="dark" />
        <div className="container-custom py-3 sm:py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="max-w-3xl">
              <h1 className="font-sans text-xl sm:text-3xl md:text-4xl font-extrabold text-primary-900 tracking-tight text-balance">
                {t('catalog.title', 'Moldes aprobados con muestra')}
              </h1>
              {/* El volumen del catalogo es el mejor argumento de venta: va como dato, no como pie de pagina. */}
              <p className="mt-2 flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-extrabold text-primary-800 tabular-nums">
                  {loading ? '—' : visibleProducts.length}
                </span>
                <span className="text-sm sm:text-base text-gray-500">
                  {loading
                    ? t('catalog.loading', 'Cargando catálogo...')
                    : visibleProducts.length === 1
                      ? t('catalog.readyOne', 'molde listo para producir')
                      : t('catalog.readyMany', 'moldes listos para producir')}
                </span>
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1.5 bg-primary-50 px-3 py-2 rounded-xl font-medium transition-colors"
              >
                <X className="w-3.5 h-3.5" /> {t('catalog.clear', 'Limpiar filtros')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden container-custom py-3 sm:py-8">
        <FloatingPatterns variant="dark" />

        <div className="relative mb-1.5 sm:mb-3">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto mobile-scrollbar-none pb-1 -mx-1 px-1 [mask-image:linear-gradient(to_right,black_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_92%,transparent_100%)]">
            {SEASON_OPTIONS.map(({ value, label, Icon }) => (
              <button
                key={value || 'todas'}
                onClick={() => updateFilter('temporada', value)}
                className={`flex-shrink-0 inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                  temporada === value ? 'bg-petroleum-600 text-white border-petroleum-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t(`catalog.season.${value || 'todas'}`, label)}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mb-2.5 sm:mb-5">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto mobile-scrollbar-none pb-1 -mx-1 px-1 [mask-image:linear-gradient(to_right,black_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_92%,transparent_100%)]">
            <button
              onClick={() => updateFilter('categoria', '')}
              className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                !category ? 'bg-primary-800 text-white border-primary-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t('catalog.all', 'Todos')}
            </button>
            {CATEGORIES.map((item) => (
              <button
                key={item.value}
                onClick={() => updateFilter('categoria', item.value)}
                className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                  category === item.value ? 'bg-primary-800 text-white border-primary-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t(`cat.${item.value}`, item.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="sticky top-[68px] z-20 mb-3 sm:mb-5 sm:top-[78px]">
          <div className="rounded-2xl border border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 shadow-sm p-2.5 sm:p-4 space-y-2.5 sm:space-y-3">
            {/* Mobile: solo la lupa, para no ocupar espacio; se expande al tocar */}
            <div className="sm:hidden">
              {!mobileSearchOpen ? (
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(true)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-400 text-sm"
                >
                  <Search className="w-4 h-4" />
                  {search ? <span className="text-gray-700 truncate">{search}</span> : <span>{t('catalog.searchBtn', 'Buscar')}</span>}
                </button>
              ) : (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      autoFocus
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t('catalog.searchPlaceholder', 'Buscar molde, prenda, uso o formato')}
                      className="input-field pl-10 pr-10"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Limpiar busqueda"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button type="submit" className="btn-primary px-3.5 shrink-0" aria-label="Buscar">
                    <Search className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileSearchOpen(false)}
                    className="shrink-0 text-sm text-gray-500 px-1"
                  >
                    {t('common.close', 'Cerrar')}
                  </button>
                </form>
              )}
            </div>

            {/* Desktop: buscador siempre visible */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('catalog.searchPlaceholder', 'Buscar molde, prenda, uso o formato')}
                  className="input-field pl-10 pr-10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Limpiar busqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button type="submit" className="btn-primary px-4 shrink-0">{t('catalog.searchBtn', 'Buscar')}</button>
            </form>

            {search.trim() && (
              <div className="rounded-xl border border-petroleum-100 bg-petroleum-50 px-3 py-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-sm text-petroleum-900">
                  <span className="font-semibold">{t('catalog.understanding', 'Estoy entendiendo:')}</span>
                  {liveIntent.labels.length > 0 ? liveIntent.labels.map((label) => (
                    <span key={label} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-petroleum-700 border border-petroleum-100">
                      {label}
                    </span>
                  )) : (
                    <span className="text-petroleum-700">{t('catalog.understandingFallback', 'voy a buscar por nombre, descripcion y formato.')}</span>
                  )}
                </div>
                {liveIntent.corrected && (
                  <p className="text-xs text-petroleum-700">
                    {t('catalog.correcting', 'Corrigiendo busqueda a:')} <span className="font-semibold">{liveIntent.correctedQuery}</span>
                  </p>
                )}
                {liveSuggestions.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-petroleum-600">{t('catalog.liveSuggestions', 'Sugerencias en vivo')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {liveSuggestions.map((suggestion) => (
                        <button
                          key={`${suggestion.label}-${suggestion.value}`}
                          type="button"
                          onClick={() => runSuggestedSearch(suggestion.value)}
                          className="rounded-xl border border-white bg-white px-3 py-2 text-left hover:border-primary-200 hover:bg-primary-50 transition-colors"
                        >
                          <span className="block text-sm font-medium text-gray-900">{suggestion.label}</span>
                          <span className="block text-xs text-gray-500 mt-0.5">{suggestion.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="hidden sm:flex flex-wrap gap-2">
              {SMART_SEARCH_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => runSuggestedSearch(example)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white hover:border-primary-200 hover:text-primary-800 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" /> {example}
                </button>
              ))}
            </div>

            {busqueda && smartIntent.labels.length > 0 && (
              <div className="rounded-xl border border-primary-100 bg-primary-50 px-3 py-2.5 text-sm text-primary-900">
                <span className="font-semibold">{t('catalog.smartPrefix', 'Busqueda inteligente:')}</span> {t('catalog.smartBody', 'estoy priorizando')} {smartIntent.labels.join(', ')}.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_200px_180px] gap-2.5">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  showFilters ? 'bg-primary-50 border-primary-200 text-primary-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> {t('catalog.filters', 'Filtros')}
                  <span className="sm:hidden text-gray-400 font-normal">· {t(`catalog.sort.${sort}`, SORT_LABELS[sort])}{format ? ` · ${format}` : ''}</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-800">
                  {activeFiltersCount}
                </span>
              </button>

              {/* Ordenar y Formato: en mobile viven dentro del panel "Filtros" (evita duplicar 2 filas mas) */}
              <label className="hidden sm:block relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={sort}
                  onChange={(e) => updateFilter('orden', e.target.value)}
                  className="input-field pl-10"
                  aria-label={t('catalog.sortBy', 'Ordenar por')}
                >
                  <option value="reciente">{t('catalog.sort.reciente', 'Variado')}</option>
                  <option value="precio_asc">{t('catalog.sort.precio_asc', 'Precio: menor a mayor')}</option>
                  <option value="precio_desc">{t('catalog.sort.precio_desc', 'Precio: mayor a menor')}</option>
                  <option value="nombre">{t('catalog.sort.nombre', 'Nombre A-Z')}</option>
                </select>
              </label>

              <label className="hidden sm:block relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={format}
                  onChange={(e) => updateFilter('formato', e.target.value)}
                  className="input-field pl-10"
                  aria-label={t('catalog.format', 'Formato')}
                >
                  <option value="">{t('catalog.allFormats', 'Todos los formatos')}</option>
                  {FORMATS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {category && (
                  <button
                    type="button"
                    onClick={() => updateFilter('categoria', '')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-800"
                  >
                    {t('catalog.chipCategory', 'Categoria:')} {category ? t(`cat.${category}`, currentCategoryLabel) : currentCategoryLabel}
                    <X className="w-3 h-3" />
                  </button>
                )}
                {temporada && (
                  <button
                    type="button"
                    onClick={() => updateFilter('temporada', '')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-petroleum-200 bg-petroleum-50 px-3 py-1.5 text-xs font-medium text-petroleum-700"
                  >
                    {t('catalog.chipSeason', 'Temporada:')} {t(`catalog.season.${temporada || 'todas'}`, currentSeasonLabel)}
                    <X className="w-3 h-3" />
                  </button>
                )}
                {format && (
                  <button
                    type="button"
                    onClick={() => updateFilter('formato', '')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700"
                  >
                    {t('catalog.chipFormat', 'Formato:')} {format}
                    <X className="w-3 h-3" />
                  </button>
                )}
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      updateFilter('busqueda', '');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700"
                  >
                    {t('catalog.chipSearch', 'Busqueda:')} {busqueda}
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="card p-4 sm:p-6 mb-8">
            <div className="flex items-center justify-between mb-4 gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">{t('catalog.filterBy', 'Filtrar por')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('catalog.filterHint', 'Deja listo el catalogo segun categoria, formato o prioridad.')}</p>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
                  <X className="w-3 h-3" /> {t('catalog.clear', 'Limpiar filtros')}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('catalog.category', 'Categoria')}</label>
                <select
                  value={category}
                  onChange={(e) => updateFilter('categoria', e.target.value)}
                  className="input-field"
                >
                  <option value="">{t('catalog.allCategories', 'Todas las categorias')}</option>
                  {CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>{t(`cat.${item.value}`, item.label)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('catalog.format', 'Formato')}</label>
                <select
                  value={format}
                  onChange={(e) => updateFilter('formato', e.target.value)}
                  className="input-field"
                >
                  <option value="">{t('catalog.allFormats', 'Todos los formatos')}</option>
                  {FORMATS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('catalog.sortBy', 'Ordenar por')}</label>
                <select
                  value={sort}
                  onChange={(e) => updateFilter('orden', e.target.value)}
                  className="input-field"
                >
                  <option value="reciente">{t('catalog.sort.reciente', 'Variado')}</option>
                  <option value="precio_asc">{t('catalog.sort.precio_asc', 'Precio: menor a mayor')}</option>
                  <option value="precio_desc">{t('catalog.sort.precio_desc', 'Precio: mayor a menor')}</option>
                  <option value="nombre">{t('catalog.sort.nombre', 'Nombre A-Z')}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {!loading && visibleProducts.length > 0 && (
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <p className="text-gray-500">
              {t('catalog.showing', 'Viendo')} <span className="font-semibold text-primary-900">{visibleProducts.length}</span> {t('catalog.results', 'resultados')}
              {category ? ` ${t('catalog.in', 'en')} ${t(`cat.${category}`, currentCategoryLabel)}` : ''}
              {busqueda ? ` ${t('catalog.for', 'para')} "${busqueda}"` : ''}.
            </p>
            <p className="text-gray-400">{t('catalog.currentSort', 'Orden actual:')} {t(`catalog.sort.${sort}`, SORT_LABELS[sort])}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="aspect-square sm:aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          hasActiveFilters ? (
            <div className="card max-w-lg mx-auto text-center py-14 px-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-petroleum-100 mb-5">
                <Search className="w-8 h-8 text-petroleum-600" />
              </div>
              <h3 className="font-display text-2xl font-bold text-primary-900 mb-2">
                {t('catalog.empty.filtered.title', 'No encontramos moldes con esos filtros')}
              </h3>
              <p className="text-gray-500 mb-6">
                {t('catalog.empty.filtered.desc', 'Proba con otra categoria o formato, o mira todo el catalogo.')}
              </p>
              <button onClick={clearFilters} className="btn-primary">
                {t('catalog.empty.filtered.cta', 'Ver todo el catalogo')}
              </button>
            </div>
          ) : (
            <div className="card max-w-lg mx-auto text-center py-14 px-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-petroleum-100 mb-5">
                <PackageOpen className="w-8 h-8 text-petroleum-600" />
              </div>
              <h3 className="font-display text-2xl font-bold text-primary-900 mb-2">
                {t('catalog.empty.none.title', 'Pronto sumamos nuevos moldes')}
              </h3>
              <p className="text-gray-500 mb-6">
                {t('catalog.empty.none.desc', 'Estamos ampliando el catalogo. Necesitas un molde puntual? Pedilo a medida y lo preparamos para vos.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/diseno-a-pedido" className="btn-primary inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> {t('catalog.empty.none.cta', 'Pedir molde a medida')}
                </Link>
                <Link to="/" className="btn-secondary">{t('nav.home', 'Inicio')}</Link>
              </div>
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 items-stretch">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
