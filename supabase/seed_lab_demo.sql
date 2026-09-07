/*
  SEED — MODELTEX LAB (contenido mínimo de demostración)

  Corré primero la migración 034_modeltex_lab.sql. Este script es idempotente
  (ON CONFLICT ... DO NOTHING), se puede pegar y correr varias veces en el
  SQL Editor de Supabase sin duplicar filas.

  Carga 2 cursos con 1 módulo y 2 clases cada uno (temas tomados de las
  búsquedas reales en MODELTEX LAB/TOP 10 PREGUNTAS...txt), más un glosario
  chico. Es contenido de arranque para probar la arquitectura completa
  (curso → módulo → clase → glosario → IA) — el contenido definitivo se carga
  después desde el panel admin.
*/

-- ==================== CURSO 1: MOLDERÍA A MEDIDA ====================
INSERT INTO lab_courses (slug, track_slug, title, subtitle, description, objectives, requirements, estimated_duration, author, order_index, status)
VALUES (
  'molderia-a-medida', 'molderia-a-medida',
  'Curso de Moldería a Medida',
  'Aprendé desde cero a desarrollar y adaptar moldes para medidas individuales.',
  'Recorrido gratuito para aprender moldería textil desde los fundamentos: qué es la moldería, cómo tomar medidas, moldes base y transformaciones, hasta poder desarrollar prendas a medida.',
  ARRAY['Entender qué es la moldería y en qué se diferencia de la moldería industrial', 'Tomar medidas corporales correctamente', 'Construir y adaptar moldes base a una persona real'],
  ARRAY['Ganas de aprender', 'Cinta métrica, regla y papel (o una app de moldería)'],
  '6 horas', 'Modeltex', 1, 'published'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lab_modules (course_id, slug, level_label, level_order, title, description, objectives, order_index, status)
SELECT id, 'fundamentos', 'Nivel 1 — Fundamentos', 1,
  'Fundamentos de la moldería',
  'Los conceptos y herramientas de base antes de construir tu primer molde.',
  ARRAY['Saber qué es la moldería', 'Tomar medidas del cuerpo de forma correcta'],
  1, 'published'
FROM lab_courses WHERE slug = 'molderia-a-medida'
ON CONFLICT (course_id, slug) DO NOTHING;

INSERT INTO lab_lessons (
  module_id, slug, title, objective, before_start, concept, development, steps, example,
  common_mistakes, modeltex_tip, exercise_instructions, faqs, summary, order_index, status, author, published_at
)
SELECT
  m.id, 'que-es-la-molderia',
  'Qué es la moldería y qué necesitás para empezar',
  'Entender qué es la moldería textil, en qué se diferencia de la moldería industrial y con qué herramientas básicas se trabaja.',
  'No hace falta experiencia previa. Si tenés cinta métrica, regla y papel (o una app de moldería), ya podés empezar.',
  'La moldería es la técnica de construir, a partir de medidas del cuerpo, las piezas planas de una prenda (el patrón) que después se cortan en tela y se cosen. "Moldería" y "patronaje" se usan como sinónimos según el país; el resultado es el mismo: un patrón listo para cortar.',
  '[{"h3":"Moldería a medida vs. moldería industrial","paragraphs":["La moldería a medida desarrolla un molde para UNA persona con sus medidas reales: es el enfoque de un taller a medida o de quien empieza a coser para sí mismo o para clientes puntuales.","La moldería industrial, en cambio, desarrolla un molde base y después lo escala (progresa) a toda una curva de talles (S, M, L...) para producir muchas prendas iguales en distintos talles. Vas a ver ese recorrido completo en el curso de Moldería Industrial de Modeltex Lab."],"bullets":[]},{"h3":"Herramientas básicas","paragraphs":[],"bullets":["Cinta métrica flexible","Regla larga (o regla de moldería con curvas)","Papel para patrones (o cartulina, o una app/software si trabajás digital)","Lápiz, goma y tijera de papel"]}]'::jsonb,
  '["Conseguí una cinta métrica y una regla larga.", "Elegí en qué vas a dibujar: papel, cartulina o una app de moldería.", "Mirá una prenda que ya tengas y anotá de qué piezas está compuesta (delantero, espalda, manga...)."]'::jsonb,
  'Una remera básica está compuesta, como mínimo, por 3 piezas: delantero, espalda y manga. Cada pieza es un molde en sí misma.',
  '[{"mistake":"Pensar que moldería y confección son lo mismo","fix":"La moldería es el desarrollo del patrón (la \"planificación\"); la confección es coser la tela ya cortada. Son dos oficios relacionados pero distintos."}]'::jsonb,
  'Guardá siempre una copia del molde base sin modificar. Vas a transformarlo una y otra vez (mangas, escotes, volumen) y necesitás poder volver al original.',
  'Desarmá con cuidado una remera vieja que ya no uses (o mirala del revés) e identificá sus piezas: ¿cuántas ves? ¿Dónde están las costuras?',
  '[{"q":"¿Necesito saber coser para aprender moldería?","a":"No es obligatorio, pero ayuda mucho: entender cómo se une la tela te hace entender mejor por qué el molde tiene la forma que tiene."},{"q":"¿Puedo hacer moldería sin computadora?","a":"Sí, moldería es un oficio manual desde hace más de un siglo. La moldería digital (CAD) es una herramienta más, no un requisito."}]'::jsonb,
  'La moldería construye el patrón de una prenda a partir de medidas reales. La moldería a medida trabaja para una persona puntual; la industrial escala ese molde a una curva de talles completa.',
  1, 'published', 'Modeltex', now()
FROM lab_modules m JOIN lab_courses c ON c.id = m.course_id
WHERE c.slug = 'molderia-a-medida' AND m.slug = 'fundamentos'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lab_lessons (
  module_id, slug, title, objective, before_start, concept, development, steps, example,
  common_mistakes, modeltex_tip, exercise_instructions, faqs, summary, order_index, status, author, published_at
)
SELECT
  m.id, 'como-tomar-medidas',
  'Cómo tomar las medidas del cuerpo',
  'Aprender a tomar, de forma correcta y repetible, las medidas corporales básicas que se usan para construir cualquier molde a medida.',
  'Necesitás una cinta métrica flexible y, si es posible, otra persona que te ayude a medir (medirse una misma es más impreciso).',
  'Todo molde a medida parte de un grupo de medidas del cuerpo, tomadas con la cinta apoyada sin ajustar ni aflojar de más. Un error de 1-2 cm en la toma de medidas se nota directamente en el calce final.',
  '[{"h3":"Medidas básicas para la parte superior del cuerpo","paragraphs":[],"bullets":["Contorno de busto/pecho: en la parte más ancha, cinta paralela al piso.","Contorno de cintura: en el pliegue natural de la cintura, sin ajustar.","Contorno de cadera: en la parte más ancha de la cadera.","Largo de espalda: desde la base del cuello hasta la cintura.","Largo de manga: desde el hombro hasta la muñeca, con el brazo semi flexionado."]},{"h3":"La cinta métrica: ajustada, no apretada","paragraphs":["Un error frecuente es medir con la cinta apretando la tela o el cuerpo: eso da una medida más chica de la real y el molde queda justo. La cinta debe apoyar, sin hundir la piel ni la ropa."]}]'::jsonb,
  '["Pedile a alguien que te ayude a medir (o hacelo frente a un espejo grande).", "Usá ropa ajustada o ropa interior para medir, nunca sobre una campera o abrigo.", "Tomá cada medida dos veces y anotá el promedio si difieren.", "Anotá todas las medidas en una tabla con fecha: el cuerpo cambia con el tiempo."]'::jsonb,
  'Si el contorno de busto da 92 cm y el de cintura 74 cm, esos dos números ya te permiten calcular las pinzas de un corpiño base (la diferencia entre ambos contornos es, a grandes rasgos, lo que hay que "sacar" con pinzas).',
  '[{"mistake":"Medir sobre ropa gruesa","fix":"Medí siempre sobre ropa ajustada o ropa interior: un buzo grueso puede sumar 3-4 cm falsos al contorno."},{"mistake":"Aflojar la cinta \"para que quede cómodo\"","fix":"La cinta debe quedar como queda una prenda entallada, ni floja ni apretada. Practicá con alguien que ya sepa medir para calibrar la sensación."}]'::jsonb,
  'Armá tu propia ficha de medidas por cliente (o por vos mismo) y actualizala cada 6 meses. Te va a ahorrar horas de corrección de calce.',
  'Tomate (o tomale a alguien) el contorno de busto, cintura y cadera, y el largo de espalda. Anotá los 4 números.',
  '[{"q":"¿La cinta métrica debe estar ajustada?","a":"Debe apoyar en el cuerpo sin hundirlo y sin quedar floja: ni apretada ni suelta. Es la fuente de error más común al empezar."},{"q":"¿Con qué frecuencia hay que volver a tomar medidas?","a":"El cuerpo cambia: para trabajo a medida conviene volver a medir si pasaron varios meses desde la última toma."}]'::jsonb,
  'Las medidas del cuerpo (busto, cintura, cadera, largo de espalda y de manga, entre otras) son el punto de partida de cualquier molde a medida. Se toman con la cinta apoyada, sin ajustar ni aflojar, preferentemente con ayuda de otra persona.',
  2, 'published', 'Modeltex', now()
FROM lab_modules m JOIN lab_courses c ON c.id = m.course_id
WHERE c.slug = 'molderia-a-medida' AND m.slug = 'fundamentos'
ON CONFLICT (module_id, slug) DO NOTHING;

-- ==================== CURSO 2: MOLDERÍA INDUSTRIAL ====================
INSERT INTO lab_courses (slug, track_slug, title, subtitle, description, objectives, requirements, estimated_duration, author, order_index, status)
VALUES (
  'molderia-industrial', 'molderia-industrial',
  'Curso de Moldería Industrial',
  'Aprendé desarrollo profesional, progresión, CAD, tizado y preparación para producción.',
  'Recorrido gratuito orientado a fabricantes, marcas, talleres y emprendedores textiles: de la moldería a medida a la producción en serie, con escalado de talles, digitalización y tizado.',
  ARRAY['Entender la diferencia entre moldería industrial y a medida', 'Armar una tabla de talles industrial', 'Conocer el flujo completo de desarrollo de una prenda para producir'],
  ARRAY['Conocimientos básicos de moldería (recomendado, no obligatorio)'],
  '8 horas', 'Modeltex', 2, 'published'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lab_modules (course_id, slug, level_label, level_order, title, description, objectives, order_index, status)
SELECT id, 'introduccion-a-la-produccion', 'Nivel 1 — Introducción a la producción', 1,
  'Introducción a la producción',
  'Qué es la moldería industrial y cómo se organiza una tabla de talles para fabricar en serie.',
  ARRAY['Diferenciar moldería industrial de moldería a medida', 'Entender para qué sirve una tabla de talles industrial'],
  1, 'published'
FROM lab_courses WHERE slug = 'molderia-industrial'
ON CONFLICT (course_id, slug) DO NOTHING;

INSERT INTO lab_lessons (
  module_id, slug, title, objective, before_start, concept, development, steps, example,
  common_mistakes, modeltex_tip, exercise_instructions, faqs, summary, order_index, status, author, published_at
)
SELECT
  m.id, 'molderia-industrial-vs-a-medida',
  'Qué es la moldería industrial y en qué se diferencia de la moldería a medida',
  'Entender qué es el patronaje/moldería industrial y por qué es la base de cualquier producción en serie.',
  'Recomendado (no obligatorio): haber visto el curso de Moldería a Medida, o al menos saber qué es un molde base.',
  'La moldería industrial es el desarrollo de un molde base pensado para producir MUCHAS prendas iguales, en varios talles, de forma repetible. No se ajusta a una persona: se ajusta a una tabla de medidas estándar (por marca, por país o propia de la empresa).',
  '[{"h3":"El flujo de desarrollo de una prenda para producción","paragraphs":[],"bullets":["Diseño / idea de la prenda","Molde base en el talle de referencia (muestra)","Confección de la muestra y prueba de calce","Ajustes al molde según la muestra","Progresión (escalado) a toda la curva de talles","Ficha técnica para el taller","Tizada y corte en producción"]},{"h3":"Por qué importa la repetibilidad","paragraphs":["En moldería a medida, cada ajuste es para una persona y termina ahí. En moldería industrial, un error en el molde base se multiplica por cada talle y por cada prenda cortada: por eso se invierte tiempo extra en aprobar bien la muestra antes de progresar y producir."]}]'::jsonb,
  '["Mirá la etiqueta de una prenda de una marca y fijate qué talles ofrece.", "Pensá cuántas prendas de ESE mismo modelo calculás que se producen en un lote (decenas, cientos).", "Anotá la diferencia principal que notás entre eso y un molde hecho a medida para una sola persona."]'::jsonb,
  'Una marca que lanza una remera en talles S a XL no hace 5 moldes desde cero: desarrolla UN molde base (por ejemplo en talle M) y lo progresa matemáticamente a S, L y XL.',
  '[{"mistake":"Creer que moldería industrial es solo \"hacer el molde en la computadora\"","fix":"La digitalización (CAD) es una herramienta, no la definición. Se puede hacer moldería industrial en papel; lo industrial es el enfoque de producir una curva de talles repetible, no el software."}]'::jsonb,
  'Antes de progresar un molde a toda la curva de talles, aprobá siempre una muestra confeccionada en el talle base. Corregir el molde base después de progresado sale mucho más caro.',
  'Elegí una prenda simple (remera, short) y listá, en orden, los pasos que imaginás que se necesitan desde la idea hasta tenerla a la venta en 5 talles distintos.',
  '[{"q":"¿Moldería industrial y patronaje industrial es lo mismo?","a":"Sí, son sinónimos según la región: ambos términos se refieren al desarrollo de moldes pensados para producción en serie."},{"q":"¿Necesito un software especial para empezar con moldería industrial?","a":"No para aprender los conceptos. Programas como Optitex o Audaces se usan en la industria para digitalizar, progresar y tizar más rápido, pero los fundamentos se aprenden igual sin ellos."}]'::jsonb,
  'La moldería industrial desarrolla un molde base para producir en serie, en varios talles, de forma repetible. Se diferencia de la moldería a medida en que no se ajusta a una persona sino a una tabla de medidas estándar, y su flujo incluye aprobar una muestra antes de progresar toda la curva de talles.',
  1, 'published', 'Modeltex', now()
FROM lab_modules m JOIN lab_courses c ON c.id = m.course_id
WHERE c.slug = 'molderia-industrial' AND m.slug = 'introduccion-a-la-produccion'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lab_lessons (
  module_id, slug, title, objective, before_start, concept, development, steps, example,
  common_mistakes, modeltex_tip, exercise_instructions, faqs, summary, order_index, status, author, published_at
)
SELECT
  m.id, 'tabla-de-talles-industrial',
  'Tabla de talles industrial: cómo se arma y para qué sirve',
  'Entender qué es una tabla de talles industrial, qué información contiene y cómo se usa para progresar un molde.',
  'Conviene haber visto la clase anterior ("Qué es la moldería industrial").',
  'Una tabla de talles industrial es una planilla con las medidas corporales de referencia para cada talle de una curva (por ejemplo S, M, L, XL), y con el incremento que hay entre un talle y el siguiente en cada medida clave (busto, cintura, cadera, largo, etc.).',
  '[{"h3":"Qué información lleva","paragraphs":[],"bullets":["Medidas de referencia por talle (contorno de busto, cintura, cadera, largo de manga, etc.)","Incremento entre talles consecutivos (ej: +4 cm de contorno de busto por talle)","A veces, medidas específicas del molde (no solo del cuerpo), que ya incluyen la holgura de diseño"]},{"h3":"Para qué se usa","paragraphs":["La tabla de talles es la referencia que se usa para progresar (escalar) el molde base: en vez de recalcular cada talle a mano midiendo el cuerpo de nuevo, se aplican los incrementos de la tabla en cada punto del molde. Es lo que hace que 6 talles de una misma prenda mantengan la misma forma y proporción."]}]'::jsonb,
  '["Elegí una prenda y una curva de talles (ej: S a XL).", "Buscá o armá una tabla simple con el contorno de busto de cada talle.", "Calculá cuánto aumenta el contorno de busto entre cada talle consecutivo."]'::jsonb,
  'Si el talle M tiene 96 cm de contorno de busto y el talle L tiene 100 cm, el incremento entre M y L es de 4 cm para esa medida.',
  '[{"mistake":"Usar la misma tabla de talles para cualquier tipo de prenda","fix":"Una tabla de talles de remeras no sirve igual para pantalones: cada tipo de prenda progresa distinto según qué medidas son críticas para su calce."}]'::jsonb,
  'Si vas a producir con un taller o una fábrica, pedí SIEMPRE la tabla de talles que van a usar antes de aprobar la muestra: evita sorpresas cuando llega el lote completo progresado.',
  'Tomá una tabla de talles industrial (podés pedirle un ejemplo a la IA de Modeltex Lab) y calculá el incremento de contorno de cintura entre 2 talles consecutivos.',
  '[{"q":"¿Todas las marcas usan la misma tabla de talles?","a":"No. Cada marca o fabricante puede definir su propia tabla según su público. Por eso el talle M de una marca puede no ser igual al M de otra."},{"q":"¿La tabla de talles reemplaza al molde base?","a":"No: la tabla da las medidas de referencia por talle, pero el molde base sigue siendo necesario para definir la forma real de la prenda. La tabla se usa para progresarlo."}]'::jsonb,
  'La tabla de talles industrial define las medidas de referencia y los incrementos entre talles de una curva, y es la base para progresar (escalar) un molde de forma consistente en toda la producción.',
  2, 'published', 'Modeltex', now()
FROM lab_modules m JOIN lab_courses c ON c.id = m.course_id
WHERE c.slug = 'molderia-industrial' AND m.slug = 'introduccion-a-la-produccion'
ON CONFLICT (module_id, slug) DO NOTHING;

-- ==================== GLOSARIO ====================
INSERT INTO lab_glossary_terms (slug, term, short_definition, explanation, example, order_index, status) VALUES
  ('holgura', 'Holgura', 'Diferencia entre la medida del molde y la medida real del cuerpo, agregada a propósito para que la prenda no quede pegada al cuerpo.',
   'La holgura permite que la prenda se pueda poner, mover y respirar. Varía según el tipo de prenda: una calza tiene poca holgura, un buzo oversize tiene mucha.',
   'Si el contorno de busto real es 92 cm y el molde de una remera se hace con 100 cm de contorno, la holgura es de 8 cm.', 1, 'published'),
  ('piquetes', 'Piquetes', 'Pequeñas marcas o cortes en el borde de un molde que indican puntos de referencia para unir correctamente las piezas al coser.',
   'Los piquetes evitan que una manga o un cuello queden mal ubicados al coser: marcan, por ejemplo, dónde empieza el hombro o dónde coincide el centro de una pieza con otra.',
   'Un molde de manga suele llevar un piquete en el centro superior (que coincide con el hombro) y piquetes distintos adelante y atrás para no confundir los lados.', 2, 'published'),
  ('tiro', 'Tiro', 'Medida de un pantalón que va desde la cintura, pasando por la entrepierna, hasta la cintura por atrás (o, según el contexto, solo la parte delantera o trasera de ese recorrido).',
   'El tiro delantero y el tiro trasero pueden medirse por separado: son una de las medidas que más afecta el calce y las arrugas de un pantalón si están mal calculadas.',
   'Un pantalón con arrugas horizontales debajo de la cola suele tener un problema de tiro trasero corto para esa persona.', 3, 'published'),
  ('progresion-de-talles', 'Progresión de talles', 'Proceso de escalar matemáticamente un molde base a los demás talles de una curva, aplicando los incrementos definidos en la tabla de talles.',
   'También se la llama "escalado". Es lo que permite pasar de un único molde en talle M a los moldes de S, L y XL sin volver a dibujar cada uno desde cero.',
   'Progresar un molde de remera del talle M al L puede implicar sumar 2 cm al ancho de pecho y 1,5 cm al largo total, repartidos en puntos específicos del molde.', 4, 'published'),
  ('tizada', 'Tizada', 'Acomodo de todas las piezas de los moldes de una tirada de producción sobre el ancho real de la tela, listo para cortar varias capas a la vez.',
   'También se la llama "marker". Se mide por su eficiencia (cuánta tela se aprovecha) y de ella depende directamente el consumo de tela de una producción.',
   'Una tizada con 85% de eficiencia aprovecha 85 de cada 100 cm de ancho de tela; el resto es desperdicio entre piezas.', 5, 'published')
ON CONFLICT (slug) DO NOTHING;
