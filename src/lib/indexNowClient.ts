// Cola con debounce para avisar a IndexNow (Bing/Yandex/Seznam; Google no usa
// este protocolo) cuando el admin publica o cambia contenido. Junta varias
// URLs en una sola llamada a /api/utils?action=indexnow en vez de una
// request por cambio, y reutiliza ese endpoint ya existente (no consume una
// función serverless nueva). Si INDEXNOW_KEY no está configurada en Vercel,
// el propio endpoint responde { skipped: true } sin error.
import { supabase } from './supabase';

const DEBOUNCE_MS = 4000;
const SITE_URL = 'https://modeltex.com.ar';

let pending = new Set<string>();
let timer: ReturnType<typeof setTimeout> | null = null;

/** Encola una URL (path relativo, ej. "/producto/mi-slug") para avisar a IndexNow. */
export function queueIndexNowUrl(path: string): void {
  pending.add(path.startsWith('http') ? path : `${SITE_URL}${path}`);
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    flush().catch(() => { /* best-effort: nunca debe afectar el flujo del admin */ });
  }, DEBOUNCE_MS);
}

async function flush(): Promise<void> {
  const urls = [...pending];
  pending = new Set();
  timer = null;
  if (!urls.length) return;

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return;

  await fetch('/api/utils?action=indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ urls }),
  });
}
