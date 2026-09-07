import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'moldes-para-sublimacion',
  title: 'Moldes para ropa sublimada y deportiva: qué cambia y cómo producir',
  seoTitle: 'Moldes para sublimación y ropa deportiva',
  description:
    'Qué cambia en un molde para sublimar: paneles, sangrado y marcas. Telas (microfibra, suplex, poliéster), encogimiento por planchado y diseño en CDR, PLT o PDF.',
  intro:
    'Un molde para sublimación es el molde de la prenda preparado para imprimir el diseño pieza por pieza: cada panel va como archivo vectorial o PDF a escala real, con un margen de sangrado alrededor del contorno, marcas de registro y talle, y la compensación del encogimiento que produce la plancha (orientativo 1 a 3% en microfibra y jersey de poliéster). Se usa en camisetas de fútbol, uniformes deportivos y ropa de gimnasio sobre microfibra, suplex y jersey de poliéster, porque la tinta de sublimación solo fija en fibra sintética.',
  sections: [
    {
      h2: 'Qué es sublimar y por qué el molde cambia',
      paragraphs: [
        'La sublimación imprime el diseño en papel con tintas especiales y lo transfiere a la tela con calor y presión: en calandra o plancha plana, orientativo 190 a 200 °C durante 30 a 60 segundos, la tinta pasa a gas y se fija dentro de la fibra de poliéster. No queda una capa sobre la tela, por eso la prenda respira y el diseño no se cuartea ni se pela.',
        'Para una remera lisa con un logo localizado alcanza con sublimar la prenda terminada. Una camiseta de fútbol con diseño completo, degradados y números se produce al revés: primero se imprime el diseño con la forma de cada pieza del molde, se planchan los paneles sobre la tela cruda y recién después se corta y se confecciona. Por eso el molde tiene que estar explotado en paneles, en vector y a escala 1:1.',
      ],
    },
    {
      h2: 'Qué cambia en el molde: paneles, márgenes y marcas',
      paragraphs: [
        'Un molde para sublimar lleva las mismas piezas que el molde de confección (delantero, espalda, mangas, cuello, laterales o canesú si el diseño los pide), con margen de costura incluido, en general 0,7 a 1 cm en tejido de punto. La diferencia está en lo que rodea a cada pieza y en cómo se ordena.',
        'Los motivos que cruzan una costura (una franja que sigue del delantero a la manga) se diseñan con las piezas unidas en pantalla y se separan después, así el dibujo empalma al coser.',
      ],
      bullets: [
        'Sangrado: el diseño se extiende 1 a 2 cm más allá del contorno de corte (orientativo), para que un corrimiento del corte no deje bordes blancos.',
        'Marcas: piquetes, aplomos, sentido de hilo, nombre de pieza y talle impresos fuera de la línea de corte, para identificar los paneles después de planchar.',
        'Talles: cada talle es un juego de paneles distinto; el diseño se reubica o se escala en cada uno, no se copia igual.',
        'Espejado: el archivo se imprime en espejo porque el papel se apoya boca abajo sobre la tela; el RIP suele hacerlo solo, pero verificalo con textos y números.',
        'Acomodo en el papel: los paneles se ordenan al ancho del rollo (orientativo 60 a 160 cm según la impresora) para gastar el mínimo de papel y tinta.',
      ],
    },
    {
      h2: 'Telas para sublimar: microfibra, suplex y jersey de poliéster',
      paragraphs: [
        'La regla es poliéster 100% o al menos 90%, en blanco o colores muy claros: la tinta es traslúcida y no cubre fondos oscuros. La microfibra (orientativo 110 a 150 g/m2) es la tela de camisetas de fútbol y remeras deportivas por liviana y de secado rápido; el jersey de poliéster tipo set o dry fit tiene un tacto más parecido al algodón para ropa de gimnasio; el suplex y las lycras de poliéster con elastano van en calzas, tops y mallas, y el piqué de poliéster en chombas.',
        'El algodón no sublima: queda un diseño lavado que desaparece con los lavados. Las mezclas de poliéster y algodón toman color parcial, con un efecto vintage que algunas líneas usan a propósito pero que no sirve para un uniforme. Sumá malla o red de poliéster para paneles de ventilación y forros de short.',
      ],
    },
    {
      h2: 'Encogimiento por planchado y cómo compensarlo',
      paragraphs: [
        'El poliéster se mueve con el calor: en general encoge entre 1 y 3% en microfibra y jersey, y algo más en suplex y lycras con elastano (orientativo 2 a 5%), a veces distinto a lo largo que a lo ancho. Si sublimás y después cortás con el molde original, las piezas salen más chicas que el talle.',
        'La prueba es simple: marcá un cuadrado de 50 x 50 cm en la tela, planchalo con los parámetros de producción, medilo y calculá el porcentaje en cada sentido. Con ese dato agrandás el molde en el software antes de imprimir (escalado por eje si la tela encoge distinto) o preplanchás la tela para estabilizarla. Repetí la prueba con cada partida: dos rollos del mismo artículo pueden comportarse distinto.',
      ],
    },
    {
      h2: 'Cómo trabajar el diseño sobre el molde (CDR, PLT, PDF)',
      paragraphs: [
        'El flujo habitual es en CorelDRAW: importás el molde en CDR o PLT (o DXF) a escala 1:1, bloqueás la capa del molde y diseñás pieza por pieza usando el contorno como máscara, así el diseño queda recortado con la forma del panel más el sangrado. Verificá la escala midiendo una pieza conocida o el cuadro de control antes de imprimir.',
        'El archivo final va a la impresora como PDF o directo desde el RIP, con los paneles acomodados al ancho del rollo. Si trabajás en Optitex o Audaces, exportá las piezas a PLT o DXF y hacé el diseño en Corel o Illustrator; guardá cada talle como página o archivo separado, nombrado con prenda, talle y cliente, para no mezclar tandas.',
      ],
    },
    {
      h2: 'Producción: camisetas de fútbol, uniformes deportivos y ropa de gimnasio',
      paragraphs: [
        'Un pedido de camisetas de fútbol llega como lista de talles con nombre y número por jugador: cada set de paneles se imprime con su número y nombre en la espalda, se plancha sobre la microfibra, se corta y se confecciona con overlock y collareta con hilo de poliéster. La misma lógica sirve para uniformes deportivos de colegios y empresas y para ropa de gimnasio (calzas, tops y musculosas en suplex o jersey).',
        'El control de calidad se hace después de planchar y antes de cortar: fantasmas o doble imagen por movimiento del papel, líneas de cabezal, colores fuera de tono y registro entre paneles que deben empalmar. Un panel mal impreso cuesta papel y tinta; una prenda cortada y cosida con ese panel cuesta todo.',
      ],
    },
    {
      h2: 'Cómo lo resolvés con moldes digitales',
      paragraphs: [
        'Modeltex entrega moldes en formato para sublimación, con las piezas vectorizadas listas para importar en CorelDRAW (CDR, PLT o PDF a escala real) y la curva de talles completa incluida, XS a 4XL en adultos y 2 a 18 en niños, aprobada con muestra confeccionada. El mismo modelo se puede pedir en DXF/AAMA o PDS si tu taller corta en CAD.',
        'Si tenés un diseño de camiseta o conjunto deportivo propio, la moldería a pedido de Modeltex lo desarrolla desde una prenda o una foto con la tabla de medidas de tu marca, ya panelado para sublimar.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Se puede sublimar sobre algodón?',
      a: 'No. La tinta de sublimación se fija dentro de la fibra de poliéster; sobre algodón queda desteñida y se va con los lavados. Las mezclas de poliéster y algodón toman color parcial con efecto vintage. Para producción deportiva se usa poliéster 100% o al menos 90%, en blanco o tonos claros.',
    },
    {
      q: '¿Conviene sublimar antes o después de cortar?',
      a: 'Para diseños que cubren toda la prenda se sublima sobre la tela cruda con los paneles impresos con la forma del molde y su sangrado, y se corta después: así el encogimiento del planchado no deforma la pieza. Sublimar la prenda terminada se reserva para logos o estampas localizadas.',
    },
    {
      q: '¿Cuánto encoge la tela al sublimar?',
      a: 'Orientativo: entre 1 y 3% en microfibra y jersey de poliéster, y 2 a 5% en suplex y lycras con elastano, con posibles diferencias entre largo y ancho. Se mide planchando un cuadrado de 50 x 50 cm con los parámetros de producción y se compensa agrandando el molde antes de imprimir.',
    },
    {
      q: '¿Qué formato de molde necesito para diseñar en CorelDRAW?',
      a: 'Un vector a escala 1:1: CDR nativo, PLT o DXF, o un PDF vectorial. Se importa, se bloquea la capa del molde y se diseña cada pieza usando su contorno como máscara. Antes de imprimir se verifica la escala midiendo una pieza conocida o el cuadro de control.',
    },
    {
      q: '¿Qué tela se usa para camisetas de fútbol sublimadas?',
      a: 'Microfibra de poliéster, liviana y de secado rápido, orientativo 110 a 150 g/m2, en blanco para que los colores salgan fieles. Para paneles de ventilación se combina con malla de poliéster y para shorts y calzas con suplex o lycra de poliéster.',
    },
    {
      q: '¿Qué margen hay que dejar alrededor de cada pieza?',
      a: 'El molde lleva su margen de costura normal (en general 0,7 a 1 cm en tejido de punto) y, además, el diseño se extiende 1 a 2 cm más allá de la línea de corte como sangrado (orientativo), que absorbe el corrimiento del corte y evita bordes blancos en las costuras.',
    },
  ],
  related: [
    { label: 'Moldes unisex para adultos', to: '/catalogo?categoria=adultos-unisex' },
    { label: 'Moldes para hombre', to: '/catalogo?categoria=hombre' },
    { label: 'Guía: qué tela usar para cada prenda', to: '/guias/telas-por-tipo-de-prenda' },
    { label: 'Guía: formatos de moldería digital', to: '/guias/formatos-de-molderia-digital' },
    { label: 'Moldería a pedido', to: '/diseno-a-pedido' },
  ],
  updated: '2026-09-06',
  keywords: [
    'moldes para sublimación',
    'molde camiseta de fútbol',
    'moldes sublimación CDR',
    'sublimación microfibra',
    'ropa deportiva sublimada',
    'molde para sublimar PLT',
    'encogimiento sublimación poliéster',
    'uniformes deportivos sublimados',
  ],
};
