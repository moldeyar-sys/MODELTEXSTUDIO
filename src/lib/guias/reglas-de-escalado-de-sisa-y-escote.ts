import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'reglas-de-escalado-de-sisa-y-escote',
  title: 'Reglas de escalado de sisa y escote entre talles',
  seoTitle: 'Cómo escalar la sisa y el escote por talle',
  description:
    'Cómo suelen escalarse la sisa y el escote entre talles: cuánto se profundizan y ensanchan, y por qué el aplomo importa más que los milímetros exactos.',
  intro:
    'Las reglas de escalado de sisa y escote no son una norma única: cada escuela de moldería y cada sistema CAD arma su propia tabla, pero un criterio orientativo habitual profundiza la sisa entre 5 y 10 mm por talle y la ensancha entre 3 y 7 mm, mientras que el escote crece un poco en ancho y algo más en caída, repartido de forma distinta entre delantero y espalda. Lo que sí es no negociable es mantener el aplomo: que el punto de sisa y el de escote sigan alineados con el resto del molde en todos los talles.',
  sections: [
    {
      h2: 'Qué significa escalar la sisa y el escote',
      paragraphs: [
        'Escalar un patrón es mover cada punto del contorno la distancia que indica una tabla de incrementos, para generar el resto de los talles sin perder la forma de la pieza. La sisa y el escote son curvas abiertas, no un contorno cerrado como el de busto o cadera: conectan el delantero y la espalda con otra pieza (manga, cuello o viveza) y tienen que seguir encastrando con esa pieza en cada talle.',
        'Por eso se escalan con su propia lógica, separada de la del contorno de busto: hay que decidir cuánto se corre cada punto (el más alto, el del costado, la base del escote) para que la forma se mantenga y la pieza que se le cose siga calzando.',
      ],
    },
    {
      h2: 'Cuánto se profundiza y se ensancha la sisa por talle',
      paragraphs: [
        'No hay una cifra oficial: cada escuela, cada sistema CAD y cada fabricante arma su propia tabla, y el número cambia según el tipo de prenda (una remera no escala igual que un saco entallado). Como ejemplo orientativo:',
      ],
      bullets: [
        'Profundidad de sisa (de hombro hacia abajo): entre 5 y 10 mm más por talle.',
        'Ancho de sisa (lo que se abre entre delantero y espalda en el punto de sisa): entre 3 y 7 mm por talle.',
        'En los talles extremos (3XL, 4XL) ambos incrementos suelen acelerarse, igual que el contorno de busto.',
      ],
    },
    {
      h2: 'Cómo se reparte el crecimiento del escote entre el ancho y la caída',
      paragraphs: [
        'El escote crece en dos direcciones que se manejan por separado: el ancho (la distancia entre los dos puntos de hombro) y la caída, que es cuánto baja el escote sobre el pecho o la espalda. Un modelo puede necesitar más ancho y poca caída, o al revés, según el diseño de la prenda.',
      ],
      bullets: [
        'Ancho de escote: entre 3 y 5 mm por talle, ligado al crecimiento del ancho de hombro.',
        'Caída de escote delantero: entre 3 y 6 mm por talle.',
        'Caída de escote espalda: entre 1 y 3 mm por talle, porque la espalda tiene menos volumen que acomodar que el delantero.',
      ],
    },
    {
      h2: 'Por qué la sisa no crece igual que el contorno de busto',
      paragraphs: [
        'El contorno de busto o pecho suele crecer entre 4 y 6 cm por talle, pero eso es una circunferencia completa alrededor del torso. La sisa es solo el tramo de esa circunferencia que queda libre para la manga, y si creciera en la misma proporción, la copa de manga terminaría desproporcionada respecto del ancho de espalda y del largo de manga.',
        'Por eso la sisa crece menos en milímetros que si se repartiera en partes iguales el crecimiento del busto. Buena parte de esa diferencia la absorbe la holgura de la prenda, no el punto de sisa. La regla de la sisa se define aparte, mirando cómo debe quedar la copa de manga.',
      ],
    },
    {
      h2: 'El aplomo importa más que igualar los milímetros exactos',
      paragraphs: [
        'Aplomo es que el punto de sisa, el de escote y las demás referencias del molde (línea de busto, centro delantero, costura lateral) sigan alineados entre sí de un talle al siguiente, guardando la misma proporción de la pieza. Es más importante que la exactitud del milímetro: una tabla con incrementos apenas distintos a los de otra marca funciona igual si el aplomo se mantiene, pero una tabla con los números correctos aplicada sin cuidar el aplomo arruina el escalado.',
        'El punto de piquete (la muesca que marca dónde entra la manga en la sisa, o dónde coincide el cuello con el escote) es donde más se nota si se perdió el aplomo: si queda corrido, la manga o el cuello dejan de coincidir, y el problema aparece recién al coser la muestra. Para verificarlo alcanza con superponer los talles, en papel con luz o en pantalla en CAD, y confirmar que el piquete siguió la misma línea que el resto del contorno.',
      ],
    },
    {
      h2: 'Escalar la sisa y el escote a mano, con tabla de incrementos',
      paragraphs: [
        'A mano se trazan primero las líneas guía (línea de busto, línea de sisa, centro delantero) sobre el molde base, la referencia fija desde la que se mueve cada punto. Después se desplaza cada punto de la sisa y del escote la distancia que indica la tabla de incrementos, con regla y escuadra, y se retraza la curva con curva francesa o pistolete, cuidando que no pierda continuidad.',
        'Es preciso si se hace con cuidado, pero exige repetir el trazado en cada uno de los ocho o nueve talles de la curva, y el riesgo de perder el aplomo crece con cada repetición.',
      ],
    },
    {
      h2: 'Escalar en CAD: la regla se carga una sola vez',
      paragraphs: [
        'En Optitex, Audaces o Gerber la regla de escalado de sisa y escote se define una sola vez por pieza: se asigna a cada punto su desplazamiento horizontal y vertical, y el sistema genera automáticamente los ocho o nueve talles de la curva, con el mismo criterio en todas las piezas del modelo.',
        'La ventaja no es solo velocidad: el programa permite superponer los talles en pantalla y revisar si el aplomo se mantiene, algo que a mano exige comparar molde por molde. Los moldes digitales de Modeltex se entregan con esta regla ya definida y con la curva completa escalada y aprobada con muestra confeccionada, así que la sisa y el escote de cada talle ya vienen resueltos.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Cuáles son las reglas de escalado de la sisa y el escote?',
      a: 'No hay una regla única: cada escuela y cada sistema CAD arma su propia tabla, pero un criterio orientativo habitual profundiza la sisa entre 5 y 10 mm por talle y la ensancha entre 3 y 7 mm, mientras que el escote crece entre 3 y 5 mm de ancho y entre 1 y 6 mm de caída, más en el delantero que en la espalda. Esos números se ajustan a la tabla de medidas real de cada fabricante y se validan con una muestra cosida.',
    },
    {
      q: '¿Cuánto se profundiza la sisa por talle?',
      a: 'Como ejemplo orientativo, la sisa suele profundizarse entre 5 y 10 mm por talle, un poco más en los talles extremos (3XL, 4XL). No es un número fijo: depende del tipo de prenda y de la tabla de medidas de cada marca, y conviene confirmarlo con una muestra cosida.',
    },
    {
      q: '¿Cómo crece el escote entre un talle y el siguiente?',
      a: 'El escote crece en dos direcciones: el ancho, entre 3 y 5 mm por talle, y la caída, que suele crecer más en el delantero (3 a 6 mm) que en la espalda (1 a 3 mm), porque el volumen que aparece entre talles se concentra adelante. Son valores orientativos que cada fabricante ajusta a su propia tabla de medidas.',
    },
    {
      q: '¿Por qué la sisa no crece en la misma proporción que el contorno de busto?',
      a: 'Porque el contorno de busto es una circunferencia completa (crece entre 4 y 6 cm por talle, como referencia orientativa) y la sisa es solo el tramo de esa circunferencia libre para la manga. Si la sisa creciera en la misma proporción, la copa de manga quedaría desproporcionada; buena parte de esa diferencia la absorbe la holgura de la prenda, no el punto de sisa.',
    },
    {
      q: '¿Qué es el aplomo y por qué importa más que los milímetros exactos?',
      a: 'Aplomo es que el punto de sisa, el de escote y las demás referencias del molde sigan alineados entre sí de un talle al siguiente, sin correrse respecto de la proporción de la pieza. Una tabla con incrementos apenas distintos funciona igual si el aplomo se mantiene, pero una tabla con los números correctos aplicada sin cuidarlo hace que la manga o el cuello dejen de coincidir al coser.',
    },
    {
      q: '¿Cambia escalar la sisa a mano o en un programa CAD?',
      a: 'A mano se traza sobre líneas guía y se mueve cada punto con regla y escuadra, talle por talle, con más riesgo de perder el aplomo cuantos más talles tiene la curva. En Optitex, Audaces o Gerber la regla se carga una sola vez y el sistema genera toda la curva; los moldes de Modeltex ya vienen con esta regla resuelta y la curva completa aprobada con muestra confeccionada.',
    },
  ],
  related: [
    { label: 'Cómo escalar patrones de costura', to: '/guias/como-escalar-patrones-de-costura' },
    { label: 'Tabla de medidas industriales', to: '/guias/tabla-de-medidas-industriales' },
    { label: 'Catálogo de moldes con curva de talles', to: '/catalogo' },
    { label: 'Moldería a pedido con tu tabla de medidas', to: '/diseno-a-pedido' },
  ],
  updated: '2026-09-08',
  keywords: [
    'reglas de escalado de sisa y escote',
    'cómo escalar la sisa',
    'escalado de escote entre talles',
    'profundidad de sisa por talle',
    'aplomo en moldería',
    'grading de sisa y escote',
    'escalar sisa en Optitex',
  ],
};
