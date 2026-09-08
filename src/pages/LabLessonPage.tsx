import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  HelpCircle,
  Lightbulb,
  ListChecks,
  Menu,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { useSeo, useStructuredData } from '../lib/seo';
import { fetchLessonContext, type LabLessonContext } from '../lib/labData';
import { useLabProgress } from '../lib/labProgress';
import { useAuth } from '../contexts/AuthContext';
import { LabSidebar } from '../components/lab/LabSidebar';
import { LabAiPanel } from '../components/lab/LabAiPanel';
import { FreeMoldCard } from '../components/ui/FreeMoldCard';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { GUIAS } from '../lib/guiasData';
import { SCHEMA_IDS } from '../lib/schemaIds';
import { SITE, getArticleAuthor } from '../lib/siteConfig';
import { trackLabLessonComplete } from '../lib/analytics';

const SITE_URL = 'https://modeltex.com.ar';

export default function LabLessonPage() {
  const { cursoSlug = '', moduloSlug = '', claseSlug = '' } = useParams<{
    cursoSlug: string;
    moduloSlug: string;
    claseSlug: string;
  }>();
  const [ctx, setCtx] = useState<LabLessonContext | null | undefined>(undefined);
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { markComplete, isComplete } = useLabProgress();

  useEffect(() => {
    setCtx(undefined);
    setSidebarOpen(false);
    window.scrollTo({ top: 0 });
    fetchLessonContext(cursoSlug, moduloSlug, claseSlug).then(setCtx);
  }, [cursoSlug, moduloSlug, claseSlug]);

  const lesson = ctx?.lesson;

  useSeo({
    title: lesson ? lesson.title : 'Clase no encontrada',
    description: lesson?.objective || lesson?.summary,
    path: `/lab/${cursoSlug}/${moduloSlug}/${claseSlug}`,
    type: 'article',
    noindex: !lesson,
  });

  const pageUrl = `${SITE_URL}/lab/${cursoSlug}/${moduloSlug}/${claseSlug}`;

  const articleSchema = useMemo(() => {
    if (!ctx) return null;
    // Si la lección tiene un autor real cargado en la base, se respeta (es un
    // dato mas confiable que el autor global del sitio); si no, se cae al
    // autor de contenido configurado en siteConfig.ts (hoy la Organization).
    const author = ctx.lesson.author ? { '@type': 'Person' as const, name: ctx.lesson.author } : getArticleAuthor();
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: ctx.lesson.title,
      description: ctx.lesson.objective || ctx.lesson.summary,
      image: `${SITE_URL}/brand/og-image.png`,
      inLanguage: 'es-AR',
      author,
      publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url, logo: { '@type': 'ImageObject', url: SITE.logo } },
      datePublished: ctx.lesson.published_at || ctx.lesson.created_at,
      dateModified: ctx.lesson.updated_at,
      mainEntityOfPage: pageUrl,
    };
  }, [ctx, pageUrl]);
  useStructuredData(articleSchema, SCHEMA_IDS.article);

  const breadcrumbSchema = useMemo(() => {
    if (!ctx) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Modeltex Lab', item: `${SITE_URL}/lab` },
        { '@type': 'ListItem', position: 3, name: ctx.course.title, item: `${SITE_URL}/lab/${ctx.course.slug}` },
        { '@type': 'ListItem', position: 4, name: ctx.lesson.title, item: pageUrl },
      ],
    };
  }, [ctx, pageUrl]);
  useStructuredData(breadcrumbSchema, SCHEMA_IDS.breadcrumb);

  const faqSchema = useMemo(() => {
    if (!ctx || !ctx.lesson.faqs.length) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: ctx.lesson.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };
  }, [ctx]);
  useStructuredData(faqSchema, SCHEMA_IDS.faq);

  // HowTo solo cuando la leccion realmente tiene una secuencia de pasos: no
  // se fuerza en lecciones conceptuales que no son un "como hacer X".
  const howToSchema = useMemo(() => {
    if (!ctx || ctx.lesson.steps.length < 2) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: ctx.lesson.title,
      description: ctx.lesson.objective || ctx.lesson.summary,
      step: ctx.lesson.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })),
    };
  }, [ctx]);
  useStructuredData(howToSchema, SCHEMA_IDS.howTo);

  if (ctx === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petroleum-50">
        <div className="text-center bg-white border border-gray-100 rounded-2xl px-8 py-10 shadow-sm">
          <p className="text-gray-500 text-lg mb-4">Clase no encontrada</p>
          <Link to="/lab" className="btn-primary">Ver MODELTEX LAB</Link>
        </div>
      </div>
    );
  }

  if (!ctx) {
    return <div className="min-h-[60vh] flex items-center justify-center bg-petroleum-50" />;
  }

  const { course, prevLesson, nextLesson, resources, freeMolds } = ctx;
  const done = isComplete(lesson!.id);
  const relatedGuias = GUIAS.filter((g) => lesson!.related_guide_slugs.includes(g.slug));

  const handleComplete = () => {
    markComplete({
      lessonId: lesson!.id,
      courseId: course.id,
      courseSlug: course.slug,
      moduleSlug: moduloSlug,
      lessonSlug: claseSlug,
    });
    trackLabLessonComplete(course.slug, claseSlug);
  };

  return (
    <div className="min-h-screen bg-petroleum-50">
      <div className="container-custom py-6 sm:py-10 grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 card p-5 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <Link to={`/lab/${course.slug}`} className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-primary-800 mb-4">
              <ArrowLeft className="w-3.5 h-3.5" /> {course.title}
            </Link>
            <LabSidebar course={course} activeLessonId={lesson!.id} isComplete={isComplete} />
          </div>
        </aside>

        {/* Sidebar mobile (drawer) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-primary-900">{course.title}</p>
                <button onClick={() => setSidebarOpen(false)} aria-label="Cerrar"><X className="w-5 h-5" /></button>
              </div>
              <LabSidebar course={course} activeLessonId={lesson!.id} isComplete={isComplete} />
            </div>
          </div>
        )}

        <article className="min-w-0">
          {/* Breadcrumb + abrir índice en mobile */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <Breadcrumbs
              items={[
                { label: 'Inicio', to: '/' },
                { label: 'Modeltex Lab', to: '/lab' },
                { label: course.title, to: `/lab/${course.slug}` },
                { label: lesson!.title },
              ]}
            />
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 text-xs font-medium text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg"
            >
              <Menu className="w-3.5 h-3.5" /> Índice del curso
            </button>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary-900">{lesson!.title}</h1>

          {lesson!.objective && (
            <div className="card p-4 mt-4 bg-primary-50 border-primary-100">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-600 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Qué vas a aprender
              </p>
              <p className="text-sm text-primary-900">{lesson!.objective}</p>
            </div>
          )}

          <div className="space-y-6 mt-6">
            {lesson!.before_start && (
              <Block title="Antes de empezar">
                <p>{lesson!.before_start}</p>
              </Block>
            )}

            {lesson!.concept && (
              <Block title="Concepto">
                <p>{lesson!.concept}</p>
              </Block>
            )}

            {lesson!.development.length > 0 && (
              <Block title="Desarrollo">
                <div className="space-y-4">
                  {lesson!.development.map((b, i) => (
                    <div key={i}>
                      {b.h3 && <h3 className="font-semibold text-primary-900 mb-1.5">{b.h3}</h3>}
                      {b.paragraphs.map((p, pi) => (
                        <p key={pi} className="mb-2">{p}</p>
                      ))}
                      {b.bullets && b.bullets.length > 0 && (
                        <ul className="list-disc pl-5 space-y-1">
                          {b.bullets.map((bl, bi) => (
                            <li key={bi}>{bl}</li>
                          ))}
                        </ul>
                      )}
                      {b.check && (
                        <details className="group mt-3 rounded-xl border border-accent-200 bg-accent-50/60 overflow-hidden">
                          <summary className="cursor-pointer list-none px-4 py-3 flex items-start justify-between gap-3 text-sm font-semibold text-accent-800">
                            <span className="flex items-center gap-2"><HelpCircle className="w-4 h-4 flex-shrink-0" /> Antes de seguir: {b.check.question}</span>
                            <ChevronRight className="w-4 h-4 text-accent-500 group-open:rotate-90 transition-transform mt-0.5 flex-shrink-0" />
                          </summary>
                          <p className="px-4 pb-3.5 text-sm text-gray-700 leading-relaxed">{b.check.answer}</p>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </Block>
            )}

            {lesson!.steps.length > 0 && (
              <Block title="Paso a paso" icon={<ListChecks className="w-4 h-4" />}>
                <ol className="space-y-2">
                  {lesson!.steps.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              </Block>
            )}

            {lesson!.example && (
              <Block title="Ejemplo práctico">
                <p>{lesson!.example}</p>
              </Block>
            )}

            {lesson!.common_mistakes.length > 0 && (
              <Block title="Errores frecuentes">
                <div className="space-y-3">
                  {lesson!.common_mistakes.map((m, i) => (
                    <div key={i} className="rounded-xl border border-red-100 bg-red-50/60 p-3.5">
                      <p className="text-sm font-medium text-red-800">✕ {m.mistake}</p>
                      <p className="text-sm text-gray-700 mt-1">✓ {m.fix}</p>
                    </div>
                  ))}
                </div>
              </Block>
            )}

            {lesson!.modeltex_tip && (
              <div className="card p-4 border-accent-200 bg-accent-50">
                <p className="text-xs font-bold uppercase tracking-wide text-accent-700 mb-1 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Consejo Modeltex
                </p>
                <p className="text-sm text-gray-800">{lesson!.modeltex_tip}</p>
              </div>
            )}

            {lesson!.exercise_instructions && (
              <Block title="Ejercicio" icon={<ListChecks className="w-4 h-4" />}>
                <p className="whitespace-pre-line">{lesson!.exercise_instructions}</p>
              </Block>
            )}

            {(resources.length > 0 || freeMolds.length > 0) && (
              <Block title="Recursos" icon={<FileText className="w-4 h-4" />}>
                {resources.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {resources.map((r) => (
                      <li key={r.id}>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary-700 hover:underline"
                        >
                          <Download className="w-4 h-4" /> {r.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {freeMolds.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {freeMolds.map((m) => (
                      <FreeMoldCard key={m.id} mold={m} />
                    ))}
                  </div>
                )}
              </Block>
            )}

            {lesson!.faqs.length > 0 && (
              <Block title="Preguntas frecuentes" icon={<HelpCircle className="w-4 h-4" />}>
                <div className="space-y-2">
                  {lesson!.faqs.map((f, i) => (
                    <details key={i} className="group rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                      <summary className="cursor-pointer list-none px-4 py-3 flex items-start justify-between gap-3 font-medium text-primary-900 text-sm">
                        <span>{f.q}</span>
                        <ChevronRight className="w-4 h-4 text-primary-400 group-open:rotate-90 transition-transform mt-0.5 flex-shrink-0" />
                      </summary>
                      <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{f.a}</p>
                    </details>
                  ))}
                </div>
              </Block>
            )}

            {lesson!.summary && (
              <Block title="Resumen">
                <p>{lesson!.summary}</p>
              </Block>
            )}

            {relatedGuias.length > 0 && (
              <Block title="Guías relacionadas">
                <ul className="space-y-1.5">
                  {relatedGuias.map((g) => (
                    <li key={g.slug}>
                      <Link to={`/guias/${g.slug}`} className="text-sm text-primary-700 hover:underline">
                        {g.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Block>
            )}
          </div>

          {/* Completar + siguiente clase */}
          <div className="card p-5 mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={handleComplete}
              disabled={done}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                done ? 'bg-green-50 text-green-700 cursor-default' : 'bg-primary-800 text-white hover:bg-primary-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> {done ? 'Clase completada' : 'Marcar como completada'}
            </button>
            {!user && (
              <p className="text-xs text-gray-400">
                Tu progreso se guarda en este navegador. <Link to="/registro" className="text-primary-700 hover:underline">Creá una cuenta</Link> para no perderlo.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 gap-3">
            {prevLesson ? (
              <Link
                to={`/lab/${course.slug}/${prevLesson.moduleSlug}/${prevLesson.lesson.slug}`}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> {prevLesson.lesson.title}
              </Link>
            ) : (
              <span />
            )}
            {nextLesson ? (
              <Link
                to={`/lab/${course.slug}/${nextLesson.moduleSlug}/${nextLesson.lesson.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-800 hover:text-primary-900 transition-colors ml-auto"
              >
                Siguiente: {nextLesson.lesson.title} <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to={`/lab/${course.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-800 hover:text-primary-900 transition-colors ml-auto"
              >
                Volver al curso <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </article>
      </div>

      {/* Botón fijo: preguntar a la IA */}
      <button
        onClick={() => setAiOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-5 py-3 bg-primary-800 hover:bg-primary-900 text-white font-semibold rounded-full shadow-xl transition-all active:scale-95"
      >
        <Bot className="w-5 h-5" /> <span className="hidden sm:inline">Preguntar a la IA</span>
        <Sparkles className="w-4 h-4 sm:hidden" />
      </button>

      {aiOpen && (
        <LabAiPanel
          lab={{ courseSlug: course.slug, moduleSlug: moduloSlug, lessonSlug: claseSlug }}
          lessonTitle={lesson!.title}
          onClose={() => setAiOpen(false)}
        />
      )}
    </div>
  );
}

function Block({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold text-primary-900 mb-3 flex items-center gap-2">
        {icon} {title}
      </h2>
      <div className="text-gray-700 leading-relaxed text-[15px]">{children}</div>
    </section>
  );
}
