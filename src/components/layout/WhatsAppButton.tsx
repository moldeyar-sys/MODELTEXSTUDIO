import { MessageCircle } from 'lucide-react';
import { isMobileDevice, whatsappAppLink, whatsappWebLink } from '../../lib/whatsapp';

const WHATSAPP_MESSAGE = 'Hola Modeltex, necesito ayuda con una compra de moldes digitales.';

export function WhatsAppButton() {
  const openWhatsApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMobileDevice()) {
      e.preventDefault();
      window.location.href = whatsappAppLink(WHATSAPP_MESSAGE);
    }
  };

  return (
    <a
      href={whatsappWebLink(WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={openWhatsApp}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}