import { useState } from 'react';

interface BrandLogoProps {
  /** 'full' = logo completo (isotipo + wordmark) · 'icon' = solo isotipo */
  variant?: 'full' | 'icon';
  /** 'dark' = wordmark azul (fondos claros) · 'light' = wordmark blanco (fondos oscuros). Solo afecta al respaldo SVG. */
  tone?: 'dark' | 'light';
  /** alto del logo en px */
  size?: number;
  className?: string;
}

const BLUE = '#1C3084';
const ORANGE = '#F37D1D';
const WHITE = '#FFFFFF';

const LEFT_HALF =
  'M32 15.5 C30 13 27 12 23.5 12 C21.5 12 20 11.2 18.5 11.2 C15 14 12.5 20 11.8 29 L14.5 60 L32 61 Z';
const RIGHT_HALF =
  'M32 15.5 C34 13 37 12 40.5 12 C42.5 12 44 11.2 45.5 11.2 C49 14 51.5 20 52.2 29 L49.5 60 L32 61 Z';
const LEFT_STITCH =
  'M31.5 18.8 C29.6 16.5 27.2 15.4 24 15.4 C22.2 15.4 20.8 14.7 19.4 14.7 C16.4 17 14.8 22 14.3 29 L16.7 57.2 L31.5 58.2';
const RIGHT_STITCH =
  'M32.5 18.8 C34.4 16.5 36.8 15.4 40 15.4 C41.8 15.4 43.2 14.7 44.6 14.7 C47.6 17 49.2 22 49.7 29 L47.3 57.2 L32.5 58.2';

/** Respaldo SVG: solo se usa si el PNG real todavía no está en /public/brand. */
function FallbackLogo({ variant, tone, size }: { variant: 'full' | 'icon'; tone: 'dark' | 'light'; size: number }) {
  const leftFill = tone === 'light' ? WHITE : BLUE;
  const leftStitch = tone === 'light' ? BLUE : WHITE;
  const icon = (
    <svg width={(size * 64) / 72} height={size} viewBox="0 0 64 72" fill="none" role="img" aria-label="Moldey" className="flex-shrink-0">
      <path d={LEFT_HALF} fill={leftFill} />
      <path d={RIGHT_HALF} fill={ORANGE} />
      <path d={LEFT_STITCH} stroke={leftStitch} strokeWidth="1.4" strokeDasharray="2.6 2" strokeLinecap="round" fill="none" />
      <path d={RIGHT_STITCH} stroke={WHITE} strokeWidth="1.4" strokeDasharray="2.6 2" strokeLinecap="round" fill="none" />
      <line x1="32" y1="15.5" x2="32" y2="61" stroke={WHITE} strokeWidth="1" strokeOpacity="0.7" />
    </svg>
  );
  if (variant === 'icon') return <span className="inline-flex">{icon}</span>;
  return (
    <span className="inline-flex items-center gap-2">
      {icon}
      <span className={`font-display font-bold tracking-tight ${tone === 'light' ? 'text-white' : 'text-brand-blue'}`} style={{ fontSize: Math.round(size * 0.6) }}>
        Moldey
      </span>
    </span>
  );
}

export function BrandLogo({ variant = 'full', tone = 'dark', size = 36, className = '' }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <span className={className}>
        <FallbackLogo variant={variant} tone={tone} size={size} />
      </span>
    );
  }

  const iconImg = (
    <img
      src="/brand/moldey-icon.png"
      alt="Moldey"
      onError={() => setImgError(true)}
      style={{ height: size, width: 'auto' }}
      className="object-contain select-none"
      draggable={false}
    />
  );

  // Solo isotipo
  if (variant === 'icon') {
    return <span className={`inline-flex ${className}`}>{iconImg}</span>;
  }

  // Fondo oscuro: isotipo real + wordmark en blanco (el texto navy del PNG no contrastaría)
  if (tone === 'light') {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        {iconImg}
        <span className="font-display font-bold tracking-tight text-white" style={{ fontSize: Math.round(size * 0.78) }}>
          Moldey
        </span>
      </span>
    );
  }

  // Fondo claro: logo completo real (isotipo + wordmark navy)
  return (
    <img
      src="/brand/moldey-logo.png"
      alt="Moldey"
      onError={() => setImgError(true)}
      style={{ height: size, width: 'auto' }}
      className={`object-contain select-none ${className}`}
      draggable={false}
    />
  );
}
