import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'como-hacer-moldes-de-ropa-paso-a-paso',
  title: 'Cómo hacer un molde de ropa paso a paso',
  seoTitle: 'Cómo hacer un molde de ropa: guía paso a paso',
  description:
    'Los 7 pasos para hacer un molde de ropa profesional: medidas, molde base, transformación al modelo, muestra en muselina, corrección, escalado y digitalización.',
  intro:
    'Hacer un molde de ropa paso a paso implica tomar medidas del cuerpo o de una prenda base, trazar el molde base (bloque) con esas medidas, transformarlo en el modelo agregando escote, mangas, bolsillos o pinzas, confeccionar una muestra en tela económica para probar el calce, corregir el molde según esa prueba, escalarlo a toda la curva de talles y, si vas a producir en serie, pasarlo a formato digital. Cada paso condiciona al siguiente: un error en la medida o en el trazado del bloque se arrastra hasta la producción final.',
  sections: [
    {
      h2: 'Los 7 pasos, de un vistazo',
      paragraphs: [
        'Hacer un molde de forma profesional es un proceso de siete pasos que va de la medida a la producción en serie, y se repite modelo por modelo. No son estrictamente lineales (es común volver de la corrección al trazado), pero el orden general se mantiene: no se escala un molde que no se probó, ni se digitaliza uno que no se corrigió.',
      ],
      bullets: [
        'Tomar las medidas del cuerpo o de la prenda base.',
        'Trazar el molde base (bloque) con esas medidas.',
        'Transformar el bloque en el modelo: escote, mangas, bolsillos, pinzas.',
        'Confeccionar una muestra en muselina o percal para probar el calce.',
        'Corregir el molde según lo que muestra la prueba.',
        'Escalar el molde corregido a toda la curva de talles.',
        'Pasar el molde a formato digital si vas a producir en serie.',
      ],
    },
    {
      h2: 'Paso 1: tomar las medidas del cuerpo o de la prenda base',
      paragraphs: [
        'Se parte de una tabla de medidas (de una persona o de un talle de referencia) o de una prenda que ya calza bien, de la que se sacan medidas pieza por pieza, algo que se llama moldería por desarme. En los dos casos hace falta un set de medidas consistente antes de trazar nada.',
        'Las medidas más usadas para un bloque son contorno de busto o pecho, cintura, cadera, largo de talle, ancho de espalda, largo de manga y contorno de brazo; en pantalón se suma tiro, contorno y largo de pierna. Son orientativas y varían según el cuerpo, así que conviene medir siempre con la misma cinta y tensión.',
      ],
      bullets: [
        'Torso: contorno de busto o pecho, cintura, cadera, largo de talle delantero y espalda.',
        'Brazo: largo de manga, contorno de brazo y de puño.',
        'Pierna: tiro, contorno de cadera y de pierna, largo de pierna.',
      ],
    },
    {
      h2: 'Paso 2: trazar el molde base y transformarlo en el modelo',
      paragraphs: [
        'El bloque se traza en papel con esas medidas más una holgura mínima que varía según la prenda y la tela, usando escuadra, curvígrafo y cinta métrica, con una fórmula que reparte las medidas entre los puntos clave del cuerpo: busto, cintura, sisa, hombro. No tiene diseño, solo las pinzas estructurales necesarias, y de él se derivan después todos los modelos de esa familia de prenda.',
        'Para llegar al modelo, se transforma el bloque: se mueven o reparten las pinzas hacia una costura de diseño, se traza el escote buscado (redondo, en V, barco), se dibuja el tipo de manga (armada, ranglán, murciélago) sobre la sisa, y se agregan piezas como bolsillos, carteras o canesús. Cada transformación suma piezas o corta el bloque en partes, y ahí el molde deja de ser genérico y pasa a ser el patrón de un modelo concreto.',
      ],
    },
    {
      h2: 'Paso 3: confeccionar una muestra y corregir el molde',
      paragraphs: [
        'Antes de cortar la tela definitiva se corta y cose una muestra (o prototipo) en una tela económica de comportamiento neutro, como muselina, percal o friselina, que no distorsione el resultado con una elasticidad o una caída que la tela final no tiene. Se prueba sobre un maniquí del talle base o sobre una persona real, revisando cómo cae, cómo entra el cuerpo y si los largos son los buscados.',
        'Todo lo que muestra la prueba vuelve al molde: se ajusta una pinza, se mueve una costura o se corrige un largo. Es habitual que un modelo necesite más de una ronda de muestra y corrección antes de aprobarse, sobre todo si es una prenda entallada. Saltear este paso para ganar tiempo es lo que después aparece como devoluciones por mal calce en toda una tirada.',
      ],
    },
    {
      h2: 'Paso 4: escalar el molde corregido a toda la curva de talles',
      paragraphs: [
        'Con el talle base aprobado, se escala a toda la curva que vas a producir: XS a 4XL en adultos, 2 a 18 en niños, según a quién le vendas. Escalar no es agrandar el molde proporcionalmente en una fotocopiadora o en el PDF: el contorno crece más que el largo, y cada punto (sisa, cuello, hombro) tiene su propio incremento por talle.',
        'La progresión se hace punto por punto siguiendo una tabla de medidas, a mano o con un programa CAD (Optitex, Audaces, Gerber, Lectra) que automatiza el cálculo. Conviene validar al menos un talle extremo con una muestra propia, porque ahí es donde más suele fallar una progresión mal calculada.',
      ],
    },
    {
      h2: 'Paso 5: pasar el molde a digital, y por qué muchos no arrancan de cero',
      paragraphs: [
        'Si vas a producir en serie conviene digitalizar el molde: con una mesa digitalizadora o redibujándolo en un programa CAD, para obtener archivos DXF/AAMA, PDS de Optitex o el formato que pida tu proveedor de tizada. Un molde digital se corta con precisión, no se deforma como el cartón y permite armar la tizada computarizada (MRK) que ahorra tela.',
        'Todo el proceso (medir, trazar, transformar, probar, corregir, escalar y digitalizar) lleva en general varias semanas por modelo, sobre todo si hace falta más de una ronda de muestra. Por eso buena parte de los fabricantes que ya producen no arrancan cada modelo desde el bloque en blanco: parten de un molde digital con la muestra aprobada y la curva de talles hecha, y lo ajustan en vez de repetir los siete pasos.',
        'Modeltex, por ejemplo, tiene más de 2.000 moldes digitales de dama, hombre, niña, niño, bebés y unisex con la curva completa incluida en una sola compra (XS a 4XL en adultos, 2 a 18 en niños), aprobados con muestra confeccionada, en PDF A4, plotter, cartón o en formatos CAD (DXF/AAMA, PDS, MRK, ADS); y si el modelo no está en el catálogo, se puede pedir a medida desde una prenda, una foto o una idea. Esto no reemplaza saber moldería, pero saca del camino lo que más tiempo consume: probar, corregir y escalar desde cero.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Cómo hacer moldes de ropa paso a paso?',
      a: 'El proceso profesional tiene siete pasos: tomar medidas del cuerpo o de una prenda base, trazar el molde base (bloque), transformarlo en el modelo (escote, mangas, bolsillos, pinzas), confeccionar una muestra en muselina o percal, corregir el molde según la prueba, escalarlo a toda la curva de talles y, para producir en serie, pasarlo a formato digital.',
    },
    {
      q: '¿Qué es el molde base o bloque en moldería?',
      a: 'Es el molde sin diseño, trazado solo con las medidas del cuerpo o del talle y una holgura mínima, con las pinzas estructurales necesarias para que la tela se acomode al cuerpo, sin escotes de fantasía ni otros detalles. Es la base de la que se transforman todos los modelos de una misma familia de prenda, por ejemplo remeras, blusas y vestidos a partir de un mismo bloque de torso.',
    },
    {
      q: '¿Qué tela conviene usar para hacer la muestra de un molde?',
      a: 'Una tela económica y de comportamiento neutro, como muselina, percal o friselina, que no tenga una elasticidad o una caída distinta a la tela final. Sirve para revisar el molde antes de cortar la tela definitiva, así que conviene que su comportamiento se parezca al de esa tela, sobre todo si es un tejido de punto o con elastano.',
    },
    {
      q: '¿Cuánto tiempo lleva desarrollar un molde de ropa desde cero?',
      a: 'En general varias semanas entre medir, trazar el bloque, transformarlo, probar una o más muestras, corregir y escalar a toda la curva, sobre todo si hace falta más de una ronda de prueba. Por eso muchos fabricantes prefieren partir de un molde digital con la muestra ya aprobada y la curva hecha, y ajustarlo en vez de repetir todo el desarrollo.',
    },
    {
      q: '¿Necesito saber dibujar para hacer moldes de ropa?',
      a: 'No hace falta dibujo artístico: el trazado de moldes es un trabajo técnico con reglas, escuadras y fórmulas que reparten las medidas del cuerpo en puntos definidos, algo que se aprende como cualquier oficio técnico. Lo que sí hace falta es precisión al medir y prolijidad al trazar, porque un error de milímetros en el bloque se nota en la prenda terminada.',
    },
    {
      q: '¿Cómo se escala un molde a otros talles?',
      a: 'Escalar (o progresar) un molde es mover cada punto del bloque una distancia definida por talle según una tabla de medidas, no agrandarlo proporcionalmente: el contorno crece más que el largo, y cada zona tiene su propio incremento. Se hace a mano o con un programa CAD, y conviene validar al menos un talle extremo con una muestra propia.',
    },
  ],
  related: [
    { label: 'Cómo tomar medidas corporales para un molde', to: '/guias/medidas-corporales-para-moldes-de-ropa' },
    { label: 'Cómo escalar patrones a otros talles', to: '/guias/como-escalar-patrones-de-costura' },
    { label: 'Moldería a pedido con tu tabla de medidas', to: '/diseno-a-pedido' },
    { label: 'Catálogo de moldes digitales', to: '/catalogo' },
    { label: 'Moldes para emprendedores', to: '/moldes-para-emprendedores' },
  ],
  updated: '2026-09-07',
  keywords: [
    'cómo hacer un molde de ropa paso a paso',
    'cómo hacer moldes de ropa paso a paso',
    'molde base de ropa',
    'cómo transformar un molde de ropa',
    'muestra de molde en muselina',
    'escalar molde de ropa',
    'digitalizar molde de ropa',
    'moldería paso a paso',
  ],
};
