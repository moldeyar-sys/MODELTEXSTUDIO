import { MessageCircle, Send, Facebook, ShieldCheck, Layers, Sparkles } from 'lucide-react';
import { useSeo, useStructuredData } from '../lib/seo';
import { SCHEMA_IDS } from '../lib/schemaIds';
import { SITE, CONTACT, WHATSAPP_LINK, TELEGRAM_LINK, FACEBOOK_LINK, organizationSchemaId, factOrUndefined } from '../lib/siteConfig';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

const SITE_URL = 'https://modeltex.com.ar';

// Todo el contenido de esta página sale de siteConfig.ts (fuente única de
// verdad institucional): nada de historia, fundadores, premios o clientes
// inventados. Lo que todavía no está confirmado (email, horario, ciudad,
// autor humano) simplemente no aparece acá — ver PENDING_FIELDS.
export default function AboutPage() {
  useSeo({
    title: 'Quiénes somos',
    description: `${SITE.description} Conocé quiénes hacemos Modeltex y cómo contactarnos.`,
    path: '/quienes-somos',
  });

  useStructuredData(
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'Quiénes somos | Modeltex',
      url: `${SITE_URL}/quienes-somos`,
      about: { '@id': organizationSchemaId() },
    },
    SCHEMA_IDS.aboutPage,
  );
  useStructuredData(
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Quiénes somos', item: `${SITE_URL}/quienes-somos` },
      ],
    },
    SCHEMA_IDS.breadcrumb,
  );

  const city = factOrUndefined(CONTACT.city);

  const contactMethods = [
    { icon: MessageCircle, label: 'WhatsApp', href: WHATSAPP_LINK, color: 'text-green-700 bg-green-50' },
    { icon: Send, label: 'Telegram', href: TELEGRAM_LINK, color: 'text-sky-700 bg-sky-50' },
    { icon: Facebook, label: 'Facebook', href: FACEBOOK_LINK, color: 'text-blue-700 bg-blue-50' },
  ];

  return (
    <div className="min-h-screen bg-petroleum-50">
      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-8 sm:py-12">
          <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Quiénes somos' }]} className="mb-4" />
          <div className="max-w-3xl">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-900 leading-tight">Quiénes somos</h1>
            <p className="text-base sm:text-lg text-gray-700 mt-4 leading-relaxed">{SITE.description}</p>
          </div>
        </div>
      </section>

      <div className="container-custom py-8 sm:py-12 grid md:grid-cols-3 gap-6">
        <div className="card p-6">
          <ShieldCheck className="w-6 h-6 text-primary-600 mb-3" />
          <h2 className="font-display text-lg font-bold text-primary-900 mb-2">Experiencia</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Más de {SITE.experienceYearsMin} años en la industria textil {SITE.countryName.toLowerCase()}, produciendo moldería para
            fabricantes, talleres y marcas.
          </p>
        </div>

        <div className="card p-6">
          <Layers className="w-6 h-6 text-primary-600 mb-3" />
          <h2 className="font-display text-lg font-bold text-primary-900 mb-2">Qué hacemos</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Moldes digitales con curva de talles completa en PDF A4, plotter y formatos CAD (DXF/AAMA, Optitex, Audaces), listos para
            producir sin pasos intermedios.
          </p>
        </div>

        <div className="card p-6">
          <Sparkles className="w-6 h-6 text-primary-600 mb-3" />
          <h2 className="font-display text-lg font-bold text-primary-900 mb-2">En qué nos especializamos</h2>
          <div className="flex flex-wrap gap-1.5">
            {SITE.knowsAbout.map((topic) => (
              <span key={topic} className="text-xs font-medium text-primary-700 bg-primary-50 px-2 py-1 rounded-full">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom pb-12">
        <div className="card p-6 sm:p-7">
          <h2 className="font-display text-xl font-bold text-primary-900 mb-1">Hablemos</h2>
          <p className="text-sm text-gray-500 mb-5">
            {city ? `Estamos en ${city}, ${SITE.countryName}. ` : `Operamos desde ${SITE.countryName}. `}
            Envíos digitales a todo el mundo.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {contactMethods.map((m) => (
              <a
                key={m.label}
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2.5 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold transition-colors hover:border-primary-200 ${m.color}`}
              >
                <m.icon className="w-4 h-4" /> {m.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
