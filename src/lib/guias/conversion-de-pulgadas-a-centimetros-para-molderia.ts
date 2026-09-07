import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'conversion-de-pulgadas-a-centimetros-para-molderia',
  title: 'Conversión de pulgadas a centímetros para moldería',
  seoTitle: 'Pulgadas a centímetros: tabla exacta para moldería',
  description:
    'Cuánto es exactamente una pulgada en centímetros, la tabla de fracciones que se usan en costura y cómo convertir un DXF sin perder precisión.',
  intro:
    'Una pulgada equivale exactamente a 2,54 centímetros: es una conversión matemática exacta, no una aproximación, fijada por acuerdo internacional desde 1959. A partir de ese número se derivan todas las fracciones de pulgada que aparecen en patrones y programas CAD de origen norteamericano (1/8", 1/4", 1/2", 5/8", entre otras), cada una con su equivalente exacto en centímetros. Conocer esa tabla y revisar en qué unidad está configurado un archivo antes de importar un DXF evita que un molde termine con la escala corrida.',
  sections: [
    {
      h2: 'Cuánto es exactamente una pulgada en centímetros',
      paragraphs: [
        'El valor no es una aproximación: desde 1959, por acuerdo internacional entre Estados Unidos, el Reino Unido y otros países de habla inglesa, 1 pulgada (in, o el símbolo ") se define como exactamente 2,54 centímetros. No es 2,5 ni 2,55: es 2,54 exacto, y de ahí sale cualquier otra conversión entre los dos sistemas.',
        'La fórmula funciona en los dos sentidos: pulgadas a centímetros se multiplica por 2,54, centímetros a pulgadas se divide por 2,54. Un ancho de tela de 60 pulgadas son 60 × 2,54 = 152,4 cm; una plancha de plotter de 150 cm son 150 ÷ 2,54 = 59,05 pulgadas.',
      ],
    },
    {
      h2: 'Tabla de conversión de fracciones de pulgada usadas en costura',
      paragraphs: [
        'En costura de origen norteamericano las medidas chicas casi nunca se escriben en decimales de pulgada sino en fracciones con denominador en potencias de dos: octavos, dieciseisavos, presentes en el margen de costura, en la separación entre piquetes o en la altura de un dobladillo. La tabla da el equivalente en centímetros, redondeado al centésimo; el valor exacto de 1/8", por ejemplo, es 0,3175 cm, redondeado a 0,32 cm.',
        'Para fracciones más finas la misma lógica funciona: 1/16" son 0,0625 pulgadas, que multiplicadas por 2,54 dan 0,16 cm. Alcanza con pasar la fracción a decimal de pulgada y multiplicarla por 2,54, sin memorizar una tabla más larga.',
      ],
      bullets: [
        '1/8" = 0,32 cm',
        '1/4" = 0,64 cm',
        '3/8" = 0,95 cm',
        '1/2" = 1,27 cm',
        '5/8" = 1,59 cm',
        '3/4" = 1,91 cm',
        '7/8" = 2,22 cm',
        '1" = 2,54 cm',
      ],
    },
    {
      h2: 'Por qué el sistema de pulgadas fraccionales sigue vivo en patrones y CAD norteamericanos',
      paragraphs: [
        'Estados Unidos nunca completó la conversión al sistema métrico en su industria y comercio cotidiano, y la indumentaria no fue la excepción: reglas, cintas métricas, tablas de talles y programas CAD de origen norteamericano siguen en pulgadas por costumbre y por compatibilidad con décadas de moldería y documentación ya hechas en esa unidad.',
        'Los programas CAD de ese origen permiten configurar el archivo en pulgadas o fracciones de pulgada como unidad nativa, y buena parte de los patrones comerciales, revistas y cursos en inglés siguen publicando así sus medidas, incluido el margen de costura estándar de la costura doméstica, casi siempre en octavos de pulgada.',
      ],
    },
    {
      h2: 'Por qué en Argentina y buena parte de Latinoamérica se trabaja en centímetros y milímetros',
      paragraphs: [
        'Argentina adoptó el sistema métrico decimal en el siglo diecinueve, y toda la industria textil local (cintas métricas, reglas de sastre, tablas de talles, moldería de escuelas y editoriales, y la Ley 27.521 de talles que crea el SUNITI) trabaja en centímetros y milímetros: es lo que enseña cualquier escuela de moldería del país y lo que trae por default cualquier ficha técnica producida acá, como las de Modeltex.',
        'Eso importa cuando se cruzan proveedores u orígenes distintos: un molde hecho en Argentina, un patrón de una revista estadounidense y un DXF exportado desde un CAD en pulgadas conviven en el mismo taller sin que nada avise, a simple vista, en qué unidad está cada uno.',
      ],
    },
    {
      h2: 'Cómo convertir sin perder precisión: recomendaciones prácticas',
      paragraphs: [
        'La primera regla es verificar la unidad configurada en el CAD antes de importar un DXF, no después: Optitex, Audaces, Gerber y Lectra permiten fijar la unidad de trabajo, y si el archivo viene en pulgadas mientras el sistema espera milímetros, todo el molde entra con una escala 2,54 veces más chica sin que el programa avise nada, porque para el software son solo números.',
        'Conviene convertir primero con la fórmula exacta y recién redondear al medio milímetro, la precisión con la que se marca y corta en la práctica: un margen de 5/8" da 1,5875 cm exactos, que se marca como 1,6 cm, y un largo de 24 pulgadas da 60,96 cm, que se redondea a 61 cm. Ese redondeo conviene aplicarlo una sola vez, al final: hacerlo fracción por fracción acumula más error.',
      ],
    },
    {
      h2: 'Verificar la escala después de importar un DXF en pulgadas',
      paragraphs: [
        'Antes de tizar o cortar sobre un archivo convertido conviene una prueba simple: medir en el programa una pieza cuya medida real ya se conoce, por ejemplo el contorno de cintura del talle base, y compararla contra ese dato. Si aparece 2,54 veces más chica o más grande que lo esperado, la unidad de importación quedó mal configurada y hay que rehacerla antes de seguir, no corregirla a mano pieza por pieza.',
        'El chequeo importa más todavía cuando el DXF pasa por más de un programa, porque cada conversión de formato es una oportunidad más para que la unidad se pierda en el camino. Guardar en la ficha técnica del molde la unidad de origen del archivo evita tener que adivinar la próxima vez que se abra.',
      ],
    },
    {
      h2: 'Moldería que ya viene en el sistema que se usa en el taller',
      paragraphs: [
        'Para un taller que produce en Argentina, evitar esta conversión es tan simple como partir de moldería que ya viene en centímetros y milímetros. Los moldes digitales de Modeltex se entregan en PDF A4, PDF plotter y cartón con medidas en centímetros, y también en DXF/AAMA, PDS, MRK y ADS para Optitex, Audaces, Gerber y Lectra, con la unidad configurada de forma explícita.',
        'La conversión se vuelve necesaria sobre todo con un patrón importado, una revista en inglés o un CAD que llegó de un proveedor de otro país. Tener la tabla y la fórmula a mano, y el hábito de revisar la unidad antes de importar, evita que ese molde termine con una escala corrida.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Cuánto es exactamente una pulgada en centímetros?',
      a: 'Una pulgada equivale a exactamente 2,54 centímetros, por definición internacional vigente desde 1959, sin aproximar. Para pasar cualquier medida en pulgadas a centímetros alcanza con multiplicarla por 2,54; para el camino inverso, se divide por 2,54.',
    },
    {
      q: '¿Cuál es la diferencia entre el sistema métrico y las pulgadas fraccionales en moldería?',
      a: 'El sistema métrico mide en centímetros y milímetros con divisiones decimales, y es el que se usa en Argentina y buena parte de Latinoamérica. El sistema de pulgadas fraccionales, de uso mayoritario en Estados Unidos, divide la pulgada en mitades sucesivas (1/2, 1/4, 1/8, 1/16) en vez de decimales, y aparece en patrones, revistas y programas CAD de origen norteamericano. Los dos se convierten entre sí con la misma constante exacta, 2,54 cm por pulgada, pero conviene no mezclarlos dentro de un mismo molde sin pasar todo a una sola unidad.',
    },
    {
      q: '¿Cómo convierto 1/4 de pulgada a centímetros?',
      a: '1/4 de pulgada son 0,25 pulgadas; multiplicado por 2,54 da 0,635 cm, que se redondea a 0,64 cm. El mismo procedimiento sirve para cualquier fracción: pasarla a decimal de pulgada y multiplicarla por 2,54.',
    },
    {
      q: '¿Por qué los patrones de costura estadounidenses usan pulgadas y no centímetros?',
      a: 'Porque Estados Unidos nunca completó la conversión al sistema métrico en su industria y comercio cotidiano, y la moldería y los programas CAD de ese origen siguen en esa unidad por costumbre y compatibilidad con décadas de patrones ya publicados. El margen de costura doméstica en ese país, por ejemplo, suele ser 5/8 de pulgada, es decir 1,59 cm.',
    },
    {
      q: '¿Qué pasa si importo un DXF en pulgadas a un programa configurado en milímetros?',
      a: 'El molde entra con una escala 2,54 veces más chica o más grande según el sentido del error, sin que el programa avise nada, porque para el software son solo números sin unidad implícita. Conviene revisar y fijar la unidad de importación antes de abrir el archivo, y confirmar después midiendo una pieza cuya medida real ya se conoce.',
    },
    {
      q: '¿Conviene redondear las conversiones de pulgadas a centímetros?',
      a: 'Sí, pero al final del cálculo, no en cada paso intermedio: conviene convertir con la fórmula exacta y recién ahí redondear al medio milímetro, la precisión con la que se marca y corta en la práctica. Redondear varias fracciones por separado antes de sumarlas acumula más error que redondear una sola vez el resultado final.',
    },
  ],
  related: [
    { label: 'Exportar y convertir DXF entre Optitex y Audaces', to: '/guias/exportar-y-convertir-dxf-entre-optitex-y-audaces' },
    { label: 'Cómo abrir moldes DXF en Optitex, Audaces, Gerber y Lectra', to: '/guias/abrir-moldes-dxf-en-optitex-audaces-gerber-lectra' },
    { label: 'Moldes PDF A4 con medidas en centímetros', to: '/moldes-pdf-a4' },
    { label: 'Moldes para plotter en ancho real', to: '/moldes-para-plotter' },
    { label: 'Catálogo completo de moldes digitales', to: '/catalogo' },
  ],
  updated: '2026-09-08',
  keywords: [
    'conversión de pulgadas a centímetros',
    'cuánto es una pulgada en centímetros',
    'diferencia entre sistema métrico y pulgadas fraccionales',
    'tabla de pulgadas a centímetros costura',
    '1/4 de pulgada a centímetros',
    'pulgadas fraccionales moldería',
    'DXF en pulgadas a milímetros',
    'convertir molde de pulgadas a centímetros',
  ],
};
