import { Link } from 'react-router-dom';
import { HelpCircle, ArrowRight, MessageCircle } from 'lucide-react';
import { useSeo, useStructuredData } from '../lib/seo';
import { FAQ_ITEMS } from '../lib/faqData';

export default function FaqPage() {
  useSeo({
    title: 'Preguntas frecuentes sobre moldes digitales',
    description:
      'Respuestas claras sobre moldes de ropa digitales: formatos (PDF A4, plotter, DXF/AAMA, Optitex, Audaces), talles incluidos, cómo imprimir sin perder escala, pagos y entrega.',
    path: '/preguntas-frecuentes',
  });

  useStructuredData(
    [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://modeltex.com.ar/' },
          { '@type': 'ListItem', position: 2, name: 'Preguntas frecuentes', item: 'https://modeltex.com.ar/preguntas-frecuentes' },
        ],
      },
    ],
    'faq-schema',
  );

  return (
    <div className="min-h-screen bg-petroleum-50">
      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-10 sm:py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800">
              <HelpCircle className="w-4 h-4" /> Preguntas frecuentes
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-900 mt-5 leading-tight">
              Todo lo que necesitás saber antes de comprar tus moldes
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
              Formatos, talles, impresión, pagos y entrega — explicado corto y sin vueltas. Si te queda alguna duda,
              escribinos por WhatsApp y te respondemos al toque.
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom py-8 sm:py-12">
        <div className="max-w-3xl space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="card group p-0 overflow-hidden">
              <summary className="cursor-pointer list-none px-5 py-4 flex items-start justify-between gap-3 font-medium text-primary-900 hover:bg-primary-50/50 transition-colors">
                <span>{item.q}</span>
                <span className="text-primary-400 group-open:rotate-90 transition-transform mt-0.5 flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </summary>
              <p className="px-5 pb-5 text-sm sm:text-base text-gray-600 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="max-w-3xl mt-10 card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-primary-900">¿No encontraste tu respuesta?</h2>
            <p className="text-gray-600 text-sm mt-1">Consultanos directo o mirá el catálogo completo.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/contacto" className="btn-secondary inline-flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> Contacto
            </Link>
            <Link to="/catalogo" className="btn-primary inline-flex items-center justify-center gap-2">
              Ver catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
