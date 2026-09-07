import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'como-calcular-consumo-de-tela-con-el-rinde',
  title: 'Cómo calcular el consumo de tela para varias prendas con el rinde',
  seoTitle: 'Consumo de tela para varias prendas: la fórmula del rinde',
  description:
    'La fórmula para calcular cuánta tela comprar para un lote de prendas a partir del rinde, con un ejemplo resuelto paso a paso y la merma que hay que sumar.',
  intro:
    'Para saber cuánta tela comprar para un lote de prendas se usa el rinde: metros de tela necesarios es igual a la cantidad de prendas dividida por el rinde (prendas por metro). El rinde es la inversa del consumo unitario: rinde es igual a 1 dividido el consumo en metros de una sola prenda. Al resultado siempre hay que sumarle una merma por fallas, empalmes y puntas de rollo.',
  sections: [
    {
      h2: 'Qué es el rinde y en qué se diferencia del consumo unitario',
      paragraphs: [
        'El rinde de una tela es cuántas prendas salen de un metro, a un ancho, un molde y una tizada determinados. Sirve para saber cuánta tela comprar para un lote de producción, no cuánta tela lleva una prenda suelta.',
        'El consumo unitario (metros por prenda) y el rinde (prendas por metro) son la misma información al revés. Para comprar tela por rollo o por partida, pensar en rinde es más directo: preguntás cuántas prendas da cada metro y multiplicás por el pedido.',
      ],
    },
    {
      h2: 'La fórmula: metros de tela necesarios según el rinde',
      paragraphs: [
        'La fórmula para pasar de una cantidad de prendas a los metros de tela que hacen falta: metros de tela necesarios es igual a la cantidad de prendas dividida por el rinde, en prendas por metro. A más rinde, menos tela hace falta para el mismo pedido; a menos rinde, más.',
        'La fórmula inversa da el rinde a partir del consumo unitario: rinde es igual a 1 dividido el consumo unitario en metros. Y al revés, el consumo unitario es 1 dividido el rinde. Es la misma relación expresada de tres formas, según el dato que tengas a mano.',
      ],
      bullets: [
        'Metros de tela necesarios = cantidad de prendas dividida por el rinde (prendas por metro).',
        'Rinde (prendas por metro) = 1 dividido el consumo unitario en metros por prenda.',
        'Consumo unitario en metros por prenda = 1 dividido el rinde.',
      ],
    },
    {
      h2: 'Ejemplo resuelto paso a paso',
      paragraphs: [
        'Un ejemplo con números redondos, solo para ilustrar la cuenta y no como un dato real de mercado: la tizada del modelo da 24 prendas en 3 metros de tela a un ancho determinado. El rinde de ese modelo, a ese ancho, es 24 dividido 3: 8 prendas por metro.',
        'Para un pedido de producción de 120 prendas del mismo modelo y la misma tela, los metros necesarios son 120 dividido 8: 15 metros. Si el pedido fuera de 300 prendas, serían 300 dividido 8: 37,5 metros.',
        'Ese número todavía no es lo que hay que comprar: falta la merma. Con un 5% de merma de ejemplo, la compra real es 15 por 1,05: 15,75 metros, que se redondea a 16 o a la unidad de venta del proveedor (rollo completo, media pieza, etcétera).',
      ],
      bullets: [
        'Rinde de la tizada: 24 prendas en 3 metros = 8 prendas por metro.',
        'Pedido de producción: 120 prendas.',
        'Metros necesarios: 120 dividido 8 = 15 metros.',
        'Con 5% de merma de ejemplo: 15 por 1,05 = 15,75 metros, se compra 16.',
      ],
    },
    {
      h2: 'De dónde sale un rinde real: de una tizada, no a ojo',
      paragraphs: [
        'El rinde que sirve para comprar tela y costear no es una estimación a ojo ni un número copiado de otro modelo: sale de una tizada real, con las piezas del molde acomodadas sobre el ancho de tela que vas a usar. La cuenta es rinde igual a la cantidad de prendas de la tizada, dividida por el largo de esa tizada en metros.',
        'Con moldes en DXF/AAMA o PDS, la tizada se arma en un CAD textil (Optitex, Audaces, Gerber, Lectra) y el programa devuelve el largo exacto en segundos; con moldes en PDF o cartón se tiza a mano sobre papel a escala real y se mide con cinta métrica. Estimar a ojo, sin tizar, solo sirve para una cotización muy preliminar: en un lote grande, un rinde mal calculado en un 10% significa comprar de más o quedarte sin tela a mitad de corte.',
      ],
    },
    {
      h2: 'Qué hace variar el rinde entre modelos y pedidos',
      paragraphs: [
        'El rinde no es una propiedad fija de una tela: cambia según tres factores que hay que revisar antes de aplicar la fórmula a un pedido nuevo.',
        'Por eso conviene sacar el rinde de una tizada multitalle, armada con la proporción de talles real del pedido, y no de un solo talle central. Si la mezcla de talles cambia mucho de un pedido a otro, conviene retizar.',
      ],
      bullets: [
        'El molde: más piezas, piezas más grandes o con más curvas bajan el rinde porque encastran peor en la tizada.',
        'El ancho de tela: la misma tizada da distinto rinde a 1,50, a 1,60 o a 1,80 m; hay que retizar para cada ancho.',
        'La mezcla de talles del pedido: un rinde sacado en talle M no sirve igual con más 2XL y 3XL, porque las piezas grandes ocupan más superficie.',
      ],
    },
    {
      h2: 'La merma que hay que sumar: fallas, empalmes y puntas',
      paragraphs: [
        'El metraje que da la fórmula del rinde es tela útil, la que se convierte en prendas. A eso hay que sumarle una merma que cubre lo que se pierde en el corte real, en general entre 3 y 8% sobre la tela comprada.',
        'La merma exacta depende de la partida y de cuánto se ajusta la tizada al ancho real; conviene medirla en las primeras tiradas de cada proveedor y ajustar el porcentaje, en vez de aplicar siempre el mismo número sin revisarlo.',
      ],
      bullets: [
        'Fallas de tela: manchas, hilos cortados o defectos de tejeduría que obligan a saltear un tramo del rollo.',
        'Empalmes: donde termina un rollo y empieza el siguiente dentro del mismo encimado.',
        'Puntas y muestras: los extremos del encimado y el metraje usado para probar la tizada antes de la tirada grande.',
      ],
    },
    {
      h2: 'Cómo usar el rinde para comprar tela y armar el costeo',
      paragraphs: [
        'Con el rinde confirmado por tizada, la fórmula sirve para cotizar un pedido nuevo, calcular cuánta tela pedir al proveedor antes de una tirada, y llevar el costo de tela por prenda al costeo (metros necesarios dividido la cantidad de prendas, por el precio del metro). Si el modelo es nuevo y todavía no hay rinde, Modeltex arma la tizada MRK optimizada al ancho de tela del cliente, y de ahí sale el rinde real antes de comprar la tela.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Cómo calcular el consumo de tela para varias prendas según el rinde?',
      a: 'Se divide la cantidad de prendas del pedido por el rinde de la tela, en prendas por metro: metros de tela necesarios es igual a cantidad de prendas dividida por el rinde. Con un rinde de 8 prendas por metro (número de ejemplo), un pedido de 120 prendas necesita 120 dividido 8: 15 metros, antes de sumar la merma.',
    },
    {
      q: '¿Qué es el rinde de una tela?',
      a: 'Es la cantidad de prendas que salen de un metro de tela, a un ancho, un molde y una tizada determinados. Es el consumo unitario mirado al revés, y conviene usarlo cuando el problema es cuánta tela comprar para un lote de producción.',
    },
    {
      q: '¿Cómo se calcula el rinde a partir del consumo unitario de una prenda?',
      a: 'El rinde es igual a 1 dividido el consumo unitario en metros. Si una prenda consume 0,125 metros, el rinde es 1 dividido 0,125: 8 prendas por metro; al revés, con un rinde de 8, el consumo unitario es 1 dividido 8: 0,125 metros.',
    },
    {
      q: '¿De dónde sale el rinde real de un modelo?',
      a: 'Sale de tizar el molde: rinde es igual a la cantidad de prendas de la tizada, dividida por el largo de esa tizada en metros, al ancho de tela que vayas a usar. Estimarlo a ojo solo sirve para una cotización preliminar; en un pedido grande conviene confirmarlo con una tizada real.',
    },
    {
      q: '¿Qué merma hay que sumar al metraje que da la fórmula del rinde?',
      a: 'En general entre 3 y 8% sobre la tela comprada, por fallas del rollo, empalmes entre partidas, puntas del encimado y muestras de la tizada. Se aplica multiplicando el resultado de la fórmula por 1 más ese porcentaje, y conviene ajustarlo con lo que midas en cada proveedor.',
    },
    {
      q: '¿El rinde es el mismo para todos los talles y anchos de tela?',
      a: 'No. El rinde cambia con el ancho de la tela, con el molde y con la mezcla de talles del pedido, porque las piezas más grandes encastran distinto en la tizada. Conviene sacarlo de una tizada multitalle con la proporción real de talles, y retizar cuando cambia el ancho de rollo.',
    },
  ],
  related: [
    { label: 'Cómo calcular el consumo de tela por prenda', to: '/guias/consumo-de-tela-por-prenda' },
    { label: 'Qué es una tizada (MRK) y cómo ahorra tela', to: '/guias/tizada-computarizada-mrk' },
    { label: 'Cómo costear una prenda para producir y vender', to: '/guias/costeo-de-una-prenda' },
    { label: 'Catálogo de moldes con tizada a pedido', to: '/catalogo' },
    { label: 'Moldería a pedido con tu tabla de medidas', to: '/diseno-a-pedido' },
  ],
  updated: '2026-09-07',
  keywords: [
    'consumo de tela para varias prendas',
    'cómo calcular el consumo de tela con el rinde',
    'rinde de tela',
    'fórmula de consumo de tela',
    'cuánta tela comprar para un lote de prendas',
    'rinde de tela por metro',
    'calcular metros de tela para producción',
  ],
};
