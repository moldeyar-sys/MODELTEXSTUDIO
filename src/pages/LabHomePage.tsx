import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Factory,
  Bot,
  ArrowRight,
  BookOpen,
  Gift,
  Sparkles,
  PlayCircle,
  ScrollText,
} from 'lucide-react';
import { FloatingPatterns } from '../components/ui/FloatingPatterns';
import { useSeo, useStructuredData } from '../lib/seo';
import { fetchAllCoursesWithContent, fetchGlossaryTerms, fetchLabFreeMolds } from '../lib/labData';
import { useLabProgress } from '../lib/labProgress';
import { LabProgressBar } from '../components/lab/LabProgressBar';
import { FreeMoldCard } from '../components/ui/FreeMoldCard';
import type { LabCourseWithContent, LabGlossaryTerm } from '../lib/labTypes';
import type { FreeMold } from '../lib/types';

const SITE_URL = 'https://modeltex.com.ar';

export default function LabHomePage() {
  const [courses, setCourses] = useState<LabCourseWithContent[]>([]);
  const [glossary, setGlossary] = useState<LabGlossaryTerm[]>([]);
  const [freeMolds, setFreeMolds] = useState<FreeMold[]>([]);
  const [loading, setLoading] = useState(true);
  const { courseProgress } = useLabProgress();

  useSeo({
    title: 'Curso Gratis de Moldería Textil — MODELTEX LAB',
    description:
      'MODELTEX LAB: aprendé moldería textil gratis, desde cero hasta producción profesional. Clases gratuitas, moldes para practicar y una IA especializada que te acompaña durante todo el curso.',
    path: '/lab',
  });

  const schema = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Modeltex Lab', item: `${SITE_URL}/lab` },
        ],
      },
    ],
    [],
  );
  useStructuredData(schema, 'page-schema');

  useEffect(() => {
    Promise.all([fetchAllCoursesWithContent(), fetchGlossaryTerms(), fetchLabFreeMolds(4)]).then(
      ([c, g, m]) => {
        setCourses(c);
        setGlossary(g.slice(0, 6));
        setFreeMolds(m);
        setLoading(false);
      },
    );
  }, []);

  const progressByCourse = useMemo(() => {
    return courses.map((c) => {
      const lessonIds = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
      return { course: c, progress: courseProgress(c.slug, lessonIds) };
    });
  }, [courses, courseProgress]);

  const inProgress = progressByCourse.find(
    (p) => p.progress.completedLessonIds.length > 0 && p.progress.completedLessonIds.length < p.progress.totalLessons,
  );

  return (
    <div className="min-h-screen bg-petroleum-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-petroleum-900 text-white">
        <FloatingPatterns variant="white" />
        <div className="container-custom relative py-12 sm:py-16 md:py-24 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 border border-green-400/30 text-sm font-semibold backdrop-blur-sm">
            <Gift className="w-4 h-4 text-green-300" /> 100% Gratis
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mt-6 text-balance">MODELTEX LAB</h1>
          <p className="text-xl sm:text-2xl font-semibold text-white/95 mt-3">Curso Gratis de Moldería Textil</p>
          <p className="text-base sm:text-lg text-white/80 mt-5 max-w-2xl mx-auto">
            Aprendé desde los fundamentos hasta técnicas profesionales de producción, con clases gratuitas, moldes
            para practicar y una IA especializada que te acompaña durante todo el proceso.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            {inProgress ? (
              <Link
                to={`/lab/${inProgress.course.slug}/${inProgress.progress.lastModuleSlug}/${inProgress.progress.lastLessonSlug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all active:scale-[0.98]"
              >
                <PlayCircle className="w-5 h-5" /> Continuar curso
              </Link>
            ) : courses[0] ? (
              <Link
                to={`/lab/${courses[0].slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all active:scale-[0.98]"
              >
                Comenzar curso gratis <ArrowRight className="w-4 h-4" />
              </Link>
            ) : null}
            <Link
              to="/lab/ia"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/25 text-white font-semibold rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              <Bot className="w-4 h-4" /> Preguntar a la IA
            </Link>
          </div>
        </div>
      </section>

      <div className="container-custom py-10 md:py-16 space-y-14">
        {/* Elegí tu camino */}
        <section>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary-900 mb-6 text-center">
            Elegí tu camino
          </h2>
          {loading ? (
            <div className="grid sm:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse h-48" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((c, i) => {
                const p = progressByCourse.find((pc) => pc.course.id === c.id)?.progress;
                const Icon = i === 0 ? GraduationCap : Factory;
                const firstLesson = c.modules[0]?.lessons[0];
                return (
                  <div key={c.id} className="card p-6 flex flex-col">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-700" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-primary-900">{c.title}</h3>
                    <p className="text-sm text-gray-600 mt-2 flex-1">{c.subtitle || c.description}</p>
                    {p && p.totalLessons > 0 && (
                      <div className="mt-4">
                        <LabProgressBar percent={p.percent} completed={p.completedLessonIds.length} total={p.totalLessons} />
                      </div>
                    )}
                    <Link
                      to={
                        p && p.lastLessonSlug && p.lastModuleSlug
                          ? `/lab/${c.slug}/${p.lastModuleSlug}/${p.lastLessonSlug}`
                          : firstLesson
                            ? `/lab/${c.slug}/${c.modules[0].slug}/${firstLesson.slug}`
                            : `/lab/${c.slug}`
                      }
                      className="btn-primary mt-5 inline-flex items-center justify-center gap-2 text-sm"
                    >
                      {p && p.completedLessonIds.length > 0 ? 'Continuar' : 'Comenzar'} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })}

              <div className="card p-6 flex flex-col bg-primary-900 text-white border-0">
                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold">IA Modeltex Lab</h3>
                <p className="text-sm text-white/80 mt-2 flex-1">
                  Preguntá cualquier duda sobre el curso, moldería o producción textil.
                </p>
                <Link
                  to="/lab/ia"
                  className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all text-sm"
                >
                  Preguntar <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Moldes gratis para practicar */}
        {freeMolds.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary-900">
                Moldes gratis para practicar
              </h2>
              <Link to="/moldes-gratis" className="text-sm font-medium text-primary-700 hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {freeMolds.map((m) => (
                <FreeMoldCard key={m.id} mold={m} />
              ))}
            </div>
          </section>
        )}

        {/* Glosario rápido */}
        {glossary.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary-900 flex items-center gap-2">
                <ScrollText className="w-6 h-6 text-primary-600" /> Glosario de moldería
              </h2>
              <Link to="/lab/glosario" className="text-sm font-medium text-primary-700 hover:underline flex items-center gap-1">
                Ver todo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {glossary.map((g) => (
                <Link key={g.id} to={`/lab/glosario/${g.slug}`} className="card p-4 hover:border-primary-200 transition-colors">
                  <p className="font-semibold text-primary-900">{g.term}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{g.short_definition}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Guías y CTA final */}
        <section className="grid md:grid-cols-2 gap-5">
          <div className="card p-6 flex flex-col">
            <BookOpen className="w-8 h-8 text-primary-700 mb-3" />
            <h3 className="font-display text-lg font-bold text-primary-900">Guías complementarias</h3>
            <p className="text-sm text-gray-600 mt-2 flex-1">
              Formatos de moldería digital, telas por prenda, tizadas, consumo de tela y más.
            </p>
            <Link to="/guias" className="btn-secondary mt-4 inline-flex items-center justify-center gap-2 text-sm">
              Ver guías <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="card p-6 flex flex-col bg-gradient-to-br from-primary-900 to-petroleum-800 text-white border-0">
            <Sparkles className="w-8 h-8 mb-3" />
            <h3 className="font-display text-lg font-bold">¿Tenés una duda puntual?</h3>
            <p className="text-sm text-white/80 mt-2 flex-1">
              Consultá a la IA de MODELTEX LAB, especializada en moldería y producción textil.
            </p>
            <Link
              to="/lab/ia"
              className="mt-4 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all text-sm"
            >
              Consultá a la IA <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
