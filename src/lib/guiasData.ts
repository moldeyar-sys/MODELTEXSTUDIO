// Índice de las guías para producción (/guias). Cada guía vive en su propio
// archivo en src/lib/guias/. Lo usan la app y middleware.ts.

import type { Guia } from './guiasTypes';
import { guia as formatos } from './guias/formatos-de-molderia-digital';
import { guia as dxf } from './guias/abrir-moldes-dxf-en-optitex-audaces-gerber-lectra';
import { guia as talles } from './guias/curva-de-talles-industrial';
import { guia as tizada } from './guias/tizada-computarizada-mrk';
import { guia as consumo } from './guias/consumo-de-tela-por-prenda';
import { guia as costeo } from './guias/costeo-de-una-prenda';
import { guia as telas } from './guias/telas-por-tipo-de-prenda';
import { guia as plotter } from './guias/impresion-de-moldes-en-plotter';
import { guia as coleccion } from './guias/armar-una-coleccion-con-moldes-digitales';
import { guia as uniformes } from './guias/uniformes-escolares-y-de-trabajo';
import { guia as glosario } from './guias/glosario-de-molderia';
import { guia as sublimacion } from './guias/moldes-para-sublimacion';

export type { Guia, GuiaSection, GuiaFaq, GuiaLink } from './guiasTypes';

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
