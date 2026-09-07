import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock, PlayCircle, Target } from 'lucide-react';
import { useSeo, useStructuredData } from '../lib/seo';
import { fetchCourseWithContent, fetchFreeMoldsForCourse } from '../lib/labData';
import { useLabProgress } from '../lib/labProgress';
import { LabProgressBar } from '../components/lab/LabProgressBar';
import { FreeMoldCard } from '../components/ui/FreeMoldCard';
import type { LabCourseWithContent } from '../lib/labTypes';
import type { FreeMold } from '../lib/types';

const SITE_URL = 'https://modeltex.com.ar';

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

  const schema = useMemo(() => {
    if (!course) return null;
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description: course.description || course.subtitle,
        provider: { '@type': 'Organization', name: 'Modeltex', sameAs: `${SITE_URL}/` },
        isAccessibleForFree: true,
        inLanguage: 'es-AR',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Modeltex Lab', item: `${SITE_URL}/lab` },
          { '@type': 'ListItem', position: 3, name: course.title, item: `${SITE_URL}/lab/${course.slug}` },
        ],
      },
    ];
  }, [course]);
  useStructuredData(schema, 'page-schema');

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

  let lastLevel: string | null = null;

  return (
    <div className="min-h-screen bg-petroleum-50">
      <section className="bg-gradient-to-br from-primary-900 to-petroleum-900 text-white">
        <div className="container-custom py-10 sm:py-14">
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
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              <PlayCircle className="w-5 h-5" /> {progress.completedLessonIds.length > 0 ? 'Continuar curso' : 'Comenzar curso'}
            </Link>
          )}
        </div>
      </section>

      <div className="container-custom py-10 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
        <div className="space-y-6">
          {(course.objectives.length > 0 || course.requirements.length > 0) && (
            <div className="card p-5 sm:p-6 grid sm:grid-cols-2 gap-6">
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

          {course.modules.map((m) => {
            const showLevel = m.level_label && m.level_label !== lastLevel;
            lastLevel = m.level_label || lastLevel;
            return (
              <div key={m.id} className="card p-5 sm:p-6">
                {showLevel && (
                  <p className="text-xs font-bold uppercase tracking-wide text-primary-500 mb-1">{m.level_label}</p>
                )}
                <h2 className="font-display text-xl font-bold text-primary-900">{m.title}</h2>
                {m.description && <p className="text-sm text-gray-600 mt-1.5">{m.description}</p>}
                <ul className="mt-4 divide-y divide-gray-100">
                  {m.lessons.map((l, i) => {
                    const done = isComplete(l.id);
                    return (
                      <li key={l.id}>
                        <Link
                          to={`/lab/${course.slug}/${m.slug}/${l.slug}`}
                          className="flex items-center gap-3 py-3 group"
                        >
                          {done ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          )}
                          <span className="text-sm text-gray-500 w-5 flex-shrink-0">{i + 1}.</span>
                          <span className="flex-1 text-sm font-medium text-gray-800 group-hover:text-primary-800 transition-colors">
                            {l.title}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                        </Link>
                      </li>
                    );
                  })}
                  {m.lessons.length === 0 && <li className="py-3 text-sm text-gray-400">Próximamente nuevas clases.</li>}
                </ul>
              </div>
            );
          })}
        </div>

        <aside className="space-y-4">
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
    </div>
  );
}
