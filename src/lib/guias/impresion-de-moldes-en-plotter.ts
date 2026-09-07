import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'impresion-de-moldes-en-plotter',
  title: 'Cómo imprimir moldes en plotter para un taller de confección',
  seoTitle: 'Imprimir moldes en plotter: anchos, papel y escala',
  description:
    'Cómo imprimir moldes PDF en plotter: anchos de 90, 120 y 150 cm, papel, escala 100%, cuadro de control, qué pedirle a la gráfica y cuándo pasar a cartón o CAD.',
  intro:
    'Un molde PDF para plotter se imprime en una gráfica de ploteo o en un plotter propio, sobre rollo de 90, 120 o 150 cm de ancho, siempre a escala 100% y verificando el cuadro de control con una regla antes de cortar. Es el formato habitual del taller que corta a mano o por encimado: cada pieza sale entera, sin pegar hojas, y el papel se puede pasar a cartón o reimprimir cuando se gasta.',
  sections: [
    {
      h2: 'Qué es un PDF de plotter y en qué se diferencia del A4',
      paragraphs: [
        'Un PDF de plotter es una sola página larga a escala real: el ancho coincide con el rollo (90, 120 o 150 cm) y el largo es el que necesiten las piezas, en general de 1 a 6 metros por prenda con toda la curva. El A4 es el mismo molde partido en hojas con marcas de unión: sirve para probar o para una tirada chica, pero un juego completo puede llevar de 40 a 100 hojas para pegar, con errores que se acumulan en cada unión.',
        'Los talles pueden venir anidados (todas las líneas de la curva superpuestas en una misma pieza, cada una con su etiqueta) o separados (una pieza completa por talle). El anidado ocupa mucho menos papel pero obliga a repasar la línea del talle a cortar; el separado gasta más metros y es más cómodo para cortar y pasar a cartón. Antes de imprimir, mirá en las propiedades del PDF el tamaño de página: ahí figura el ancho exacto y los metros de largo que vas a pagar.',
      ],
    },
    {
      h2: 'Anchos de rollo: 90, 120 y 150 cm',
      paragraphs: [
        'El ancho del archivo no se negocia: un PDF armado a 150 cm no entra en un rollo de 90 sin reducirlo o partirlo en paneles. Si la gráfica lo reduce, el molde sale fuera de escala; si lo panelea, tenés que unir tramos con marcas, como en A4. Averiguá qué ancho maneja tu gráfica o tu plotter antes de elegir el archivo.',
        'El ancho de 90 cm es el más extendido porque corresponde a los plotters de 36 pulgadas (rollo de unos 91 cm) que tiene casi cualquier gráfica; 120 y 150 cm requieren equipos de 60 pulgadas o plotters textiles, más comunes en servicios de tizada y fábricas. En Modeltex cada molde para plotter viene armado a 90, 120 o 150 cm según el tamaño de las piezas; si tu proveedor solo imprime en 90, confirmá el ancho del archivo antes de comprarlo.',
      ],
    },
    {
      h2: 'Papel: cuál pedir según el uso',
      paragraphs: [
        'Para cortar una o dos veces alcanza con papel obra o bond de 75 a 90 gramos, el más barato por metro. Si el molde va a usarse varias veces sobre la mesa, pedí papel de 90 a 120 gramos o kraft, que aguanta el manoseo y los alfileres. Las gráficas que trabajan con talleres suelen tener también papel de tizada, más liviano, pensado para apoyar sobre el encimado y cortar a través de él.',
        'Casi ningún plotter de tinta imprime sobre cartón: para moldes de cartón se imprime en papel liviano y se pega sobre cartón gris o cartón para moldería, o se compra el molde ya hecho en cartón. Evitá el papel satinado o fotográfico: es caro, brilla bajo la luz de la mesa y no marca bien con lápiz ni tiza.',
      ],
    },
    {
      h2: 'Escala 100% y cuadro de control',
      paragraphs: [
        'La única forma correcta de imprimir un molde es a escala 100% o tamaño real. Las opciones ajustar a la página, ajustar al rollo o encoger páginas grandes, que suelen venir activadas por defecto en los drivers de plotter y en Acrobat Reader, deforman el molde sin avisar: un error de 3% en un pantalón son casi 3 cm de largo perdidos en toda la curva.',
        'Cada molde incluye un cuadro de control, en general un cuadrado de 10 por 10 cm. Medilo con regla metálica apenas salga la impresión, en los dos sentidos, porque el plotter puede estirar el papel en la dirección de avance y no en la otra; una diferencia mayor a 1 o 2 mm justifica reimprimir. Como control adicional, medí una pieza conocida, por ejemplo el ancho de pecho de un delantero, contra la tabla de medidas del molde.',
      ],
    },
    {
      h2: 'Cómo pedirlo a una gráfica y cuánto cuesta',
      paragraphs: [
        'Mandá el PDF original, nunca una captura ni una conversión a imagen, y escribí en el pedido: escala 100% sin ajustar, ancho del archivo (90, 120 o 150 cm), gramaje de papel, cantidad de copias y, si los talles vienen en páginas separadas, cuáles querés. Pedí la entrega enrollada y no doblada, para que las líneas no se quiebren en los pliegues.',
        'El ploteo se cobra por metro lineal de rollo y el precio varía mucho entre gráficas, ciudades y gramajes, así que pedí cotización por metro y multiplicala por el largo de página del PDF. Como referencia orientativa, una remera con la curva completa anidada ocupa entre 2 y 4 metros de rollo de 90 cm; con talles separados puede multiplicar esa cifra por tres o cuatro, y un pantalón o una campera con forro llevan bastante más.',
      ],
    },
    {
      h2: 'Plotter propio o servicio de ploteo',
      paragraphs: [
        'Un servicio de ploteo conviene mientras imprimas pocos juegos por mes: no inmovilizás capital, no pagás tinta ni mantenimiento y elegís el ancho que necesites. El plotter propio se justifica cuando imprimís varias veces por semana, cuando necesitás tizadas de encimado todos los días o cuando la gráfica más cercana te hace perder medio día por cada corrección de molde.',
        'Si comprás, un plotter de tinta de 36 pulgadas cubre todos los archivos de 90 cm y es el equipo más accesible; para 120 y 150 cm hacen falta modelos de 60 pulgadas o plotters textiles, con otro nivel de inversión y espacio. Sumá tinta, rollos de papel, un lugar seco para guardarlos y alguien que configure el driver a escala real, que es donde nacen la mayoría de los moldes mal impresos.',
      ],
    },
    {
      h2: 'Cuándo pasar a cartón o a CAD',
      paragraphs: [
        'El papel es el soporte adecuado mientras el molde cambie o se use pocas veces. Cuando un mismo modelo se corta todas las semanas, pasalo a cartón: la línea se conserva, se marca rápido sobre el encimado y no hay que reimprimir cada vez que se rompe. Modeltex vende moldes en cartón desde 80.000 pesos, con la curva completa.',
        'El salto a CAD (DXF/AAMA, PDS de Optitex o ADS de Audaces) conviene cuando cortás con tizada computarizada, tercerizás el corte en un servicio con plotter de tizada o modificás el molde con frecuencia: en CAD ajustás, escalás y tizás sin imprimir hasta el corte final. PDF de plotter para el taller que corta a mano, cartón para el modelo que se repite y CAD para el que optimiza tela.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Puedo imprimir un PDF de plotter en hojas A4 en mi impresora?',
      a: 'Se puede con la opción Póster o mosaico de Acrobat Reader a escala 100%, que divide la página larga en hojas A4 con marcas de superposición, pero un molde de 90 por 300 cm se convierte en más de 50 hojas para pegar. Si vas a imprimir en casa, conviene comprar directamente la versión PDF A4, que ya viene paginada y numerada.',
    },
    {
      q: '¿Qué ancho de plotter necesito para imprimir moldes?',
      a: 'El que corresponda al ancho del archivo: 90, 120 o 150 cm. Los plotters de 36 pulgadas, los más comunes en gráficas, cubren los archivos de 90 cm; los de 120 y 150 requieren equipos de 60 pulgadas o plotters textiles. El ancho exacto de tu PDF figura en las propiedades del documento, en tamaño de página.',
    },
    {
      q: '¿Cómo sé si el molde salió a escala correcta?',
      a: 'Medí con regla el cuadro de control impreso, en general un cuadrado de 10 por 10 cm, en los dos sentidos: si se aparta más de 1 o 2 mm, se imprimió ajustado al rollo o a la página y hay que repetirlo a escala 100%. Verificá además una medida conocida de una pieza, como el ancho de pecho, contra la tabla de medidas.',
    },
    {
      q: '¿Qué papel conviene para imprimir moldes en plotter?',
      a: 'Papel obra o bond de 75 a 90 gramos si vas a cortar pocas veces, y de 90 a 120 gramos o kraft si el molde va a vivir en la mesa. Para cortar sobre el encimado se usa papel de tizada, más liviano. Los plotters de tinta no imprimen sobre cartón: se imprime en papel y se pega, o se compra el molde ya en cartón.',
    },
    {
      q: '¿Cuánto cuesta imprimir un molde en plotter?',
      a: 'Se cobra por metro lineal de rollo y el precio cambia según la gráfica, la ciudad y el gramaje del papel: la referencia útil es la cotización por metro multiplicada por el largo del archivo. Como orden de magnitud orientativo, una remera con la curva completa anidada ocupa de 2 a 4 metros en rollo de 90 cm; con talles separados, varias veces más.',
    },
    {
      q: '¿Conviene comprar un plotter para el taller?',
      a: 'Solo si imprimís varias veces por semana o necesitás tizadas diarias; si no, el servicio de ploteo es más barato y no inmoviliza capital. Un plotter de 36 pulgadas resuelve los archivos de 90 cm con una inversión moderada; 120 y 150 cm necesitan equipos de gran formato. Sumá tinta, papel, espacio y la configuración del driver a escala real.',
    },
  ],
  related: [
    { label: 'Moldes para plotter', to: '/moldes-para-plotter' },
    { label: 'Ayuda de impresión', to: '/ayuda-impresion' },
    { label: 'Qué formato de molde conviene para tu taller', to: '/guias/formatos-de-molderia-digital' },
    { label: 'Qué es una tizada computarizada', to: '/guias/tizada-computarizada-mrk' },
    { label: 'Moldes PDF A4', to: '/moldes-pdf-a4' },
  ],
  updated: '2026-09-06',
  keywords: [
    'imprimir moldes en plotter',
    'ploteo de moldes',
    'plotter 90 cm moldes',
    'papel para plotter moldería',
    'escala 100% molde pdf',
    'cuadro de control molde',
    'molde pdf plotter',
  ],
};
