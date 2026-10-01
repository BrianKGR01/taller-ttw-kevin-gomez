/**
 * Datos de contacto del expositor, leídos de `assets/contacto.md`.
 *
 * Función pura: recibe el texto del archivo (o `null` si no existe) y devuelve
 * lo que la diapositiva de cierre necesita. Lo que falta o no es válido queda en
 * `null` y la diapositiva muestra un espacio marcado y discreto.
 *
 * Formato esperado (tolerante a negritas, guiones y mayúsculas):
 *
 *   - **Nombre:** Kevin Brayan Gómez Rocha
 *   - **Instagram:** https://www.instagram.com/kevin_gomez_rocha
 *   - **WhatsApp:** https://wa.me/59175020808
 *   - **LinkedIn:** https://www.linkedin.com/in/kevinbgr
 *
 * Seguridad: solo se aceptan enlaces https del dominio de cada red; cualquier
 * otro valor se descarta (el archivo se publica en el HTML).
 */

export type RedId = 'instagram' | 'whatsapp' | 'linkedin';

export const REDES: readonly RedId[] = ['instagram', 'whatsapp', 'linkedin'];

export interface Red {
  /** Enlace https canónico. */
  url: string;
  /** Texto corto para mostrar: `@usuario`, `+591 75020808`, `in/usuario`. */
  texto: string;
}

export interface Contacto {
  nombre: string | null;
  redes: Record<RedId, Red | null>;
}

/** Dominios aceptados por red. */
const DOMINIOS: Record<RedId, readonly string[]> = {
  instagram: ['instagram.com'],
  whatsapp: ['wa.me', 'whatsapp.com'],
  linkedin: ['linkedin.com'],
};

const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** `[texto](url)` y `<url>` se reducen a la url; si no, el valor tal cual. */
function valorLimpio(bruto: string): string {
  const v = bruto.trim();
  const enlace = /\]\(\s*([^)\s]+)/.exec(v);
  if (enlace) return enlace[1]!;
  const angular = /^<([^>]+)>$/.exec(v);
  if (angular) return angular[1]!;
  return v;
}

function urlDeRed(valor: string, red: RedId): URL | null {
  let u: URL;
  try {
    u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(valor) ? valor : `https://${valor}`);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.replace(/^www\./, '').toLowerCase();
  const ok = DOMINIOS[red].some((d) => host === d || host.endsWith(`.${d}`));
  return ok ? u : null;
}

const segmentos = (u: URL) => u.pathname.split('/').filter(Boolean);

function instagram(valor: string): Red | null {
  const suelto = /^@?([A-Za-z0-9._]{1,30})$/.exec(valor);
  let usuario: string | null = suelto ? suelto[1]! : null;
  if (!usuario) {
    const u = urlDeRed(valor, 'instagram');
    usuario = u ? (segmentos(u)[0] ?? null) : null;
  }
  if (!usuario || !/^[A-Za-z0-9._]{1,30}$/.test(usuario)) return null;
  return { url: `https://www.instagram.com/${usuario}`, texto: `@${usuario}` };
}

function linkedin(valor: string): Red | null {
  const suelto = /^(?:in\/)?([A-Za-z0-9_%-]{3,100})$/.exec(valor);
  let usuario: string | null = suelto ? suelto[1]! : null;
  if (!usuario) {
    const u = urlDeRed(valor, 'linkedin');
    const s = u ? segmentos(u) : [];
    if (s[0] === 'in' && s[1]) usuario = s[1];
  }
  if (!usuario) return null;
  return { url: `https://www.linkedin.com/in/${usuario}`, texto: `in/${usuario}` };
}

/** `59175020808` → `+591 75020808` (Bolivia: 591 + 8 dígitos); otros países: `+dígitos`. */
export function formatearTelefono(digitos: string): string {
  if (/^591\d{8}$/.test(digitos)) return `+591 ${digitos.slice(3)}`;
  return `+${digitos}`;
}

function whatsapp(valor: string): Red | null {
  let digitos: string | null = null;
  if (/^\+?[\d\s().-]{7,20}$/.test(valor)) {
    digitos = valor.replace(/\D/g, '');
  } else {
    const u = urlDeRed(valor, 'whatsapp');
    if (u) digitos = (u.searchParams.get('phone') ?? segmentos(u)[0] ?? '').replace(/\D/g, '');
  }
  if (!digitos || digitos.length < 7 || digitos.length > 15) return null;
  return { url: `https://wa.me/${digitos}`, texto: formatearTelefono(digitos) };
}

const PARSEADORES: Record<RedId, (valor: string) => Red | null> = { instagram, whatsapp, linkedin };

export function parsearContacto(texto: string | null | undefined): Contacto {
  const contacto: Contacto = { nombre: null, redes: { instagram: null, whatsapp: null, linkedin: null } };
  if (!texto) return contacto;

  for (const linea of texto.split(/\r?\n/)) {
    const m = /^\s*[-*+]?\s*([^:]+?)\s*:\s*(.+?)\s*$/.exec(linea.replace(/\*\*|__/g, ''));
    if (!m) continue;
    const clave = sinAcentos(m[1]!).toLowerCase();
    const valor = valorLimpio(m[2]!);
    if (!valor) continue;
    if (clave === 'nombre') {
      contacto.nombre ??= valor;
    } else if ((REDES as readonly string[]).includes(clave)) {
      const red = clave as RedId;
      contacto.redes[red] ??= PARSEADORES[red](valor);
    }
  }
  return contacto;
}
