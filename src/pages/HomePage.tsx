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
} from 'lucide-react';
import { ProductCard } from '../components/ui/ProductCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSeo } from '../lib/seo';
import { useLocale } from '../lib/locale';
import type { Product } from '../lib/types';

const HomePage = () => {
  const { user } = useAuth();
  const { t } = useLocale();
  useSeo({
    title: 'Moldes digitales de ropa para imprimir y producir',
    description: 'Comprá moldes digitales profesionales en PDF A4, plotter y formatos editables. Descarga inmediata para emprendedores textiles, talleres y diseñadores. Vendemos a todo el mundo.',
    path: '/',
  });
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
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
      title: 'Descargá instantáneamente',
      description: 'Después de pagar, obtén tus archivos al instante',
    },
    {
      icon: FileText,
      title: 'Formatos profesionales',
      description: 'PDF A4, Plotter, CDR, DXF y más',
    },
    {
      icon: Ruler,
      title: 'Todos los talles incluidos',
      description: 'Una compra, múltiples tamaños',
    },
    {
      icon: Globe,
      title: 'Envío internacional',
      description: 'Los archivos llegan a todo el mundo por descarga digital',
    },
  ];

  const howItWorks = [
    {
      number: 1,
      title: 'Creá tu cuenta',
      icon: ShoppingCart,
    },
    {
      number: 2,
      title: 'Elegí el molde o pack',
      icon: Package,
    },
    {
      number: 3,
      title: 'Agregá al carrito',
      icon: ShoppingCart,
    },
    {
      number: 4,
      title: 'Pagá',
      icon: Zap,
    },
    {
      number: 5,
      title: 'Descargá tus archivos',
      icon: Download,
    },
  ];

  const formats = [
    {
      name: 'PDF A4',
      description: 'Listo para imprimir en casa',
      icon: FileText,
    },
    {
      name: 'PDF Plotter',
      description: 'Para impresoras de rollo',
      icon: Ruler,
    },
    {
      name: 'PLT',
      description: 'Formato vectorial de ploteo',
      icon: Scissors,
    },
    {
      name: 'DXF',
      description: 'Compatible con CAD y maquinaria',
      icon: Palette,
    },
    {
      name: 'CDR',
      description: 'Editable en CorelDraw',
      icon: Palette,
    },
    {
      name: 'Sublimación',
      description: 'Para impresoras de sublimado',
      icon: FileText,
    },
  ];

  const faqItems = [
    {
      question: '¿Los moldes son digitales?',
      answer:
        'Sí, son archivos digitales que descargás después de comprar. No recibirás nada físico, solo archivos que podrás usar en tu computadora.',
    },
    {
      question: '¿Puedo imprimir en A4?',
      answer:
        'Sí, todos nuestros moldes incluyen una versión PDF A4 lista para imprimir en casa con cualquier impresora.',
    },
    {
      question: '¿Puedo imprimir en plotter?',
      answer:
        'Sí, muchos moldes incluyen versión para plotter (PDF y PLT). Verifica en la descripción del producto si incluye este formato.',
    },
    {
      question: '¿Cuándo recibo el archivo?',
      answer:
        'Inmediatamente después de confirmarse el pago. Recibirás un email con los links de descarga y acceso a tu panel de cliente.',
    },
    {
      question: '¿Qué pasa si pago por transferencia?',
      answer:
        'Debemos confirmar el pago manualmente, puede demorar hasta 24hs. Una vez confirmado, activamos tu descarga de forma automática.',
    },
    {
      question: '¿Hacen moldes personalizados?',
      answer:
        'Sí, podés solicitar un diseño a pedido. Accedé a nuestra sección de "Diseño a pedido" para conocer más detalles y obtener un presupuesto personalizado.',
    },
    {
      question: '¿Venden a otros países?',
      answer:
        'Sí, los archivos digitales llegan a todo el mundo por descarga. No tenemos limitaciones de envío geográfico.',
    },
    {
      question: '¿Puedo pedir modificaciones?',
      answer:
        'Sí, contactanos por WhatsApp para consultar sobre modificaciones. Evaluaremos tu pedido y te pasaremos un presupuesto.',
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
      <section className="relative pt-16 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-petroleum-600 opacity-95 z-0" />

        {/* Geometric Patterns */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-petroleum-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" />

        {/* Content */}
        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Text */}
            <div className="flex-1 max-w-2xl text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/10">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('home.hero.badge', '18+ años en la industria textil')}</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {t('home.hero.title', 'Moldería textil profesional para fabricantes de indumentaria')}
              </h1>

              <p className="font-sans text-lg md:text-xl text-gray-100 mb-10 leading-relaxed">
                {t('home.hero.subtitle', 'Moldes digitales y en cartón, packs, moldería a pedido y tizado computarizado. Precisión industrial, escalado completo y entrega rápida para que produzcas sin demoras.')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center flex-wrap">
                <Link
                  to="/catalogo"
                  className="btn-primary px-8 py-3 text-lg font-semibold inline-flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  Ver catalogo
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/registro"
                  className="btn-secondary px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform"
                >
                  Crear cuenta
                </Link>
                <Link
                  to="/diseno-a-pedido"
                  className="btn-accent px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform"
                >
                  Diseno a pedido
                </Link>
              </div>
            </div>

            {/* Right: imagen real de Modeltex */}
            <div className="flex-shrink-0 w-full max-w-md">
              <div className="relative">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent-500/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-petroleum-400/30 rounded-full blur-3xl" />
                <img
                  src="/brand/modeltex-hero.webp"
                  alt="Modeltex - Moldería de precisión: patronaje digital profesional"
                  className="relative w-full rounded-3xl shadow-2xl border border-white/20"
                />
                <div className="relative mt-4 flex flex-wrap justify-center gap-2">
                  {['PDF A4', 'Plotter', 'DXF', 'CDR', 'PLT'].map((f, i) => (
                    <span
                      key={f}
                      className={i === 0
                        ? 'bg-accent-500 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow'
                        : 'bg-white/10 text-white/85 text-xs font-medium px-2.5 py-1 rounded-lg border border-white/15'}
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
      <section className="py-20 bg-gray-50">
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
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-900 mb-4">{t('home.featured.title', 'Productos destacados')}</h2>
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
              <p className="font-sans text-gray-500 text-lg">No hay productos destacados en este momento</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/catalogo"
              className="btn-primary px-8 py-3 text-lg font-semibold inline-flex items-center gap-2 hover:scale-105 transition-transform"
            >
              Ver catálogo completo
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-24 bg-gradient-to-br from-petroleum-50 to-primary-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-900 mb-4">¿Cómo funciona?</h2>
            <p className="font-sans text-lg text-gray-600 max-w-2xl mx-auto">
              5 pasos simples para conseguir tus moldes digitales
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
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-900 mb-4">Formatos disponibles</h2>
            <p className="font-sans text-lg text-gray-600 max-w-2xl mx-auto">
              Trabajamos con los mejores formatos para que uses nuestros moldes en tus herramientas preferidas
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
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-900 mb-4">{t('home.testimonials.title', 'Lo que dicen nuestros clientes')}</h2>
            <p className="font-sans text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.testimonials.subtitle', 'Emprendedores, talleres y diseñadores de toda Latinoamérica ya producen con Modeltex')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
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
      <section className="py-24 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-900 mb-4">Preguntas frecuentes</h2>
            <p className="font-sans text-lg text-gray-600 max-w-2xl mx-auto">
              Resolvemos tus dudas sobre nuestros moldes digitales
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
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-petroleum-700 z-0" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="container-custom relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
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
            <span className="inline-flex items-center gap-2"><FileText className="w-4 h-4 text-accent-400" /> {t('trust.formats', 'PDF A4, Plotter, DXF, CDR y PLT')}</span>
            <span className="inline-flex items-center gap-2"><Download className="w-4 h-4 text-accent-400" /> {t('trust.access', 'Acceso permanente desde tu cuenta')}</span>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-petroleum-600 to-primary-800 z-0" />

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-petroleum-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15" />

        {/* Content */}
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
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
