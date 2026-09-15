// Pagina pilar de "molderia digital". El texto NO vive aca: sale de
// src/lib/molderiaDigital.ts, el mismo modulo que usa middleware.ts para armar
// el HTML inicial. Asi la version con y sin JavaScript dicen exactamente lo
// mismo (ver el comentario de cabecera de ese archivo).
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, MessageCircle, Ruler, Sparkles } from 'lucide-react';
import { FloatingPatterns } from '../components/ui/FloatingPatterns';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { useSeo, useStructuredData } from '../lib/seo';
import { SCHEMA_IDS } from '../lib/schemaIds';
import { WHATSAPP_LINK } from '../lib/siteConfig';
import {
  MD_CATEGORIAS,
  MD_DESCRIPTION,
  MD_FAQS,
  MD_FORMATOS,
  MD_GUIAS,
  MD_H1,
  MD_INTRO,
  MD_LINKS,
  MD_PATH,
  MD_SECTIONS,
  MD_TITLE,
} from '../lib/molderiaDigital';

const SITE_URL = 'https://modeltex.com.ar';

/** La sección de formatos se renderiza como tabla, no como párrafos. */
const FORMATOS_H2 = 'Qué formato de molde digital conviene según cómo cortás';

export default function MolderiaDigitalPage() {
  useSeo({ title: MD_TITLE, description: MD_DESCRIPTION, path: MD_PATH });

  useStructuredData(
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: MD_TITLE,
      url: `${SITE_URL}${MD_PATH}`,
      description: MD_DESCRIPTION,
      inLanguage: 'es-AR',
      about: { '@id': `${SITE_URL}/#organization` },
      isPartOf: { '@type': 'WebSite', url: `${SITE_URL}/` },
    },
    SCHEMA_IDS.webPage,
  );
  useStructuredData(
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Moldería digital', item: `${SITE_URL}${MD_PATH}` },
      ],
    },
    SCHEMA_IDS.breadcrumb,
  );
  useStructuredData(
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: MD_FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
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
            <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Moldería digital' }]} className="mb-4" />
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800">
              <Ruler className="w-4 h-4" /> Moldería digital para producción
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-900 mt-5 leading-tight text-balance">
              {MD_H1}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">{MD_INTRO}</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to="/catalogo" className="btn-primary inline-flex items-center justify-center gap-2">
                Ver el catálogo de moldes <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/moldes-gratis" className="btn-secondary inline-flex items-center justify-center gap-2">
                Probar un molde gratis
              </Link>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Pedir moldería a medida
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-8 sm:py-12 space-y-6">
        {MD_SECTIONS.map((section) => (
          <section key={section.h2} className="card p-6 sm:p-8 max-w-4xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary-900">{section.h2}</h2>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="text-gray-600 mt-4 leading-relaxed">
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-5 space-y-2.5">
                {section.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                    <Sparkles className="w-4 h-4 text-primary-700 flex-shrink-0 mt-1" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* La tabla de formatos va dentro de su propio H2, no suelta. */}
            {section.h2 === FORMATOS_H2 && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm border-collapse">
                  <thead>
                    <tr className="text-left">
                      <th className="border-b-2 border-primary-100 pb-2.5 pr-4 font-semibold text-primary-900">Formato</th>
                      <th className="border-b-2 border-primary-100 pb-2.5 pr-4 font-semibold text-primary-900">Para quién</th>
                      <th className="border-b-2 border-primary-100 pb-2.5 pr-4 font-semibold text-primary-900">Cómo se usa</th>
                      <th className="border-b-2 border-primary-100 pb-2.5 font-semibold text-primary-900">A tener en cuenta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MD_FORMATOS.map((f) => (
                      <tr key={f.formato} className="align-top">
                        <td className="border-b border-gray-100 py-3 pr-4 font-semibold text-primary-800 whitespace-nowrap">{f.formato}</td>
                        <td className="border-b border-gray-100 py-3 pr-4 text-gray-700">{f.paraQuien}</td>
                        <td className="border-b border-gray-100 py-3 pr-4 text-gray-600">{f.comoSeUsa}</td>
                        <td className="border-b border-gray-100 py-3 text-gray-600">{f.ojo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}

        <section className="card p-6 sm:p-8 max-w-4xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary-900">Preguntas frecuentes sobre moldería digital</h2>
          <div className="mt-4 divide-y divide-gray-100">
            {MD_FAQS.map((item) => (
              <div key={item.q} className="py-4 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-primary-900">{item.q}</h3>
                <p className="text-gray-600 mt-2 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6 sm:p-8 max-w-4xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary-900">Seguir por acá</h2>
          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            {MD_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group rounded-xl border border-gray-200 bg-white p-4 hover:border-primary-200 hover:bg-primary-50/40 transition-colors"
              >
                <span className="flex items-center gap-2 font-semibold text-primary-800 group-hover:text-primary-900">
                  <FileText className="w-4 h-4 flex-shrink-0" /> {l.label}
                </span>
                <span className="block text-sm text-gray-500 mt-1.5">{l.hint}</span>
              </Link>
            ))}
          </div>

          <h3 className="font-semibold text-primary-900 mt-8">Moldes digitales por categoría</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {MD_CATEGORIAS.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-700 hover:border-primary-200 hover:text-primary-800 transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </div>

          <h3 className="font-semibold text-primary-900 mt-8">Guías relacionadas</h3>
          <ul className="mt-3 space-y-2">
            {MD_GUIAS.map((g) => (
              <li key={g.to}>
                <Link to={g.to} className="text-primary-700 hover:text-primary-900 hover:underline text-sm sm:text-base">
                  {g.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6 sm:p-8 max-w-4xl bg-primary-900 text-white">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">¿Sabés qué querés producir?</h2>
          <p className="text-white/80 mt-3 leading-relaxed">
            Si la prenda es estándar, está en el catálogo y la descargás hoy. Si necesitás tu propia tabla de medidas o una
            prenda con un detalle particular, la desarrollamos a medida en el formato que uses.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link to="/catalogo" className="btn-primary bg-white text-primary-900 hover:bg-gray-100 inline-flex items-center justify-center gap-2">
              Buscar mi molde en el catálogo <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary border-white/30 text-white hover:bg-white/10 inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Consultar por WhatsApp
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
