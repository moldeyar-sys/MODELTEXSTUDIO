import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'programas-gratis-de-molderia-digital',
  title: 'Programas gratis de moldería digital: Seamly2D, Valentina e Inkscape',
  seoTitle: 'Programas gratis de moldería digital: cuáles hay',
  description:
    'Seamly2D, Valentina e Inkscape para moldería digital gratis: qué permiten, sus límites frente a Optitex, Audaces, Gerber y Lectra, y el atajo para producir ya.',
  intro:
    'Para hacer moldería digital gratis existen Seamly2D (programa gratuito y de código abierto que traza moldes paramétricos por medidas, continuación de Valentina), Valentina en sí, y programas de dibujo vectorial genéricos como Inkscape, útiles para digitalizar un molde ya trazado a mano. Sirven para aprender y trazar tu propio molde sin pagar licencia, pero no tienen el escalado industrial automático, el tizado optimizado ni la madurez DXF/AAMA del software profesional (Optitex, Audaces, Gerber AccuMark, Lectra).',
  sections: [
    {
      h2: 'Qué hace un programa de moldería digital y qué podés pedirle a uno gratis',
      paragraphs: [
        'Un programa de moldería digital sirve para trazar las piezas de un molde a partir de una tabla de medidas, ajustar curvas con precisión, generar la progresión de talles y exportar el molde en un formato listo para imprimir o cortar. Bajo "gratis" hay dos caminos distintos: programas pensados para moldería, que trazan por medidas con reglas paramétricas, y programas de dibujo vectorial genérico, que no entienden de moldería pero sirven para digitalizar algo ya trazado en papel.',
        'Para quien recién arranca o tiene un taller chico, los dos caminos son válidos para dejar de depender solo del papel y la curva francesa, y empezar a trabajar con un archivo que se corrige y se reimprime igual las veces que haga falta.',
      ],
    },
    {
      h2: 'Seamly2D: el programa gratuito para trazar moldes por medidas',
      paragraphs: [
        'Seamly2D es un programa gratuito y de código abierto, para Windows, Mac y Linux, que traza un molde base a partir de una tabla de medidas definiendo cada punto de la pieza con fórmulas: el punto de sisa en relación al contorno de busto, el ancho de espalda en relación al de pecho, y así con el resto. Es la opción gratuita más completa hoy: trazado paramétrico, piezas por capas y la tabla de medidas reutilizable en otro modelo.',
        'Tiene curva de aprendizaje real, no es arrastrar y soltar, y su comunidad es mucho más chica que la de un software profesional, así que resolver un problema puntual lleva más tiempo. Para trazar tus propios moldes base sin pagar licencia, es la herramienta gratuita más seria que hay.',
      ],
    },
    {
      h2: 'Valentina: el antecesor de Seamly2D',
      paragraphs: [
        'Valentina es el programa del que se desprendió Seamly2D: el proyecto se dividió y hoy Seamly2D es la rama con desarrollo y soporte más activo, aunque Valentina sigue disponible para descargar. Para instalar por primera vez conviene ir directo a Seamly2D; si ya tenés archivos en Valentina, en general se abren en Seamly2D sin perder el trabajo.',
        'Vale la pena conocer el nombre porque en tutoriales en español todavía aparece como referencia, pero conviene priorizar la versión con más mantenimiento.',
      ],
    },
    {
      h2: 'Inkscape para digitalizar un molde que ya trazaste a mano',
      paragraphs: [
        'Inkscape es un programa de dibujo vectorial gratuito, sin funciones de moldería, pero muy usado en talleres chicos para pasar a digital un molde ya trazado y probado en papel. El proceso habitual es escanear la pieza, importarla como imagen de referencia, calibrar la escala con una medida conocida (por ejemplo 10 cm marcados en el papel) y trazar los contornos con curvas Bézier sobre esa imagen.',
        'El resultado es un archivo vectorial (SVG, exportable a PDF) que ya no depende del papel: se reimprime sin deformación y se guardan versiones distintas del mismo molde. Lo que Inkscape no hace es escalar la pieza a otros talles ni generar un molde desde una tabla de medidas: solo redibuja con precisión lo que ya existe.',
      ],
    },
    {
      h2: 'Qué no tienen las herramientas gratuitas frente a Optitex, Audaces, Gerber AccuMark o Lectra',
      paragraphs: [
        'La diferencia real no es la interfaz, es lo que pasa después de trazar el molde base. El software pago tiene escalado industrial automático robusto: cargás una tabla de progresión y el programa genera los ocho talles de adulto o los nueve de niño con las reglas ya calculadas en cada punto, algo que en las herramientas gratuitas se resuelve de forma manual o no está disponible.',
        'Tampoco tienen tizado optimizado, que acomoda las piezas de una tirada sobre el ancho real de la tela para minimizar el descarte. Y el intercambio DXF/AAMA, el estándar que lee cualquier CAD de la industria, está mucho más maduro en el software pago: permite mandar un molde a tizar en otro sistema o a otra fábrica sin rehacer nada.',
        'Esto no invalida a Seamly2D, Valentina o Inkscape: son gratuitas y sirven para aprender y trazar diseños propios. Pero cuando la operación crece, la producción real se apoya mayormente en el software pago, o combina ambos mundos exportando a DXF/AAMA para progresar y tizar en un CAD profesional.',
      ],
    },
    {
      h2: 'Cuándo conviene cada camino',
      paragraphs: [
        'Si estás arrancando y querés entender cómo se arma un molde, trazar en Seamly2D con tu propia tabla de medidas es tiempo bien invertido: aprendés una lógica que después reconocés en cualquier software, gratis o pago. Si ya tenés moldes en papel probados con muestra y solo necesitás pasarlos a digital, Inkscape resuelve ese paso sin exigirte aprender moldería paramétrica.',
        'Si el objetivo es producir en serie para vender, con la curva completa, tizada optimizada y la posibilidad de mandar el molde a cualquier fábrica con CAD, ahí el software profesional deja de ser un lujo y pasa a ser una herramienta de producción.',
      ],
    },
    {
      h2: 'La alternativa más rápida: partir de un molde digital ya hecho',
      paragraphs: [
        'Para quien no quiere pasar por la curva de aprendizaje de ningún programa antes de producir, la alternativa más rápida es partir de un molde digital ya hecho, en el formato que necesites: PDF A4 o plotter para cortar directo, o DXF/AAMA para tu CAD. Ese molde ya tiene resuelto el desarrollo y la progresión de talles, aprobados con muestra confeccionada, que es lo que más tiempo consume en los caminos anteriores.',
        'Modeltex tiene más de 2.000 moldes digitales con la curva de talles completa (XS a 4XL en adultos, 2 a 18 en niños) en PDF, DXF/AAMA y otros formatos de CAD, y desarrolla moldería a pedido si partís de una prenda, una foto o tu propia tabla de medidas. Esto no excluye aprender a trazar tus propios moldes: muchos talleres producen ya con moldes hechos y en paralelo se forman en Seamly2D o en un CAD profesional.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Qué programas hay para hacer moldería digital gratis?',
      a: 'Los más usados son Seamly2D, gratuito y de código abierto, que traza moldes por medidas con fórmulas paramétricas, y Valentina, su antecesor, con menos desarrollo activo. Para digitalizar un molde ya trazado a mano se usa Inkscape, un programa de dibujo vectorial que no entiende de moldería pero permite redibujar contornos sobre una imagen escaneada. Ninguno reemplaza al software profesional (Optitex, Audaces, Gerber AccuMark, Lectra) en escalado automático, tizado optimizado o DXF/AAMA, pero sirven para aprender y trazar moldes propios sin pagar licencia.',
    },
    {
      q: '¿Seamly2D permite generar la curva de talles industrial?',
      a: 'Permite algo de escalado con fórmulas por punto, pero no tiene un motor de progresión tan robusto como el de un CAD profesional, que genera de una vez los ocho o nueve talles de la curva desde una tabla de incrementos. Para una curva industrial completa, el software pago sigue siendo lo más confiable.',
    },
    {
      q: '¿Qué diferencia hay entre Seamly2D y Valentina?',
      a: 'Seamly2D nació de una bifurcación de Valentina y hoy es la versión con desarrollo y soporte más activo, aunque las dos siguen disponibles gratis. Para instalar por primera vez conviene ir directo a Seamly2D; si ya tenés archivos en Valentina, en general se abren en Seamly2D sin perder el trabajo.',
    },
    {
      q: '¿Sirve Inkscape para hacer moldes de ropa?',
      a: 'Sirve para digitalizar un molde ya trazado en papel: escaneás la pieza, calibrás la escala con una medida conocida y volvés a trazar los contornos como curvas vectoriales, que después se reimprimen sin deformación. Lo que no hace es generar un molde desde una tabla de medidas ni escalarlo a otros talles: redibuja lo que ya existe, no reemplaza a un programa de moldería paramétrica.',
    },
    {
      q: '¿Los moldes hechos en un programa gratis se pueden abrir en Optitex o Audaces?',
      a: 'El intercambio vía DXF/AAMA desde herramientas gratuitas es limitado y no siempre conserva toda la información (curvas, piquetes, reglas de talle) con la fidelidad de un programa profesional. Para producción real con Optitex, Audaces, Gerber AccuMark o Lectra, lo habitual es progresar y tizar directo en ese software, o partir de un molde que ya viene en DXF/AAMA maduro.',
    },
    {
      q: '¿Conviene aprender un programa gratis o comprar un molde digital ya hecho para empezar a producir?',
      a: 'Depende de lo que necesites: si querés desarrollar tus propios diseños y tenés tiempo para la curva de aprendizaje, Seamly2D es un punto de partida serio y gratuito. Si necesitás producir ya, partir de un molde digital hecho, como los de Modeltex, con la curva de talles aprobada con muestra en PDF o DXF/AAMA, es lo más rápido, sin impedir que en paralelo te formes en un software de moldería.',
    },
  ],
  related: [
    { label: 'Cómo digitalizar patrones de papel', to: '/guias/como-digitalizar-patrones-de-papel' },
    {
      label: 'Cómo abrir moldes DXF/AAMA en Optitex, Audaces, Gerber y Lectra',
      to: '/guias/abrir-moldes-dxf-en-optitex-audaces-gerber-lectra',
    },
    { label: 'Cómo escalar patrones de costura', to: '/guias/como-escalar-patrones-de-costura' },
    { label: 'Catálogo de moldes digitales', to: '/catalogo' },
    { label: 'Moldería a pedido', to: '/diseno-a-pedido' },
  ],
  updated: '2026-09-07',
  keywords: [
    'programas gratis de moldería digital',
    'seamly2d',
    'valentina moldería',
    'inkscape para moldes de ropa',
    'software de moldería industrial',
    'optitex audaces gerber lectra',
    'digitalizar patrones gratis',
    'moldería paramétrica gratis',
  ],
};
