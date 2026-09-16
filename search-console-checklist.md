# Checklist de Search Console y analítica — Modeltex

Para Denis. Cada punto se hace desde el navegador, sin tocar código.
Generado el 2026-09-16, después del trabajo de SEO técnico de la rama
`seo-aeo-max-optimization`.

Search Console: https://search.google.com/search-console
PageSpeed Insights: https://pagespeed.web.dev

---

## PRIMERO: dos cosas que hay que destrabar

Estas dos no son "revisar", son "hacer". Sin ellas el resto del checklist no tiene datos
que mirar.

### 1. Prender GA4 (10 minutos)

El código de Google Analytics 4 está listo y bien hecho en el sitio, pero **está apagado**:
falta la variable de entorno en Vercel. Verificado el 2026-09-16: el HTML publicado no
carga el script de Google.

- [ ] Entrar a https://analytics.google.com y crear (o encontrar) la propiedad GA4 de
      Modeltex. Copiar el **ID de medición**, que tiene la forma `G-XXXXXXXXXX`.
- [ ] Entrar a https://vercel.com → proyecto de Modeltex → **Settings → Environment
      Variables**.
- [ ] Agregar: nombre `VITE_GA_MEASUREMENT_ID`, valor `G-XXXXXXXXXX`, marcando
      **Production** (y Preview si querés medir también los previews).
- [ ] Volver a desplegar para que la variable entre al build (`vercel --prod`, o Redeploy
      desde el panel de Vercel).
- [ ] Comprobar: entrar al sitio y ver en GA4 → **Informes → Tiempo real** que aparece tu
      visita.

### 2. Confirmar que Search Console está verificado

El sitio **no** verifica por etiqueta HTML (se comprobó: no hay meta de verificación en el
HTML publicado). Eso no quiere decir que falte: **lo más probable es que esté verificado
por DNS**, que es el método más robusto.

- [ ] Entrar a Search Console y ver si aparece `modeltex.com.ar` en el selector de
      propiedades, arriba a la izquierda.
- [ ] Si aparece: listo, no hay nada que hacer. Anotar con qué método está verificado
      (Configuración → Propiedad verificada).
- [ ] Si NO aparece: crear una propiedad de tipo **Dominio** (`modeltex.com.ar`, sin
      `https://` ni `www`) y verificar por DNS con el registro TXT que te da Google. La
      propiedad de tipo Dominio cubre http, https, con y sin `www`, que es lo que
      corresponde acá porque el sitio ya redirige todas esas variantes.
- [ ] Alternativa si el DNS se complica: el sitio tiene preparado el hueco para la etiqueta
      HTML. Se activa cargando la variable `VITE_GSC_VERIFICATION` en Vercel (igual que
      GA4) con el valor `content` que da Google, y volviendo a desplegar.

### 3. Volver a enviar el sitemap

- [ ] Search Console → **Sitemaps** → enviar `https://modeltex.com.ar/sitemap.xml`.
- [ ] Verificar que informe alrededor de **2.146 URLs** descubiertas y estado "Correcto".
      Si dice menos, esperar un día: el sitemap se genera al vuelo con caché de una hora.

> El sitemap cambió en esta tanda: ahora la fecha de `lastmod` es real (sale de la última
> modificación del producto, no de la fecha de alta) y se sacaron `priority` y `changefreq`,
> que Google ignora desde hace años. También entró la página nueva `/molderia-digital`.

### 4. Aplicar la migración de Supabase que hace real el `lastmod`

- [ ] Entrar a https://supabase.com → proyecto de Modeltex → **SQL Editor** → **New query**.
- [ ] Pegar TODO el contenido del archivo
      `supabase/migrations/20260915120000_041_products_updated_at.sql` y apretar **Run**.
- [ ] Es seguro correrlo más de una vez: no borra ni cambia ningún dato de los moldes, solo
      agrega la columna `updated_at` y el disparador que la mantiene al día.

> Mientras no se corra, el sitio **no se rompe**: el sitemap detecta que la columna no
> existe y sigue usando la fecha de alta, como antes. Pero el `lastmod` no mejora hasta que
> se ejecute.

---

## Cobertura: páginas enviadas contra páginas indexadas

Search Console → **Indexación → Páginas**.

- [ ] Anotar el número de **Páginas indexadas** y el de **No indexadas**.
- [ ] Abrir la lista de motivos de exclusión y anotar cuántas hay en cada uno. Los que
      importan:
  - **"Página con redirección"**: es normal y esperable. Si el número es alto, revisar
    que no haya links internos apuntando a URLs viejas de producto (`src/lib/slugRedirects.ts`
    tiene el mapa de las redirecciones que existen).
  - **"Excluida por la etiqueta noindex"**: debería incluir `/lab/ia` y las rutas de cuenta
    y compra. **Eso es correcto y es lo que se buscaba.** Si aparece alguna ficha de
    producto o una guía acá, avisar: eso sí sería un problema.
  - **"No encontrada (404)"**: acá van a empezar a aparecer las paginaciones inválidas del
    catálogo (`?pagina=99` y parecidas) y cualquier URL inventada. **También es correcto**:
    antes esas URLs devolvían 200 e indexable, y ese era justamente uno de los problemas
    que se corrigieron.
  - **"Rastreada: actualmente sin indexar"**: es el motivo a vigilar. Si hay muchas fichas
    de producto acá, Google las ve pero no las considera lo bastante distintas. Se ataca
    con lo que dice `seo-audit-products-report.md` (frases de prenda y fichas duplicadas).
  - **"Página alternativa con etiqueta canónica adecuada"**: acá deberían caer las vistas
    filtradas del catálogo (`?formato=`, `?busqueda=`). Correcto.
- [ ] Comparar el total indexado contra las 2.146 del sitemap. Si la diferencia es grande
      (más del 30%), volver a revisar este checklist en 30 días antes de sacar conclusiones:
      Google tarda semanas en digerir un catálogo de 2.000 URLs.

---

## Inspección de URL, una por una

Search Console → pegar la URL en la barra de búsqueda de arriba → **Inspeccionar URL**.
En cada una, mirar tres cosas: que diga **"La URL está en Google"**, apretar **"Probar URL
publicada"** y en el resultado revisar **HTML probado** y **Mejoras** (los datos
estructurados detectados).

### Páginas comerciales

- [ ] `https://modeltex.com.ar/moldes-pdf` — esperar: CollectionPage, FAQPage, BreadcrumbList.
- [ ] `https://modeltex.com.ar/moldes-pdf-a4` — esperar: CollectionPage, FAQPage, BreadcrumbList.
- [ ] `https://modeltex.com.ar/moldes-para-plotter` — esperar: CollectionPage, FAQPage, BreadcrumbList.
- [ ] `https://modeltex.com.ar/molderia-digital` — **página nueva**. Pedir indexación a mano
      con el botón **"Solicitar indexación"**: es la única forma de que Google la vea en
      días en vez de semanas. Esperar: WebPage, FAQPage, BreadcrumbList.
- [ ] `https://modeltex.com.ar/moldes-gratis` — esperar: CollectionPage, FAQPage, BreadcrumbList.
- [ ] `https://modeltex.com.ar/catalogo` — esperar: ItemList, BreadcrumbList.
- [ ] `https://modeltex.com.ar/lab` — esperar: **ItemList con cursos adentro** (es nuevo:
      antes Google no leía el Lab como un curso).

### Diez fichas de producto

Elegir 10 del catálogo mezclando categorías (por ejemplo 4 de dama, 2 de hombre, 2 de niña,
1 de bebés, 1 unisex). En cada una revisar:

- [ ] Que el `<title>` que muestra el HTML probado arranque con la **frase de la prenda**,
      no con el nombre interno. Ejemplo de cómo debería verse ahora:
      `Top deportivo con espalda de tiras — molde PDF para dama (79) | Modeltex`
- [ ] Que en **Mejoras** aparezca **Fragmentos destacados de producto** sin errores, con
      precio, disponibilidad y moneda **ARS**. Antes la misma URL declaraba precios en ARS
      y en USD a la vez y Google podía descartar el resultado enriquecido entero.
- [ ] Que aparezca **Rutas de exploración** (BreadcrumbList) y **Preguntas frecuentes**.
- [ ] Anotar cualquier ficha que dé error de datos estructurados, con el motivo.

### Cinco guías

- [ ] `https://modeltex.com.ar/guias/formatos-de-molderia-digital`
- [ ] `https://modeltex.com.ar/guias/como-hacer-moldes-de-ropa-paso-a-paso`
- [ ] `https://modeltex.com.ar/guias/curva-de-talles-industrial`
- [ ] `https://modeltex.com.ar/guias/tizada-computarizada-mrk`
- [ ] `https://modeltex.com.ar/guias/moldes-para-sublimacion`

En cada una, esperar **Article** y **BreadcrumbList** sin errores.

### Una comprobación de que los 404 funcionan

- [ ] Inspeccionar `https://modeltex.com.ar/catalogo?categoria=dama&pagina=99`.
      **Tiene que decir que NO está en Google y devolver 404.** Antes devolvía 200 con un
      H1 que decía "página 99 de 1". Si sigue dando 200, el deploy no salió.
- [ ] Inspeccionar `https://modeltex.com.ar/lab/ia`. Tiene que dar 200 pero con **noindex**.

---

## Resultados enriquecidos

Search Console → **Experiencia y Mejoras** (el menú cambia de nombre según la cuenta).

- [ ] **Fragmentos de producto**: anotar válidos, con advertencias y con errores. Los
      errores de precio o moneda deberían desaparecer en las próximas semanas.
- [ ] **Rutas de exploración**: debería cubrir prácticamente todo el sitio.
- [ ] **Preguntas frecuentes**: revisar que no haya errores. Todas las FAQ marcadas ahora
      están visibles en la página (se verifica automáticamente con
      `node scripts/seo-check.mjs`).
- [ ] **Cursos**: puede tardar en aparecer. Es nuevo.
- [ ] Complementar con el validador de Google, que da más detalle por URL:
      https://search.google.com/test/rich-results

---

## Rendimiento en buscadores

Search Console → **Rendimiento → Resultados de búsqueda**.

### Últimos 3 meses

- [ ] Anotar clics, impresiones, CTR medio y posición media.
- [ ] Pestaña **Consultas**, ordenar por impresiones. Anotar las 20 primeras y, al lado de
      cada una, si tiene una página del sitio dedicada. Las que nos interesan:
      moldes en PDF · moldes para imprimir · moldería digital · moldes gratis ·
      moldes en PDF A4 · moldería textil · moldes digitales · moldes para sublimar ·
      moldes para descargar
- [ ] Pestaña **Páginas**, ordenar por impresiones. Anotar las 20 primeras.

### Últimos 6 meses

- [ ] Lo mismo, para ver tendencia. Si las impresiones suben pero los clics no, el problema
      es el título y la descripción (CTR), no el posicionamiento.

### Páginas con impresiones pero sin clics

- [ ] Filtrar por posición media entre 5 y 20 y ordenar por impresiones. Esas son las
      páginas que Google ya muestra y nadie abre: ahí el arreglo es el título y la
      descripción, y es el trabajo con mejor retorno de todo el SEO.
- [ ] Para cada una, revisar en el sitio si el título dice claro **qué se compra**. Si no,
      corregirlo (en `/admin` si es una ficha; en el código si es una página fija).

### Páginas con clics pero sin conversión

- [ ] Cruzar las páginas con más clics de Search Console contra los pedidos reales del
      panel de Modeltex. Una página con muchos clics y cero consultas por WhatsApp suele
      tener un problema de CTA, no de SEO.

---

## Core Web Vitals

Search Console → **Experiencia → Core Web Vitals**.

- [ ] Anotar el estado de **Móvil** y de **Escritorio**: cuántas URLs buenas, a mejorar y
      malas.
- [ ] Si hay grupos de URLs marcados como "malos", anotar la métrica (LCP, INP o CLS) y un
      ejemplo de URL.
- [ ] Medir en PageSpeed Insights, móvil y escritorio, estas cuatro:
      `/` · `/molderia-digital` · `/catalogo?categoria=dama` · una ficha cualquiera.
- [ ] Comparar contra `seo-performance-notes.md`, que explica qué debería mejorar (CLS y
      LCP) y qué puede empeorar (TTFB del catálogo) y por qué.

> Importante: Core Web Vitals en Search Console usa datos de **usuarios reales de los
> últimos 28 días**. Recién a las 4 semanas del deploy se ve el efecto completo. PageSpeed
> Insights, en cambio, mide en el momento: sirve para comparar antes y después el mismo día.

---

## Recomendaciones que quedaron fuera del código

### Google Business Profile (SEO local)

Ya figura como pendiente en tus notas. **No se agregó el schema `LocalBusiness` al sitio a
propósito**: ese marcado implica un local al que el cliente va, con horario de atención al
público, y hoy no hay horario de local confirmado ni perfil de Google Business creado.
Inventar horarios para llenar un schema sería peor que no tenerlo.

- [ ] Decidir si Modeltex atiende al público en Olmos 1838, Gregorio de Laferrère.
- [ ] **Si atiende**: crear el Google Business Profile, cargar el horario real, y avisar
      para agregar `LocalBusiness` con ese horario (los datos ya están en
      `src/lib/siteConfig.ts`, listos para usarse).
- [ ] **Si no atiende al público** (solo venta digital): dejarlo como está. El schema
      `Organization` con la dirección ya cubre el caso correctamente.

### Bing

- [ ] Verificar el sitio también en Bing Webmaster Tools (https://www.bing.com/webmasters).
      Se puede importar la propiedad directo desde Search Console en dos clics. Bing
      alimenta a ChatGPT y a Copilot, así que importa para AEO.

### Volver a medir

- [ ] Guardar una copia de este checklist con los números anotados y la fecha.
- [ ] Repetirlo a los 30 días y comparar. Sin la comparación, los números sueltos no dicen
      nada.
