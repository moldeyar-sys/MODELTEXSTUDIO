import { MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../../lib/whatsapp';

interface WhatsAppConsultButtonProps {
  /** Mensaje prearmado que se abre en WhatsApp. */
  message?: string;
  /** Clases extra (ej: margen) — se suman al estilo base del catálogo. */
  className?: string;
  /** Texto del botón. */
  label?: string;
}

/**
 * Botón "Consultar por WhatsApp" con el MISMO formato que las tarjetas del
 * catálogo (verde, borde fino, ancho completo). Reutilizable en todo el sitio.
 */
export function WhatsAppConsultButton({
  message = 'Hola Modeltex, tengo una duda con mi compra.',
  className = '',
  label = 'Consultar por WhatsApp',
}: WhatsAppConsultButtonProps) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-medium text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors ${className}`}
    >
      <MessageCircle className="w-3.5 h-3.5" />
      {label}
    </a>
  );
}
