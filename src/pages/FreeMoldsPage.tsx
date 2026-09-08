import { FloatingPatterns } from '../components/ui/FloatingPatterns';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Gift, ShieldCheck, Download, ArrowRight, PackageOpen } from 'lucide-react';
import { useSeo, useStructuredData } from '../lib/seo';
import { SCHEMA_IDS } from '../lib/schemaIds';
import { fetchActiveFreeMolds } from '../lib/freeMolds';
import { fetchPromoProducts, type PromoProduct } from '../lib/promo';
import { FreeMoldCard } from '../components/ui/FreeMoldCard';
import { FreePromoCard } from '../components/ui/FreePromoCard';
import { NewsletterSignup } from '../components/ui/NewsletterSignup';
import type { FreeMold } from '../lib/types';

const freeFaqs = [
  {
    q: '¿Los moldes gratis son moldes reales o solo de muestra?',
    a: 'Son moldes reales de nuestro catálogo, no versiones recortadas ni de muestra: mismo nivel de terminación, talles y prolijidad que los moldes pagos. Los publicamos gratis justamente para que compruebes esa calidad antes de tu primera compra.',
  },
  {
    q: '¿Cómo descargo un molde gratis para imprimir?',
    a: 'Entrás a la sección Moldes Gratis, elegís el que te interesa y lo descargás: algunos se bajan sin necesidad de cuenta, otros piden crear una cuenta gratuita en Modeltex. En los dos casos la descarga es inmediata.',
  },
  {
    q: '¿Los moldes gratis vienen en PDF listos para imprimir?',
    a: 'Sí, se entregan en PDF, listos para imprimir en A4 o plotter según el molde, con el mismo cuadrado de control de medida que traen los moldes pagos para verificar que la impresión no perdió escala.',
  },
  {
    q: '¿Cada cuánto suben moldes nuevos gratis para descargar?',
    a: 'Sumamos moldes gratuitos nuevos de forma periódica, en general cada semana. Si te suscribís con tu email en esta página te avisamos cuando hay novedades.',
  },
  {
    q: '¿Puedo usar un molde gratis para producir y vender ropa?',
    a: 'Sí, tiene la misma licencia de uso productivo que los moldes pagos: podés confeccionar y vender las prendas sin límite de unidades. Lo que no está permitido es revender o redistribuir el archivo del molde.',
  },
  {
    q: '¿Qué diferencia hay entre los moldes gratis y los moldes pagos?',
    a: 'Ninguna en calidad: la diferencia es que el catálogo gratis es una selección chica y rotativa, mientras que el catálogo completo tiene más de 2.000 moldes con curva de talles completa, para elegir por categoría, prenda y formato.',
  },
  {
    q: '¿Los moldes gratis en PDF son moldes completos o solo una parte?',
    a: 'Son el molde completo, con todas sus piezas y su curva de talles, igual que un molde pago: no es una versión parcial ni un recorte del archivo. Se entregan en PDF listo para imprimir en A4 o plotter según el molde.',
  },
  {
    q: '¿Cómo descargo moldes gratis para imprimir sin pagar nada?',
    a: 'Entrás a esta sección, elegís un molde de la selección gratuita y lo descargás: no se pide ningún dato de pago porque son moldes gratis, algunos sin necesidad de cuenta y otros pidiendo una cuenta gratuita de Modeltex.',
  },
];

export default function FreeMoldsPage() {
  const [molds, setMolds] = useState<FreeMold[]>([]);
  const [promos, setPromos] = useState<PromoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useSeo({
    title: 'Moldes gratis en PDF para descargar e imprimir',
    description:
      'Moldes de ropa gratis para descargar: moldería gratis en PDF, listos para imprimir en A4 o plotter. Probá la calidad Modeltex antes de comprar, con nuevos moldes gratis cada semana.',
    path: '/moldes-gratis',
  });

  useStructuredData(
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Moldes gratis para descargar',
      url: 'https://modeltex.com.ar/moldes-gratis',
      description:
        'Moldes de ropa gratis para descargar en PDF, listos para imprimir. Mismo nivel de calidad que el catálogo pago de Modeltex.',
    },
    SCHEMA_IDS.collectionPage,
  );
  useStructuredData(
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://modeltex.com.ar/' },
        { '@type': 'ListItem', position: 2, name: 'Moldes gratis', item: 'https://modeltex.com.ar/moldes-gratis' },
      ],
    },
    SCHEMA_IDS.breadcrumb,
  );
  useStructuredData(
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: freeFaqs.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    SCHEMA_IDS.faq,
  );

  useEffect(() => {
    Promise.all([fetchActiveFreeMolds(), fetchPromoProducts()]).then(([m, p]) => {
      setMolds(m);
      setPromos(p);
      setLoading(false);
    });
  }, []);

  const showPromos = !search.trim();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return molds;
    return molds.filter(m =>
      [m.title, m.code, m.category, m.product_type, m.fabric_recommendation, ...(m.tags || []), ...(m.sizes || [])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [molds, search]);

  return (
    <div className="min-h-screen bg-petroleum-50">
      {/* Hero oscuro premium */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-petroleum-900 text-white">
        <FloatingPatterns variant="white" />
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 85% 0%, rgba(203,110,231,0.35), transparent 45%)' }}
        />
        <div className="container-custom relative py-10 sm:py-14 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 border border-green-400/30 text-sm font-semibold backdrop-blur-sm">
                <Gift className="w-4 h-4 text-green-300" /> 100% Gratis
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-5 max-w-3xl text-balance">
                Moldes Gratis Modeltex
              </h1>
              <p className="text-lg md:text-xl text-white/90 mt-5 max-w-2xl font-medium">
                Descargá moldes gratuitos y probá la calidad de nuestro trabajo antes de comprar.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm text-white/75">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-300" /> Archivos verificados</span>
                <span className="inline-flex items-center gap-2"><Download className="w-4 h-4 text-green-300" /> Descarga inmediata</span>
                <span className="inline-flex items-center gap-2"><Gift className="w-4 h-4 text-green-300" /> Sin registro</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  to="/catalogo"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all active:scale-[0.98]"
                >
                  Ver catálogo completo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="max-w-sm lg:max-w-none">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-6 md:p-7 backdrop-blur-md shadow-2xl shadow-primary-950/20">
                <h2 className="font-display text-[2.15rem] leading-[0.95] sm:text-5xl font-bold text-white text-balance">
                  Nuevos moldes <span className="text-green-300">gratis</span> cada semana
                </h2>
                <div className="mt-6 space-y-2 text-sm text-white/75">
                  <div className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-300" />
                    Gratis y listos para descargar
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Download className="h-4 w-4 text-green-300" />
                    Nuevos archivos para revisar
                  </div>
                </div>
                <Link
                  to="/moldes-gratis"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary-900 transition-all hover:bg-white/90 active:scale-[0.98]"
                >
                  Ver moldes nuevos <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="relative overflow-hidden container-custom py-8 md:py-14">
        <FloatingPatterns variant="dark" />

        {/* Captura de email: lista propia, mas liviana que crear cuenta */}
        <NewsletterSignup className="mb-8 max-w-2xl" />

        {/* Buscador */}
        <div className="max-w-md mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar molde gratis..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-16 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 && (!showPromos || promos.length === 0) ? (
          <div className="card max-w-lg mx-auto text-center py-14 px-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-petroleum-100 mb-5">
              <PackageOpen className="w-8 h-8 text-petroleum-600" />
            </div>
            <h3 className="font-display text-2xl font-bold text-primary-900 mb-2">
              {search ? 'No encontramos moldes con esa búsqueda' : 'Pronto sumamos moldes gratis'}
            </h3>
            <p className="text-gray-500 mb-6">
              {search
                ? 'Probá con otra palabra o mirá todo el catálogo.'
                : 'Estamos preparando moldes gratuitos para que pruebes la calidad Modeltex. Mientras tanto, explorá el catálogo.'}
            </p>
            <Link to="/catalogo" className="btn-primary">Ver catálogo de moldes</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {showPromos && promos.map(p => (
              <FreePromoCard key={p.product.id} item={p} />
            ))}
            {filtered.map(m => (
              <FreeMoldCard key={m.id} mold={m} />
            ))}
          </div>
        )}
      </section>

      {/* Contenido SEO/AEO + FAQ */}
      <section className="container-custom pb-8 md:pb-10">
        <div className="card p-6 sm:p-7 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-primary-900">Moldería gratis para descargar y probar</h2>
          <p className="text-gray-600 mt-3 leading-relaxed">
            Acá vas a encontrar moldes para descargar gratis en PDF, listos para imprimir en A4 o en plotter: la
            misma moldería digital que vendemos en el catálogo completo, publicada gratuitamente para que la
            pruebes antes de comprar. No es una versión de muestra ni un molde recortado: es un molde real, con
            su curva de talles y su control de medida, igual que los moldes pagos.
          </p>
          <p className="text-gray-600 mt-3 leading-relaxed">
            Los moldes gratis en PDF se descargan igual que los pagos: abrís el archivo, lo imprimís al 100% de
            escala y cortás. Si nunca imprimiste un molde digital, la <Link to="/ayuda-impresion" className="text-primary-700 font-medium hover:text-primary-900">guía de ayuda para imprimir</Link> te
            muestra el paso a paso; y si te gusta lo que ves, el <Link to="/catalogo" className="text-primary-700 font-medium hover:text-primary-900">catálogo completo</Link> tiene
            más de 2.000 moldes en PDF A4, plotter y otros formatos profesionales.
          </p>
        </div>

        <div className="card p-6 sm:p-7 max-w-3xl mt-6">
          <h2 className="font-display text-2xl font-bold text-primary-900">Preguntas frecuentes sobre moldes gratis</h2>
          <div className="mt-4 divide-y divide-gray-100">
            {freeFaqs.map((item) => (
              <div key={item.q} className="py-4 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-primary-900">{item.q}</h3>
                <p className="text-gray-600 mt-2 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="container-custom pb-10 md:pb-16">
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary-900 to-petroleum-800 text-white px-6 py-12 md:px-12 text-center">
          <h2 className="relative font-display text-2xl md:text-3xl font-bold max-w-2xl mx-auto text-balance">
            ¿Te gustó la calidad? Llevá el catálogo completo de moldes listos para producir.
          </h2>
          <div className="relative flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              Ver catálogo de moldes
            </Link>
            <Link
              to="/diseno-a-pedido"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-all active:scale-[0.98]"
            >
              Pedir diseño a medida
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
