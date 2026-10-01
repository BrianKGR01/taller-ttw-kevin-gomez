/**
 * Protocolo entre la ventana principal y la vista de presentador (y las
 * miniaturas incrustadas). Mensajes pequeños, validados al recibir: un canal
 * `BroadcastChannel` es de mismo origen, pero nada garantiza que lo que llega
 * tenga la forma esperada (otra pestaña con una versión vieja, por ejemplo).
 */
export const CANAL = 'taller-ttw-2026';

export const ACCIONES = [
  'siguiente',
  'anterior',
  'bloque-siguiente',
  'bloque-anterior',
  'abajo',
  'arriba',
  'inicio',
  'fin',
] as const;
export type Accion = (typeof ACCIONES)[number];

export type MensajeEstado = { tipo: 'estado'; b: number; d: number; p: number; id: string };
export type MensajeComando = { tipo: 'comando'; accion: Accion };
export type MensajeHola = { tipo: 'hola' };
/** Para las miniaturas incrustadas: ir a una posición exacta. */
export type MensajeIr = { tipo: 'ir'; b: number; d: number; p: number };
export type Mensaje = MensajeEstado | MensajeComando | MensajeHola | MensajeIr;

const entero = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 10_000;

export function esAccion(v: unknown): v is Accion {
  return typeof v === 'string' && (ACCIONES as readonly string[]).includes(v);
}

export function validarMensaje(m: unknown): Mensaje | null {
  if (typeof m !== 'object' || m === null) return null;
  const o = m as Record<string, unknown>;
  switch (o.tipo) {
    case 'estado':
      return entero(o.b) && entero(o.d) && entero(o.p) && typeof o.id === 'string' && o.id.length < 12 ? { tipo: 'estado', b: o.b, d: o.d, p: o.p, id: o.id } : null;
    case 'comando':
      return esAccion(o.accion) ? { tipo: 'comando', accion: o.accion } : null;
    case 'hola':
      return { tipo: 'hola' };
    case 'ir':
      return entero(o.b) && entero(o.d) && entero(o.p) ? { tipo: 'ir', b: o.b, d: o.d, p: o.p } : null;
    default:
      return null;
  }
}
