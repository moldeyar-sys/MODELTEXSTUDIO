import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Cpu,
  FileDown,
  PlayCircle,
  Sparkles,
  Target,
} from 'lucide-react';
import { useSeo, useStructuredData } from '../lib/seo';
import { SCHEMA_IDS } from '../lib/schemaIds';
import { SITE, SAME_AS } from '../lib/siteConfig';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { fetchCourseWithContent, fetchFreeMoldsForCourse } from '../lib/labData';
import { useLabProgress } from '../lib/labProgress';
import { LabProgressBar } from '../components/lab/LabProgressBar';
import { LabLeadMagnet } from '../components/lab/LabLeadMagnet';
import { LabUpsellCta } from '../components/lab/LabUpsellCta';
import { FreeMoldCard } from '../components/ui/FreeMoldCard';
import type { LabCourseWithContent, LabLesson } from '../lib/labTypes';
import type { FreeMold } from '../lib/types';
import { trackLabStart } from '../lib/analytics';

const SITE_URL = 'https://modeltex.com.ar';
const WORDS_PER_MINUTE = 200;

/** Estimación real de tiempo de lectura (no un dato inventado): cuenta las palabras de los campos con texto de la clase. */
function estimateReadingMinutes(lesson: LabLesson): number {
  const parts = [
    lesson.objective,
    lesson.concept,
    lesson.example,
    lesson.summary,
    ...lesson.development.flatMap((b) => [b.h3, ...(b.paragraphs || []), ...(b.bullets || [])]),
    ...lesson.steps,
    ...lesson.faqs.flatMap((f) => [f.q, f.a]),
  ].filter(Boolean) as string[];
  const words = parts.join(' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / WORDS_PER_MINUTE));
}

/** Materiales pensados para más adelante (demos de CAD, plantillas): hoy es solo el espacio preparado, sin links rotos. */
const PLANNED_RESOURCES = [
  { icon: Cpu, label: 'Optitex — versión demo' },
  { icon: Cpu, label: 'Audaces — versión demo' },
  { icon: FileDown, label: 'Plantilla de tabla de medidas (PDF)' },
  { icon: FileDown, label: 'Ficha técnica en blanco (PDF)' },
];

export default function LabCoursePage() {
  const { cursoSlug = '' } = useParams<{ cursoSlug: string }>();
  const [course, setCourse] = useState<LabCourseWithContent | null | undefined>(undefined);
  const [freeMolds, setFreeMolds] = useState<FreeMold[]>([]);
  const { courseProgress, isComplete } = useLabProgress();

  useEffect(() => {
    setCourse(undefined);
    fetchCourseWithContent(cursoSlug).then((c) => {
      setCourse(c);
      if (c) fetchFreeMoldsForCourse(c.id).then(setFreeMolds);
    });
  }, [cursoSlug]);

  useSeo({
    title: course ? `${course.title} — Curso gratis` : 'Curso no encontrado',
    description: course?.description,
    path: `/lab/${cursoSlug}`,
    type: 'article',
    noindex: !course,
  });

  const lessonIds = useMemo(() => course?.modules.flatMap((m) => m.lessons.map((l) => l.id)) || [], [course]);
  const progress = courseProgress(cursoSlug, lessonIds);

  const courseSchema = useMemo(() => {
    if (!course) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.title,
      description: course.description || course.subtitle,
      provider: { '@type': 'Organization', name: SITE.name, url: SITE.url, sameAs: SAME_AS },
      isAccessibleForFree: true,
      inLanguage: 'es-AR',
      // Es real: el curso no tiene costo (no es un dato inventado, es el precio
      // real de $0). Declarar el Offer explícito refuerza "gratis" para rich
      // results, ademas de isAccessibleForFree.
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS', category: 'Free' },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: course.estimated_duration || undefined,
      },
    };
  }, [course]);
  useStructuredData(courseSchema, SCHEMA_IDS.course);

  const breadcrumbSchema = useMemo(() => {
    if (!course) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Modeltex Lab', item: `${SITE_URL}/lab` },
        { '@type': 'ListItem', position: 3, name: course.title, item: `${SITE_URL}/lab/${course.slug}` },
      ],
    };
  }, [course]);
  useStructuredData(breadcrumbSchema, SCHEMA_IDS.breadcrumb);

  if (course === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petroleum-50">
        <div className="text-center bg-white border border-gray-100 rounded-2xl px-8 py-10 shadow-sm">
          <p className="text-gray-500 text-lg mb-4">Curso no encontrado</p>
          <Link to="/lab" className="btn-primary">Ver MODELTEX LAB</Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return <div className="min-h-[60vh] flex items-center justify-center bg-petroleum-50" />;
  }

  const firstLesson = course.modules[0]?.lessons[0];
  const continueTarget =
    progress.lastLessonSlug && progress.lastModuleSlug
      ? `/lab/${course.slug}/${progress.lastModuleSlug}/${progress.lastLessonSlug}`
      : firstLesson
        ? `/lab/${course.slug}/${course.modules[0].slug}/${firstLesson.slug}`
        : null;

  // Clase destacada en el "reproductor": la última vista, o si no hay progreso, la primera del curso.
  const featuredModule = progress.lastModuleSlug
    ? course.modules.find((m) => m.slug === progress.lastModuleSlug)
    : course.modules[0];
  const featuredLesson = progress.lastLessonSlug
    ? featuredModule?.lessons.find((l) => l.slug === progress.lastLessonSlug)
    : firstLesson;

  let lastLevel: string | null = null;

  return (
    <div className="min-h-screen bg-petroleum-50">
      <section className="bg-gradient-to-br from-primary-900 to-petroleum-900 text-white">
        <div className="container-custom py-10 sm:py-14">
          <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Modeltex Lab', to: '/lab' }, { label: course.title }]} variant="dark" className="mb-4" />
          <Link to="/lab" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-5">
            <ArrowLeft className="w-4 h-4" /> Modeltex Lab
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-bold max-w-2xl text-balance">{course.title}</h1>
          {course.subtitle && <p className="text-lg text-white/85 mt-3 max-w-2xl">{course.subtitle}</p>}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-sm text-white/70">
            {course.estimated_duration && (
              <span className="inline-flex items-center gap-2"><Clock className="w-4 h-4" /> {course.estimated_duration}</span>
            )}
            <span className="inline-flex items-center gap-2"><Target className="w-4 h-4" /> {lessonIds.length} clases</span>
          </div>
          {lessonIds.length > 0 && (
            <div className="max-w-sm mt-6 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <LabProgressBar percent={progress.percent} completed={progress.completedLessonIds.length} total={progress.totalLessons} />
            </div>
          )}
          {continueTarget && (
            <Link
              to={continueTarget}
              onClick={() => { if (progress.completedLessonIds.length === 0) trackLabStart(course.slug); }}
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              <PlayCircle className="w-5 h-5" /> {progress.completedLessonIds.length > 0 ? 'Continuar curso' : 'Comenzar curso'}
            </Link>
          )}
        </div>
      </section>

      <LabLeadMagnet />

      <div className="container-custom py-10">
        {(course.objectives.length > 0 || course.requirements.length > 0) && (
          <div className="card p-5 sm:p-6 grid sm:grid-cols-2 gap-6 mb-8">
            {course.objectives.length > 0 && (
              <div>
                <h2 className="font-semibold text-primary-900 mb-2">Qué vas a aprender</h2>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {course.objectives.map((o, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {course.requirements.length > 0 && (
              <div>
                <h2 className="font-semibold text-primary-900 mb-2">Requisitos</h2>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {course.requirements.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Microlearning: reproductor principal + grilla de lecciones al costado, en vez de un solo bloque de contenido */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
          <div className="space-y-6">
            {/* Reproductor / vista previa de la clase */}
            <div className="card overflow-hidden p-0">
              <Link
                to={featuredLesson ? `/lab/${course.slug}/${featuredModule?.slug}/${featuredLesson.slug}` : '#'}
                className="group relative aspect-video flex items-center justify-center bg-gradient-to-br from-primary-800 to-petroleum-900 text-white"
              >
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide bg-white/15 px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" /> Vista previa
                </span>
                <span className="w-16 h-16 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-colors">
                  <PlayCircle className="w-9 h-9" />
                </span>
              </Link>
              {featuredLesson && (
                <div className="p-4 sm:p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary-500">
                    {progress.completedLessonIds.length > 0 ? 'Retomar clase' : 'Primera clase'}
                  </p>
                  <h2 className="font-display text-lg font-bold text-primary-900 mt-0.5">{featuredLesson.title}</h2>
                  {featuredLesson.objective && (
                    <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{featuredLesson.objective}</p>
                  )}
                  <Link
                    to={`/lab/${course.slug}/${featuredModule?.slug}/${featuredLesson.slug}`}
                    onClick={() => { if (progress.completedLessonIds.length === 0) trackLabStart(course.slug); }}
                    className="btn-primary inline-flex items-center gap-2 mt-4 text-sm"
                  >
                    <PlayCircle className="w-4 h-4" /> Ver clase
                  </Link>
                </div>
              )}
            </div>

            {/* Materiales y software: espacio preparado para más adelante */}
            <div className="card p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-primary-900 mb-1">Materiales y software</h2>
              <p className="text-sm text-gray-500 mb-4">Demos de software CAD y plantillas descargables — se van sumando a medida que estén listas.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {PLANNED_RESOURCES.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-400"
                  >
                    <r.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{r.label}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">
                      Próximamente
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grilla de lecciones cortas */}
          <aside className="space-y-4">
            <div className="card p-5 sm:p-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
              <h2 className="font-display text-lg font-bold text-primary-900 mb-3">Contenido del curso</h2>
              <div className="space-y-5">
                {course.modules.map((m) => {
                  const showLevel = m.level_label && m.level_label !== lastLevel;
                  lastLevel = m.level_label || lastLevel;
                  return (
                    <div key={m.id}>
                      {showLevel && (
                        <p className="text-[11px] font-bold uppercase tracking-wide text-primary-500 mb-1.5">{m.level_label}</p>
                      )}
                      <ul className="divide-y divide-gray-100">
                        {m.lessons.map((l, i) => {
                          const done = isComplete(l.id);
                          return (
                            <li key={l.id}>
                              <Link to={`/lab/${course.slug}/${m.slug}/${l.slug}`} className="flex items-center gap-2.5 py-2.5 group">
                                {done ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                )}
                                <span className="text-xs text-gray-400 w-4 flex-shrink-0">{i + 1}.</span>
                                <span className="flex-1 text-sm font-medium text-gray-800 group-hover:text-primary-800 transition-colors leading-snug">
                                  {l.title}
                                </span>
                                <span className="text-[11px] text-gray-400 flex-shrink-0">{estimateReadingMinutes(l)} min</span>
                              </Link>
                            </li>
                          );
                        })}
                        {m.lessons.length === 0 && <li className="py-2.5 text-sm text-gray-400">Próximamente nuevas clases.</li>}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {freeMolds.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-primary-900">Moldes gratis de este curso</h2>
                {freeMolds.map((m) => (
                  <FreeMoldCard key={m.id} mold={m} />
                ))}
              </div>
            )}
            <div className="card p-5">
              <h2 className="text-sm font-bold text-primary-900 mb-2">¿Tenés dudas?</h2>
              <p className="text-sm text-gray-600 mb-3">Consultá a la IA de Modeltex Lab sobre este curso.</p>
              <Link to="/lab/ia" className="btn-secondary text-sm w-full inline-flex items-center justify-center gap-2">
                Preguntar a la IA
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-10">
          <LabUpsellCta />
        </div>
      </div>
    </div>
  );
}
