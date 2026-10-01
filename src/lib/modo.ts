/** Dos modos de uso: presentación (una a la vez) y lectura (scroll continuo). ADR-005. */
export type ModoUso = 'presentacion' | 'lectura';

export const CLAVE_MODO = 'gdg-taller-modo';
/** Con este ancho de ventana o menos, el modo por defecto es lectura. */
export const ANCHO_MAX_LECTURA = 820;

export function esModoUso(v: unknown): v is ModoUso {
  return v === 'presentacion' || v === 'lectura';
}

/** Prioridad: parámetro de URL > elección guardada > pantalla chica ⇒ lectura. */
export function resolverModo(opts: {
  param: string | null;
  guardado: string | null;
  ancho: number;
}): ModoUso {
  if (esModoUso(opts.param)) return opts.param;
  if (esModoUso(opts.guardado)) return opts.guardado;
  return opts.ancho <= ANCHO_MAX_LECTURA ? 'lectura' : 'presentacion';
}

export function alternarModo(m: ModoUso): ModoUso {
  return m === 'presentacion' ? 'lectura' : 'presentacion';
}
