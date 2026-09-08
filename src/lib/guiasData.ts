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
import { guia as pasoAPaso } from './guias/como-hacer-moldes-de-ropa-paso-a-paso.js';
import { guia as medidas } from './guias/medidas-corporales-para-moldes-de-ropa.js';
import { guia as tablaMedidas } from './guias/tabla-de-medidas-industriales.js';
import { guia as moldePantalon } from './guias/como-hacer-el-molde-base-de-un-pantalon.js';
import { guia as moldeFalda } from './guias/como-hacer-el-molde-base-de-una-falda.js';
import { guia as escalarPatrones } from './guias/como-escalar-patrones-de-costura.js';
import { guia as diferenciaMolderiaPatronaje } from './guias/diferencia-entre-molderia-y-patronaje.js';
import { guia as programasGratis } from './guias/programas-gratis-de-molderia-digital.js';
import { guia as patronajeIndustrial } from './guias/que-es-el-patronaje-industrial.js';
import { guia as digitalizarPatrones } from './guias/como-digitalizar-patrones-de-papel.js';
import { guia as tablaSaXl } from './guias/tabla-de-medidas-s-a-xl-dama-hombre-nino.js';
import { guia as fichaTecnica } from './guias/ficha-tecnica-de-diseno-para-taller-de-confeccion.js';
import { guia as reglasSisaEscote } from './guias/reglas-de-escalado-de-sisa-y-escote.js';
import { guia as consumoConRinde } from './guias/como-calcular-consumo-de-tela-con-el-rinde.js';
import { guia as exportarDxf } from './guias/exportar-y-convertir-dxf-entre-optitex-y-audaces.js';
import { guia as nombreMarca } from './guias/como-elegir-el-nombre-de-una-marca-de-moldes-o-ropa.js';
import { guia as diccionarioIngles } from './guias/diccionario-ingles-espanol-de-molderia-y-costura.js';
import { guia as copyInstagram } from './guias/copy-para-vender-moldes-digitales-en-instagram.js';
import { guia as arrugasTiro } from './guias/arrugas-en-el-tiro-del-pantalon-causas-y-correccion.js';
import { guia as conversionPulgadas } from './guias/conversion-de-pulgadas-a-centimetros-para-molderia.js';

export type { Guia, GuiaSection, GuiaFaq, GuiaLink } from './guiasTypes.js';

export const GUIAS: Guia[] = [
  pasoAPaso,
  formatos,
  telas,
  medidas,
  talles,
  tablaMedidas,
  tablaSaXl,
  moldePantalon,
  moldeFalda,
  consumo,
  consumoConRinde,
  costeo,
  escalarPatrones,
  reglasSisaEscote,
  tizada,
  plotter,
  dxf,
  exportarDxf,
  patronajeIndustrial,
  diferenciaMolderiaPatronaje,
  programasGratis,
  digitalizarPatrones,
  fichaTecnica,
  arrugasTiro,
  conversionPulgadas,
  diccionarioIngles,
  coleccion,
  nombreMarca,
  copyInstagram,
  uniformes,
  sublimacion,
  glosario,
];

export function findGuia(slug: string): Guia | undefined {
  return GUIAS.find((g) => g.slug === slug);
}

export const GUIAS_TITLE = 'Guías para producir ropa con moldes digitales';
export const GUIAS_DESCRIPTION =
  'Guías prácticas para fabricantes, talleres y marcas: cómo hacer moldes paso a paso, medidas, escalado de talles, formatos, telas, tizadas, costeo, uniformes y sublimación.';

// ---------------------------------------------------------------------------
// Autoridad temática: cluster por guía + "más guías" determinístico.
//
// Antes, el sidebar "Más guías" tomaba siempre los primeros 6 elementos de
// GUIAS (mismo array, mismo orden) → 25 de 32 guías mostraban siempre el
// mismo listado, y 7 nunca recibían un link de otra guía. Ahora cada guía
// tiene un "cluster" temático (pillar/tema, no una entidad nueva por guía
// para no sobre-modelar); getRelatedGuias() arma el listado real: primero
// hermanas del mismo cluster (en el orden en que aparecen en GUIAS, asi es
// reproducible), y si faltan para completar `count`, suma de otros clusters
// — nunca aleatorio, siempre el mismo resultado para la misma guía.
// ---------------------------------------------------------------------------
export type GuiaCluster =
  | 'fundamentos'
  | 'moldes-base'
  | 'digital-cad'
  | 'produccion'
  | 'negocio'
  | 'nichos';

export const GUIA_CLUSTERS: Record<GuiaCluster, string> = {
  fundamentos: 'Fundamentos de moldería',
  'moldes-base': 'Moldes base y calce',
  'digital-cad': 'Formatos y CAD',
  produccion: 'Producción y costos',
  negocio: 'Vender y escalar',
  nichos: 'Nichos de producción',
};

const CLUSTER_BY_SLUG: Record<string, GuiaCluster> = {
  'como-hacer-moldes-de-ropa-paso-a-paso': 'fundamentos',
  'medidas-corporales-para-moldes-de-ropa': 'fundamentos',
  'tabla-de-medidas-industriales': 'fundamentos',
  'tabla-de-medidas-s-a-xl-dama-hombre-nino': 'fundamentos',
  'diferencia-entre-molderia-y-patronaje': 'fundamentos',
  'que-es-el-patronaje-industrial': 'fundamentos',
  'glosario-de-molderia': 'fundamentos',

  'como-hacer-el-molde-base-de-un-pantalon': 'moldes-base',
  'como-hacer-el-molde-base-de-una-falda': 'moldes-base',
  'arrugas-en-el-tiro-del-pantalon-causas-y-correccion': 'moldes-base',
  'reglas-de-escalado-de-sisa-y-escote': 'moldes-base',
  'como-escalar-patrones-de-costura': 'moldes-base',

  'formatos-de-molderia-digital': 'digital-cad',
  'abrir-moldes-dxf-en-optitex-audaces-gerber-lectra': 'digital-cad',
  'exportar-y-convertir-dxf-entre-optitex-y-audaces': 'digital-cad',
  'programas-gratis-de-molderia-digital': 'digital-cad',
  'como-digitalizar-patrones-de-papel': 'digital-cad',
  'conversion-de-pulgadas-a-centimetros-para-molderia': 'digital-cad',
  'ficha-tecnica-de-diseno-para-taller-de-confeccion': 'digital-cad',

  'telas-por-tipo-de-prenda': 'produccion',
  'consumo-de-tela-por-prenda': 'produccion',
  'como-calcular-consumo-de-tela-con-el-rinde': 'produccion',
  'costeo-de-una-prenda': 'produccion',
  'tizada-computarizada-mrk': 'produccion',
  'impresion-de-moldes-en-plotter': 'produccion',
  'curva-de-talles-industrial': 'produccion',

  'armar-una-coleccion-con-moldes-digitales': 'negocio',
  'como-elegir-el-nombre-de-una-marca-de-moldes-o-ropa': 'negocio',
  'copy-para-vender-moldes-digitales-en-instagram': 'negocio',
  'diccionario-ingles-espanol-de-molderia-y-costura': 'negocio',

  'uniformes-escolares-y-de-trabajo': 'nichos',
  'moldes-para-sublimacion': 'nichos',
};

export function guiaCluster(slug: string): GuiaCluster | undefined {
  return CLUSTER_BY_SLUG[slug];
}

/**
 * Guías relacionadas, deterministico. Mismo cluster primero (en el orden de
 * GUIAS), completando con el resto si hace falta. Nunca la propia guía.
 */
export function getRelatedGuias(slug: string, count = 6): Guia[] {
  const cluster = CLUSTER_BY_SLUG[slug];
  const others = GUIAS.filter((g) => g.slug !== slug);
  const sameCluster = cluster ? others.filter((g) => CLUSTER_BY_SLUG[g.slug] === cluster) : [];
  const rest = others.filter((g) => !sameCluster.includes(g));
  return [...sameCluster, ...rest].slice(0, count);
}
