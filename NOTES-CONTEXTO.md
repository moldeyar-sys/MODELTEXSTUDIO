# CONTEXTO MODELTEX

Proyecto **Modeltex**: e-commerce de moldería textil.
Stack: Vite + React + TS + Tailwind + Supabase.
Repo local en `C:\Users\Pc\modeltexstudio`, GitHub `moldeyar-sys/MODELTEXSTUDIO`, **deploy automático en Vercel al hacer push a main**.

## Infraestructura
- **Dominio en vivo:** modeltex.com.ar (el viejo modeltexstudio.com redirige)
- **Supabase:** proyecto `jotibqgyrcgwctiolhcw` (org moldeyar-sys). Los SQL los corre el dueño en el SQL Editor.
- **Ojo cuentas:** el proyecto de Vercel "modeltexstudio" está en la cuenta **MOLDEY** (navegador); la CLI está logueada en otra cuenta → cambios de dominio/env van por el navegador.
- **Modo de trabajo:** Claude edita código → push → Vercel publica solo; los SQL los corre el usuario.

## Ya implementado
- Catálogo con 3 precios por formato (Cartón / PDF-A4 / PDF Plóter) + consulta WhatsApp/Telegram
- Multi-categoría
- Moneda automática (ARS en Argentina / USD afuera, por geolocalización)
- IA Textil (chat derivado a WhatsApp hasta que se cargue la API key)
- Moldes Gratis (con cuenta para descargar)
- Página Contacto
- Reseñas con estrellas ⭐
- Pasar producto del catálogo a Moldes Gratis con vencimiento automático
- Carrusel de imágenes en el Hero + sección admin "Inicio" para gestionarlas
- SEO optimizado + Google Search Console + sitemap enviado
- Navbar limpio (sin interruptores ES/EN ni ARS/USD manuales)

## Pendientes / futuro
1. El dueño va a traer la **lista completa de mejoras de Moldes Gratis**
2. Falta cargar la **API key de OpenRouter** en Vercel para que la IA Textil responda de verdad (hoy deriva a WhatsApp)
3. Crear **Google Business Profile** (SEO local)
4. El email contacto@modeltex.com.ar necesita hosting de correo para poder *recibir* mensajes
