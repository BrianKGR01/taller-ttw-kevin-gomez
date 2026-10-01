import type { Deck, Estado, DiapoMeta } from './tipos';

export const INICIO: Estado = { b: 0, d: 0, p: 0 };

const limitar = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export function diapoActual(deck: Deck, s: Estado): DiapoMeta | undefined {
  return deck.bloques[s.b]?.diapos[s.d];
}

/** Total de diapositivas del taller. */
export function total(deck: Deck): number {
  return deck.bloques.reduce((n, b) => n + b.diapos.length, 0);
}

/** Posición lineal 1..total de la diapositiva actual. */
export function indiceLineal(deck: Deck, s: Estado): number {
  let n = 0;
  for (let i = 0; i < s.b; i++) n += deck.bloques[i]?.diapos.length ?? 0;
  return n + s.d + 1;
}

function pasosDe(deck: Deck, b: number, d: number): number {
  return deck.bloques[b]?.diapos[d]?.pasos ?? 0;
}

/** Normaliza un estado para que apunte a algo que existe. */
export function normalizar(deck: Deck, s: Estado): Estado {
  if (deck.bloques.length === 0) return INICIO;
  const b = limitar(s.b, 0, deck.bloques.length - 1);
  const bloque = deck.bloques[b]!;
  const d = limitar(s.d, 0, Math.max(bloque.diapos.length - 1, 0));
  return { b, d, p: limitar(s.p, 0, pasosDe(deck, b, d)) };
}

/** Diapositiva siguiente en orden lineal (cruza de bloque), sin pasos. */
function linealSiguiente(deck: Deck, s: Estado): Estado | null {
  const bloque = deck.bloques[s.b];
  if (!bloque) return null;
  if (s.d < bloque.diapos.length - 1) return { b: s.b, d: s.d + 1, p: 0 };
  if (s.b < deck.bloques.length - 1) return { b: s.b + 1, d: 0, p: 0 };
  return null;
}

/** Diapositiva anterior en orden lineal; llega con todos sus pasos revelados. */
function linealAnterior(deck: Deck, s: Estado): Estado | null {
  if (s.d > 0) return { b: s.b, d: s.d - 1, p: pasosDe(deck, s.b, s.d - 1) };
  if (s.b > 0) {
    const prev = deck.bloques[s.b - 1]!;
    const d = prev.diapos.length - 1;
    return { b: s.b - 1, d, p: pasosDe(deck, s.b - 1, d) };
  }
  return null;
}

/**
 * Avanzar (Espacio, PageDown, rueda): primero los pasos de la diapositiva,
 * después la siguiente en orden lineal.
 */
export function avanzar(deck: Deck, s: Estado): Estado {
  const actual = normalizar(deck, s);
  if (actual.p < pasosDe(deck, actual.b, actual.d)) return { ...actual, p: actual.p + 1 };
  return linealSiguiente(deck, actual) ?? actual;
}

/** Retroceder (Shift+Espacio, PageUp, rueda). */
export function retroceder(deck: Deck, s: Estado): Estado {
  const actual = normalizar(deck, s);
  if (actual.p > 0) return { ...actual, p: actual.p - 1 };
  return linealAnterior(deck, actual) ?? actual;
}

/** Flecha derecha: primera diapositiva del bloque siguiente. */
export function bloqueSiguiente(deck: Deck, s: Estado): Estado {
  const actual = normalizar(deck, s);
  if (actual.b >= deck.bloques.length - 1) return actual;
  return { b: actual.b + 1, d: 0, p: 0 };
}

/** Flecha izquierda: primera diapositiva del bloque anterior. */
export function bloqueAnterior(deck: Deck, s: Estado): Estado {
  const actual = normalizar(deck, s);
  if (actual.b <= 0) return actual;
  return { b: actual.b - 1, d: 0, p: 0 };
}

/**
 * Flecha abajo: como `avanzar`, pero sin salir del bloque. Los pasos se
 * revelan primero para que quien solo use las flechas verticales no se los salte.
 */
export function abajoEnBloque(deck: Deck, s: Estado): Estado {
  const actual = normalizar(deck, s);
  if (actual.p < pasosDe(deck, actual.b, actual.d)) return { ...actual, p: actual.p + 1 };
  const bloque = deck.bloques[actual.b]!;
  if (actual.d >= bloque.diapos.length - 1) return actual;
  return { b: actual.b, d: actual.d + 1, p: 0 };
}

/** Flecha arriba: retrocede pasos y luego diapositivas, sin salir del bloque. */
export function arribaEnBloque(deck: Deck, s: Estado): Estado {
  const actual = normalizar(deck, s);
  if (actual.p > 0) return { ...actual, p: actual.p - 1 };
  if (actual.d <= 0) return actual;
  return { b: actual.b, d: actual.d - 1, p: pasosDe(deck, actual.b, actual.d - 1) };
}

export function primera(deck: Deck): Estado {
  return normalizar(deck, INICIO);
}

export function ultima(deck: Deck): Estado {
  const b = deck.bloques.length - 1;
  const d = Math.max((deck.bloques[b]?.diapos.length ?? 1) - 1, 0);
  return normalizar(deck, { b, d, p: pasosDe(deck, b, d) });
}

export function irAIndiceLineal(deck: Deck, n: number): Estado {
  let resto = limitar(Math.round(n), 1, Math.max(total(deck), 1)) - 1;
  for (let b = 0; b < deck.bloques.length; b++) {
    const len = deck.bloques[b]!.diapos.length;
    if (resto < len) return { b, d: resto, p: 0 };
    resto -= len;
  }
  return primera(deck);
}

export function iguales(a: Estado, b: Estado): boolean {
  return a.b === b.b && a.d === b.d && a.p === b.p;
}
