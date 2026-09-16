// Preguntas frecuentes de las paginas comerciales, en un solo lugar.
//
// POR QUE: cada una de estas paginas tenia DOS juegos de FAQ distintos, uno en
// el .tsx y otro en middleware.ts, y ya se habian desincronizado: /moldes-pdf
// mostraba 8 preguntas al usuario y 7 al robot, /moldes-pdf-a4 4 y 3, y
// /moldes-para-plotter tenia una pregunta en React que el robot no veia y otra
// en el middleware que el usuario no veia. El FAQPage de schema.org solo es
// valido si la respuesta esta VISIBLE en la pagina: marcar una respuesta que
// el visitante no puede leer es exactamente lo que Google penaliza.
//
// Ahora hay una sola lista por ruta. La usan el .tsx (para mostrarla) y
// middleware.ts (para el HTML inicial y el JSON-LD), asi que no pueden
// separarse.
//
// Las respuestas estan escritas para responder de una, en la primera oracion:
// es lo que levanta un buscador con IA o un asistente que cita el sitio.

export interface Faq {
  q: string;
  a: string;
}

export const LANDING_FAQS: Record<string, Faq[]> = {
  '/moldes-pdf': [
    {
      q: '¿Qué son los moldes en PDF?',
      a: 'Son moldes de ropa digitales entregados en un archivo PDF, listos para imprimir y cortar: incluyen todas las piezas de la prenda a escala real, la curva de talles completa y un cuadrado de control para verificar que la impresión no perdió medida.',
    },
    {
      q: '¿Cómo se imprimen los moldes PDF?',
      a: 'Se abre el archivo y se imprime con la escala fijada en 100% o "tamaño real", nunca en "ajustar a la página". En PDF A4 salen hojas numeradas que se pegan en orden; en PDF plotter sale una sola lámina de ancho real en un servicio de ploteo. En los dos casos conviene medir con una regla el cuadrado de control antes de cortar tela.',
    },
    {
      q: '¿Qué diferencia hay entre un molde PDF A4 y uno para plotter?',
      a: 'El PDF A4 viene partido en hojas carta u oficio para imprimir en cualquier impresora casera y pegar siguiendo la numeración; es la opción más económica. El PDF plotter es la misma pieza completa en una sola lámina de 90, 120 o 150 cm de ancho, pensada para imprimirse en una gráfica de ploteo y usarse directo en un taller.',
    },
    {
      q: '¿Qué necesito para usar un molde descargable?',
      a: 'Para un PDF A4, una impresora común, hojas A4 u oficio, cinta o pegamento y una regla para verificar la escala. Para un PDF plotter, llevar el archivo a cualquier gráfica de ploteo. Para DXF/AAMA, PDS o ADS, el sistema CAD correspondiente. No hace falta ningún programa especial ni pagar licencias para los formatos PDF.',
    },
    {
      q: '¿Los moldes PDF ya están listos para imprimir?',
      a: 'Sí: cada archivo se descarga, se imprime al 100% de escala y se corta, sin ningún paso de edición previo. Las piezas ya vienen ordenadas, a escala real y con el cuadrado de control de medida.',
    },
    {
      q: '¿Los moldes PDF incluyen todos los talles?',
      a: 'Sí, cada molde PDF incluye la curva de talles completa (XS a 4XL en adultos, 2 a 18 en niños) ya escalada y aprobada con una muestra confeccionada; en la ficha del producto elegís qué talles llevar.',
    },
    {
      q: '¿Los moldes PDF sirven para sublimar?',
      a: 'Para sublimación se entrega una versión distinta del molde: cada panel por separado, a escala real, con margen de sangrado, marcas de registro y la compensación del encogimiento de la plancha (orientativo 1 a 3% en microfibra y jersey de poliéster). Se pide desde la ficha del producto o por WhatsApp; la sublimación solo fija en fibra sintética, no en algodón.',
    },
    {
      q: '¿Puedo usar los moldes PDF para producir y vender ropa?',
      a: 'Sí, la licencia es de uso productivo: podés confeccionar y vender las prendas hechas con el molde sin límite de unidades. Lo único que no está permitido es revender o redistribuir el archivo del molde en sí.',
    },
    {
      q: '¿Qué significa que un molde esté "listo para imprimir"?',
      a: 'Que no hace falta ningún paso de edición ni ajuste antes de imprimirlo: el archivo ya viene con las piezas ordenadas, a escala real y con un cuadrado de control de medida. Solo hay que abrirlo, imprimirlo al 100% de escala y cortar.',
    },
    {
      q: '¿Dónde consigo moldes listos en PDF para imprimir hoy mismo?',
      a: 'En el catálogo de Modeltex: elegís el molde, lo comprás y lo tenés disponible para descargar al momento (los marcados como "descarga rápida" se habilitan apenas se confirma el pago). No hay tiempos de envío porque es un archivo digital.',
    },
  ],

  '/moldes-pdf-a4': [
    {
      q: '¿Qué necesito para imprimir un molde PDF A4?',
      a: 'Solo una impresora casera o de oficina común, configurada al 100% de escala (nunca "ajustar a la página"), y hojas A4 u oficio. No hace falta ningún equipo especial ni ir a una gráfica.',
    },
    {
      q: '¿Cómo se arma el molde después de imprimirlo?',
      a: 'Cada hoja sale numerada: se pegan en orden siguiendo esa numeración hasta formar la pieza completa a tamaño real. Cada archivo trae además un cuadrado de control para verificar con una regla que la impresión no perdió escala.',
    },
    {
      q: '¿El PDF A4 incluye todos los talles?',
      a: 'Sí, la curva de talles completa viene incluida en el archivo (XS a 4XL en adultos, 2 a 18 en niños); en la ficha del producto se elige qué talles imprimir.',
    },
    {
      q: '¿Cuántas hojas A4 ocupa un molde?',
      a: 'Depende de la prenda y del talle: una remera de dama suele entrar en 20 a 30 hojas y un pantalón o una campera pueden pasar de 40. Por eso conviene imprimir de a un talle por vez en lugar de toda la curva junta.',
    },
    {
      q: '¿Cuándo conviene pasar de A4 a plotter?',
      a: 'Cuando pegar hojas empieza a atrasar la producción o se necesita cortar en cantidad: el mismo molde existe en formato plotter, en una sola lámina de ancho real, sin uniones.',
    },
  ],

  '/moldes-para-plotter': [
    {
      q: '¿En qué anchos vienen los moldes para plotter?',
      a: 'En 90, 120 o 150 cm según el molde: la ficha de cada producto indica el ancho exacto para que coincida con el rollo de la gráfica o de tu plotter.',
    },
    {
      q: '¿Dónde imprimo un molde PDF plotter?',
      a: 'En cualquier gráfica o servicio de ploteo textil, o en un plotter propio, siempre al 100% de escala y en una sola lámina. Conviene aclararlo al pedirlo: muchas gráficas ajustan al ancho del rollo por defecto y eso cambia la medida del molde.',
    },
    {
      q: '¿El plotter incluye la curva de talles completa?',
      a: 'Sí, el archivo trae la curva completa ya progresada (XS a 4XL en adultos, 2 a 18 en niños), con las líneas de cada talle superpuestas y diferenciadas.',
    },
    {
      q: '¿Puedo pedir el mismo molde en DXF/AAMA en vez de PDF?',
      a: 'Sí. Si cortás con un sistema CAD, el mismo molde está disponible en DXF/AAMA (el formato universal que importa cualquier programa) y también en los nativos PDS de Optitex y ADS de Audaces.',
    },
    {
      q: '¿Qué diferencia hay entre un molde para plotter y una tizada?',
      a: 'El molde para plotter trae las piezas de la prenda ordenadas para imprimir y cortar. La tizada (MRK) es otra cosa: son esas piezas ya acomodadas sobre el ancho real de tu tela y con tu mezcla de talles, para cortar por encimado gastando la menor cantidad de tela posible. Las tizadas se piden aparte, indicando el ancho útil del rollo.',
    },
  ],

  '/moldes-para-emprendedores': [
    {
      q: '¿Qué moldes convienen para arrancar una marca de ropa?',
      a: 'Moldes ya aprobados con muestra confeccionada y con la curva de talles completa, para no perder semanas desarrollando moldería. Conviene arrancar con pocos modelos base (una remera, un buzo, un jogger) y derivar variantes de tela y color sobre esos mismos moldes.',
    },
    {
      q: '¿Puedo probar la calidad antes de comprar el catálogo completo?',
      a: 'Sí: la sección de moldes gratis tiene moldes reales del catálogo, no versiones recortadas, para descargar, imprimir y coser antes de decidir una compra.',
    },
    {
      q: '¿Necesito plotter para empezar a producir?',
      a: 'No. Para una primera tanda alcanza con PDF A4 impreso en casa. El plotter conviene más adelante, cuando el volumen crece y pegar hojas empieza a atrasar.',
    },
    {
      q: '¿Los moldes vienen con la curva de talles lista?',
      a: 'Sí, la progresión industrial ya está hecha y aprobada con muestra: XS a 4XL en adultos y 2 a 18 en niños. En la ficha elegís qué talles llevás.',
    },
    {
      q: '¿Cuánto cuesta arrancar con moldes digitales?',
      a: 'El PDF A4 arranca en $30.000 ARS y el PDF plotter en $50.000, con la selección estándar de talles; cada talle extra suma un adicional chico. Los precios exactos están en cada ficha del catálogo.',
    },
  ],

  '/moldes-gratis': [
    {
      q: '¿Dónde puedo descargar moldes gratis para imprimir?',
      a: 'En la sección Moldes Gratis de modeltex.com.ar: se elige un molde de la selección gratuita y se descarga en PDF listo para imprimir. No se pide ningún dato de pago; algunos se bajan sin cuenta y otros piden una cuenta gratuita de Modeltex.',
    },
    {
      q: '¿Los moldes gratis son moldes reales o solo de muestra?',
      a: 'Son moldes reales del catálogo, no versiones recortadas ni de muestra: mismo nivel de terminación, talles y prolijidad que los moldes pagos.',
    },
    {
      q: '¿Los moldes gratis vienen en PDF listos para imprimir?',
      a: 'Sí, se entregan en PDF, listos para imprimir en A4 o plotter según el molde, con el mismo cuadrado de control de medida que traen los moldes pagos para verificar que la impresión no perdió escala.',
    },
    {
      q: '¿Los moldes gratis en PDF son moldes completos o solo una parte?',
      a: 'Son el molde completo, con todas sus piezas y su curva de talles, igual que un molde pago: no es una versión parcial ni un recorte del archivo.',
    },
    {
      q: '¿Puedo usar un molde gratis para producir y vender ropa?',
      a: 'Sí, tiene la misma licencia de uso productivo que los moldes pagos: podés confeccionar y vender las prendas sin límite de unidades. Lo que no está permitido es revender o redistribuir el archivo del molde.',
    },
    {
      q: '¿Cada cuánto suben moldes nuevos gratis para descargar?',
      a: 'Sumamos moldes gratuitos nuevos de forma periódica, en general cada semana. Si dejás tu email en esta página te avisamos cuando hay novedades.',
    },
    {
      q: '¿Qué diferencia hay entre los moldes gratis y los moldes pagos?',
      a: 'Ninguna en calidad: la diferencia es que el catálogo gratis es una selección chica y rotativa, mientras que el catálogo completo tiene más de 2.000 moldes con curva de talles completa, para elegir por categoría, prenda y formato.',
    },
  ],

  '/diseno-a-pedido': [
    {
      q: '¿Modeltex hace diseños a pedido?',
      a: 'Sí. Además del catálogo, Modeltex desarrolla moldería a medida: el molde completo de una prenda que no está en el catálogo, con la curva de talles escalada a la tabla de medidas del cliente y entregada en el formato que use (PDF A4, PDF plotter, DXF/AAMA, PDS de Optitex o ADS de Audaces).',
    },
    {
      q: '¿Puedo pedir un molde desde una foto o desde una prenda física?',
      a: 'Sí. Con una foto de frente y de espalda de la prenda, o la prenda física, más tu tabla de medidas (o las medidas del talle base) alcanza para cotizar el desarrollo. Si hay un detalle particular —un bolsillo, un escote, una terminación— conviene sumar una foto de cerca de esa zona.',
    },
    {
      q: '¿Se puede adaptar un molde del catálogo en vez de hacerlo de cero?',
      a: 'Sí, y en general sale más barato y más rápido: se parte del molde del catálogo más parecido y se le cambia lo que haga falta (largos, escote, bolsillos) o se lo pasa a tu tabla de medidas.',
    },
    {
      q: '¿En qué formato se entrega un molde a medida?',
      a: 'En el que uses: PDF A4 para imprimir en casa, PDF plotter en ancho real, DXF/AAMA para cualquier sistema CAD, PDS de Optitex, ADS de Audaces, o una tizada MRK acomodada al ancho de tu tela.',
    },
    {
      q: '¿Qué datos hacen falta para cotizar una moldería a medida?',
      a: 'Fotos o la prenda, la tabla de medidas o las medidas del talle base, qué talles necesitás, el tipo de tela con la que vas a producir y en qué formato querés el archivo. Con eso se cotiza el desarrollo y el plazo.',
    },
  ],

  '/ayuda-impresion': [
    {
      q: '¿Cómo se imprimen los moldes PDF sin perder la escala?',
      a: 'Configurando la impresión en 100% o "tamaño real", nunca en "ajustar a la página". Conviene imprimir primero la hoja del cuadrado de control, medirlo con una regla y confirmar que dio la medida indicada antes de imprimir el resto.',
    },
    {
      q: '¿Para qué sirve el cuadrado de control de medida?',
      a: 'Es un cuadrado impreso de medida conocida que sirve para comprobar que la impresora no achicó ni agrandó el archivo. Si ese cuadrado mide lo que dice, el molde entero está a escala real; si no, hay que corregir la configuración de impresión y volver a imprimir.',
    },
    {
      q: '¿Qué le tengo que pedir a la gráfica para imprimir en plotter?',
      a: 'Impresión al 100% de escala, sin ajustar al ancho del rollo, sobre el ancho que indique la ficha del molde (90, 120 o 150 cm). Es el error más común: muchas gráficas reescalan por defecto para aprovechar el papel.',
    },
    {
      q: '¿Puedo imprimir un molde PDF A4 en hojas oficio o carta?',
      a: 'Sí, siempre que la escala quede en 100%. El molde sale igual: solo cambia cuántas hojas ocupa y cómo se distribuyen los cortes de la grilla numerada.',
    },
  ],
};

/** FAQ de una ruta, o lista vacía si esa ruta no define una. */
export function faqsFor(path: string): Faq[] {
  return LANDING_FAQS[path] || [];
}
