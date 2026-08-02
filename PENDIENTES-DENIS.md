# Pendientes de Denis

Todo lo que depende de vos para que las mejoras queden funcionando de verdad. Voy actualizando este archivo a medida que hacemos cosas nuevas — es el único lugar que necesitás mirar para saber "qué me falta hacer a mí".

## ✅ Hecho — IA encendida y funcionando de punta a punta

- [x] `OPENROUTER_API_KEY` cargada en Vercel — probado en vivo, el asistente responde con datos reales del catálogo.
- [x] Los 2 SQL corridos en Supabase (newsletter + búsqueda semántica).
- [x] "Indexar productos nuevos" ejecutado — **566/566 productos indexados**, confirmado directo en la base.
- [x] Búsqueda por significado probada en vivo: "algo abrigado para nene chiquito" encontró camperas sin decir la palabra, "algo para entrenar" encontró joggers sin decir la palabra.

**Pendiente, no bloqueante:**
- [ ] **Ponerle límite de gasto a la clave en OpenRouter** (openrouter.ai → Keys → tu clave → Credit limit, ej. 10 USD/mes). El uso normal es centavos; el límite es tu protección real si algún día se filtra la clave o un token de admin.
- [ ] Cuando cargues productos nuevos, volver a apretar "Indexar productos nuevos" (el botón solo procesa los que todavía no tienen embedding, así que es rápido y no vuelve a cobrar por los que ya estaban).

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
*Última actualización: 02/08/2026 — IA en vivo y verificada, búsqueda semántica con 566/566 productos indexados.*
