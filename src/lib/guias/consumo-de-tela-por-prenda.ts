import type { Guia } from '../guiasTypes';

export const guia: Guia = {
  slug: 'consumo-de-tela-por-prenda',
  title: 'Cómo calcular el consumo de tela por prenda con el molde o la tizada',
  seoTitle: 'Consumo de tela por prenda: cómo calcularlo para producir',
  description:
    'Cómo calcular cuánta tela lleva una prenda: largo de tizada dividido por prendas, estimación por área, consumos orientativos y cómo pasar de metros a kilos.',
  intro:
    'El consumo de tela por prenda se calcula dividiendo el largo de la tizada por la cantidad de prendas que contiene: una tizada de 7,20 m con seis remeras da 1,20 m por remera a ese ancho de tela. Sin tizada, se estima sumando el área de las piezas del molde y dividiéndola por el ancho útil y por una eficiencia orientativa (70 a 90% según la prenda). El resultado va en metros lineales o en kilos según cómo compres la tela, más una merma por fallas, empalmes y puntas.',
  sections: [
    {
      h2: 'El método base: largo de tizada dividido por prendas',
      paragraphs: [
        'La única forma exacta de saber cuánta tela consume una prenda es tizarla: acomodar todas las piezas de la curva sobre el ancho real de la tela y medir el largo que ocupan. Si la tizada mezcla talles (por ejemplo 1 S, 2 M, 2 L, 1 XL), el resultado ya es el consumo promedio de la curva, que es el número que sirve para costear. El dato vale solo para ese ancho: una tizada de pantalón hecha a 1,50 m no sirve para un rollo de 1,40 m; hay que retizar y el consumo sube algo más que la diferencia de ancho, porque cambia el encaje.',
        'Con moldes en DXF/AAMA o PDS se tiza en cualquier CAD textil (Optitex, Audaces, Gerber, Lectra) y el programa devuelve largo, eficiencia y consumo en segundos. Con moldes en PDF o cartón podés hacer una tizada manual a escala real sobre papel del ancho de la tela y medirla: más lento, pero da un número real y no una estimación.',
      ],
    },
    {
      h2: 'Si no tenés tizada: estimar por área y eficiencia',
      paragraphs: [
        'Para una cotización rápida alcanza con sumar el área de todas las piezas (en CAD la muestra el programa; a mano, aproximás cada pieza como un rectángulo y descontás un poco) y dividirla por el ancho útil y por la eficiencia esperada de tizada.',
        'Ejemplo: un jogger de adulto cuyas piezas suman 1,60 m², en un rollo de 1,60 m de ancho útil y con una eficiencia orientativa de 85%: 1,60 dividido (1,60 por 0,85) da 1,18 m lineales por prenda. Si la tela tiene pelo o hay que casar rayas, usá 75 a 80% y el consumo sube a 1,25 o 1,33 m. La estimación sirve para presupuestar y comprar la primera partida con margen; antes de una tirada grande confirmala con una tizada real, porque un 5% de diferencia se multiplica por cada prenda.',
      ],
    },
    {
      h2: 'Metros o kilos: cómo convertir',
      paragraphs: [
        'En Argentina los tejidos de punto (jersey, frisa, morley, piqué, modal, lycra, microfibra, suplex, polar) se venden en general por kilo, y los planos (gabardina, denim, popelina, lino, fibrana, crepe, sarga, bengalina) por metro. Para pasar de metros a kilos necesitás el gramaje (gramos por metro cuadrado) y el ancho: kilos por prenda es metros lineales por ancho en metros por gramaje, dividido 1.000. Una remera que consume 0,75 m de jersey 24/1 de 1,80 m de ancho abierto (0,90 m tubular) y 150 g/m²: 0,75 por 1,80 por 150 son 202 g.',
        'Al revés, metros por kilo es 1.000 dividido (gramaje por ancho): ese jersey rinde unos 3,7 m por kilo y una frisa de 300 g/m² al mismo ancho, unos 1,85 m. El gramaje real de un rollo puede diferir del nominal (un jersey vendido como de 150 g/m² puede pesar 140 o 165) y en tela por kilo eso cambia el rendimiento sin que se note en el precio: pesá un metro de largo al ancho completo de cada partida.',
      ],
    },
    {
      h2: 'Consumos orientativos por tipo de prenda',
      paragraphs: [
        'Promedios orientativos para talles adultos en tizada multitalle, con tela lisa y sin descontar encogimiento. Sirven para una primera cotización; tu molde, tu curva y tu tela pueden dar más o menos.',
        'Los talles de niños consumen bastante menos y el rango entre el 2 y el 18 es amplio: una remera talle 4 puede llevar la mitad de tela que una talle 16. En curvas infantiles calculá el promedio ponderado por la cantidad de cada talle y no uses el talle del medio.',
      ],
      bullets: [
        'Remera manga corta en jersey (1,80 m abierto o 0,90 m tubular): 0,65 a 0,80 m lineales, unos 180 a 240 g con jersey de 150 a 160 g/m².',
        'Chomba en piqué (1,80 m abierto): 0,80 a 1,00 m, unos 300 a 400 g.',
        'Buzo con capucha en frisa (1,60 a 1,80 m): 1,10 a 1,40 m, unos 550 a 750 g con frisa de 280 a 320 g/m², más el rib de puños y cintura.',
        'Jogger en frisa o rústico (1,60 a 1,80 m): 1,10 a 1,40 m, unos 500 a 700 g más el rib.',
        'Pantalón en gabardina o denim (1,50 m): 1,20 a 1,50 m según largo y talle.',
        'Short en gabardina o rústico (1,50 m): 0,55 a 0,75 m. Calza larga en lycra o suplex (1,50 a 1,60 m): 0,55 a 0,80 m.',
        'Camisa en popelina (1,50 m): 1,30 a 1,70 m.',
        'Vestido recto en fibrana, crepe o lino (1,40 a 1,50 m): 1,20 a 1,60 m; con vuelo o falda amplia, 2,50 a 3,50 m.',
      ],
    },
    {
      h2: 'Qué hace variar el consumo',
      paragraphs: [
        'Entre dos talleres que producen la misma prenda con el mismo molde el consumo puede diferir 10 o 15% por estos factores:',
        'Ninguno se ve en el molde: se ven en la tela y en la mesa de corte. Por eso el consumo se confirma partida por partida y no se copia de la tirada anterior sin mirar el rollo.',
      ],
      bullets: [
        'Talle: cada talle de adultos suma en general entre 3 y 5% de tela respecto del anterior; costear en M y producir hasta 4XL te deja corto.',
        'Rapport: rayas, cuadros y estampas que se casan en las costuras suman entre 5 y 15%.',
        'Pelo y dirección: pana, corderoy, polar, satén o estampas con sentido obligan a tizar todo hacia el mismo lado; sumá entre 3 y 10%.',
        'Encogimiento: el jersey y la frisa de algodón pueden encoger entre 3 y 8% en largo; si preencogés la tela baja el ancho útil, y si no, el molde tiene que llevar el encogimiento incorporado.',
        'Ancho útil real: orillos, bordes marcados y partidas que vienen 2 o 3 cm más angostas que lo facturado.',
        'Fallas y empalmes: fallas de tela, puntas de rollo, extremos del encimado y muestras; en general 3 a 8% de merma sobre la tela comprada.',
      ],
    },
    {
      h2: 'Cómo llevar el consumo al costeo',
      paragraphs: [
        'El costo de tela por prenda es consumo por precio unitario por (1 más la merma). Con la remera del ejemplo: 0,202 kg por el precio del kilo de jersey por 1,05 si estimás 5% de merma, siempre a precio de reposición y no al que pagaste hace tres meses. Para comprar tela para una tirada, multiplicá el consumo promedio de la curva por la cantidad de prendas y sumá la merma: comprar de más deja stock parado y comprar de menos obliga a una segunda partida que muchas veces llega de otro lote con distinto tono.',
        'Con moldería digital todo esto se hace antes de gastar un peso: los moldes de Modeltex vienen con la curva completa (XS a 4XL en adultos, 2 a 18 en niños) y en DXF/AAMA o PDS los tizás en tu CAD para ver el consumo real a tu ancho; si no tenés CAD, Modeltex arma la tizada MRK optimizada a tu tela y de ahí sale el consumo por prenda para el costeo.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Cómo se calcula el consumo de tela de una prenda?',
      a: 'Se tizan todas las piezas del molde sobre el ancho útil de la tela y se divide el largo de la tizada por la cantidad de prendas que contiene: una tizada de 7,20 m con seis remeras da 1,20 m por prenda. Sin tizada, se estima dividiendo el área de las piezas por el ancho útil y por una eficiencia orientativa de 70 a 90%, y se agrega una merma de 3 a 8%.',
    },
    {
      q: '¿Cuánta tela lleva una remera?',
      a: 'Una remera de adulto en jersey lleva en general entre 0,65 y 0,80 m lineales a 1,80 m de ancho abierto (0,90 m tubular), unos 180 a 240 g con jersey de 150 a 160 g/m². Sube con el talle, con las mangas largas y si la tela tiene estampa con dirección. Es orientativo: el número exacto lo da la tizada con tu molde y tu tela.',
    },
    {
      q: '¿Cuánta frisa se necesita para un buzo con capucha?',
      a: 'Orientativamente entre 1,10 y 1,40 m lineales a 1,60 o 1,80 m de ancho, que con frisa de 280 a 320 g/m² son unos 550 a 750 g por buzo, más el rib de puños y cintura (alrededor de 60 a 100 g). Un buzo sin capucha o de talle chico consume menos; los talles 3XL y 4XL, bastante más. Confirmalo con una tizada de la curva completa.',
    },
    {
      q: '¿Cómo paso el consumo de metros a kilos?',
      a: 'Multiplicá los metros lineales por el ancho de la tela en metros y por el gramaje en g/m², y dividí por 1.000: 0,75 m por 1,80 m por 150 g/m² da 202 g. Para saber cuántos metros rinde un kilo, dividí 1.000 por el gramaje por el ancho: un jersey de 150 g/m² a 1,80 m rinde unos 3,7 m por kilo. Usá el gramaje real de la partida, no el nominal.',
    },
    {
      q: '¿Cuánta merma de tela hay que considerar?',
      a: 'En general entre 3 y 8% sobre la tela comprada, por fallas del rollo, empalmes, puntas del encimado, muestras y diferencias de ancho; con telas de segunda selección o estampadas con fallas frecuentes puede ser más. Se agrega al consumo al costear la tela y al calcular cuánto comprar para una tirada.',
    },
    {
      q: '¿El consumo cambia según el talle?',
      a: 'Sí. En adultos cada talle suma en general entre 3 y 5% de tela respecto del anterior, así que un 4XL consume bastante más que un XS. Para costear una curva se usa el promedio ponderado por la cantidad de prendas de cada talle, que sale directo de una tizada multitalle; costear con el M y vender toda la curva subestima la tela.',
    },
  ],
  related: [
    { label: 'Qué es una tizada y cómo ahorra tela', to: '/guias/tizada-computarizada-mrk' },
    { label: 'Cómo costear una prenda', to: '/guias/costeo-de-una-prenda' },
    { label: 'Catálogo de moldes', to: '/catalogo' },
    { label: 'Moldes para emprendedores', to: '/moldes-para-emprendedores' },
    { label: 'Preguntas frecuentes', to: '/preguntas-frecuentes' },
  ],
  updated: '2026-09-06',
  keywords: [
    'consumo de tela por prenda',
    'cuánta tela lleva una remera',
    'cuánta tela lleva un buzo',
    'calcular consumo de tela',
    'consumo de tela pantalón',
    'metros por kilo de tela',
    'merma de tela',
    'costeo textil',
  ],
};
