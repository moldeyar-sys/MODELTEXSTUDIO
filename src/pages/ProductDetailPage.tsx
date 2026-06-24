import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, ImageOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ui/ProductCard';
import { useSeo } from '../lib/seo';
import type { Product } from '../lib/types';
import { CATEGORIES } from '../lib/types';
import { FormatOptions } from '../components/ui/FormatOptions';
import { ReviewsSection } from '../components/ui/ReviewsSection';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
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
      fetchRelated(data);
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
    ? [product.main_image_url, ...product.gallery].filter(Boolean)
    : [];

  useSeo({
    title: product ? product.name : 'Producto',
    description: product
      ? (product.short_description || product.long_description || `Molde digital de ${product.garment_type || product.name}. Talles y formatos profesionales con descarga inmediata.`).slice(0, 160)
      : undefined,
    image: product?.main_image_url || undefined,
    path: slug ? `/producto/${slug}` : '/catalogo',
    type: 'product',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
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
                <div className="h-12 bg-gray-200 rounded w-1/3 mt-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Producto no encontrado</p>
          <Link to="/catalogo" className="btn-primary">Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8">
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-800 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
              {allImages[activeImage] ? (
                <img
                  src={allImages[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <ImageOff className="w-16 h-16 mb-2" />
                  <span className="text-sm">Sin imagen</span>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      i === activeImage ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-petroleum-600 bg-petroleum-50 px-3 py-1 rounded-lg capitalize">
                {CATEGORIES.find(c => c.value === product.category)?.label || product.category.replace('-', ' ')}
              </span>
              {product.garment_type && (
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                  {product.garment_type}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-900 mb-4">
              {product.name}
            </h1>

            <p className="text-gray-600 leading-relaxed mb-6">
              {product.long_description || product.short_description}
            </p>

            {/* Formatos y precios (agregar al carrito por formato) */}
            <div className="border border-gray-200 rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Elegí tu formato</h3>
              <FormatOptions product={product} />
            </div>

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Talles incluidos</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <span key={s} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Formats */}
            {product.formats.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Formatos incluidos</h3>
                <div className="flex flex-wrap gap-2">
                  {product.formats.map(f => (
                    <span key={f} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-lg font-medium">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Telas recomendadas */}
            {product.recommended_fabrics?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Telas recomendadas</h3>
                <div className="flex flex-wrap gap-2">
                  {product.recommended_fabrics.map(f => (
                    <span key={f} className="px-3 py-1.5 bg-petroleum-50 text-petroleum-700 text-sm rounded-lg font-medium">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* What you receive */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Qué recibís</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-petroleum-500 flex-shrink-0" />
                  Archivos digitales listos para descargar
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-petroleum-500 flex-shrink-0" />
                  Todos los talles incluidos en un solo producto
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-petroleum-500 flex-shrink-0" />
                  Múltiples formatos de impresión
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-petroleum-500 flex-shrink-0" />
                  Descarga inmediata después del pago
                </li>
              </ul>
            </div>

            {/* Print recommendation */}
            <div className="bg-petroleum-50 rounded-2xl p-6 mb-8">
              <h3 className="text-sm font-semibold text-petroleum-800 mb-2">Recomendaciones de impresión</h3>
              <p className="text-sm text-petroleum-700 leading-relaxed">
                Para PDF A4, imprimí en tamaño real (100%) sin escalar. Para plotter, verificá que el formato coincida con tu equipo. Los archivos CDR y DXF se pueden editar en CorelDRAW u otros programas de diseño.
              </p>
            </div>
          </div>
        </div>

        {/* Opiniones */}
        <div className="mt-16 max-w-3xl">
          <ReviewsSection targetType="product" targetId={product.id} />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-8">Productos relacionados</h2>
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
