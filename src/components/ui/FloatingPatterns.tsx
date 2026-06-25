import React from 'react';

/* ────────────────────────────────────────────────
   SVGs trazados sobre las fotos reales del usuario
   Fill: none / Stroke: currentColor  → silueta limpia
──────────────────────────────────────────────────*/

/** Delantero de buzo over — escote redondo profundo, sisas cóncavas */
const Delantero = () => (
  <svg viewBox="0 0 100 118" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="
      M 17,9
      L 30,7
      C 37,7 41,16 50,20
      C 59,16 63,7 70,7
      L 83,9
      C 90,14 92,26 88,38
      L 89,112
      Q 89,117 84,117
      L 16,117
      Q 11,117 11,112
      L 12,38
      C 8,26 10,14 17,9
      Z
    " />
  </svg>
);

/** Espalda de buzo over — escote chato/casi recto, sisas cóncavas */
const Espalda = () => (
  <svg viewBox="0 0 100 118" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="
      M 16,9
      L 34,5
      C 42,3 58,3 66,5
      L 84,9
      C 91,14 93,27 89,39
      L 90,112
      Q 90,117 85,117
      L 15,117
      Q 10,117 10,112
      L 11,39
      C 7,27 9,14 16,9
      Z
    " />
  </svg>
);

/** Manga de buzo over — trapecio invertido, cabeza convexa, estrecha abajo */
const Manga = () => (
  <svg viewBox="0 0 100 115" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="
      M 6,32
      C 18,6 82,6 94,32
      L 86,110
      Q 86,115 81,115
      L 19,115
      Q 14,115 14,110
      Z
    " />
  </svg>
);

/** Bolsillo canguro — hexágono horizontal irregular */
const Bolsillo = () => (
  <svg viewBox="0 0 130 78" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="
      M 28,4
      L 102,4
      L 126,24
      L 124,58
      L 100,74
      L 30,74
      L 6,58
      L 4,24
      Z
    " />
  </svg>
);

/** Capucha — forma D: izquierda recta, derecha gran curva convexa */
const Capucha = () => (
  <svg viewBox="0 0 82 112" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="
      M 6,4
      L 38,4
      C 82,4 82,62 52,96
      C 46,103 40,110 34,112
      L 6,112
      Z
    " />
  </svg>
);

/** Puño / ribete largo — rectángulo ancho y bajo con esquinas redondeadas */
const PunioLargo = () => (
  <svg viewBox="0 0 150 34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <rect x="2" y="2" width="146" height="30" rx="5" ry="5" />
  </svg>
);

/** Puño chico — rectángulo pequeño con esquinas redondeadas */
const PunioChico = () => (
  <svg viewBox="0 0 80 34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <rect x="2" y="2" width="76" height="30" rx="5" ry="5" />
  </svg>
);

/* ── Tipos ── */
type ShapeName = 'delantero' | 'espalda' | 'manga' | 'bolsillo' | 'capucha' | 'punio-largo' | 'punio-chico';

interface PieceConfig {
  shape: ShapeName;
  x: number;
  y: number;
  w: number;   // ancho en px
  rotation: number;
  delay: number;
  duration: number;
  opacity: number;
  driftX: number;
}

/* ── Disposición de piezas en el fondo ── */
const PIECES: PieceConfig[] = [
  // Grandes (espalda / delantero)
  { shape: 'espalda',      x: 2,  y: 5,  w: 70, rotation: -8,  delay: 0,   duration: 18, opacity: 0.09, driftX: 6  },
  { shape: 'delantero',    x: 80, y: 10, w: 68, rotation: 12,  delay: 3,   duration: 21, opacity: 0.08, driftX: -7 },
  { shape: 'espalda',      x: 42, y: 55, w: 60, rotation: -18, delay: 7,   duration: 19, opacity: 0.07, driftX: 8  },

  // Manga
  { shape: 'manga',        x: 20, y: 50, w: 50, rotation: 15,  delay: 1.5, duration: 16, opacity: 0.09, driftX: -5 },
  { shape: 'manga',        x: 68, y: 35, w: 45, rotation: -22, delay: 5,   duration: 20, opacity: 0.08, driftX: 7  },

  // Capucha
  { shape: 'capucha',      x: 55, y: 5,  w: 44, rotation: 8,   delay: 2,   duration: 17, opacity: 0.09, driftX: -6 },
  { shape: 'capucha',      x: 8,  y: 65, w: 38, rotation: -15, delay: 6,   duration: 22, opacity: 0.07, driftX: 5  },

  // Bolsillo
  { shape: 'bolsillo',     x: 35, y: 18, w: 48, rotation: 10,  delay: 0.5, duration: 15, opacity: 0.09, driftX: 8  },
  { shape: 'bolsillo',     x: 78, y: 65, w: 40, rotation: -25, delay: 4,   duration: 18, opacity: 0.07, driftX: -9 },

  // Puños
  { shape: 'punio-largo',  x: 5,  y: 38, w: 72, rotation: -5,  delay: 3,   duration: 20, opacity: 0.07, driftX: 4  },
  { shape: 'punio-chico',  x: 60, y: 80, w: 40, rotation: 12,  delay: 1,   duration: 14, opacity: 0.08, driftX: -6 },
];

/* ── Mapa shape → componente ── */
const SHAPE_MAP: Record<ShapeName, React.FC> = {
  'delantero':   Delantero,
  'espalda':     Espalda,
  'manga':       Manga,
  'bolsillo':    Bolsillo,
  'capucha':     Capucha,
  'punio-largo': PunioLargo,
  'punio-chico': PunioChico,
};

export function FloatingPatterns() {
  return (
    <>
      <style>{`
        @keyframes float-molde {
          0%   { transform: translateY(0px)   translateX(0px)                        rotate(var(--rot)); }
          30%  { transform: translateY(-14px) translateX(var(--dx))                  rotate(calc(var(--rot) + 4deg)); }
          60%  { transform: translateY(-24px) translateX(0px)                        rotate(var(--rot)); }
          80%  { transform: translateY(-10px) translateX(calc(var(--dx) * -0.4))     rotate(calc(var(--rot) - 3deg)); }
          100% { transform: translateY(0px)   translateX(0px)                        rotate(var(--rot)); }
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {PIECES.map((p, i) => {
          const Shape = SHAPE_MAP[p.shape];
          return (
            <div
              key={i}
              className="absolute text-white"
              style={{
                left: `${p.x}%`,
                top:  `${p.y}%`,
                width: p.w,
                opacity: p.opacity,
                // @ts-ignore
                '--rot': `${p.rotation}deg`,
                '--dx':  `${p.driftX}px`,
                animation: `float-molde ${p.duration}s ease-in-out ${p.delay}s infinite`,
              }}
            >
              <Shape />
            </div>
          );
        })}
      </div>
    </>
  );
}
