import React from 'react';

/*
  Figuras extraídas de los DXF reales:
  - "BUZO OVER 011-M": frente buzo, manga buzo, bolsillo, capucha, pretina, puño
  - "REMERA 01": frente remera, espalda remera, manga remera, cuello
  fill="none" stroke="currentColor" → silueta limpia tipo plano técnico.
*/

/* ── REMERA 01 ── */
const RemeraFrente = () => (
  <svg viewBox="0 0 100 144" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <polygon points="33.85,0.00 35.04,4.26 35.89,6.76 36.22,7.58 37.19,9.62 37.57,10.27 38.39,11.46 39.35,12.54 40.60,13.60 41.98,14.48 43.48,15.19 45.05,15.71 46.68,16.02 50.00,16.31 53.32,16.02 54.95,15.71 56.52,15.19 58.02,14.48 59.40,13.60 60.65,12.54 61.61,11.46 62.43,10.27 63.48,8.27 63.78,7.58 64.69,5.10 65.92,0.86 66.15,0.00 91.71,6.14 90.10,15.07 89.36,20.46 88.99,24.64 88.89,27.16 88.94,31.51 89.12,34.13 89.44,36.78 89.79,38.53 90.03,39.38 90.55,40.81 90.89,41.49 91.67,42.63 92.14,43.13 92.75,43.63 93.41,44.05 95.01,44.78 97.48,45.57 100.00,46.21 99.45,78.26 99.34,92.40 99.34,96.22 99.53,116.28 99.99,139.21 99.88,144.00 50.00,144.00 0.12,144.00 0.01,139.21 0.57,109.60 0.66,96.22 0.66,92.40 0.44,69.78 0.00,46.21 3.35,45.33 4.99,44.78 6.59,44.05 7.25,43.63 7.86,43.13 8.33,42.63 9.11,41.49 9.73,40.10 9.97,39.38 10.40,37.66 10.80,35.01 10.88,34.13 11.12,29.77 11.12,27.16 10.89,22.97 10.64,20.46 9.90,15.07 8.29,6.14" />
  </svg>
);

const RemeraEspalda = () => (
  <svg viewBox="0 0 100 147" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <polygon points="99.90,147.00 50.00,147.00 0.10,147.00 0.01,142.23 0.48,109.90 0.54,99.44 0.54,96.73 0.54,94.24 0.32,69.52 0.00,49.55 3.36,48.68 5.00,48.13 6.61,47.40 7.27,46.98 7.88,46.48 8.35,45.99 9.12,44.85 9.74,43.47 9.98,42.75 10.41,41.03 10.81,38.39 10.91,37.50 11.20,33.08 11.24,29.54 11.06,25.29 10.78,21.90 9.97,15.62 8.30,5.80 33.25,0.00 36.14,1.99 37.66,2.86 39.33,3.63 40.19,3.95 41.98,4.47 42.89,4.67 45.52,5.04 46.41,5.11 50.00,5.24 53.60,5.11 56.24,4.82 57.11,4.67 58.92,4.24 59.81,3.95 61.52,3.27 62.35,2.86 64.59,1.51 66.75,0.00 91.70,5.80 90.03,15.62 89.23,21.90 88.84,26.99 88.76,29.54 88.84,33.96 89.09,37.50 89.43,40.15 89.79,41.90 90.02,42.75 90.54,44.17 90.88,44.85 91.65,45.99 92.12,46.48 92.73,46.98 93.39,47.40 95.00,48.13 97.48,48.91 100.00,49.55 99.52,82.83 99.46,94.24 99.46,96.73 99.46,99.44 99.67,123.21 99.99,142.23" />
  </svg>
);

const RemeraManga = () => (
  <svg viewBox="0 0 100 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <polygon points="100.00,35.42 94.86,57.84 96.28,64.00 3.74,64.00 5.15,57.84 0.00,35.35 5.53,33.35 7.69,32.44 10.71,30.93 12.56,29.76 13.44,29.11 15.16,27.59 15.96,26.76 18.24,24.04 21.90,18.81 22.50,17.93 25.69,13.46 26.37,12.60 28.53,10.08 30.88,7.75 33.37,5.70 34.25,5.08 37.01,3.37 37.96,2.87 40.93,1.57 41.95,1.22 45.07,0.44 46.12,0.28 50.03,0.00 53.86,0.27 57.09,0.84 58.16,1.11 61.30,2.13 62.32,2.54 65.32,3.96 66.29,4.49 69.11,6.23 70.01,6.86 72.74,9.00 75.27,11.37 77.58,13.95 79.65,16.73 82.83,21.94 83.46,22.98 85.36,25.88 86.74,27.60 87.50,28.39 89.09,29.77 89.93,30.39 92.73,32.08 96.84,34.07" />
  </svg>
);

const Cuello = () => (
  <svg viewBox="0 0 100 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <polygon points="100.00,0.00 100.00,5.50 100.00,11.00 78.48,11.00 50.00,11.00 21.52,11.00 0.00,11.00 0.00,5.50 0.00,0.00 21.52,0.00 50.00,0.00 78.48,0.00" />
  </svg>
);

/* ── BUZO OVER 011-M ── */

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
type ShapeName = 'frente' | 'manga' | 'bolsillo' | 'capucha' | 'pretina' | 'punho'
  | 'r-frente' | 'r-espalda' | 'r-manga' | 'cuello';

const SHAPE_MAP: Record<ShapeName, React.FC> = {
  'r-frente':  RemeraFrente,
  'r-espalda': RemeraEspalda,
  'r-manga':   RemeraManga,
  'cuello':    Cuello,
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

// Lluvia de moldes — mezcla piezas del BUZO OVER y la REMERA 01
const PIECES: PieceConfig[] = [
  // Columna 1
  { shape: 'r-frente',  x: 0,  y: 0, w: 70, rotation: -8,  delay: 0,    duration: 13, opacity: 0.19, driftX: 0 },
  { shape: 'pretina',   x: 0,  y: 0, w: 65, rotation: 5,   delay: 7,    duration: 13, opacity: 0.16, driftX: 0 },
  // Columna 2
  { shape: 'manga',     x: 13, y: 0, w: 55, rotation: 15,  delay: 1.5,  duration: 14, opacity: 0.18, driftX: 0 },
  { shape: 'r-espalda', x: 13, y: 0, w: 65, rotation: -10, delay: 8.5,  duration: 14, opacity: 0.17, driftX: 0 },
  // Columna 3
  { shape: 'frente',    x: 26, y: 0, w: 68, rotation: -5,  delay: 3,    duration: 12, opacity: 0.18, driftX: 0 },
  { shape: 'bolsillo',  x: 26, y: 0, w: 55, rotation: 20,  delay: 9.5,  duration: 12, opacity: 0.16, driftX: 0 },
  // Columna 4
  { shape: 'capucha',   x: 39, y: 0, w: 50, rotation: -20, delay: 0.5,  duration: 11, opacity: 0.19, driftX: 0 },
  { shape: 'r-manga',   x: 39, y: 0, w: 62, rotation: 8,   delay: 7,    duration: 11, opacity: 0.17, driftX: 0 },
  // Columna 5
  { shape: 'bolsillo',  x: 52, y: 0, w: 58, rotation: 12,  delay: 2,    duration: 15, opacity: 0.18, driftX: 0 },
  { shape: 'r-frente',  x: 52, y: 0, w: 68, rotation: -15, delay: 9,    duration: 15, opacity: 0.16, driftX: 0 },
  // Columna 6
  { shape: 'cuello',    x: 63, y: 0, w: 68, rotation: -6,  delay: 4,    duration: 12, opacity: 0.16, driftX: 0 },
  { shape: 'manga',     x: 63, y: 0, w: 58, rotation: 10,  delay: 10.5, duration: 12, opacity: 0.17, driftX: 0 },
  // Columna 7
  { shape: 'r-manga',   x: 76, y: 0, w: 58, rotation: -25, delay: 1,    duration: 13, opacity: 0.18, driftX: 0 },
  { shape: 'r-espalda', x: 76, y: 0, w: 65, rotation: 5,   delay: 8,    duration: 13, opacity: 0.16, driftX: 0 },
  // Columna 8
  { shape: 'capucha',   x: 87, y: 0, w: 46, rotation: 18,  delay: 5,    duration: 14, opacity: 0.18, driftX: 0 },
  { shape: 'punho',     x: 87, y: 0, w: 58, rotation: -12, delay: 11.5, duration: 14, opacity: 0.16, driftX: 0 },
];

export function FloatingPatterns() {
  return (
    <>
      <style>{`
        @keyframes rain-fall {
          0%   { transform: translateY(-120px) rotate(var(--rot)); opacity: 0; }
          8%   { opacity: var(--op); }
          88%  { opacity: var(--op); }
          100% { transform: translateY(110vh)  rotate(var(--rot)); opacity: 0; }
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
                top:     0,
                width:   p.w,
                opacity: 0,
                // @ts-ignore
                '--rot': `${p.rotation}deg`,
                '--op':  p.opacity,
                animation: `rain-fall ${p.duration}s linear ${p.delay}s infinite`,
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
