// Datos ESTÁTICOS para la grilla de "Microlearning" de la página de curso
// (LabCoursePage.tsx) — título, nivel, duración y a qué video/URL apuntar en
// el reproductor de vista previa. Editar este archivo cambia lo que se ve en
// esa grilla, sin tocar componentes.
//
// OJO — qué es y qué NO es este archivo:
// El contenido REAL de cada clase (lo que se lee al entrar a /lab/:curso/
// :modulo/:clase — objetivo, desarrollo, pasos, preguntas de repaso, etc.)
// sigue viviendo en Supabase (tablas lab_courses/lab_modules/lab_lessons) y
// se edita desde /admin → pestaña Lab, sin tocar código ni este archivo. Esa
// es la fuente de verdad del curso.
//
// Este archivo es solo el snapshot liviano que arma la vista previa/embudo
// de venta: título, duración y nivel que se muestran ACÁ pueden quedar
// desactualizados si después cambiás la clase real desde el admin (por eso
// es una lista separada y no algo calculado en vivo). `moduleSlug` +
// `lessonSlug` tienen que seguir matcheando una clase real para que el link
// "Ver clase" funcione — si renombrás un slug en el admin, actualizalo acá
// también.
//
// `videoUrl` queda vacío a propósito: hoy no hay video real. El día que haya
// (ej. Youtube/Vimeo/Mux embebido), completarlo acá alcanza para que el
// reproductor dependa de una URL de una vez, sin tocar LabCoursePage.tsx.

export interface LabPreviewLesson {
  /** Id estable para analytics (ver src/lib/analytics.ts) — no es el id de Supabase. */
  id: string;
  title: string;
  /** Etiqueta de nivel/módulo, ej. "Nivel 1 — Fundamentos". */
  level: string;
  /** Minutos estimados (snapshot manual, no se recalcula solo). */
  durationMinutes: number;
  /** URL del video cuando exista contenido en video real. Vacío = se muestra el placeholder "Vista previa". */
  videoUrl?: string;
  /** slug del módulo real en Supabase, para armar el link a la clase. */
  moduleSlug: string;
  /** slug de la clase real en Supabase, para armar el link a la clase. */
  lessonSlug: string;
}

export interface LabPreviewCourse {
  /** Tiene que matchear el slug real del curso (lab_courses.slug). */
  courseSlug: string;
  lessons: LabPreviewLesson[];
}

export const LAB_COURSES_PREVIEW: LabPreviewCourse[] = [
  {
    courseSlug: 'molderia-a-medida',
    lessons: [
      { id: 'molderia-a-medida-que-es-la-molderia', title: 'Qué es la moldería y qué necesitás para empezar', level: 'Nivel 1 — Fundamentos', durationMinutes: 2, moduleSlug: 'fundamentos', lessonSlug: 'que-es-la-molderia' },
      { id: 'molderia-a-medida-como-tomar-medidas', title: 'Cómo tomar las medidas del cuerpo', level: 'Nivel 1 — Fundamentos', durationMinutes: 2, moduleSlug: 'fundamentos', lessonSlug: 'como-tomar-medidas' },
      { id: 'molderia-a-medida-diferencia-molderia-patronaje', title: '¿Moldería y patronaje son lo mismo?', level: 'Nivel 1 — Fundamentos', durationMinutes: 5, moduleSlug: 'fundamentos', lessonSlug: 'diferencia-molderia-patronaje' },
      { id: 'molderia-a-medida-como-se-construye-un-molde-paso-a-paso', title: 'Cómo se construye un molde, paso a paso', level: 'Nivel 2 — Tu primer molde base', durationMinutes: 6, moduleSlug: 'tu-primer-molde-base', lessonSlug: 'como-se-construye-un-molde-paso-a-paso' },
      { id: 'molderia-a-medida-molde-base-de-una-falda', title: 'Cómo hacer el molde base de una falda', level: 'Nivel 2 — Tu primer molde base', durationMinutes: 8, moduleSlug: 'tu-primer-molde-base', lessonSlug: 'molde-base-de-una-falda' },
      { id: 'molderia-a-medida-molde-base-de-un-pantalon', title: 'Cómo hacer el molde base de un pantalón', level: 'Nivel 2 — Tu primer molde base', durationMinutes: 7, moduleSlug: 'tu-primer-molde-base', lessonSlug: 'molde-base-de-un-pantalon' },
      { id: 'molderia-a-medida-que-tela-elegir-segun-la-prenda', title: 'Qué tela elegir según la prenda', level: 'Nivel 3 — De la tela a la prenda', durationMinutes: 6, moduleSlug: 'de-la-tela-a-la-prenda', lessonSlug: 'que-tela-elegir-segun-la-prenda' },
      { id: 'molderia-a-medida-por-que-se-arruga-el-tiro-del-pantalon', title: 'Por qué se arruga el tiro del pantalón (y cómo corregirlo)', level: 'Nivel 3 — De la tela a la prenda', durationMinutes: 7, moduleSlug: 'de-la-tela-a-la-prenda', lessonSlug: 'por-que-se-arruga-el-tiro-del-pantalon' },
      { id: 'molderia-a-medida-siguientes-pasos-despues-de-tu-primer-molde', title: 'Siguientes pasos después de tu primer molde', level: 'Nivel 3 — De la tela a la prenda', durationMinutes: 4, moduleSlug: 'de-la-tela-a-la-prenda', lessonSlug: 'siguientes-pasos-despues-de-tu-primer-molde' },
    ],
  },
  {
    courseSlug: 'molderia-industrial',
    lessons: [
      { id: 'molderia-industrial-molderia-industrial-vs-a-medida', title: 'Qué es la moldería industrial y en qué se diferencia de la moldería a medida', level: 'Nivel 1 — Introducción a la producción', durationMinutes: 2, moduleSlug: 'introduccion-a-la-produccion', lessonSlug: 'molderia-industrial-vs-a-medida' },
      { id: 'molderia-industrial-tabla-de-talles-industrial', title: 'Tabla de talles industrial: cómo se arma y para qué sirve', level: 'Nivel 1 — Introducción a la producción', durationMinutes: 2, moduleSlug: 'introduccion-a-la-produccion', lessonSlug: 'tabla-de-talles-industrial' },
      { id: 'molderia-industrial-que-es-el-patronaje-industrial', title: 'Qué es el patronaje industrial', level: 'Nivel 1 — Introducción a la producción', durationMinutes: 6, moduleSlug: 'introduccion-a-la-produccion', lessonSlug: 'que-es-el-patronaje-industrial' },
      { id: 'molderia-industrial-como-escalar-patrones-de-costura', title: 'Cómo escalar patrones de costura', level: 'Nivel 2 — Escalado de talles', durationMinutes: 6, moduleSlug: 'escalado-de-talles', lessonSlug: 'como-escalar-patrones-de-costura' },
      { id: 'molderia-industrial-reglas-de-escalado-de-sisa-y-escote', title: 'Reglas de escalado de sisa y escote', level: 'Nivel 2 — Escalado de talles', durationMinutes: 7, moduleSlug: 'escalado-de-talles', lessonSlug: 'reglas-de-escalado-de-sisa-y-escote' },
      { id: 'molderia-industrial-como-armar-tu-tabla-de-medidas-industrial', title: 'Cómo armar tu propia tabla de medidas industrial', level: 'Nivel 2 — Escalado de talles', durationMinutes: 6, moduleSlug: 'escalado-de-talles', lessonSlug: 'como-armar-tu-tabla-de-medidas-industrial' },
      { id: 'molderia-industrial-formatos-de-molderia-digital-cuales-existen', title: 'Formatos de moldería digital: cuáles existen', level: 'Nivel 3 — Moldería digital y CAD', durationMinutes: 6, moduleSlug: 'molderia-digital-y-cad', lessonSlug: 'formatos-de-molderia-digital-cuales-existen' },
      { id: 'molderia-industrial-programas-gratis-para-empezar-en-digital', title: 'Programas gratis para empezar en moldería digital', level: 'Nivel 3 — Moldería digital y CAD', durationMinutes: 7, moduleSlug: 'molderia-digital-y-cad', lessonSlug: 'programas-gratis-para-empezar-en-digital' },
      { id: 'molderia-industrial-como-digitalizar-patrones-de-papel', title: 'Cómo digitalizar patrones de papel', level: 'Nivel 3 — Moldería digital y CAD', durationMinutes: 7, moduleSlug: 'molderia-digital-y-cad', lessonSlug: 'como-digitalizar-patrones-de-papel' },
      { id: 'molderia-industrial-que-es-la-tizada-y-como-ahorra-tela', title: 'Qué es la tizada y cómo ahorra tela', level: 'Nivel 4 — De la tizada a la fábrica', durationMinutes: 6, moduleSlug: 'de-la-tizada-a-la-fabrica', lessonSlug: 'que-es-la-tizada-y-como-ahorra-tela' },
      { id: 'molderia-industrial-cuanto-consumo-de-tela-necesito', title: 'Cuánto consumo de tela necesito', level: 'Nivel 4 — De la tizada a la fábrica', durationMinutes: 6, moduleSlug: 'de-la-tizada-a-la-fabrica', lessonSlug: 'cuanto-consumo-de-tela-necesito' },
      { id: 'molderia-industrial-como-armar-una-ficha-tecnica-para-el-taller', title: 'Cómo armar una ficha técnica para el taller', level: 'Nivel 4 — De la tizada a la fábrica', durationMinutes: 7, moduleSlug: 'de-la-tizada-a-la-fabrica', lessonSlug: 'como-armar-una-ficha-tecnica-para-el-taller' },
    ],
  },
  {
    courseSlug: 'diseno-de-moda',
    lessons: [
      { id: 'diseno-de-moda-disenador-modelista-modista-quien-hace-que', title: 'Diseñador, modelista, modista: quién hace qué', level: 'Nivel 1 — Fundamentos del diseño', durationMinutes: 6, moduleSlug: 'fundamentos-del-diseno', lessonSlug: 'disenador-modelista-modista-quien-hace-que' },
      { id: 'diseno-de-moda-siluetas-y-proporciones', title: 'Siluetas y proporciones: el vocabulario visual básico', level: 'Nivel 1 — Fundamentos del diseño', durationMinutes: 7, moduleSlug: 'fundamentos-del-diseno', lessonSlug: 'siluetas-y-proporciones' },
      { id: 'diseno-de-moda-del-boceto-al-figurin-tecnico', title: 'Del boceto al figurín técnico', level: 'Nivel 1 — Fundamentos del diseño', durationMinutes: 7, moduleSlug: 'fundamentos-del-diseno', lessonSlug: 'del-boceto-al-figurin-tecnico' },
      { id: 'diseno-de-moda-linea-y-color-en-el-diseno', title: 'Línea y color en el diseño de indumentaria', level: 'Nivel 2 — El lenguaje visual', durationMinutes: 9, moduleSlug: 'el-lenguaje-visual', lessonSlug: 'linea-y-color-en-el-diseno' },
      { id: 'diseno-de-moda-textura-tejidos-y-eleccion-de-tela', title: 'Textura, tejidos y cómo elegir la tela correcta', level: 'Nivel 2 — El lenguaje visual', durationMinutes: 7, moduleSlug: 'el-lenguaje-visual', lessonSlug: 'textura-tejidos-y-eleccion-de-tela' },
      { id: 'diseno-de-moda-estampados-tipos-escala-y-coordinacion', title: 'Estampados: tipos, escala y coordinación', level: 'Nivel 2 — El lenguaje visual', durationMinutes: 7, moduleSlug: 'el-lenguaje-visual', lessonSlug: 'estampados-tipos-escala-y-coordinacion' },
      { id: 'diseno-de-moda-de-la-inspiracion-al-concepto-de-coleccion', title: 'De la inspiración al concepto de colección', level: 'Nivel 3 — Cómo se arma una colección', durationMinutes: 6, moduleSlug: 'como-se-arma-una-coleccion', lessonSlug: 'de-la-inspiracion-al-concepto-de-coleccion' },
      { id: 'diseno-de-moda-paleta-de-color-y-storyboard-de-coleccion', title: 'Paleta de color y storyboard de colección', level: 'Nivel 3 — Cómo se arma una colección', durationMinutes: 6, moduleSlug: 'como-se-arma-una-coleccion', lessonSlug: 'paleta-de-color-y-storyboard-de-coleccion' },
      { id: 'diseno-de-moda-desarrollo-de-disenos-de-coleccion', title: 'Desarrollo de diseños: del croquis a la colección final', level: 'Nivel 3 — Cómo se arma una colección', durationMinutes: 6, moduleSlug: 'como-se-arma-una-coleccion', lessonSlug: 'desarrollo-de-disenos-de-coleccion' },
      { id: 'diseno-de-moda-que-es-una-tendencia-y-como-se-pronostica', title: 'Qué es una tendencia y cómo se pronostica', level: 'Nivel 4 — Tendencias y mercado', durationMinutes: 10, moduleSlug: 'tendencias-y-mercado', lessonSlug: 'que-es-una-tendencia-y-como-se-pronostica' },
      { id: 'diseno-de-moda-buenos-aires-y-el-consumidor-argentino', title: 'Buenos Aires y el consumidor argentino', level: 'Nivel 4 — Tendencias y mercado', durationMinutes: 10, moduleSlug: 'tendencias-y-mercado', lessonSlug: 'buenos-aires-y-el-consumidor-argentino' },
      { id: 'diseno-de-moda-ficha-tecnica-el-puente-entre-diseno-y-taller', title: 'La ficha técnica: el puente entre el diseño y el taller', level: 'Nivel 4 — Tendencias y mercado', durationMinutes: 6, moduleSlug: 'tendencias-y-mercado', lessonSlug: 'ficha-tecnica-el-puente-entre-diseno-y-taller' },
      { id: 'diseno-de-moda-recursos-para-seguir-aprendiendo-diseno', title: 'Recursos para seguir aprendiendo diseño de moda', level: 'Nivel 5 — Seguir formándote', durationMinutes: 7, moduleSlug: 'seguir-formandote', lessonSlug: 'recursos-para-seguir-aprendiendo-diseno' },
    ],
  },
];

export function getLabPreviewLessons(courseSlug: string): LabPreviewLesson[] {
  return LAB_COURSES_PREVIEW.find((c) => c.courseSlug === courseSlug)?.lessons ?? [];
}

/** Recursos ("Materiales y software"): también estático, se va completando a mano cuando haya demos/PDFs reales. */
export interface LabPlannedResource {
  label: string;
  kind: 'software' | 'pdf';
}

export const LAB_PLANNED_RESOURCES: LabPlannedResource[] = [
  { label: 'Optitex — versión demo', kind: 'software' },
  { label: 'Audaces — versión demo', kind: 'software' },
  { label: 'Plantilla de tabla de medidas (PDF)', kind: 'pdf' },
  { label: 'Ficha técnica en blanco (PDF)', kind: 'pdf' },
];
