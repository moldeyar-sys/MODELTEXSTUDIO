// Helpers de lectura pública de MODELTEX LAB (páginas /lab/*). Solo trae
// contenido status='published' (RLS ya lo exige para anon, pero se filtra
// también acá para que un admin logueado vea el sitio público como cualquiera).
// El panel admin (src/components/admin/lab/) consulta Supabase directo, sin
// pasar por acá, porque necesita ver también los borradores.

import { supabase } from './supabase';
import type {
  LabCourse,
  LabCourseWithContent,
  LabGlossaryTerm,
  LabLesson,
  LabModuleWithLessons,
  LabResource,
} from './labTypes';
import type { FreeMold } from './types';

/** Todos los cursos publicados con su árbol completo (para la Home: tarjetas + progreso). */
export async function fetchAllCoursesWithContent(): Promise<LabCourseWithContent[]> {
  const courses = await fetchPublishedCourses();
  const withContent = await Promise.all(courses.map((c) => fetchCourseWithContent(c.slug)));
  return withContent.filter((c): c is LabCourseWithContent => c !== null);
}

export async function fetchPublishedCourses(): Promise<LabCourse[]> {
  const { data, error } = await supabase
    .from('lab_courses')
    .select('*')
    .eq('status', 'published')
    .order('order_index', { ascending: true });
  if (error) {
    console.error('fetchPublishedCourses', error);
    return [];
  }
  return (data || []) as LabCourse[];
}

/** Curso + módulos publicados + clases publicadas, todo ordenado por order_index. */
export async function fetchCourseWithContent(courseSlug: string): Promise<LabCourseWithContent | null> {
  const { data: course, error: courseErr } = await supabase
    .from('lab_courses')
    .select('*')
    .eq('slug', courseSlug)
    .eq('status', 'published')
    .maybeSingle();
  if (courseErr || !course) return null;

  const { data: modules, error: modulesErr } = await supabase
    .from('lab_modules')
    .select('*')
    .eq('course_id', course.id)
    .eq('status', 'published')
    .order('level_order', { ascending: true })
    .order('order_index', { ascending: true });
  if (modulesErr || !modules) return { ...(course as LabCourse), modules: [] };

  const moduleIds = modules.map((m) => m.id);
  let lessonsByModule = new Map<string, LabLesson[]>();
  if (moduleIds.length > 0) {
    const { data: lessons } = await supabase
      .from('lab_lessons')
      .select('*')
      .in('module_id', moduleIds)
      .eq('status', 'published')
      .order('order_index', { ascending: true });
    lessonsByModule = new Map();
    for (const lesson of (lessons || []) as LabLesson[]) {
      const list = lessonsByModule.get(lesson.module_id) || [];
      list.push(lesson);
      lessonsByModule.set(lesson.module_id, list);
    }
  }

  const modulesWithLessons: LabModuleWithLessons[] = modules.map((m) => ({
    ...m,
    lessons: lessonsByModule.get(m.id) || [],
  }));

  return { ...(course as LabCourse), modules: modulesWithLessons };
}

export interface LabLessonContext {
  /** Curso con el árbol completo de módulos/clases publicadas (para el sidebar). */
  course: LabCourseWithContent;
  moduleItem: LabModuleWithLessons;
  lesson: LabLesson;
  prevLesson: { moduleSlug: string; lesson: LabLesson } | null;
  nextLesson: { moduleSlug: string; lesson: LabLesson } | null;
  resources: LabResource[];
  freeMolds: FreeMold[];
}

/** Trae una clase con su curso completo, para poder calcular anterior/siguiente y armar el sidebar. */
export async function fetchLessonContext(
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): Promise<LabLessonContext | null> {
  const course = await fetchCourseWithContent(courseSlug);
  if (!course) return null;

  const moduleItem = course.modules.find((m) => m.slug === moduleSlug);
  const lesson = moduleItem?.lessons.find((l) => l.slug === lessonSlug);
  if (!moduleItem || !lesson) return null;

  // Aplana todas las clases del curso en orden para calcular anterior/siguiente
  // cruzando incluso el límite entre módulos.
  const flat: { moduleSlug: string; lesson: LabLesson }[] = [];
  for (const m of course.modules) {
    for (const l of m.lessons) flat.push({ moduleSlug: m.slug, lesson: l });
  }
  const idx = flat.findIndex((f) => f.lesson.id === lesson.id);
  const prevLesson = idx > 0 ? flat[idx - 1] : null;
  const nextLesson = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  const [{ data: resources }, { data: freeMolds }] = await Promise.all([
    supabase.from('lab_resources').select('*').eq('lesson_id', lesson.id).order('order_index', { ascending: true }),
    supabase.from('free_molds').select('*').eq('lab_lesson_id', lesson.id).eq('is_active', true),
  ]);

  return {
    course,
    moduleItem,
    lesson,
    prevLesson,
    nextLesson,
    resources: (resources || []) as LabResource[],
    freeMolds: (freeMolds || []) as FreeMold[],
  };
}

export async function fetchGlossaryTerms(): Promise<LabGlossaryTerm[]> {
  const { data, error } = await supabase
    .from('lab_glossary_terms')
    .select('*')
    .eq('status', 'published')
    .order('order_index', { ascending: true })
    .order('term', { ascending: true });
  if (error) {
    console.error('fetchGlossaryTerms', error);
    return [];
  }
  return (data || []) as LabGlossaryTerm[];
}

export async function fetchGlossaryTermBySlug(slug: string): Promise<LabGlossaryTerm | null> {
  const { data, error } = await supabase
    .from('lab_glossary_terms')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error || !data) return null;
  return data as LabGlossaryTerm;
}

/** Moldes gratis vinculados a un curso (para "Moldes gratis para practicar"). */
export async function fetchFreeMoldsForCourse(courseId: string): Promise<FreeMold[]> {
  const { data, error } = await supabase
    .from('free_molds')
    .select('*')
    .eq('lab_course_id', courseId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) return [];
  return (data || []) as FreeMold[];
}

export interface RelatedLabLesson {
  lesson: LabLesson;
  courseSlug: string;
  moduleSlug: string;
}

/**
 * Clases del Lab que declaran esta guía como relacionada (related_guide_slugs
 * es cargado por el admin en cada clase real, nunca inventado acá). Devuelve
 * [] mientras no haya clases publicadas que la referencien — es infraestructura
 * lista para cuando el Lab tenga contenido, no una lista simulada.
 */
export async function fetchLessonsForGuide(guideSlug: string): Promise<RelatedLabLesson[]> {
  const { data: lessons, error } = await supabase
    .from('lab_lessons')
    .select('*')
    .eq('status', 'published')
    .contains('related_guide_slugs', [guideSlug]);
  if (error || !lessons || lessons.length === 0) return [];

  const moduleIds = [...new Set((lessons as LabLesson[]).map((l) => l.module_id))];
  const { data: modules } = await supabase
    .from('lab_modules')
    .select('id,slug,course_id')
    .eq('status', 'published')
    .in('id', moduleIds);
  if (!modules || modules.length === 0) return [];

  const courseIds = [...new Set(modules.map((m) => m.course_id))];
  const { data: courses } = await supabase
    .from('lab_courses')
    .select('id,slug')
    .eq('status', 'published')
    .in('id', courseIds);
  if (!courses || courses.length === 0) return [];

  const courseSlugById = new Map(courses.map((c) => [c.id, c.slug as string]));
  const moduleById = new Map(modules.map((m) => [m.id, m]));

  const result: RelatedLabLesson[] = [];
  for (const lesson of lessons as LabLesson[]) {
    const moduleItem = moduleById.get(lesson.module_id);
    const courseSlug = moduleItem && courseSlugById.get(moduleItem.course_id);
    if (!moduleItem || !courseSlug) continue;
    result.push({ lesson, courseSlug, moduleSlug: moduleItem.slug });
  }
  return result;
}

/** Moldes gratis vinculados a cualquier curso/clase del Lab (para la Home). */
export async function fetchLabFreeMolds(limit = 4): Promise<FreeMold[]> {
  const { data, error } = await supabase
    .from('free_molds')
    .select('*')
    .not('lab_course_id', 'is', null)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(limit);
  if (error) return [];
  return (data || []) as FreeMold[];
}
