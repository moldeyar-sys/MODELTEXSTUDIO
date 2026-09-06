// Preguntas frecuentes de Modeltex — fuente unica de verdad.
// La usan la pagina /preguntas-frecuentes (con schema FAQPage) y el
// middleware que sirve contenido a los bots de IA/buscadores, para que
// ambos digan EXACTAMENTE lo mismo.

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
    a: 'Trabajamos los formatos que usa la industria: PDF A4 (para imprimir en casa y pegar), PDF plotter (impresión en ancho real), DXF/AAMA (el formato universal que abre cualquier sistema CAD textil), PDS (Optitex), MRK (tizadas), ADS (Audaces), PLT, CDR y archivos para sublimación.',
  },
  {
    q: '¿Los moldes incluyen todos los talles?',
    a: 'Sí. Cada molde incluye la curva de talles completa indicada en su ficha (por ejemplo XS a 4XL en adultos, o 2 a 18 en niños), con progresión industrial ya hecha. Comprás una vez y tenés todos los talles.',
  },
  {
    q: '¿Cómo recibo el molde después de comprar?',
    a: 'Por descarga digital. Los moldes marcados como "Descarga rápida" se habilitan apenas se confirma el pago; el resto se entrega dentro de las 24 horas. Podés comprar con cuenta o sin crear cuenta (te llega un link de descarga a tu email).',
  },
  {
    q: '¿Cómo imprimo un molde PDF A4 sin que pierda la escala?',
    a: 'Al imprimir, configurá la escala en 100% o "tamaño real" (nunca "ajustar a la página"). Cada molde incluye un cuadrado de control de medida: imprimí la primera hoja, verificá ese cuadrado con una regla, y recién después imprimí el resto. Las hojas van numeradas para pegarlas en orden.',
  },
  {
    q: '¿Qué necesito para imprimir un molde en plotter?',
    a: 'Cualquier servicio de ploteo textil puede imprimir nuestros PDF de plotter en ancho real (por ejemplo 90, 120 o 150 cm según el molde). Si preferís cortar directo en CAD, te conviene el formato DXF/AAMA o el nativo de tu sistema (Optitex, Audaces).',
  },
  {
    q: '¿Qué es el formato DXF/AAMA y qué programas lo abren?',
    a: 'DXF/AAMA es el formato estándar de intercambio de moldería digital: lo abren prácticamente todos los sistemas CAD textiles (Optitex, Gerber, Lectra, Audaces, entre otros). Si tenés un sistema CAD propio, es el formato más seguro para pedir.',
  },
  {
    q: '¿Puedo comprar desde fuera de Argentina?',
    a: 'Sí. El sitio muestra precios en dólares para compradores del exterior y la entrega es 100% digital, así que llega a cualquier país. Aceptamos medios de pago internacionales.',
  },
  {
    q: '¿Cómo sé que los moldes están bien hechos?',
    a: 'Todos los moldes se aprueban con muestra confeccionada antes de publicarse. Además tenemos una sección de Moldes Gratis para que descargues uno real y compruebes la calidad antes de comprar.',
  },
  {
    q: '¿Qué medios de pago aceptan?',
    a: 'Mercado Pago, transferencia bancaria, PayPal y criptomonedas (Binance). Para compras desde el exterior, consultanos por WhatsApp si necesitás otro medio.',
  },
  {
    q: '¿Hacen moldes a medida?',
    a: 'Sí, tenemos servicio de moldería a pedido: nos mandás tu prenda, foto o idea y desarrollamos el molde con la curva de talles que necesites, en el formato que uses (PDF, DXF, Optitex, Audaces). Se solicita desde la página "Diseño a pedido".',
  },
  {
    q: '¿Qué es el tizado (MRK) y lo venden?',
    a: 'El tizado es el acomodado de los moldes sobre el ancho de tela para cortar con el mínimo desperdicio. Ofrecemos tizadas computarizadas en formato MRK para fábricas y talleres que cortan por encimado, optimizadas al ancho de tela que indiques.',
  },
];
