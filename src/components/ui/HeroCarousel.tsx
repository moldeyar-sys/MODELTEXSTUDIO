import { useState, useEffect } from 'react';
import { fetchActiveHeroImages } from '../../lib/heroImages';

interface Props {
  fallbackSrc: string;
  fallbackAlt?: string;
  intervalMs?: number;
}

/**
 * Carrusel del hero: rota las imágenes activas cargadas desde el admin.
 * Si no hay ninguna (o falta la tabla), muestra la imagen de respaldo.
 */
export function HeroCarousel({ fallbackSrc, fallbackAlt = 'Modeltex', intervalMs = 4500 }: Props) {
  const [slides, setSlides] = useState<{ src: string; alt: string }[]>([{ src: fallbackSrc, alt: fallbackAlt }]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetchActiveHeroImages().then(imgs => {
      if (imgs.length > 0) {
        setSlides(imgs.map(i => ({ src: i.image_url, alt: i.alt || 'Modeltex' })));
        setIdx(0);
      }
    });
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(t);
  }, [slides.length, intervalMs]);

  return (
    <div className="relative w-full rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      <div className="relative aspect-square">
        {slides.map((s, i) => (
          <img
            key={s.src + i}
            src={s.src}
            alt={s.alt}
            loading={i === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Imagen ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
