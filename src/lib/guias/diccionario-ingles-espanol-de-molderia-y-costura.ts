import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'diccionario-ingles-espanol-de-molderia-y-costura',
  title: 'Diccionario inglés-español de términos de moldería y costura',
  seoTitle: 'Diccionario inglés-español de moldería y costura',
  description:
    'Más de 35 términos reales de moldería y costura en inglés con su traducción al español, organizados por tema: medidas, piezas del molde, costura y CAD.',
  intro:
    'Dart es pinza, seam allowance es margen de costura, notch es piquete y grainline es línea de hilo o hilo recto: estos son algunos de los más de 35 términos de moldería y costura en inglés que reunimos acá, agrupados por tema, para leer un instructivo, una ficha técnica o un archivo DXF en inglés sin tener que buscar cada palabra suelta. Sirve tanto para traducir del inglés al español como al revés, si el pedido es al contrario.',
  sections: [
    {
      h2: 'Por qué aparece tanto vocabulario técnico en inglés',
      paragraphs: [
        'Buena parte del lenguaje técnico de moldería y costura llegó del inglés porque ahí nacieron el software de diseño textil, buena parte de la maquinaria industrial y las revistas y moldes de las marcas internacionales (Big Four: Simplicity, Vogue, McCall\'s, Butterick, entre otras). Un taller que trabaja para una marca extranjera, importa una ficha técnica o mira un tutorial en YouTube se cruza todo el tiempo con estos términos, aunque el resto del trabajo sea en español.',
        'Pasa lo mismo puertas adentro de los programas CAD: Optitex, Audaces, Gerber y Lectra traen menús traducibles, pero los nombres internos de puntos, capas y comandos de un archivo DXF/AAMA suelen quedar en inglés (notch, grainline, seam allowance), así que conviene reconocerlos aunque el resto de la interfaz esté en español.',
      ],
    },
    {
      h2: 'Medidas del cuerpo',
      paragraphs: [
        'Las medidas que se toman para trazar o ajustar un molde tienen su propio nombre en inglés, y aparecen así en cualquier tabla de medidas o ficha de talles importada.',
      ],
      bullets: [
        'bust: busto',
        'chest: pecho (contorno de pecho, en moldería masculina)',
        'waist: cintura',
        'hip: cadera',
        'shoulder width / across back: ancho de espalda',
        'sleeve length: largo de manga',
        'neck: contorno de cuello',
        'inseam: entrepierna',
        'rise: tiro',
        'thigh: muslo',
        'ease: holgura',
      ],
    },
    {
      h2: 'Piezas, líneas y puntos del molde',
      paragraphs: [
        'Estos son los términos que se leen directamente sobre el dibujo de un molde o en las capas de un archivo digital, sea papel, cartón o DXF.',
      ],
      bullets: [
        'dart: pinza',
        'seam allowance: margen de costura',
        'notch: piquete',
        'grainline: línea de hilo o hilo recto',
        'bias: sesgo',
        'princess seam: costura princesa',
        'yoke: canesú',
        'facing: vista',
        'interfacing: entretela',
        'gusset: cuña o refuerzo',
        'block / sloper: molde base',
        'seam line: línea de costura',
        'dart point: punta de pinza',
        'waistband: pretina',
      ],
    },
    {
      h2: 'Costura y terminaciones',
      paragraphs: [
        'Del molde a la prenda terminada aparece otro grupo de términos, los que describen cómo se arma y se termina cada pieza en la máquina.',
      ],
      bullets: [
        'hem: dobladillo o ruedo',
        'pleat: tabla o pliegue',
        'gather: fruncido',
        'topstitch: pespunte',
        'understitch: pespunte interno que fija una vista o entretela',
        'edgestitch: pespunte al filo del borde',
        'cuff: puño',
        'collar: cuello',
        'placket: tapeta',
        'binding: vivo o ribete',
        'lining: forro',
      ],
    },
    {
      h2: 'Producción, escalado y tizada',
      paragraphs: [
        'En la etapa de producción en serie el vocabulario cambia de nuevo: son los términos que se usan para hablar de talles, corte y organización del trabajo, no de la pieza en sí.',
      ],
      bullets: [
        'pattern grading: escalado de patrones',
        'marker / lay: tizada',
        'cutting: corte',
        'nesting: acomodo de piezas dentro de la tizada',
        'spreading: tendido de tela',
        'sample: muestra',
        'size run: curva de talles',
        'cut order: orden de corte',
        'style: modelo',
      ],
    },
    {
      h2: 'Software y archivos: términos que suelen quedar en inglés',
      paragraphs: [
        'Estos no siempre se traducen ni en el uso diario: se dicen igual en español, pero conviene tener clara la traducción o el significado exacto para no confundirlos con otra cosa.',
      ],
      bullets: [
        'CAD (computer-aided design): diseño asistido por computadora',
        'plotter: trazador o impresora de gran formato',
        'digitizer / digitizing table: mesa digitalizadora',
        'DXF/AAMA: formato universal de intercambio de moldes entre programas CAD',
        'layer: capa (de un archivo digital)',
        'pattern making software: programa de diseño de moldes',
      ],
    },
    {
      h2: 'Cómo usar este diccionario al leer una ficha técnica en inglés',
      paragraphs: [
        'Frente a una ficha técnica o un instructivo en inglés, lo más rápido es buscar primero las palabras que se repiten en varias líneas: casi siempre son los términos de esta lista, porque una ficha de producción nombra las mismas piezas y medidas una y otra vez (waist, dart, seam allowance, notch). Una vez identificadas esas palabras clave, el resto del texto suele entenderse por contexto aunque no se domine el inglés técnico completo.',
        'Con archivos digitales pasa algo parecido: al abrir un DXF/AAMA en Optitex o Audaces, los nombres de capa y de punto que trae el archivo suelen estar en inglés incluso si el molde se hizo en un país hispanohablante, porque es el estándar con el que se exporta para que lo lea cualquier programa CAD del mundo. Los moldes digitales de Modeltex, por ejemplo, se entregan en DXF/AAMA compatible con Optitex, Audaces, Gerber y Lectra, además de PDF, PDS, ADS, MRK, PLT y cartón, así que reconocer estos términos ayuda a moverse en el archivo sin depender de que esté todo traducido.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Cómo se dicen en inglés los términos de moldería y costura más usados?',
      a: 'Los más frecuentes son dart (pinza), seam allowance (margen de costura), notch (piquete), grainline (línea de hilo o hilo recto), hem (dobladillo), waist (cintura), bust (busto) y pattern grading (escalado de patrones). La lista completa de este diccionario agrupa más de 35 términos por tema: medidas del cuerpo, piezas del molde, costura y producción.',
    },
    {
      q: '¿Qué significa dart en costura?',
      a: 'Dart es pinza: el pliegue cosido en forma de triángulo que da volumen o ajusta la tela al cuerpo, típico en busto y cintura de moldería femenina. El punto donde termina se llama dart point, o punta de pinza en español.',
    },
    {
      q: '¿Qué es el seam allowance de un molde?',
      a: 'Seam allowance es el margen de costura: la tela adicional entre la línea de costura y el borde de corte de la pieza, la que permite coser sin que la costura quede al filo. En los moldes digitales viene incluido y marcado, así que no hace falta calcularlo aparte.',
    },
    {
      q: '¿Cómo se dice tizada en inglés?',
      a: 'Tizada se dice marker o lay, según el país o el programa CAD que se use; el proceso de acomodar las piezas dentro de esa tizada para gastar menos tela se llama nesting. En español también se usa "tendido y tizada" para nombrar las dos etapas juntas: spreading (tendido de tela) y marker (tizada).',
    },
    {
      q: '¿Qué significa grainline en un molde?',
      a: 'Grainline es la línea de hilo o hilo recto: la flecha marcada en cada pieza del molde que indica cómo tiene que alinearse con el sentido de la trama de la tela al cortar. Si esa línea no se respeta, la prenda puede quedar torcida o caer distinto de un lado que del otro.',
    },
    {
      q: '¿Por qué programas como Optitex o Gerber usan tantos términos en inglés?',
      a: 'Porque son programas de origen estadounidense o europeo que se volvieron estándar mundial para moldería digital, y los nombres de comandos, capas y puntos de sus archivos (DXF/AAMA) se definieron en inglés desde el principio. Aunque el menú esté traducido al español, muchos nombres internos del archivo quedan igual para que cualquier programa CAD, en cualquier país, lo pueda leer sin errores.',
    },
  ],
  related: [
    { label: 'Glosario de moldería y producción textil', to: '/guias/glosario-de-molderia' },
    { label: 'Abrir moldes DXF/AAMA en Optitex, Audaces, Gerber y Lectra', to: '/guias/abrir-moldes-dxf-en-optitex-audaces-gerber-lectra' },
    { label: 'Exportar y convertir DXF entre Optitex y Audaces', to: '/guias/exportar-y-convertir-dxf-entre-optitex-y-audaces' },
    { label: 'Catálogo completo de moldes digitales', to: '/catalogo' },
    { label: 'Moldería a pedido con tu tabla de medidas', to: '/diseno-a-pedido' },
  ],
  updated: '2026-09-08',
  keywords: [
    'diccionario inglés español de moldería',
    'términos de costura en inglés',
    'cómo se dice pinza en inglés',
    'glosario de costura en inglés y español',
    'vocabulario de moldería en inglés',
    'dart seam allowance notch en español',
    'traducir términos de patronaje',
    'términos de moldería en inglés',
  ],
};
