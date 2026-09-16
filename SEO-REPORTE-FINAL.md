# Reporte final — SEO técnico, AEO y GEO de Modeltex

Rama `seo-aeo-max-optimization`, mergeada a `main` · 12 commits · 52 archivos · 2026-09-16

> **PUBLICADO.** Los cambios están en vivo en https://modeltex.com.ar desde el 2026-09-16.
> Verificado contra el sitio real: `npm run seo:live` → 464/464, en tres corridas seguidas.
> Las 28 rutas de la app responden 200 (ninguna da 404 a un usuario), el sitemap publica
> 2.146 URLs sin `priority` ni `changefreq`, y las cuatro fallas originales dan el mismo
> resultado para navegador, Googlebot y ClaudeBot.

Documentos que acompañan a este:

| Archivo | Qué tiene |
| --- | --- |
| `seo-validation-report.md` | Los 464 controles automáticos y su resultado. Se regenera con `npm run seo`. |
| `seo-audit-products-report.md` | Auditoría de las 2.044 fichas, con ejemplos clicables. Se regenera con `npm run seo:productos`. |
| `seo-performance-notes.md` | Qué se cambió de performance, con mediciones reales, y los 8 pendientes con su riesgo. |
| `search-console-checklist.md` | **Para vos, sin tocar código.** Lo que hay que hacer y revisar en Search Console. |

---

## Resumen ejecutivo

Se corrigieron las cuatro fallas de indexación que traía el sitio, se unificó el HTML que
reciben usuarios y robots, y se construyó la página que faltaba para competir por
"moldería digital". Además quedó un arnés de 464 controles automáticos que corre en 40
segundos y ejecuta el middleware real contra el build real, así que estas correcciones no se
pueden romper en silencio.

**Las cuatro fallas, antes y ahora:**

| | Antes | Ahora |
| --- | --- | --- |
| Ruta inexistente | 200 + indexable para un navegador, 404 para Googlebot | 404 real para todos |
| `?pagina=99` en una categoría de 15 páginas | 200, indexable, H1 "página 99 de 1" | 404 real |
| `/lab/ia` | `index, follow` + canonical a la home en el HTML inicial | `noindex` en el HTML y en la cabecera |
| `lastmod` del sitemap | Fecha de alta en las 2.044 fichas | Última modificación real |

**El cambio más grande**, y el que hay que entender antes de desplegar: el middleware
arrancaba con `if (!BOT_UA.test(ua)) return next()`. Los robots recibían HTML con contenido
real y los navegadores el shell vacío de la SPA. La misma URL respondía distinto según el
User-Agent — eso es la definición técnica de cloaking, aunque la intención fuera buena, y
era la causa de que una ruta inventada diera 404 a Google y 200 a una persona.

Ahora la respuesta **no depende del User-Agent**. Mismo estado HTTP, mismo canonical, mismo
robots, mismo H1 y el mismo contenido para un navegador, Googlebot, Bingbot, GPTBot,
ClaudeBot, PerplexityBot y OAI-SearchBot. Se verifica automáticamente comparando las 7
respuestas de la misma URL.

---

## Lo que se corrigió, por problema

### 1. HTML inicial común (Fase 2.1)

- Se quitó el filtro por User-Agent. Todo visitante recibe el HTML con título, descripción,
  canonical, robots, H1, texto legible, enlaces internos, JSON-LD y el estado HTTP correcto.
- `index.html` oculta el bloque estático por CSS antes del primer pintado y `main.tsx` lo
  borra al montar React, así que el usuario con JavaScript **no ve un destello de texto sin
  estilos**. Un `<noscript>` lo muestra con estilo mínimo legible para quien no tiene
  JavaScript (y para GPTBot, ClaudeBot, PerplexityBot y Bingbot, que no ejecutan JS).
- Las 33 rutas de la SPA que no son contenido público (cuenta, compra, panel) se sirven con
  su título y canonical propios, `noindex` real y `private, no-store` para que el CDN nunca
  cachee una página de sesión.
- **Costo:** medido con `curl` sobre el sitio publicado. Cero en home, landings, guías y
  legales. +0,16 s de TTFB en la ficha de producto (que a cambio ya trae el contenido en el
  HTML). +0,40 s en `/catalogo`, que es el peor caso y el único donde se paga sin devolver
  nada al usuario con JavaScript. Está explicado en `seo-performance-notes.md` con la salida
  si algún día molesta.

### 2. Paginación (Fase 2.2)

- `?pagina=` fuera de rango → **404 real**. Antes cualquier número generaba una URL
  "válida" distinta: basura indexable infinita.
- `?pagina=0`, `-1`, `abc`, `1.5` → 404.
- `?pagina=1` explícito → **301** a la URL sin el parámetro (no hay dos URLs con el mismo
  contenido).
- `?categoria=` inexistente → 404, en vez de servir el catálogo entero bajo una URL
  inventada.
- Vistas filtradas (`?formato=`, `?busqueda=`, `?temporada=`, `?orden=`) → `noindex, follow`
  y canonical al catálogo limpio. Son combinaciones infinitas de la misma grilla; el
  `follow` deja pasar el valor de los enlaces a productos.
- Las páginas válidas siguen indexables, con `rel=prev`/`rel=next` y el total real en el H1.

### 3. Sitemap con `lastmod` real (Fase 2.3)

- Productos: `updated_at`, con `created_at` como respaldo.
- Categorías: la fecha del producto más reciente que contienen.
- Cursos del Lab: la fecha de su clase más nueva.
- Guías: su fecha `updated` real.
- Páginas fijas: la fecha de su última edición de contenido.
- **Fuera `<priority>` y `<changefreq>`**: Google y Bing los ignoran desde hace años.
- 2.146 URLs, sin duplicados, todas con `lastmod` válido, ninguna privada, ninguna paginada,
  y las 38 muestreadas responden 200, indexables y autocanónicas.

> **Requiere una acción tuya:** la columna `updated_at` no existía en la base. Hay que pegar
> `supabase/migrations/20260915120000_041_products_updated_at.sql` en el SQL Editor de
> Supabase (paso a paso en `search-console-checklist.md`). **Mientras no se corra el sitio no
> se rompe**: el sitemap detecta que la columna falta y sigue con la fecha de alta.

### 4. 404 reales (Fase 2.4)

- Producto, guía, curso, clase, término, categoría, paginación y cualquier URL inventada:
  404 con `noindex`, cabecera `X-Robots-Tag` y **canonical a la propia URL, nunca a la
  home**. Canonicalizar miles de URLs basura hacia "/" le estaba mandando a Google la señal
  de que todas eran duplicados de la home.
- Funciona igual para navegador, Googlebot, Bingbot y bots de IA, sin depender de JavaScript.

### 5. Schema Product (Fase 3.5)

- **Una sola moneda por URL.** La misma ficha declaraba ofertas en ARS y en USD: para Google
  son ofertas contradictorias (no hay forma de saber cuál es el precio de esa página) y
  puede descartar el resultado enriquecido entero. Queda una `Offer` en ARS con el mismo
  "desde" que ve el comprador. El precio en dólares sigue existiendo para el comprador del
  exterior, pero no se marca: modeltex.com.ar es el sitio argentino.
- El schema es **idéntico** en el middleware y en `ProductDetailPage.tsx`, así que no cambia
  al hidratar. Incluye `name`, `description`, `image`, `url`, `sku`, `brand`, `category`,
  `availability`, `itemCondition`, `seller`, `hasMerchantReturnPolicy` y
  `additionalProperty` con talles, formatos y telas.
- `aggregateRating` solo si hay reseñas reales. Nunca un rating inventado.

### 6. Article en guías (Fase 3.6)

Las 32 guías ya tenían `Article` con `headline`, `description`, `datePublished`,
`dateModified`, `author` (persona real), `publisher`, `image`, `mainEntityOfPage` y
`BreadcrumbList`. Se verificó que no haya JSON-LD duplicado.

**Dato que vale la pena:** las 20 consultas de tu investigación de keywords (top 10 de
Google y top 10 de prompts de IA sobre moldería textil) **ya tienen las 20 guías
correspondientes publicadas**. Cobertura completa, verificada una por una.

### 7. Course en el Lab (Fase 3.7)

- Google tiene dos marcados de curso distintos: un `Course` suelto para la página de UN
  curso, y un `ItemList` de `Course` para la página que los LISTA. `/lab` declaraba un
  `CollectionPage` con `ListItem` sueltos, que **Google no lee como cursos**: se perdía el
  resultado enriquecido justo en la página que resume el curso gratis. Corregido.
- Cada `Course` suma `teaches` (los objetivos cargados) y `syllabusSections` (los módulos
  publicados, en orden): las dos propiedades que le dicen a Google de qué se trata sin
  adivinarlo del texto. Todo dato real de la base.
- 3 cursos, 12 módulos, 34 clases y 5 términos de glosario publicados. El glosario con
  `DefinedTerm`, las clases con `Article` y `HowTo` cuando tienen paso a paso.

### 8. Organization, WebSite y Person (Fase 3.8)

- `siteConfig.ts` dice ser la fuente única de los datos institucionales, pero
  `buildOrganizationSchema()` **no se usaba en ningún lado**: el JSON-LD de `index.html` era
  una copia escrita a mano y ya se había separado. El mismo número aparecía en dos formatos
  dentro del MISMO JSON-LD y la `url` del Organization no coincidía con el canonical de la
  home. Corregido, y ahora hay un control que compara los dos campo por campo.
- `/quienes-somos` suma un `Person` del fundador con `@id` estable (E-E-A-T). Si el dato no
  estuviera confirmado la función devuelve `null` y no se marca nada: antes ningún autor que
  uno inventado.
- **No se agregó `LocalBusiness`**, a propósito: implica un local al que el cliente va, con
  horario de atención al público, y hoy no hay horario confirmado ni Google Business Profile
  creado (figura como pendiente en tus notas). Inventar horarios para llenar un schema sería
  peor que no tenerlo. La decisión quedó planteada en el checklist.

### 9. robots.txt (Fase 4.9)

Un rastreador usa **UN SOLO grupo**, el más específico que lo nombre, e ignora por completo
`User-agent: *`. Los bots de IA tenían su propio grupo con nada más que `Allow: /`, así que
para GPTBot, ClaudeBot, PerplexityBot y compañía **`/admin`, `/checkout`, `/mi-cuenta` y
`/mi-pedido` (que lleva el email del comprador invitado en la URL) estaban permitidos.**

La lista de rutas privadas ahora está repetida en los dos grupos, y suma `/mi-pedido`,
`/legal/`, `/lab/ia` y `/api/`, que no estaban en ninguno. Se verifican 13 rutas privadas
contra los 19 grupos de user-agent, y 12 rutas públicas para confirmar que ninguna quedó
bloqueada de más.

### 10. `/lab/ia` (Fase 4.10)

`noindex` y canonical propio en el HTML inicial y en la cabecera `X-Robots-Tag`, sin
depender de JavaScript. Bloqueada también en robots.txt y fuera del sitemap.

### 11. llms.txt y llms-full.txt (Fase 4.11)

`llms.txt` reescrito **por intención de búsqueda** en vez de una lista plana: moldería
digital, moldes en PDF, PDF A4, plotter, gratis, para descargar, para sublimar, a medida,
curso gratis, catálogo, guías, contacto. Sin rutas privadas, sin URLs rotas (se verifican
las 55 una por una) y sin prometer nada que el sitio no haga. `llms-full.txt` suma las
páginas comerciales que faltaban y dejó de enlazar `/lab/ia`.

### 12. Página pilar `/molderia-digital` (Fase 5.12)

La intención "moldería digital" estaba repartida entre `/moldes-pdf`, `/moldes-pdf-a4`,
`/moldes-para-plotter` y varias guías, sin una página que respondiera la consulta general y
repartiera el tráfico hacia la correcta.

La página nueva tiene: qué es la moldería digital · **tabla comparativa de los siete
formatos** (PDF A4, plotter, DXF/AAMA, PDS, ADS, MRK, cartón) con para quién es cada uno y
qué mirar · cuándo conviene un molde listo y cuándo moldería a medida · cómo se usa en
producción · cómo imprimir o mandar a plotter · qué cambia en un molde para sublimar · cómo
pedir desde una foto o una prenda física · entrega, pagos y licencia · **10 preguntas
frecuentes visibles** · **28 enlaces internos**.

Schema: `WebPage` + `BreadcrumbList` + `FAQPage`. El texto vive en un solo módulo que usan
tanto la página React como el middleware: no hay una versión para robots y otra para
usuarios.

**No se inventó una comparación "Modeltex vs Moldey".** Moldey no aparece en ninguna página
pública del sitio (solo en notas internas y en código heredado del fork), así que
introducirlo crearía una confusión que hoy no existe.

### 13 y 14. Páginas comerciales y enlazado interno (Fase 5)

Esta era la falla de contenido más concreta. El HTML inicial de las páginas comerciales eran
callejones sin salida:

| Página | Enlaces internos antes | Ahora |
| --- | --: | --: |
| `/moldes-para-plotter` | 1 | 19 |
| `/moldes-gratis` | 1 | 19 |
| `/diseno-a-pedido` | 1 | 19 |
| `/preguntas-frecuentes` | 1 | 18 |
| `/moldes-pdf-a4` | 2 | 18 |
| `/moldes-pdf` | 3 | 18 |
| `/lab` | 7 | 24 |

`/preguntas-frecuentes` tenía 21.000 caracteres de contenido útil y **ni un solo enlace al
catálogo**. La autoridad que llegaba ahí no bajaba a ningún lado y las fichas quedaban
alcanzables casi solo desde el sitemap, sin texto de anclaje que dijera de qué son.

El sistema de enlaces (`src/lib/internalLinks.ts`) define un bloque curado por ruta —
páginas hermanas, las 7 categorías del catálogo y guías relacionadas, con texto de anclaje
descriptivo — que renderizan el middleware y React desde la misma fuente. Los cuerpos de las
cinco landings se ampliaron con beneficios concretos, explicación del formato y CTA de
compra, sin relleno.

### 15. Auditoría de las 2.044 fichas (Fase 6)

`npm run seo:productos` revisa las 2.044 fichas con las **mismas funciones que usan la app y
el middleware** (no una aproximación) y aplica 15 controles.

**El catálogo está mucho mejor de lo que sugería la auditoría inicial:** cero fichas sin
imagen, sin precio, sin categoría, sin descripción, sin talles y sin temporada. Los títulos
genéricos tipo "CAMPERA — molde digital para dama" son **11, no una plaga**. Sitemap y
catálogo coinciden exacto: 0 URLs de más, 0 de menos.

Lo que sí había, y se corrigió en código: **el 76% de los títulos pasaba de 80 caracteres**
(promedio 85, máximo 120). Google muestra unos 60, así que cortaba justo ANTES de "molde
digital para dama", que es la parte que la gente busca. Encima arrancaba con el nombre
interno ("TOP DAMA", repetido en 43 fichas; en un caso un identificador de importación
ilegible de 49 caracteres).

Antes: `TOP DAMA 79 — top deportivo con espalda de tiras, molde digital para dama`
Ahora: `Top deportivo con espalda de tiras — molde PDF para dama (79)`

Promedio 74, máximo 95, y **la cantidad de títulos únicos quedó igual** (2.038 de 2.044).
Una primera versión apretaba a 75 caracteres y bajaba el promedio a 69, pero al recortar la
frase dos moldes distintos ("campera aviador con cuello de piel" y "…de pelo") terminaban
con el MISMO título: se descartó, cambiaba un problema real por uno peor.

Lo que queda para vos, en el reporte con links clicables: **6 pares de fichas duplicadas de
verdad**, 11 fichas con un código viejo en `garment_type` en vez de una frase, 31 sin
formatos cargados. Y 1.548 slugs sin palabras clave, donde la recomendación explícita es
**no cambiarlos en masa**: reescribir 1.548 URLs resetea el historial de indexación de cada
una y la ganancia por ficha es chica.

### 16 y 17. AEO: respuestas directas y FAQ coherente (Fase 7)

Había un problema que no estaba en la auditoría: **cada página comercial tenía DOS juegos de
preguntas frecuentes, uno en su archivo React y otro en el middleware, y ya se habían
separado.** `/moldes-pdf` mostraba 8 preguntas al usuario y 7 al robot; `/moldes-pdf-a4`, 4
y 3; `/moldes-para-plotter` tenía una pregunta en React que el robot no veía y otra en el
middleware que el usuario no veía. **Un `FAQPage` cuya respuesta el visitante no puede leer
es exactamente lo que Google marca como inválido.**

Ahora hay una sola lista por ruta (`src/lib/landingFaqs.ts`), y un control automático
verifica que toda pregunta marcada esté visible en el HTML y que ninguna se repita entre
páginas. Se sumaron las respuestas AEO que faltaban, escritas para responder en la primera
oración (que es lo que levanta un buscador con IA): cómo se imprimen los moldes PDF, qué
necesito para usar un molde descargable, si sirven para sublimar, dónde descargar moldes
gratis, si Modeltex hace diseños a pedido y si se puede pedir un molde desde una foto.
`/ayuda-impresion` y `/diseno-a-pedido` no tenían FAQ: ahora sí, visible y marcada.

### 18 y 19. Performance y medición (Fase 8)

Detalle completo en `seo-performance-notes.md`, con las mediciones reales. Lo hecho:

- **Caché de imágenes en el navegador: de 1 día a 1 año.** El CDN cacheaba un año pero el
  navegador solo un día, así que un visitante que volvía al día siguiente bajaba de nuevo
  todas las fotos del catálogo. Los nombres llevan timestamp y nunca se reescriben. Una
  línea, y afecta a cada visitante que vuelve.
- **CLS en todas las páginas:** el logo de la barra superior iba sin `width`/`height`, así
  que la barra se corría sola en el primer pintado. Corregido con las medidas reales.
- **Prioridad de carga** en las tres imágenes que definen el LCP de cada tipo de página. En
  el catálogo, TODAS las fotos iban con `loading="lazy"`, incluidas las de la primera fila:
  el LCP esperaba una imagen que ya estaba en pantalla.

Y dos hallazgos de medición que necesitan acción tuya:

- **GA4 está programado y bien hecho, pero APAGADO en producción.** Falta la variable
  `VITE_GA_MEASUREMENT_ID` en Vercel: se verificó que el HTML publicado no carga el script
  de Google. **Mientras siga así no hay ni una visita medida.**
- **La verificación de Search Console no viaja por HTML.** Eso NO significa que falte: puede
  estar por DNS, que es mejor. Hay que confirmarlo entrando a la cuenta.

---

## Validaciones ejecutadas

```bash
npm run build       # OK
npm run typecheck   # 4 errores, los mismos 4 que ya estaban antes de tocar nada
npm run lint        # 73 problemas, los mismos 73 de antes. Ninguno en archivos nuevos
npm run seo         # 464/464 controles OK
npm run seo:productos
```

`npm run seo` compila `middleware.ts` con esbuild y lo **ejecuta de verdad** contra el build
local, con el pedido interno de `/index.html` interceptado. No simula: corre el mismo código
que va a correr en Vercel. Con `npm run seo:live` corre los mismos controles contra el sitio
publicado.

Los 464 controles cubren: HTML inicial de 15 páginas · paridad de 7 user-agents en 6 rutas ·
10 tipos de 404 · 6 rutas no indexables · paginación · 5 fichas de producto · las 33 rutas de
la SPA · robots.txt contra 19 grupos · sitemap y sus 38 URLs muestreadas · llms.txt y sus 55
URLs · FAQ visible · Course del Lab · Organization contra `siteConfig.ts`.

### Errores preexistentes que NO toqué

Están en archivos que no tienen que ver con SEO, y arreglarlos habría mezclado cambios sin
relación con este trabajo. Uno merece atención:

- **`src/components/ui/FreeMoldCard.tsx:50` — `Property 'name' does not exist on type
  'FreeMold'`.** Es un error real de tipos en la tarjeta de moldes gratis, no una advertencia
  de estilo. Vale revisarlo aparte.
- `FloatingPatterns.tsx:37` y `AdminPage.tsx:56,68`: variables declaradas y no usadas.

---

## Riesgos pendientes

1. **El TTFB de `/catalogo` sube ~0,40 s.** Es el costo consciente de servir el mismo HTML a
   todos. La salida, si molesta, está documentada: subir el `s-maxage` de esa ruta a 1800 s
   con `stale-while-revalidate`. Es una decisión tuya, no técnica.
2. **La migración de Supabase todavía no está aplicada.** Hasta que se pegue el SQL, el
   `lastmod` de las fichas sigue siendo la fecha de alta. El sitio no se rompe.
3. **`api/sitemap.ts` duplica a mano los slugs y las fechas de las 32 guías**, porque Vercel
   no deja importar código de `src/` desde `api/` en este proyecto. Ya existía; lo nuevo es
   que `npm run seo` **falla si esa copia se desincroniza**.
4. **Los 1.548 slugs sin palabras clave siguen ahí, a propósito.** Cambiarlos en masa es la
   mejora con más potencial y también la más riesgosa.
5. **`/lab` tardó 0,33 s más de lo previsto.** Lo agregó el `syllabusSections` del schema
   `Course`: la página pasó de una consulta a dos. No estaba en la estimación previa. La
   salida está en `seo-performance-notes.md`.

---

## Qué hacer ahora, en orden

Ya está publicado y verificado por máquina. Lo que queda:

1. **Mirar el sitio con los ojos.** Es lo único que no pude hacer: el preview del navegador
   de mi sesión quedó enganchado al servidor de desarrollo de Moldey de otra sesión y no
   llegaba al de Modeltex. Entrá a modeltex.com.ar y probá la home, el catálogo, una ficha,
   `/molderia-digital`, y sobre todo **una compra de punta a punta** (agregar al carrito,
   checkout, pago). Los 464 controles cubren el HTML, el estado HTTP y los datos
   estructurados; no cubren que un botón se vea bien ni que el pago funcione.
2. **Pegar el SQL de la migración 041 en Supabase.** Hasta que se corra, el `lastmod` de las
   fichas sigue siendo la fecha de alta. Paso a paso en `search-console-checklist.md`.
3. **Cargar `VITE_GA_MEASUREMENT_ID` en Vercel** y volver a desplegar. Sin eso no hay ni una
   visita medida.
4. **Hacer el `search-console-checklist.md` completo**, anotando los números. Volver a enviar
   el sitemap y pedir indexación a mano de `/molderia-digital`, que es nueva.
5. **Medir en PageSpeed Insights** las cuatro URLs que indica `seo-performance-notes.md`,
   móvil y escritorio, para tener la línea de base de después del deploy.
6. **Repetir el checklist a los 30 días** y comparar. Sin la comparación, los números sueltos
   no dicen nada.

Y con calma, cuando haya tiempo: las 11 frases de prenda, los 6 pares de fichas duplicadas y
los 31 formatos faltantes de `seo-audit-products-report.md`.

### Si algo sale mal

El deploy anterior sigue disponible. Dos caminos:

- **Rápido, desde el navegador:** entrar a Vercel → proyecto → Deployments → buscar el deploy
  anterior a este (`bfdf8bc`) → botón **Promote to Production**. Tarda segundos y no toca el
  código.
- **Desde git:** `git revert --no-commit 0b7ec72..bfdf8bc` seguido de un commit y un push. Al
  hacer push, Vercel publica solo.
