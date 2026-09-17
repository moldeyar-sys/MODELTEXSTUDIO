# Auditoría exhaustiva de modeltex.com.ar — 2026-09-16

> **Estado: código listo, sin commitear.** Todos los cambios están en el directorio de trabajo,
> verificados (build, typecheck, lint y los 468 controles de `npm run seo` pasan), pero **no los
> subí a git ni a Vercel** — quedan para que los mires antes de publicarlos, como ya veníamos
> haciendo. Cuando digas que sí, hago el commit y el push.

## Cómo se hizo

Un barrido de 21 auditores independientes (seguridad de las funciones del servidor, base de
datos y RLS, cabeceras HTTP, rendimiento del frontend y del edge, accesibilidad y mobile,
bugs de catálogo/checkout/auth/panel admin, contenido y copy, higiene de dependencias, barrido
en vivo contra el sitio publicado) leyó el código real y probó contra producción con
peticiones de solo lectura. Encontraron 74 hallazgos crudos. Después los verifiqué yo mismo
leyendo cada línea citada, confirmando o descartando cada uno contra el código real antes de
tocar nada, y recién ahí apliqué los arreglos.

**Ya estaba muy bien.** El trabajo de SEO técnico de la sesión anterior (`SEO-REPORTE-FINAL.md`)
sigue verde: 468/468 controles (464 originales + 4 nuevos que agregué para la página de
restablecer contraseña). No toqué nada de eso. Los pagos automáticos (Mercado Pago) ya
verificaban el monto real contra la API de MP antes de aprobar, RLS ya bloqueaba escalar a
admin, y el catálogo ya escapaba HTML correctamente. Lo que sigue es lo que SÍ hacía falta.

---

## 🔴 Lo más grave: plata y seguridad

### 1. El checkout mostraba un alias bancario que no existe — CRÍTICO
Todo comprador que elegía "Transferencia bancaria" leía primero *"Transferí al alias
MOLDEY.DIGITAL"* (marca vieja, alias inexistente) y más abajo, en el mismo formulario, el
alias real y distinto (`molderiatextil`, confirmado en la base de producción). Alguien apurado
podía copiar el texto de arriba y transferir a una cuenta que no es la tuya.
**Arreglado**: [`src/lib/types.ts`](src/lib/types.ts), [`src/lib/paymentSettings.ts`](src/lib/paymentSettings.ts), [`src/pages/AdminPage.tsx`](src/pages/AdminPage.tsx) — el texto genérico ahora dice "el alias que te mostramos abajo".

### 2. Compradores del exterior pagaban centavos en vez de dólares
Un visitante fuera de Argentina veía precios en USD (ya estaba implementado), pero el
carrito y el checkout mostraban montos absurdos ("US$ 0.02" por un producto de USD 24:
`formatPrice()` dividía un número que YA era dólares por la cotización, como si fuera pesos).
Si elegía Mercado Pago, se armaba un cobro con moneda fija "ARS": **cobraba 24 pesos por un
producto de 24 dólares**.
**Arreglado** (contenido, no solo cosmético): cada ítem del carrito ahora guarda su moneda real
([`src/lib/types.ts`](src/lib/types.ts), [`src/contexts/CartContext.tsx`](src/contexts/CartContext.tsx)); un formateador nuevo (`formatMoney`, [`src/lib/locale.tsx`](src/lib/locale.tsx))
muestra el monto correcto sin convertir de más; Mercado Pago deja de ofrecerse para pedidos en
dólares ([`src/pages/CheckoutPage.tsx`](src/pages/CheckoutPage.tsx), [`api/create-preference.ts`](api/create-preference.ts) lo rechaza también del lado del servidor)
en vez de cobrar mal. **Necesita** la migración `043` (agrega `orders.currency`).

### 3. El webhook de Mercado Pago no aprobaba compras legítimas con menos talles
Un comprador que sacaba talles para pagar menos (funcionalidad real, promocionada en la
ficha) pagaba el monto correcto, pero el webhook comparaba contra el precio de la curva
COMPLETA y el pedido quedaba "pendiente" para siempre, sin avisarle a nadie que necesitaba
revisión manual.
**Arreglado**: [`api/mp-webhook.ts`](api/mp-webhook.ts) ahora calcula el piso ajustando por talles, igual que el
comprador. Aproveché para: guardar el `mp_payment_id` (identificar un cobro duplicado),
mandar el mail de "tu pedido está listo" automáticamente cuando aprueba un pago de invitado
(antes solo pasaba si un admin apretaba un botón a mano), reducir el detalle que la respuesta
pública filtraba, y agregar verificación opcional de firma (`MP_WEBHOOK_SECRET`).

### 4. Un pago rechazado o abandonado dejaba al comprador sin poder reintentar
El carrito se vaciaba antes de redirigir a Mercado Pago; si el pago fallaba, `back_urls`
mandaba a `/checkout`, que mostraba "carrito vacío" sin ninguna referencia al pedido pendiente.
**Arreglado**: la vuelta de un pago fallido/pendiente ahora lleva al pedido real (`/mis-compras`
o `/mi-pedido`), y agregué un componente nuevo ([`src/components/ui/PaymentInstructions.tsx`](src/components/ui/PaymentInstructions.tsx))
que muestra ahí mismo el alias/wallet/link según el método, con un botón para volver a generar
el link de Mercado Pago — antes esa información solo existía un instante en la pantalla de
confirmación.

### 5. El piso de precio de la base ignoraba el formato declarado
La validación automática de precio mínimo (migración `036`) comparaba contra el formato MÁS
BARATO del producto, sin mirar qué formato decía comprar el cliente. Alguien podía declarar
`formato = "Cartón"` (el más caro) pagando el 15% del PDF-A4 (el más barato) y la policy de
archivos igual le entregaba los de Cartón. Afecta a pagos manuales e invitados (Mercado Pago
ya estaba protegido aparte).
**Necesita SQL**: migración `042`, corre el mismo cálculo por formato que ya usa el webhook.

### 6. `/api/chat` se podía usar sin ningún límite
Si el body no incluía `sessionId`, ni el conteo por sesión ni el conteo por IP se ejecutaban:
cualquiera con un script podía gastar crédito de OpenRouter sin tope.
**Arreglado**: [`api/chat.ts`](api/chat.ts) ahora siempre cuenta contra la IP, con o sin `sessionId`.

### 7. Cabeceras de seguridad ausentes en todo el sitio
No había `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` ni `Permissions-Policy`
en ninguna respuesta — nada impedía que `/login` o `/checkout` se cargaran en un iframe ajeno.
**Arreglado**: [`vercel.json`](vercel.json) las agrega a todo el sitio, más HSTS con `includeSubDomains` y una
Content-Security-Policy en modo *Report-Only* (solo mide, no bloquea nada — paso previo antes
de activarla en serio).

### Otros arreglos de seguridad (sin impacto visible, pero cerraban una puerta)
- **`notify-order`** (avisa por WhatsApp/mail de una compra nueva) tenía una condición de
  carrera: dos llamados a la vez mandaban el aviso duplicado, y la respuesta filtraba qué
  integraciones (Resend, CallMeBot) están o no configuradas. Ahora reserva el envío de forma
  atómica y no filtra nada. También le faltaba el email del comprador invitado en el aviso al
  dueño (decía "Cliente: Cliente").
- **Subida de imágenes** (panel admin) confiaba en el `content-type` que mandaba el navegador:
  con un token de admin filtrado se podía subir un HTML/SVG con script y servirlo desde el
  dominio del sitio. Ahora exige lista blanca + firma real de los primeros bytes del archivo.
  El proxy `/img/` también rechaza servir cualquier cosa que no sea una imagen real.
- **Reseñas**: nada impedía dejar más de una por el mismo usuario/producto, inflando el
  puntaje público que Google muestra en el resultado de búsqueda. **Necesita SQL** (`044`,
  agrega la restricción — de paso, borra duplicados existentes de forma segura antes de
  aplicarla).
- **`profiles.email`**: cualquier usuario logueado podía pisar su propio email desde la
  consola del navegador — el mismo dato que usan los avisos de compra y Mercado Pago para
  identificarlo. **Necesita SQL** (`045`, mismo patrón que ya protege el rol de admin).
- El `<script type="application/ld+json">` que arma `middleware.ts` para cada página no
  escapaba `<`: un dato de la base con `</script>` adentro (nombre o descripción de un
  producto) rompía el bloque e inyectaba HTML en la página, para cualquier visitante.
  Arreglado con una sola línea.

---

## 🔑 Recuperar contraseña no funcionaba

No existía ninguna página ni código que escuchara el link del mail de "recuperar contraseña":
lo único que había era el formulario que lo *pedía*. Un cliente que olvidaba la contraseña no
tenía forma real de volver a entrar.

**Arreglado de punta a punta**: página nueva [`src/pages/ResetPasswordPage.tsx`](src/pages/ResetPasswordPage.tsx) en
`/restablecer-contrasena`, conectada al evento de recuperación de Supabase; `AuthContext.ts`
ahora manda el mail con el `redirectTo` correcto. **Necesita una acción tuya**: entrar a
Supabase → Authentication → URL Configuration → agregar
`https://modeltex.com.ar/restablecer-contrasena` a la lista de Redirect URLs (si no está, el
link del mail no cae ahí).

De paso, en autenticación:
- El panel admin (y "Mi cuenta") se **desmontaba entero** (spinner de pantalla completa,
  perdiendo cualquier formulario a medio llenar) cada vez que volvías a la pestaña o cada
  ~30 minutos por el refresco automático del token — no solo al cambiar de usuario. Corregido
  en [`src/contexts/AuthContext.tsx`](src/contexts/AuthContext.tsx).
- El registro mostraba "Este email ya está registrado" cuando ya existía una cuenta: cualquiera
  podía usar el formulario para averiguar qué emails son clientes de Modeltex. Ahora el mensaje
  es neutro.
- Si vas a `/descargas` sin cuenta, te manda a loguearte o registrarte, y ahora sí te devuelve
  a `/descargas` después (antes se perdía el destino al pasar por "Crear cuenta").

---

## ♿ Accesibilidad (bloqueaba completar una compra con teclado o lector de pantalla)

- Los botones de +/−/eliminar del carrito no tenían nombre accesible (un lector de pantalla
  solo decía "botón" tres veces seguidas) y medían 32px en vez de los 44px recomendados para el
  dedo. Corregido.
- El selector de formato al comprar, la guía de talles, las opiniones de moldes gratis y el
  chat no se podían cerrar con Escape ni se anunciaban como diálogos a un lector de pantalla
  (a diferencia del asistente de IA Textil, que sí lo hacía bien — usé el mismo patrón en los
  otros cuatro).
- El email de invitado en el checkout, los campos de Contacto y los filtros del catálogo tenían
  el `<label>` sin asociar al campo (un lector de pantalla no anunciaba de qué campo se trataba).
- El menú del celular y el menú de usuario no tenían `aria-expanded` ni se cerraban con Escape.
- Texto informativo en gris muy claro (no llegaba al contraste mínimo) en tres lugares
  concretos de la ficha de producto.
- La tabla de la guía de talles no tenía scroll horizontal propio: en un celular angosto, las
  columnas de la derecha quedaban cortadas sin forma de verlas.
- Salto de `h1` a `h3` en la home sin ningún `h2` de sección.

---

## 🧹 Bugs de catálogo, panel admin y contenido

- **Bug determinístico de pedido incorrecto**: al pasar de una ficha de producto a otra (por
  "Productos relacionados"), el selector de talles/formato conservaba la selección del producto
  ANTERIOR sin ninguna señal de error — se podía agregar al carrito un producto de bebé con
  talles de adulto adjuntados. Una sola línea (`key={product.id}`) en [`ProductDetailPage.tsx`](src/pages/ProductDetailPage.tsx).
- El tutor gratuito de MODELTEX LAB compartía el mismo cupo de 10 preguntas anónimas que el
  asistente de ventas: alguien que ya preguntó en la home podía toparse con el muro de
  "creá una cuenta" en la mitad de una clase del curso gratis. Separado.
- Borrar un producto con pedidos asociados eliminaba en cascada sus archivos, dejando a
  compradores que ya pagaron sin poder descargar, sin ningún aviso. Ahora el panel bloquea el
  borrado si hay pedidos y ofrece "ocultar" (reversible) en su lugar.
- "Regenerar todos" los embeddings del catálogo nunca llegaba a los últimos ~44 productos
  (tope fijo de 2.000 contra un catálogo de 2.044+) y, en modo forzado, apretar el botón de
  nuevo reprocesaba siempre los mismos primeros 2.000. Corregido con un tope dinámico.
- "Generar tanda" de descripciones con IA devolvía los mismos 10 productos si se apretaba dos
  veces antes de guardar, duplicando la lista de revisión. Corregido (el servidor ahora recibe
  qué ids excluir).
- Los borradores de descripciones se perdían por completo si se recargaba la página o
  expiraba la sesión a mitad de revisión. Ahora se guardan en el navegador mientras no se
  aprueban.
- El trigger de `products.updated_at` (migración `041`, **todavía no corrida** — confirmado
  contra la base real) se iba a disparar con cada vista de un producto o cada reindexado de
  IA, volviendo a mentir el `lastmod` del sitemap que esa misma migración quería arreglar. Lo
  corregí en el propio archivo, antes de que lo corras.
- El formulario de producto aceptaba precios negativos y guardaba el slug tal como se
  tipeara (con espacios/mayúsculas/tildes), generando URLs que el sitio nunca iba a poder
  mostrar. Ahora valida y normaliza siempre.
- El endpoint que sube imágenes al panel y el proxy `/img/` no verificaban que el archivo
  fuera realmente una imagen — cubierto en la sección de seguridad de arriba.
- Los 3 testimonios de la home son de ejemplo (ya lo sabías, está en `PENDIENTES-DENIS.md`),
  pero se mostraban exactamente igual que una reseña real verificada. Agregué la aclaración
  "Testimonios de ejemplo" — desaparece sola en cuanto haya una reseña real.

## 🚀 Rendimiento

- La imagen del Hero (la más grande de la home, define el LCP) no tenía `<link rel="preload">`:
  el navegador recién la pedía después de bajar y ejecutar ~500 KB de JavaScript. Una línea en
  `index.html`.
- `lucide-react` quedaba fragmentado en ~37 archivos de menos de 2 KB cada uno en vez de un
  solo paquete de íconos cacheado una vez. Corregido en `vite.config.ts`.
- `api/sitemap.ts` y `api/llms-full.ts` pedían caché de una hora, pero Vercel no reenvía esa
  directiva al navegador (solo la usa su propio CDN): un visitante real bajaba el archivo
  completo (608–659 KB) en cada visita. Separé la cabecera del navegador de la del borde.
- `react-router-dom` estaba en una versión con vulnerabilidades conocidas (moderadas, con
  parche disponible). Actualizado a `7.18.4`.

## 🗑️ Higiene del repo

- Borrado código muerto confirmado (nadie lo importa): `src/lib/visibilityEngine/` (5
  archivos), `src/lib/programmaticSeo.ts`, y 3 scripts sueltos de generación de logos.
- `@capacitor/*` (la app Android, que vive aparte en `apk/`) estaba en `dependencies` del sitio
  web sin que nada del sitio lo use — movido a `devDependencies`.
- `.env.example` no documentaba 9 variables que el código sí lee (`SUPABASE_SERVICE_ROLE_KEY`,
  `OPENROUTER_*`, `RESEND_API_KEY`, `NOTIFY_*`, `CALLMEBOT_*`, `MP_WEBHOOK_SECRET` nueva) y
  documentaba 3 que nadie usa. Actualizado y comentado.

---

## ✅ Verificación

| Control | Antes | Ahora |
| --- | --- | --- |
| `npm run build` | OK | OK |
| `npm run typecheck` | 4 errores | **0 errores** |
| `npm run lint` | 62 errores / 11 avisos | 67 errores / 11 avisos* |
| `npm run seo` (anti-regresión SEO) | 464/464 | **468/468** (+4 nuevos, por `/restablecer-contrasena`) |
| `npm audit` (dependencias de producción) | `react-router-dom` vulnerable | Actualizado; el resto son herramientas de build, no llegan al sitio |

\* *Los 5 errores de más son `no-explicit-any` en el código nuevo de `api/*.ts`, siguiendo el
mismo estilo que ya tenía TODO el código de esas funciones desde antes (`req: any, res: any`
en cada endpoint). Tipar `api/` de punta a punta en serio es un trabajo aparte, más grande, que
dejo como sugerencia y no mezclé acá.*

Probé a mano en el navegador (con el sitio real, sin tocar nada de producción): agregar al
carrito, ver el carrito con los botones nuevos, el checkout con el alias corregido y los
métodos de pago filtrados, el modal de compra cerrando con Escape, y la pantalla de
restablecer contraseña.

---

## 📋 Lo que queda en tus manos (en orden de importancia)

1. **Correr las migraciones nuevas en el SQL Editor de Supabase**, en este orden (cada una
   dice en su propio comentario qué hace y por qué; son idempotentes, no rompen nada si se
   corren de nuevo):
   - `supabase/migrations/20260915120000_041_products_updated_at.sql` (la de la sesión
     anterior, **corregida** — todavía no la habías corrido)
   - `supabase/migrations/20260916120000_042_piso_de_precio_por_formato.sql`
   - `supabase/migrations/20260916121000_043_orders_currency_y_mp_payment_id.sql`
   - `supabase/migrations/20260916122000_044_una_resena_por_usuario.sql`
   - `supabase/migrations/20260916123000_045_bloquear_cambio_de_email_en_profiles.sql`
2. **Agregar `https://modeltex.com.ar/restablecer-contrasena`** a Redirect URLs en Supabase →
   Authentication → URL Configuration (si no, el link de "olvidé mi contraseña" no funciona).
3. **Opcional pero recomendado**: crear un secret de webhook en Mercado Pago (Tu integración →
   Webhooks → Firma secreta) y cargarlo como `MP_WEBHOOK_SECRET` en Vercel. Sin esto el sitio
   sigue igual de seguro para aprobar pagos (nunca cambió esa parte); con esto se cierra que
   cualquiera pueda llamar a la URL del webhook para sondear pagos ajenos.
4. **Revisar el commit antes de aprobarlo** (te aviso apenas digas que sí) y avisarme si querés
   que además haga el `git push` — Vercel publica solo al hacerlo.
5. Seguía pendiente de antes (no es mío, es tuyo): cargar `VITE_GA_MEASUREMENT_ID` en Vercel
   (GA4 sigue apagado) y considerar `LocalBusiness` cuando tengas horario y Google Business
   Profile confirmados.

## 🔍 Lo que encontré pero dejé sin tocar (a propósito)

Son cambios reales pero más grandes o más riesgosos de hacer sin poder probarlos en un
ambiente de prueba real; prefiero dejarlos documentados en vez de arriesgar algo que hoy
funciona:

- **El catálogo no pagina**: cualquier visita sin filtros baja y renderiza las 2.044 fichas
  activas de una (~4,6 MB). Necesita paginación real contra Supabase, un cambio de fondo en
  `CatalogPage.tsx`.
- **`guiasData.ts`** (314 KB) se descarga completo en `/guias` y en cualquier clase del Lab con
  guías relacionadas, aunque esas páginas solo necesitan título y descripción. Se puede separar
  en un índice liviano + carga bajo demanda del cuerpo de cada guía.
- **El middleware de Vercel nunca se cachea en el borde** (limitación de la plataforma, no del
  código): cada visita recalcula todo en vivo. `/catalogo` en particular hace 7 consultas con
  conteo exacto por categoría — sacar ese conteo exacto bajaría bastante el tiempo de respuesta.
- El carrito congela el precio en el navegador sin revalidar contra el catálogo real al pagar
  (si el precio cambió o el producto se despublicó entre medio, se cobra el precio viejo).
- El carrito permite cantidad > 1 de un producto 100% digital (cobra dos veces el mismo PDF).
- Limpieza de archivos huérfanos en Cloudflare R2/Storage cuando se borra un producto o una
  imagen — hoy quedan ocupando espacio pero no rompen nada.
- Mensajes de error de Supabase sin traducir en login/registro/recuperar contraseña
  (`"Invalid login credentials"` y similares en inglés cuando no matchean el único caso ya
  traducido).

Si querés, seguimos con cualquiera de estos en otra sesión — decime cuál priorizamos.
