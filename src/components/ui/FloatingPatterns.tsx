import React from 'react';

/* ── SVG: Espalda de remera clásica ── */
const BackPiece = () => (
  <svg viewBox="0 0 100 125" fill="none" stroke="currentColor" strokeWidth="2.5" xmlns="http://www.w3.org/2000/svg">
    {/* Cuerpo: escote + hombros + sisas + laterales + bajo */}
    <path d="
      M 38,8
      C 42,2 58,2 62,8
      L 88,18
      C 96,28 94,48 88,60
      L 90,125
      L 10,125
      L 12,60
      C 6,48 4,28 12,18
      Z
    " />
    {/* Línea de grano (flecha vertical) */}
    <line x1="50" y1="40" x2="50" y2="100" strokeWidth="1.5" strokeDasharray="3 3" />
    <polygon points="50,34 47,42 53,42" fill="currentColor" />
    <polygon points="50,106 47,98 53,98" fill="currentColor" />
  </svg>
);

/* ── SVG: Manga de remera clásica ── */
const SleevePiece = () => (
  <svg viewBox="0 0 100 115" fill="none" stroke="currentColor" strokeWidth="2.5" xmlns="http://www.w3.org/2000/svg">
    {/* Cabeza de manga (curva convexa) + cuerpo que angosta + puño */}
    <path d="
      M 8,42
      C 12,18 30,4 50,2
      C 70,4 88,18 92,42
      L 82,115
      L 18,115
      Z
    " />
    {/* Línea de grano */}
    <line x1="50" y1="45" x2="50" y2="98" strokeWidth="1.5" strokeDasharray="3 3" />
    <polygon points="50,39 47,47 53,47" fill="currentColor" />
    <polygon points="50,104 47,96 53,96" fill="currentColor" />
  </svg>
);

/* ── Config de piezas flotantes ── */
interface PieceConfig {
  shape: 'back' | 'sleeve';
  x: number;      // % horizontal
  y: number;      // % vertical inicial
  size: number;   // px
  rotation: number;
  delay: number;  // s
  duration: number; // s
  opacity: number;
  driftX: number; // px de deriva horizontal
}

const PIECES: PieceConfig[] = [
  { shape: 'back',   x: 6,  y: 5,  size: 55, rotation: -12, delay: 0,   duration: 14, opacity: 0.10, driftX: 8  },
  { shape: 'sleeve', x: 20, y: 55, size: 42, rotation: 18,  delay: 2,   duration: 17, opacity: 0.08, driftX: -6 },
  { shape: 'back',   x: 38, y: 15, size: 38, rotation: 5,   delay: 5,   duration: 20, opacity: 0.07, driftX: 10 },
  { shape: 'sleeve', x: 55, y: 60, size: 50, rotation: -20, delay: 1,   duration: 15, opacity: 0.09, driftX: -8 },
  { shape: 'back',   x: 72, y: 8,  size: 44, rotation: 25,  delay: 3.5, duration: 18, opacity: 0.08, driftX: 5  },
  { shape: 'sleeve', x: 85, y: 45, size: 36, rotation: -8,  delay: 6,   duration: 13, opacity: 0.07, driftX: 9  },
  { shape: 'back',   x: 92, y: 70, size: 48, rotation: 15,  delay: 0.5, duration: 16, opacity: 0.06, driftX: -5 },
  { shape: 'sleeve', x: 48, y: 35, size: 32, rotation: -30, delay: 4,   duration: 19, opacity: 0.06, driftX: 7  },
  { shape: 'back',   x: 14, y: 78, size: 40, rotation: 10,  delay: 7,   duration: 21, opacity: 0.07, driftX: -9 },
  { shape: 'sleeve', x: 65, y: 20, size: 46, rotation: -5,  delay: 2.5, duration: 16, opacity: 0.08, driftX: 6  },
];

export function FloatingPatterns() {
  return (
    <>
      <style>{`
        @keyframes float-piece {
          0%   { transform: translateY(0px)   translateX(0px)             rotate(var(--rot)); }
          25%  { transform: translateY(-12px) translateX(var(--drift-x))  rotate(calc(var(--rot) + 3deg)); }
          50%  { transform: translateY(-22px) translateX(0px)             rotate(var(--rot)); }
          75%  { transform: translateY(-10px) translateX(calc(var(--drift-x) * -0.5)) rotate(calc(var(--rot) - 3deg)); }
          100% { transform: translateY(0px)   translateX(0px)             rotate(var(--rot)); }
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {PIECES.map((p, i) => (
          <div
            key={i}
            className="absolute text-white"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              // @ts-ignore
              '--rot': `${p.rotation}deg`,
              '--drift-x': `${p.driftX}px`,
              animation: `float-piece ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          >
            {p.shape === 'back' ? <BackPiece /> : <SleevePiece />}
          </div>
        ))}
      </div>
    </>
  );
}
