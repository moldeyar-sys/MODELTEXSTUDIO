// Número de WhatsApp del negocio Modeltex (formato wa.me, sin + ni espacios).
// +54 9 11 6653 1086
export const WHATSAPP_NUMBER = '5491166531086';

const encodeMessage = (message?: string) => message ? encodeURIComponent(message) : '';

export function whatsappWebLink(message?: string): string {
  const text = encodeMessage(message);
  return text ? `https://wa.me/${WHATSAPP_NUMBER}?text=${text}` : `https://wa.me/${WHATSAPP_NUMBER}`;
}

export function whatsappAppLink(message?: string): string {
  const text = encodeMessage(message);
  return text ? `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${text}` : `whatsapp://send?phone=${WHATSAPP_NUMBER}`;
}

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
}