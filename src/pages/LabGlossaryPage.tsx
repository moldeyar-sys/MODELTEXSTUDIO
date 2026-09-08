import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Search, ScrollText } from 'lucide-react';
import { useSeo, useStructuredData } from '../lib/seo';
import { fetchGlossaryTerms } from '../lib/labData';
import type { LabGlossaryTerm } from '../lib/labTypes';
import { SCHEMA_IDS } from '../lib/schemaIds';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

const SITE_URL = 'https://modeltex.com.ar';
const GLOSSARY_DESCRIPTION = 'Glosario con los términos más usados de moldería textil: holgura, piquetes, tiro, tizada y más.';

export default function LabGlossaryPage() {
  const [terms, setTerms] = useState<LabGlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useSeo({
    title: 'Glosario de moldería textil — Modeltex Lab',
    description: GLOSSARY_DESCRIPTION,
    path: '/lab/glosario',
  });

  const collectionSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Glosario de moldería',
      description: GLOSSARY_DESCRIPTION,
      url: `${SITE_URL}/lab/glosario`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: terms.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.term, url: `${SITE_URL}/lab/glosario/${t.slug}` })),
      },
    }),
    [terms],
  );
  useStructuredData(terms.length ? collectionSchema : null, SCHEMA_IDS.collectionPage);

  const breadcrumbSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Modeltex Lab', item: `${SITE_URL}/lab` },
        { '@type': 'ListItem', position: 3, name: 'Glosario', item: `${SITE_URL}/lab/glosario` },
      ],
    }),
    [],
  );
  useStructuredData(breadcrumbSchema, SCHEMA_IDS.breadcrumb);

  useEffect(() => {
    fetchGlossaryTerms().then((t) => {
      setTerms(t);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter((t) => `${t.term} ${t.short_definition}`.toLowerCase().includes(q));
  }, [terms, search]);

  return (
    <div className="min-h-screen bg-petroleum-50">
      <section className="bg-gradient-to-br from-primary-900 to-petroleum-900 text-white">
        <div className="container-custom py-10 sm:py-14">
          <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Modeltex Lab', to: '/lab' }, { label: 'Glosario' }]} variant="dark" className="mb-4" />
          <Link to="/lab" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-5">
            <ArrowLeft className="w-4 h-4" /> Modeltex Lab
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-bold flex items-center gap-3">
            <ScrollText className="w-8 h-8" /> Glosario de moldería
          </h1>
          <p className="text-white/80 mt-3 max-w-xl">Los términos más usados de moldería y producción textil, explicados en simple.</p>
        </div>
      </section>

      <div className="container-custom py-8 sm:py-12">
        <div className="max-w-md mb-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar un término..."
            className="input-field pl-10"
          />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4 h-24 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No encontramos términos con esa búsqueda.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <Link key={t.id} to={`/lab/glosario/${t.slug}`} className="card p-4 hover:border-primary-200 transition-colors group">
                <p className="font-semibold text-primary-900 flex items-center justify-between">
                  {t.term} <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600 transition-colors" />
                </p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{t.short_definition}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
