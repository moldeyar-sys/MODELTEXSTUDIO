import { Send } from 'lucide-react';
import { CONTACT_INFO } from '../../lib/contact';

/**
 * Burbuja flotante de Telegram. Va en el MEDIO del stack:
 * 🤖 Robot (arriba) · ✈️ Telegram (medio) · 💬 WhatsApp (abajo).
 */
export function TelegramButton() {
  return (
    <a
      href={`https://t.me/+${CONTACT_INFO.telegram}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[5.75rem] right-6 z-50 w-14 h-14 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95"
      aria-label="Contactar por Telegram"
    >
      <Send className="w-6 h-6" />
    </a>
  );
}
