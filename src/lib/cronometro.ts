/** Lógica del cronómetro de la vista de presentador (pura, sin DOM). */

export function formatear(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const dos = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${dos(m)}:${dos(s)}` : `${dos(m)}:${dos(s)}`;
}

export type EstadoTiempo = 'holgado' | 'atencion' | 'excedido';

/**
 * Compara el tiempo que lleva un bloque con el que se le asignó.
 * `atencion` desde el 85 % del presupuesto; `excedido` al pasarlo.
 */
export function estadoDeTiempo(transcurridoMs: number, presupuestoMin: number): EstadoTiempo {
  if (presupuestoMin <= 0) return 'holgado';
  const razon = transcurridoMs / (presupuestoMin * 60_000);
  if (razon > 1) return 'excedido';
  if (razon >= 0.85) return 'atencion';
  return 'holgado';
}

export type Version = '30' | '60';

export function presupuestoDe(bloque: { tiempo30: number; tiempo60: number }, version: Version): number {
  return version === '30' ? bloque.tiempo30 : bloque.tiempo60;
}

/** Cronómetro con pausa: acumula tiempo solo mientras corre. */
export class Cronometro {
  private acumulado = 0;
  private desde: number | null = null;

  constructor(private readonly ahora: () => number = () => Date.now()) {}

  get corriendo(): boolean {
    return this.desde !== null;
  }
  iniciar(): void {
    if (this.desde === null) this.desde = this.ahora();
  }
  pausar(): void {
    if (this.desde !== null) {
      this.acumulado += this.ahora() - this.desde;
      this.desde = null;
    }
  }
  reiniciar(): void {
    this.acumulado = 0;
    this.desde = null;
  }
  transcurrido(): number {
    return this.acumulado + (this.desde !== null ? this.ahora() - this.desde : 0);
  }
}
