/** Preferencias del entorno que condicionan el movimiento. */
const mqReducido = window.matchMedia('(prefers-reduced-motion: reduce)');

export function movimientoReducido(): boolean {
  return mqReducido.matches;
}

export function alCambiarMovimiento(fn: () => void): void {
  mqReducido.addEventListener('change', fn);
}

/** Ahorro de datos o conexión muy lenta: no se cargan videos. */
export function ahorroDeDatos(): boolean {
  const c = (navigator as any).connection;
  if (!c) return false;
  return Boolean(c.saveData) || /(^|-)2g$/.test(c.effectiveType ?? '');
}

/** Resuelve un color de token (por ejemplo `var(--fase-actual)`) a un valor que el canvas entiende. */
export function resolverColor(expresion: string): string {
  const sonda = document.createElement('span');
  sonda.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;';
  sonda.style.color = expresion;
  document.body.appendChild(sonda);
  const valor = getComputedStyle(sonda).color;
  sonda.remove();
  return valor;
}

/** Lee un token numérico de tiempo (por ejemplo `--mov-medio: 320ms`) en milisegundos. */
export function tokenMs(nombre: string, respaldo: number): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
  const m = /^([\d.]+)(ms|s)$/.exec(v);
  if (!m) return respaldo;
  return m[2] === 's' ? Number(m[1]) * 1000 : Number(m[1]);
}
