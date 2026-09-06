import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  FileText,
  Ruler,
  Globe,
  ShoppingCart,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Package,
  Palette,
  Scissors,
  Star,
  Quote,
  ShieldCheck,
  Headphones,
  BadgeCheck,
  Gift,
} from 'lucide-react';
import { ProductCard } from '../components/ui/ProductCard';
import { HeroCarousel } from '../components/ui/HeroCarousel';
import { FloatingPatterns } from '../components/ui/FloatingPatterns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSeo } from '../lib/seo';
import { useLocale } from '../lib/locale';
import type { Product, Review } from '../lib/types';
import { fetchTopReviews } from '../lib/reviews';

const HomePage = () => {
  const { user } = useAuth();
  const { t } = useLocale();
  useSeo({
    title: 'Moldería digital y moldes de ropa para producir',
    description: 'Moldería textil profesional para fabricantes de indumentaria: moldes digitales y en cartón, moldería a pedido y tizado computarizado. Moldes de ropa en PDF A4, plotter, DXF, CDR y PLT con escalado completo y descarga inmediata. Vendemos a todo el mundo.',
    path: '/',
  });
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [realReviews, setRealReviews] = useState<Review[]>([]);

  // Opiniones reales de clientes: en cuanto haya al menos una, reemplaza a los
  // textos de ejemplo cargados a mano mas abajo.
  useEffect(() => {
    fetchTopReviews(3).then(setRealReviews);
  }, []);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('is_featured', true)
          .limit(6);

        if (error) throw error;
        setFeaturedProducts(data || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const benefits = [
    {
      icon: Zap,
      title: t('home.benefit.1.title', 'Descargá instantáneamente'),
      description: t('home.benefit.1.desc', 'Después de pagar, obtén tus archivos al instante'),
    },
    {
      icon: FileText,
      title: t('home.benefit.2.title', 'Formatos profesionales'),
      description: t('home.benefit.2.desc', 'PDF A4, Plotter, DXF/AAMA, PDS, MRK, ADS y más'),
    },
    {
      icon: Ruler,
      title: t('home.benefit.3.title', 'Todos los talles incluidos'),
      description: t('home.benefit.3.desc', 'Una compra, múltiples tamaños'),
    },
    {
      icon: Globe,
      title: t('home.benefit.4.title', 'Envío internacional'),
      description: t('home.benefit.4.desc', 'Los archivos llegan a todo el mundo por descarga digital'),
    },
  ];

  const howItWorks = [
    {
      number: 1,
      title: t('home.step.1', 'Creá tu cuenta'),
      icon: ShoppingCart,
    },
    {
      number: 2,
      title: t('home.step.2', 'Elegí el molde o pack'),
      icon: Package,
    },
    {
      number: 3,
      title: t('home.step.3', 'Agregá al carrito'),
      icon: ShoppingCart,
    },
    {
      number: 4,
      title: t('home.step.4', 'Pagá'),
      icon: Zap,
    },
    {
      number: 5,
      title: t('home.step.5', 'Descargá tus archivos'),
      icon: Download,
    },
  ];

  const formats = [
    {
      name: 'PDF A4',
      description: t('home.fmt.a4', 'Listo para imprimir en casa'),
      icon: FileText,
    },
    {
      name: 'PDF Plotter',
      description: t('home.fmt.plotter', 'Para impresoras de rollo'),
      icon: Ruler,
    },
    {
      name: 'DXF / AAMA',
      description: t('home.fmt.dxf', 'Estándar CAD universal (Gerber, Lectra, Optitex, Audaces)'),
      icon: Palette,
    },
    {
      name: 'PDS (Optitex)',
      description: t('home.fmt.pds', 'Archivo nativo de Optitex'),
      icon: Palette,
    },
    {
      name: 'MRK (Tizado)',
      description: t('home.fmt.mrk', 'Tizado computarizado listo para el corte'),
      icon: Scissors,
    },
    {
      name: 'ADS (Audaces)',
      description: t('home.fmt.ads', 'Archivo nativo de Audaces'),
      icon: Palette,
    },
  ];

  const faqItems = [
    {
      question: t('home.faq.q1', '¿Los moldes son digitales?'),
      answer: t('home.faq.a1', 'Sí, son archivos digitales que descargás después de comprar. No recibirás nada físico, solo archivos que podrás usar en tu computadora.'),
    },
    {
      question: t('home.faq.q2', '¿Puedo imprimir en A4?'),
      answer: t('home.faq.a2', 'Sí, todos nuestros moldes incluyen una versión PDF A4 lista para imprimir en casa con cualquier impresora.'),
    },
    {
      question: t('home.faq.q3', '¿Puedo imprimir en plotter?'),
      answer: t('home.faq.a3', 'Sí, muchos moldes incluyen versión para plotter (PDF y PLT). Verifica en la descripción del producto si incluye este formato.'),
    },
    {
      question: t('home.faq.q4', '¿Cuándo recibo el archivo?'),
      answer: t('home.faq.a4', 'Inmediatamente después de confirmarse el pago. Recibirás un email con los links de descarga y acceso a tu panel de cliente.'),
    },
    {
      question: t('home.faq.q5', '¿Qué pasa si pago por transferencia?'),
      answer: t('home.faq.a5', 'Confirmamos el pago manualmente y, apenas queda acreditado, activamos tu descarga de forma automatica.'),
    },
    {
      question: t('home.faq.q6', '¿Hacen moldes personalizados?'),
      answer: t('home.faq.a6', 'Sí, podés solicitar un diseño a pedido. Accedé a nuestra sección de "Diseño a pedido" para conocer más detalles y obtener un presupuesto personalizado.'),
    },
    {
      question: t('home.faq.q7', '¿Venden a otros países?'),
      answer: t('home.faq.a7', 'Sí, los archivos digitales llegan a todo el mundo por descarga, incluyendo los formatos industriales para fábricas. No tenemos limitaciones de envío geográfico.'),
    },
    {
      question: t('home.faq.q8', '¿Puedo pedir modificaciones?'),
      answer: t('home.faq.a8', 'Sí, contactanos por WhatsApp para consultar sobre modificaciones. Evaluaremos tu pedido y te pasaremos un presupuesto.'),
    },
  ];

  const testimonials = [
    {
      name: 'Carolina M.',
      role: 'Emprendedora textil · Argentina',
      text: 'Arranqué mi marca de indumentaria con los moldes de Modeltex. Los archivos vienen impecables y graduados en todos los talles. Me ahorraron muchísimo tiempo de moldería.',
      rating: 5,
    },
    {
      name: 'Diego R.',
      role: 'Taller de confección · Uruguay',
      text: 'Compro packs para producción y la relación precio-calidad es excelente. La descarga es inmediata y el PDF plotter calza perfecto con mi equipo.',
      rating: 5,
    },
    {
      name: 'Valentina S.',
      role: 'Diseñadora de indumentaria · Chile',
      text: 'Lo que más valoro es que tienen formatos editables (DXF y CDR). Puedo ajustar los moldes a mis diseños sin empezar de cero. Súper recomendable.',
      rating: 5,
    },
  ];

  // Si ya hay opiniones reales cargadas por clientes, mandan ellas.
  const displayTestimonials =
    realReviews.length > 0
      ? realReviews.map(r => ({
          name: r.author_name || 'Cliente',
          role: 'Opinión verificada de un cliente',
          text: r.comment || '',
          rating: r.rating,
        }))
      : testimonials;

  const trustItems = [
    { icon: Zap, title: t('trust.instant.title', 'Descarga inmediata'), desc: t('trust.instant.desc', 'Apenas se confirma el pago, accedés a tus archivos desde tu cuenta.') },
    { icon: BadgeCheck, title: t('trust.pro.title', 'Archivos profesionales'), desc: t('trust.pro.desc', 'Moldes graduados en todos los talles, listos para imprimir y producir.') },
    { icon: Headphones, title: t('trust.support.title', 'Soporte post-compra'), desc: t('trust.support.desc', 'Te ayudamos por WhatsApp con la impresión y el uso de los moldes.') },
    { icon: ShieldCheck, title: t('trust.secure.title', 'Compra segura'), desc: t('trust.secure.desc', 'Tus datos y tu pago protegidos. Comprá con tranquilidad.') },
  ];

  const ProductCardSkeleton = () => (
    <div className="bg-gray-200 rounded-lg h-80 animate-pulse" />
  );

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-5 pb-6 sm:pt-14 sm:pb-20 md:pt-16 md:pb-28 overflow-hidden pattern-paper">
        {/* Lluvia de moldes reales (siluetas de los DXF) sobre el papel de molderia */}
        <FloatingPatterns variant="dark" />

        {/* Desvanecido hacia la seccion siguiente */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-gray-50 z-0" />

        {/* Content */}
        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-5 sm:gap-10 lg:gap-16">
            {/* Left: Text */}
            <div className="flex-1 max-w-2xl text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white text-primary-800 text-sm font-semibold px-4 py-2 rounded-full mb-3 sm:mb-6 border border-primary-200 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('home.hero.badge', '18+ años en la industria textil')}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-primary-900 mb-3 sm:mb-6 leading-tight text-balance">
                {t('home.hero.title', 'Moldería textil profesional para fabricantes de indumentaria')}
              </h1>

              <p className="font-sans text-base md:text-xl text-gray-600 mb-4 sm:mb-8 leading-relaxed">
                {t('home.hero.subtitle', 'Moldes digitales y en cartón, moldería a pedido y tizado computarizado. Precisión industrial, escalado completo y entrega rápida para que produzcas sin demoras.')}
              </p>

              {/* Fila de confianza: responde las tres dudas antes de que las pregunten */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 mb-4 sm:mb-8 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-primary-700" /> {t('trust.instant.title', 'Descarga inmediata')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-primary-700" /> {t('home.hero.fullGrading', 'Escalado en todos los talles')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-primary-700" /> {t('home.hero.whatsappSupport', 'Soporte por WhatsApp')}
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center flex-wrap">
                <Link
                  to="/catalogo"
                  className="cta-attention-blue inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-primary-800 text-white text-lg font-bold shadow-lg hover:bg-primary-700 active:scale-[0.98] transition-all"
                >
                  {t('common.viewCatalog', 'Ver catálogo')}
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/diseno-a-pedido"
                  className="inline-flex items-center justify-center px-7 py-4 rounded-xl bg-white text-primary-800 text-lg font-semibold border-2 border-primary-200 hover:border-primary-800 hover:bg-primary-50 active:scale-[0.98] transition-all"
                >
                  {t('nav.custom', 'Diseño a pedido')}
                </Link>
              </div>

              {/* Moldes Gratis: el unico acento magenta de la pagina */}
              <Link
                to="/moldes-gratis"
                className="group mt-4 sm:mt-6 inline-flex w-full max-w-md items-center gap-4 rounded-2xl border-2 border-accent-200 bg-white px-5 py-4 shadow-sm hover:border-accent-400 hover:shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-accent-500 flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform duration-300">
                    <Gift className="text-white w-7 h-7" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <p className="text-accent-600 text-xl font-extrabold leading-tight">
                    {t('nav.freeMolds', 'Moldes Gratis')}
                  </p>
                  <p className="text-gray-500 text-sm leading-snug mt-0.5">
                    {t('home.freeMolds.desc', 'Descargá moldes reales y probá la calidad antes de comprar')}
                  </p>
                </div>

                <ArrowRight className="text-accent-500 w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>

            {/* Right: imagen real, montada como una hoja de molde */}
            <div className="flex-shrink-0 w-full max-w-md">
              <div className="relative">
                {/* Marcas de escuadra, como en un plano tecnico */}
                <span className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-primary-300 z-10" />
                <span className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-primary-300 z-10" />
                <span className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-primary-300 z-10" />
                <span className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-primary-300 z-10" />

                <div className="relative bg-white rounded-2xl p-2 shadow-lg border border-primary-100">
                  <HeroCarousel
                    fallbackSrc="/brand/modeltex-hero.webp"
                    fallbackAlt="Modeltex - Moldería de precisión: patronaje digital profesional"
                    intervalMs={1000}
                  />
                </div>

                <div className="relative mt-4 flex flex-wrap justify-center gap-2">
                  {['PDF A4', 'Plotter', 'DXF', 'CDR', 'PLT'].map((f) => (
                    <span
                      key={f}
                      className="bg-white text-primary-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-primary-200 shadow-sm"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="relative py-12 md:py-20 bg-gray-50 overflow-hidden">
        <FloatingPatterns variant="dark" />
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="card p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-petroleum-100 mb-6">
                    <Icon className="text-petroleum-600" size={32} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-primary-900 mb-3">{benefit.title}</h3>
                  <p className="font-sans text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="relative py-14 md:py-24 bg-white overflow-hidden">
        <FloatingPatterns variant="dark" />
        <div className="container-custom">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-900 mb-4">{t('home.featured.title', 'Productos destacados')}</h2>
            <p className="font-sans text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.featured.subtitle', 'Descubre nuestros moldes más populares y bestsellers')}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="font-sans text-gray-500 text-lg">{t('home.featured.empty', 'No hay productos destacados en este momento')}</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/catalogo"
              className="btn-primary px-8 py-3 text-lg font-semibold inline-flex items-center gap-2 hover:scale-105 transition-transform"
            >
              {t('home.featured.viewAll', 'Ver catálogo completo')}
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative py-14 md:py-24 bg-gradient-to-br from-petroleum-50 to-primary-50 overflow-hidden">
        <FloatingPatterns variant="dark" />
        <div className="container-custom">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-900 mb-4">{t('home.howItWorks.title', '¿Cómo funciona?')}</h2>
            <p className="font-sans text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.howItWorks.subtitle', '5 pasos simples para conseguir tus moldes digitales')}
            </p>
          </div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-0">
              {howItWorks.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative flex flex-col items-center">
                    {/* Number Circle */}
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-petroleum-600 text-white font-display text-2xl font-bold mb-4 z-10 shadow-lg">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="mb-4 text-petroleum-600">
                      <Icon size={32} />
                    </div>

                    {/* Title */}
                    <h3 className="font-sans font-semibold text-center text-primary-900 text-sm md:text-base">
                      {step.title}
                    </h3>

                    {/* Connector Line */}
                    {index < howItWorks.length - 1 && (
                      <div className="hidden md:block absolute left-full top-8 w-full h-1 bg-gradient-to-r from-petroleum-300 to-transparent" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FORMATS SECTION */}
      <section className="relative py-14 md:py-24 bg-white overflow-hidden">
        <FloatingPatterns variant="dark" />
        <div className="container-custom">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-900 mb-4">{t('home.formats.title', 'Formatos disponibles')}</h2>
            <p className="font-sans text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.formats.subtitle', 'Trabajamos con los mejores formatos para que uses nuestros moldes en tus herramientas preferidas')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formats.map((format, index) => {
              const Icon = format.icon;
              return (
                <div key={index} className="card p-8 border-2 border-petroleum-100 hover:border-petroleum-400 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent-100">
                        <Icon className="text-accent-600" size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-primary-900 mb-2">{format.name}</h3>
                      <p className="font-sans text-gray-600">{format.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="relative py-14 md:py-24 bg-white overflow-hidden">
        <FloatingPatterns variant="dark" />
        <div className="container-custom">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-900 mb-4">{t('home.testimonials.title', 'Lo que dicen nuestros clientes')}</h2>
            <p className="font-sans text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.testimonials.subtitle', 'Emprendedores, talleres, diseñadores y fábricas de todo el mundo ya producen con Modeltex')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayTestimonials.map((t, index) => (
              <div key={index} className="card p-8 flex flex-col h-full border-2 border-gray-100 hover:border-petroleum-200 transition-colors">
                <Quote className="w-8 h-8 text-petroleum-200 mb-4" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="font-sans text-gray-700 leading-relaxed flex-1">{t.text}</p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="font-display font-semibold text-primary-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="relative py-14 md:py-24 bg-gray-50 overflow-hidden">
        <FloatingPatterns variant="dark" />
        <div className="container-custom">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-900 mb-4">{t('home.faq.title', 'Preguntas frecuentes')}</h2>
            <p className="font-sans text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.faq.subtitle', 'Resolvemos tus dudas sobre nuestros moldes digitales')}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="card border-2 border-gray-200 hover:border-petroleum-300 transition-colors overflow-hidden">
                <button
                  onClick={() => setExpandedFaqIndex(expandedFaqIndex === index ? null : index)}
                  className="w-full px-8 py-6 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="font-display text-lg font-semibold text-primary-900 pr-4">{item.question}</span>
                  {expandedFaqIndex === index ? (
                    <ChevronUp className="text-petroleum-600 flex-shrink-0 mt-1" size={24} />
                  ) : (
                    <ChevronDown className="text-gray-400 flex-shrink-0 mt-1" size={24} />
                  )}
                </button>

                {expandedFaqIndex === index && (
                  <div className="px-8 pb-6 border-t border-gray-200 bg-gray-50">
                    <p className="font-sans text-gray-700 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST / GUARANTEE SECTION */}
      <section className="relative py-14 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-petroleum-700 z-0" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="container-custom relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
              {t('trust.title', 'Comprá con confianza')}
            </h2>
            <p className="font-sans text-lg text-primary-100 max-w-2xl mx-auto">
              {t('trust.subtitle', 'Moldes digitales para emprendedores, talleres y fabricantes de indumentaria en todo el mundo')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 mb-4">
                    <Icon className="text-accent-400" size={28} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="font-sans text-sm text-primary-100 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-primary-100 text-sm">
            <span className="inline-flex items-center gap-2"><Globe className="w-4 h-4 text-accent-400" /> {t('trust.worldwide', 'Entrega digital a todo el mundo')}</span>
            <span className="inline-flex items-center gap-2"><FileText className="w-4 h-4 text-accent-400" /> {t('trust.formats', 'PDF A4, Plotter, DXF/AAMA, PDS (Optitex), MRK, ADS (Audaces), CDR y PLT')}</span>
            <span className="inline-flex items-center gap-2"><Download className="w-4 h-4 text-accent-400" /> {t('trust.access', 'Acceso permanente desde tu cuenta')}</span>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative py-14 md:py-24 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-petroleum-600 to-primary-800 z-0" />

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-petroleum-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15" />

        {/* Content */}
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
              {t('home.cta.title', '¿Listo para comenzar?')}
            </h2>
            <p className="font-sans text-lg text-gray-100 mb-10 leading-relaxed">
              Únete a miles de fabricantes, emprendedores y diseñadores que confían en Modeltex para sus creaciones.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
              <Link
                to="/catalogo"
                className="btn-primary px-8 py-3 text-lg font-semibold inline-flex items-center gap-2 hover:scale-105 transition-transform"
              >
                {t('common.viewCatalog', 'Ver catálogo')}
                <ArrowRight size={20} />
              </Link>
              {!user ? (
                <Link
                  to="/registro"
                  className="btn-accent px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform"
                >
                  {t('nav.register', 'Crear cuenta gratis')}
                </Link>
              ) : (
                <Link
                  to="/diseno-a-pedido"
                  className="btn-accent px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform"
                >
                  {t('nav.custom', 'Diseño a pedido')}
                </Link>
              )}
            </div>

            <p className="mt-8 text-primary-100 text-sm inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <span className="inline-flex items-center gap-1.5"><Zap className="w-4 h-4 text-accent-400" /> {t('trust.instant.title', 'Descarga inmediata')}</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-accent-400" /> {t('trust.secure.title', 'Compra segura')}</span>
              <span className="inline-flex items-center gap-1.5"><Headphones className="w-4 h-4 text-accent-400" /> {t('trust.support.title', 'Soporte post-compra')}</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;


