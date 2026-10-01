/**
 * Filtro de rueda/trackpad: una pasada = un avance, sin saltos dobles.
 *
 * Un trackpad sigue emitiendo eventos por inercia durante ~1 s después de que
 * el dedo se levantó. Tras disparar, el filtro se bloquea hasta que haya un
 * silencio real (`silencioMs`) y haya pasado el tiempo mínimo (`minimoMs`).
 */
export interface OpcionesRueda {
  umbral?: number;
  silencioMs?: number;
  minimoMs?: number;
}

export type DireccionRueda = -1 | 0 | 1;

export function crearFiltroRueda(o: OpcionesRueda = {}) {
  const { umbral = 40, silencioMs = 160, minimoMs = 220 } = o;
  let acumulado = 0;
  let bloqueado = false;
  let ultimo = -Infinity;
  let disparo = -Infinity;

  return function procesar(deltaY: number, ahora: number): DireccionRueda {
    if (bloqueado) {
      const silencio = ahora - ultimo >= silencioMs;
      const pasoElMinimo = ahora - disparo >= minimoMs;
      if (silencio && pasoElMinimo) {
        bloqueado = false;
        acumulado = 0;
      } else {
        ultimo = ahora;
        return 0;
      }
    }
    // Un silencio largo descarta lo acumulado: eran gestos distintos.
    if (ahora - ultimo > silencioMs * 2) acumulado = 0;
    ultimo = ahora;
    // Un cambio de dirección reinicia el acumulado.
    if (acumulado !== 0 && Math.sign(acumulado) !== Math.sign(deltaY)) acumulado = 0;
    acumulado += deltaY;
    if (Math.abs(acumulado) < umbral) return 0;
    const dir: DireccionRueda = acumulado > 0 ? 1 : -1;
    bloqueado = true;
    disparo = ahora;
    acumulado = 0;
    return dir;
  };
}
