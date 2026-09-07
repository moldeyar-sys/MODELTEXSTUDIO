// /llms-full.txt: todo el contenido del sitio en un solo archivo de texto
// para asistentes de IA (complementa /llms.txt, que es el resumen). Incluye
// las guias (resumen), las preguntas frecuentes y los 2.000+ productos con su
// descripcion y precio, generado al vuelo desde Supabase con cache de 1 hora.
//
// Los datos de guias y FAQ estan duplicados aca a proposito (fuente de verdad:
// src/lib/guiasData.ts y src/lib/faqData.ts) en vez de importados: las
// funciones serverless de Vercel de este proyecto fallan en produccion
// (FUNCTION_INVOCATION_FAILED) al importar codigo fuera de api/, aunque el
// build y el typecheck locales no muestren ningun error.

const SITE_URL = 'https://modeltex.com.ar';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';

const CATEGORY_LABEL: Record<string, string> = {
  dama: 'Dama',
  hombre: 'Hombre',
  nina: 'Niña',
  nino: 'Niño',
  bebes: 'Bebés',
  'adultos-unisex': 'Adultos unisex',
  'ninos-unisex': 'Niños unisex',
};

const CATEGORY_TITLE_SUFFIX: Record<string, string> = {
  dama: 'para dama',
  hombre: 'para hombre',
  nina: 'para niña',
  nino: 'para niño',
  bebes: 'para bebés',
  'adultos-unisex': 'unisex para adultos',
  'ninos-unisex': 'unisex para niños',
};

const GUIAS_LITE = [
  {
    slug: 'formatos-de-molderia-digital',
    title: 'Qué formato de molde conviene para tu taller o fábrica',
    intro:
      'El formato se elige por cómo cortás y cuánto repetís cada modelo. Si cortás a mano, el PDF A4 sirve para muestras y tiradas chicas, el PDF plotter es el estándar de producción y el cartón conviene cuando un modelo se repite durante meses. Si tenés sistema CAD o cortadora automática, pedí DXF/AAMA (lo importa cualquier programa) o el nativo de tu sistema (PDS de Optitex, ADS de Audaces), y si cortás por encimado, una tizada MRK ya acomodada a tu ancho de tela.',
  },
  {
    slug: 'telas-por-tipo-de-prenda',
    title: 'Qué tela usar para cada tipo de prenda al producir',
    intro:
      'La tela se elige según la prenda y según la familia para la que fue pensado el molde: remeras, buzos, joggers y calzas van en tejidos de punto (jersey, frisa, rústico, morley, lycra) y camisas, pantalones de vestir, guardapolvos y camperas en tejidos planos (popelina, gabardina, denim, sarga, rompeviento). Al producir en serie importan además el gramaje, el ancho del rollo, el encogimiento y la estabilidad del color, porque de eso dependen el consumo, el talle final y los reclamos.',
  },
  {
    slug: 'curva-de-talles-industrial',
    title: 'Curva de talles para producción: cómo se arma y cómo elegirla',
    intro:
      'La curva de talles es el conjunto de talles en que se produce un modelo, y se arma progresando (escalando) el molde del talle base con incrementos definidos en cada punto de la pieza según una tabla de medidas. Para vender conviene tener la curva completa disponible (XS a 4XL en adultos, 2 a 18 en niños) y repartir la tirada según tu público: en dama, los talles S, M y L suelen concentrar entre el 60 y el 70 por ciento de las unidades, aunque el reparto exacto depende de a quién le vendés y de tu historial.',
  },
  {
    slug: 'consumo-de-tela-por-prenda',
    title: 'Cómo calcular el consumo de tela por prenda con el molde o la tizada',
    intro:
      'El consumo de tela por prenda se calcula dividiendo el largo de la tizada por la cantidad de prendas que contiene: una tizada de 7,20 m con seis remeras da 1,20 m por remera a ese ancho de tela. Sin tizada, se estima sumando el área de las piezas del molde y dividiéndola por el ancho útil y por una eficiencia orientativa (70 a 90% según la prenda). El resultado va en metros lineales o en kilos según cómo compres la tela, más una merma por fallas, empalmes y puntas.',
  },
  {
    slug: 'costeo-de-una-prenda',
    title: 'Cómo costear una prenda para producir y vender',
    intro:
      'El costo de una prenda es la suma de la tela (consumo más merma), los avíos, el corte, la confección o facón, la terminación, la estampa, el packaging y una parte proporcional del molde, las muestras, la logística y la estructura. Sobre ese total se aplica el margen: en el mercado argentino el precio mayorista suele ubicarse entre 1,6 y 2,2 veces el costo y el minorista entre 2 y 2,5 veces el mayorista, valores orientativos que cada canal ajusta. Costear bien es costear la curva completa y a precio de reposición.',
  },
  {
    slug: 'tizada-computarizada-mrk',
    title: 'Qué es una tizada (marker) y cómo ahorra tela en el corte',
    intro:
      'Una tizada (marker) es el acomodo de todas las piezas de los moldes de una tirada sobre el ancho real de la tela, listo para encimar y cortar varias capas de una vez. Se mide por su eficiencia, el porcentaje del rectángulo de tela que ocupan las piezas, que en producción suele estar entre 70 y 90% según la prenda. Hecha en computadora ahorra en general entre 5 y 10% de tela frente al acomodo a mano y da el consumo exacto por prenda antes de comprar el rollo.',
  },
  {
    slug: 'impresion-de-moldes-en-plotter',
    title: 'Cómo imprimir moldes en plotter para un taller de confección',
    intro:
      'Un molde PDF para plotter se imprime en una gráfica de ploteo o en un plotter propio, sobre rollo de 90, 120 o 150 cm de ancho, siempre a escala 100% y verificando el cuadro de control con una regla antes de cortar. Es el formato habitual del taller que corta a mano o por encimado: cada pieza sale entera, sin pegar hojas, y el papel se puede pasar a cartón o reimprimir cuando se gasta.',
  },
  {
    slug: 'abrir-moldes-dxf-en-optitex-audaces-gerber-lectra',
    title: 'Cómo abrir un molde DXF/AAMA en Optitex, Audaces, Gerber y Lectra',
    intro:
      'Un DXF/AAMA no se abre con Abrir sino con la función de importación de cada programa: Archivo > Importar > DXF en Optitex y en Audaces Moldes, la utilidad de conversión (Data Conversion Utility o Importar/Exportar, según versión) en Gerber AccuMark, y Archivo > Importar en Lectra Modaris. En los cuatro lo que define el resultado es lo mismo: elegir la unidad correcta (centímetros, milímetros o pulgadas), no aplicar ninguna escala, mapear bien las capas de piquetes y sentido de hilo, y medir una pieza contra la ficha técnica antes de cortar.',
  },
  {
    slug: 'armar-una-coleccion-con-moldes-digitales',
    title: 'Cómo armar una colección de ropa para vender con moldes digitales',
    intro:
      'Una colección para vender se arma a partir de pocos moldes base, en general 3 a 6, que se transforman en variantes de tela, color, largo o detalle hasta llegar a 8 a 15 modelos, con la curva de talles decidida modelo por modelo. Con moldes digitales que ya traen la curva escalada y están aprobados con muestra, el trabajo deja de ser desarrollar moldería y pasa a ser elegir qué producir, en qué cantidades y por qué canal venderlo.',
  },
  {
    slug: 'uniformes-escolares-y-de-trabajo',
    title: 'Cómo producir uniformes escolares y de trabajo con moldes digitales',
    intro:
      'Para producir uniformes escolares y de trabajo necesitás moldes con curva de talles amplia (niños 2 a 18 y adultos XS a 4XL), telas estables que aguanten lavado frecuente (piqué, frisa, gabardina, popelina, rústico) y un esquema de trabajo por tandas, donde cada colegio o empresa es un pedido con sus colores, su logo y su distribución de talles. Los moldes digitales resuelven la parte más lenta, que es tener toda la curva progresada y probada, y te dejan concentrarte en cotizar bien y cumplir el plazo.',
  },
  {
    slug: 'moldes-para-sublimacion',
    title: 'Moldes para ropa sublimada y deportiva: qué cambia y cómo producir',
    intro:
      'Un molde para sublimación es el molde de la prenda preparado para imprimir el diseño pieza por pieza: cada panel va como archivo vectorial o PDF a escala real, con un margen de sangrado alrededor del contorno, marcas de registro y talle, y la compensación del encogimiento que produce la plancha (orientativo 1 a 3% en microfibra y jersey de poliéster). Se usa en camisetas de fútbol, uniformes deportivos y ropa de gimnasio sobre microfibra, suplex y jersey de poliéster, porque la tinta de sublimación solo fija en fibra sintética.',
  },
  {
    slug: 'glosario-de-molderia',
    title: 'Glosario de moldería y producción textil',
    intro:
      'Este glosario reúne los términos que se usan a diario en moldería, corte y confección industrial en Argentina, cada uno definido en una a tres oraciones, para leer una ficha técnica o hablar con un taller, una gráfica de ploteo o un tizador sin ambigüedades. Está ordenado por tema: molde, talles, tela, corte y tizada, confección y costeo, y formatos digitales, tal como aparecen en las fichas de Modeltex.',
  },
];

const FAQ_ITEMS = [
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
];

interface Row {
  name: string;
  slug: string;
  category?: string | null;
  garment_type?: string | null;
  short_description?: string | null;
  sizes?: string[] | null;
  precio_pdf_a4?: number | null;
  price?: number | null;
  precio_usd_pdf_a4?: number | null;
}

const PAGE = 1000;

async function fetchProducts(): Promise<Row[]> {
  const out: Row[] = [];
  try {
    for (let offset = 0; ; offset += PAGE) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=name,slug,category,garment_type,short_description,sizes,precio_pdf_a4,price,precio_usd_pdf_a4` +
          `&is_active=eq.true&order=category.asc,name.asc&limit=${PAGE}&offset=${offset}`,
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
      );
      if (!res.ok) break;
      const rows = (await res.json()) as Row[];
      if (!Array.isArray(rows)) break;
      out.push(...rows);
      if (rows.length < PAGE) break;
    }
  } catch {
    /* se devuelve lo que se alcanzó a juntar */
  }
  return out;
}

function ars(n: unknown): string {
  const v = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(v) && v > 0 ? `$${String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ARS` : '';
}

function oneLine(s: string | null | undefined): string {
  return (s || '').replace(/\s+/g, ' ').trim();
}

// MODELTEX LAB: a diferencia de las guías (estáticas, arriba), el curso vive
// en Supabase (tablas lab_*) porque el admin lo carga/edita sin tocar código.
// Se trae por REST directo, mismo criterio que el catálogo de este archivo.
interface LabCourseLite { id: string; slug: string; title: string; subtitle?: string | null }
interface LabModuleLite { id: string; course_id: string; slug: string; title: string }
interface LabLessonLite { module_id: string; slug: string; title: string; objective?: string | null }
interface LabGlossaryLite { slug: string; term: string; short_definition?: string | null }

async function fetchLabContent() {
  try {
    const headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` };
    const [coursesRes, glossaryRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/lab_courses?select=id,slug,title,subtitle&status=eq.published&order=order_index.asc`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/lab_glossary_terms?select=slug,term,short_definition&status=eq.published&order=order_index.asc`, { headers }),
    ]);
    const courses = coursesRes.ok ? ((await coursesRes.json()) as LabCourseLite[]) : [];
    const glossary = glossaryRes.ok ? ((await glossaryRes.json()) as LabGlossaryLite[]) : [];
    if (courses.length === 0) return { courses: [], modules: [] as LabModuleLite[], lessons: [] as LabLessonLite[], glossary };

    const modulesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/lab_modules?select=id,course_id,slug,title&course_id=in.(${courses.map((c) => c.id).join(',')})&status=eq.published&order=level_order.asc,order_index.asc`,
      { headers },
    );
    const modules = modulesRes.ok ? ((await modulesRes.json()) as LabModuleLite[]) : [];

    let lessons: LabLessonLite[] = [];
    if (modules.length > 0) {
      const lessonsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/lab_lessons?select=module_id,slug,title,objective&module_id=in.(${modules.map((m) => m.id).join(',')})&status=eq.published&order=order_index.asc`,
        { headers },
      );
      lessons = lessonsRes.ok ? ((await lessonsRes.json()) as LabLessonLite[]) : [];
    }

    return { courses, modules, lessons, glossary };
  } catch {
    return { courses: [] as LabCourseLite[], modules: [] as LabModuleLite[], lessons: [] as LabLessonLite[], glossary: [] as LabGlossaryLite[] };
  }
}

export default async function handler(_req: unknown, res: any) {
  let products: Row[] = [];
  const lines: string[] = [];

  try {
    products = await fetchProducts();

    lines.push('# Modeltex — moldería digital para producción textil (contenido completo)');
    lines.push('');
    lines.push(
      `> Modeltex (${SITE_URL}) vende moldes de ropa digitales como insumo de producción para fabricantes, talleres, marcas y emprendedores. ` +
        `Más de ${products.length ? products.length.toLocaleString('es-AR') : '2.000'} moldes de dama, hombre, niña, niño, bebés y unisex, ` +
        'cada uno con la curva de talles completa (adultos XS a 4XL, niños 2 a 18) y aprobado con muestra confeccionada. ' +
        'Formatos: PDF A4, PDF plotter (90, 120 o 150 cm), cartón, DXF/AAMA, PDS (Optitex), MRK (tizadas), ADS (Audaces), PLT, CDR y sublimación. ' +
        'Pagos con Mercado Pago, transferencia, PayPal, Payoneer, Wise y cripto; entrega por descarga digital a todo el mundo. WhatsApp +54 9 11 6653 1086.',
    );
    lines.push('');
    lines.push('## Páginas principales');
    lines.push(`- Catálogo completo: ${SITE_URL}/catalogo`);
    for (const [k, v] of Object.entries(CATEGORY_LABEL)) lines.push(`- Moldes ${CATEGORY_TITLE_SUFFIX[k] || v}: ${SITE_URL}/catalogo?categoria=${k}`);
    lines.push(`- Moldes gratis para probar la calidad: ${SITE_URL}/moldes-gratis`);
    lines.push(`- Moldería a pedido (moldes a medida): ${SITE_URL}/diseno-a-pedido`);
    lines.push(`- MODELTEX LAB — Curso Gratis de Moldería Textil: ${SITE_URL}/lab`);
    lines.push(`- Preguntas frecuentes: ${SITE_URL}/preguntas-frecuentes`);
    lines.push(`- Guías para producción: ${SITE_URL}/guias`);
    lines.push(`- Contacto: ${SITE_URL}/contacto`);
    lines.push('');

    const lab = await fetchLabContent();
    lines.push('## MODELTEX LAB — Curso Gratis de Moldería Textil');
    lines.push(
      `> Modeltex tiene un curso gratuito de moldería textil (${SITE_URL}/lab), estructurado como curso real ` +
        '(curso → módulos → clases), desde fundamentos hasta producción industrial, con moldes gratis para practicar ' +
        `y una IA tutora (${SITE_URL}/lab/ia) que responde dudas con el contenido del curso.`,
    );
    if (lab.courses.length === 0) {
      lines.push('(Curso en preparación: todavía no hay módulos publicados.)');
    } else {
      const modulesByCourse = new Map<string, LabModuleLite[]>();
      for (const m of lab.modules) modulesByCourse.set(m.course_id, [...(modulesByCourse.get(m.course_id) || []), m]);
      const lessonsByModule = new Map<string, LabLessonLite[]>();
      for (const l of lab.lessons) lessonsByModule.set(l.module_id, [...(lessonsByModule.get(l.module_id) || []), l]);

      for (const c of lab.courses) {
        lines.push('');
        lines.push(`### ${c.title}${c.subtitle ? ` — ${oneLine(c.subtitle)}` : ''}`);
        lines.push(`URL: ${SITE_URL}/lab/${c.slug}`);
        for (const m of modulesByCourse.get(c.id) || []) {
          for (const l of lessonsByModule.get(m.id) || []) {
            lines.push(
              `- ${oneLine(l.title)} (${m.title})${l.objective ? ` — ${oneLine(l.objective)}` : ''} — ${SITE_URL}/lab/${c.slug}/${m.slug}/${l.slug}`,
            );
          }
        }
      }
      if (lab.glossary.length > 0) {
        lines.push('');
        lines.push(`#### Glosario (${SITE_URL}/lab/glosario)`);
        for (const g of lab.glossary) lines.push(`- ${g.term}${g.short_definition ? `: ${oneLine(g.short_definition)}` : ''}`);
      }
    }
    lines.push('');

    lines.push('## Guías para producir ropa con moldes digitales');
    for (const g of GUIAS_LITE) {
      lines.push('');
      lines.push(`### ${g.title}`);
      lines.push(`URL: ${SITE_URL}/guias/${g.slug}`);
      lines.push(oneLine(g.intro));
    }
    lines.push('');

    lines.push('## Preguntas frecuentes');
    for (const f of FAQ_ITEMS) lines.push(`P: ${oneLine(f.q)}\nR: ${oneLine(f.a)}`);
    lines.push('');

    lines.push(`## Catálogo (${products.length} moldes activos)`);
    lines.push('Cada línea: nombre — tipo de prenda — categoría — talles — precio del PDF A4 (todos los talles incluidos) — descripción — URL.');
    let currentCat = '';
    for (const p of products) {
      const cat = p.category || '';
      if (cat !== currentCat) {
        currentCat = cat;
        lines.push('');
        lines.push(`### ${CATEGORY_LABEL[cat] || cat} (${SITE_URL}/catalogo?categoria=${cat})`);
      }
      const sizes = (p.sizes || []).filter(Boolean);
      const talles = sizes.length ? `${sizes.length} talles (${sizes[0]} a ${sizes[sizes.length - 1]})` : '';
      const precio = ars(p.precio_pdf_a4 ?? p.price);
      const usd = typeof p.precio_usd_pdf_a4 === 'number' && p.precio_usd_pdf_a4 > 0 ? ` (USD ${p.precio_usd_pdf_a4})` : '';
      const tipo = oneLine(p.garment_type);
      lines.push(
        `- ${oneLine(p.name)}${tipo && tipo.toUpperCase() !== oneLine(p.name).toUpperCase() ? ` — ${tipo}` : ''} — ${CATEGORY_LABEL[cat] || cat}` +
          `${talles ? ` — ${talles}` : ''}${precio ? ` — desde ${precio}${usd}` : ''}` +
          `${p.short_description ? ` — ${oneLine(p.short_description)}` : ''} — ${SITE_URL}/producto/${encodeURIComponent(p.slug)}`,
      );
    }
    lines.push('');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(lines.join('\n'));
  } catch (err) {
    console.error('llms-full error', err);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send('Error generando el contenido. Probá de nuevo en unos minutos.');
  }
}
