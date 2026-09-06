import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock,
  Download,
  FileText,
  Headphones,
  ImageOff,
  PackageCheck,
  Ruler,
  ShieldCheck,
  Sparkles,
  Tags,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ProductCard } from '../components/ui/ProductCard';
import { useSeo, useStructuredData } from '../lib/seo';
import type { Product } from '../lib/types';
import { CATEGORIES } from '../lib/types';
import { FormatOptions } from '../components/ui/FormatOptions';
import { ReviewsSection } from '../components/ui/ReviewsSection';
import { productCode, cartonPrice, pdfPrice, ploterPrice, productUrl } from '../lib/productFormats';
import { fetchReviews, reviewSummary } from '../lib/reviews';
import { useLocale } from '../lib/locale';
import { CATEGORY_TITLE_SUFFIX } from '../lib/categorySeo';

const formatDescription = (format: string, t: (key: string, es: string) => string) => {
  const normalized = format.toLowerCase();
  if (normalized.includes('a4')) return t('fmtdesc.a4', 'Para imprimir en hojas A4, unir y producir sin plotter.');
  if (normalized.includes('plot') || normalized.includes('plóter') || normalized.includes('ploter')) return t('fmtdesc.plotter', 'Para imprimir en rollo o enviar directo a una gráfica.');
  if (normalized.includes('pds')) return t('fmtdesc.pds', 'Archivo nativo de Optitex para departamentos de patronaje.');
  if (normalized.includes('mrk') || normalized.includes('tizado')) return t('fmtdesc.mrk', 'Tizado computarizado (Optitex) listo para el corte de tela.');
  if (normalized.includes('ads') || normalized.includes('audaces')) return t('fmtdesc.ads', 'Archivo nativo de Audaces para departamentos de patronaje.');
  if (normalized.includes('dxf') || normalized.includes('aama')) return t('fmtdesc.dxf', 'Estándar industrial DXF/AAMA, compatible con sistemas CAD (Gerber, Lectra, Optitex, Audaces) y maquinaria textil.');
  if (normalized.includes('cdr')) return t('fmtdesc.cdr', 'Editable en CorelDRAW para adaptar piezas y detalles.');
  if (normalized.includes('plt')) return t('fmtdesc.plt', 'Formato vectorial preparado para ploteo profesional.');
  if (normalized.includes('sublim')) return t('fmtdesc.sublim', 'Pensado para trabajar estampas y producción sublimada.');
  return t('fmtdesc.default', 'Formato profesional para producción textil.');
};

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAdmin } = useAuth();
  const { t } = useLocale();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setProduct(data as Product);
      setActiveImage(0);
      fetchRelated(data as Product);
      // Cuenta para "productos mas vistos" del panel admin. El propio admin
      // navegando su catalogo no debe inflar el conteo. Best-effort: si
      // falla, no afecta la pagina.
      if (!isAdmin) {
        try {
          await supabase.rpc('increment_product_view', { p_id: (data as Product).id, p_has_account: !!user });
        } catch {
          /* best-effort */
        }
      }
    }
    setLoading(false);
  };

  const fetchRelated = async (p: Product) => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category', p.category)
      .neq('id', p.id)
      .limit(4);
    setRelated((data as Product[]) || []);
  };

  const allImages = product
    ? [product.main_image_url, ...(product.gallery || [])].filter(Boolean)
    : [];

  const categoryLabel = product
    ? CATEGORIES.find(c => c.value === product.category)?.label || product.category.replace('-', ' ')
    : '';
  const availableSizes = product?.sizes || [];
  const availableFormats = product?.formats || [];
  const fabrics = product?.recommended_fabrics || [];
  const deliveryLabel = t('pd.instant', 'Descarga inmediata');
  const deliveryDescription = t('pd.instantDesc', 'Apenas se confirma el pago, accedes desde tu cuenta.');

  useSeo({
    // Muchos moldes comparten nombre ("TOP DAMA" x43): la categoria en el
    // titulo los distingue un poco en los resultados de busqueda.
    title: product
      ? `${product.name} — molde digital ${CATEGORY_TITLE_SUFFIX[product.category] || ''}`.trim()
      : loading ? 'Producto' : 'Producto no encontrado',
    description: product
      ? (product.short_description || product.long_description || `Molde digital de ${product.garment_type || product.name}. Talles y formatos profesionales con descarga inmediata.`).slice(0, 160)
      : undefined,
    image: product?.main_image_url || undefined,
    path: slug ? `/producto/${slug}` : '/catalogo',
    type: 'product',
    noindex: !loading && !product,
  });

  const breadcrumbSchema = useMemo(() => {
    if (!product) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://modeltex.com.ar/' },
        { '@type': 'ListItem', position: 2, name: 'Catálogo', item: 'https://modeltex.com.ar/catalogo' },
        { '@type': 'ListItem', position: 3, name: categoryLabel, item: `https://modeltex.com.ar/catalogo?categoria=${product.category}` },
        { '@type': 'ListItem', position: 4, name: product.name, item: productUrl(product.slug) },
      ],
    };
  }, [product, categoryLabel]);
  useStructuredData(breadcrumbSchema, 'breadcrumb-schema');

  // Resumen de reseñas: alimenta las estrellas de Google en los resultados de búsqueda.
  const [ratingSummary, setRatingSummary] = useState({ avg: 0, count: 0 });
  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    fetchReviews('product', product.id).then(rows => {
      if (!cancelled) setRatingSummary(reviewSummary(rows));
    });
    return () => { cancelled = true; };
  }, [product?.id]);

  // Ficha de producto para Google (Schema.org). Sin esto el catalogo no muestra
  // precio, disponibilidad ni estrellas en los resultados de busqueda.
  const productSchema = useMemo(() => {
    if (!product) return null;

    const precios = [cartonPrice(product), pdfPrice(product), ploterPrice(product)]
      .filter((v): v is number => v !== null);
    const desde = precios.length ? Math.min(...precios) : null;

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description:
        product.short_description ||
        product.long_description ||
        `Molde digital de ${product.garment_type || product.name} con talles y formatos profesionales.`,
      sku: productCode(product),
      category: CATEGORIES.find(c => c.value === product.category)?.label || product.category,
      url: productUrl(product.slug),
      brand: { '@type': 'Brand', name: 'Modeltex' },
    };

    const imagenes = [product.main_image_url, ...(product.gallery || [])].filter(Boolean);
    if (imagenes.length) schema.image = imagenes;

    if (desde !== null) {
      schema.offers = {
        '@type': 'Offer',
        price: desde,
        priceCurrency: 'ARS',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        url: productUrl(product.slug),
        seller: { '@type': 'Organization', name: 'Modeltex' },
      };
    }

    if (ratingSummary.count > 0) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: ratingSummary.avg,
        reviewCount: ratingSummary.count,
      };
    }

    return schema;
  }, [product, ratingSummary]);

  useStructuredData(productSchema, 'product-schema');

  if (loading) {
    return (
      <div className="min-h-screen bg-petroleum-50">
        <div className="container-custom py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-24 mb-8" />
            <div className="grid md:grid-cols-2 gap-10">
              <div className="aspect-square bg-gray-200 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-48 bg-gray-200 rounded-2xl mt-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petroleum-50">
        <div className="text-center bg-white border border-gray-100 rounded-2xl px-8 py-10 shadow-sm">
          <p className="text-gray-500 text-lg mb-4">{t('pd.notFound', 'Producto no encontrado')}</p>
          <Link to="/catalogo" className="btn-primary">{t('pd.back', 'Volver al catálogo')}</Link>
        </div>
      </div>
    );
  }

  const summaryItems = [
    { label: t('pd.code', 'Código'), value: productCode(product), icon: Tags },
    { label: t('pd.category', 'Categoría'), value: categoryLabel, icon: PackageCheck },
    { label: t('pd.sizes', 'Talles'), value: availableSizes.length > 0 ? `${availableSizes.length} ${t('pd.included', 'incluidos')}` : t('common.consult', 'A consultar'), icon: Ruler },
    { label: t('pd.formats', 'Formatos'), value: availableFormats.length > 0 ? `${availableFormats.length} ${t('pd.available', 'disponibles')}` : t('common.consult', 'A consultar'), icon: FileText },
  ];

  const trustItems = [
    { icon: Download, title: deliveryLabel, text: deliveryDescription },
    { icon: ShieldCheck, title: t('pd.secure', 'Compra segura'), text: t('pd.secureDesc', 'Pago protegido y acceso desde tu cuenta.') },
    { icon: Headphones, title: t('pd.support', 'Soporte post-compra'), text: t('pd.supportDesc', 'Te ayudamos con impresión, talles y uso del archivo.') },
  ];

  const includedItems = [
    t('pd.inc.1', 'Molde profesional listo para imprimir o enviar a producción.'),
    t('pd.inc.2', 'Talles seleccionables según el rango disponible del producto.'),
    t('pd.inc.3', 'Archivos digitales desde tu cuenta de Modeltex.'),
    t('pd.inc.4', 'Opciones para A4, plotter y formatos industriales (DXF/AAMA, PDS, MRK, ADS) cuando estén disponibles.'),
    t('pd.inc.5', 'Referencia de telas recomendadas para producir con mejor resultado.'),
    t('pd.inc.6', 'Asistencia por WhatsApp si necesitás ayuda con la descarga o impresión.'),
  ];

  return (
    <div className="min-h-screen bg-petroleum-50">
      <div className="container-custom py-5 md:py-8">
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-800 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('pd.back', 'Volver al catálogo')}
        </Link>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.86fr)] gap-8 lg:gap-12 items-start">
          {/* Images */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-square bg-gray-50 relative">
                {allImages[activeImage] ? (
                  <img
                    src={allImages[activeImage]}
                    alt={product.name}
                    className="w-full h-full object-contain p-3 sm:p-5"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <ImageOff className="w-16 h-16 mb-2" />
                    <span className="text-sm">Sin imagen</span>
                  </div>
                )}
                <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-primary-800 shadow-sm border border-white">
                  <BadgeCheck className="w-3.5 h-3.5" /> {t('pd.approved', 'Molde aprobado')}
                </div>
              </div>
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 bg-white transition-colors ${
                      i === activeImage ? 'border-primary-500' : 'border-transparent hover:border-gray-200'
                    }`}
                    aria-label={`Ver imagen ${i + 1}`}
                  >
                    <img src={img} alt="" loading="lazy" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-sm font-medium text-petroleum-700 bg-petroleum-100 px-3 py-1 rounded-lg capitalize">
                  {categoryLabel}
                </span>
                {product.garment_type && (
                  <span className="text-sm font-medium text-gray-600 bg-white border border-gray-100 px-3 py-1 rounded-lg">
                    {product.garment_type}
                  </span>
                )}
                <span className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-lg">
                  {deliveryLabel}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-primary-900 mb-4 leading-tight">
                {product.name}
              </h1>

              <p className="text-gray-600 leading-relaxed">
                {product.long_description || product.short_description || t('pd.defaultDesc', 'Molde profesional preparado para producción textil.')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {summaryItems.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-white border border-gray-100 rounded-xl p-3.5 sm:p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">{item.label}</span>
                    </div>
                    <p className="text-sm font-bold text-primary-900 leading-snug break-words">{item.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {trustItems.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="bg-white border border-gray-100 rounded-xl p-3.5 sm:p-4 shadow-sm">
                    <Icon className="w-5 h-5 text-petroleum-600 mb-2" />
                    <p className="text-sm font-bold text-primary-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.text}</p>
                  </div>
                );
              })}
            </div>

            {/* Formatos y precios */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:sticky lg:top-24">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-primary-900">{t('pd.chooseTitle', 'Elegí formato y talles')}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t('pd.chooseHint', 'El precio se ajusta automáticamente según los talles seleccionados.')}</p>
                </div>
                <Sparkles className="w-5 h-5 text-accent-500 flex-shrink-0 mt-1" />
              </div>
              <FormatOptions product={product} />
              <p className="mt-4 text-[11px] text-gray-400 leading-relaxed">
                {t('pd.digitalNote', 'Producto digital. Revisá el formato elegido antes de finalizar la compra. Si necesitás una adaptación especial, consultanos antes de pagar.')}
              </p>
            </div>
          </div>
        </div>

        {/* Product details */}
        <section className="mt-8 md:mt-10 grid lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-4">{t('pd.includesTitle', 'Qué incluye este molde')}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {includedItems.map(item => (
                <div key={item} className="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3">
                  <Check className="w-4 h-4 text-petroleum-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary-900 rounded-2xl p-6 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-accent-400" />
              <h2 className="font-display text-xl font-bold">{t('pd.beforePrint', 'Antes de imprimir')}</h2>
            </div>
            <p className="text-sm text-primary-100 leading-relaxed">
              {t('pd.beforePrintText', 'Para PDF A4, imprimí en tamaño real al 100% y verificá la escala antes de unir hojas. Para plotter, confirmá el ancho de rollo de tu gráfica o equipo.')}
            </p>
            <div className="mt-5 rounded-xl bg-white/10 border border-white/10 p-4">
              <p className="text-sm font-semibold">{t('pd.doubts', '¿Tenés dudas?')}</p>
              <p className="text-xs text-primary-100 mt-1 leading-relaxed">{t('pd.doubtsText', 'Usá WhatsApp o Telegram y mandanos el nombre del molde para ayudarte más rápido.')}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-primary-900 mb-3">{t('pd.sizesIncluded', 'Talles incluidos')}</h2>
            {availableSizes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(s => (
                  <span key={s} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg font-medium">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t('pd.sizesConsult', 'Consultar talles disponibles.')}</p>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-primary-900 mb-3">{t('pd.formatsAvailable', 'Formatos disponibles')}</h2>
            {availableFormats.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableFormats.map(f => (
                  <span key={f} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-lg font-medium">
                    {f}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t('pd.formatsConsult', 'Consultar formatos disponibles.')}</p>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-primary-900 mb-3">{t('pd.fabrics', 'Telas recomendadas')}</h2>
            {fabrics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {fabrics.map(f => (
                  <span key={f} className="px-3 py-1.5 bg-petroleum-50 text-petroleum-700 text-sm rounded-lg font-medium">
                    {f}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t('pd.fabricsConsult', 'Consultanos qué tela conviene para este molde.')}</p>
            )}
          </div>
        </section>

        {availableFormats.length > 0 && (
          <section className="mt-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-4">{t('pd.compat', 'Compatibilidad de archivos')}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableFormats.map(format => (
                <div key={format} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-sm font-bold text-primary-900">{format}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{formatDescription(format, t)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Opiniones */}
        <div className="mt-16 max-w-3xl bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <ReviewsSection targetType="product" targetId={product.id} compact />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-8">{t('pd.related', 'Productos relacionados')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

