import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'tizada-computarizada-mrk',
  title: 'Qué es una tizada (marker) y cómo ahorra tela en el corte',
  seoTitle: 'Tizada computarizada MRK: qué es y cuánta tela ahorra',
  description:
    'Qué es una tizada o marker, cómo se mide su eficiencia, qué pasa con el ancho de tela, el hilo y las telas con pelo, y qué datos mandar para pedir una MRK.',
  intro:
    'Una tizada (marker) es el acomodo de todas las piezas de los moldes de una tirada sobre el ancho real de la tela, listo para encimar y cortar varias capas de una vez. Se mide por su eficiencia, el porcentaje del rectángulo de tela que ocupan las piezas, que en producción suele estar entre 70 y 90% según la prenda. Hecha en computadora ahorra en general entre 5 y 10% de tela frente al acomodo a mano y da el consumo exacto por prenda antes de comprar el rollo.',
  sections: [
    {
      h2: 'Qué es una tizada y qué mide',
      paragraphs: [
        'La tizada es un plano a escala real: un rectángulo del ancho útil de la tela y del largo necesario, con todas las piezas de los moldes ubicadas adentro respetando el sentido de hilo. Sobre ese plano se corta el encimado, por eso la tizada define cuánta tela consume cada prenda y cuántas prendas salen por corte.',
        'Tres números la describen: el largo (por ejemplo 7,40 m), la cantidad de prendas que contiene (una curva S, M, L, XL con dos M y dos L son seis prendas) y la eficiencia, el área de las piezas dividida por el área del rectángulo. De ahí sale el consumo: 7,40 m dividido 6 son 1,23 m por prenda a ese ancho. En un CAD textil (Optitex, Audaces, Gerber AccuMark, Lectra) el programa calcula todo al instante y guarda el archivo; en Optitex es el formato MRK, que se imprime en plotter para poner sobre el encimado o se manda a la cortadora automática.',
      ],
    },
    {
      h2: 'Encimado: cómo se corta con una tizada',
      paragraphs: [
        'Encimar es extender la tela en capas del largo de la tizada sobre la mesa de corte, sin tensión, y cortar todo el paquete de una vez con cortadora vertical, circular o automática, con el papel de la tizada arriba. La cuenta de producción es prendas por tizada por cantidad de capas: una tizada de seis prendas con 40 capas rinde 240 prendas. La altura del encimado depende de la tela y del largo de cuchilla; en jersey entran muchas más capas que en frisa o denim.',
        'Con tejidos de punto conviene dejar reposar la tela extendida antes de cortar (relajación), porque sale del rollo estirada y si cortás enseguida las piezas después se achican. Ese reposo, de algunas horas a un día según la tela, es parte del encimado y afecta el consumo real.',
      ],
    },
    {
      h2: 'Eficiencia: rangos orientativos y qué la baja',
      paragraphs: [
        'La eficiencia depende sobre todo de la forma de las piezas: las grandes y rectas (pantalones, joggers, remeras) encajan mejor que las curvas y con vuelo (faldas evasé, vestidos, mangas ranglan). Estos rangos son orientativos para estimar antes de tizar; el valor real lo da tu propia tizada.',
        'Dos puntos más de eficiencia parecen poco, pero en una tirada de 2.000 buzos de frisa son decenas de kilos de tela. Mezclar talles en la misma tizada (un XS al lado de un XL, mangas chicas entre pantalones grandes) sube la eficiencia varios puntos y además corta la curva en la proporción en que la vendés: lo habitual es tizar la curva de venta, por ejemplo 1 S, 2 M, 2 L, 1 XL, y repetirla hasta cubrir la tirada. Las tizadas largas rinden mejor que las cortas, hasta el largo de la mesa de corte (en talleres, en general de 4 a 12 m).',
      ],
      bullets: [
        'Pantalón, jean y jogger: en general 85 a 92%; piezas largas, casi rectangulares, que se anidan invertidas.',
        'Remera, chomba y buzo en tejido de punto: en general 78 a 88%, según cuántos talles se mezclen.',
        'Camisa y blusa: en general 78 a 85%; cuello, puños y vistas rellenan los huecos.',
        'Vestidos, faldas con vuelo y piezas al bies: en general 60 a 75%.',
        'Telas con pelo, dirección o rapport a casar: restá entre 3 y 10 puntos a la misma prenda en tela lisa.',
      ],
    },
    {
      h2: 'Ancho de tela y ancho útil',
      paragraphs: [
        'La tizada se arma para un ancho concreto y no sirve para otro. El dato que importa es el ancho útil: el ancho del rollo menos los orillos (en tejido plano se descuentan en general 2 a 4 cm en total) y, en punto abierto, los bordes enrollados o marcados. Medí el rollo real: el ancho de la factura del proveedor puede variar unos centímetros de partida en partida.',
        'En el mercado argentino los anchos habituales van de 90 cm tubulares (jersey, frisa, morley, que doblados equivalen a 180 cm abiertos) a 140 a 160 cm en telas planas como gabardina, denim, popelina, lino o fibrana, y 150 a 180 cm en punto abierto, microfibra, suplex o polar. Con tela tubular se tiza a lo doble, con las piezas simétricas al doblez, o se abre y se tiza al ancho completo. Si la tela encoge (un jersey de algodón puede perder entre 3 y 8% en largo al lavarse), la tizada se hace con el molde ya corregido y con el ancho que queda después de encoger.',
      ],
    },
    {
      h2: 'Sentido de hilo, telas con pelo y rapport',
      paragraphs: [
        'Cada pieza lleva el sentido de hilo marcado y en la tizada va paralelo al orillo. En telas lisas sin dirección el programa gira piezas 180 grados para encajarlas invertidas, que es lo que más eficiencia da; una inclinación de 1 a 3 grados se admite a veces en pantalones de tela lisa, nunca en rayas ni cuadros.',
        'Las telas con pelo (pana, corderoy, polar, terciopelo), con brillo direccional (satén) o con estampas con sentido obligan a poner todas las piezas hacia el mismo lado: la tizada unidireccional siempre consume más. Con rayas, cuadros o rapport que se casan en las costuras, las piezas quedan alineadas al dibujo y la eficiencia baja; a veces conviene cortarlas en una tizada aparte. El tizador tiene que saber todo esto antes de empezar.',
      ],
    },
    {
      h2: 'Cómo pedir una tizada MRK: qué datos mandar',
      paragraphs: [
        'Para que una tizada computarizada sirva tiene que estar hecha a tu tela y a tu tirada. Estos son los datos que necesita quien la arma:',
        'Modeltex arma tizadas en MRK a partir de sus moldes, con la curva completa ya escalada y optimizadas al ancho de tela que indiques; se cotizan a pedido, por WhatsApp o desde la ficha del molde. Si tenés CAD propio, con el molde en DXF/AAMA o PDS armás la tizada vos mismo y la ajustás cada vez que cambia el ancho del rollo.',
      ],
      bullets: [
        'Ancho útil de la tela medido en el rollo, y si es tubular o abierta.',
        'Talles y cantidad de prendas por talle que va a contener la tizada (la curva).',
        'Si la tela tiene pelo, brillo, estampa con dirección o rayas y cuadros a casar.',
        'Encogimiento previsto en largo y ancho, si ya lo mediste con una muestra lavada.',
        'Largo máximo de tu mesa de corte y con cuántas capas pensás encimar.',
        'Qué piezas van en cada tela (principal, rib, forro, entretela): cada tela lleva su propia tizada.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Qué es una tizada o marker en confección?',
      a: 'Es el plano a escala real donde se acomodan todas las piezas de los moldes de una tirada sobre el ancho de la tela, respetando el sentido de hilo, para cortar el encimado de varias capas de una vez. Define cuánta tela consume cada prenda y cuántas prendas salen por corte. En Optitex el archivo se guarda como MRK.',
    },
    {
      q: '¿Qué eficiencia de tizada es buena?',
      a: 'Depende de la prenda: en pantalones y joggers es habitual superar el 85%, en remeras y buzos rondar el 80 a 88% y en vestidos o faldas con vuelo quedar entre 60 y 75%, siempre como valores orientativos. Lo útil es comparar tizadas de la misma prenda y quedarse con la mejor. Las telas con pelo, dirección o rapport bajan la eficiencia varios puntos.',
    },
    {
      q: '¿Cuánta tela ahorra una tizada computarizada respecto de tizar a mano?',
      a: 'En general entre 5 y 10% de tela, y más si el acomodo manual era descuidado, porque el programa prueba muchísimas combinaciones y la tizada se repite exactamente igual en cada corte. En tiradas grandes ese porcentaje son kilos enteros por partida, y además da el consumo exacto por prenda antes de comprar tela.',
    },
    {
      q: '¿Puedo usar la misma tizada con una tela de otro ancho?',
      a: 'No. La tizada se arma para un ancho útil concreto: con un rollo más angosto las piezas del borde quedan afuera y con uno más ancho se desperdicia una franja. Cuando cambia el ancho hay que retizar, que en CAD lleva minutos. Por eso el ancho útil medido en el rollo es el primer dato que se pide.',
    },
    {
      q: '¿Qué pasa con las telas con pelo o estampas con dirección en la tizada?',
      a: 'Todas las piezas tienen que ir orientadas hacia el mismo lado (tizada unidireccional), porque el pelo o el dibujo se ven distintos según el sentido. Eso baja la eficiencia entre 3 y 10 puntos y sube el consumo. Hay que avisarlo antes de armar la tizada, igual que las rayas o cuadros que se casan en las costuras.',
    },
    {
      q: '¿Cómo pido una tizada MRK con los moldes de Modeltex?',
      a: 'Indicás el molde, el ancho útil de tu tela medido en el rollo, si es tubular o abierta, los talles y cantidades por talle, si la tela tiene pelo o dirección y el largo de tu mesa de corte. Con eso se arma la tizada en Optitex optimizada a tu tela y se entrega en formato MRK. Las tizadas y los formatos CAD se cotizan a pedido.',
    },
  ],
  related: [
    { label: 'Consumo de tela por prenda', to: '/guias/consumo-de-tela-por-prenda' },
    { label: 'Qué formato de molde conviene para tu taller', to: '/guias/formatos-de-molderia-digital' },
    { label: 'Catálogo de moldes', to: '/catalogo' },
    { label: 'Preguntas frecuentes', to: '/preguntas-frecuentes' },
    { label: 'Contacto', to: '/contacto' },
  ],
  updated: '2026-09-06',
  keywords: [
    'tizada',
    'tizada computarizada',
    'marker textil',
    'MRK Optitex',
    'eficiencia de tizada',
    'encimado de tela',
    'corte por encimado',
    'ahorro de tela',
  ],
};
