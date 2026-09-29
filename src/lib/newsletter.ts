import { supabase } from './supabase';
import type { NewsletterSubscriber } from './types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface NewsletterResult {
  ok: boolean;
  alreadySubscribed?: boolean;
  error?: string;
}

/** Suma un email a la lista propia. Resiliente: si falta la tabla, avisa sin romper la pagina. */
export async function subscribeToNewsletter(email: string, source = 'moldes-gratis'): Promise<NewsletterResult> {
  const clean = email.trim().toLowerCase();
  if (!EMAIL_RE.test(clean)) {
    return { ok: false, error: 'Ingresá un email válido.' };
  }
  try {
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: clean, source });
    if (error) {
      if (error.code === '23505') return { ok: true, alreadySubscribed: true }; // unique_violation: ya estaba suscripto
      return { ok: false, error: 'Falta crear la tabla de novedades en Supabase (SQL).' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'No se pudo guardar tu email. Probá de nuevo.' };
  }
}

// Registro con Google: la casilla de novedades se tilda ANTES de salir hacia
// Google, pero el email recién se conoce al volver con la sesión abierta.
// Se guarda la intención en el navegador y AuthContext la consume en el
// SIGNED_IN. Vence a los 30 minutos para no anotar a nadie en un login
// posterior que no tenga nada que ver.
const PENDING_KEY = 'modeltex_newsletter_pending';
const PENDING_TTL_MS = 30 * 60 * 1000;

export function setNewsletterPending(source: string | null) {
  try {
    if (source) localStorage.setItem(PENDING_KEY, JSON.stringify({ source, at: Date.now() }));
    else localStorage.removeItem(PENDING_KEY);
  } catch { /* sin localStorage: se pierde solo la suscripción, no el registro */ }
}

export async function consumeNewsletterPending(email: string) {
  let pending: { source?: string; at?: number } | null = null;
  try {
    pending = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
    localStorage.removeItem(PENDING_KEY);
  } catch {
    return;
  }
  if (!pending?.source || !pending.at || Date.now() - pending.at > PENDING_TTL_MS) return;
  await subscribeToNewsletter(email, pending.source);
}

/** Trae los suscriptos para el panel admin. Resiliente. */
export async function fetchNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data as NewsletterSubscriber[]) || [];
  } catch {
    return [];
  }
}

export async function deleteNewsletterSubscriber(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
