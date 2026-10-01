/**
 * Lógica pura de la cámara del recorrido de documentos (tipo `documento`).
 *
 * El documento es una hoja que se dibuja a su tamaño natural; la "cámara" es
 * una transformación `translate(x, y) scale(s)` con origen arriba a la
 * izquierda. Un punto (px, py) de la hoja cae en (x + s·px, y + s·py) dentro
 * de la vista. Todo son números: no toca el DOM, así se prueba sin navegador.
 */

export interface Tamano {
  w: number;
  h: number;
}

/** Caja de una sección dentro de la hoja, en píxeles de la hoja (sin escala). */
export interface Caja {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Camara {
  /** Desplazamiento horizontal de la hoja dentro de la vista. */
  x: number;
  /** Desplazamiento vertical de la hoja dentro de la vista. */
  y: number;
  /** Escala. 1 = tamaño natural de la hoja. */
  s: number;
}

export interface Medidas {
  vista: Tamano;
  hoja: Tamano;
}

export interface OpcionesGeneral {
  /** Dónde cae el centro de la hoja, como fracción del ancho de la vista (0.5 = centrada). */
  ancla?: number;
  /** Margen alrededor de la hoja, como fracción de la altura de la vista. */
  margen?: number;
}

export interface OpcionesSeccion {
  /** Cuánto del ancho de la vista ocupa la sección al hacer zoom (0..1). */
  ocupacion?: number;
  /** Aire sobre el título de la sección, como fracción de la altura de la vista. */
  margenSuperior?: number;
  /** Aire bajo el final de la sección, como fracción de la altura de la vista. */
  margenInferior?: number;
}

export interface TomaSeccion {
  /** Cámara al llegar: el título de la sección queda arriba. */
  inicio: Camara;
  /** Cámara al terminar de recorrer la sección (igual a `inicio` si entra entera). */
  fin: Camara;
  /** Cuántas alturas de vista se desplaza la cámara en la deriva (0 si no hay). */
  pantallas: number;
}

const limitar = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

/** Vista de pájaro: la hoja entera, en el centro o hacia un lado. */
export function camaraGeneral({ vista, hoja }: Medidas, { ancla = 0.5, margen = 0.04 }: OpcionesGeneral = {}): Camara {
  if (vista.w <= 0 || vista.h <= 0 || hoja.w <= 0 || hoja.h <= 0) return { x: 0, y: 0, s: 1 };
  const aire = vista.h * margen;
  const s = Math.min((vista.h - aire * 2) / hoja.h, (vista.w * 0.9) / hoja.w);
  return { s, x: vista.w * ancla - (hoja.w * s) / 2, y: (vista.h - hoja.h * s) / 2 };
}

/**
 * Toma de una sección: zoom hasta que la sección llene el ancho de la vista
 * (queda centrada), título arriba. Si la hoja tiene varias columnas, la cámara
 * viaja también en horizontal de una columna a otra.
 * Si la sección es más alta que la vista, `fin` es la cámara con el final de
 * la sección abajo: la deriva lenta va de `inicio` a `fin`.
 */
export function camaraSeccion(m: Medidas, sec: Caja, op: OpcionesSeccion = {}): TomaSeccion {
  const { ocupacion = 0.9, margenSuperior = 0.04, margenInferior = 0.04 } = op;
  const { vista, hoja } = m;
  const s = sec.w > 0 ? (vista.w * ocupacion) / sec.w : 1;
  const x = vista.w / 2 - s * (sec.x + sec.w / 2);
  const sup = vista.h * margenSuperior;
  const inf = vista.h * margenInferior;
  // Nunca se muestra más allá de la hoja: arriba y abajo hay un tope.
  const topeSup = sup;
  const topeInf = vista.h - inf - hoja.h * s;
  const yInicio = limitar(sup - sec.y * s, topeInf, topeSup);
  const yFin = limitar(vista.h - inf - (sec.y + sec.h) * s, topeInf, topeSup);
  // Solo hay deriva si la sección no entra: el final queda más arriba que el inicio.
  const viaje = Math.max(0, yInicio - yFin);
  const hayDeriva = viaje > vista.h * 0.04;
  const inicio: Camara = { x, y: yInicio, s };
  return {
    inicio,
    fin: hayDeriva ? { x, y: yFin, s } : inicio,
    pantallas: hayDeriva ? viaje / vista.h : 0,
  };
}

/* ───────────────────────── Pasos del recorrido ───────────────────────── */

export type EstadoRecorrido = { tipo: 'general' } | { tipo: 'seccion'; indice: number };

/**
 * p = 0 → vista completa · p = k (1..N) → sección k (índice k-1) ·
 * p = N+1 → vista completa otra vez.
 */
export function estadoDePaso(p: number, secciones: number): EstadoRecorrido {
  if (!Number.isFinite(p) || p < 1 || p > secciones) return { tipo: 'general' };
  return { tipo: 'seccion', indice: Math.floor(p) - 1 };
}

/** ¿Debe el recorrido avanzar solo desde este paso? Solo con el recorrido en marcha y sin llegar al final. */
export function avanzaSolo(p: number, secciones: number): boolean {
  return p >= 1 && p <= secciones;
}

/**
 * Duración de la deriva por una sección larga. Cada altura de vista recorrida
 * cuesta una fracción del tiempo de auto-avance; tiene piso y techo para que
 * ni un tramo corto ni uno larguísimo se sientan mal.
 */
export function duracionDeriva(pantallas: number, autoAvanceMs: number): number {
  if (pantallas <= 0) return 0;
  return Math.round(Math.min(Math.max(autoAvanceMs * 0.7 * pantallas, autoAvanceMs * 0.5), autoAvanceMs * 4));
}
