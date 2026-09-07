import type { Guia } from '../guiasTypes';

export const guia: Guia = {
  slug: 'glosario-de-molderia',
  title: 'Glosario de moldería y producción textil',
  seoTitle: 'Glosario de moldería y producción textil',
  description:
    'Más de 40 términos de moldería, corte, confección y CAD textil definidos para producir: aplomo, piquete, holgura, progresión, tizada, encimado, facón, DXF y MRK.',
  intro:
    'Este glosario reúne los términos que se usan a diario en moldería, corte y confección industrial en Argentina, cada uno definido en una a tres oraciones, para leer una ficha técnica o hablar con un taller, una gráfica de ploteo o un tizador sin ambigüedades. Está ordenado por tema: molde, talles, tela, corte y tizada, confección y costeo, y formatos digitales, tal como aparecen en las fichas de Modeltex.',
  sections: [
    {
      h2: 'Términos del molde',
      paragraphs: [
        'Lo que está dibujado en cada pieza y lo que define cómo calza la prenda.',
      ],
      bullets: [
        'Molde base: patrón básico de una prenda (corpiño, manga, pantalón) trazado sobre una tabla de medidas, sin diseño ni detalles. De él salen por transformación todos los modelos.',
        'Transformación: proceso de convertir un molde base en el molde de un modelo concreto: mover pinzas, agregar recortes, cambiar escotes, largos y holguras.',
        'Aplomo: marca de referencia que indica qué punto de una pieza tiene que coincidir con otra al coser, por ejemplo el centro de la copa de manga con la costura de hombro.',
        'Piquete: corte pequeño en el borde del molde, de 3 a 5 mm en general, que materializa un aplomo o señala el margen de costura, el centro de una pieza o el largo de una pinza.',
        'Margen de costura: tela adicional entre la línea de costura y el borde de corte. En tejido de punto suele ser 0,7 a 1 cm y en tejido plano 1 a 1,5 cm; los moldes industriales lo traen incluido.',
        'Holgura: diferencia entre la medida del cuerpo y la medida de la prenda. Una remera holgada puede tener 10 cm o más de holgura de pecho; una calza tiene holgura negativa porque la tela se estira.',
        'Entalle: grado en que la prenda sigue la forma del cuerpo, sobre todo en cintura. A más entalle, menos holgura y más necesidad de pinzas o recortes.',
        'Pinza: pliegue cosido en forma de triángulo que da volumen o ajusta la tela al cuerpo, típico en busto y cintura de prendas de tejido plano.',
        'Canesú: pieza horizontal en la parte superior de la espalda, el delantero o una pollera, unida por un recorte. Da forma sin pinzas y se usa mucho en camisas y camperas.',
        'Manga ranglan: manga que llega hasta el escote con una costura diagonal, sin costura de hombro. Es la manga típica de buzos y camperas deportivas.',
      ],
    },
    {
      h2: 'Talles y progresión',
      paragraphs: [
        'Cómo un molde de un solo talle se convierte en una curva completa.',
      ],
      bullets: [
        'Curva de talles: conjunto de talles en que se produce un modelo, por ejemplo XS a 4XL en adultos o 2 a 18 en niños. Producir toda la curva o parte de ella es una decisión comercial.',
        'Progresión o escalado: método para generar todos los talles a partir del talle base aplicando incrementos en puntos definidos del molde, según una tabla de medidas. En CAD se hace con reglas de progresión.',
        'Tabla de medidas: listado de medidas corporales por talle (contorno de pecho, cintura, cadera, largos) que sirve de referencia para trazar, progresar y controlar la prenda terminada.',
        'Muestra: primera prenda confeccionada con el molde para verificar calce, construcción y consumo antes de producir. Aprobar la muestra con una prueba de calce es lo que valida un molde.',
        'Ley 27.521 y SUNITI: ley argentina de talles de 2019 que crea el Sistema Único Normalizado de Identificación de Talles de Indumentaria, con el objetivo de identificar las prendas por medidas corporales normalizadas.',
      ],
    },
    {
      h2: 'Términos de tela',
      paragraphs: [
        'Lo que hay que mirar en la tela antes de tizar y cortar.',
      ],
      bullets: [
        'Sentido de hilo: dirección de la urdimbre en tejido plano o de las columnas en tejido de punto, marcada con una flecha en cada pieza del molde. Cortar fuera de hilo deforma la prenda.',
        'Bies: dirección a 45 grados del hilo. Las tiras cortadas al bies se estiran y se usan para vivos, escotes y terminaciones curvas.',
        'Rapport: unidad de repetición de un estampado o un cuadro. Cuando hay que casar el dibujo en las costuras, el consumo de tela sube.',
        'Gramaje: peso de la tela en gramos por metro cuadrado (g/m2). Un jersey liviano ronda 140 a 160 g/m2 y una frisa pesada supera los 300, orientativo.',
        'Encogimiento: porcentaje que achica la tela al lavarse o al recibir calor. En algodón puede ser de 2 a 5% (orientativo); se compensa prelavando o agrandando el molde.',
        'Tejido de punto y tejido plano: el punto (jersey, frisa, morley, piqué) se estira y el molde lleva menos holgura; el plano (gabardina, popelina, denim, lino) no se estira y necesita holgura y pinzas.',
        'Pelo o dirección: telas como el polar, la pana o el corderito tienen un sentido visible; todas las piezas se cortan en la misma dirección, lo que baja el rendimiento de la tizada.',
        'Ancho útil y orillo: el orillo es el borde tejido del rollo; el ancho útil es el ancho real disponible para tizar, sin orillos ni agujeros de rama, y es el dato que necesita el tizador.',
        'Partida: lote de tela teñido en un mismo baño. Entre partidas hay variaciones de tono, por eso una misma prenda se corta de una sola partida.',
      ],
    },
    {
      h2: 'Corte y tizada',
      paragraphs: [
        'Del molde a la mesa de corte.',
      ],
      bullets: [
        'Tizada: acomodo de todas las piezas de uno o varios talles sobre el ancho de tela para cortar con el menor desperdicio. Puede hacerse a mano sobre la tela o en computadora (archivo MRK).',
        'Encimado: extendido de muchas capas de tela una sobre otra en la mesa de corte para cortar varias prendas a la vez con la misma tizada.',
        'Eficiencia de tizada: porcentaje del área de tela que ocupan las piezas. En general se mueve entre 70 y 85% según la prenda, la mezcla de talles y el ancho; el resto es desperdicio.',
        'Consumo: metros de tela que lleva una prenda. Se calcula dividiendo el largo de la tizada por la cantidad de prendas que contiene y es la base del costeo.',
        'Merma: tela que se pierde por desperdicio de tizada, fallas, encogimiento y cabeceras de encimado. En costeo se suma como porcentaje sobre el consumo, orientativo 3 a 8%.',
        'Corte: separación de las piezas del encimado con máquina de corte vertical, circular o mesa automatizada. Un corte prolijo depende de una tizada clara y piquetes bien marcados.',
      ],
    },
    {
      h2: 'Confección y costeo',
      paragraphs: [
        'Términos del taller y de la planilla de costos.',
      ],
      bullets: [
        'Facón: trabajo de confección que se paga por prenda a un taller externo, que recibe las piezas cortadas y los avíos y devuelve la prenda cosida. El precio de facón es uno de los costos principales.',
        'Avíos: todo lo que lleva la prenda además de la tela principal: hilos, cierres, botones, elásticos, etiquetas, entretelas, cordones, cuellos tejidos.',
        'Ficha técnica: documento que describe la prenda para producirla: dibujo plano, telas, avíos, medidas por talle, tipo de costuras, posición de estampas o bordados y consumos.',
        'Recta, overlock y collareta: las tres máquinas básicas de un taller. La recta hace el pespunte del tejido plano, la overlock cose y remata el punto, y la collareta hace dobladillos elásticos en remeras y calzas.',
      ],
    },
    {
      h2: 'Formatos y herramientas digitales',
      paragraphs: [
        'Cómo viaja el molde entre programas, gráficas y máquinas de corte. Son los formatos en que Modeltex entrega sus moldes; el que te conviene depende de con qué cortás.',
      ],
      bullets: [
        'CAD textil: programas de moldería digital como Optitex, Audaces, Gerber AccuMark y Lectra, que permiten trazar, progresar, tizar y exportar moldes.',
        'DXF/AAMA: formato estándar de intercambio de moldería que abren casi todos los sistemas CAD. Es el formato seguro para pedir un molde cuando no usás el nativo de tu programa.',
        'PDS: archivo nativo de moldes de Optitex, con piezas, progresión y reglas editables.',
        'MRK: archivo de tizada de Optitex, listo para plotear o enviar a una mesa de corte automatizada. Se arma para un ancho de tela y una combinación de talles determinados.',
        'ADS: formato nativo de Audaces, el CAD más usado en Brasil y muy difundido en Argentina.',
        'PLT y CDR: PLT es el archivo de trazado que entienden los plotters y CorelDRAW; CDR es el archivo nativo de CorelDRAW, usado para diseñar sobre el molde en sublimación.',
        'PDF A4 y PDF plotter: el PDF A4 divide el molde en hojas numeradas para imprimir en casa y pegar; el PDF plotter tiene el molde a escala real en ancho de 90, 120 o 150 cm para imprimir en un servicio de ploteo.',
        'Plotter: impresora de gran formato que imprime moldes y tizadas en ancho real sobre rollo de papel. Existen también plotters de corte que recortan el molde en papel o cartón.',
        'Cuadro de control: cuadrado de medida conocida (por ejemplo 5 x 5 o 10 x 10 cm) incluido en el molde para verificar con regla que la impresión salió al 100% de escala.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Qué diferencia hay entre aplomo y piquete?',
      a: 'El aplomo es la referencia: el punto de una pieza que tiene que coincidir con otra al coser. El piquete es la marca física, un corte de 3 a 5 mm en el borde de la tela, que señala ese aplomo, un centro, un margen o el largo de una pinza. En la práctica muchos talleres usan las dos palabras como sinónimos.',
    },
    {
      q: '¿Qué significa progresión o escalado de talles?',
      a: 'Es el proceso de generar todos los talles de una curva a partir del talle base, aplicando incrementos definidos en puntos del molde según una tabla de medidas. En CAD se hace con reglas de progresión y se verifica midiendo cada talle; un molde industrial se vende ya progresado.',
    },
    {
      q: '¿Qué es una tizada y en qué se diferencia del encimado?',
      a: 'La tizada es el acomodo de las piezas del molde sobre el ancho de tela para cortar con el mínimo desperdicio; el encimado es el extendido de muchas capas de tela sobre la mesa para cortarlas todas a la vez con esa tizada. Primero se tiza, después se encima y se corta.',
    },
    {
      q: '¿Qué es el facón en confección?',
      a: 'Es la confección tercerizada que se paga por prenda: el taller recibe las piezas cortadas y los avíos y devuelve la prenda cosida. Trabajar a facón permite producir sin máquinas ni personal propio, y el precio de facón por prenda es uno de los componentes principales del costo.',
    },
    {
      q: '¿Qué formato de molde digital abre cualquier programa CAD?',
      a: 'DXF/AAMA, el formato estándar de intercambio de moldería. Lo importan Optitex, Audaces, Gerber AccuMark y Lectra, entre otros. Si usás un programa concreto podés pedir el nativo (PDS para Optitex, ADS para Audaces), pero el DXF/AAMA es la opción segura.',
    },
    {
      q: '¿Qué es el sentido de hilo y por qué importa al cortar?',
      a: 'Es la dirección de la urdimbre (o de las columnas en tejido de punto) y viene marcada con una flecha en cada pieza del molde. Cortar con la flecha paralela al orillo hace que la prenda caiga derecha y se estire donde corresponde; cortar fuera de hilo tuerce costuras y deforma la prenda.',
    },
  ],
  related: [
    { label: 'Guía: formatos de moldería digital', to: '/guias/formatos-de-molderia-digital' },
    { label: 'Guía: qué es una tizada MRK', to: '/guias/tizada-computarizada-mrk' },
    { label: 'Preguntas frecuentes', to: '/preguntas-frecuentes' },
    { label: 'Ayuda de impresión', to: '/ayuda-impresion' },
    { label: 'Catálogo completo', to: '/catalogo' },
  ],
  updated: '2026-09-06',
  keywords: [
    'glosario moldería',
    'términos de moldería',
    'qué es aplomo',
    'qué es piquete',
    'qué es tizada',
    'progresión de talles',
    'vocabulario textil',
    'glosario confección industrial',
  ],
};
