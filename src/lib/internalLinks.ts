// Enlaces internos editoriales por pagina.
//
// POR QUE EXISTE: el HTML inicial de varias paginas comerciales tenia UN solo
// enlace (o dos). /moldes-para-plotter enlazaba unicamente al catalogo
// filtrado; /preguntas-frecuentes, con 21.000 caracteres de contenido util, no
// enlazaba a ninguna pagina de producto. Para un rastreador eso son callejones
// sin salida: la autoridad que llega a esas paginas no baja a ningun lado, y
// las fichas quedan alcanzables solo desde el sitemap, sin texto de anclaje
// que diga de que son.
//
// COMO SE USA: middleware.ts agrega este bloque al final del HTML inicial de
// cada pagina estatica, y src/components/ui/RelatedLinks.tsx lo renderiza del
// lado de React. Un solo lugar para editarlos, y los dos lados enlazan
// exactamente lo mismo.
//
// CRITERIO: enlaces que un lector realmente querria seguir desde esa pagina,
// con texto de anclaje descriptivo (nunca "hacer clic aca"), y siempre un
// camino hacia el catalogo o hacia un pedido. Nada de repetir los mismos 40
// enlaces en todas las paginas: eso no es enlazado interno, es un pie de
// pagina disfrazado.

export interface RelatedLink {
  to: string;
  label: string;
  hint: string;
}

export interface RelatedBlock {
  title: string;
  links: RelatedLink[];
  /** Categorías del catálogo debajo del bloque: baja de lo temático al producto. */
  categorias?: boolean;
  /** Guías relacionadas, por slug de /guias/. */
  guias?: Array<{ slug: string; label: string }>;
}

// --- Destinos reutilizados -------------------------------------------------

const CATALOGO: RelatedLink = {
  to: '/catalogo',
  label: 'Catálogo completo de moldes',
  hint: 'Más de 2.000 moldes con filtros por categoría, temporada y formato.',
};
const MOLDERIA_DIGITAL: RelatedLink = {
  to: '/molderia-digital',
  label: 'Moldería digital: formatos y usos',
  hint: 'Qué formato conviene según cómo cortás y cuándo pedir un molde a medida.',
};
const GRATIS: RelatedLink = {
  to: '/moldes-gratis',
  label: 'Moldes gratis para descargar',
  hint: 'Moldes reales del catálogo, sin pagar, para ver el nivel de terminación.',
};
const A_MEDIDA: RelatedLink = {
  to: '/diseno-a-pedido',
  label: 'Moldería a medida',
  hint: 'Desarrollamos el molde desde tu prenda, foto o idea, con tu tabla de medidas.',
};
const LAB: RelatedLink = {
  to: '/lab',
  label: 'Curso gratis de moldería textil',
  hint: 'MODELTEX LAB: de los fundamentos a la producción industrial.',
};
const GUIAS: RelatedLink = {
  to: '/guias',
  label: 'Guías para producción',
  hint: 'Formatos, telas, curva de talles, tizadas, consumo de tela y costeo.',
};
const PDF: RelatedLink = {
  to: '/moldes-pdf',
  label: 'Moldes PDF para imprimir',
  hint: 'Qué son, qué incluye cada archivo y cómo se imprimen.',
};
const A4: RelatedLink = {
  to: '/moldes-pdf-a4',
  label: 'Moldes PDF A4',
  hint: 'Para imprimir en una impresora común y pegar las hojas numeradas.',
};
const PLOTTER: RelatedLink = {
  to: '/moldes-para-plotter',
  label: 'Moldes para plotter',
  hint: 'Ancho real de 90, 120 o 150 cm, en una sola lámina y sin uniones.',
};
const IMPRESION: RelatedLink = {
  to: '/ayuda-impresion',
  label: 'Cómo imprimir sin perder escala',
  hint: 'El paso que evita cortar una tanda entera fuera de medida.',
};
const EMPRENDEDORES: RelatedLink = {
  to: '/moldes-para-emprendedores',
  label: 'Moldes para emprendedores',
  hint: 'Para arrancar una marca sin desarrollar moldería desde cero.',
};
const FAQ: RelatedLink = {
  to: '/preguntas-frecuentes',
  label: 'Preguntas frecuentes',
  hint: 'Formatos, talles, impresión, pagos, entrega, licencia y reembolsos.',
};
const COMO_FUNCIONA: RelatedLink = {
  to: '/como-funciona',
  label: 'Cómo funciona la compra',
  hint: 'Elegir molde, formato y talles, pagar y descargar.',
};
const CONTACTO: RelatedLink = {
  to: '/contacto',
  label: 'Contacto',
  hint: 'WhatsApp, Telegram y email, las 24 horas.',
};

/** Categorías del catálogo: el escalón que baja de una página temática al producto. */
export const CATEGORIA_LINKS: RelatedLink[] = [
  { to: '/catalogo?categoria=dama', label: 'Moldes para dama', hint: 'Vestidos, blusas, tops, calzas, buzos y camperas.' },
  { to: '/catalogo?categoria=hombre', label: 'Moldes para hombre', hint: 'Remeras, chombas, buzos, joggers, camisas y pantalones.' },
  { to: '/catalogo?categoria=nina', label: 'Moldes para niña', hint: 'Vestidos, tops, faldas, shorts, calzas y buzos.' },
  { to: '/catalogo?categoria=nino', label: 'Moldes para niño', hint: 'Remeras, buzos, joggers, shorts y pijamas.' },
  { to: '/catalogo?categoria=bebes', label: 'Moldes para bebés', hint: 'Bodies y prendas de bebé con la curva completa.' },
  { to: '/catalogo?categoria=adultos-unisex', label: 'Moldes unisex para adultos', hint: 'Camperas deportivas, buzos y remeras.' },
  { to: '/catalogo?categoria=ninos-unisex', label: 'Moldes unisex para niños', hint: 'Buzos, remeras, camperas y shorts escolares.' },
];

// --- Bloque por ruta -------------------------------------------------------

export const RELATED: Record<string, RelatedBlock> = {
  '/moldes-pdf': {
    title: 'Seguir por acá',
    links: [A4, PLOTTER, MOLDERIA_DIGITAL, CATALOGO, GRATIS, IMPRESION, A_MEDIDA, FAQ],
    categorias: true,
    guias: [
      { slug: 'formatos-de-molderia-digital', label: 'Qué formato de molde conviene para tu taller o fábrica' },
      { slug: 'impresion-de-moldes-en-plotter', label: 'Cómo imprimir moldes en plotter' },
      { slug: 'moldes-para-sublimacion', label: 'Moldes para ropa sublimada y deportiva' },
    ],
  },
  '/moldes-pdf-a4': {
    title: 'Seguir por acá',
    links: [
      { to: '/catalogo?formato=PDF%20A4', label: 'Catálogo filtrado por formato A4', hint: 'Los moldes que se entregan en PDF A4.' },
      IMPRESION,
      PLOTTER,
      MOLDERIA_DIGITAL,
      GRATIS,
      CATALOGO,
      EMPRENDEDORES,
      COMO_FUNCIONA,
    ],
    categorias: true,
    guias: [
      { slug: 'formatos-de-molderia-digital', label: 'Qué formato de molde conviene para tu taller o fábrica' },
      { slug: 'como-hacer-moldes-de-ropa-paso-a-paso', label: 'Cómo hacer un molde de ropa paso a paso' },
      { slug: 'curva-de-talles-industrial', label: 'Curva de talles para producción' },
    ],
  },
  '/moldes-para-plotter': {
    title: 'Seguir por acá',
    links: [
      { to: '/catalogo?formato=PDF%20Plotter', label: 'Catálogo filtrado por formato plotter', hint: 'Los moldes que se entregan en ancho real.' },
      A4,
      MOLDERIA_DIGITAL,
      CATALOGO,
      A_MEDIDA,
      IMPRESION,
      GRATIS,
      FAQ,
    ],
    categorias: true,
    guias: [
      { slug: 'impresion-de-moldes-en-plotter', label: 'Cómo imprimir moldes en plotter para un taller' },
      { slug: 'tizada-computarizada-mrk', label: 'Qué es una tizada (MRK) y cómo ahorra tela' },
      { slug: 'abrir-moldes-dxf-en-optitex-audaces-gerber-lectra', label: 'Cómo abrir un molde DXF/AAMA en Optitex, Audaces, Gerber y Lectra' },
      { slug: 'consumo-de-tela-por-prenda', label: 'Cómo calcular el consumo de tela por prenda' },
    ],
  },
  '/moldes-gratis': {
    title: 'Seguir por acá',
    links: [LAB, CATALOGO, PDF, A4, PLOTTER, MOLDERIA_DIGITAL, EMPRENDEDORES, IMPRESION],
    categorias: true,
    guias: [
      { slug: 'como-hacer-moldes-de-ropa-paso-a-paso', label: 'Cómo hacer un molde de ropa paso a paso' },
      { slug: 'medidas-corporales-para-moldes-de-ropa', label: 'Medidas corporales para hacer un molde' },
      { slug: 'telas-por-tipo-de-prenda', label: 'Qué tela usar para cada tipo de prenda' },
    ],
  },
  '/moldes-para-emprendedores': {
    title: 'Seguir por acá',
    links: [GRATIS, A4, CATALOGO, MOLDERIA_DIGITAL, LAB, A_MEDIDA, COMO_FUNCIONA, FAQ],
    categorias: true,
    guias: [
      { slug: 'costeo-de-una-prenda', label: 'Cómo costear una prenda para producir y vender' },
      { slug: 'armar-una-coleccion-con-moldes-digitales', label: 'Cómo armar una colección con moldes digitales' },
      { slug: 'copy-para-vender-moldes-digitales-en-instagram', label: 'Cómo escribir el copy para vender en Instagram' },
    ],
  },
  '/lab': {
    title: 'Para practicar y producir',
    links: [GRATIS, GUIAS, CATALOGO, MOLDERIA_DIGITAL, PDF, A4, EMPRENDEDORES, A_MEDIDA],
    categorias: true,
    guias: [
      { slug: 'como-hacer-moldes-de-ropa-paso-a-paso', label: 'Cómo hacer un molde de ropa paso a paso' },
      { slug: 'glosario-de-molderia', label: 'Glosario de moldería y producción textil' },
      { slug: 'que-es-el-patronaje-industrial', label: 'Qué es el patronaje industrial' },
    ],
  },
  '/preguntas-frecuentes': {
    title: 'Dónde seguir',
    links: [CATALOGO, MOLDERIA_DIGITAL, PDF, A4, PLOTTER, GRATIS, A_MEDIDA, COMO_FUNCIONA, IMPRESION, CONTACTO],
    categorias: true,
  },
  '/como-funciona': {
    title: 'Seguir por acá',
    links: [CATALOGO, GRATIS, PDF, A4, PLOTTER, MOLDERIA_DIGITAL, FAQ, CONTACTO],
    categorias: true,
  },
  '/ayuda-impresion': {
    title: 'Seguir por acá',
    links: [A4, PLOTTER, PDF, MOLDERIA_DIGITAL, CATALOGO, GRATIS, FAQ, CONTACTO],
    guias: [
      { slug: 'impresion-de-moldes-en-plotter', label: 'Cómo imprimir moldes en plotter para un taller' },
      { slug: 'conversion-de-pulgadas-a-centimetros-para-molderia', label: 'Sistema métrico y pulgadas fraccionales en moldería' },
    ],
  },
  '/diseno-a-pedido': {
    title: 'Antes de pedir a medida',
    links: [CATALOGO, MOLDERIA_DIGITAL, GRATIS, PDF, PLOTTER, EMPRENDEDORES, FAQ, CONTACTO],
    categorias: true,
    guias: [
      { slug: 'como-digitalizar-patrones-de-papel', label: 'Cómo digitalizar patrones de papel' },
      { slug: 'ficha-tecnica-de-diseno-para-taller-de-confeccion', label: 'Cómo redactar una ficha técnica para un taller' },
      { slug: 'tabla-de-medidas-industriales', label: 'Tabla de medidas industriales: cómo armar la tuya' },
    ],
  },
  '/ia-textil': {
    title: 'Seguir por acá',
    links: [CATALOGO, MOLDERIA_DIGITAL, GRATIS, LAB, GUIAS, A_MEDIDA, EMPRENDEDORES, FAQ],
    categorias: true,
  },
  '/quienes-somos': {
    title: 'Conocé el trabajo',
    links: [CATALOGO, MOLDERIA_DIGITAL, GRATIS, A_MEDIDA, LAB, GUIAS, FAQ, CONTACTO],
    categorias: true,
  },
  '/contacto': {
    title: 'Quizás encuentres la respuesta acá',
    links: [FAQ, COMO_FUNCIONA, IMPRESION, CATALOGO, MOLDERIA_DIGITAL, A_MEDIDA, GRATIS, LAB],
  },
  '/guias': {
    title: 'Aplicar las guías',
    links: [CATALOGO, MOLDERIA_DIGITAL, PDF, A4, PLOTTER, GRATIS, LAB, A_MEDIDA],
    categorias: true,
  },
  '/politica-descargas': {
    title: 'Seguir por acá',
    links: [FAQ, COMO_FUNCIONA, CATALOGO, GRATIS, CONTACTO],
  },
  '/terminos': {
    title: 'Seguir por acá',
    links: [FAQ, COMO_FUNCIONA, CATALOGO, CONTACTO],
  },
  '/privacidad': {
    title: 'Seguir por acá',
    links: [FAQ, COMO_FUNCIONA, CATALOGO, CONTACTO],
  },
};

/** Bloque de una ruta, o null si esa ruta no define uno. */
export function relatedFor(path: string): RelatedBlock | null {
  return RELATED[path] || null;
}
