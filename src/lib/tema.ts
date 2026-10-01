/** Tres estados: sistema · claro · oscuro. Ver ADR-006 y el sistema de diseño §3. */
export const ESTADOS_TEMA = ['sistema', 'claro', 'oscuro'] as const;
export type EstadoTema = (typeof ESTADOS_TEMA)[number];

export const CLAVE_TEMA = 'gdg-taller-tema';

export function esEstadoTema(v: unknown): v is EstadoTema {
  return typeof v === 'string' && (ESTADOS_TEMA as readonly string[]).includes(v);
}

export function siguienteTema(actual: EstadoTema): EstadoTema {
  const i = ESTADOS_TEMA.indexOf(actual);
  return ESTADOS_TEMA[(i + 1) % ESTADOS_TEMA.length]!;
}

export interface Almacen {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

export function leerTema(almacen: Almacen | null): EstadoTema {
  try {
    const v = almacen?.getItem(CLAVE_TEMA);
    return esEstadoTema(v) ? v : 'sistema';
  } catch {
    return 'sistema';
  }
}

export function guardarTema(almacen: Almacen | null, tema: EstadoTema): void {
  try {
    almacen?.setItem(CLAVE_TEMA, tema);
  } catch {
    /* navegación privada o almacenamiento bloqueado: el tema sigue valiendo en memoria */
  }
}

/** `claro` / `oscuro` van como `data-modo`; `sistema` lo quita. */
export function aplicarTema(raiz: HTMLElement, tema: EstadoTema): void {
  if (tema === 'sistema') delete raiz.dataset.modo;
  else raiz.dataset.modo = tema;
  raiz.dataset.temaEstado = tema;
}

/** Tema efectivo (lo que se ve), dado el estado y la preferencia del sistema. */
export function temaEfectivo(tema: EstadoTema, sistemaOscuro: boolean): 'claro' | 'oscuro' {
  if (tema === 'sistema') return sistemaOscuro ? 'oscuro' : 'claro';
  return tema;
}
