import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'formatos-de-molderia-digital',
  title: 'Qué formato de molde conviene para tu taller o fábrica',
  seoTitle: 'Formatos de moldería digital: cuál te conviene',
  description:
    'PDF A4, PDF plotter, cartón, DXF/AAMA, PDS, ADS y MRK: qué formato de molde conviene según cómo cortás, cuánto producís por modelo y qué equipo tenés.',
  intro:
    'El formato se elige por cómo cortás y cuánto repetís cada modelo. Si cortás a mano, el PDF A4 sirve para muestras y tiradas chicas, el PDF plotter es el estándar de producción y el cartón conviene cuando un modelo se repite durante meses. Si tenés sistema CAD o cortadora automática, pedí DXF/AAMA (lo importa cualquier programa) o el nativo de tu sistema (PDS de Optitex, ADS de Audaces), y si cortás por encimado, una tizada MRK ya acomodada a tu ancho de tela.',
  sections: [
    {
      h2: 'Los siete formatos en una tabla mental',
      paragraphs: [
        'Todos los formatos traen las mismas piezas con la misma curva de talles; lo que cambia es cómo llegan a la mesa de corte.',
      ],
      bullets: [
        'PDF A4: hojas numeradas para imprimir en impresora común y pegar. Muestras y tiradas chicas.',
        'PDF plotter: el molde en tamaño real, en rollo de 90, 120 o 150 cm según el molde. Producción cortando a mano.',
        'Cartón: piezas rígidas para marcar sobre la tela una y otra vez. Modelos que se repiten.',
        'DXF/AAMA: intercambio universal; lo importa cualquier CAD textil para modificar, escalar y tizar.',
        'PDS y ADS: nativos de Optitex y Audaces, con reglas de escalado, piquetes y márgenes editables.',
        'MRK: tizada computarizada de Optitex, con las piezas acomodadas al ancho de tela y las cantidades por talle.',
        'PLT y CDR: trazados vectoriales para plotter de corte y sublimación.',
      ],
    },
    {
      h2: 'PDF A4: muestras, desarrollo y primeras tiradas',
      paragraphs: [
        'El PDF A4 divide el molde en hojas con marcas de unión que imprimís al 100 por ciento (nunca con "ajustar a la página") y pegás. Trae un cuadro de control para verificar la escala con una regla antes de imprimir el resto. Es el formato más barato: en Modeltex arranca en 30.000 pesos (USD 20) con todos los talles de la curva.',
        'La limitación es el armado: una remera de adulto en un solo talle ocupa en general entre 12 y 20 hojas, y un vestido largo o un abrigo pueden pasar de 40. Se justifica para una muestra o para 10 o 20 prendas; si vas a cortar los ocho talles todas las semanas, te conviene el plotter. Un uso muy práctico es el desarrollo: imprimís el talle base, hacés la muestra, corregís y recién después pasás a plotter o CAD.',
      ],
    },
    {
      h2: 'PDF plotter: el estándar del taller que corta a mano',
      paragraphs: [
        'El PDF plotter trae el molde completo en tamaño real, listo para imprimir en cualquier gráfica de ploteo o en un plotter propio. El ancho (90, 120 o 150 cm) depende del molde: una remera entra en 90, un vestido amplio o un abrigo con todos sus talles suele necesitar 120 o 150. Se imprime en papel obra o kraft y se cobra por metro lineal; el precio lo fija la gráfica y varía según ciudad y gramaje.',
        'No hay pegado ni error acumulado en las uniones: lo que sale del plotter es la pieza exacta, para cortar directo sobre una o dos capas o pasar a cartón. Conviene para talleres que producen de 20 a varios cientos de prendas por modelo con tijera o cuchilla vertical y sin CAD, y es lo que te va a pedir un cortador tercerizado. Arranca en 50.000 pesos (USD 40).',
      ],
    },
    {
      h2: 'Moldes en cartón: cuando el modelo se repite',
      paragraphs: [
        'El cartón es la versión física durable del molde: piezas para apoyar sobre el encimado, marcar con tiza o lápiz y cortar. Sirve para talleres que producen el mismo modelo temporada tras temporada (uniformes escolares y de trabajo, básicos como remeras, joggers y buzos) y no quieren volver a imprimir.',
        'Tiene dos contras: ocupa espacio (ocho talles de un pantalón son muchas piezas colgadas) y no se modifica; si cambiás el largo o un detalle, rehacés el cartón. Arranca en 80.000 pesos (USD 60) con la curva completa y, como es el único formato que no se descarga, la entrega se consulta por WhatsApp.',
      ],
    },
    {
      h2: 'DXF/AAMA: el formato universal para CAD',
      paragraphs: [
        'DXF/AAMA (norma ASTM D6673, heredera de la AAMA-292) es el estándar de intercambio de moldería entre sistemas CAD. Cada tipo de línea viaja en una capa numerada (contorno, piquetes, sentido de hilo, líneas internas, textos) y los talles pueden ir escalados dentro del mismo archivo o en un archivo de reglas .rul que lo acompaña. Lo importan Optitex, Audaces, Gerber AccuMark y Lectra Modaris, entre otros.',
        'Es el formato que pedís si tenés CAD propio y querés aplicar tu tabla de medidas, cambiar márgenes o armar tus tizadas, y el más seguro para mandarle a un tercero sin saber qué programa usa. Al importar verificá la unidad (centímetros o pulgadas), que los piquetes hayan entrado como piquetes y no como rayitas, y medí una pieza contra la ficha antes de cortar. Se entrega a pedido.',
      ],
    },
    {
      h2: 'PDS, ADS y MRK: nativos y tizada',
      paragraphs: [
        'PDS (Optitex) y ADS (Audaces) son los archivos nativos de cada sistema. A diferencia del DXF, conservan la moldería como objetos inteligentes: reglas de escalado por punto, márgenes paramétricos, piquetes con tipo y profundidad, y las propiedades de cada pieza (cantidad, tela, sentido de hilo). Si trabajás en uno de esos programas, el nativo te ahorra la limpieza que suele pedir un DXF.',
        'El MRK no es el molde sino la tizada: las piezas de los talles que vas a cortar acomodadas sobre el ancho útil de tu tela con el mínimo desperdicio, listas para el plotter de tizada o la cortadora automática. Conviene cuando cortás por encimado y el rendimiento de tela pesa en el costo. Para pedirla indicá ancho útil, talles y cantidades, y si la tela tiene pelo, brillo o dirección de estampa.',
      ],
    },
    {
      h2: 'Cómo decidir: volumen, forma de corte y equipo',
      paragraphs: [
        'Mirá tres cosas: cuántas prendas por modelo vas a cortar, si cortás a mano o en máquina, y si alguien maneja CAD. En costo el orden es A4, plotter y cartón; CAD y tizadas se cotizan a pedido. En tiempo, el PDF se descarga al confirmarse el pago o dentro de las 24 horas, el ploteo depende de la gráfica y el cartón es lo que más demora. Se puede combinar: A4 para la muestra, plotter o DXF para producir. En Modeltex todos los formatos incluyen la curva de talles completa.',
      ],
      bullets: [
        'Muestra, prueba de calce o hasta 20 prendas: PDF A4.',
        'Taller que corta a mano, de 20 a cientos de prendas por modelo: PDF plotter.',
        'Mismo modelo repetido por meses (uniformes, básicos): plotter pasado a cartón, o cartón directo.',
        'CAD propio y necesidad de modificar o escalar con tu tabla: DXF/AAMA, o PDS y ADS si usás Optitex o Audaces.',
        'Corte por encimado con plotter de tizada o cortadora automática: MRK con tu ancho, talles y cantidades.',
        'Sublimación o plotter de corte: PLT o CDR.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Qué formato de molde conviene para un taller chico que corta a mano?',
      a: 'PDF plotter: lo imprimís en tamaño real en una gráfica de ploteo, cortás directo sobre el papel o lo pasás a cartón, sin pegar hojas. El PDF A4 queda para la muestra o tiradas muy chicas, porque armar ocho talles hoja por hoja lleva horas.',
    },
    {
      q: '¿Qué diferencia hay entre un molde en PDF y uno en DXF?',
      a: 'El PDF es una imagen exacta del molde, pero fija. El DXF/AAMA es el molde como datos vectoriales que un CAD (Optitex, Audaces, Gerber, Lectra) puede editar, escalar con otra tabla y tizar. Sin CAD el DXF no te sirve; con CAD es el que más rinde.',
    },
    {
      q: '¿Un molde DXF/AAMA se abre en cualquier programa de moldería?',
      a: 'Sí, es el estándar de intercambio de la industria (ASTM D6673, antes AAMA-292) y lo importan prácticamente todos los CAD textiles. Lo que cambia es cómo cada programa interpreta las capas de piquetes, sentido de hilo y textos; por eso siempre se verifica la unidad y se mide una pieza al importar.',
    },
    {
      q: '¿Cuándo conviene pedir el molde en cartón?',
      a: 'Cuando vas a cortar el mismo modelo muchas veces durante meses, sin cambios, y cortás a mano: uniformes, básicos de una marca, ropa de trabajo. El cartón aguanta el marcado repetido sobre el encimado. Si el modelo cambia cada temporada, conviene el PDF plotter, que reimprimís cuando haga falta.',
    },
    {
      q: '¿Qué es un archivo MRK y para qué sirve?',
      a: 'MRK es el formato de tizada (marker) de Optitex: las piezas de los talles que vas a cortar ya acomodadas sobre el ancho de tu tela con el mínimo desperdicio. Se imprime en plotter de tizada sobre el encimado o se envía a la cortadora automática. Para pedirla hacen falta ancho útil, talles y cantidades.',
    },
    {
      q: '¿Cuánto cuesta un molde digital según el formato?',
      a: 'En Modeltex el PDF A4 arranca en 30.000 pesos argentinos (USD 20), el PDF plotter en 50.000 (USD 40) y el cartón en 80.000 (USD 60), siempre con la curva de talles completa. Los formatos CAD (DXF/AAMA, PDS, ADS) y las tizadas MRK se cotizan a pedido.',
    },
  ],
  related: [
    { label: 'Moldes para plotter', to: '/moldes-para-plotter' },
    { label: 'Moldes PDF A4', to: '/moldes-pdf-a4' },
    {
      label: 'Cómo abrir un DXF/AAMA en Optitex, Audaces, Gerber y Lectra',
      to: '/guias/abrir-moldes-dxf-en-optitex-audaces-gerber-lectra',
    },
    { label: 'Qué es una tizada MRK y cómo ahorra tela', to: '/guias/tizada-computarizada-mrk' },
    { label: 'Catálogo completo', to: '/catalogo' },
  ],
  updated: '2026-09-06',
  keywords: [
    'formatos de moldes digitales',
    'molde PDF A4 o plotter',
    'molde DXF AAMA',
    'molde en cartón',
    'archivo PDS Optitex',
    'archivo ADS Audaces',
    'tizada MRK',
    'qué formato de molde comprar',
  ],
};
