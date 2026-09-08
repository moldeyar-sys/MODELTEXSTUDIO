import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, GraduationCap, HelpCircle } from 'lucide-react';
import { useSeo, useStructuredData } from '../lib/seo';
import { findGuia, getRelatedGuias } from '../lib/guiasData';
import { SCHEMA_IDS } from '../lib/schemaIds';
import { getArticleAuthor, SITE } from '../lib/siteConfig';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { fetchLessonsForGuide, type RelatedLabLesson } from '../lib/labData';

const SITE_URL = 'https://modeltex.com.ar';

export default function GuiaDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const guia = findGuia(slug);
  const pageUrl = `${SITE_URL}/guias/${slug}`;

  useSeo({
    title: guia ? guia.seoTitle : 'Guía no encontrada',
    description: guia?.description,
    path: `/guias/${slug}`,
    type: 'article',
    noindex: !guia,
  });

  const articleSchema = useMemo(() => {
    if (!guia) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guia.title,
      description: guia.description,
      image: `${SITE_URL}/brand/og-image.png`,
      inLanguage: 'es-AR',
      datePublished: guia.updated,
      dateModified: guia.updated,
      keywords: guia.keywords.join(', '),
      mainEntityOfPage: pageUrl,
      author: getArticleAuthor(),
      publisher: { '@type': 'Organization', name: SITE.name, url: `${SITE_URL}/`, logo: { '@type': 'ImageObject', url: SITE.logo } },
    };
  }, [guia, pageUrl]);
  useStructuredData(articleSchema, SCHEMA_IDS.article);

  const faqSchema = useMemo(() => {
    if (!guia || !guia.faqs.length) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guia.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };
  }, [guia]);
  useStructuredData(faqSchema, SCHEMA_IDS.faq);

  const breadcrumbSchema = useMemo(() => {
    if (!guia) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Guías', item: `${SITE_URL}/guias` },
        { '@type': 'ListItem', position: 3, name: guia.title, item: pageUrl },
      ],
    };
  }, [guia, pageUrl]);
  useStructuredData(breadcrumbSchema, SCHEMA_IDS.breadcrumb);

  const [labLessons, setLabLessons] = useState<RelatedLabLesson[]>([]);
  useEffect(() => {
    if (!guia) return;
    let active = true;
    fetchLessonsForGuide(guia.slug).then((rows) => {
      if (active) setLabLessons(rows);
    });
    return () => {
      active = false;
    };
  }, [guia]);

  if (!guia) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petroleum-50">
        <div className="text-center bg-white border border-gray-100 rounded-2xl px-8 py-10 shadow-sm">
          <p className="text-gray-500 text-lg mb-4">Guía no encontrada</p>
          <Link to="/guias" className="btn-primary">Ver todas las guías</Link>
        </div>
      </div>
    );
  }

  const otras = getRelatedGuias(guia.slug, 6);

  return (
    <div className="min-h-screen bg-petroleum-50">
      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-8 sm:py-12">
          <Breadcrumbs
            items={[{ label: 'Inicio', to: '/' }, { label: 'Guías', to: '/guias' }, { label: guia.title }]}
            className="mb-4"
          />
          <Link to="/guias" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-800 transition-colors mb-5">
            <ArrowLeft className="w-4 h-4" /> Todas las guías
          </Link>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800">
              <BookOpen className="w-4 h-4" /> Guía para producción
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-900 mt-5 leading-tight">{guia.title}</h1>
            <p className="text-base sm:text-lg text-gray-700 mt-4 leading-relaxed">{guia.intro}</p>
            <p className="text-xs text-gray-400 mt-3">Actualizado el {guia.updated}</p>
          </div>
        </div>
      </section>

      <div className="container-custom py-8 sm:py-12 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
        <article className="max-w-3xl space-y-8">
          {guia.sections.map((s) => (
            <section key={s.h2} className="card p-5 sm:p-7">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-primary-900 mb-3">{s.h2}</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                {s.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {s.bullets && s.bullets.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1.5">
                    {s.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <section className="card p-5 sm:p-7">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-primary-900 mb-4 inline-flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary-600" /> Preguntas frecuentes
            </h2>
            <div className="space-y-2">
              {guia.faqs.map((f) => (
                <details key={f.q} className="group rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                  <summary className="cursor-pointer list-none px-4 py-3 flex items-start justify-between gap-3 font-medium text-primary-900">
                    <span>{f.q}</span>
                    <ArrowRight className="w-4 h-4 text-primary-400 group-open:rotate-90 transition-transform mt-0.5 flex-shrink-0" />
                  </summary>
                  <p className="px-4 pb-4 text-sm sm:text-base text-gray-600 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary-900 text-white border-0">
            <div>
              <h2 className="font-display text-xl font-bold">Moldes listos para producir</h2>
              <p className="text-primary-100 text-sm mt-1">Curva de talles completa incluida, en PDF A4, plotter y formatos CAD.</p>
            </div>
            <Link to="/catalogo" className="btn-primary inline-flex items-center justify-center gap-2 bg-white text-primary-900 hover:bg-primary-50">
              Ver catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </article>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-bold text-primary-900 mb-3">Relacionado</h2>
            <ul className="space-y-2">
              {guia.related.map((r) => (
                <li key={r.to}>
                  <Link to={r.to} className="text-sm text-primary-700 hover:text-primary-900 hover:underline">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {labLessons.length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-bold text-primary-900 mb-3 inline-flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-primary-600" /> Clases de Modeltex Lab
              </h2>
              <ul className="space-y-2">
                {labLessons.map(({ lesson, courseSlug, moduleSlug }) => (
                  <li key={lesson.id}>
                    <Link
                      to={`/lab/${courseSlug}/${moduleSlug}/${lesson.slug}`}
                      className="text-sm text-primary-700 hover:text-primary-900 hover:underline"
                    >
                      {lesson.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-primary-900 mb-3">Más guías</h2>
            <ul className="space-y-2">
              {otras.map((g) => (
                <li key={g.slug}>
                  <Link to={`/guias/${g.slug}`} className="text-sm text-gray-700 hover:text-primary-900 hover:underline">
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
