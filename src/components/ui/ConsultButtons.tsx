import { MessageCircle, Send } from 'lucide-react';
import { useLocale } from '../../lib/locale';
import { whatsappLink, telegramLink, type ConsultFormat } from '../../lib/productFormats';
import type { Product } from '../../lib/types';

interface ConsultButtonsProps {
  product: Product;
  /** Formato de la consulta: arma el mensaje correspondiente. */
  format?: ConsultFormat;
}

/** Par de botones WhatsApp + Telegram con mensaje prearmado según el producto y formato. */
export function ConsultButtons({ product, format = 'general' }: ConsultButtonsProps) {
  const { formatPrice } = useLocale();
  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        href={whatsappLink(product, format, formatPrice)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
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
