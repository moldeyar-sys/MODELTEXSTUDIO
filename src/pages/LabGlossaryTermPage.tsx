import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ScrollText } from 'lucide-react';
import { useSeo, useStructuredData } from '../lib/seo';
import { fetchGlossaryTermBySlug } from '../lib/labData';
import type { LabGlossaryTerm } from '../lib/labTypes';
import { SCHEMA_IDS } from '../lib/schemaIds';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

const SITE_URL = 'https://modeltex.com.ar';

export default function LabGlossaryTermPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [term, setTerm] = useState<LabGlossaryTerm | null | undefined>(undefined);

  useEffect(() => {
    setTerm(undefined);
    fetchGlossaryTermBySlug(slug).then(setTerm);
  }, [slug]);

  useSeo({
    title: term ? `${term.term} — Glosario de moldería` : 'Término no encontrado',
    description: term?.short_definition,
    path: `/lab/glosario/${slug}`,
    type: 'article',
    noindex: !term,
  });

  const pageUrl = `${SITE_URL}/lab/glosario/${slug}`;
  const definedTermSchema = useMemo(() => {
    if (!term) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'DefinedTerm',
      name: term.term,
      description: term.short_definition,
      inDefinedTermSet: `${SITE_URL}/lab/glosario`,
    };
  }, [term]);
  useStructuredData(definedTermSchema, SCHEMA_IDS.definedTerm);

  const breadcrumbSchema = useMemo(() => {
    if (!term) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Modeltex Lab', item: `${SITE_URL}/lab` },
        { '@type': 'ListItem', position: 3, name: 'Glosario', item: `${SITE_URL}/lab/glosario` },
        { '@type': 'ListItem', position: 4, name: term.term, item: pageUrl },
      ],
    };
  }, [term, pageUrl]);
  useStructuredData(breadcrumbSchema, SCHEMA_IDS.breadcrumb);

  if (term === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petroleum-50">
        <div className="text-center bg-white border border-gray-100 rounded-2xl px-8 py-10 shadow-sm">
          <p className="text-gray-500 text-lg mb-4">Término no encontrado</p>
          <Link to="/lab/glosario" className="btn-primary">Ver glosario completo</Link>
        </div>
      </div>
    );
  }

  if (!term) {
    return <div className="min-h-[60vh] flex items-center justify-center bg-petroleum-50" />;
  }

  return (
    <div className="min-h-screen bg-petroleum-50">
      <div className="container-custom py-8 sm:py-12 max-w-2xl mx-auto">
        <Breadcrumbs
          items={[{ label: 'Inicio', to: '/' }, { label: 'Modeltex Lab', to: '/lab' }, { label: 'Glosario', to: '/lab/glosario' }, { label: term.term }]}
          className="mb-4"
        />
        <Link to="/lab/glosario" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-800 transition-colors mb-5">
          <ArrowLeft className="w-4 h-4" /> Glosario completo
        </Link>
        <div className="card p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800 mb-4">
            <ScrollText className="w-4 h-4" /> Glosario de moldería
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary-900">{term.term}</h1>
          <p className="text-lg text-gray-700 mt-3 font-medium">{term.short_definition}</p>
          {term.explanation && <p className="text-gray-700 leading-relaxed mt-4">{term.explanation}</p>}
          {term.example && (
            <div className="mt-5 rounded-xl bg-accent-50 border border-accent-100 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-accent-700 mb-1">Ejemplo</p>
              <p className="text-sm text-gray-800">{term.example}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
