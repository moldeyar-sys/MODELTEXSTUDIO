import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useSeo, useStructuredData } from '../lib/seo';
import { GUIAS, GUIAS_TITLE, GUIAS_DESCRIPTION } from '../lib/guiasData';

const SITE_URL = 'https://modeltex.com.ar';

export default function GuiasPage() {
  useSeo({
    title: GUIAS_TITLE,
    description: GUIAS_DESCRIPTION,
    path: '/guias',
  });

  useStructuredData(
    [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: GUIAS_TITLE,
        description: GUIAS_DESCRIPTION,
        url: `${SITE_URL}/guias`,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: GUIAS.map((g, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: g.title,
            url: `${SITE_URL}/guias/${g.slug}`,
          })),
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Guías', item: `${SITE_URL}/guias` },
        ],
      },
    ],
    'page-schema',
  );

  return (
    <div className="min-h-screen bg-petroleum-50">
      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-10 sm:py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800">
              <BookOpen className="w-4 h-4" /> Guías para producción
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-900 mt-5 leading-tight">{GUIAS_TITLE}</h1>
            <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">{GUIAS_DESCRIPTION}</p>
          </div>
        </div>
      </section>

      <div className="container-custom py-8 sm:py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIAS.map((g) => (
            <Link
              key={g.slug}
              to={`/guias/${g.slug}`}
              className="card p-5 sm:p-6 flex flex-col gap-3 hover:shadow-md transition-shadow group"
            >
              <h2 className="font-display text-lg font-bold text-primary-900 leading-snug group-hover:text-primary-700">{g.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">{g.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-700">
                Leer la guía <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>

        <div className="max-w-3xl mt-10 card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-primary-900">¿Listo para producir?</h2>
            <p className="text-gray-600 text-sm mt-1">Más de 2.000 moldes con la curva de talles completa, en PDF, plotter y formatos CAD.</p>
          </div>
          <Link to="/catalogo" className="btn-primary inline-flex items-center justify-center gap-2">
            Ver catálogo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
