import { FileText, Printer, Ruler, ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FloatingPatterns } from '../components/ui/FloatingPatterns';
import { useSeo, useStructuredData } from '../lib/seo';

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

export default function MoldesPdfPage() {
  useSeo({
    title: 'Moldes PDF para imprimir y producir',
    description:
      'Moldes PDF para imprimir: moldes de ropa en PDF A4 y PDF plotter con descarga inmediata. Modeltex ofrece molderia digital profesional para imprimir, cortar y producir.',
    path: '/moldes-pdf',
  });

  useStructuredData(
    [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Moldes PDF para imprimir y producir',
        url: 'https://modeltex.com.ar/moldes-pdf',
        description:
          'Moldes PDF para imprimir en A4 o plotter. Molderia digital profesional con descarga inmediata.',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://modeltex.com.ar/' },
          { '@type': 'ListItem', position: 2, name: 'Moldes PDF', item: 'https://modeltex.com.ar/moldes-pdf' },
        ],
      },
    ],
    'moldes-pdf-schema',
  );

  return (
    <div className="min-h-screen bg-petroleum-50">
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <FloatingPatterns variant="dark" />
        <div className="container-custom py-10 sm:py-14">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800">
              <FileText className="w-4 h-4" /> SEO landing
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
              Si alguien busca en Google frases como <strong>moldes PDF</strong>, <strong>moldes para imprimir</strong>
              {' '}o <strong>moldes de ropa PDF</strong>, esta pagina le deja claro que ofreces exactamente eso:
              archivos listos para imprimir, con uso real para produccion textil.
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
      </div>
    </div>
  );
}
