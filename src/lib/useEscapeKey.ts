import { useEffect } from 'react';

/**
 * Cierra con Escape mientras `active` es true. Mismo patrón que ya usaba
 * IaTextilModal.tsx (el único overlay del sitio que lo tenía) — se extrae
 * acá para reusarlo en el resto de los modales/paneles (selector de formato
 * en ProductCard, guía de talles, reseñas de moldes gratis, panel de chat),
 * que antes no se podían cerrar con teclado.
 */
export function useEscapeKey(onClose: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, active]);
}
