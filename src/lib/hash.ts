import type { Deck, Estado } from './tipos';
import { normalizar, primera } from './navegacion';

/**
 * Formato de la URL: `#/B/N`, con B el número de bloque impreso (0 a 11) y N el
 * número de la diapositiva dentro del bloque (la "2" de 3.2). `#/5/3` abre la
 * diapositiva 5.3. N = 0 (o ausente) abre la primera del bloque, que en las
 * fases es su apertura. Ver ADR-004.
 */
export function aHash(deck: Deck, s: Estado): string {
  const n = normalizar(deck, s);
  const bloque = deck.bloques[n.b];
  const diapo = bloque?.diapos[n.d];
  if (!bloque || !diapo) return '#/0/1';
  return `#/${bloque.numero}/${diapo.n}`;
}

export function desdeHash(deck: Deck, hash: string): Estado {
  const m = /^#?\/?(\d+)(?:\/(\d+))?\/?$/.exec(hash.trim());
  if (!m) return primera(deck);
  const numeroBloque = Number(m[1]);
  const numeroDiapo = m[2] === undefined ? 0 : Number(m[2]);
  const b = deck.bloques.findIndex((x) => x.numero === numeroBloque);
  if (b < 0) return primera(deck);
  const d = deck.bloques[b]!.diapos.findIndex((x) => x.n === numeroDiapo);
  return normalizar(deck, { b, d: d < 0 ? 0 : d, p: 0 });
}
