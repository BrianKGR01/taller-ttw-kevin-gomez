import { describe, expect, it } from 'vitest';
import {
  abajoEnBloque,
  arribaEnBloque,
  avanzar,
  bloqueAnterior,
  bloqueSiguiente,
  indiceLineal,
  irAIndiceLineal,
  normalizar,
  primera,
  retroceder,
  total,
  ultima,
} from '../../src/lib/navegacion';
import { deck } from './fixtures';

const e = (b: number, d: number, p = 0) => ({ b, d, p });

describe('navegación: modelo', () => {
  it('cuenta las diapositivas y da la posición lineal', () => {
    expect(total(deck)).toBe(8);
    expect(indiceLineal(deck, e(0, 0))).toBe(1);
    expect(indiceLineal(deck, e(1, 1))).toBe(4);
    expect(indiceLineal(deck, e(2, 2))).toBe(8);
  });

  it('normaliza posiciones fuera de rango', () => {
    expect(normalizar(deck, e(99, 99, 99))).toEqual(e(2, 2, 0));
    expect(normalizar(deck, e(-3, -1, -5))).toEqual(e(0, 0, 0));
    expect(normalizar(deck, e(1, 1, 99))).toEqual(e(1, 1, 3));
  });

  it('irAIndiceLineal es la inversa de indiceLineal', () => {
    for (let n = 1; n <= total(deck); n++) {
      expect(indiceLineal(deck, irAIndiceLineal(deck, n))).toBe(n);
    }
    expect(irAIndiceLineal(deck, 999)).toEqual(e(2, 2, 0));
  });
});

describe('navegación: bloques (flechas izquierda y derecha)', () => {
  it('derecha salta a la primera diapositiva del bloque siguiente', () => {
    expect(bloqueSiguiente(deck, e(0, 1))).toEqual(e(1, 0));
    expect(bloqueSiguiente(deck, e(1, 2))).toEqual(e(2, 0));
  });
  it('izquierda salta a la primera diapositiva del bloque anterior', () => {
    expect(bloqueAnterior(deck, e(2, 2))).toEqual(e(1, 0));
  });
  it('en los extremos no se mueve', () => {
    expect(bloqueAnterior(deck, e(0, 1))).toEqual(e(0, 1));
    expect(bloqueSiguiente(deck, e(2, 1))).toEqual(e(2, 1));
  });
});

describe('navegación: dentro del bloque (flechas arriba y abajo)', () => {
  it('abajo avanza una diapositiva sin salir del bloque', () => {
    expect(abajoEnBloque(deck, e(0, 0))).toEqual(e(0, 1));
    expect(abajoEnBloque(deck, e(0, 1))).toEqual(e(0, 1));
  });
  it('arriba retrocede una diapositiva sin salir del bloque', () => {
    expect(arribaEnBloque(deck, e(0, 1))).toEqual(e(0, 0));
    expect(arribaEnBloque(deck, e(1, 0))).toEqual(e(1, 0));
  });
  it('abajo revela primero los pasos de la diapositiva', () => {
    expect(abajoEnBloque(deck, e(1, 1, 0))).toEqual(e(1, 1, 1));
    expect(abajoEnBloque(deck, e(1, 1, 3))).toEqual(e(1, 2, 0));
  });
  it('arriba oculta primero los pasos y llega con todos revelados a una diapositiva con pasos', () => {
    expect(arribaEnBloque(deck, e(1, 1, 2))).toEqual(e(1, 1, 1));
    expect(arribaEnBloque(deck, e(1, 2, 0))).toEqual(e(1, 1, 3));
  });
});

describe('navegación: avanzar y retroceder (Espacio, PageDown, PageUp, rueda)', () => {
  it('avanzar recorre todo el taller en orden lineal, pasos incluidos, y termina', () => {
    let s = primera(deck);
    const vistos: string[] = [];
    for (let i = 0; i < 40; i++) {
      const sig = avanzar(deck, s);
      if (sig.b === s.b && sig.d === s.d && sig.p === s.p) break;
      s = sig;
      vistos.push(`${deck.bloques[s.b]!.diapos[s.d]!.id}/${s.p}`);
    }
    expect(vistos).toEqual(['0.2/0', '1.1/0', '1.2/0', '1.2/1', '1.2/2', '1.2/3', '1.3/0', '3.0/0', '3.1/0', '3.2/0']);
    expect(s).toEqual(ultima(deck));
  });

  it('retroceder es el camino inverso y llega con los pasos completos', () => {
    let s = e(1, 2, 0);
    s = retroceder(deck, s);
    expect(s).toEqual(e(1, 1, 3));
    s = retroceder(deck, s);
    expect(s).toEqual(e(1, 1, 2));
  });

  it('cruza de bloque en ambos sentidos', () => {
    expect(avanzar(deck, e(0, 1))).toEqual(e(1, 0));
    expect(retroceder(deck, e(1, 0))).toEqual(e(0, 1));
  });

  it('en la primera y la última no se mueve', () => {
    expect(retroceder(deck, primera(deck))).toEqual(primera(deck));
    expect(avanzar(deck, ultima(deck))).toEqual(ultima(deck));
  });
});
