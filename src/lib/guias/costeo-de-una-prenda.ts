import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'costeo-de-una-prenda',
  title: 'Cómo costear una prenda para producir y vender',
  seoTitle: 'Costeo de una prenda: costos, margen y precio de venta',
  description:
    'Qué entra en el costo de una prenda: tela con merma, avíos, corte, facón, terminación, estampa, packaging y molde amortizado, con ejemplo y precio mayorista.',
  intro:
    'El costo de una prenda es la suma de la tela (consumo más merma), los avíos, el corte, la confección o facón, la terminación, la estampa, el packaging y una parte proporcional del molde, las muestras, la logística y la estructura. Sobre ese total se aplica el margen: en el mercado argentino el precio mayorista suele ubicarse entre 1,6 y 2,2 veces el costo y el minorista entre 2 y 2,5 veces el mayorista, valores orientativos que cada canal ajusta. Costear bien es costear la curva completa y a precio de reposición.',
  sections: [
    {
      h2: 'Qué entra en el costo de una prenda',
      paragraphs: [
        'Conviene separar el costo en tres bloques: materiales directos, procesos directos y costos indirectos asignados. Los dos primeros se calculan por prenda con datos concretos; el tercero se reparte entre las prendas que producís en el período. Si te salteás un bloque, el margen que creés tener no existe.',
        'La etiqueta de composición, talle, origen y cuidados es obligatoria en indumentaria en Argentina: es un avío que se compra por millar y se carga al costo igual que la etiqueta de marca.',
      ],
      bullets: [
        'Materiales directos: tela principal, telas secundarias (rib, forro, entretela), hilo, etiquetas, cierres, botones, elásticos, cordones, ojalillos, colgantes y packaging.',
        'Procesos directos: corte, confección (facón si es taller externo), terminación (limpieza de hilos, ojal y botón, planchado, doblado, embolsado), estampa, bordado o sublimación, lavado industrial en jean y control de calidad.',
        'Indirectos asignados: molde amortizado, muestras y desarrollo, fletes, alquiler, servicios, sueldos de estructura, comisiones de venta y de cobro, e impuestos según tu encuadre fiscal.',
      ],
    },
    {
      h2: 'Tela: consumo, precio de reposición y merma',
      paragraphs: [
        'El renglón de tela es consumo por prenda por precio unitario por (1 más la merma). El consumo sale de la tizada (largo dividido prendas) o de una estimación por área; la merma cubre fallas del rollo, empalmes, puntas del encimado y muestras, y en general se toma entre 3 y 8%. Si la tela se compra por kilo (jersey, frisa, piqué, modal, lycra), convertí el consumo con el gramaje real de la partida.',
        'Costeá con el consumo promedio de la curva, no con el del talle M: un 4XL lleva bastante más tela que un XS y, si vendés toda la curva al mismo precio, el promedio es el único número que cierra. Y usá el precio de reposición, lo que te costaría comprar la tela hoy: costear con la factura vieja es vender por debajo del costo sin darte cuenta.',
      ],
    },
    {
      h2: 'Corte, confección y terminación',
      paragraphs: [
        'Si tercerizás, el corte se cobra por prenda o por tizada y el facón de confección por prenda, según la cantidad de operaciones y el volumen. Pedí siempre qué incluye: muchos talleres cotizan la costura sola y la terminación (limpieza, ojal y botón, planchado, embolsado) va aparte. Sumá el flete de ida y vuelta al taller, el control de calidad a la entrada y la segunda selección: si de cada 100 prendas 2 salen con fallas que solo se venden a saldo, ese 2% se carga a las 98 buenas.',
        'Si tenés taller propio, el costo de confección sale del costo minuto: sueldos con cargas más gastos del taller del mes, dividido por los minutos productivos reales del mes (no los teóricos), multiplicado por los minutos que lleva la prenda. Como referencia orientativa para un taller promedio, una remera básica lleva entre 8 y 12 minutos de confección, una chomba entre 15 y 20, un buzo con capucha entre 20 y 30, una camisa entre 25 y 35 y un pantalón con bolsillos y cierre entre 25 y 40; una línea industrial afinada baja esos números.',
      ],
    },
    {
      h2: 'Estampa, packaging, molde amortizado y logística',
      paragraphs: [
        'Estampa, bordado y sublimación se cotizan por prenda y por cantidad de colores o puntadas, casi siempre con un mínimo por diseño y una matriz o film que se prorratea en la tirada: la misma matriz pesa diez veces más por prenda en 100 prendas que en 1.000. El packaging (bolsa, percha, caja, colgante) parece menor, pero en prendas económicas puede ser varios puntos del costo. Los fletes (traer tela, llevar y traer del corte, la confección y el estampado) también se prorratean: en tiradas chicas pesan mucho, y por eso la primera tirada de un modelo siempre cuesta más que la tercera.',
        'El molde se amortiza: costo del molde dividido por las prendas que planeás producir con él. Un molde digital con la curva completa de talles (en Modeltex, PDF A4 desde $30.000 y plotter desde $50.000) repartido en 300 prendas son entre $100 y $170 por prenda, y baja a casi nada con cada tirada que repetís. Las muestras y la moldería a pedido se tratan igual: inversión que se reparte, no gasto de una sola prenda.',
      ],
    },
    {
      h2: 'Ejemplo numérico orientativo: un buzo de frisa',
      paragraphs: [
        'Los valores son inventados para mostrar la mecánica, no precios de mercado; reemplazalos por tus cotizaciones del día. Buzo con capucha de adulto, tirada de 300 unidades, tela comprada por kilo.',
        'Dos cosas para mirar. La tela y el facón son alrededor de tres cuartos del costo directo: ahí es donde una tizada mejor o una negociación con el taller mueven el resultado. Y la diferencia entre mayorista y minorista no es ganancia pura: de ahí salen comisiones de cobro y de plataforma, envíos, fotos, publicidad, cambios y devoluciones.',
      ],
      bullets: [
        'Frisa: 0,65 kg por prenda por $9.000 el kilo por 1,05 de merma: $6.140.',
        'Rib para puños y cintura: 0,08 kg por $9.500: $760.',
        'Avíos (cordón, ojalillos, hilo, etiquetas de marca y de composición): $900.',
        'Corte: $500. Facón de confección: $3.500. Terminación y embolsado: $400.',
        'Estampa serigráfica de un color, con matriz prorrateada: $1.200.',
        'Packaging (bolsa): $150. Molde amortizado ($30.000 en 300 prendas): $100. Fletes prorrateados: $300.',
        'Costo directo: $13.950. Más 2% de segunda selección: $14.230. Más 15% de estructura asignada: costo total $16.360.',
        'Precio mayorista a 1,8 veces el costo total: $29.450. Precio minorista a 2 veces el mayorista: $58.900.',
      ],
    },
    {
      h2: 'Margen, precio mayorista y precio minorista',
      paragraphs: [
        'No confundas markup con margen. Markup es cuánto le sumás al costo (costo por 1,8 es un markup de 80%); margen es qué parte del precio es ganancia (ese mismo precio deja un margen de 44%). Si un cliente mayorista pide 10% de descuento, ese 10% sale del margen, y en volumen puede comerse la ganancia entera.',
        'Como referencia orientativa del mercado argentino, el mayorista se ubica entre 1,6 y 2,2 veces el costo total y el minorista entre 2 y 2,5 veces el mayorista. La venta mayorista por curva paga menos por prenda pero mueve volumen y cobra en pocas operaciones; la minorista por Instagram, tienda online o local paga más por prenda pero carga comisiones, envíos, cambios y atención uno por uno. Si tu costo por 1,8 queda arriba de lo que el canal paga por esa prenda, el problema no es el margen sino el costo: volvé a la tela, al consumo, a la cantidad de operaciones o al volumen de la tirada. En uniformes, donde se cotiza a un colegio o empresa por tanda, esta cuenta se hace antes de firmar.',
      ],
    },
    {
      h2: 'Errores frecuentes al costear',
      paragraphs: [
        'La mayoría de los costeos que fallan no fallan por la cuenta sino por lo que dejan afuera:',
        'La moldería digital saca del costeo dos incógnitas: el consumo, porque el molde con la curva completa se tiza al ancho real antes de comprar tela, y el molde mismo, que se compra una vez y se amortiza en todas las tiradas. Modeltex publica más de 2.000 moldes aprobados con muestra confeccionada, con la curva completa incluida, y arma tizadas MRK al ancho de tu tela para que el renglón de tela sea un número medido y no una suposición.',
      ],
      bullets: [
        'Costear el talle M y vender de XS a 4XL: usá el consumo promedio de la curva.',
        'Olvidar merma, segunda selección y fletes: entre 5 y 15% del costo que desaparece.',
        'No cobrar tu propio trabajo cuando cortás o cosés vos: cargalo al costo minuto como a un empleado.',
        'Costear con el precio de la tela ya comprada en vez del precio de reposición.',
        'No revisar el costeo en cada partida: cambia la tela, cambia el facón, cambia el costeo.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Qué incluye el costo de una prenda?',
      a: 'Materiales directos (tela con merma, rib o forro, hilo, etiquetas, cierres, botones, elásticos, packaging), procesos directos (corte, confección o facón, terminación, estampa o bordado, control de calidad) y una parte de los indirectos: molde amortizado, muestras, fletes, alquiler, sueldos de estructura, comisiones e impuestos. Sobre ese total se aplica el margen.',
    },
    {
      q: '¿Cómo se calcula el precio mayorista de una prenda?',
      a: 'Se parte del costo total por prenda (directos más indirectos asignados) y se multiplica por un factor que en el mercado argentino suele ir de 1,6 a 2,2, como referencia orientativa que depende de la prenda, el volumen y la competencia. Se ofrece por curva de talles o por cantidad mínima y tiene que dejar lugar para descuentos por volumen sin caer por debajo del costo.',
    },
    {
      q: '¿Cuál es la diferencia entre precio mayorista y minorista?',
      a: 'El minorista suele ubicarse entre 2 y 2,5 veces el mayorista, de forma orientativa. Esa diferencia cubre comisiones de cobro y de plataforma, envíos, cambios y devoluciones, fotos, publicidad y el tiempo de vender una prenda por vez. El mayorista gana menos por unidad pero vende en volumen y cobra en pocas operaciones.',
    },
    {
      q: '¿Qué es el facón en confección?',
      a: 'Es el precio que cobra un taller externo por confeccionar cada prenda, en general por unidad y según la cantidad de operaciones y el volumen. Muchos facones cubren solo la costura: la terminación (limpieza de hilos, ojal y botón, planchado, embolsado) y el corte se cotizan aparte. Al facón se le suman el flete al taller y el control de calidad.',
    },
    {
      q: '¿Cómo se amortiza el molde en el costo de una prenda?',
      a: 'Se divide el costo del molde por la cantidad de prendas que planeás producir con él. Un molde digital con toda la curva de talles que cuesta $30.000, en una tirada de 300 prendas, carga $100 por prenda; en la segunda tirada del mismo modelo ya casi no pesa. Las muestras y la moldería a pedido se reparten de la misma forma.',
    },
    {
      q: '¿Qué merma hay que incluir en el costeo de una prenda?',
      a: 'Dos: la merma de tela, que en general se toma entre 3 y 8% por fallas, empalmes, puntas y muestras, y la segunda selección, las prendas terminadas con fallas que se venden a saldo, en general entre 1 y 3%, que se carga a las prendas buenas. Las dos se suman al costo antes de aplicar el margen.',
    },
  ],
  related: [
    { label: 'Consumo de tela por prenda', to: '/guias/consumo-de-tela-por-prenda' },
    { label: 'Cómo armar una colección con moldes digitales', to: '/guias/armar-una-coleccion-con-moldes-digitales' },
    { label: 'Moldes para emprendedores', to: '/moldes-para-emprendedores' },
    { label: 'Catálogo de moldes', to: '/catalogo' },
    { label: 'Moldería a pedido', to: '/diseno-a-pedido' },
  ],
  updated: '2026-09-06',
  keywords: [
    'costeo de prendas',
    'cómo costear una prenda',
    'costo de producción de ropa',
    'precio mayorista ropa',
    'facón confección',
    'margen de ganancia ropa',
    'estructura de costos textil',
    'cuánto cobrar por una prenda',
  ],
};
