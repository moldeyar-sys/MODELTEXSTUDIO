// Contenido de la pagina pilar /molderia-digital.
//
// Vive aca, y no dentro del .tsx, porque middleware.ts arma el HTML inicial de
// esta pagina (lo que ven los robots sin JavaScript y los navegadores sin JS)
// y src/pages/MolderiaDigitalPage.tsx arma la version React. Si el texto
// estuviera duplicado en los dos lados, tarde o temprano dirian cosas
// distintas en la misma URL. Con una sola fuente, el contenido esencial es
// identico por construccion.
//
// Por que existe esta pagina: la intencion "molderia digital" estaba repartida
// entre /moldes-pdf, /moldes-pdf-a4, /moldes-para-plotter y varias guias, sin
// una pagina que respondiera la consulta general y repartiera el trafico hacia
// la correcta. Esta es esa pagina.

export const MD_PATH = '/molderia-digital';

export const MD_TITLE = 'Moldería digital: formatos, usos y moldes listos para producir';
export const MD_DESCRIPTION =
  'Qué es la moldería digital, qué formato conviene según cómo cortás (PDF A4, plotter, DXF/AAMA, Optitex, Audaces) y cuándo comprar un molde listo o pedirlo a medida.';
export const MD_H1 = 'Moldería digital: qué es, qué formato conviene y cómo producir con moldes digitales';

export const MD_INTRO =
  'La moldería digital es el desarrollo de los moldes de una prenda en archivo, no en papel: el mismo trabajo de patronaje de siempre, pero guardado en un formato que se puede imprimir, escalar a toda la curva de talles, tizar y cortar las veces que haga falta sin que se gaste ni se deforme. En Modeltex trabajamos moldería digital para producción: más de 2.000 moldes de ropa con la curva de talles industrial ya progresada y aprobados con una muestra confeccionada, más el servicio de moldería a medida cuando el molde que necesitás no existe.';

/** Bloques H2 con su texto. El orden es el orden de la página. */
export interface MdSection {
  h2: string;
  paragraphs: string[];
  bullets?: string[];
}

export const MD_SECTIONS: MdSection[] = [
  {
    h2: 'Qué es la moldería digital',
    paragraphs: [
      'Un molde digital contiene exactamente lo mismo que un molde de cartón —el contorno de cada pieza, los piquetes, el sentido de hilo, los márgenes de costura y las marcas de talle—, con la diferencia de que está en un archivo. Eso cambia tres cosas concretas en un taller: se puede reimprimir cuando se gasta, se puede escalar a otros talles sin volver a trazar, y se puede mandar por mail a una gráfica o a una fábrica en otra provincia.',
      'La moldería digital no es lo mismo que "un PDF con un dibujo". Un molde sirve para producir cuando está a escala real verificable, tiene la curva de talles progresada con criterio industrial y fue probado cosiendo una prenda. Sin esas tres cosas, lo que hay es un dibujo bonito que va a fallar en la primera tanda.',
      'En Argentina se dice moldería y moldista; en España y otros países hispanohablantes, patronaje y patronista. Es el mismo oficio: la diferencia es regional, no técnica.',
    ],
  },
  {
    h2: 'Qué entrega Modeltex',
    paragraphs: [
      'Cada molde del catálogo se entrega como archivo descargable, con la curva de talles completa disponible (XS a 4XL en adultos, 2 a 18 en niños) y una foto de la prenda real confeccionada con ese molde. En la ficha se eligen los talles y el formato.',
    ],
    bullets: [
      'Moldes digitales listos del catálogo, con descarga inmediata en los marcados como descarga rápida.',
      'Moldería a medida: desarrollamos el molde desde tu prenda, tu foto o tu idea, con tu tabla de medidas.',
      'Tizadas computarizadas (MRK) acomodadas al ancho real de tu tela.',
      'Adaptaciones de un molde del catálogo: cambiar un escote, ajustar largos, agregar bolsillos o pasarlo a tu tabla de medidas.',
      'Moldes gratis reales para que compruebes el nivel de terminación antes de comprar.',
    ],
  },
  {
    h2: 'Qué formato de molde digital conviene según cómo cortás',
    paragraphs: [
      'El formato no se elige por gusto: se elige por cómo cortás y cuántas veces vas a repetir el modelo. Esta es la diferencia práctica entre los formatos que entregamos.',
    ],
  },
  {
    h2: 'Cuándo conviene un molde listo y cuándo moldería a medida',
    paragraphs: [
      'Un molde del catálogo conviene cuando la prenda que querés producir es una prenda estándar del rubro —una remera, un buzo, un jogger, un short escolar, una campera deportiva— y lo que necesitás es arrancar la producción esta semana, no desarrollar moldería. Ya está progresado, ya está probado, y sale una fracción de lo que cuesta un desarrollo.',
      'La moldería a medida conviene cuando el molde tiene que responder a algo tuyo que ningún molde genérico puede saber: tu propia tabla de medidas, una prenda con un detalle de diseño particular, una copia exacta de una prenda que ya vendés bien, o una adaptación a una tela con un comportamiento distinto. También cuando producís uniformes para un colegio o una empresa y el calce tiene que ser el mismo todos los años.',
      'Muchas veces la respuesta es mixta: se compra el molde del catálogo más parecido y se pide una adaptación sobre esa base. Sale más barato y más rápido que empezar de cero.',
    ],
  },
  {
    h2: 'Cómo se usa un molde digital en producción',
    paragraphs: [
      'El circuito completo, de la descarga a la tela, es el mismo en un taller de dos máquinas que en una fábrica.',
    ],
    bullets: [
      'Se descarga el archivo en el formato que usa tu corte (PDF A4, PDF plotter o CAD).',
      'Se imprime al 100% de escala, o se importa directo al sistema CAD si cortás con máquina.',
      'Se verifica el cuadrado de control con una regla: es el paso que evita cortar una tanda entera fuera de medida.',
      'Se cose una muestra en la tela que vas a usar de verdad, porque la holgura cambia según el gramaje y la elasticidad.',
      'Se arma la tizada al ancho real de tu rollo y se corta por encimado.',
    ],
  },
  {
    h2: 'Cómo imprimir un molde digital o mandarlo a plotter',
    paragraphs: [
      'En PDF A4 se imprime en cualquier impresora hogareña con la escala fijada en 100% (nunca "ajustar a la página"), y se pegan las hojas siguiendo la numeración hasta formar la pieza entera. Conviene imprimir primero la hoja del cuadrado de control y medirlo con una regla antes de gastar el resto del papel.',
      'En PDF plotter se lleva el archivo a cualquier gráfica de ploteo o se imprime en un plotter propio, sobre rollo de 90, 120 o 150 cm según el molde, también al 100%. Sale en una sola lámina, sin uniones, que es lo que usa un taller que corta a mano en cantidad.',
      'Si cortás con sistema CAD no se imprime nada: el DXF/AAMA se importa directo, se confirma la unidad (centímetros, milímetros o pulgadas) y se mide una pieza contra la ficha técnica antes de cortar.',
    ],
  },
  {
    h2: 'Moldería digital para sublimación',
    paragraphs: [
      'Un molde para sublimar no es el molde común con otro nombre: cada panel se entrega por separado, a escala real, con margen de sangrado alrededor del contorno, marcas de registro y de talle, y la compensación del encogimiento que produce la plancha. Sobre microfibra, suplex y jersey de poliéster ese encogimiento suele estar entre el 1 y el 3%, y si no se compensa en el molde la prenda sale corta.',
      'La tinta de sublimación solo fija en fibra sintética, así que este camino sirve para camisetas de fútbol, uniformes deportivos y ropa de gimnasio, no para algodón.',
    ],
  },
  {
    h2: 'Cómo pedir un molde desde una foto o una prenda física',
    paragraphs: [
      'Para moldería a medida alcanza con mandarnos por WhatsApp una foto de frente y de espalda de la prenda, o la prenda física si la tenés, junto con tu tabla de medidas (o las medidas del talle base, y nosotros armamos la curva). Si hay un detalle particular —un tipo de bolsillo, un escote, una terminación— conviene una foto de cerca de esa zona.',
      'Con eso cotizamos el desarrollo, el plazo y el formato de entrega. El molde se entrega en el formato que uses: PDF A4, PDF plotter, DXF/AAMA, PDS de Optitex o ADS de Audaces.',
    ],
  },
  {
    h2: 'Entrega, pagos y licencia',
    paragraphs: [
      'Los moldes digitales se entregan por descarga: los marcados como descarga rápida se habilitan apenas se confirma el pago y el resto dentro de las 24 horas. Se puede comprar con cuenta o sin crear cuenta. Aceptamos Mercado Pago, transferencia bancaria, PayPal, Payoneer, Wise y criptomonedas, y como la entrega es digital llega a cualquier país.',
      'La licencia es de uso productivo: podés confeccionar y vender las prendas hechas con el molde sin límite de unidades. Lo que no está permitido es revender o redistribuir los archivos del molde como producto propio. Por tratarse de un producto digital, una vez habilitada la descarga no hay reembolso automático.',
    ],
  },
];

/** Tabla comparativa de formatos (la sección "Qué formato conviene"). */
export interface MdFormato {
  formato: string;
  paraQuien: string;
  comoSeUsa: string;
  ojo: string;
}

export const MD_FORMATOS: MdFormato[] = [
  {
    formato: 'PDF A4',
    paraQuien: 'Emprendedores, muestras y tiradas chicas',
    comoSeUsa: 'Se imprime en una impresora común al 100% y se pegan las hojas numeradas.',
    ojo: 'Pegar hojas lleva tiempo: por encima de unos pocos modelos por semana conviene pasar a plotter.',
  },
  {
    formato: 'PDF plotter',
    paraQuien: 'Talleres y fábricas que cortan a mano',
    comoSeUsa: 'Se imprime en una gráfica de ploteo sobre rollo de 90, 120 o 150 cm, en una sola lámina.',
    ojo: 'Hay que indicar impresión al 100%: muchas gráficas ajustan al ancho del rollo por defecto.',
  },
  {
    formato: 'DXF / AAMA',
    paraQuien: 'Cualquier sistema CAD textil',
    comoSeUsa: 'Se importa en Optitex, Audaces, Gerber AccuMark o Lectra Modaris, con la curva completa.',
    ojo: 'Confirmar la unidad al importar y revisar el mapeo de las capas de piquetes y sentido de hilo.',
  },
  {
    formato: 'PDS (Optitex)',
    paraQuien: 'Departamentos de patronaje con Optitex',
    comoSeUsa: 'Archivo nativo: abre sin conversión, con piquetes y progresión intactos.',
    ojo: 'Solo sirve si usás Optitex; para cualquier otro sistema, pedir DXF/AAMA.',
  },
  {
    formato: 'ADS (Audaces)',
    paraQuien: 'Talleres y fábricas con Audaces',
    comoSeUsa: 'Archivo nativo de Audaces Moldes, listo para tizar y cortar.',
    ojo: 'Igual que PDS: es específico de un sistema, no es un formato de intercambio.',
  },
  {
    formato: 'MRK (tizada)',
    paraQuien: 'Producción por encimado',
    comoSeUsa: 'No es el molde sino la tizada ya acomodada al ancho de tu tela y a tu mezcla de talles.',
    ojo: 'Hay que pedirla con el ancho útil real del rollo y la cantidad de prendas por talle.',
  },
  {
    formato: 'Cartón',
    paraQuien: 'Modelos que se repiten durante meses',
    comoSeUsa: 'El molde físico troquelado, listo para marcar sobre la tela.',
    ojo: 'Es el único formato que no es digital: se envía físicamente y se gasta con el uso.',
  },
];

/** FAQ visible en la página. El mismo array alimenta el FAQPage de schema.org. */
export const MD_FAQS: Array<{ q: string; a: string }> = [
  {
    q: '¿Qué es la moldería digital?',
    a: 'Es el desarrollo de los moldes de una prenda en archivo en vez de en cartón o papel. El molde digital tiene lo mismo que un molde físico (contorno de cada pieza, piquetes, sentido de hilo, márgenes y marcas de talle), pero se puede reimprimir, escalar a toda la curva de talles, tizar y enviar por mail sin que se gaste ni se deforme.',
  },
  {
    q: '¿Qué son los moldes digitales?',
    a: 'Son los archivos de cada molde, listos para imprimir o para abrir en un sistema CAD. En Modeltex vienen en PDF A4, PDF plotter, DXF/AAMA, PDS de Optitex, ADS de Audaces, MRK para tizadas, PLT y CDR, todos con la curva de talles industrial ya progresada.',
  },
  {
    q: '¿Qué diferencia hay entre un molde PDF A4 y uno para plotter?',
    a: 'El PDF A4 viene partido en hojas para imprimir en cualquier impresora casera y pegar siguiendo la numeración. El PDF plotter es la misma pieza entera en una sola lámina de 90, 120 o 150 cm de ancho, para imprimir en un servicio de ploteo. El molde es el mismo: cambia cómo sale impreso.',
  },
  {
    q: '¿Cuándo conviene comprar un molde listo y cuándo pedir moldería a medida?',
    a: 'Un molde del catálogo conviene cuando la prenda es estándar del rubro y necesitás producir ya: está progresado, probado con muestra y cuesta una fracción de un desarrollo. La moldería a medida conviene cuando hace falta tu propia tabla de medidas, un detalle de diseño particular, copiar una prenda que ya vendés o adaptarlo a una tela con otro comportamiento.',
  },
  {
    q: '¿Los moldes digitales sirven para sublimar?',
    a: 'Sí, pero el molde para sublimación se prepara distinto: cada panel va por separado, a escala real, con margen de sangrado, marcas de registro y la compensación del encogimiento de la plancha (orientativo 1 a 3% en microfibra y jersey de poliéster). La tinta de sublimación solo fija en fibra sintética, no en algodón.',
  },
  {
    q: '¿Puedo pedir un molde desde una foto o desde una prenda física?',
    a: 'Sí. Con una foto de frente y de espalda de la prenda (o la prenda física) más tu tabla de medidas alcanza para cotizar el desarrollo. Si hay un detalle particular, conviene sumar una foto de cerca de esa zona.',
  },
  {
    q: '¿Qué programa necesito para abrir un molde digital?',
    a: 'Para PDF A4 y PDF plotter, cualquier lector de PDF y una impresora. Para DXF/AAMA, cualquier sistema CAD textil (Optitex, Audaces, Gerber AccuMark, Lectra). PDS solo abre en Optitex y ADS en Audaces; si no usás esos programas, pedí DXF/AAMA, que es el formato universal de intercambio.',
  },
  {
    q: '¿Los moldes digitales incluyen todos los talles?',
    a: 'Cada molde tiene la curva completa disponible con la progresión industrial hecha (XS a 4XL en adultos, 2 a 18 en niños). En la ficha se eligen los talles: el precio base cubre la selección estándar y cada talle extra suma un adicional chico. Los formatos CAD incluyen siempre la curva entera.',
  },
  {
    q: '¿Cómo se entrega un molde digital?',
    a: 'Por descarga. Los moldes marcados como descarga rápida se habilitan apenas se confirma el pago; el resto dentro de las 24 horas. Se puede comprar con cuenta o sin crear cuenta, y al ser archivos la entrega llega a cualquier país.',
  },
  {
    q: '¿Puedo producir y vender ropa con un molde digital de Modeltex?',
    a: 'Sí, la licencia es de uso productivo: podés confeccionar y vender las prendas sin límite de unidades, para tu marca o para terceros. Lo que no está permitido es revender o redistribuir los archivos del molde.',
  },
];

/** Enlaces internos editoriales de la página pilar hacia el resto del sitio. */
export const MD_LINKS: Array<{ to: string; label: string; hint: string }> = [
  { to: '/catalogo', label: 'Catálogo de moldes digitales', hint: 'Más de 2.000 moldes con filtros por categoría, temporada y formato.' },
  { to: '/moldes-pdf', label: 'Moldes PDF para imprimir', hint: 'Qué son y qué incluye cada archivo PDF.' },
  { to: '/moldes-pdf-a4', label: 'Moldes PDF A4', hint: 'Para imprimir en casa y pegar las hojas numeradas.' },
  { to: '/moldes-para-plotter', label: 'Moldes para plotter', hint: 'Ancho real de 90, 120 o 150 cm, sin uniones.' },
  { to: '/moldes-gratis', label: 'Moldes gratis', hint: 'Moldes reales del catálogo para descargar sin pagar.' },
  { to: '/diseno-a-pedido', label: 'Moldería a medida', hint: 'Desarrollo del molde desde tu prenda, foto o idea.' },
  { to: '/moldes-para-emprendedores', label: 'Moldes para emprendedores', hint: 'Para arrancar una marca sin desarrollar moldería.' },
  { to: '/lab', label: 'Curso gratis de moldería textil', hint: 'MODELTEX LAB: de los fundamentos a la producción industrial.' },
  { to: '/guias', label: 'Guías para producción', hint: 'Formatos, telas, curva de talles, tizadas, consumo y costeo.' },
  { to: '/ayuda-impresion', label: 'Cómo imprimir sin perder escala', hint: 'El paso que evita cortar una tanda fuera de medida.' },
];

/** Guías relacionadas, para que la página pilar reparta hacia el contenido editorial. */
export const MD_GUIAS: Array<{ to: string; label: string }> = [
  { to: '/guias/formatos-de-molderia-digital', label: 'Qué formato de molde conviene para tu taller o fábrica' },
  { to: '/guias/como-hacer-moldes-de-ropa-paso-a-paso', label: 'Cómo hacer un molde de ropa paso a paso' },
  { to: '/guias/curva-de-talles-industrial', label: 'Curva de talles para producción' },
  { to: '/guias/como-escalar-patrones-de-costura', label: 'Cómo escalar patrones de costura para producir en serie' },
  { to: '/guias/abrir-moldes-dxf-en-optitex-audaces-gerber-lectra', label: 'Cómo abrir un molde DXF/AAMA en Optitex, Audaces, Gerber y Lectra' },
  { to: '/guias/tizada-computarizada-mrk', label: 'Qué es una tizada (MRK) y cómo ahorra tela' },
  { to: '/guias/impresion-de-moldes-en-plotter', label: 'Cómo imprimir moldes en plotter' },
  { to: '/guias/moldes-para-sublimacion', label: 'Moldes para ropa sublimada y deportiva' },
  { to: '/guias/como-digitalizar-patrones-de-papel', label: 'Cómo digitalizar patrones de papel' },
  { to: '/guias/diferencia-entre-molderia-y-patronaje', label: 'Diferencia entre moldería y patronaje' },
];

/** Categorías del catálogo, para bajar de la página pilar al producto. */
export const MD_CATEGORIAS: Array<{ to: string; label: string }> = [
  { to: '/catalogo?categoria=dama', label: 'Moldes para dama' },
  { to: '/catalogo?categoria=hombre', label: 'Moldes para hombre' },
  { to: '/catalogo?categoria=nina', label: 'Moldes para niña' },
  { to: '/catalogo?categoria=nino', label: 'Moldes para niño' },
  { to: '/catalogo?categoria=bebes', label: 'Moldes para bebés' },
  { to: '/catalogo?categoria=adultos-unisex', label: 'Moldes unisex para adultos' },
  { to: '/catalogo?categoria=ninos-unisex', label: 'Moldes unisex para niños' },
];
