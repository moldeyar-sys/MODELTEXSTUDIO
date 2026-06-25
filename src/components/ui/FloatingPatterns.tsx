import React from 'react';

/*
  Figuras extraídas directamente del DXF real "BUZO OVER 011-M"
  Coordenadas normalizadas de los POLYLINE de cada pieza.
  fill="none" stroke="currentColor" → silueta limpia tipo plano técnico.
*/

const Espalda = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <polygon points="3.82,96.81 6.61,86.55 7.80,82.61 8.60,79.21 7.62,76.53 5.22,72.33 3.19,67.67 1.58,62.66 0.52,57.36 0.16,54.31 0.00,51.28 0.00,48.27 0.19,45.29 1.08,39.46 2.61,33.89 3.96,30.35 5.50,27.04 7.22,23.94 9.15,21.03 11.30,18.27 13.63,15.66 16.19,13.17 18.94,10.77 22.78,7.90 26.81,5.50 31.00,3.54 35.31,2.03 39.71,0.93 44.18,0.26 48.67,0.00 53.17,0.12 57.62,0.65 62.02,1.54 66.33,2.80 70.48,4.43 74.48,6.41 78.30,8.72 81.89,11.35 85.22,14.34 88.94,18.39 92.13,22.75 94.78,27.41 96.88,32.29 98.46,37.32 99.51,42.50 100.00,47.74 99.94,53.01 99.33,58.28 98.16,63.45 96.44,68.53 94.13,73.45 91.29,78.16 87.85,82.61 83.86,86.76 79.27,90.56 76.18,92.68 72.97,94.52 69.68,96.08 66.30,97.41 62.83,98.44 59.34,99.23 55.77,99.74 52.19,100.00 48.60,100.00 44.99,99.72 41.38,99.21 37.82,98.42 34.26,97.39 30.76,96.08 27.32,94.55 23.94,92.75 19.17,92.91 13.97,94.26 8.78,95.73 5.92,96.46" />
  </svg>
);

const Frente = () => (
  <svg viewBox="0 0 100 108" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <polygon points="65.69,0.02 100.00,9.21 99.12,21.68 98.78,29.06 98.70,33.17 98.78,40.36 99.14,49.95 97.67,54.63 97.23,56.21 96.57,59.20 96.25,61.46 96.18,62.22 96.09,65.29 96.09,66.06 95.76,108.00 49.95,108.00 4.14,107.95 3.85,66.02 3.81,62.94 3.77,62.17 3.51,59.91 3.38,59.16 2.72,56.16 1.58,52.24 0.82,49.90 1.23,38.71 1.27,33.12 1.11,26.56 0.87,21.64 0.00,9.16 34.32,0.00 34.85,3.85 35.16,5.37 35.68,7.19 36.15,8.28 36.44,8.81 36.88,9.49 37.93,10.76 38.52,11.33 39.67,12.28 40.92,13.09 42.27,13.77 43.69,14.27 43.97,14.35 45.55,14.64 47.15,14.79 50.00,14.92 52.85,14.79 55.24,14.52 56.02,14.35 56.31,14.28 57.73,13.78 59.08,13.10 60.32,12.29 61.48,11.34 62.62,10.16 63.12,9.51 63.56,8.82 64.10,7.76 64.32,7.20 64.84,5.39 65.28,3.10" />
  </svg>
);

const Manga = () => (
  <svg viewBox="0 0 100 119" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <polygon points="0.00,9.45 13.17,5.84 22.44,3.55 25.24,2.93 31.72,1.68 37.32,0.84 42.58,0.30 43.46,0.23 48.71,0.01 49.59,0.00 49.98,0.00 50.38,0.00 55.64,0.15 56.51,0.21 61.78,0.69 62.65,0.80 69.18,1.78 74.74,2.85 83.12,4.77 86.82,5.71 100.00,9.29 79.49,118.90 50.18,118.90 20.87,119.00" />
  </svg>
);

const Bolsillo = () => (
  <svg viewBox="0 0 100 65" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <polygon points="21.16,0.34 25.14,5.73 49.82,5.40 74.51,5.40 78.46,0.00 100.00,42.41 94.68,45.11 90.99,64.56 50.11,64.56 9.22,65.00 5.35,45.58 0.00,42.93" />
  </svg>
);

const Capucha = () => (
  <svg viewBox="0 0 100 141" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <polygon points="0.01,0.00 27.75,0.67 37.37,1.04 42.17,1.42 49.35,2.43 50.78,2.69 56.44,3.96 59.24,4.75 64.81,6.67 67.53,7.80 71.57,9.76 75.47,12.00 79.41,14.67 81.92,16.62 85.52,19.84 87.77,22.15 90.42,25.26 92.80,28.58 94.88,32.13 96.72,36.10 97.95,39.62 98.29,40.82 99.30,45.54 99.80,50.31 100.00,55.11 96.23,120.80 84.48,121.54 83.02,121.67 76.75,122.41 72.07,123.24 68.04,124.26 65.45,125.23 62.88,126.52 55.17,131.03 51.15,133.23 46.98,135.09 42.56,136.51 39.55,137.25 32.24,138.70 24.67,139.67 20.11,140.07 7.74,140.74 0.00,141.00" />
  </svg>
);

const Pretina = () => (
  <svg viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <polygon points="0.01,0.00 25.43,0.00 50.00,0.00 74.57,0.00 99.99,0.00 100.00,10.00 99.99,20.00 50.00,20.00 0.01,20.00 0.00,10.00" />
  </svg>
);

const Punho = () => (
  <svg viewBox="0 0 100 56" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <polygon points="0.00,0.01 100.00,0.00 100.00,28.00 100.00,56.00 0.00,56.00 0.00,28.00" />
  </svg>
);

/* ── Tipos ── */
type ShapeName = 'espalda' | 'frente' | 'manga' | 'bolsillo' | 'capucha' | 'pretina' | 'punho';

const SHAPE_MAP: Record<ShapeName, React.FC> = {
  espalda:  Espalda,
  frente:   Frente,
  manga:    Manga,
  bolsillo: Bolsillo,
  capucha:  Capucha,
  pretina:  Pretina,
  punho:    Punho,
};

interface PieceConfig {
  shape: ShapeName;
  x: number;
  y: number;
  w: number;
  rotation: number;
  delay: number;
  duration: number;
  opacity: number;
  driftX: number;
}

const PIECES: PieceConfig[] = [
  // Fila superior
  { shape: 'frente',   x: 0,  y: 0,  w: 75, rotation: -8,  delay: 0,   duration: 18, opacity: 0.18, driftX: 6  },
  { shape: 'espalda',  x: 30, y: 2,  w: 68, rotation: 5,   delay: 5,   duration: 21, opacity: 0.16, driftX: 8  },
  { shape: 'capucha',  x: 62, y: 0,  w: 46, rotation: -15, delay: 1,   duration: 17, opacity: 0.17, driftX: -7 },
  { shape: 'manga',    x: 82, y: 3,  w: 50, rotation: 20,  delay: 2,   duration: 16, opacity: 0.16, driftX: -5 },

  // Fila media
  { shape: 'bolsillo', x: 5,  y: 42, w: 55, rotation: 12,  delay: 3,   duration: 19, opacity: 0.17, driftX: 5  },
  { shape: 'pretina',  x: 28, y: 50, w: 72, rotation: -4,  delay: 1.5, duration: 15, opacity: 0.15, driftX: 7  },
  { shape: 'manga',    x: 72, y: 42, w: 46, rotation: -22, delay: 4,   duration: 20, opacity: 0.16, driftX: -6 },

  // Fila inferior
  { shape: 'capucha',  x: 0,  y: 72, w: 40, rotation: 18,  delay: 0.5, duration: 22, opacity: 0.15, driftX: -4 },
  { shape: 'frente',   x: 22, y: 68, w: 60, rotation: -12, delay: 7,   duration: 18, opacity: 0.15, driftX: 6  },
  { shape: 'bolsillo', x: 55, y: 75, w: 42, rotation: -20, delay: 3.5, duration: 16, opacity: 0.15, driftX: -8 },
  { shape: 'punho',    x: 76, y: 80, w: 48, rotation: 8,   delay: 6,   duration: 14, opacity: 0.14, driftX: 9  },

  // Extras para densidad
  { shape: 'espalda',  x: 48, y: 35, w: 52, rotation: -30, delay: 2.5, duration: 19, opacity: 0.14, driftX: 5  },
  { shape: 'pretina',  x: 60, y: 60, w: 60, rotation: 10,  delay: 4.5, duration: 17, opacity: 0.13, driftX: -6 },
];

export function FloatingPatterns() {
  return (
    <>
      <style>{`
        @keyframes float-molde {
          0%   { transform: translateY(0px)   translateX(0px)                       rotate(var(--rot)); }
          30%  { transform: translateY(-14px) translateX(var(--dx))                 rotate(calc(var(--rot) + 3deg)); }
          60%  { transform: translateY(-24px) translateX(0px)                       rotate(var(--rot)); }
          80%  { transform: translateY(-10px) translateX(calc(var(--dx) * -0.5))    rotate(calc(var(--rot) - 2deg)); }
          100% { transform: translateY(0px)   translateX(0px)                       rotate(var(--rot)); }
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
                left:    `${p.x}%`,
                top:     `${p.y}%`,
                width:   p.w,
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
