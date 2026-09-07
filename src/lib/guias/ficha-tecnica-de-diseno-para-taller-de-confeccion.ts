import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'ficha-tecnica-de-diseno-para-taller-de-confeccion',
  title: 'Ficha técnica de diseño para taller de confección: plantilla',
  seoTitle: 'Ficha técnica de diseño: plantilla para taller de confección',
  description:
    'Qué es una ficha técnica de diseño y una plantilla completa y copiable para enviarla a un taller de confección: medidas, materiales, avíos y armado.',
  intro:
    'Una ficha técnica de diseño traduce un modelo de ropa en instrucciones exactas para que un taller de confección lo produzca sin llamados ni malentendidos: datos del modelo, dibujo técnico de frente y espalda, tabla de medidas por talle, materiales y avíos, secuencia de armado y cantidad del pedido. Se arma una vez por modelo y acompaña al molde, tanto para un lote chico como para producción en serie. Más abajo está la plantilla completa, lista para copiar.',
  sections: [
    {
      h2: 'Qué es una ficha técnica de diseño y cuándo se usa',
      paragraphs: [
        'Una ficha técnica acompaña al molde cuando un modelo pasa de la mesa de diseño al taller que lo corta y cose. Reemplaza las explicaciones orales o los mensajes sueltos de WhatsApp: pone en un solo lugar el modelo, las medidas, los materiales y el armado, para que cualquier persona del taller produzca la prenda igual a la muestra aprobada.',
        'Se usa al tercerizar un modelo nuevo, al trabajar con más de un taller, o al pasar una muestra a producción en serie. No reemplaza al molde: lo acompaña. El molde da la forma de cada pieza; la ficha da el resto de la información.',
      ],
    },
    {
      h2: 'La plantilla: las secciones que tiene que tener una ficha técnica',
      paragraphs: [
        'Estas son las secciones fijas, en el orden en que conviene completarlas. Se arma una vez por modelo, no por talle.',
      ],
      bullets: [
        'Datos generales: nombre del modelo, código interno, temporada, categoría (dama, hombre, niña, niño, bebé o unisex) y tipo de prenda, más la fecha y quién redactó la ficha.',
        'Foto o dibujo técnico de frente y espalda: croquis plano, a línea limpia, marcando costuras, pespuntes, bolsillos y ubicación de botones, logos o aplicaciones. Una foto de la muestra cosida complementa el dibujo, no lo reemplaza.',
        'Tabla de medidas por talle: cada medida clave del molde (busto, cintura, cadera, largos, ancho de espalda) en centímetros, por talle a producir. Ejemplo en la sección siguiente.',
        'Lista de materiales y avíos: tela exacta (nombre, composición, ancho, color) y avíos: hilo, botones, cierres, elástico, entretela y etiquetas. Se detalla más abajo.',
        'Secuencia de armado o notas de confección: el orden en que se arma la prenda y lo que no se ve en el molde ni en el dibujo, como el tipo de puntada por zona.',
        'Tolerancias de medida: el margen que se acepta entre la prenda terminada y la tabla de medidas, sin que se considere un defecto.',
        'Datos de contacto y cantidad del pedido: quién encarga, cantidad total y por talle, fecha de entrega y a dónde se entrega.',
      ],
    },
    {
      h2: 'Tabla de medidas por talle: cómo armarla',
      paragraphs: [
        'No hay una tabla única ni oficial: cada marca arma la suya según el calce que busca, y hasta varía entre modelos según la tela. Lo fijo es la estructura: una fila por medida y una columna por talle, en centímetros, tomada sobre la prenda terminada, no sobre el cuerpo. Como ejemplo orientativo, y no como estándar de mercado, una remera de dama en curva S a XL podría verse así:',
      ],
      bullets: [
        'Talle S: contorno de busto 92 cm, cintura 74 cm, largo total 60 cm.',
        'Talle M: contorno de busto 96 cm, cintura 78 cm, largo total 61 cm.',
        'Talle L: contorno de busto 100 cm, cintura 82 cm, largo total 62 cm.',
        'Talle XL: contorno de busto 104 cm, cintura 86 cm, largo total 63 cm.',
      ],
    },
    {
      h2: 'Por qué esos números son un ejemplo, no una norma',
      paragraphs: [
        'Esos valores muestran el formato, no una medida real de mercado: la tabla de cada fabricante depende del calce, de la tela (no es lo mismo un jersey con elastano que un tejido plano) y de la franja de talles. En Argentina existe la Ley de Talles (27.521), que crea el SUNITI, pero en la práctica cada marca sigue definiendo la suya. Lo que la ficha necesita es la tabla real de ese modelo, validada con una muestra cosida: si el molde ya trae la curva resuelta, como los moldes digitales de Modeltex, esa tabla ya existe y solo hay que volcarla en la ficha del pedido.',
      ],
    },
    {
      h2: 'Materiales y avíos: qué detallar para que no falte nada al cortar',
      paragraphs: [
        'La causa más común de que un taller frene el corte es un avío mal especificado: el color de un hilo, el diámetro de un botón, el ancho de un elástico. Cuanto más precisa la lista, menos improvisación.',
      ],
      bullets: [
        'Tela: nombre comercial, composición (algodón peinado, gabardina, piqué, corderoy), ancho de rollo y color.',
        'Hilo: título (por ejemplo 120), tipo (poliéster o algodón) y color, aclarando si el de pespunte es distinto.',
        'Botones: cantidad por prenda, diámetro en milímetros, material (nácar, poliéster o metal) y color.',
        'Cierres: tipo (invisible, de dientes o cremallera común), largo en centímetros y color.',
        'Elástico: ancho en centímetros y tipo (plano, de cordón o para pretina).',
        'Entretela, etiquetas y aplicaciones (bordado, estampa, parche): cantidad por prenda y ubicación.',
      ],
    },
    {
      h2: 'Secuencia de armado y notas de confección',
      paragraphs: [
        'Anota el orden en que se cose la prenda y lo que un operario nuevo necesita saber: qué máquina usar en cada costura, cómo se termina cada borde y cómo se plancha al final.',
        'Como ejemplo, en una remera básica: unir hombros con overlock, colocar cuello, coser mangas, cerrar costados, dobladillo con doble aguja y planchar. En modelos con una técnica particular, como un bolsillo con vista o un cierre invisible, escribir el paso a paso evita que la terminación varíe entre lotes o talleres.',
      ],
    },
    {
      h2: 'Tolerancias de medida: cuánto margen dejar',
      paragraphs: [
        'La tolerancia es el margen de diferencia entre la prenda terminada y la tabla de medidas que se acepta sin considerarlo un error, porque el corte, el tironeo de la tela y el planchado generan alguna variación mínima.',
        'Como referencia orientativa y no como norma fija, los contornos (busto, cintura, cadera) suelen tolerar alrededor de 1 cm, los largos entre 0,5 y 1 cm, y las medidas chicas (cuello, puño) entre 0,3 y 0,5 cm. Una tela con elastano admite un rango más amplio que un tejido plano rígido, y cada fabricante ajusta el suyo según su experiencia.',
      ],
    },
    {
      h2: 'En qué formato armar la ficha y cómo enviarla',
      paragraphs: [
        'La ficha no necesita un programa especial: alcanza con Word o Excel para completarla y un PDF para enviarla. Una o dos páginas por modelo son suficientes si cada sección va directo al dato.',
        'Se envía junto con el molde, sea el patrón propio o un molde digital comprado, como los del catálogo de Modeltex, que ya trae la curva de talles resuelta: ahí la ficha solo agrega tela, avíos, cantidad y fecha de entrega. Si el modelo todavía no tiene molde, conviene resolver esa parte primero, incluso con moldería a pedido a partir de una prenda, foto o idea.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Cómo redactar una ficha técnica de diseño para enviar a un taller de confección?',
      a: 'Con siete secciones fijas en una o dos páginas: datos generales, foto o dibujo técnico de frente y espalda, tabla de medidas por talle, materiales y avíos, secuencia de armado, tolerancias de medida y datos de contacto con la cantidad del pedido. Se completa una vez por modelo y se envía en PDF junto con el molde.',
    },
    {
      q: '¿Qué diferencia hay entre una ficha técnica y el molde de un modelo?',
      a: 'El molde define la forma exacta de cada pieza, en papel, cartón o archivo digital. La ficha técnica acompaña a ese molde con lo que el patrón solo no transmite: materiales, avíos, tolerancias, armado y cantidad del pedido. Se envían siempre juntos.',
    },
    {
      q: '¿Es obligatorio poner una foto o alcanza con el dibujo técnico?',
      a: 'El dibujo técnico es la parte indispensable, porque muestra a línea limpia detalles que una foto no deja ver con precisión, como la ubicación exacta de un botón o un pespunte. La foto de una muestra cosida es un buen complemento, pero no lo reemplaza.',
    },
    {
      q: '¿Qué pasa si no incluyo la lista de materiales y avíos en la ficha?',
      a: 'El taller suele frenar el corte para consultar el dato que falta, o improvisa un avío parecido que cambia el resultado respecto de la muestra aprobada. Detallar tela, hilo, botones y cierres evita esas demoras.',
    },
    {
      q: '¿Cuánta tolerancia de medida es normal dejar en una ficha técnica?',
      a: 'Como referencia orientativa, los contornos suelen tolerar alrededor de 1 cm, los largos entre 0,5 y 1 cm, y medidas chicas como cuello o puño entre 0,3 y 0,5 cm. No es una norma fija: cada fabricante define su margen según la tela y lo valida con la muestra cosida.',
    },
    {
      q: '¿La ficha técnica sirve también si compro un molde digital ya hecho?',
      a: 'Sí, y se simplifica: si el molde ya trae la curva de talles resuelta, como los moldes digitales de Modeltex, la tabla de medidas de la ficha se completa directo con esos datos. Solo falta agregar tela, avíos, cantidad y fecha de entrega.',
    },
  ],
  related: [
    { label: 'Tabla de medidas industriales', to: '/guias/tabla-de-medidas-industriales' },
    { label: 'Tabla de medidas S a XL para dama, hombre y niño', to: '/guias/tabla-de-medidas-s-a-xl-dama-hombre-nino' },
    { label: 'Moldería a pedido con tu tabla de medidas', to: '/diseno-a-pedido' },
    { label: 'Catálogo de moldes con curva de talles', to: '/catalogo' },
  ],
  updated: '2026-09-08',
  keywords: [
    'ficha técnica de diseño',
    'cómo redactar una ficha técnica de diseño',
    'ficha técnica para taller de confección',
    'plantilla de ficha técnica de indumentaria',
    'tabla de medidas por talle',
    'tolerancias de medida en confección',
    'materiales y avíos de una prenda',
    'ficha técnica de un modelo de ropa',
  ],
};
