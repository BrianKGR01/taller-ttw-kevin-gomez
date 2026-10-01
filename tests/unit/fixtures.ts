import type { Deck } from '../../src/lib/tipos';

/**
 * Un taller en miniatura con la misma forma que el real:
 *  - bloque 0: dos diapositivas, sin pasos
 *  - bloque 1: tres diapositivas; la 1.2 tiene 3 pasos de revelado
 *  - bloque 3: una fase con apertura (n = 0) y dos diapositivas; no hay bloque 2
 *    (los números impresos no tienen por qué ser consecutivos en el modelo).
 */
export const deck: Deck = {
  bloques: [
    {
      numero: 0,
      diapos: [
        { id: '0.1', n: 1, pasos: 0 },
        { id: '0.2', n: 2, pasos: 0 },
      ],
    },
    {
      numero: 1,
      diapos: [
        { id: '1.1', n: 1, pasos: 0 },
        { id: '1.2', n: 2, pasos: 3 },
        { id: '1.3', n: 3, pasos: 0 },
      ],
    },
    {
      numero: 3,
      diapos: [
        { id: '3.0', n: 0, pasos: 0 },
        { id: '3.1', n: 1, pasos: 0 },
        { id: '3.2', n: 2, pasos: 0 },
      ],
    },
  ],
};
