import { useState } from 'react';

interface BrandLogoProps {
  /** 'full' = maniquí + MODELTEX · 'icon' = solo el maniquí */
  variant?: 'full' | 'icon';
  /** 'dark' = nombre en azul, para fondo claro · 'light' = en blanco, para fondo oscuro */
  tone?: 'dark' | 'light';
  /** alto del maniquí en px */
  size?: number;
  className?: string;
}

/**
 * La marca es el maniquí. El nombre va como texto de verdad al lado, no dentro
 * de la imagen: así se ve nítido en cualquier tamaño y pantalla, cambia de
 * color según el fondo, y el pie —que es azul— no se come un recuadro negro
 * como pasaba con el logo viejo, que traía su propio fondo pegado.
 *
 * El archivo lo genera scripts/generar-iconos.mjs a partir del original.
 */
const MARCA = '/brand/modeltex-mark.png?v=4';

/** Medidas reales del archivo. Sin esto el navegador no sabe cuánto ancho
 *  reservar hasta que baja la imagen, y el texto de al lado salta solo en el
 *  primer pintado. */
const ANCHO = 706;
const ALTO = 1024;

export function BrandLogo({ variant = 'full', tone = 'dark', size = 40, className = '' }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md bg-brand-blue text-white font-bold ${className}`}
        style={{ height: size, paddingInline: size * 0.3, fontSize: Math.round(size * 0.4) }}
      >
        MODELTEX
      </span>
    );
  }

  const marca = (
    <img
      src={MARCA}
      // Con el nombre al lado la imagen no aporta texto nuevo: si además
      // dijera "Modeltex", un lector de pantalla leería la marca dos veces.
      alt={variant === 'icon' ? 'Modeltex' : ''}
      width={ANCHO}
      height={ALTO}
      decoding="async"
      onError={() => setImgError(true)}
      style={{ height: size, width: 'auto', aspectRatio: `${ANCHO} / ${ALTO}` }}
      className="object-contain select-none"
      draggable={false}
    />
  );

  if (variant === 'icon') return <span className={`inline-flex ${className}`}>{marca}</span>;

  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: size * 0.22 }}>
      {marca}
      <span
        className={`font-bold tracking-tight leading-none ${tone === 'light' ? 'text-white' : 'text-primary-900'}`}
        style={{ fontSize: Math.round(size * 0.42) }}
      >
        MODELTEX
      </span>
    </span>
  );
}
