import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'tabla-de-medidas-s-a-xl-dama-hombre-nino',
  title: 'Tabla de medidas en centímetros: dama, hombre y niños S a XL',
  seoTitle: 'Tabla de medidas en cm para dama, hombre y niños S-XL',
  description:
    'Tres tablas de ejemplo en centímetros (busto o pecho, cintura y cadera) del talle S al XL para dama, hombre y niños, con la progresión típica de la industria.',
  intro:
    'Estas son tres tablas de ejemplo en centímetros, del talle S al XL, con contorno de busto o pecho, cintura y cadera para dama, hombre y niños, usando una progresión típica de la industria (4 cm por talle en dama, un poco más en hombre). Es un ejemplo orientativo para entender cómo crece cada medida entre talles, no una norma oficial: cada fabricante ajusta su propia tabla y la valida con una muestra cosida antes de producir en serie.',
  sections: [
    {
      h2: 'Qué es esta tabla y para qué sirve',
      paragraphs: [
        'Esta tabla ordena, talle por talle, las tres medidas que más definen el calce: contorno de busto o pecho, contorno de cintura y contorno de cadera, en centímetros. Sirve como referencia rápida para elegir un talle de venta al público y como punto de partida para un moldista que necesita una progresión antes de escalar su propio molde.',
        'No reemplaza la tabla de una marca puntual ni la de un colegio o una empresa que pide uniformes con tabla propia: esas se arman con el público real y se validan por separado. Lo que sigue es un ejemplo con números concretos, para mostrar cómo se ve una tabla completa, no una tabla para copiar tal cual.',
      ],
    },
    {
      h2: 'Tabla de referencia para dama, talle S a XL (en centímetros)',
      paragraphs: [
        'Esta tabla usa una progresión de 4 cm por talle en busto, cintura y cadera, un criterio común y razonable en moldería de dama:',
      ],
      bullets: [
        'Talle S: busto 88 cm, cintura 68 cm, cadera 94 cm.',
        'Talle M: busto 92 cm, cintura 72 cm, cadera 98 cm.',
        'Talle L: busto 96 cm, cintura 76 cm, cadera 102 cm.',
        'Talle XL: busto 100 cm, cintura 80 cm, cadera 106 cm.',
      ],
    },
    {
      h2: 'Tabla de referencia para hombre, talle S a XL (en centímetros)',
      paragraphs: [
        'En hombre la progresión suele ser un poco mayor que en dama, porque cada talle apunta a un rango de contextura más amplio; esta tabla usa 5 cm por talle en pecho, cintura y cadera:',
      ],
      bullets: [
        'Talle S: pecho 92 cm, cintura 78 cm, cadera 96 cm.',
        'Talle M: pecho 97 cm, cintura 83 cm, cadera 101 cm.',
        'Talle L: pecho 102 cm, cintura 88 cm, cadera 106 cm.',
        'Talle XL: pecho 107 cm, cintura 93 cm, cadera 111 cm.',
      ],
    },
    {
      h2: 'Tabla de referencia para niños, talle S a XL (en centímetros)',
      paragraphs: [
        'En indumentaria infantil el talle S a XL suele venir acompañado de una edad y una altura aproximada de referencia, porque lo que define el talle real es el cuerpo del chico y no la edad exacta. Esta tabla es un ejemplo con una progresión de 4 cm en pecho y cadera y 3 cm en cintura por talle:',
      ],
      bullets: [
        'Talle S (aprox. 4 a 5 años, 104 a 110 cm de altura): pecho 56 cm, cintura 52 cm, cadera 58 cm.',
        'Talle M (aprox. 6 a 7 años, 116 a 122 cm de altura): pecho 60 cm, cintura 55 cm, cadera 62 cm.',
        'Talle L (aprox. 8 a 9 años, 128 a 134 cm de altura): pecho 64 cm, cintura 58 cm, cadera 66 cm.',
        'Talle XL (aprox. 10 a 11 años, 140 a 146 cm de altura): pecho 68 cm, cintura 61 cm, cadera 70 cm.',
      ],
    },
    {
      h2: 'Por qué esta tabla es un ejemplo y no una norma oficial',
      paragraphs: [
        'Ninguna de estas tres tablas es un estándar único ni obligatorio: es un ejemplo con una progresión típica, armado para mostrar cómo se ve una tabla completa. El cuerpo real varía por población, rango etario y criterio comercial (una M más ajustada o más holgada según la marca), y quien produce trabaja siempre con la tabla propia de su público, no con una tabla genérica bajada de internet.',
        'En Argentina, la Ley 27.521 (2019) creó el SUNITI para avanzar hacia talles más parejos entre marcas, pero todavía no fija una tabla única y obligatoria que reemplace la de cada fabricante. Por eso el paso que no se puede saltear es confeccionar una muestra con los valores elegidos, probarla sobre un cuerpo real o un maniquí, y recién ahí aprobar la tabla para tizar en serie.',
      ],
    },
    {
      h2: 'Cómo usar esta tabla para escalar tu propio molde',
      paragraphs: [
        'Si partís de esta tabla para desarrollar moldería propia, el talle central (M en dama y en hombre) es el punto de partida: se traza el molde base con esas medidas y se escala al resto de la curva aplicando la progresión, punto por punto, a mano con regla y escuadra o cargando las reglas de crecimiento en un programa CAD como Optitex, Audaces o Gerber.',
        'El crecimiento no se reparte igual en todos los puntos del molde: el contorno se mueve más en las costuras laterales y menos en el centro delantero o espalda, y el ancho de espalda o el contorno de manga tienen su propio incremento, más chico que el de busto o pecho. Esta tabla da el punto de partida de tres medidas clave; el resto de las columnas (largo de talle, ancho de espalda, contorno de brazo, entrepierna) se suman según la prenda que se esté desarrollando.',
      ],
    },
    {
      h2: 'La curva completa de talles en un molde digital',
      paragraphs: [
        'Los moldes digitales de Modeltex no vienen con una tabla suelta de cuatro talles: cada molde incluye la curva de talles industrial completa, ya escalada y aprobada con muestra confeccionada, de XS a 4XL en adultos (ocho talles) y de 2 a 18 en niños (nueve talles). La selección estándar del precio base cubre S a 2XL en adultos y 4 a 16 en niños; los talles extra (XS, 3XL y 4XL en adultos; 2 y 18 en niños) se suman con un adicional chico por talle.',
        'Esa curva ya resuelta evita repetir el trabajo de armar una tabla, escalar el molde y confeccionar una muestra en cada modelo nuevo del catálogo propio. Cuando el punto de partida es una tabla distinta, como la de un colegio o una empresa que pide uniformes con tabla propia, el camino es la moldería a pedido: se desarrolla el molde con esa tabla y se aprueba igual con una muestra cosida antes de tizar en serie.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Cómo es una tabla de medidas industriales en centímetros para mujer, hombre y niños del talle S al XL?',
      a: 'Es una tabla que agrupa, talle por talle, el contorno de busto o pecho, cintura y cadera en centímetros: en este ejemplo, 4 cm de crecimiento por talle en dama (S 88/68/94, M 92/72/98, L 96/76/102, XL 100/80/106), 5 cm en hombre (S 92/78/96, M 97/83/101, L 102/88/106, XL 107/93/111) y 4 cm en pecho y cadera con 3 cm en cintura en niños. Es un ejemplo orientativo de la industria, no una norma oficial, y hay que validarlo con una muestra cosida antes de producir en serie.',
    },
    {
      q: '¿Qué progresión de crecimiento por talle usa esta tabla de ejemplo?',
      a: 'Un criterio común es que el contorno crezca parejo entre talles: en esta tabla, 4 cm por talle en dama y 5 cm en hombre, porque el rango de contextura de cada talle masculino suele ser más amplio. En niños la progresión es más chica: alrededor de 4 cm en pecho y cadera y 3 cm en cintura, porque el cuerpo crece distinto en cada etapa.',
    },
    {
      q: '¿Esta tabla de medidas es una norma oficial en Argentina?',
      a: 'No. Es un ejemplo con una progresión típica; en Argentina no existe una tabla única y obligatoria para indumentaria adulta con estos valores exactos. La Ley 27.521 creó el SUNITI para avanzar hacia talles más uniformes entre marcas, pero cada fabricante sigue armando y validando su propia tabla.',
    },
    {
      q: '¿Cómo se arma la tabla de talles para ropa de niños si no se usa S a XL?',
      a: 'Se puede usar la lógica S, M, L, XL asociando cada talle a una edad y altura aproximada, como en el ejemplo de esta guía, o talles numéricos (2, 4, 6, 8 y así hasta 18), como la curva infantil de Modeltex. En los dos casos la edad es solo orientativa: lo que define el talle real es la medida del cuerpo del chico.',
    },
    {
      q: '¿Qué talles de la curva completa vende Modeltex además de S a XL?',
      a: 'Cada molde de Modeltex incluye la curva completa, XS a 4XL en adultos (ocho talles) y 2 a 18 en niños (nueve talles), aprobada con muestra confeccionada. La selección estándar del precio base es S a 2XL en adultos y 4 a 16 en niños; los talles extra se suman con un adicional chico por talle.',
    },
    {
      q: '¿Se puede usar esta tabla tal cual para tizar una producción?',
      a: 'No sin antes validarla: el paso obligatorio antes de tizar en serie es confeccionar una muestra con los valores elegidos, probarla sobre un cuerpo real o un maniquí, y ajustar la tabla si el calce no es el esperado. Saltear ese paso es la causa más común de una producción entera con el talle corrido.',
    },
  ],
  related: [
    { label: 'Tabla de medidas industriales: qué es y cómo armar la tuya', to: '/guias/tabla-de-medidas-industriales' },
    { label: 'Reglas de escalado de sisa y escote', to: '/guias/reglas-de-escalado-de-sisa-y-escote' },
    { label: 'Moldería a pedido con tu tabla de medidas', to: '/diseno-a-pedido' },
    { label: 'Catálogo de moldes con curva de talles completa', to: '/catalogo' },
    { label: 'Preguntas frecuentes sobre talles y formatos', to: '/preguntas-frecuentes' },
  ],
  updated: '2026-09-07',
  keywords: [
    'tabla de medidas industriales en centímetros',
    'tabla de medidas dama hombre niños',
    'tabla de talles S a XL en centímetros',
    'medidas de busto cintura y cadera por talle',
    'tabla de medidas para niños S M L XL',
    'progresión de talles en centímetros',
    'tabla de medidas industriales ejemplo',
  ],
};
