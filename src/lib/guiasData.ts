// Índice de las guías para producción (/guias). Cada guía vive en su propio
// archivo en src/lib/guias/. Lo usan la app y middleware.ts.

import type { Guia } from './guiasTypes.js';
import { guia as formatos } from './guias/formatos-de-molderia-digital.js';
import { guia as dxf } from './guias/abrir-moldes-dxf-en-optitex-audaces-gerber-lectra.js';
import { guia as talles } from './guias/curva-de-talles-industrial.js';
import { guia as tizada } from './guias/tizada-computarizada-mrk.js';
import { guia as consumo } from './guias/consumo-de-tela-por-prenda.js';
import { guia as costeo } from './guias/costeo-de-una-prenda.js';
import { guia as telas } from './guias/telas-por-tipo-de-prenda.js';
import { guia as plotter } from './guias/impresion-de-moldes-en-plotter.js';
import { guia as coleccion } from './guias/armar-una-coleccion-con-moldes-digitales.js';
import { guia as uniformes } from './guias/uniformes-escolares-y-de-trabajo.js';
import { guia as glosario } from './guias/glosario-de-molderia.js';
import { guia as sublimacion } from './guias/moldes-para-sublimacion.js';

export type { Guia, GuiaSection, GuiaFaq, GuiaLink } from './guiasTypes.js';

export const GUIAS: Guia[] = [
  formatos,
  telas,
  talles,
  consumo,
  costeo,
  tizada,
  plotter,
  dxf,
  coleccion,
  uniformes,
  sublimacion,
  glosario,
];

export function findGuia(slug: string): Guia | undefined {
  return GUIAS.find((g) => g.slug === slug);
}

export const GUIAS_TITLE = 'Guías para producir ropa con moldes digitales';
export const GUIAS_DESCRIPTION =
  'Guías prácticas para fabricantes, talleres y marcas: formatos de moldería, telas, curva de talles, tizadas, consumo de tela, costeo, plotter, uniformes y sublimación.';
