import { useState, useEffect, useCallback } from 'react';
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

const SEASON_OPTIONS = [
  { value: '', label: 'Todas', Icon: CalendarDays },
  { value: 'verano', label: 'Verano', Icon: Sun },
  { value: 'invierno', label: 'Invierno', Icon: Snowflake },
  { value: 'todo-el-anio', label: 'Todo el ano', Icon: CalendarDays },
] as const;

const SORT_LABELS: Record<SortOption, string> = {
  reciente: 'Mas recientes',
  precio_asc: 'Menor precio',
  precio_desc: 'Mayor precio',
  nombre: 'Nombre A-Z',
};

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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
      if (busqueda) {
        query = query.or(`name.ilike.%${busqueda}%,short_description.ilike.%${busqueda}%`);
      }
      if (format) {
        query = query.contains('formats', [format]);
      }
      switch (sort) {
        case 'precio_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'precio_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'nombre':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
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
        setProducts(((data as Product[]) || []).filter((p) => !isPromoActive(p)));
      }
    } catch (err) {
      console.error('Unexpected error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, format, sort, busqueda]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSearch(busqueda);
  }, [busqueda]);

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
    const params = new URLSearchParams(searchParams);
    if (search.trim()) {
      params.set('busqueda', search.trim());
    } else {
      params.delete('busqueda');
    }
    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    setSearch('');
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = Boolean(category || format || busqueda || temporada);
  const activeFiltersCount = [category, format, busqueda, temporada].filter(Boolean).length;

  const seasonMatches = (p: Product): boolean => {
    if (!temporada) return true;
    const season = p.season || 'todo-el-anio';
    if (temporada === 'todo-el-anio') return season === 'todo-el-anio';
    return season === temporada || season === 'todo-el-anio';
  };

  const visibleProducts = products.filter(seasonMatches);
  const currentCategoryLabel = CATEGORIES.find((c) => c.value === category)?.label || 'Todos los productos';
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
        <div className="container-custom py-5 sm:py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="max-w-3xl">
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-primary-800 text-glow-pulse tracking-wide">
                MOLDES APROBADOS CON MUESTRA
              </h1>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                {loading ? 'Cargando catalogo...' : `${visibleProducts.length} ${visibleProducts.length === 1 ? 'molde disponible' : 'moldes disponibles'}`}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1.5 bg-primary-50 px-3 py-2 rounded-xl font-medium transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden container-custom py-5 sm:py-8">
        <FloatingPatterns variant="dark" />

        <div className="flex gap-2 overflow-x-auto mobile-scrollbar-none pb-2 mb-3 -mx-1 px-1">
          {SEASON_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value || 'todas'}
              onClick={() => updateFilter('temporada', value)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                temporada === value ? 'bg-petroleum-600 text-white border-petroleum-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto mobile-scrollbar-none pb-2 mb-5 -mx-1 px-1">
          <button
            onClick={() => updateFilter('categoria', '')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !category ? 'bg-primary-800 text-white border-primary-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => updateFilter('categoria', c.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                category === c.value ? 'bg-primary-800 text-white border-primary-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="sticky top-[68px] z-20 mb-5 sm:top-[78px]">
          <div className="rounded-2xl border border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 shadow-sm p-3 sm:p-4 space-y-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar molde, prenda o uso"
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
              <button type="submit" className="btn-primary px-4 shrink-0">Buscar</button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_200px_180px] gap-2.5">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  showFilters ? 'bg-primary-50 border-primary-200 text-primary-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filtros
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-800">
                  {activeFiltersCount}
                </span>
              </button>

              <label className="relative block">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={sort}
                  onChange={(e) => updateFilter('orden', e.target.value)}
                  className="input-field pl-10"
                  aria-label="Ordenar catalogo"
                >
                  <option value="reciente">Mas recientes</option>
                  <option value="precio_asc">Precio: menor a mayor</option>
                  <option value="precio_desc">Precio: mayor a menor</option>
                  <option value="nombre">Nombre A-Z</option>
                </select>
              </label>

              <label className="relative block">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={format}
                  onChange={(e) => updateFilter('formato', e.target.value)}
                  className="input-field pl-10"
                  aria-label="Filtrar por formato"
                >
                  <option value="">Todos los formatos</option>
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
                    Categoria: {currentCategoryLabel}
                    <X className="w-3 h-3" />
                  </button>
                )}
                {temporada && (
                  <button
                    type="button"
                    onClick={() => updateFilter('temporada', '')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-petroleum-200 bg-petroleum-50 px-3 py-1.5 text-xs font-medium text-petroleum-700"
                  >
                    Temporada: {currentSeasonLabel}
                    <X className="w-3 h-3" />
                  </button>
                )}
                {format && (
                  <button
                    type="button"
                    onClick={() => updateFilter('formato', '')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700"
                  >
                    Formato: {format}
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
                    Busqueda: {busqueda}
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
                <h3 className="font-semibold text-gray-900">Filtrar por</h3>
                <p className="text-sm text-gray-500 mt-1">Deja listo el catalogo segun categoria, formato o prioridad.</p>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
                  <X className="w-3 h-3" /> Limpiar filtros
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => updateFilter('categoria', e.target.value)}
                  className="input-field"
                >
                  <option value="">Todas las categorias</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
                <select
                  value={format}
                  onChange={(e) => updateFilter('formato', e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos los formatos</option>
                  {FORMATS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                <select
                  value={sort}
                  onChange={(e) => updateFilter('orden', e.target.value)}
                  className="input-field"
                >
                  <option value="reciente">Mas recientes</option>
                  <option value="precio_asc">Precio: menor a mayor</option>
                  <option value="precio_desc">Precio: mayor a menor</option>
                  <option value="nombre">Nombre A-Z</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {!loading && visibleProducts.length > 0 && (
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <p className="text-gray-500">
              Viendo <span className="font-semibold text-primary-900">{visibleProducts.length}</span> resultados
              {category ? ` en ${currentCategoryLabel}` : ''}
              {busqueda ? ` para "${busqueda}"` : ''}.
            </p>
            <p className="text-gray-400">Orden actual: {SORT_LABELS[sort]}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
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
