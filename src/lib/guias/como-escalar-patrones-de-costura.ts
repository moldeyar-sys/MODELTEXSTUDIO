import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'como-escalar-patrones-de-costura',
  title: 'Cómo escalar patrones de costura para producir en serie',
  seoTitle: 'Cómo escalar patrones de costura paso a paso',
  description:
    'Qué es escalar o graduar un patrón, la tabla de incrementos por talle, el método a mano y en CAD, los errores más comunes y cómo verificar el resultado.',
  intro:
    'Escalar (o graduar) un patrón es aplicarle a cada punto del molde base un incremento definido en una tabla, para generar el resto de los talles sin perder la forma ni el equilibrio de la pieza. El contorno de busto o pecho crece más entre talles que el largo, y cada punto tiene su propia distancia de corrimiento. Se hace a mano con regla y escuadra sobre líneas guía, o una sola vez en un programa CAD que después genera toda la curva.',
  sections: [
    {
      h2: 'Qué es escalar o graduar un patrón',
      paragraphs: [
        'Escalar un patrón (grading, en inglés) es generar los talles de arriba y de abajo de la curva a partir de un molde base, moviendo cada punto de la pieza la distancia que indica una tabla de incrementos. No es agrandar el dibujo en la misma proporción: el cuerpo no crece igual en todas las direcciones, y cada punto (sisa, escote, costura lateral) tiene su propio desplazamiento.',
        'El molde base suele ser un talle central, por ejemplo M en dama o 40 en hombre. El objetivo no es solo que la prenda le quede a otro cuerpo, sino mantener el mismo aplomo y el mismo equilibrio entre piezas en todos los talles, y que las piezas que se cosen entre sí sigan encastrando.',
      ],
    },
    {
      h2: 'La tabla de incrementos: cuánto crece cada medida por talle',
      paragraphs: [
        'La tabla de incrementos indica, para cada medida clave de la prenda, cuántos centímetros crece o decrece al pasar de un talle al siguiente. Sale de la tabla de medidas de la marca o del mercado al que apunta el modelo, y cambia según se trate de dama, hombre o niños y según el tipo de prenda.',
        'Como referencia orientativa (varía según cada tabla), el contorno de busto o pecho suele crecer entre 4 y 6 cm por talle, la cintura y la cadera en proporciones parecidas, y el largo total apenas 1 a 2 cm. En los extremos de la curva (3XL, 4XL) el contorno suele crecer más rápido, porque el cuerpo aumenta más en circunferencia que en altura.',
      ],
      bullets: [
        'Contorno de busto/pecho: 4 a 6 cm por talle (orientativo).',
        'Cintura: crecimiento similar, repartido entre delantero y espalda.',
        'Cadera: 4 a 5 cm por talle, un poco más en los extremos.',
        'Largo total: 1 a 2 cm por talle.',
      ],
    },
    {
      h2: 'Método manual: escalar a mano con regla y escuadra',
      paragraphs: [
        'Se hace sobre el molde base de papel o cartón, trazando primero líneas guía horizontales y verticales (línea de busto o de cadera, centro delantero) que sirven de referencia fija para mover cada punto del contorno.',
        'Desde esas líneas se desplaza cada punto la distancia que indica la tabla de incrementos, con regla y escuadra para no perder el ángulo recto, y se unen los nuevos puntos con curva francesa o pistolete. Es preciso si se hace con cuidado, pero repetirlo en ocho o nueve talles por pieza multiplica el trabajo y el riesgo de error.',
      ],
    },
    {
      h2: 'Método en CAD: Optitex, Audaces, Gerber',
      paragraphs: [
        'En un programa de diseño textil el escalado se carga una sola vez por pieza: se asignan las reglas de crecimiento horizontal y vertical a cada punto del contorno, y el sistema genera automáticamente el resto de los talles de la curva.',
        'La ventaja es que mantiene el mismo criterio en todas las piezas del modelo a la vez, permite revisar los talles superpuestos en pantalla y exporta directo en DXF/AAMA, PDS o ADS, el formato que después usa una tizada computarizada. Pero si la tabla de incrementos que se carga está mal pensada, el error se repite igual de rápido en los ocho talles.',
      ],
    },
    {
      h2: 'Errores comunes al escalar a mano',
      paragraphs: [
        'El más frecuente es perder el aplomo: si las líneas guía no quedan bien fijadas antes de mover los puntos, cada talle nuevo se corre un poco respecto del anterior y la pieza pierde la proporción, algo que se nota sobre todo en pinzas, aberturas o bolsillos ubicados con precisión.',
        'El segundo es no mantener el punto de piquete alineado entre talles: la muesca que marca dónde entra una manga en la sisa, o dónde coincide un cuello con el escote, tiene que moverse con la misma regla que el resto del contorno. Si se traza a ojo en cada talle, en algunos la pieza coincide y en otros queda corrida, y eso se descubre recién al coser.',
      ],
    },
    {
      h2: 'Cómo verificar que un escalado quedó bien',
      paragraphs: [
        'Primero, comparar el crecimiento entre talles consecutivos: medir la misma línea (busto, cintura, largo) en cada talle de la curva y chequear que la diferencia con el anterior sea la que indica la tabla de incrementos, ni más ni menos.',
        'Segundo, y tanto o más importante, revisar que las piezas que se cosen entre sí sigan encastrando en todos los talles: la sisa del delantero con la copa de manga, el cuello con el escote, la costura lateral de delantero con la de espalda. La verificación definitiva es confeccionar el talle base y uno de los extremos, probarlos y corregir la tabla si el calce cambió.',
      ],
    },
    {
      h2: 'La alternativa: partir de un molde con la curva ya escalada',
      paragraphs: [
        'Escalar cada modelo, revisarlo talle por talle y confeccionar muestras en los extremos es trabajo real que hay que hacer para lanzar un diseño propio, y vale la pena entenderlo aunque después se delegue. Pero para producir sin desarrollar moldería nueva en cada lanzamiento, ese desarrollo se puede evitar partiendo de un molde que ya tenga la curva resuelta.',
        'Los moldes digitales de Modeltex vienen con la curva de talles completa ya escalada y aprobada con muestra confeccionada (ocho talles en adultos, de XS a 4XL, y nueve en niños, de 2 a 18), en PDF para imprimir o en DXF/AAMA, PDS y ADS para cargar directo en Optitex, Audaces o Gerber. Es la opción para no repetir el escalado y la verificación en cada modelo nuevo que se suma al catálogo propio.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Cómo escalar patrones de costura?',
      a: 'Escalar un patrón es mover cada punto del molde base la distancia que indica una tabla de incrementos, siguiendo líneas guía horizontales y verticales, para generar el resto de los talles sin perder la forma de la pieza. Se hace a mano, con regla y escuadra sobre el molde de papel, punto por punto, o en un programa CAD como Optitex, Audaces o Gerber, que carga la tabla una sola vez y genera toda la curva automáticamente.',
    },
    {
      q: '¿Qué es una tabla de incrementos en moldería?',
      a: 'Es la tabla que indica cuántos centímetros crece o decrece cada medida clave de la prenda (busto o pecho, cintura, cadera, largo) al pasar de un talle al siguiente, repartidos entre las piezas y los puntos del molde. Sale de la tabla de medidas de la marca o del mercado al que apunta el modelo, y es la base del escalado, tanto a mano como en CAD.',
    },
    {
      q: '¿Cuánto crece un molde de un talle al siguiente?',
      a: 'Como referencia orientativa, el contorno de busto o pecho crece entre 4 y 6 cm por talle, la cintura y la cadera en proporciones parecidas, y el largo total apenas 1 a 2 cm, aunque el número exacto depende de la tabla de medidas de cada marca. En los extremos de la curva (3XL, 4XL) el contorno suele crecer más rápido, porque el cuerpo aumenta más en circunferencia que en altura.',
    },
    {
      q: '¿Se puede escalar un patrón agrandándolo con una fotocopiadora o una imagen?',
      a: 'No de forma confiable. Ese método agranda todo el dibujo en la misma proporción, y el cuerpo no crece así: el contorno crece bastante más que el largo. Una prenda escalada por porcentaje suele quedar larga y con la sisa o el escote deformados; lo prolijo es aplicar la tabla de incrementos punto por punto, a mano o en un programa CAD.',
    },
    {
      q: '¿Qué diferencia hay entre escalar un patrón a mano y en un programa CAD?',
      a: 'A mano se repite punto por punto y talle por talle sobre el molde de papel o cartón, con regla y escuadra: preciso, pero lento y con más riesgo de error a medida que crece la cantidad de talles. En un programa CAD como Optitex, Audaces o Gerber la tabla de incrementos se carga una sola vez por pieza y el sistema genera toda la curva, lista para exportar en DXF/AAMA.',
    },
    {
      q: '¿Qué es el punto de piquete y por qué hay que cuidarlo al escalar?',
      a: 'Es la muesca que marca dónde tienen que coincidir dos piezas al coser, por ejemplo dónde entra la manga en la sisa o dónde se une el cuello al escote. Al escalar, ese punto tiene que moverse con la misma regla que el resto del contorno; si se ubica a ojo en cada talle, el desajuste recién se nota en la línea de confección.',
    },
  ],
  related: [
    { label: 'Curva de talles para producción', to: '/guias/curva-de-talles-industrial' },
    { label: 'Qué es el patronaje industrial', to: '/guias/que-es-el-patronaje-industrial' },
    { label: 'Cómo hacer el molde base de una falda', to: '/guias/como-hacer-el-molde-base-de-una-falda' },
    { label: 'Catálogo de moldes con curva de talles', to: '/catalogo' },
    { label: 'Moldería a pedido con tu tabla de medidas', to: '/diseno-a-pedido' },
  ],
  updated: '2026-09-08',
  keywords: [
    'cómo escalar patrones de costura',
    'escalar patrones',
    'graduar patrones de costura',
    'tabla de incrementos de talles',
    'escalado de moldes a mano',
    'grading en Optitex',
    'cómo graduar un molde',
    'reglas de escalado de talles',
  ],
};
