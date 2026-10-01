/**
 * Datos de una tarjeta de vista previa de enlace.
 *
 * Los metadatos Open Graph los guarda `scripts/obtener-og.mjs` en
 * `src/data/enlaces.json` (los datos van commiteados: el build no usa la red).
 * Aquí se resuelve la entrada de una URL y, si no hay datos útiles, se arma lo
 * mínimo para la tarjeta de respaldo: nombre y enlace.
 */

export interface EntradaEnlace {
  url: string;
  dominio?: string;
  slug?: string;
  titulo?: string;
  descripcion?: string;
  sitio?: string;
  /** Ruta relativa a `src/`, p. ej. `assets/enlaces/devbro-xyz.webp`. */
  imagen?: string;
  ok?: boolean;
}

export interface DatosEnlace {
  url: string;
  dominio: string;
  /** Nombre del sitio; siempre existe (en el respaldo sale del dominio). */
  sitio: string;
  titulo: string;
  descripcion: string;
  /** Ruta de la imagen relativa a `src/`, o `null` si no hay. */
  imagen: string | null;
  /** `false` ⇒ tarjeta de respaldo (sin metadatos fiables). */
  completo: boolean;
}

/** Host sin `www.`, en minúsculas. Lanza si la URL no es http(s). */
export function dominioDe(url: string): string {
  const u = new URL(url);
  if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error(`Enlace no permitido: ${url}`);
  return u.hostname.replace(/^www\./, '').toLowerCase();
}

/** `bodegas.drinksonchain.com` → `Bodegas.drinksonchain`; `devbro.xyz` → `Devbro`. */
export function nombreLegible(url: string): string {
  const partes = dominioDe(url).split('.');
  const base = partes.length > 2 ? partes.slice(0, -1).join('.') : (partes[0] ?? '');
  return base.charAt(0).toUpperCase() + base.slice(1);
}

const clave = (url: string) => {
  const u = new URL(url);
  return `${dominioDe(url)}${u.pathname.replace(/\/+$/, '')}`;
};

export function datosDeEnlace(url: string, lista: readonly EntradaEnlace[]): DatosEnlace {
  const dominio = dominioDe(url);
  const e = lista.find((x) => {
    try {
      return clave(x.url) === clave(url);
    } catch {
      return false;
    }
  });
  const completo = Boolean(e && e.ok !== false && e.titulo);
  return {
    url,
    dominio: e?.dominio || dominio,
    sitio: e?.sitio || nombreLegible(url),
    titulo: completo ? e!.titulo! : e?.sitio || nombreLegible(url),
    descripcion: completo ? (e!.descripcion ?? '') : '',
    imagen: completo && e!.imagen ? e!.imagen : null,
    completo,
  };
}
