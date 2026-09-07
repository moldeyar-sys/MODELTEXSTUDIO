import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'que-es-el-patronaje-industrial',
  title: 'Qué es el patronaje industrial y en qué se diferencia del artesanal',
  seoTitle: 'Qué es el patronaje industrial (vs. moldería artesanal)',
  description:
    'Qué es el patronaje industrial: molde base, escalado de talles, ficha técnica, tizada y muestra, y en qué se diferencia de la moldería artesanal o de hobby.',
  intro:
    'El patronaje industrial es el desarrollo de un molde de ropa pensado para producir muchas prendas iguales de forma repetible: no termina en el trazado del molde base, sino que incluye escalarlo a toda la curva de talles, armar la ficha técnica con las medidas y los materiales, optimizar la tizada para gastar menos tela, y aprobar el modelo con una muestra confeccionada antes de cortar la producción en serie. Se diferencia del patronaje artesanal o de hobby, que resuelve un molde único para una persona o una prenda puntual, sin necesidad de escalar talles ni de pensar en el rendimiento de la tela.',
  sections: [
    {
      h2: 'Patronaje o moldería: el mismo oficio, dos objetivos distintos',
      paragraphs: [
        'En Argentina patronaje y moldería se usan como sinónimos: es el oficio de convertir un diseño en las piezas planas (delantero, espalda, manga, cuello, puño) que después se cortan y se cosen. Las reglas de armado son las mismas se produzca una unidad o mil; lo que cambia entre un patronaje artesanal y uno industrial es el objetivo del molde, no la técnica de base.',
        'Un molde artesanal resuelve una prenda puntual, para un cuerpo o un pedido. Uno industrial resuelve una producción repetible de esa misma prenda en cientos o miles de unidades, siempre igual entre sí y entre talles. Eso obliga a sumar etapas que en un molde de hobby no hacen falta: pensar en varios talles a la vez, dejar por escrito lo que un operario necesita para coser sin depender del diseñador, calcular el consumo de tela antes de cotizar, y confirmar con una muestra que el molde funciona antes de cortar la tirada.',
      ],
    },
    {
      h2: 'Las etapas de un desarrollo de patronaje industrial',
      paragraphs: [
        'Un desarrollo de patronaje industrial completo pasa, en general, por cinco etapas:',
        'Recién con estas cinco etapas cerradas el molde queda listo para producción; antes de eso es un desarrollo en curso, con riesgo de que la tirada completa salga con un error que después hay que corregir prenda por prenda.',
      ],
      bullets: [
        'Trazado del molde base: las piezas del talle base a partir del diseño o de una prenda de referencia, con agregados de costura y marcas de armado.',
        'Escalado a la curva de talles: el molde base se progresa a los demás talles (XS a 4XL en adultos, 2 a 18 en niños) con reglas de crecimiento por punto, no agrandando la pieza de forma proporcional.',
        'Ficha técnica: medidas de cada talle, materiales y avíos (tela, entretela, cierres, botones, elástico) e indicaciones de armado, para que cualquier taller confeccione igual.',
        'Tizada optimizada: acomodo de las piezas y talles sobre el ancho real de la tela, buscando el menor desperdicio posible.',
        'Aprobación con muestra: se confecciona el talle base (y a veces un extremo de la curva) en la tela definitiva, se prueba el calce y se corrige el molde antes de autorizar la producción.',
      ],
    },
    {
      h2: 'La moldería artesanal o de hobby: qué resuelve y dónde queda corta para vender',
      paragraphs: [
        'La moldería artesanal o de hobby resuelve el mismo problema de base, convertir un diseño en piezas de tela, pero para un caso puntual: un vestido de egresada, una prenda a medida, una pieza única. Es una técnica real y útil, con las mismas reglas de trazado que el patronaje industrial: para una sola prenda no hace falta escalar nada ni pensar en el ancho del rollo de tela.',
        'La diferencia aparece cuando el molde tiene que repetirse en serie: uno artesanal no lleva progresión a otros talles ni contempla el rendimiento de tela, porque se corta una unidad a la vez. Usado tal cual para vender, cada talle se desarrolla de cero, no hay ficha técnica que uniforme la confección, y el consumo de tela no está controlado: problemas que se pagan caro apenas la tirada crece.',
      ],
    },
    {
      h2: 'Los roles en una fábrica: moldista, escalador y tizador',
      paragraphs: [
        'En una fábrica o un taller mediano, el patronaje industrial suele repartirse en tres roles, que en talleres chicos puede cubrir una misma persona:',
        'Estos tres roles trabajan en cadena: un error en el molde base se arrastra a toda la curva escalada y complica la tizada. Por eso la muestra se aprueba después del escalado, no solo del molde base: lo que valida es que la cadena completa funcione.',
      ],
      bullets: [
        'Moldista: traza el molde base a partir del diseño, con líneas, pinzas y agregados de costura, y arma la primera muestra.',
        'Escalador o graduador: progresa el molde base a toda la curva de talles según la tabla de medidas de la marca.',
        'Tizador: acomoda las piezas de todos los talles sobre el ancho de la tela y entrega el plano de corte (la tizada) al área de corte.',
      ],
    },
    {
      h2: 'El software CAD hizo la mayor parte de este trabajo',
      paragraphs: [
        'Gran parte de este proceso hoy se hace con programas CAD de patronaje, con Optitex, Audaces, Gerber y Lectra como los más usados. El moldista traza el molde en pantalla, el escalador carga la tabla de medidas y el programa genera la curva completa de forma automática, y el tizador arma la tizada calculando el rendimiento de tela antes de cortar un metro.',
        'El CAD no reemplaza el criterio de quien moldea o escala, pero saca el trabajo repetitivo y reduce errores. Los archivos que produce (DXF/AAMA como estándar universal, PDS en Optitex, ADS en Audaces, MRK para tizadas) se pasan entre fábricas y talleres sin perder la información de escalado ni de tizada.',
      ],
    },
    {
      h2: 'Cómo resolverlo sin armar el proceso completo puertas adentro',
      paragraphs: [
        'Armar este proceso puertas adentro implica formar o contratar moldista, escalador y tizador, o una persona que cubra los tres roles, y sumar el software CAD y las horas de desarrollo hasta aprobar cada modelo. Para una marca chica que recién arranca a producir en serie, eso puede llevar semanas por cada modelo nuevo.',
        'Una alternativa es partir de moldes ya trabajados con este criterio industrial. Modeltex ofrece más de 2.000 moldes de ropa digitales para dama, hombre, niña, niño, bebés y unisex, con la curva de talles completa (XS a 4XL en adultos, 2 a 18 en niños) ya escalada y aprobada con muestra confeccionada, en los formatos de la industria: PDF, plotter, cartón, y DXF/AAMA, PDS, ADS y MRK para CAD. Eso no reemplaza tener moldista propio para diseños exclusivos, pero evita rehacer el desarrollo completo para un modelo que ya existe resuelto; y si el catálogo no alcanza, la moldería a pedido de Modeltex lo desarrolla con la tabla de medidas propia.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Qué es el patronaje industrial?',
      a: 'Es el desarrollo de un molde de ropa pensado para producir muchas prendas iguales de forma repetible: incluye escalar el molde base a toda la curva de talles, armar la ficha técnica con las medidas y los materiales, optimizar la tizada, y aprobar el modelo con una muestra confeccionada antes de la producción en serie. Se diferencia del patronaje artesanal, que resuelve una prenda puntual sin necesidad de escalar ni de optimizar tela.',
    },
    {
      q: '¿Cuál es la diferencia entre patronaje y moldería?',
      a: 'En la práctica, ninguna: en Argentina se usan como sinónimos para nombrar el oficio de convertir un diseño de ropa en las piezas planas que se cortan y se cosen. Lo que sí cambia es el adjetivo que se le agrega: industrial apunta a producción en serie con curva de talles y tizada, mientras que artesanal o de hobby apunta a una prenda única.',
    },
    {
      q: '¿Qué diferencia hay entre un molde artesanal y uno industrial?',
      a: 'El artesanal resuelve una prenda para una persona puntual, sin escalar a otros talles ni pensar en el rendimiento de la tela, porque se corta una unidad a la vez. El industrial suma el escalado a toda la curva de talles, una ficha técnica con medidas y materiales, una tizada pensada para minimizar el desperdicio, y una aprobación con muestra antes de la producción en serie.',
    },
    {
      q: '¿Qué hace un escalador o graduador de moldes?',
      a: 'Progresa el molde base a los demás talles de la curva, por ejemplo XS a 4XL, aplicando reglas de crecimiento en cada punto de la pieza según una tabla de medidas; no agranda el molde de forma proporcional. Hoy este trabajo se hace en gran parte con software CAD, que genera la curva completa a partir de la tabla de medidas cargada.',
    },
    {
      q: '¿Qué programas se usan para patronaje industrial?',
      a: 'Los más usados en fábricas y talleres medianos son Optitex, Audaces, Gerber y Lectra, cada uno con formatos propios (PDS en Optitex, ADS en Audaces) además del estándar universal DXF/AAMA. Cubren el trazado del molde base, el escalado automático a la curva de talles y la tizada, calculando el rendimiento de tela antes de cortar.',
    },
  ],
  related: [
    { label: 'Diferencia entre moldería y patronaje', to: '/guias/diferencia-entre-molderia-y-patronaje' },
    { label: 'Curva de talles para producción', to: '/guias/curva-de-talles-industrial' },
    { label: 'Moldería a pedido con tu tabla de medidas', to: '/diseno-a-pedido' },
    { label: 'Catálogo de moldes', to: '/catalogo' },
    { label: 'Cómo funciona la compra', to: '/como-funciona' },
  ],
  updated: '2026-09-07',
  keywords: [
    'qué es el patronaje industrial',
    'patronaje industrial',
    'diferencia entre moldería y patronaje',
    'moldería industrial vs artesanal',
    'escalado de moldes',
    'ficha técnica de indumentaria',
    'moldista escalador tizador',
    'software de patronaje CAD',
  ],
};
