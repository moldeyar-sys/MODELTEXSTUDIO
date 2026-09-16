# Performance y Core Web Vitals — Modeltex

Generado el 2026-09-16. Acompaña a `seo-validation-report.md` (validación técnica de SEO)
y a `seo-audit-products-report.md` (calidad de las fichas).

**No hay números de Lighthouse inventados en este documento.** Lo que sigue es lo que se
cambió en el código y por qué, más lo que queda pendiente con su costo y su riesgo. Los
números reales hay que medirlos en PageSpeed Insights sobre el sitio publicado, después de
desplegar estos cambios (ver el final).

---

## Punto de partida

El sitio es una SPA de Vite + React. Medido con `curl` sobre el sitio publicado antes de
estos cambios (3 corridas por ruta, tomando el TTFB):

| Ruta | TTFB navegador | TTFB robot (middleware) |
| --- | --: | --: |
| `/` | ~0,20 s | ~0,20 s |
| `/moldes-pdf` | ~0,19 s | ~0,20 s |
| `/guias/formatos-de-molderia-digital` | ~0,20 s | ~0,21 s |
| `/producto/<slug>` | ~0,42 s | ~0,58 s |
| `/catalogo?categoria=dama` | ~0,45 s | ~0,50 s |
| `/catalogo` | ~0,21 s | ~0,62 s |

Lo importante de esa tabla: **las páginas sin consulta a la base (home, landings, guías)
cuestan lo mismo con o sin el middleware.** El costo extra aparece solo donde hay que
consultar Supabase: la ficha de producto (+0,16 s) y el catálogo completo, que dispara 7
consultas con `count=exact` (+0,40 s, el peor caso).

Eso condicionó la decisión más grande de este trabajo, que se explica abajo.

---

## Lo que se cambió

### 1. El HTML inicial ahora trae contenido para todos (no solo para robots)

`middleware.ts` empezaba con `if (!BOT_UA.test(ua)) return next()`. Los robots recibían
HTML con contenido real y los navegadores el shell vacío de la SPA.

Ahora responde igual para todo el mundo. **Es un cambio de SEO, no de performance**, pero
tiene un costo de performance que conviene tener claro:

- Home, landings, guías y páginas legales: **costo cero** (ya se veía en la tabla).
- Ficha de producto: **+0,16 s de TTFB**. A cambio, el contenido ya viene en el HTML en
  vez de esperar el bundle de React más una consulta a Supabase desde el navegador. Para
  el usuario es un empate o una mejora.
- `/catalogo`: **+0,40 s de TTFB**, el peor caso. Es la única ruta donde el cambio se
  paga sin devolver nada al usuario con JavaScript, porque React vuelve a pedir el catálogo
  igual.

El bloque de contenido va oculto por CSS (`[data-bot-content] { display: none }`) antes del
primer pintado y `src/main.tsx` lo borra al montar React, así que el usuario con JavaScript
no ve un destello de texto sin estilos. Un `<noscript>` lo muestra con estilo mínimo para
quien no tiene JavaScript.

Las respuestas siguen con `cache-control: public, max-age=300, s-maxage=300`. Las rutas de
sesión (`/login`, `/carrito`, `/mi-cuenta`, `/admin`…) se sirven con `private, no-store`
para que el CDN no las cachee nunca.

**Si más adelante el TTFB de `/catalogo` molesta**, la salida limpia es cachearlo más
tiempo (`s-maxage=1800, stale-while-revalidate=86400`): el catálogo completo cambia cuando
se carga un molde nuevo, no cada minuto.

### 2. Caché de imágenes en el navegador: de 1 día a 1 año

`api/img.ts` (el proxy que sirve las fotos del catálogo desde Supabase a través del CDN de
Vercel) mandaba `max-age=86400, s-maxage=31536000`: el CDN cacheaba un año, pero **el
navegador solo un día**. Un visitante que volvía al día siguiente volvía a bajar todas las
fotos del catálogo.

Los nombres de archivo llevan timestamp y nunca se reescriben (por eso el `immutable`), así
que un año en el navegador es seguro. Quedó
`public, max-age=31536000, s-maxage=31536000, immutable`.

Es la mejora de performance con mejor relación esfuerzo/resultado de toda esta tanda: una
línea, y afecta a cada visitante que vuelve.

### 3. El logo de la barra superior ya no mueve el layout

`src/components/layout/Navbar.tsx` servía el logo sin `width` ni `height`. El alto lo fija
el CSS (`h-7 sm:h-9 w-auto`), pero sin las medidas intrínsecas el navegador no sabe cuánto
ancho reservar hasta que baja la imagen, y la barra se corre sola en el primer pintado.
Eso es CLS **en todas las páginas del sitio**.

Se agregaron las medidas reales del archivo (367 × 179) y `decoding="async"`.

### 4. Prioridad de carga en las imágenes que definen el LCP

- `HeroCarousel.tsx`: la primera imagen del carrusel es el elemento LCP de la home. Ya iba
  con `loading="eager"`; ahora suma `fetchPriority="high"` para que el navegador la pida
  antes que el resto, sin esperar a que el CSS descubra que es visible.
- `ProductDetailPage.tsx`: la foto principal de la ficha es su LCP. Suma
  `fetchPriority="high"` y `decoding="async"`.
- `ProductCard.tsx`: **todas** las fotos del catálogo iban con `loading="lazy"`, incluidas
  las de la primera fila. El navegador las dejaba para el final y el LCP del catálogo
  esperaba una imagen que ya estaba en pantalla. Ahora la tarjeta acepta `priority` y
  `CatalogPage` la pasa en las primeras 4.

### 5. Descripciones y títulos que no se cortan

No es performance, pero afecta el CTR igual que la velocidad: 7 meta descriptions pasaban
de 165 caracteres y el 76% de los títulos de ficha pasaba de 80. Detalle en
`seo-audit-products-report.md`.

---

## Lo que ya estaba bien (no se tocó)

- **Imágenes en WebP** y servidas por el CDN de Vercel, no directo de Supabase. Entre 25 y
  120 KB por foto de producto.
- **Contenedores con relación de aspecto fija** (`aspect-square`, `aspect-[3/4]`) en el
  carrusel, las tarjetas de producto y la ficha: el espacio ya estaba reservado, así que
  esas imágenes no producían CLS.
- **Code splitting por ruta**: cada página es un chunk aparte (`React.lazy` en
  `src/App.tsx`).
- **`AdminPage` es el chunk más grande del proyecto (145 KB) y es lazy**: no se descarga en
  ninguna página pública. Se verificó que ningún componente público lo importa.
- **Fuentes con `display=swap`** y `preconnect` a `fonts.googleapis.com`,
  `fonts.gstatic.com` y a Supabase.
- **Assets con hash y caché inmutable** de un año (`vercel.json`).

---

## Pendientes, con su costo real

Ordenados por relación entre lo que mejoran y lo que arriesgan.

### Alto valor, riesgo bajo

1. **Reducir los pesos de fuente que se bajan.** `index.html` pide Inter en 300, 400, 500,
   600 y 700 más Playfair Display en 600 y 700: son 7 archivos de fuente y la hoja de
   estilos de Google Fonts es render-blocking. Si el diseño no usa de verdad los cinco
   pesos de Inter, bajar a 400/600/700 quita 2 pedidos del camino crítico. Es una decisión
   de diseño, no técnica: hay que revisar dónde se usa cada peso antes de tocarlo.

2. **Autohospedar las fuentes** (`.woff2` en `/public/brand/fonts` con `@font-face` y
   `font-display: swap`). Elimina el viaje a `fonts.googleapis.com` del camino crítico y el
   `preconnect` a dos dominios. Es media hora de trabajo y no rompe nada, pero hay que
   verificar la licencia de cada familia (Inter y Playfair Display son SIL OFL, se pueden
   autohospedar).

3. **Bajar el `og-image.png` de 194 KB.** No afecta el LCP del sitio (solo se usa en las
   tarjetas de redes sociales), pero 194 KB para un PNG de 1200 × 630 es mucho: en WebP o
   con un PNG bien cuantizado baja a menos de 60 KB sin diferencia visible.

4. **`modeltex-mark-buzo.png` pesa 56 KB para mostrarse a 28 px de alto.** Es el logo de la
   barra superior, o sea que lo baja cada visitante en cada página nueva. Un WebP de
   367 × 179 debería quedar en menos de 8 KB.

### Valor medio, riesgo medio

5. **Subir el `s-maxage` de `/catalogo` a 1800 s con `stale-while-revalidate`.** Es la ruta
   donde el HTML inicial cuesta más (+0,40 s de TTFB) y su contenido cambia cuando se sube
   un molde nuevo, no cada 5 minutos. Riesgo: un molde nuevo tarda hasta 30 minutos en
   aparecer en el listado que ve un robot. Decisión de Denis.

6. **Reducir las consultas de `/catalogo` en el middleware.** Hoy hace 7 consultas con
   `count=exact` (una por categoría) para armar el listado por secciones. Se puede resolver
   con una sola consulta agrupada, pero PostgREST no agrupa: haría falta una vista o una
   función en Supabase. Es la mejora más grande de TTFB que queda, y también la que más
   trabajo pide.

### Valor alto, riesgo alto (no hacer sin pensarlo)

7. **Redimensionar imágenes en el proxy `api/img.ts`.** Hoy sirve el original (hasta 120 KB)
   aunque la tarjeta del catálogo lo muestre a 300 px de ancho. Servir variantes por ancho
   (`?w=400`) con `srcset` en `ProductCard` ahorraría bastante en móvil. Requiere una
   librería de imágenes en la función serverless, y eso significa tocar una pieza de la que
   depende que se vea CADA foto del catálogo. Si se hace, conviene hacerlo solo y probarlo
   aparte.

8. **SSR o prerender de verdad** (Next.js, o `vite-plugin-ssr`). Resolvería de raíz el
   HTML inicial, el TTFB y la hidratación, pero es reescribir la arquitectura del proyecto.
   No se justifica hoy: el middleware ya entrega el mismo HTML a todos y esa era la falla
   real que había que cerrar.

---

## Medición: GA4 y Search Console

- **GA4 está programado pero apagado en producción.** `src/lib/analytics.ts` está completo
  y bien hecho (no manda datos personales, el `page_view` va a mano sin query string para
  no filtrar el email del comprador invitado). Pero **la variable
  `VITE_GA_MEASUREMENT_ID` no está configurada en Vercel**: se verificó que el HTML
  publicado no carga `googletagmanager.com`. Mientras siga así no hay ni una visita medida.
  Cargar esa variable en Vercel es un campo de texto y un redeploy.
- **La verificación de Search Console no viaja por HTML.** `index.html` tiene el hueco
  preparado (`%VITE_GSC_VERIFICATION%`) y Vite lo borra limpio si la variable no está, así
  que no queda un meta vacío ni un error. **Esto NO significa que Search Console falte**:
  puede estar verificado por DNS, que es el método más robusto. Hay que confirmarlo
  entrando a la cuenta (está en `search-console-checklist.md`).

## Cómo medir después de desplegar

1. Desplegar (`vercel --prod`) y esperar unos minutos a que el CDN se caliente.
2. Medir en PageSpeed Insights, **móvil y escritorio**, estas cuatro URLs, que son los
   cuatro tipos de página del sitio:
   - `https://modeltex.com.ar/`
   - `https://modeltex.com.ar/molderia-digital`
   - `https://modeltex.com.ar/catalogo?categoria=dama`
   - una ficha de producto cualquiera
3. Comparar contra la misma medición hecha antes del deploy. Lo que debería mejorar:
   **CLS** (por el logo con medidas) y **LCP** en catálogo y ficha (por la prioridad de
   carga de las imágenes). Lo que puede empeorar: **TTFB de `/catalogo`**, que es el costo
   consciente de servir el mismo HTML a todos.
4. A los 28 días, revisar Core Web Vitals en Search Console: ahí están los datos de
   usuarios reales, que es lo que Google usa para rankear, no el laboratorio de PageSpeed.
