# Reporte de validación SEO — Modeltex

Generado el 2026-09-16 con `node scripts/seo-check.mjs`.
Origen de las pruebas: **middleware local sobre `dist/`**.

**433 de 433 controles OK.** Sin fallas.

Sitemap: 2146 URLs (2044 fichas de producto), 38 verificadas una por una.

## Qué verifica cada bloque

| Bloque | Qué comprueba |
| --- | --- |
| HTML inicial | title, description, canonical, robots, H1 único, texto legible sin JavaScript, enlaces internos, Open Graph y JSON-LD de cada página pública principal. |
| Paridad por User-Agent | Que la misma URL devuelva el mismo estado HTTP, canonical, robots y H1 a un navegador, Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot y OAI-SearchBot. Es el control anti-cloaking. |
| 404 / noindex | Que producto, guía, curso, término, categoría, paginación y rutas inventadas devuelvan 404 real con noindex, cabecera X-Robots-Tag y sin canonical a la home. |
| Rutas no indexables | Que /lab/ia y las rutas de cuenta/compra/admin lleven noindex en el HTML inicial, sin depender de JavaScript. |
| Paginación del catálogo | Que las páginas válidas sean indexables con rel=prev/next, que ?pagina=1 redirija y que las vistas filtradas no se indexen. |
| Ficha de producto | Schema Product completo, una sola moneda (ARS), sin JSON-LD duplicado y canonical propio. |
| robots.txt | Que las rutas privadas estén bloqueadas para TODOS los grupos de user-agent (incluidos los bots de IA) y las públicas permitidas para todos. |
| sitemap.xml | XML válido, sin duplicados, con lastmod real, sin priority/changefreq, sin rutas privadas ni paginadas, y con cada URL muestreada respondiendo 200 e indexable. |
| llms.txt | Que no enlace rutas privadas y que todas sus URLs respondan 200. |

## Resultados

### HTML inicial — 230/230

Sin fallas.

### Paridad por User-Agent — 24/24

Sin fallas.

### 404 / noindex — 40/40

Sin fallas.

### Rutas no indexables — 18/18

Sin fallas.

### Paginación del catálogo — 9/9

Sin fallas.

### Ficha de producto — 45/45

Sin fallas.

### FAQ visible y coherente — 23/23

Sin fallas.

### robots.txt — 27/27

Sin fallas.

### sitemap.xml — 12/12

Sin fallas.

### llms.txt — 5/5

Sin fallas.

## Conclusión

Todos los controles pasan.
