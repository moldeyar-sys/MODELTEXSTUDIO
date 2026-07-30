# Pendientes de Denis

Todo lo que depende de vos para que las mejoras queden funcionando de verdad. Voy actualizando este archivo a medida que hacemos cosas nuevas — es el único lugar que necesitás mirar para saber "qué me falta hacer a mí".

## 🔴 Bloqueante — nada de la IA funciona sin esto

- [ ] **Cargar `OPENROUTER_API_KEY` en Vercel.** Vercel → proyecto `modeltexstudio` → Settings → Environment Variables. Sin esto el asistente IA responde siempre "no está configurado" y deriva a WhatsApp. Es la clave de tu cuenta de OpenRouter (modelo `openai/gpt-4o-mini`, cuesta centavos por mes).
- [ ] **Ponerle límite de gasto a la clave en OpenRouter** (openrouter.ai → Keys → tu clave → Credit limit). Poné por ejemplo 10 USD/mes: el uso normal del sitio son centavos, y ese techo te protege si algún día alguien roba la clave o un token de admin — es la protección real; el código además tiene un freno de velocidad, pero el techo de gasto lo ponés vos allá.

## 🟡 SQL para correr en Supabase (SQL Editor, como siempre)

Corré estos dos en orden, son acumulativos:

- [ ] `supabase/migrations/20260729000000_023_newsletter_subscribers.sql` — tabla para la lista de emails de "Moldes Gratis".
- [ ] `supabase/migrations/20260729010000_024_busqueda_semantica.sql` — habilita pgvector y prepara la tabla de productos para la búsqueda inteligente. **Importante:** este SQL por sí solo no genera los embeddings, solo prepara el terreno (ver paso siguiente).

## 🟢 Un solo click en el panel admin (después de correr el SQL de arriba)

- [ ] Panel admin → pestaña **Productos** → tarjeta "Búsqueda inteligente (IA)" → botón **"Indexar productos nuevos"**. Genera el embedding de cada molde activo (una sola vez; después solo hace falta para productos nuevos). Con 566 productos el costo es de centavos de dólar. Necesita que ya esté cargada la clave de OpenRouter (punto rojo de arriba).

## 📣 Marketing — pedir reseñas reales

Los 3 testimonios de la home ("Carolina M.", "Diego R.", "Valentina S.") son de ejemplo, no clientes reales. Van a desaparecer solos apenas entre la primera reseña real. Formas rápidas de conseguirlas:

- [ ] Escribirle por WhatsApp a clientes que ya compraron, pidiendo que dejen su opinión (con el link directo al producto).
- [ ] Pedirla en el momento de la descarga (hoy no se pide ahí).
- [ ] A los que bajaron algo de "Moldes Gratis" — probaron gratis, es fácil pedirles opinión sin que hayan arriesgado plata.
- [ ] Considerar regalar un molde a cambio de la primera reseña.

## 🔓 Acceso (ya resuelto, dejo la nota por si se repite)

Vercel CLI en esta compu quedó logueada con tu cuenta personal, aprobada dentro de la sesión de MOLDEY en el navegador. Si en el futuro un deploy falla con "Not authorized" o "Could not retrieve Project Settings", es que la sesión expiró — solo hace falta repetir el login y aprobarlo desde el navegador donde esté abierta la cuenta MOLDEY.

## Decisiones tuyas (no bloquean nada, pero son tuyas)

- [ ] Confirmar que puedo publicar (`git commit` + deploy a Vercel) los cambios de cada mejora. Sigo el mismo criterio de siempre: te aviso y muestro antes de publicar, no lo hago solo.
- [ ] Decidir si querés que arranque la tarea de "acentos rotos" que quedó como sugerencia aparte (10 archivos con `?` en vez de tildes).

---
*Última actualización: 29/07/2026 — después de implementar captura de email (#7) y búsqueda semántica (#8).*
