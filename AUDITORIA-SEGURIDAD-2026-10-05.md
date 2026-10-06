# Auditoría de seguridad de modeltex.com.ar — 2026-10-05

> **Estado: código listo, sin commitear.** Los cambios están en el directorio de trabajo
> (build y typecheck pasan). La migración **047** hay que pegarla en Supabase > SQL Editor.
> Nada de esto está publicado todavía en Vercel.

## Qué se revisó

Cuatro revisiones independientes sobre el código real más pruebas de solo lectura contra
producción: (1) las 46 migraciones de Supabase para calcular el estado final de cada policy
RLS, bucket y función; (2) las 9 funciones de servidor en `api/`; (3) el frontend (panel
admin, checkout, auth, descargas); (4) sondeo en vivo del sitio y de la API de Supabase con
la anon key pública. Cada hallazgo lo verifiqué yo leyendo la línea citada, y los dos más
graves los confirmé contra los datos reales de producción antes de tocar nada.

---

## Respuesta a tus tres preguntas

### 1. ¿Los PDF los van a poder bajar únicamente los que pagan?

**Sí.** El bucket `product-files` es privado (confirmado en producción), no tiene lectura
pública, y las dos policies que lo protegen (tabla `product_files` y `storage.objects`,
migración 037) exigen literalmente un pedido **del propio usuario** con
`payment_status = 'pagado'`. Verificado en vivo: con la anon key no se lee ni `product_files`,
ni `orders`, ni el bucket. Un pedido pendiente, rechazado o de otra persona no sirve. El
usuario tampoco puede marcarse pagado (UPDATE de `orders` es solo admin; el INSERT fuerza
`pendiente`). Solo el admin a mano o el webhook de Mercado Pago (service role) aprueban.

### 2. ¿El que paga baja solo lo que pagó?

**Por producto, sí.** No puede firmar archivos de un producto que no está en un pedido suyo
pagado, ni agregar productos a un pedido ya pagado (migración 035).

**Por formato (PDF A4 vs plóter vs cartón) depende de cómo cargues los archivos.** La policy
compara el formato pagado con `product_files.file_type`, pero con una salvedad de
compatibilidad: si todos los archivos de un producto tienen el mismo `file_type`, entrega
todos. Y el panel marca **cualquier .pdf como "PDF A4"** al subirlo. Es decir: si subís el
PDF de A4 y el de plóter del mismo molde sin cambiar el selector, los dos quedan "PDF A4" y
quien pague A4 ($ más barato) baja el de plóter. **Regla para la carga: apenas subas un PDF
de plóter, cambiale el formato en el selector de al lado** (agregué el aviso en el panel).
Hoy los 2 productos con archivos tienen 25 archivos, todos `pdf_a4` (piezas del mismo
formato), así que no hay nada mal cargado.

Además encontré y cerré tres caminos por los que **sí** se podía terminar bajando más de lo
pagado (abajo, "Lo que arreglé").

### 3. ¿Un usuario puede llegar a funciones de admin?

**No encontré ningún camino.** El rol vive en `profiles.role`; nadie puede insertar su
perfil (lo crea un trigger sin rol), el UPDATE propio no puede tocar `role` ni `email`
(triggers 020 y 045), y todas las escrituras admin, tanto desde el panel (RLS `is_admin()`)
como en los endpoints de servidor (`upload-image`, `embed-catalog`, `generate-descriptions`,
`notify-buyer-paid`, `indexnow`), verifican el rol **del lado servidor** con el token. El
cliente nunca manda "soy admin". En producción hay 1 admin y 23 usuarios.

---

## 🔴 Lo que arreglé (plata y descargas)

### A. El webhook de Mercado Pago aprobaba cualquier monto si el formato no tenía precio — CRÍTICO, confirmado en producción
`api/mp-webhook.ts` calculaba el piso de precio con su propia copia del mapeo de formatos.
Para un `order_item` con formato "DXF", "PDS", "MRK" o "ADS" tomaba `precio_dxf` etc., y como
**ninguno de los 2074 productos tiene esos precios cargados**, el piso quedaba en **0**.
Ataque: crear un pedido con `total = 50`, un `order_item` del molde que quieras con formato
"DXF", pagar $50 por MP → el webhook lo aprobaba solo (50 ≥ 50 y 50 ≥ 0) → la policy de
archivos, al ver que el producto tiene un único `file_type`, entregaba **todos** sus PDF.
Además el mapeo del webhook no coincidía con el de la base: formato "pl" lo validaba al
precio mínimo pero la base entregaba los archivos de plóter.

**Fix:** una sola función de precios en `api/utils.ts` (`formatoAFileType`, `pisoDelItem`),
calcada de `formato_a_file_type()` de la base, usada por el webhook, por
`create-preference` y por `guest-order`. Un formato sin precio en ese producto ahora devuelve
"no verificable" y el pago **queda en revisión manual**, nunca piso 0. Probado con 14 casos
(mapeo, talles, USD).

### B. El link de pago de Mercado Pago se podía armar por el 15 % del precio — ALTO
`create-preference` cobraba `order_items.price`, que escribe el navegador y que la base
solo exige que sea ≥ 15 % del precio real. El webhook después no lo auto-aprobaba, pero el
cobro ya estaba hecho y un pedido "pendiente" con pago en MP invita a aprobarlo a mano.
**Fix:** el precio que se manda a MP es siempre el mayor entre lo declarado y el precio real
de catálogo del formato (ajustado por talles). Formato inexistente → no se arma el link.

### C. Sumar moldes a un pedido después de pagarlo (pago manual) — ALTO
Un usuario podía armar un pedido de 1 molde, transferir ese monto, y desde la consola del
navegador insertar 20 `order_items` más al mismo pedido antes de que lo marques pagado.
Vos veías "comprobante = total", aprobabas, y la RLS entregaba los 21.
**Fix (migración 047):** trigger que solo acepta ítems en los primeros 15 minutos del pedido y
cuya suma no supere el `total`.

### D. El "respaldo del carrito" (cart_snapshot) sin validar — ALTO
`cart_snapshot` lo escribe el navegador. Si `order_items` queda vacío, el panel y
`guest-order` lo usan para mostrar y **entregar** archivos. Un invitado podía crear un pedido
sin ítems y un snapshot con 30 moldes a $1, pagar $30 por transferencia, y al aprobarlo bajar
los 30. **Fix:** trigger en `orders` (047) que valida cada ítem del snapshot contra el
catálogo (producto activo, formato con precio, precio ≥ piso, suma ≤ total), y
`guest-order.ts` vuelve a verificar contra el catálogo antes de firmar archivos.

### E. Otros cierres incluidos en la migración 047
- Formato sin precio en el producto → el `order_item` se **rechaza** (antes caía al mínimo global).
- Un usuario con cuenta ya no puede poner `guest_email` ajeno en su pedido (se le mandaba a
  ese tercero el mail oficial con link de descarga).
- Se cierra el INSERT en `downloads` (tabla legada; permitía filas con rutas arbitrarias).
- Trigger anti escalada de rol también en INSERT de `profiles`; `search_path` fijo en
  `handle_new_user`; permisos explícitos en `is_recent_guest_order`.

### F. Funciones de servidor
- **Cron de novedades** (`/api/cron-novedades`): sin `CRON_SECRET`, cualquiera con el
  User-Agent "vercel-cron" disparaba el envío a toda la lista, y no es idempotente (cada
  llamada repite el mail). **Eliminado a pedido de Denis (2026-10-05):** se quitó el cron
  de `vercel.json` y el envío automático. Lo reemplaza un envío **manual** desde el panel
  (Novedades > "Enviar aviso"): solo admin (verificado en servidor), elige moldes y público,
  prueba al propio mail y confirma. Historial en `newsletter_sends` y bajas en
  `newsletter_optout` (migración 048).
- **Mail de "nueva compra"**: el nombre del comprador, formato y talles entraban sin escapar
  en el HTML → se podía meter un link de phishing en el mail que leés vos. Escapado.
- **Proxy `/img`**: descargaba archivos enteros de Supabase (ZIP/PDF de `free-files`) antes
  de rechazarlos, sin cache → bucle de pedidos agotaba tu transferencia mensual. Ahora
  decide por cabeceras y cachea los rechazos.
- **Webhook MP**: comparación de firma en tiempo constante.
- `claim_guest_order` (046, todavía no aplicada): ahora exige email confirmado y pedido de
  menos de 7 días.
- `SETUP_NUEVA_CUENTA.sql`: si se volvía a ejecutar sobre producción, **revertía** los fixes
  022/035/038 (pedidos auto-pagados). Actualicé esas policies y le puse el aviso.

---

## ✅ Lo que ya estaba bien (verificado)

- RLS en las 23 tablas; `profiles`, `orders`, `order_items`, `product_files`, `downloads`,
  `contact_messages`, `newsletter_subscribers`, `chat_messages` devuelven 0 filas a anónimos.
- Bucket privado inaccesible sin sesión; `/img` sin SSRF ni path traversal; `.env`, `.git`
  y migraciones no se sirven.
- Cabeceras HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy.
- Sin `dangerouslySetInnerHTML`; sin secretos en el bundle; sin open redirect.
- Webhook MP: reconsulta el pago real, exige ARS, monto ≥ total, no degrada, no re-aprueba.
- Admin verificado en servidor en todos los endpoints sensibles.

---

## 📋 Lo que queda en tus manos (en orden)

1. ~~Pegar la migración 047~~ **Aplicada el 2026-10-05 y verificada** (la base rechazó un
   pedido de prueba con carrito falso). Falta pegar la **048** (envío manual de novedades).
2. **Vercel > Environment Variables:** si no está, `MP_WEBHOOK_SECRET` (Mercado Pago > Tu
   integración > Webhooks > Firma secreta): hoy, sin ella, cualquiera puede llamar al webhook
   como oráculo del estado de un pago. (`CRON_SECRET` ya no hace falta: el cron se eliminó.)
3. **Supabase > Authentication > Email:** activar **"Confirm email"** (hoy está en
   autoconfirmación: cualquiera se registra con el email de otro sin verificarlo). Hacerlo
   **antes** de activar el login con Google: con autoconfirmación + Google, alguien puede
   registrar tu mail con una contraseña suya y, cuando vos entrás con Google, Supabase
   vincula tu identidad a esa cuenta que él controla.
4. **Al cargar los PDF:** subir por la ficha del producto ("Archivos descargables"), nunca por
   "Moldes gratis" (ese bucket es público, el candado es solo visual; puse el aviso). A cada
   PDF de plóter o cartón, cambiarle el formato en el selector apenas se sube.
5. Publicar (commit + push) cuando lo mires. Ya vas a tener la base lista con 047.

## 🔍 Encontrado y dejado a propósito (menor, o decisión de producto)

- `payment_settings` (CBU, alias, titular, wallets) y `ai_settings` son legibles por
  anónimos: lo necesita el checkout público. Si querés, se puede mover a un endpoint.
- Email del invitado viaja en la URL de `/mi-pedido?order=…&email=…` (queda en historial y
  logs). Mejora: token aleatorio por pedido en vez del email.
- `/api/guest-order` acepta prefijo de 8 caracteres del pedido + email, sin límite de
  intentos (2³² combinaciones, impráctico pero sin freno). Mejora: rate limit.
- `/api/chat` sin tope para usuarios registrados (costo de OpenRouter). Mejora: tope por
  usuario/día; mientras tanto, límite de gasto en OpenRouter.
- CSP sigue en modo Report-Only (no bloquea). Activarla requiere probar GA4, píxel de Meta y
  fuentes; lo dejo para una sesión aparte.
- `/restablecer-contrasena` acepta cualquier sesión activa (no solo el link de recuperación).
- Links de pago (`paypal_link`, etc.) y recursos del Lab se renderizan como `href` sin
  validar esquema: solo los carga el admin, pero conviene un `safeHttpUrl`.
- Las columnas `precio_usd_*` existen en producción pero no en ninguna migración del repo
  (el esquema real difiere del repo). Conviene versionarlas.
- `lab_chunks` es legible por todos: si indexás una clase en borrador, su texto es público.
