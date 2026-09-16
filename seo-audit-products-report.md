# Auditoría de las fichas de producto — Modeltex

Generado el 2026-09-16 con `node scripts/seo-audit-products.mjs`.

**2044 fichas activas revisadas.** 12 tienen algún problema de **prioridad alta** (los que afectan la indexación o el resultado enriquecido). 2037 tienen al menos una observación de cualquier nivel (99.7%), pero ese número está dominado por dos cosas de prolijidad —código interno y slug— que se explican al final y que NO conviene corregir en masa.

El script aplica las mismas funciones que usan la app y el middleware para armar el título, el H1 y la descripción (`src/lib/productContent.ts`), así que lo que se audita es exactamente lo que ve Google.

## Resumen

| Prioridad | Problema | Fichas | % |
| --- | --- | --: | --: |
| alto | Sin imagen principal | 0 | 0.0% |
| alto | Sin ningún precio en pesos | 0 | 0.0% |
| alto | Categoría vacía o desconocida | 0 | 0.0% |
| alto | Sin descripción (corta ni larga) | 0 | 0.0% |
| alto | Título idéntico a otra ficha | 12 | 0.6% |
| medio | Descripción de menos de 60 caracteres | 0 | 0.0% |
| medio | Título genérico (garment_type es un código, no una descripción) | 11 | 0.5% |
| medio | Nombre de menos de 6 caracteres | 25 | 1.2% |
| medio | Sin talles cargados | 0 | 0.0% |
| medio | Sin formatos cargados | 31 | 1.5% |
| medio | El <title> pasa de 80 caracteres | 302 | 14.8% |
| bajo | Sin código interno | 1988 | 97.3% |
| bajo | Slug poco descriptivo | 1548 | 75.7% |
| bajo | Sin telas recomendadas | 11 | 0.5% |
| bajo | Sin temporada | 0 | 0.0% |

## Coherencia con el sitemap

- URLs de producto en el sitemap que no corresponden a una ficha activa: **0** — ninguna.
- Fichas activas que no están en el sitemap: **0** — ninguna.

## Detalle por problema

### Sin imagen principal

Prioridad **alto** · 0 fichas (0.0%)

Sin main_image_url la ficha no puede aparecer en Google Imágenes ni mostrar foto en el resultado enriquecido, y el schema Product queda incompleto.

Sin casos.

### Sin ningún precio en pesos

Prioridad **alto** · 0 fichas (0.0%)

Sin precio ARS el schema Product sale sin offers: Google no muestra precio ni disponibilidad y descarta el resultado enriquecido de producto.

Sin casos.

### Categoría vacía o desconocida

Prioridad **alto** · 0 fichas (0.0%)

Sin categoría válida la ficha no aparece en ninguna página de categoría, no tiene miga de pan completa y el sufijo del título sale vacío.

Sin casos.

### Sin descripción (corta ni larga)

Prioridad **alto** · 0 fichas (0.0%)

La meta description se arma con la descripción: sin ella Google inventa el snippet con texto de plantilla, igual en decenas de fichas.

Sin casos.

### Título idéntico a otra ficha

Prioridad **alto** · 12 fichas (0.6%)

Dos URLs distintas con el mismo <title> compiten entre sí: Google elige una y trata al resto como duplicado.

| Ficha | Código | Categoría | Título que se publica hoy |
| --- | --- | --- | --- |
| [ABRIGO 44](https://modeltex.com.ar/producto/abrigo-44) | — | dama | Campera aviador con cuello de borrego — molde PDF para dama (44) |
| [SHORT NIÑA 18](https://modeltex.com.ar/producto/short-nina-18-2) | — | nina | Short cargo con bolsillos laterales — molde PDF para niña (18) |
| [PANT-L-127-MD](https://modeltex.com.ar/producto/pant-l-127-md) | — | dama | Pantalón cargo con bolsillos laterales — molde PDF para dama |
| [SHORT NIÑA 18](https://modeltex.com.ar/producto/short-nina-18) | — | nina | Short cargo con bolsillos laterales — molde PDF para niña (18) |
| [TOP DAMA](https://modeltex.com.ar/producto/top-132) | — | dama | Top deportivo con espalda cruzada — molde PDF para dama |
| [TOP DAMA](https://modeltex.com.ar/producto/top-133) | — | dama | Top deportivo con espalda cruzada — molde PDF para dama |
| [VESTIDO DAMA](https://modeltex.com.ar/producto/vest-254) | — | dama | Vestido deportivo con espalda cruzada — molde PDF para dama |
| [VESTIDO DAMA](https://modeltex.com.ar/producto/vestido-dama-8) | — | dama | Vestido deportivo con espalda cruzada — molde PDF para dama |
| [PANTALON DAMA](https://modeltex.com.ar/producto/pantalon-dama-9) | — | dama | Pantalón cargo con bolsillos laterales — molde PDF para dama |
| [ABRIGO 44](https://modeltex.com.ar/producto/abrigo-44-l) | — | dama | Campera aviador con cuello de borrego — molde PDF para dama (44) |
| [CHALECO](https://modeltex.com.ar/producto/abrigo-28-l) | — | dama | CHALECO — molde PDF para dama |
| [CHALECO](https://modeltex.com.ar/producto/abrigo-26-l) | — | dama | CHALECO — molde PDF para dama |

### Descripción de menos de 60 caracteres

Prioridad **medio** · 0 fichas (0.0%)

Una descripción de una línea no alcanza para una meta description útil ni para que un asistente de IA entienda de qué es el molde.

Sin casos.

### Título genérico (garment_type es un código, no una descripción)

Prioridad **medio** · 11 fichas (0.5%)

Sin una frase real de prenda el título queda en "CAMPERA — molde digital para dama": no dice qué distingue a este molde y se repite entre fichas del mismo nombre.

| Ficha | Código | Categoría | Título que se publica hoy |
| --- | --- | --- | --- |
| [BLUSA 189](https://modeltex.com.ar/producto/blusa-189) | — | dama | BLUSA 189 — molde PDF para dama |
| [MUSCULOSA](https://modeltex.com.ar/producto/musculosa-3) | — | ninos-unisex | MUSCULOSA — molde PDF unisex para niños |
| [MUSCULOSA](https://modeltex.com.ar/producto/musculosa) | — | dama | MUSCULOSA — molde PDF para dama |
| [VESTIDO 63](https://modeltex.com.ar/producto/vestido-63) | — | dama | VESTIDO 63 — molde PDF para dama |
| [VESTIDO 171](https://modeltex.com.ar/producto/vestido-171) | — | dama | VESTIDO 171 — molde PDF para dama |
| [VESTIDO 113](https://modeltex.com.ar/producto/vestido-113) | — | dama | VESTIDO 113 — molde PDF para dama |
| [VESTIDO](https://modeltex.com.ar/producto/vestido) | — | dama | VESTIDO — molde PDF para dama |
| [CAMPERA](https://modeltex.com.ar/producto/camp-19) | CAMP 19 | dama | CAMPERA — molde PDF para dama |
| [CHALECO](https://modeltex.com.ar/producto/abrigo-28-l) | — | dama | CHALECO — molde PDF para dama |
| [CHALECO](https://modeltex.com.ar/producto/abrigo-26-l) | — | dama | CHALECO — molde PDF para dama |
| [REMERA ](https://modeltex.com.ar/producto/remera-23-l) | — | dama | REMERA — molde PDF para dama |

### Nombre de menos de 6 caracteres

Prioridad **medio** · 25 fichas (1.2%)

Un nombre de 3 o 4 letras no describe la prenda ni sirve como texto de anclaje en los listados.

| Ficha | Código | Categoría | Título que se publica hoy |
| --- | --- | --- | --- |
| [BZ 20](https://modeltex.com.ar/producto/bz-20) | — | adultos-unisex | Buzo cuello alto con cierre y animal print — molde PDF unisex para adultos (20) |
| [BZ036](https://modeltex.com.ar/producto/bz036-2) | — | ninos-unisex | Buzo de peluche con chevron bicolor — molde PDF unisex para niños (BZ036) |
| [BUZO](https://modeltex.com.ar/producto/buzo) | — | ninos-unisex | Buzo básico cuello redondo — molde PDF unisex para niños |
| [BZ45](https://modeltex.com.ar/producto/bz45) | — | dama | Buzo polar con cuello alto y estampa — molde PDF para dama (BZ45) |
| [BZ44](https://modeltex.com.ar/producto/bz44) | — | dama | Buzo cropped de terciopelo con cuello alto — molde PDF para dama (BZ44) |
| [BZ35](https://modeltex.com.ar/producto/bz35) | — | dama | Buzo oversize cuello redondo con estampa — molde PDF para dama (BZ35) |
| [BZ34](https://modeltex.com.ar/producto/bz34) | — | dama | Buzo oversize con capucha — molde PDF para dama (BZ34) |
| [BZ046](https://modeltex.com.ar/producto/bz046) | — | dama | Buzo cuello alto con mangas globo — molde PDF para dama (BZ046) |
| [BZ041](https://modeltex.com.ar/producto/bz041) | — | dama | Buzo con volados en cascada — molde PDF para dama (BZ041) |
| [BZ038](https://modeltex.com.ar/producto/bz038) | — | dama | Buzo cuello alto con mangas animal print — molde PDF para dama (BZ038) |
| [BZ036](https://modeltex.com.ar/producto/bz036) | — | dama | Buzo de piel sintética con franjas — molde PDF para dama (BZ036) |
| [BZ029](https://modeltex.com.ar/producto/bz029) | — | dama | Buzo polar con capucha de orejas — molde PDF para dama (BZ029) |
| … | | | y 13 fichas más |

### Sin talles cargados

Prioridad **medio** · 0 fichas (0.0%)

Los talles alimentan la ficha técnica, las FAQ propias del producto y el additionalProperty del schema. Vacíos, la ficha pierde el argumento de venta principal.

Sin casos.

### Sin formatos cargados

Prioridad **medio** · 31 fichas (1.5%)

Sin formats el filtro por formato del catálogo no encuentra la ficha y el texto no dice en qué se entrega el molde.

| Ficha | Código | Categoría | Título que se publica hoy |
| --- | --- | --- | --- |
| [REMERA 147-M](https://modeltex.com.ar/producto/rememra-147-m) | — | hombre | Remera raglán con paños de color — molde PDF para hombre (147-M) |
| [REMERA 139-M](https://modeltex.com.ar/producto/remera-139-m) | 193-M | hombre | Remera básica de cuello redondo — molde PDF para hombre (193-M) |
| [TOP 332-L](https://modeltex.com.ar/producto/top-332-l) | — | dama | Top canalé con cuello camisero y costuras curvas — molde PDF para dama (332-L) |
| [PANTALON DAMA](https://modeltex.com.ar/producto/pantalon-dama-3) | — | dama | Pantalón chupín tobillero de tiro alto — molde PDF para dama |
| [FALDA DAMA](https://modeltex.com.ar/producto/falda-dama-2) | 42 | dama | Pollera cruzada con doble tela — molde PDF para dama (42) |
| [CORSET DAMA](https://modeltex.com.ar/producto/corset-18) | — | dama | Corset de jean con cierre frontal — molde PDF para dama |
| [PANTALON BAGGY HOMBRE ](https://modeltex.com.ar/producto/pantalon-baggy-hombre) | BAGGY 015-M | dama | Jogger baggy con puño — molde PDF para dama (BAGGY 015-M) |
| [BLUSA 220-L](https://modeltex.com.ar/producto/blusa-220-l) | — | dama | Blusa con mangas de volados — molde PDF para dama (220-L) |
| [WIDE LEG 26-L](https://modeltex.com.ar/producto/wide-leg-26-l) | — | dama | Pantalón wide leg con bolsillo cargo — molde PDF para dama (26-L) |
| [CAMPERA PLUSH](https://modeltex.com.ar/producto/camp-plush-l) | camp-plush-l | dama | Campera de friza texturada con capucha y cierre — molde PDF para dama (camp-plush-l) |
| [BUZO 68](https://modeltex.com.ar/producto/buzo-68) | BZ 68 | dama | Buzo corto con capucha y cierre — molde PDF para dama (BZ 68) |
| [CAMPERA 09-G](https://modeltex.com.ar/producto/camp-09-g) | CAMP 09-G | nina | Campera con capucha y estampado floral — molde PDF para niña (CAMP 09-G) |
| … | | | y 19 fichas más |

### El <title> pasa de 80 caracteres

Prioridad **medio** · 302 fichas (14.8%)

Google muestra unos 60 caracteres de título. Lo que pasa de ahí no se ve, así que conviene que la frase de la prenda sea corta y concreta.

| Ficha | Código | Categoría | Título que se publica hoy |
| --- | --- | --- | --- |
| [SHORT 08](https://modeltex.com.ar/producto/short-08-2) | — | ninos-unisex | Short deportivo básico con bolsillos — molde PDF unisex para niños (08) |
| [SHORT 08](https://modeltex.com.ar/producto/short-08) | — | hombre | Short deportivo liso con bolsillos y logo — molde PDF para hombre (08) |
| [BUZO RANGLAN 11](https://modeltex.com.ar/producto/buzo-ranglan-11) | — | ninos-unisex | Buzo cuello alto con mangas bicolor — molde PDF unisex para niños (11) |
| [BLAZER 4](https://modeltex.com.ar/producto/blazer-4-2) | — | ninos-unisex | Blazer deportivo de punto con solapa — molde PDF unisex para niños (4) |
| [ABRIGO 24](https://modeltex.com.ar/producto/abrigo-24-2) | — | ninos-unisex | Abrigo de piel sintética con botones — molde PDF unisex para niños (24) |
| [ABRIGO 15](https://modeltex.com.ar/producto/abrigo-15-2) | — | ninos-unisex | Campera corta de peluche con cuello y botones — molde PDF unisex para niños (15) |
| [ABRIGO 33](https://modeltex.com.ar/producto/abrigo-33) | — | dama | Campera de jean oversize con capucha a cuadros — molde PDF para dama (33) |
| [ABRIGO 18](https://modeltex.com.ar/producto/abrigo-18) | — | dama | Campera de polar con capucha y cierre asimétrico — molde PDF para dama (18) |
| [CAMPERA PUMA](https://modeltex.com.ar/producto/campera-puma-2) | — | ninos-unisex | Campera deportiva con cierre y cuello alto — molde PDF unisex para niños |
| [CAMPERA 20-B](https://modeltex.com.ar/producto/campera-20-b) | — | nino | Campera deportiva con franjas y cuello alto — molde PDF para niño (20-B) |
| [CAMPERA 003](https://modeltex.com.ar/producto/campera-003) | — | ninos-unisex | Campera deportiva con cuello tejido — molde PDF unisex para niños (003) |
| [CHAQUETA 008](https://modeltex.com.ar/producto/chaqueta-008) | — | hombre | Campera de jean con bolsillos con solapa — molde PDF para hombre (008) |
| … | | | y 290 fichas más |

### Sin código interno

Prioridad **bajo** · 1988 fichas (97.3%)

El código es el sku del schema Product (sin él se usa el slug, que también es válido) y es lo que diferencia el título cuando dos fichas comparten la misma frase de prenda.

| Ficha | Código | Categoría | Título que se publica hoy |
| --- | --- | --- | --- |
| [SHORT ESCOLAR NIÑA](https://modeltex.com.ar/producto/short-escolar-nina) | — | ninos-unisex | Short escolar con cintura elástica — molde PDF unisex para niños |
| [SHORT 08](https://modeltex.com.ar/producto/short-08-2) | — | ninos-unisex | Short deportivo básico con bolsillos — molde PDF unisex para niños (08) |
| [SHORT FUTBOL LISO HOMBRE](https://modeltex.com.ar/producto/short-futbol-liso-hombre) | — | hombre | Short deportivo liso con logo estampado — molde PDF para hombre |
| [SHORT 12](https://modeltex.com.ar/producto/short-12) | — | hombre | Short deportivo bicolor con bolsillo — molde PDF para hombre (12) |
| [SHORT 09](https://modeltex.com.ar/producto/short-09) | — | hombre | Short deportivo con cordón y estampa — molde PDF para hombre (09) |
| [SHORT 08](https://modeltex.com.ar/producto/short-08) | — | hombre | Short deportivo liso con bolsillos y logo — molde PDF para hombre (08) |
| [SHORT 06](https://modeltex.com.ar/producto/short-06) | — | hombre | Short deportivo con franjas laterales — molde PDF para hombre (06) |
| [SHORT 016](https://modeltex.com.ar/producto/short-016) | — | hombre | Short deportivo de bloques de color — molde PDF para hombre (016) |
| [SHORT010](https://modeltex.com.ar/producto/short010) | — | dama | Short símil cuero con panel cruzado — molde PDF para dama (SHORT010) |
| [SHORT FUTBOL DAMA](https://modeltex.com.ar/producto/short-futbol-dama) | — | dama | Short deportivo de fútbol con número — molde PDF para dama |
| [SHORT 77](https://modeltex.com.ar/producto/short-77) | — | dama | Short deportivo con rayas laterales — molde PDF para dama (77) |
| [SHORT 76](https://modeltex.com.ar/producto/short-76) | — | dama | Short deportivo con vivos laterales — molde PDF para dama (76) |
| … | | | y 1976 fichas más |

### Slug poco descriptivo

Prioridad **bajo** · 1548 fichas (75.7%)

Un slug como "short-08-2" no aporta ninguna palabra clave en la URL ni se entiende al compartir el link.

| Ficha | Código | Categoría | Título que se publica hoy |
| --- | --- | --- | --- |
| [SHORT 08](https://modeltex.com.ar/producto/short-08-2) | — | ninos-unisex | Short deportivo básico con bolsillos — molde PDF unisex para niños (08) |
| [SHORT 12](https://modeltex.com.ar/producto/short-12) | — | hombre | Short deportivo bicolor con bolsillo — molde PDF para hombre (12) |
| [SHORT 09](https://modeltex.com.ar/producto/short-09) | — | hombre | Short deportivo con cordón y estampa — molde PDF para hombre (09) |
| [SHORT 08](https://modeltex.com.ar/producto/short-08) | — | hombre | Short deportivo liso con bolsillos y logo — molde PDF para hombre (08) |
| [SHORT 06](https://modeltex.com.ar/producto/short-06) | — | hombre | Short deportivo con franjas laterales — molde PDF para hombre (06) |
| [SHORT 016](https://modeltex.com.ar/producto/short-016) | — | hombre | Short deportivo de bloques de color — molde PDF para hombre (016) |
| [SHORT010](https://modeltex.com.ar/producto/short010) | — | dama | Short símil cuero con panel cruzado — molde PDF para dama (SHORT010) |
| [SHORT 77](https://modeltex.com.ar/producto/short-77) | — | dama | Short deportivo con rayas laterales — molde PDF para dama (77) |
| [SHORT 76](https://modeltex.com.ar/producto/short-76) | — | dama | Short deportivo con vivos laterales — molde PDF para dama (76) |
| [BLAZER 9](https://modeltex.com.ar/producto/blazer-9) | — | ninos-unisex | Blazer con solapa y bolsillos — molde PDF unisex para niños (9) |
| [BLAZER 7](https://modeltex.com.ar/producto/blazer-7) | — | nina | Blazer corto de dos botones — molde PDF para niña (7) |
| [BLAZER 6](https://modeltex.com.ar/producto/blazer-6) | — | nina | Blazer corto con solapa y aplique — molde PDF para niña (6) |
| … | | | y 1536 fichas más |

### Sin telas recomendadas

Prioridad **bajo** · 11 fichas (0.5%)

Las telas recomendadas son contenido propio de la ficha y responden una de las preguntas más frecuentes antes de comprar.

| Ficha | Código | Categoría | Título que se publica hoy |
| --- | --- | --- | --- |
| [BLUSA 189](https://modeltex.com.ar/producto/blusa-189) | — | dama | BLUSA 189 — molde PDF para dama |
| [MUSCULOSA](https://modeltex.com.ar/producto/musculosa-3) | — | ninos-unisex | MUSCULOSA — molde PDF unisex para niños |
| [MUSCULOSA](https://modeltex.com.ar/producto/musculosa) | — | dama | MUSCULOSA — molde PDF para dama |
| [VESTIDO 63](https://modeltex.com.ar/producto/vestido-63) | — | dama | VESTIDO 63 — molde PDF para dama |
| [VESTIDO 171](https://modeltex.com.ar/producto/vestido-171) | — | dama | VESTIDO 171 — molde PDF para dama |
| [VESTIDO 113](https://modeltex.com.ar/producto/vestido-113) | — | dama | VESTIDO 113 — molde PDF para dama |
| [VESTIDO](https://modeltex.com.ar/producto/vestido) | — | dama | VESTIDO — molde PDF para dama |
| [CAMPERA](https://modeltex.com.ar/producto/camp-19) | CAMP 19 | dama | CAMPERA — molde PDF para dama |
| [CHALECO](https://modeltex.com.ar/producto/abrigo-28-l) | — | dama | CHALECO — molde PDF para dama |
| [CHALECO](https://modeltex.com.ar/producto/abrigo-26-l) | — | dama | CHALECO — molde PDF para dama |
| [REMERA ](https://modeltex.com.ar/producto/remera-23-l) | — | dama | REMERA — molde PDF para dama |

### Sin temporada

Prioridad **bajo** · 0 fichas (0.0%)

La temporada alimenta un filtro del catálogo y la ficha técnica; vacía, el molde no aparece al filtrar por verano o invierno.

Sin casos.

## Lo que hay que mirar de verdad

El catálogo está mucho mejor de lo que sugería la auditoría inicial: **ninguna ficha se quedó sin imagen, sin precio, sin categoría, sin descripción, sin talles ni sin temporada.** Los títulos genéricos tipo "CAMPERA — molde digital para dama" son 11, no una plaga.

Lo que queda es esto, por orden de impacto real:

### 1. 12 fichas con el título repetido (6 pares)

No es un problema de código: son fichas **duplicadas de verdad** en el catálogo, con el mismo nombre y la misma frase de prenda. Google va a elegir una de cada par e ignorar la otra, lo cual está bien, pero conviene decidirlo a mano: o se diferencian (si son moldes distintos) o se da de baja una (si son la misma).

| Título repetido | Fichas |
| --- | --- |
| Campera aviador con cuello de borrego — molde PDF para dama (44) | [abrigo-44](https://modeltex.com.ar/producto/abrigo-44) · [abrigo-44-l](https://modeltex.com.ar/producto/abrigo-44-l) |
| Short cargo con bolsillos laterales — molde PDF para niña (18) | [short-nina-18-2](https://modeltex.com.ar/producto/short-nina-18-2) · [short-nina-18](https://modeltex.com.ar/producto/short-nina-18) |
| Pantalón cargo con bolsillos laterales — molde PDF para dama | [pant-l-127-md](https://modeltex.com.ar/producto/pant-l-127-md) · [pantalon-dama-9](https://modeltex.com.ar/producto/pantalon-dama-9) |
| Top deportivo con espalda cruzada — molde PDF para dama | [top-132](https://modeltex.com.ar/producto/top-132) · [top-133](https://modeltex.com.ar/producto/top-133) |
| Vestido deportivo con espalda cruzada — molde PDF para dama | [vest-254](https://modeltex.com.ar/producto/vest-254) · [vestido-dama-8](https://modeltex.com.ar/producto/vestido-dama-8) |
| CHALECO — molde PDF para dama | [abrigo-28-l](https://modeltex.com.ar/producto/abrigo-28-l) · [abrigo-26-l](https://modeltex.com.ar/producto/abrigo-26-l) |

### 2. 11 fichas sin frase de prenda

Tienen en `garment_type` un código viejo en mayúsculas ("CHALECO DAMA", "SHORT 019") en vez de una frase que describa la prenda. Para esas, el título cae en la versión genérica.

**Esto no se puede automatizar.** "Campera deportiva con capucha" no está en ningún campo de la base: inventarla sería cargar en la ficha un rasgo que el molde puede no tener. Hay que escribirla a mano mirando la foto, desde `/admin`. Son 11 fichas: es una tarde de trabajo.

### 3. 1548 slugs sin palabras clave (75.7%)

Slugs como `top-107` o `falda-44` no llevan ninguna palabra clave en la URL, aunque la ficha SÍ tiene la frase descriptiva cargada ("top con recorte al frente"). Es la mejora con más potencial del catálogo… y la más riesgosa.

**Recomendación: no hacerlo en masa.** Cambiar 1.548 URLs resetea el historial de indexación de cada una. El proyecto ya tiene el mecanismo de redirecciones 301 (`src/lib/slugRedirects.ts`) para no perder los links viejos, pero el costo de equivocarse es alto y la ganancia por ficha es chica. Lo sensato es cambiar el slug solo cuando ya se está editando esa ficha por otro motivo, agregando siempre la entrada en `slugRedirects.ts`, y empezando por los moldes que más se venden.

### 4. 302 títulos de más de 80 caracteres

Google muestra unos 60. Ya se reordenó el título para que la frase de la prenda y la palabra clave vayan primero (antes arrancaba con el nombre interno, repetido en decenas de fichas), así que lo que se corta es la referencia de modelo entre paréntesis, que es lo descartable. Acortar las frases más largas en `garment_type` mejoraría el CTR, pero no es urgente.

## Qué se puede automatizar y qué no

| Se puede | No se puede |
| --- | --- |
| Reordenar el título para poner primero la frase y la palabra clave (ya hecho en `productTitle()`). | Escribir la frase de la prenda: no está en ningún campo. |
| Usar el código, o el número del nombre, como referencia que diferencia dos fichas parecidas (ya hecho). | Completar telas recomendadas: dependen del molde real. |
| Detectar y listar duplicados, faltantes y títulos largos (este script). | Completar precios: es una decisión comercial. |
| Marcar `season` en `todo-el-anio` por defecto, si Denis confirma que ese es el criterio. | Reescribir 1.548 slugs de una sola vez sin riesgo. |

## Orden de trabajo sugerido

1. Resolver los 6 pares de fichas duplicadas: diferenciarlas o dar de baja una.
2. Cargar la frase de prenda en las 11 fichas que la tienen como código.
3. Completar los formatos de las 31 fichas sin `formats` (sin eso no aparecen al filtrar por formato en el catálogo).
4. Revisar las 25 fichas con nombre de menos de 6 caracteres.
5. De ahí en adelante, prolijidad: telas recomendadas, códigos internos y slugs, siempre de a una ficha y aprovechando ediciones que ya se estén haciendo.

Todo esto se edita desde `/admin`, ficha por ficha. Volver a correr `node scripts/seo-audit-products.mjs` después de cada tanda muestra cuánto bajó cada número.
