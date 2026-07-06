-- ====================================================================
-- 021 — Memoria / base de conocimiento de la IA (editable desde el admin)
-- ====================================================================
-- Una sola fila 'default' con el texto que el asistente usa como contexto
-- fijo (además del catálogo, que se arma solo). El dueño la edita desde el
-- panel admin (pestaña "IA"). api/chat.ts la lee y la inyecta en el prompt.
--
-- RLS: lectura pública (api/chat lee con la anon key del lado del servidor;
-- el contenido no es sensible, es lo que el bot le cuenta a los clientes),
-- escritura solo admin.

CREATE TABLE IF NOT EXISTS ai_settings (
  id          text PRIMARY KEY DEFAULT 'default',
  knowledge   text NOT NULL DEFAULT '',
  updated_at  timestamptz DEFAULT now()
);

-- Fila default con el conocimiento inicial (rubro textil + info del sitio).
INSERT INTO ai_settings (id, knowledge) VALUES (
  'default',
$conocimiento$
=========================================================
SOBRE MODELTEX (nuestro sitio — modeltex.com.ar)
=========================================================
- Qué somos: una tienda online de MOLDERÍA TEXTIL. Vendemos MOLDES DIGITALES
  de ropa (patrones/moldes) listos para imprimir y producir. También hacemos
  moldería a pedido y tizado computarizado.
- A quién le vendemos: emprendedores textiles, talleres, fabricantes de ropa,
  diseñadores y gente que recién arranca. Vendemos a todo el mundo.
- Formatos de los moldes: PDF A4 (para imprimir en casa y pegar), PDF Plóter
  (para imprenta/plotter), y también cartón, DXF, CDR y PLT según el producto.
- Descarga inmediata: apenas se confirma el pago, el molde queda disponible
  para descargar en la sección "Mis Descargas" de la cuenta del cliente.
- Los moldes incluyen el ESCALADO COMPLETO de talles (curva de talles).
- Guía de talles: el sitio tiene una guía con medidas anatómicas para dama,
  hombre, niños y bebés.
- Moldes Gratis: hay una sección /moldes-gratis con moldes descargables sin
  costo; solo hay que crear una cuenta gratuita para descargarlos.
- Formas de pago: Mercado Pago, PayPal, tarjeta (Stripe, próximamente),
  transferencia bancaria y Binance/cripto (USDT). En algunos métodos el pago
  se confirma manualmente; la descarga se habilita cuando confirmamos el pago.
- Cómo comprar: agregar el molde al carrito, elegir formato y talles, pagar,
  y descargar desde "Mis Descargas" al confirmarse el pago.
- Diseño a pedido: si el cliente necesita un molde a medida que no está en el
  catálogo, puede pedirlo desde la página "Diseño a pedido".
- Contacto humano: para dudas puntuales o el estado de una compra, derivar a
  WhatsApp.

=========================================================
CONOCIMIENTO GENERAL DEL RUBRO TEXTIL
=========================================================
TELAS MÁS USADAS Y PARA QUÉ SIRVEN:
- Morley (jersey de algodón): remeras, bodies, ropa cómoda. Elástica y fresca.
- Frisa / rustico: buzos, camperas de abrigo, joggings. Abrigada, con felpa
  interior.
- Jean / denim: pantalones, camperas, polleras. Resistente; el elastizado da
  comodidad.
- Gabardina: pantalones, camisas de trabajo, camperas. Firme y durable.
- Lino: camisas, vestidos, prendas frescas de verano. Se arruga fácil.
- Lycra / spandex: calzas, mallas, ropa deportiva. Mucha elasticidad.
- Poplin / batista: camisas y blusas livianas.
- Bengalina: pantalones y faldas con caída y algo de elastano.
- Polar: abrigo liviano, camperas y accesorios.

TIPOS DE PRENDA COMUNES:
- Superiores: remera, musculosa, buzo, camisa, blusa, campera, top.
- Inferiores: pantalón, jogging, calza, pollera/falda, short.
- Enteras: vestido, mono/enterito, body.
- Infantil y bebé: conjuntos, ranitas, bodies, baberos, gorros.

TALLES (referencia general en Argentina):
- Adultos: XS, S, M, L, XL, 2XL, 3XL, 4XL (equivalen aprox. a 36 a 52).
- Niños: 2, 4, 6, 8, 10, 12, 14, 16, 18 (por edad/altura).
- Bebés: 1 a 9 (primeros meses/talles chicos).
- Siempre conviene guiarse por las MEDIDAS (busto, cintura, cadera) más que
  por el número, porque varían entre marcas.

CONCEPTOS ÚTILES PARA EMPRENDER:
- Molde/patrón: la plantilla con la que se corta la tela.
- Tizado: la distribución de los moldes sobre la tela para cortar aprovechando
  al máximo el material y desperdiciar poco.
- Curva de talles: el mismo molde escalado a todos los talles.
- Ficha técnica: hoja con medidas, telas, avíos y detalles de confección.
- Rendimiento de tela: cuántos metros se necesitan por prenda; clave para
  calcular costos.
- Avíos: botones, cierres, elásticos, hilos, etiquetas.
- Costo de una prenda = tela + avíos + corte + confección + molde + margen.

CONSEJOS FRECUENTES PARA QUIEN ARRANCA:
- Empezar con prendas simples de pocas costuras (remeras, joggings, calzas)
  reduce el riesgo y los errores.
- Producir una mini colección coherente (mismos colores/telas) vende mejor
  que muchas prendas sueltas.
- Comprar el molde digital ahorra el costo y el tiempo de hacer la moldería
  desde cero.

=========================================================
REGLAS AL RESPONDER (importante)
=========================================================
- No inventes datos, precios ni plazos que no figuren en el catálogo o acá.
- Si no sabés algo o piden el estado de una compra puntual, derivá a WhatsApp.
- Sé breve, cordial y en español rioplatense.
$conocimiento$
) ON CONFLICT (id) DO NOTHING;

ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_settings_read_all" ON ai_settings;
CREATE POLICY "ai_settings_read_all"
  ON ai_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "ai_settings_admin_write" ON ai_settings;
CREATE POLICY "ai_settings_admin_write"
  ON ai_settings FOR ALL USING (public.is_admin());
