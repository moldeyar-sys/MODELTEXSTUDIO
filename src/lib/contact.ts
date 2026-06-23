import { supabase } from './supabase';
import { WHATSAPP_NUMBER } from './whatsapp';
import type { ContactMessage } from './types';

/**
 * Datos de contacto que se muestran en la página.
 * 👉 SON PLACEHOLDERS DE EJEMPLO: cambialos por los reales cuando los tengas.
 * (email, instagram y horario son genéricos; WhatsApp es el número real.)
 */
export const CONTACT_INFO = {
  email: 'contacto@modeltex.com.ar',
  whatsapp: WHATSAPP_NUMBER,   // 5491166531086 → se usa en wa.me
  telegram: '5491166531086',   // se usa en t.me/+<telegram>
  facebook: 'modeltex.ar',     // se usa en facebook.com/<facebook>
  instagram: '',               // ← agregar después (usuario sin @)
  tiktok: '',                  // ← agregar después (usuario sin @)
  location: 'Argentina — envíos digitales a todo el mundo',
  hours: 'Lunes a sábado, 9 a 18 hs',
};

export interface ContactInput {
  name: string;
  whatsapp: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Guarda el mensaje en la base (best-effort). Si la tabla todavía no existe
 * (falta correr el SQL), no rompe: devuelve false y el formulario igual abre WhatsApp.
 */
export async function submitContactMessage(input: ContactInput): Promise<boolean> {
  try {
    const { error } = await supabase.from('contact_messages').insert({
      name: input.name,
      whatsapp: input.whatsapp,
      email: input.email,
      subject: input.subject,
      message: input.message,
    });
    return !error;
  } catch {
    return false;
  }
}

/** Mensaje de WhatsApp prearmado con los datos del formulario. */
export function buildContactWhatsApp(input: ContactInput): string {
  const text =
    `Hola Modeltex, quiero hacer una consulta:\n\n` +
    `Nombre: ${input.name || '-'}\n` +
    (input.subject ? `Asunto: ${input.subject}\n` : '') +
    (input.email ? `Email: ${input.email}\n` : '') +
    `\n${input.message}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Trae los mensajes de contacto para el panel admin. Resiliente. */
export async function fetchContactMessages(): Promise<ContactMessage[]> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data as ContactMessage[]) || [];
  } catch {
    return [];
  }
}
