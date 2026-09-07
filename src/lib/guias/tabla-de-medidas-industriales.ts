import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'tabla-de-medidas-industriales',
  title: 'Tabla de medidas industriales: qué es y cómo armar la tuya',
  seoTitle: 'Tabla de medidas industriales: qué es y cómo armarla',
  description:
    'Qué es una tabla de medidas industriales, por qué no hay una única oficial en Argentina y qué columnas necesita la tuya para escalar moldes en serie.',
  intro:
    'Una tabla de medidas industriales es la planilla que usa una fábrica para escalar un molde base a toda la curva de talles: por cada talle registra el contorno de busto o pecho, cintura, cadera, largo de talle, ancho de espalda y contorno de brazo, con los valores que el moldista usa para generar los talles chicos y grandes. En Argentina no existe una tabla única y obligatoria para indumentaria adulta: cada fabricante arma la suya, calibrada con su moldista y probada con muestra, aunque la Ley 27.521 y el SUNITI buscan talles más parejos entre marcas.',
  sections: [
    {
      h2: 'Qué es una tabla de medidas industriales y para qué sirve',
      paragraphs: [
        'No es lo mismo tomarle las medidas a una persona puntual que armar una tabla de medidas industriales. La tabla es una herramienta técnica: fija, talle por talle, los contornos y largos de la prenda terminada, y sirve de base para desarrollar el molde del talle base y progresarlo (escalarlo) al resto de la curva con reglas coherentes.',
        'También es un documento de referencia común entre el moldista, quien tiza y control de calidad, y en uniformes o moldería a pedido se comparte con el cliente (un colegio, una empresa) para elegir talle sin probarse antes de recibir el pedido. Es distinta de la guía de talles simplificada que publica una marca para el consumidor, con dos o tres medidas; la industrial tiene más columnas porque de ella depende cómo se corta la tela.',
      ],
    },
    {
      h2: 'Por qué en Argentina no hay una tabla oficial única para indumentaria adulta',
      paragraphs: [
        'La Ley 27.521, sancionada en 2019, creó el Sistema Único Normalizado de Identificación de Talles de Indumentaria (SUNITI), con el objetivo de unificar cómo se nombran los talles entre marcas a partir de un estudio antropométrico de la población argentina. Es un paso real hacia una referencia común, pero en la práctica no reemplaza la tabla propia de cada fábrica: no hay un documento oficial con contornos y largos exactos, obligatorio y uniforme, que toda marca tenga que copiar talle por talle.',
        'Por eso cada fabricante arma y calibra su propia tabla con su moldista, y la ajusta con pruebas de calce sobre su público real: el cuerpo real varía por edad, zona y segmento, y el criterio comercial también, porque una marca decide de antemano si su M queda más ajustado o más holgado que el de otra. No existe entonces una tabla para bajar de internet y aplicar tal cual: sirve como punto de partida, pero los valores concretos hay que validarlos con tu moldista y una muestra cosida.',
      ],
    },
    {
      h2: 'Estructura de una tabla de medidas para adultos (dama y hombre)',
      paragraphs: [
        'Para armar tu propia tabla, el primer paso es definir las columnas antes que los números. Esta es una estructura orientativa y realista, usada en la industria, para que la adaptes con tus propias medidas validadas, no una tabla oficial con valores fijos:',
      ],
      bullets: [
        'Talle: la denominación que vas a usar (S, M, L... o numérica: 38, 40, 42...).',
        'Contorno de busto o pecho: medido en el punto más ancho del busto en dama o del pecho en hombre.',
        'Contorno de cintura: en el punto más angosto del torso.',
        'Contorno de cadera: en el punto más ancho de la cadera.',
        'Largo de talle: del hombro o de la nuca hasta la cintura, delantero y espalda.',
        'Ancho de espalda: de sisa a sisa, a la altura que defina tu moldista.',
        'Contorno de brazo (bíceps): en el punto más ancho del brazo, clave para la sisa y la manga.',
      ],
    },
    {
      h2: 'Estructura de una tabla de medidas para niños',
      paragraphs: [
        'En niños el talle suele asociarse a una edad o altura de referencia, aunque lo que realmente lo define es la medida del cuerpo, no la edad exacta del chico. Una estructura de columnas orientativa para niños es:',
      ],
      bullets: [
        'Edad de referencia y altura aproximada asociada a ese talle (por ejemplo, talle 8, talle 10).',
        'Contorno de pecho.',
        'Contorno de cintura.',
        'Contorno de cadera.',
      ],
    },
    {
      h2: 'Cómo se arma, se valida y se usa para escalar el molde',
      paragraphs: [
        'Armar la tabla no termina en definir columnas: hay que llenarlas con números que funcionen para tu público, partiendo de un talle base con medidas reales y definiendo incrementos por talle para cada columna (cuánto crece el busto, el largo, el ancho de espalda), no necesariamente iguales entre columnas ni lineales en toda la curva. Esos incrementos son la regla de progresión: escalar no es agrandar parejo como en una fotocopiadora, sino mover cada punto la distancia que marca la tabla para ese talle.',
        'El paso obligatorio antes de tizar en serie es la muestra: confeccionar el talle base y al menos un extremo, probarlo sobre un cuerpo real o un maniquí, y corregir la tabla si el calce no es el esperado, porque si el talle base o la progresión están mal, el error se repite en toda la curva. En CAD (Optitex, Audaces, Gerber, Lectra) las reglas se cargan por punto y el programa genera la curva completa; a mano se hace punto por punto con la misma lógica.',
      ],
    },
    {
      h2: 'La alternativa: partir de un molde con la curva ya hecha',
      paragraphs: [
        'Armar una tabla propia, definir la progresión y validarla con muestra es un trabajo real, que lleva tiempo y algún costo de prueba y error. Los moldes digitales de Modeltex ya vienen con esa parte resuelta: cada molde incluye la tabla de medidas y la progresión de talles hecha (XS a 4XL en adultos, 2 a 18 en niños) y aprobada con muestra confeccionada, en PDF A4, PDF plotter, cartón o en formatos CAD como DXF/AAMA, PDS y ADS.',
        'Si tu marca ya tiene su propia tabla, por ejemplo para uniformes con la medida que te pasó el colegio o la empresa, el camino es la moldería a pedido: se desarrolla el molde con tu tabla y tu curva, y se aprueba igual con muestra antes de tizar en serie.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Tabla de medidas industriales para imprimir',
      a: 'No existe una tabla industrial oficial y única para imprimir y aplicar tal cual: cada fabricante arma y calibra la suya según su público y su criterio comercial. Podés armar e imprimir una plantilla propia con las columnas estándar (talle, contorno de busto o pecho, cintura, cadera, largo de talle, ancho de espalda, contorno de brazo) y completarla con medidas validadas con muestra. Los moldes de Modeltex, como alternativa, ya incluyen esa tabla y la progresión hechas.',
    },
    {
      q: '¿Qué es una tabla de medidas industriales?',
      a: 'Es la planilla que indica, talle por talle, los contornos y largos que usa una fábrica para desarrollar el talle base y escalarlo (progresarlo) al resto de la curva. La usan el moldista para generar los talles, quien tiza para controlar cada pieza cortada y, en uniformes, el cliente para elegir talle sin probarse antes de recibir el pedido.',
    },
    {
      q: '¿Existe una tabla de talles oficial en Argentina?',
      a: 'No una con medidas exactas y obligatorias para indumentaria adulta. La Ley 27.521 de 2019 creó el SUNITI para avanzar hacia talles más uniformes entre marcas a partir de un estudio antropométrico, pero en la práctica cada fabricante sigue armando y validando su tabla con su moldista y pruebas de calce sobre su público real.',
    },
    {
      q: '¿Qué medidas tiene que tener una tabla de talles para ropa de dama u hombre?',
      a: 'Como mínimo talle, contorno de busto o pecho, contorno de cintura, contorno de cadera, largo de talle, ancho de espalda y contorno de brazo. Son las columnas que usa un moldista para desarrollar el talle base y progresar la curva completa; los valores de cada columna varían según la marca y hay que validarlos con una muestra.',
    },
    {
      q: '¿Cómo se arma la tabla de medidas para ropa de niños?',
      a: 'Se arma asociando cada talle a una edad y una altura aproximada de referencia, y sumando contorno de pecho, cintura y cadera. La edad es solo orientativa: lo que determina el talle real es la medida del cuerpo, por eso conviene validar la tabla con una muestra antes de tizar toda la curva.',
    },
    {
      q: '¿Cómo se usa la tabla de medidas para escalar un molde?',
      a: 'La tabla define, para cada columna y cada talle, cuánto tiene que moverse un punto del molde respecto del talle base: eso es la progresión, no un escalado proporcional parejo, porque el contorno, el largo y la sisa crecen distinto entre talles. En CAD esas reglas se cargan por punto y el programa genera la curva completa a partir de la tabla.',
    },
  ],
  related: [
    { label: 'Curva de talles industrial: cómo se arma', to: '/guias/curva-de-talles-industrial' },
    { label: 'Cómo tomar medidas corporales para moldes', to: '/guias/medidas-corporales-para-moldes-de-ropa' },
    { label: 'Cómo escalar patrones de costura', to: '/guias/como-escalar-patrones-de-costura' },
    { label: 'Moldería a pedido con tu tabla de medidas', to: '/diseno-a-pedido' },
    { label: 'Catálogo de moldes con curva de talles', to: '/catalogo' },
  ],
  updated: '2026-09-08',
  keywords: [
    'tabla de medidas industriales',
    'tabla de medidas industriales para imprimir',
    'tabla de talles para fabricar ropa',
    'como armar tabla de medidas',
    'ley 27521 talles',
    'SUNITI talles',
    'progresión de talles',
    'curva de talles industrial',
  ],
};
