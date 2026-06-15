import { useState } from 'react';

interface BrandLogoProps {
  /** 'full' = logo completo (buzo + M + texto MODELTEX) · 'icon' = solo la M */
  variant?: 'full' | 'icon';
  /** compat: el logo ya trae su texto, este prop no afecta al logo completo */
  tone?: 'dark' | 'light';
  /** alto del logo en px */
  size?: number;
  className?: string;
}

export function BrandLogo({ variant = 'full', size = 40, className = '' }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  // Logo COMPLETO (buzo + M + MODELTEX) tal cual el isotipo de marca.
  const src = variant === 'icon' ? '/brand/modeltex-icon.png?v=2' : '/brand/modeltex-logo-full.png?v=3';

  if (imgError) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md bg-brand-blue text-white font-display font-bold ${className}`}
        style={{ height: size, paddingInline: size * 0.3, fontSize: Math.round(size * 0.5) }}
      >
        MODELTEX
      </span>
    );
  }

  return (
    <img
      src={src}
      alt="Modeltex"
      onError={() => setImgError(true)}
      style={{ height: size, width: 'auto' }}
      className={`object-contain rounded-lg select-none ${className}`}
      draggable={false}
    />
  );
}
