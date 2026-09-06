import { MessageCircle, Send } from 'lucide-react';
import { useLocale } from '../../lib/locale';
import { whatsappAppLink, isMobileDevice } from '../../lib/whatsapp';
import { whatsappLink, whatsappMessage, telegramLink, type ConsultFormat } from '../../lib/productFormats';
import type { Product } from '../../lib/types';

interface ConsultButtonsProps {
  product: Product;
  /** Formato de la consulta: arma el mensaje correspondiente. */
  format?: ConsultFormat;
  /** 'full' (default): botones WhatsApp + Telegram con texto. 'icon': solo WhatsApp, boton cuadrado sin texto. */
  variant?: 'full' | 'icon';
}

/** Par de botones WhatsApp + Telegram con mensaje prearmado según el producto y formato. */
export function ConsultButtons({ product, format = 'general', variant = 'full' }: ConsultButtonsProps) {
  const { formatPrice, t } = useLocale();
  const message = whatsappMessage(product, format, formatPrice);
  const webLink = whatsappLink(product, format, formatPrice);

  const openWhatsApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    if (isMobileDevice()) {
      e.preventDefault();
      window.location.href = whatsappAppLink(message);
    }
  };

  if (variant === 'icon') {
    return (
      <a
        href={webLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={openWhatsApp}
        aria-label={t('product.whatsapp', 'Consultar por WhatsApp')}
        title={t('product.whatsapp', 'Consultar por WhatsApp')}
        className="flex items-center justify-center flex-shrink-0 w-11 rounded-xl border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
      </a>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        href={webLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={openWhatsApp}
        className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
      </a>
      <a
        href={telegramLink(product, format, formatPrice)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-sky-700 border border-sky-200 rounded-lg hover:bg-sky-50 transition-colors"
      >
        <Send className="w-3.5 h-3.5" /> Telegram
      </a>
    </div>
  );
}