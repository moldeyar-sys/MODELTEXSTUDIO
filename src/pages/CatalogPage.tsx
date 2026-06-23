import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, PackageOpen, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ui/ProductCard';
import { useSeo } from '../lib/seo';
import { useLocale } from '../lib/locale';
import type { Product, ProductCategory } from '../lib/types';
import { CATEGORIES, FORMATS } from '../lib/types';

type SortOption = 'reciente' | 'precio_asc' | 'precio_desc' | 'nombre';

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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }
      if (busqueda) {
        query = query.or(`name.ilike.%${busqueda}%,short_description.ilike.%${busqueda}%`);
      }
      if (format) {
        query = query.contains('formats', [format]);
      }

      switch (sort) {
        case 'precio_asc': query = query.order('price', { ascending: true }); break;
        case 'precio_desc': query = query.order('price', { ascending: false }); break;
        case 'nombre': query = query.order('name', { ascending: true }); break;
        default: query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } else {
        setProducts((data as Product[]) || []);
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

  // Reset local search when URL search param changes
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

  const hasActiveFilters = category || format || busqueda;

  const currentCategoryLabel = CATEGORIES.find(c => c.value === category)?.label || 'Todos los productos';

  useSeo({
    title: category ? `Moldes de ${currentCategoryLabel}` : 'Catálogo de moldes digitales',
    description: category
      ? `Moldes digitales de ${currentCategoryLabel.toLowerCase()} en PDF A4, plotter y formatos editables. Descarga inmediata tras el pago.`
      : 'Explorá todo el catálogo de moldes digitales de ropa: hombre, dama, niños, deportivo, invierno y más. PDF A4, plotter, DXF y CDR.',
    path: category ? `/catalogo?categoria=${category}` : '/catalogo',
  });

  return (
    <div className="min-h-screen bg-petroleum-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-900">
                {currentCategoryLabel}
              </h1>
              <p className="text-gray-500 mt-2">
                {loading ? 'Cargando...' : `${products.length} ${products.length === 1 ? 'molde disponible' : 'moldes disponibles'}`}
              </p>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1.5 bg-primary-50 px-3 py-1.5 rounded-lg font-medium transition-colors">
                <X className="w-3.5 h-3.5" /> Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Botones de categoría (siempre visibles) */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
          <button
            onClick={() => updateFilter('categoria', '')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !category ? 'bg-primary-800 text-white border-primary-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map(c => (
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

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar moldes..."
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="btn-primary ml-2 px-4">Buscar</button>
          </form>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
              showFilters ? 'bg-primary-50 border-primary-200 text-primary-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filtrar por</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
                  <X className="w-3 h-3" /> Limpiar filtros
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={category}
                  onChange={e => updateFilter('categoria', e.target.value)}
                  className="input-field"
                >
                  <option value="">Todas las categorias</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
                <select
                  value={format}
                  onChange={e => updateFilter('formato', e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos los formatos</option>
                  {FORMATS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                <select
                  value={sort}
                  onChange={e => updateFilter('orden', e.target.value)}
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

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          hasActiveFilters ? (
            <div className="card max-w-lg mx-auto text-center py-14 px-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-petroleum-100 mb-5">
                <Search className="w-8 h-8 text-petroleum-600" />
              </div>
              <h3 className="font-display text-2xl font-bold text-primary-900 mb-2">
                {t('catalog.empty.filtered.title', 'No encontramos moldes con esos filtros')}
              </h3>
              <p className="text-gray-500 mb-6">
                {t('catalog.empty.filtered.desc', 'Probá con otra categoría o formato, o mirá todo el catálogo.')}
              </p>
              <button onClick={clearFilters} className="btn-primary">
                {t('catalog.empty.filtered.cta', 'Ver todo el catálogo')}
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
                {t('catalog.empty.none.desc', 'Estamos ampliando el catálogo. ¿Necesitás un molde puntual? Pedilo a medida y lo preparamos para vos.')}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
