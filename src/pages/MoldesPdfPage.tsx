import { FileText, Printer, Ruler, ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FloatingPatterns } from '../components/ui/FloatingPatterns';
import { useSeo, useStructuredData } from '../lib/seo';
import { SCHEMA_IDS } from '../lib/schemaIds';

const benefits = [
  'Moldes PDF listos para imprimir en A4 o plotter.',
  'Talles completos para producir sin empezar de cero.',
  'Descarga inmediata desde tu cuenta.',
  'Opciones para emprendimientos, talleres y fabricantes.',
];

const sections = [
  {
    title: 'Moldes PDF A4 para imprimir en casa',
    text: 'Si buscas moldes PDF para imprimir en hojas A4, esta es la opcion mas practica para probar talles, validar prendas y empezar a producir sin plotter.',
    href: '/catalogo?formato=PDF%20A4',
    cta: 'Ver moldes PDF A4',
    icon: Printer,
  },
  {
    title: 'Moldes PDF para plotter',
    text: 'Para talleres, graficas o produccion continua, los moldes PDF plotter te permiten imprimir piezas grandes sin cortar ni unir hojas.',
    href: '/catalogo?formato=PDF%20Plotter',
    cta: 'Ver moldes PDF plotter',
    icon: Ruler,
  },
  {
    title: 'Moldes de ropa PDF con descarga inmediata',
    text: 'Modeltex ofrece moldes de ropa PDF para producir mas rapido: shorts, buzos, remeras, pantalones y mas, con talles y formatos profesionales.',
    href: '/catalogo',
    cta: 'Ir al catalogo completo',
    icon: Download,
  },
];

const pdfFaqs = [
  {
    q: '¿Qué son los moldes en PDF?',
    a: 'Son moldes de ropa digitales entregados en un archivo PDF, listos para imprimir y cortar: incluyen todas las piezas de la prenda a escala real, la curva de talles completa y un cuadrado de control para verificar que la impresión no perdió medida.',
  },
  {
    q: '¿Los moldes PDF ya están listos para imprimir?',
    a: 'Sí: cada archivo se descarga, se imprime al 100% de escala (nunca "ajustar a la página") y se corta, sin ningún paso de edición previo. En PDF A4 se pegan las hojas numeradas; en PDF plotter sale en una sola lámina de ancho real.',
  },
  {
    q: '¿Qué diferencia hay entre un molde PDF A4 y uno para plotter?',
    a: 'El PDF A4 viene partido en hojas carta u oficio para imprimir en cualquier impresora casera y pegar siguiendo la numeración; es la opción más económica. El PDF plotter es la misma pieza completa en una sola lámina de 90, 120 o 150 cm de ancho, pensada para imprimirse en una gráfica de ploteo y usarse directo en un taller.',
  },
  {
    q: '¿Qué necesito para imprimir un molde en PDF sin que pierda la escala?',
    a: 'En A4 alcanza con una impresora casera configurada al 100% de escala; en plotter hace falta llevar el archivo a un servicio de ploteo textil. En los dos casos hay que verificar el cuadrado de control con una regla antes de cortar, para confirmar que la impresión salió a tamaño real.',
  },
  {
    q: '¿Los moldes PDF incluyen todos los talles?',
    a: 'Sí, cada molde PDF incluye la curva de talles completa (XS a 4XL en adultos, 2 a 18 en niños) ya escalada y aprobada con una muestra confeccionada; en la ficha del producto elegís qué talles llevar.',
  },
  {
    q: '¿Puedo usar los moldes PDF para producir y vender ropa?',
    a: 'Sí, la licencia es de uso productivo: podés confeccionar y vender las prendas hechas con el molde sin límite de unidades. Lo único que no está permitido es revender o redistribuir el archivo del molde en sí.',
  },
  {
    q: '¿Qué significa que un molde esté "listo para imprimir"?',
    a: 'Que no hace falta ningún paso de edición ni ajuste antes de imprimirlo: el archivo ya viene con las piezas ordenadas, a escala real y con un cuadrado de control de medida. Lo único que tenés que hacer es abrirlo, imprimirlo al 100% de escala (nunca "ajustar a la página") y cortar.',
  },
  {
    q: '¿Dónde consigo moldes listos en PDF para imprimir hoy mismo?',
    a: 'En el catálogo de Modeltex: elegís el molde, lo comprás y lo tenés disponible para descargar al momento (los marcados como "descarga rápida" se habilitan apenas se confirma el pago). No hay tiempos de espera de envío porque es un archivo digital, no un producto físico.',
  },
];

export default function MoldesPdfPage() {
  useSeo({
    title: 'Moldes PDF para imprimir: listos para producir',
    description:
      'Moldes PDF para imprimir y moldes listos para imprimir: moldes de ropa en PDF A4 y PDF plotter con curva de talles completa y descarga inmediata. Molderia digital profesional.',
    path: '/moldes-pdf',
  });

  useStructuredData(
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Moldes PDF para imprimir y producir',
      url: 'https://modeltex.com.ar/moldes-pdf',
      description: 'Moldes PDF para imprimir en A4 o plotter. Molderia digital profesional con descarga inmediata.',
    },
    SCHEMA_IDS.collectionPage,
  );
  useStructuredData(
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://modeltex.com.ar/' },
        { '@type': 'ListItem', position: 2, name: 'Moldes PDF', item: 'https://modeltex.com.ar/moldes-pdf' },
      ],
    },
    SCHEMA_IDS.breadcrumb,
  );
  useStructuredData(
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: pdfFaqs.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    SCHEMA_IDS.faq,
  );

  return (
    <div className="min-h-screen bg-petroleum-50">
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <FloatingPatterns variant="dark" />
        <div className="container-custom py-10 sm:py-14">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800">
              <FileText className="w-4 h-4" /> Moldes digitales
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-900 mt-5 leading-tight">
              Moldes PDF para imprimir, cortar y producir
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mt-4 max-w-3xl leading-relaxed">
              En Modeltex encuentras moldes PDF para imprimir en A4 o plotter, con talles listos para produccion,
              descarga inmediata y formatos profesionales para emprendimientos, talleres y fabricantes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to="/catalogo?formato=PDF%20A4" className="btn-primary inline-flex items-center gap-2">
                Ver moldes PDF A4 <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/catalogo?formato=PDF%20Plotter" className="btn-secondary inline-flex items-center gap-2">
                Ver moldes PDF plotter
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-8 sm:py-10">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6 items-start">
          <div className="card p-6 sm:p-7">
            <h2 className="font-display text-2xl font-bold text-primary-900">Que tipo de moldes PDF puedes encontrar</h2>
            <p className="text-gray-600 mt-3 leading-relaxed">
              Todos nuestros <strong>moldes PDF</strong> son <strong>moldes para imprimir</strong> listos para
              produccion textil real: los descargas, los imprimis en A4 o plotter y cortas. Cada archivo incluye
              su curva de talles completa y control de medida para verificar la escala.
            </p>
            <div className="mt-5 space-y-3">
              {benefits.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-primary-700 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900 text-lg">{section.title}</h3>
                      <p className="text-gray-600 mt-2 leading-relaxed">{section.text}</p>
                      <Link to={section.href} className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-900 mt-4">
                        {section.cta} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6 sm:p-7 mt-6 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-primary-900">Moldes listos para imprimir: qué incluye cada archivo</h2>
          <p className="text-gray-600 mt-3 leading-relaxed">
            Un molde listo para imprimir no necesita ningún ajuste antes de usarse: las piezas ya vienen ordenadas
            a escala real, numeradas si es PDF A4, y con un cuadrado de control de medida para verificar con una
            regla que la impresión no perdió escala. Es la diferencia entre un molde PDF y un dibujo cualquiera de
            una prenda: acá cada línea está pensada para cortar tela real.
          </p>
          <p className="text-gray-600 mt-3 leading-relaxed">
            Si es tu primera vez imprimiendo un molde digital, la <Link to="/ayuda-impresion" className="text-primary-700 font-medium hover:text-primary-900">guía de ayuda para imprimir</Link> explica
            paso a paso cómo configurar la escala en A4 y en plotter. Para producción en serie, también tenemos una
            guía completa sobre <Link to="/guias/impresion-de-moldes-en-plotter" className="text-primary-700 font-medium hover:text-primary-900">cómo imprimir moldes en plotter para un taller</Link>.
          </p>
        </div>

        <div className="card p-6 sm:p-7 mt-6">
          <h2 className="font-display text-2xl font-bold text-primary-900">Preguntas frecuentes sobre moldes PDF</h2>
          <div className="mt-4 divide-y divide-gray-100">
            {pdfFaqs.map((item) => (
              <div key={item.q} className="py-4 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-primary-900">{item.q}</h3>
                <p className="text-gray-600 mt-2 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
