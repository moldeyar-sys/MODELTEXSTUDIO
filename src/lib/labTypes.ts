// Tipos de MODELTEX LAB (curso gratis de moldería textil). A diferencia de
// las guías (src/lib/guiasTypes.ts, contenido estático en código), todo esto
// vive en Supabase (tablas lab_*) para que el admin cargue/edite/publique
// clases sin tocar código.

export type LabStatus = 'draft' | 'published';

/** Mismo shape que GuiaSection (src/lib/guiasTypes.ts): reuso de convención. */
export interface LabDevelopmentBlock {
  h3?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LabMistake {
  mistake: string;
  fix: string;
}

export interface LabFaq {
  q: string;
  a: string;
}

export interface LabCourse {
  id: string;
  slug: string;
  track_slug: string;
  title: string;
  subtitle: string;
  description: string;
  objectives: string[];
  requirements: string[];
  estimated_duration: string;
  cover_image_url: string;
  author: string;
  order_index: number;
  status: LabStatus;
  created_at: string;
  updated_at: string;
}

export interface LabModule {
  id: string;
  course_id: string;
  slug: string;
  level_label: string;
  level_order: number;
  title: string;
  description: string;
  objectives: string[];
  order_index: number;
  status: LabStatus;
  created_at: string;
  updated_at: string;
}

export interface LabLesson {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  objective: string;
  before_start: string;
  concept: string;
  development: LabDevelopmentBlock[];
  steps: string[];
  example: string;
  common_mistakes: LabMistake[];
  modeltex_tip: string;
  exercise_instructions: string;
  faqs: LabFaq[];
  summary: string;
  related_guide_slugs: string[];
  order_index: number;
  status: LabStatus;
  author: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LabGlossaryTerm {
  id: string;
  slug: string;
  term: string;
  short_definition: string;
  explanation: string;
  example: string;
  related_lesson_ids: string[];
  order_index: number;
  status: LabStatus;
  created_at: string;
  updated_at: string;
}

export type LabResourceType = 'pdf' | 'image' | 'table' | 'link' | 'molde' | 'cad';

export interface LabResource {
  id: string;
  course_id: string | null;
  module_id: string | null;
  lesson_id: string | null;
  type: LabResourceType;
  title: string;
  url: string;
  order_index: number;
  created_at: string;
}

export interface LabProgressRow {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  exercise_done: boolean;
  completed_at: string;
  updated_at: string;
}

/** Módulo con sus clases ya cargadas (para armar el sidebar/índice del curso). */
export interface LabModuleWithLessons extends LabModule {
  lessons: LabLesson[];
}

/** Curso con su árbol completo (para LabCoursePage/LabLessonPage). */
export interface LabCourseWithContent extends LabCourse {
  modules: LabModuleWithLessons[];
}

/** Progreso agregado de un curso para un alumno (logueado o anónimo). */
export interface LabCourseProgress {
  courseSlug: string;
  completedLessonIds: string[];
  totalLessons: number;
  percent: number;
  lastLessonSlug?: string;
  lastModuleSlug?: string;
}
