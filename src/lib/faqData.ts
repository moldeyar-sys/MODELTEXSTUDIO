// Preguntas frecuentes de Modeltex — fuente unica de verdad.
// La usan la pagina /preguntas-frecuentes (con schema FAQPage), el middleware
// que sirve contenido a los bots de IA/buscadores y /llms-full.txt, para que
// todos digan EXACTAMENTE lo mismo.

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: '¿Dónde puedo comprar moldes de ropa digitales en Argentina?',
    a: 'En Modeltex (modeltex.com.ar) vendemos moldería digital profesional para producción textil: más de 2.000 moldes de ropa de dama, hombre, niños y bebés, con curva de talles completa y aprobados con muestra real. Somos un equipo con más de 18 años en la industria textil argentina y enviamos los archivos por descarga digital a todo el mundo.',
  },
  {
    q: '¿Qué formatos de moldes ofrece Modeltex?',
    a: 'Trabajamos los formatos que usa la industria: PDF A4 (para imprimir en casa y pegar), PDF plotter (impresión en ancho real de 90, 120 o 150 cm), moldes en cartón, DXF/AAMA (el formato universal que abre cualquier sistema CAD textil), PDS (Optitex), MRK (tizadas), ADS (Audaces), PLT, CDR y archivos para sublimación.',
  },
  {
    q: '¿Los moldes incluyen todos los talles?',
    a: 'Cada molde está disponible con su curva de talles completa, con la progresión industrial ya hecha: XS a 4XL en adultos (8 talles) y 2 a 18 en niños (9 talles). En la ficha elegís qué talles llevás: el precio base incluye la selección estándar (S a 2XL en adultos, 4 a 16 en niños) y cada talle extra se suma por un adicional chico, así que podés llevar la curva entera en una sola compra. Los formatos CAD (DXF/AAMA, PDS, MRK, ADS) incluyen siempre la curva completa.',
  },
  {
    q: '¿Cuánto cuesta un molde digital?',
    a: 'El PDF A4 arranca en $30.000 pesos argentinos (USD 20 para el exterior), el PDF plotter en $50.000 (USD 40) y el molde en cartón en $80.000 (USD 60), siempre con la selección estándar de talles; los talles extra tienen un adicional por talle. Los formatos CAD (DXF/AAMA, Optitex, Audaces) y las tizadas se cotizan a pedido. Los precios exactos están en cada ficha del catálogo.',
  },
  {
    q: '¿Cómo recibo el molde después de comprar?',
    a: 'Por descarga digital. Los moldes marcados como "Descarga rápida" se habilitan apenas se confirma el pago; el resto se entrega dentro de las 24 horas. Podés comprar con cuenta o sin crear cuenta (te llega un link de descarga a tu email y también podés consultar el pedido con su número y tu email desde "Mi pedido").',
  },
  {
    q: '¿Cuál es la diferencia entre PDF A4 y PDF plotter?',
    a: 'El PDF A4 está partido en hojas tamaño carta/A4 para imprimir en cualquier impresora y pegar siguiendo la numeración: es la opción más económica y no depende de ninguna gráfica. El PDF plotter es el mismo molde en una sola lámina de 90, 120 o 150 cm de ancho, para imprimir en un servicio de ploteo o en un plotter propio, sin pegar hojas: es lo que usan talleres y fábricas que cortan a mano en cantidad.',
  },
  {
    q: '¿Cómo imprimo un molde PDF A4 sin que pierda la escala?',
    a: 'Al imprimir, configurá la escala en 100% o "tamaño real" (nunca "ajustar a la página"). Cada molde incluye un cuadrado de control de medida: imprimí la primera hoja, verificá ese cuadrado con una regla, y recién después imprimí el resto. Las hojas van numeradas para pegarlas en orden.',
  },
  {
    q: '¿Qué necesito para imprimir un molde en plotter?',
    a: 'Cualquier servicio de ploteo textil puede imprimir nuestros PDF de plotter en ancho real (90, 120 o 150 cm según el molde), siempre al 100% de escala. Si preferís cortar directo en CAD, te conviene el formato DXF/AAMA o el nativo de tu sistema (Optitex, Audaces).',
  },
  {
    q: '¿Qué es el formato DXF/AAMA y qué programas lo abren?',
    a: 'DXF/AAMA es el formato estándar de intercambio de moldería digital: lo abren prácticamente todos los sistemas CAD textiles (Optitex, Gerber AccuMark, Lectra, Audaces, entre otros). Si tenés un sistema CAD propio, es el formato más seguro para pedir. En la guía "Cómo abrir moldes DXF en Optitex, Audaces, Gerber y Lectra" explicamos la importación paso a paso.',
  },
  {
    q: '¿Qué programa necesito para abrir un archivo PDS, MRK o ADS?',
    a: 'PDS es el formato nativo de Optitex (moldes) y MRK el de sus tizadas; ADS es el formato nativo de Audaces. Si no usás esos programas, pedí el molde en DXF/AAMA, que se importa en cualquier sistema CAD, o en PDF plotter para imprimir y cortar a mano.',
  },
  {
    q: '¿Los moldes sirven para producción industrial?',
    a: 'Sí, están pensados para eso: cada molde tiene la progresión de talles hecha con criterio industrial, se aprueba con una muestra confeccionada y se entrega en los formatos que usan las fábricas (DXF/AAMA, Optitex, Audaces, PDF plotter). Además hacemos tizadas computarizadas en MRK optimizadas al ancho de tela para el corte por encimado.',
  },
  {
    q: '¿Puedo usar los moldes para fabricar y vender ropa?',
    a: 'Sí. La licencia es de uso productivo: podés confeccionar y vender las prendas sin límite de unidades, para tu marca o para terceros. Lo que no está permitido es revender, publicar o redistribuir los archivos del molde como producto propio.',
  },
  {
    q: '¿Puedo comprar desde fuera de Argentina?',
    a: 'Sí. El sitio muestra precios en dólares para compradores del exterior y la entrega es 100% digital, así que llega a cualquier país. Aceptamos PayPal, Payoneer, Wise y criptomonedas para pagos internacionales.',
  },
  {
    q: '¿Qué medios de pago aceptan?',
    a: 'Mercado Pago (se confirma solo), transferencia bancaria, PayPal, Payoneer, Wise y criptomonedas (Binance). Con Mercado Pago la descarga se habilita apenas se aprueba el pago; con los demás medios, dentro de las 24 horas hábiles de recibido el comprobante.',
  },
  {
    q: '¿Cómo sé que los moldes están bien hechos?',
    a: 'Todos los moldes se aprueban con muestra confeccionada antes de publicarse: la foto de la ficha es la prenda real cosida con ese molde. Además tenemos una sección de Moldes Gratis para que descargues uno real y compruebes la calidad antes de comprar.',
  },
  {
    q: '¿Puedo ver el molde antes de comprarlo?',
    a: 'Podés ver la foto de la prenda confeccionada, los talles, los formatos y las telas recomendadas en cada ficha, y descargar un molde real de la sección Moldes Gratis para revisar el nivel de terminación. Los archivos completos se entregan después del pago.',
  },
  {
    q: '¿Hacen reembolsos si me arrepiento?',
    a: 'Por tratarse de productos digitales, una vez habilitada o descargada la compra no se hacen reembolsos automáticos. Si hubo un error técnico verificable (por ejemplo un archivo que no abre), revisamos el caso y lo resolvemos. Por eso recomendamos revisar bien la ficha y, si hay dudas, consultar por WhatsApp antes de pagar.',
  },
  {
    q: '¿Qué hago si no me llega la descarga?',
    a: 'Si compraste con cuenta, entrá con el mismo email a "Mis descargas". Si compraste sin cuenta, consultá tu pedido con el número y tu email en "Mi pedido". Si el pago ya está confirmado y no ves los archivos, escribinos por WhatsApp (+54 9 11 6653 1086) con el número de pedido y lo resolvemos.',
  },
  {
    q: '¿Hacen moldes a medida?',
    a: 'Sí, tenemos servicio de moldería a pedido: nos mandás tu prenda, foto o idea y desarrollamos el molde con la curva de talles que necesites y tu tabla de medidas, en el formato que uses (PDF, DXF/AAMA, Optitex, Audaces). Se solicita desde la página "Diseño a pedido" o por WhatsApp.',
  },
  {
    q: '¿Puedo pedir cambios a un molde del catálogo?',
    a: 'Sí: ajustar largos, cambiar un escote, agregar bolsillos o adaptar el molde a tu tabla de medidas se trabaja como moldería a pedido sobre el molde base. Consultanos por WhatsApp con el nombre del molde y qué querés cambiar para cotizarlo.',
  },
  {
    q: '¿Qué es el tizado (MRK) y lo venden?',
    a: 'El tizado es el acomodado de los moldes sobre el ancho de tela para cortar con el mínimo desperdicio. Ofrecemos tizadas computarizadas en formato MRK para fábricas y talleres que cortan por encimado, optimizadas al ancho de tela que indiques y a la cantidad de prendas por talle.',
  },
  {
    q: '¿Qué datos tengo que mandar para pedir una tizada?',
    a: 'El ancho útil de la tela, la cantidad de prendas por talle que vas a cortar, si la tela tiene pelo, brillo o estampa con dirección (obliga a tizar en un solo sentido) y el formato en que la querés (MRK de Optitex o PDF plotter para cortar a mano). Con eso armamos la tizada y te informamos el largo total y el consumo por prenda.',
  },
  {
    q: '¿Qué es la curva de talles y por qué importa para producir?',
    a: 'La curva de talles es el conjunto de talles de un molde con su progresión (cuánto crece cada medida entre un talle y el siguiente). Producir con la curva completa te permite vender a más público con el mismo molde y armar tandas por talle según lo que rota en tu canal. En Modeltex la progresión ya viene hecha en cada molde.',
  },
  {
    q: '¿Tienen moldes de uniformes escolares y de trabajo?',
    a: 'Sí, es uno de nuestros rubros fuertes: chombas, buzos, joggings, pantalones, camisas, chalecos y blazers para uniformes escolares y de empresa, en talles de niños y adultos. Si producís para un colegio o una empresa, podemos preparar la tizada al ancho de tu tela y el molde en el formato de tu sistema de corte.',
  },
  {
    q: '¿Tienen moldes para ropa sublimada y deportiva?',
    a: 'Sí: camisetas, shorts, calzas y conjuntos deportivos, con archivos preparados para sublimación (CDR, PLT, PDF) cuando hace falta trabajar el diseño sobre las piezas. En la guía "Moldes para ropa sublimada y deportiva" explicamos qué cambia en el molde y qué telas usar.',
  },
  {
    q: '¿Qué tela conviene para cada molde?',
    a: 'Cada ficha indica las telas recomendadas para ese molde (por ejemplo frisa o rústico para buzos, jersey de algodón para remeras, gabardina o sarga para pantalones de trabajo, lycra o suplex para calzas). Si vas a usar otra tela, conviene hacer primero una muestra: la holgura del molde cambia según la elasticidad y el gramaje.',
  },
  {
    q: '¿Los moldes de niño y de adulto son iguales?',
    a: 'No: el mismo diseño se vende como dos moldes distintos, uno con la curva de niños (2 a 18) y otro con la de adultos (XS a 4XL), porque las proporciones y la progresión son diferentes. En el catálogo cada uno aparece en su categoría (niña, niño, dama, hombre o unisex).',
  },
  {
    q: '¿Cómo busco un molde en el catálogo?',
    a: 'El catálogo se filtra por categoría (dama, hombre, niña, niño, bebés, unisex), temporada y formato, y tiene un buscador inteligente que entiende consultas como "buzo oversize frisa" o "short niña verano". También podés usar la herramienta IA Textil para que te sugiera qué prendas producir y qué moldes usar.',
  },
  {
    q: '¿Modeltex vende ropa o solo moldes?',
    a: 'Solo moldería: vendemos los moldes digitales (y en cartón) para que fabricantes, talleres, marcas y emprendedores produzcan y vendan sus prendas. No vendemos ropa terminada.',
  },
  {
    q: '¿Cómo me contacto con Modeltex?',
    a: 'Por WhatsApp o Telegram al +54 9 11 6653 1086, por el formulario de contacto del sitio o por Facebook (facebook.com/modeltex.ar). Atendemos de lunes a sábado de 9 a 18 hs (hora Argentina) y respondemos consultas de cualquier país.',
  },
  {
    q: '¿Cómo hacer moldes de ropa paso a paso?',
    a: 'El proceso profesional tiene seis etapas: tomar las medidas del cuerpo o de la prenda base, trazar el molde base con esas medidas, transformar ese molde base al modelo que se quiere (agregar escote, mangas, bolsillos), coser una muestra en tela económica para probar el calce, corregir el molde según esa prueba y, recién ahí, escalarlo a toda la curva de talles. Es un proceso que lleva tiempo hacerlo bien, por eso muchos fabricantes prefieren partir de un molde digital ya aprobado con muestra y con la curva escalada, y ajustarlo, en vez de empezar de cero.',
  },
  {
    q: '¿Cuáles son las medidas básicas para un molde?',
    a: 'Para un molde base de la parte superior del cuerpo hacen falta el contorno de busto o pecho, el contorno de cintura, el largo de talle delantero y espalda, el ancho de espalda, el contorno de cuello y el largo de manga. Para pantalón o falda se suman el contorno de cadera, el tiro (para pantalón) y el largo deseado. Estas medidas son el punto de partida: cada molde después se prueba con una muestra cosida y se ajusta, porque el cuerpo real siempre varía respecto de cualquier tabla orientativa.',
  },
  {
    q: '¿Cómo hacer el molde de un pantalón?',
    a: 'Se traza a partir del contorno de cintura, contorno de cadera, tiro y largo total, con dos piezas principales (delantero y espalda) y pinzas o pliegues en la cintura para absorber la diferencia entre cintura y cadera. Un jogging o pantalón deportivo simplifica esto con cintura elastizada y sin pinzas. Después de trazarlo se cose una muestra, se corrige el calce y recién ahí se escala a los demás talles.',
  },
  {
    q: '¿Cómo hacer el molde de una falda?',
    a: 'El molde base de falda (o pollera base) se arma con el contorno de cintura, el contorno de cadera y el largo deseado, en delantero y espalda, con pinzas en la cintura para absorber la diferencia con la cadera. Desde esa base se derivan la falda recta, la falda tubo, la evasé o campana (que se arma sobre un círculo o cuarto de círculo, sin pinzas) y la tableada o plisada, que suma paños. Igual que con cualquier molde, conviene probarlo con una muestra antes de escalarlo a toda la curva de talles.',
  },
  {
    q: '¿Cómo escalar patrones de costura?',
    a: 'Escalar (o graduar) un patrón es aplicar incrementos definidos en una tabla a cada punto del molde base para generar los demás talles, manteniendo la proporción y el aplomo de la pieza. Se puede hacer a mano con regla y escuadra sobre líneas guía horizontales y verticales, o en un programa CAD (Optitex, Audaces, Gerber) que genera automáticamente toda la curva a partir de esos incrementos. Todos los moldes digitales de Modeltex ya vienen con la curva de talles escalada y aprobada, sin necesidad de graduarla de nuevo.',
  },
  {
    q: '¿Cuál es la diferencia entre moldería y patronaje?',
    a: 'En la práctica son el mismo oficio: desarrollar los moldes o patrones de una prenda a partir de medidas. La diferencia es sobre todo regional: en Argentina y el Río de la Plata se usa más "moldería" y "moldista", mientras que en España y otros países hispanohablantes se usa más "patronaje" y "patronista". No hay una distinción técnica oficial entre ambos términos en el uso cotidiano de la industria.',
  },
  {
    q: '¿Qué programas hay para hacer moldería digital gratis?',
    a: 'Seamly2D (la continuación open source de Valentina) permite trazar moldes paramétricos por medidas de forma gratuita, y programas de dibujo vectorial como Inkscape sirven para digitalizar y ajustar piezas ya trazadas a mano. Son un buen punto de partida, pero no suelen tener el escalado industrial automático ni el manejo de archivos DXF/AAMA tan maduro como el software profesional pago (Optitex, Audaces, Gerber, Lectra) que se usa en producción de fábrica. Para quien no quiere pasar por la curva de aprendizaje de ningún programa, partir de un molde digital ya hecho es la alternativa más rápida para empezar a producir.',
  },
  {
    q: '¿Qué es el patronaje industrial?',
    a: 'Es el desarrollo de moldes pensado para producir muchas prendas iguales de forma repetible: incluye el trazado del molde base, su escalado a toda la curva de talles, la ficha técnica de la prenda, la tizada optimizada para minimizar el desperdicio de tela y la aprobación con muestra antes de pasar a producción en serie. Se diferencia de la moldería artesanal u hobby en que ahí el molde es único, para una persona o una prenda puntual, sin necesidad de escalar ni optimizar tela.',
  },
  {
    q: 'Tabla de medidas industriales para imprimir',
    a: 'En Argentina no existe una única tabla de medidas oficial obligatoria para indumentaria adulta: la Ley 27.521 crea el SUNITI para avanzar hacia talles unificados, pero en la práctica cada fábrica arma su propia tabla y progresión, calibrada con sus propios moldistas y pruebas de calce. Una tabla de medidas propia debería tener, como mínimo, columnas de talle, contorno de busto o pecho, contorno de cintura, contorno de cadera, largo de talle y ancho de espalda, con los números validados con una muestra cosida antes de tizar en serie. Los moldes de Modeltex ya vienen con su curva de talles y progresión hecha y aprobada con muestra, como alternativa a armar la tabla desde cero.',
  },
  {
    q: '¿Cómo digitalizar patrones de papel?',
    a: 'Los métodos más usados son la mesa digitalizadora (se recorre el contorno del molde de papel con un cursor y el software CAD genera el vector exacto, el método más preciso), el escaneo por partes seguido de vectorización en un programa CAD o vectorial, y la foto cenital con una referencia de escala conocida cuando no hay mesa digitalizadora. En cualquiera de los tres conviene verificar la escala real con una medida de control y revisar que las curvas queden suaves. Modeltex ofrece moldería a pedido a partir de una prenda, foto o molde de papel existente, incluyendo pasarlo a digital y escalarlo a toda la curva de talles.',
  },
];
