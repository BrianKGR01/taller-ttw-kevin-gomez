import { describe, expect, it } from 'vitest';
import { aHash, desdeHash } from '../../src/lib/hash';
import { deck } from './fixtures';

describe('URL por diapositiva (#/bloque/diapositiva)', () => {
  it('formatea con el número impreso del bloque y de la diapositiva', () => {
    expect(aHash(deck, { b: 0, d: 0, p: 0 })).toBe('#/0/1');
    expect(aHash(deck, { b: 1, d: 1, p: 2 })).toBe('#/1/2');
    expect(aHash(deck, { b: 2, d: 0, p: 0 })).toBe('#/3/0');
  });

  it('lee la misma posición que escribió (ida y vuelta)', () => {
    for (let b = 0; b < deck.bloques.length; b++) {
      for (let d = 0; d < deck.bloques[b]!.diapos.length; d++) {
        expect(desdeHash(deck, aHash(deck, { b, d, p: 0 }))).toEqual({ b, d, p: 0 });
      }
    }
  });

  it('acepta variantes con y sin almohadilla o barras', () => {
    expect(desdeHash(deck, '#/1/3')).toEqual({ b: 1, d: 2, p: 0 });
    expect(desdeHash(deck, '/1/3')).toEqual({ b: 1, d: 2, p: 0 });
    expect(desdeHash(deck, '#1/3/')).toEqual({ b: 1, d: 2, p: 0 });
  });

  it('un bloque sin número de diapositiva abre la primera del bloque', () => {
    expect(desdeHash(deck, '#/3')).toEqual({ b: 2, d: 0, p: 0 });
    expect(desdeHash(deck, '#/1')).toEqual({ b: 1, d: 0, p: 0 });
  });

  it('una diapositiva que no existe cae en la primera del bloque', () => {
    expect(desdeHash(deck, '#/1/99')).toEqual({ b: 1, d: 0, p: 0 });
  });

  it('un hash inválido o vacío abre la portada', () => {
    expect(desdeHash(deck, '')).toEqual({ b: 0, d: 0, p: 0 });
    expect(desdeHash(deck, '#/hola')).toEqual({ b: 0, d: 0, p: 0 });
    expect(desdeHash(deck, '#/42/1')).toEqual({ b: 0, d: 0, p: 0 });
  });
});
