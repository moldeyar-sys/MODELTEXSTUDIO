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
