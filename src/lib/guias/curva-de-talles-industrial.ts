import type { Guia } from '../guiasTypes';

export const guia: Guia = {
  slug: 'curva-de-talles-industrial',
  title: 'Curva de talles para producción: cómo se arma y cómo elegirla',
  seoTitle: 'Curva de talles industrial: cómo se arma y elegirla',
  description:
    'Qué es la curva de talles y la progresión industrial, curvas XS a 4XL y 2 a 18, cómo repartir una tirada por talle, Ley 27.521 y SUNITI, y talles para uniformes.',
  intro:
    'La curva de talles es el conjunto de talles en que se produce un modelo, y se arma progresando (escalando) el molde del talle base con incrementos definidos en cada punto de la pieza según una tabla de medidas. Para vender conviene tener la curva completa disponible (XS a 4XL en adultos, 2 a 18 en niños) y repartir la tirada según tu público: en dama, los talles S, M y L suelen concentrar entre el 60 y el 70 por ciento de las unidades, aunque el reparto exacto depende de a quién le vendés y de tu historial.',
  sections: [
    {
      h2: 'Qué es la progresión y por qué no es agrandar el molde',
      paragraphs: [
        'Progresar (o escalar) un molde es generar los demás talles a partir del talle base moviendo cada punto de la pieza una distancia definida por una regla. El contorno de pecho de un talle al siguiente crece en general 4 cm en dama y entre 4 y 6 cm en hombre, pero ese crecimiento se reparte entre delantero, trasero y manga, y se combina con incrementos distintos de largo, de sisa y de cuello. Por eso un molde no se agranda al 105 por ciento en la fotocopiadora: el cuerpo no crece igual en todas las direcciones, y una remera escalada así queda larga y con la sisa deformada.',
        'Las reglas de progresión salen de una tabla de medidas: una por cliente, marca o mercado. En CAD (Optitex, Audaces, Gerber, Lectra) cada punto lleva su regla y el programa genera la curva completa; a mano se hace punto por punto con las mismas reglas. En los extremos de la curva (3XL y 4XL) muchas tablas aumentan el salto de contorno, porque el cuerpo crece más en circunferencia que en altura, y ahí la progresión deja de ser lineal.',
        'La progresión industrial se valida con muestra: se confecciona el talle base y por lo menos un extremo, y se corrige la tabla si el calce cambia. Un molde con la curva ya progresada y aprobada te ahorra ese desarrollo, que es lo que más tiempo lleva en un modelo nuevo.',
      ],
    },
    {
      h2: 'Curvas XS a 4XL y 2 a 18: qué cubre cada una',
      paragraphs: [
        'En adultos la curva por letras estándar va de XS a 4XL: XS, S, M, L, XL, XXL, 3XL y 4XL, ocho talles. Cubre desde un contorno chico de dama hasta talles especiales, y es la que piden los mayoristas que arman packs surtidos y la que necesita cualquier marca que quiera cumplir con la oferta de talles que promueve la ley argentina. Las equivalencias con talles numéricos (36 a 52 en dama, 38 a 56 en pantalón de hombre) son aproximadas y cambian entre marcas; lo que manda es la tabla de medidas en centímetros.',
        'En niños la curva industrial va del 2 al 18 en pasos de dos (2, 4, 6, 8, 10, 12, 14, 16 y 18), nueve talles. El número indica orientativamente la edad, y muchas tablas lo asocian a una estatura (un talle 8 ronda los 128 cm, un 12 los 152), pero lo que define el talle es la medida, no la edad. Del 14 en adelante los talles de niño se superponen con XS y S de adulto, algo que importa en uniformes de secundaria.',
        'Bebés se maneja aparte, por meses o por estatura, con progresiones más cortas. En Modeltex cada molde incluye la curva completa de su categoría en una sola compra: los ocho talles de adulto o los nueve de niño, con la progresión hecha y aprobada con muestra.',
      ],
    },
    {
      h2: 'Por qué producir toda la curva (y cuándo no)',
      paragraphs: [
        'Producir toda la curva tiene un motivo comercial: el mayorista compra por curva, no por prenda suelta. La curva de seis más común en el mercado argentino es 1 S, 2 M, 2 L y 1 XL; también se arman curvas de 8 o de 12 sumando XS, XXL y 3XL. Si tu modelo no tiene XL o XXL, el pack no se arma y la venta se cae. En venta directa pasa algo parecido: un talle faltante es un cliente que se va y no vuelve a preguntar.',
        'El costo de los extremos es real pero acotado. Un 4XL consume más tela que un M (en general entre 15 y 30 por ciento más según la prenda, orientativo) y los talles chicos y grandes rotan más lento. La respuesta no es dejar de producirlos, sino producirlos en menos cantidad y reponer cuando se agotan.',
        'Cuándo no producir toda la curva: en una cápsula muy chica de prueba (menos de 50 unidades), donde conviene concentrar en los centrales y sumar extremos recién con la primera reposición; en productos de nicho con público conocido (indumentaria de un club, donde ya tenés los talles del plantel); o en preventa, donde cortás solo lo pedido. En todos los casos conviene tener la curva completa en el molde para reaccionar sin desarrollar de nuevo.',
      ],
    },
    {
      h2: 'Cómo repartir una tirada por talle',
      paragraphs: [
        'El reparto por talle es una decisión de venta, no de moldería, y se ajusta con historial. Si arrancás sin datos, las distribuciones de abajo son un punto de partida orientativo para indumentaria general en Argentina; una marca de talles especiales, deportiva o de uniformes va a tener curvas muy distintas.',
        'El método que funciona en producción es cortar la primera tirada con una curva conservadora, registrar qué talles se agotan primero y corregir la segunda. Si los M y L se van en la primera semana y los XS quedan, la próxima tirada mueve puntos hacia el centro. Con tizada computarizada esto se traduce en cantidades por talle que le pasás a quien tiza, y el rendimiento de tela suele mejorar cuando mezclás talles grandes con chicos en la misma tizada.',
      ],
      bullets: [
        'Dama, XS a 4XL: XS 5, S 20, M 30, L 25, XL 12, XXL 5, 3XL 2 y 4XL 1 por ciento.',
        'Hombre, XS a 4XL: XS 2, S 10, M 25, L 30, XL 18, XXL 9, 3XL 4 y 4XL 2 por ciento.',
        'Niños, 2 a 18: talles 2 y 4 entre 8 y 12 por ciento cada uno, del 6 al 12 entre 13 y 15 cada uno, del 14 al 18 entre 5 y 11 cada uno. En uniformes de primaria se concentra entre el 6 y el 12.',
        'Ejemplo: 200 remeras de dama con la curva de arriba serían 10 XS, 40 S, 60 M, 50 L, 24 XL, 10 XXL, 4 de 3XL y 2 de 4XL.',
      ],
    },
    {
      h2: 'Talles para uniformes escolares y de trabajo',
      paragraphs: [
        'Los uniformes son el caso donde la curva más pesa, porque se produce por lote para un grupo cerrado: un colegio, una empresa. En escolares la curva cruza niños y adultos: jardín e inicial en talles 2 a 6, primaria del 6 al 14, secundaria del 12 al 18 más XS a XL de adulto para los últimos años y docentes. Lo ideal es tomar medidas o pasar una tabla de medidas con la orden, porque un talle 10 de una marca puede ser un 12 de otra.',
        'En uniformes de trabajo la curva es de adulto y suele cargarse hacia L, XL y XXL en hombre, con algo de XS y 4XL que hay que cubrir sí o sí: en una planta nadie puede quedarse sin ropa de trabajo por su talle. La práctica habitual es cotizar la curva completa con un muestrario de talles (una prenda por talle para que cada persona se pruebe) y producir sobre el listado confirmado, no sobre estimaciones.',
        'Para producir uniformes con moldes digitales hace falta, además de la curva amplia, que el modelo sea el mismo en niños y adultos para bordar y sublimar sin rediseñar en cada tamaño. Modeltex publica moldes de uniformes escolares y de trabajo (chombas, buzos, joggings, pantalones, guardapolvos) con curva de niños y de adultos, y desarrolla a pedido curvas con la tabla de medidas del colegio o de la empresa.',
      ],
    },
    {
      h2: 'Ley 27.521 y el SUNITI: qué cambia para el que produce',
      paragraphs: [
        'La Ley 27.521, sancionada en 2019, creó el Sistema Único Normalizado de Identificación de Talles de Indumentaria (SUNITI), con el objetivo de que los talles de ropa se identifiquen de manera uniforme entre marcas, sobre la base de un estudio antropométrico de la población argentina, y de que la oferta de talles sea más amplia. Su aplicación práctica y sus plazos fueron cambiando desde la sanción, así que conviene confirmar el estado vigente antes de etiquetar.',
        'Para quien produce, lo que la ley empuja en términos generales es a trabajar con tablas de medidas en centímetros, a informar el talle de manera clara en la etiqueta y a no reducir la oferta a tres o cuatro talles centrales. Una moldería con curva completa y progresión coherente con una tabla de medidas es lo que permite cumplir sin rehacer los moldes.',
      ],
    },
    {
      h2: 'Cómo lo resolvés con moldes digitales',
      paragraphs: [
        'Con moldes digitales la curva ya viene hecha: comprás el modelo una vez y tenés los ocho talles de adulto o los nueve de niño, en PDF para cortar a mano o en DXF/AAMA, PDS y ADS para tu CAD. Cortás solo los talles que la tirada necesita y, cuando un talle se agota, reponés sin desarrollar nada.',
        'Si tu marca tiene tabla de medidas propia o necesitás una curva más amplia o más corta, el camino es la moldería a pedido de Modeltex: se desarrolla el molde con tu tabla y la curva que definas, y se aprueba con muestra. Y si cortás por encimado, la tizada computarizada toma las cantidades por talle que decidiste y las acomoda al ancho de tu tela.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Qué es la curva de talles de una prenda?',
      a: 'Es el conjunto de talles en que se produce un modelo, por ejemplo XS a 4XL en adultos o 2 a 18 en niños, y la cantidad de prendas de cada uno dentro de una tirada. En moldería, la curva se obtiene progresando el talle base con reglas de escalado que salen de una tabla de medidas; en venta, "curva" también nombra el pack surtido que compra un mayorista, por ejemplo 1 S, 2 M, 2 L y 1 XL.',
    },
    {
      q: '¿Cuántos talles tengo que producir para vender por mayor?',
      a: 'Como mínimo la curva que arma el pack que compra tu cliente: en indumentaria general argentina lo habitual es una curva de seis (S a XL) o de ocho (XS a XXL), y cada vez más se pide hasta 3XL o 4XL. Tener el molde con la curva completa te permite responder a cualquiera de esas sin desarrollar nuevos talles; después decidís cuántas unidades cortás de cada uno.',
    },
    {
      q: '¿Cómo calculo cuántas prendas hacer de cada talle?',
      a: 'Con tu historial de ventas si lo tenés, y si no con una distribución orientativa que concentre entre el 60 y el 70 por ciento en los talles centrales (S, M y L en dama; M, L y XL en hombre) y reparta el resto en los extremos. Cortá la primera tirada con esa curva, anotá qué talles se agotan primero y corregí la siguiente. En uniformes, en cambio, se produce sobre el listado de talles confirmado.',
    },
    {
      q: '¿Puedo agrandar un molde a otro talle escalándolo en el PDF o en la fotocopiadora?',
      a: 'No. Un escalado proporcional agranda todo por igual y el cuerpo no crece así: entre un talle y el siguiente el contorno crece unos 4 a 6 cm pero el largo solo 1 o 2, y la sisa, el cuello y el hombro tienen sus propios incrementos. Una remera escalada al 105 por ciento queda demasiado larga y con la sisa deformada. Los talles se obtienen con reglas de progresión sobre cada punto, que es lo que trae un molde con curva industrial.',
    },
    {
      q: '¿Qué dice la Ley 27.521 de talles para un fabricante de ropa?',
      a: 'En términos generales, la Ley 27.521 (2019) crea el SUNITI, un sistema único para identificar los talles de indumentaria en Argentina a partir de un estudio antropométrico, con el objetivo de que un talle signifique lo mismo en todas las marcas y de ampliar la oferta de talles. Para el productor implica trabajar con tablas de medidas en centímetros y etiquetar con claridad. Su aplicación y plazos fueron cambiando, así que verificá el estado vigente.',
    },
    {
      q: '¿Qué curva de talles conviene para uniformes escolares?',
      a: 'Una que cruce niños y adultos: del 2 al 6 para jardín e inicial, del 6 al 14 para primaria y del 12 al 18 más XS a XL de adulto para secundaria y docentes. Como los talles varían entre marcas, conviene pasar al colegio una tabla de medidas o un muestrario para que cada alumno se pruebe, y producir sobre el listado confirmado. El molde tiene que tener las dos curvas para que la prenda sea la misma en todos los tamaños.',
    },
  ],
  related: [
    { label: 'Cómo producir uniformes escolares y de trabajo', to: '/guias/uniformes-escolares-y-de-trabajo' },
    { label: 'Qué es una tizada MRK y cómo ahorra tela', to: '/guias/tizada-computarizada-mrk' },
    { label: 'Moldería a pedido con tu tabla de medidas', to: '/diseno-a-pedido' },
    { label: 'Moldes para dama', to: '/catalogo?categoria=dama' },
    { label: 'Moldes para niño', to: '/catalogo?categoria=nino' },
  ],
  updated: '2026-09-06',
  keywords: [
    'curva de talles',
    'progresión de talles',
    'escalado de moldes',
    'talles XS a 4XL',
    'talles de niños 2 a 18',
    'ley 27.521 talles',
    'SUNITI',
    'distribución de talles por tirada',
  ],
};
