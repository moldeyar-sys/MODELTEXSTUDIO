import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'como-digitalizar-patrones-de-papel',
  title: 'Cómo digitalizar patrones de papel: métodos y cuidados',
  seoTitle: 'Cómo digitalizar patrones de papel: guía completa',
  description:
    'Los tres métodos reales para pasar un molde de papel a digital: mesa digitalizadora, escaneo con vectorización, y foto cenital con escala. Cuidados clave.',
  intro:
    'Digitalizar un patrón de papel es convertir el contorno de un molde físico en un archivo vectorial que se pueda escalar, imprimir o abrir en un CAD de indumentaria. Se hace con mesa digitalizadora, con escaneo plano y vectorización, o con foto cenital y referencia de escala, y solo sirve para producir si la escala quedó exacta y las curvas suaves, no poligonales.',
  sections: [
    {
      h2: 'Qué significa digitalizar un molde y cuándo conviene',
      paragraphs: [
        'Digitalizar no es dibujar el molde de nuevo: es tomar el contorno de un molde de papel o cartón que ya existe (lo desarrolló un patronista a mano, es un molde de archivo del taller, o la base de una muestra ya aprobada) y pasarlo a un archivo vectorial editable en el software que uses, sea Optitex, Audaces, Gerber o un programa vectorial genérico.',
        'Para producir en serie tiene sentido cuando hay que escalar ese molde a toda la curva de talles en vez de progresarlo a mano talle por talle, cuando hay que tizarlo por computadora, cuando el papel original ya está gastado de tanto cortar sobre él, o para conservar en digital un desarrollo que hoy existe en un único molde de papel.',
      ],
    },
    {
      h2: 'Mesa digitalizadora: el método más preciso',
      paragraphs: [
        'La mesa digitalizadora es un tablero grande con una grilla de sensores debajo, conectado al software CAD (Optitex, Audaces, Gerber). El molde de papel se fija con cinta y se recorre el contorno, las líneas internas y los piquetes con un cursor con mira, punto por punto; el software registra cada posición en coordenadas reales y arma el contorno vectorial exacto, sin pasar por una imagen ni por un trazado a ojo.',
        'Es el método que usa la industria porque la escala sale correcta por construcción (la mesa mide en centímetros reales) y porque el archivo queda listo para progresar la curva de talles y tizar en el mismo programa. La contra es el equipo: una mesa digitalizadora es una inversión de taller o fábrica que muchos emprendimientos no tienen, y por eso recurren a los otros dos métodos o encargan la digitalización a un tercero.',
      ],
    },
    {
      h2: 'Escaneo plano y vectorización',
      paragraphs: [
        'Una pieza que entra en un escáner plano tipo A4 o A3 (cuello, puño, bolsillo, piezas chicas de bebé o niño) se escanea directo. Si es más grande que el vidrio, como un delantero de pantalón o una espalda, se escanea en partes con superposición entre tomas y después se unen en el programa, cuidando que el borde de unión no se estire ni se achique.',
        'Con la imagen en la computadora, se abre en un programa vectorial (Illustrator, CorelDRAW) o en el CAD de moldería, y se traza el contorno con la herramienta de curvas, ajustando cada nodo hasta que la línea siga el molde real sin quedar angulosa.',
        'El punto crítico es la escala: antes de escanear conviene marcar sobre el molde una línea de medida conocida (10 o 20 cm exactos), porque el escaneo puede tener una mínima deformación óptica. Esa marca sirve para calibrar la imagen antes de trazar y para chequear que el vectorizado mide lo mismo que el papel original.',
      ],
    },
    {
      h2: 'Foto cenital con referencia de escala',
      paragraphs: [
        'Cuando no hay mesa digitalizadora ni escáner a mano, o el molde es muy grande para escanear en partes (un vestido largo, un tapado, un pantalón completo), se puede fotografiar apoyado en el piso o una mesa, con la cámara justo arriba en un plano cenital, sin ángulo, y con luz pareja para que no haya sombras que confundan el borde.',
        'El paso que no se puede saltear es poner en la misma foto, sobre el mismo plano que el molde, un elemento de medida conocida: una regla, una escuadra o un cuadrado de cartón de 10 por 10 cm. El software de corrección de perspectiva usa esa referencia para calcular la escala real y enderezar la distorsión de la lente.',
        'Aun con corrección de software, este es el método con más margen de error: una cámara apenas inclinada o una arruga en el papel genera una distorsión que no siempre se corrige del todo. Conviene usarlo como recurso cuando no hay otra opción o para piezas chicas, y revisar siempre el resultado contra una medida de control.',
      ],
    },
    {
      h2: 'Cuidados clave, sea cual sea el método',
      paragraphs: [
        'Los tres métodos dan un archivo utilizable, pero ninguno sirve para cortar una tirada si no se revisa después. Antes de progresar la curva de talles o tizar, conviene chequear estos puntos:',
      ],
      bullets: [
        'Escala real: medir en el archivo digital una distancia de control (un ancho de cintura, un largo de manga) y compararla con la misma medida tomada sobre el molde de papel.',
        'Curvas suaves: sisa, escote o entrepierna tienen que quedar como curva continua, no como segmentos rectos; si se ve poligonal, hay que suavizar los puntos de control.',
        'Piquetes en su posición exacta: de ellos depende que delantero, espalda y mangas coincidan al coser.',
        'Línea de hilo: la dirección marcada en el papel tiene que trasladarse igual al archivo digital, porque define cómo se ubica la pieza sobre la tela y su caída.',
      ],
    },
    {
      h2: 'Cuándo conviene encargar la digitalización',
      paragraphs: [
        'Digitalizar bien un molde lleva tiempo, sobre todo revisar curvas y piquetes, y sin mesa digitalizadora pide método y una segunda revisión con medida de control. Si tenés que pasar a digital todo un archivo de moldes en papel, o el molde en papel es la base de un modelo que ya vende y necesitás escalarlo a toda la curva de talles, conviene sumar a alguien con el equipo correcto antes que resolverlo con una foto y buena voluntad.',
        'Modeltex ofrece moldería a pedido a partir de una prenda, una foto o una idea, y eso incluye tomar un molde de papel que ya tenés y pasarlo a digital, corregido y escalado a toda la curva de talles (adultos de XS a 4XL, niños de 2 a 18) en el formato que necesites, para quien no tiene el equipo o el tiempo de digitalizarlo puertas adentro.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Cómo digitalizar patrones de papel?',
      a: 'Con tres métodos: mesa digitalizadora, el más preciso, donde un cursor recorre el contorno sobre un tablero con sensores y el CAD arma el vectorial en escala real; escaneo plano y vectorización, escaneando en partes si la pieza es grande y trazando el contorno en un programa vectorial o en el CAD; y foto cenital con una regla o un cuadrado de medida conocida en la foto, con software que corrige la perspectiva. En los tres hay que verificar después la escala, las curvas y los piquetes antes de usar el molde para producir.',
    },
    {
      q: '¿Qué es una mesa digitalizadora y para qué sirve?',
      a: 'Es un tablero con una grilla de sensores conectado a un software de moldería (Optitex, Audaces, Gerber), sobre el que se fija el molde de papel y se recorre su contorno y sus piquetes con un cursor con mira. El software registra cada punto en coordenadas reales y genera el contorno vectorial exacto, sin foto ni escaneo de por medio. Es el equipo que usa la industria por su precisión.',
    },
    {
      q: '¿Se puede digitalizar un molde de ropa con el celular?',
      a: 'Sí, fotografiando el molde en un plano cenital, sin ángulo, con buena luz y con una regla o un cuadrado de medida conocida en la misma foto, para que el software de corrección de perspectiva calcule la escala real. Es el método con más margen de error de los tres, así que conviene revisarlo siempre contra una medida de control.',
    },
    {
      q: '¿Qué programa se usa para vectorizar un molde escaneado?',
      a: 'Programas vectoriales como Illustrator o CorelDRAW, o el CAD de moldería que uses (Optitex, Audaces, Gerber), trazando el contorno sobre la imagen escaneada con la herramienta de curvas. Antes de trazar conviene calibrar la imagen con una medida conocida marcada sobre el molde, porque el escaneo puede tener una mínima deformación óptica.',
    },
    {
      q: '¿Cómo sé si un molde digitalizado quedó con la medida correcta?',
      a: 'Midiendo en el archivo digital una distancia de control, por ejemplo un ancho de cintura, y comparándola con la misma medida tomada con cinta métrica sobre el molde de papel original. Si no coinciden, el error suele estar en la calibración de escala del escaneo o de la foto, no en el trazado de las curvas.',
    },
    {
      q: '¿Digitalizar un molde de papel reemplaza hacer el molde base en digital?',
      a: 'No, son cosas distintas. Digitalizar toma un molde que ya existe y ya fue probado, y lo pasa a un archivo vectorial para escalarlo y tizarlo; hacer el molde base en digital es dibujarlo desde cero en el CAD con una tabla de medidas. Con una muestra ya confeccionada y aprobada, digitalizar el molde suele ser más rápido que rehacerlo de cero.',
    },
  ],
  related: [
    { label: 'Cómo escalar patrones a otros talles', to: '/guias/como-escalar-patrones-de-costura' },
    {
      label: 'Cómo abrir moldes DXF en Optitex, Audaces, Gerber y Lectra',
      to: '/guias/abrir-moldes-dxf-en-optitex-audaces-gerber-lectra',
    },
    { label: 'Moldería a pedido desde una prenda, foto o idea', to: '/diseno-a-pedido' },
    { label: 'Catálogo de moldes digitales', to: '/catalogo' },
  ],
  updated: '2026-09-08',
  keywords: [
    'como digitalizar patrones de papel',
    'mesa digitalizadora de moldes',
    'escanear moldes de ropa',
    'vectorizar un molde de papel',
    'digitalizar moldes de indumentaria',
    'pasar molde de papel a digital',
    'foto cenital molde de ropa',
  ],
};
