import { useEffect, useState } from 'react';
import { Bot, MessageCircle, MessagesSquare, Send, X } from 'lucide-react';
import { ChatWidget } from '../chat/ChatWidget';
import { CONTACT_INFO } from '../../lib/contact';
import { isMobileDevice, whatsappAppLink, whatsappWebLink } from '../../lib/whatsapp';

const WHATSAPP_MESSAGE = 'Hola Modeltex, necesito ayuda con una compra de moldes digitales.';

/**
 * Dock de contacto unificado. Antes habia TRES burbujas flotantes apiladas
 * (WhatsApp + Telegram + asistente) que tapaban el contenido en celular;
 * ahora hay UNA sola que despliega las tres opciones etiquetadas al tocarla.
 */
export function ContactDock() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Escape cierra lo que este abierto: primero el chat, si no el menu.
  useEffect(() => {
    if (!menuOpen && !chatOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (chatOpen) setChatOpen(false);
      else setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, chatOpen]);

  const openWhatsApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);
    if (isMobileDevice()) {
      e.preventDefault();
      window.location.href = whatsappAppLink(WHATSAPP_MESSAGE);
    }
  };

  const openChat = () => {
    setMenuOpen(false);
    setChatOpen(true);
  };

  return (
    <>
      {/* Fondo invisible: un toque afuera cierra el menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Opciones desplegadas (aparecen arriba del boton principal) */}
      {menuOpen && (
        <div className="fixed bottom-[4.5rem] right-3 sm:bottom-24 sm:right-6 z-50 flex flex-col items-end gap-2.5">
          <button
            onClick={openChat}
            className="flex items-center gap-2.5 pl-4 pr-1.5 py-1.5 bg-white rounded-full shadow-lg border border-gray-200 hover:border-primary-300 active:scale-95 transition-all"
          >
            <span className="text-sm font-semibold text-gray-700">Asistente IA</span>
            <span className="w-11 h-11 rounded-full bg-primary-800 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </span>
          </button>

          <a
            href={`https://t.me/+${CONTACT_INFO.telegram}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2.5 pl-4 pr-1.5 py-1.5 bg-white rounded-full shadow-lg border border-gray-200 hover:border-sky-300 active:scale-95 transition-all"
          >
            <span className="text-sm font-semibold text-gray-700">Telegram</span>
            <span className="w-11 h-11 rounded-full bg-sky-500 text-white flex items-center justify-center">
              <Send className="w-5 h-5" />
            </span>
          </a>

          <a
            href={whatsappWebLink(WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={openWhatsApp}
            className="flex items-center gap-2.5 pl-4 pr-1.5 py-1.5 bg-white rounded-full shadow-lg border border-gray-200 hover:border-green-300 active:scale-95 transition-all"
          >
            <span className="text-sm font-semibold text-gray-700">WhatsApp</span>
            <span className="w-11 h-11 rounded-full bg-green-500 text-white flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </span>
          </a>
        </div>
      )}

      {/* Boton principal: la unica burbuja fija de todo el sitio */}
      {!chatOpen && (
        <button
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Cerrar opciones de contacto' : 'Abrir opciones de contacto'}
          aria-expanded={menuOpen}
          className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-primary-800 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95"
        >
          {menuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessagesSquare className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
      )}

      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
