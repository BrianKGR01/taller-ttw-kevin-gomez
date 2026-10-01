export type Gesto = 'izquierda' | 'derecha' | 'arriba' | 'abajo' | null;

export interface OpcionesGesto {
  /** Distancia mínima en px para contar como swipe. */
  distanciaMin?: number;
  /** Duración máxima en ms. */
  duracionMax?: number;
  /** El eje dominante debe superar al otro por este factor. */
  dominancia?: number;
}

/**
 * Clasifica un gesto táctil. `izquierda` = el dedo fue hacia la izquierda
 * (siguiente bloque); `arriba` = el dedo fue hacia arriba (avanzar).
 */
export function clasificarGesto(dx: number, dy: number, dt: number, o: OpcionesGesto = {}): Gesto {
  const { distanciaMin = 48, duracionMax = 900, dominancia = 1.3 } = o;
  if (dt > duracionMax) return null;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (Math.max(ax, ay) < distanciaMin) return null;
  if (ax >= ay * dominancia) return dx < 0 ? 'izquierda' : 'derecha';
  if (ay >= ax * dominancia) return dy < 0 ? 'arriba' : 'abajo';
  return null;
}
