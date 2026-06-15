import { useState } from 'react';

interface BrandLogoProps {
  /** 'full' = isotipo + wordmark · 'icon' = solo isotipo */
  variant?: 'full' | 'icon';
  /** 'dark' = wordmark azul (fondos claros) · 'light' = wordmark crema (fondos oscuros) */
  tone?: 'dark' | 'light';
  /** alto del logo en px */
  size?: number;
  className?: string;
}

export function BrandLogo({ variant = 'full', tone = 'dark', size = 36, className = '' }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  const icon = imgError ? (
    <span
      className="inline-flex items-center justify-center rounded-md bg-brand-blue text-white font-display font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.55) }}
    >
      M
    </span>
  ) : (
    <img
      src="/brand/modeltex-icon.png"
      alt="Modeltex"
      onError={() => setImgError(true)}
      style={{ height: size, width: size }}
      className="object-contain rounded-md select-none flex-shrink-0"
      draggable={false}
    />
  );

  if (variant === 'icon') {
    return <span className={`inline-flex ${className}`}>{icon}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {icon}
      <span
        className={`font-display font-bold tracking-tight ${tone === 'light' ? 'text-brand-cream' : 'text-brand-blue'}`}
        style={{ fontSize: Math.round(size * 0.6) }}
      >
        Modeltex
      </span>
    </span>
  );
}
