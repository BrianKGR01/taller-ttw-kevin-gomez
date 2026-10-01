/** Una diapositiva tal como la ve el motor de navegación (sin contenido). */
export interface DiapoMeta {
  /** Etiqueta impresa, por ejemplo "3.2". */
  id: string;
  /** Número dentro del bloque: 3.2 -> 2. La apertura de fase es 0. */
  n: number;
  /** Cantidad de pasos de revelado (0 = la diapositiva no tiene pasos). */
  pasos: number;
}

export interface BloqueMeta {
  /** Número de bloque impreso: 0 a 11. */
  numero: number;
  diapos: DiapoMeta[];
}

export interface Deck {
  bloques: BloqueMeta[];
}

/** Posición: índices dentro de `deck.bloques` / `bloque.diapos`, y paso revelado. */
export interface Estado {
  b: number;
  d: number;
  p: number;
}
