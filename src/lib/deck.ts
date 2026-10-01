import { getCollection } from 'astro:content';
import { Marked, type Tokens } from 'marked';
import { renderizarMd, separarLectura } from './md';
import type { Deck } from './tipos';

export interface ItemDiapo {
  id: string;
  n: number;
  bloque: number;
  fase: number;
  tipo: string;
  titulo?: string | undefined;
  subtitulo?: string | undefined;
  etiqueta?: string | undefined;
  sinDev?: string | undefined;
  notas?: string | undefined;
  datos: Record<string, any>;
  /** Cuerpo renderizado que se ve en presentación (y también en lectura). */
  html: string;
  /** Cuerpo extra, solo modo lectura. */
  htmlLectura: string;
  pasos: number;
  /** Para el tipo `tabla`: columnas y filas con HTML en línea. */
  tabla?: { cols: string[]; filas: string[][] };
}

export interface ItemBloque {
  numero: number;
  titulo: string;
  corto: string;
  fase: number;
  tiempo60: number;
  tiempo30: number;
  /** Nota del expositor, renderizada. */
  notaHtml: string;
  diapos: ItemDiapo[];
}

const inline = new Marked({ gfm: true });

function tablaDeMd(cuerpo: string): ItemDiapo['tabla'] {
  const t = new Marked({ gfm: true }).lexer(cuerpo).find((x) => x.type === 'table') as Tokens.Table | undefined;
  if (!t) return undefined;
  const cel = (c: Tokens.TableCell) => inline.parser([{ type: 'paragraph', raw: c.text, text: c.text, tokens: c.tokens } as Tokens.Paragraph]).replace(/^<p>|<\/p>\s*$/g, '');
  return { cols: t.header.map(cel), filas: t.rows.map((r) => r.map(cel)) };
}

export async function cargarBloques(): Promise<ItemBloque[]> {
  const [bloquesRaw, diaposRaw] = await Promise.all([getCollection('bloques'), getCollection('diapositivas')]);
  const bloques = [...bloquesRaw].sort((a, b) => a.data.numero - b.data.numero);

  const items = bloques.map((b) => {
    const delBloque = diaposRaw.filter((d) => d.data.bloque === b.data.numero).sort((x, y) => x.data.n - y.data.n);
    const vistos = new Set<number>();
    for (const d of delBloque) {
      if (vistos.has(d.data.n)) throw new Error(`Diapositiva duplicada: ${b.data.numero}.${d.data.n}`);
      vistos.add(d.data.n);
    }

    const diapos: ItemDiapo[] = delBloque.map((d) => {
      const { pres, lectura } = separarLectura(d.body ?? '');
      const r = renderizarMd(pres, { pasosEnListas: d.data.pasos });
      const extra = lectura ? renderizarMd(lectura).html : '';
      const item: ItemDiapo = {
        id: `${b.data.numero}.${d.data.n}`,
        n: d.data.n,
        bloque: b.data.numero,
        fase: b.data.fase,
        tipo: d.data.tipo,
        titulo: d.data.titulo,
        subtitulo: d.data.subtitulo,
        etiqueta: d.data.etiqueta,
        sinDev: d.data.sinDev,
        notas: d.data.notas,
        datos: d.data.datos ?? {},
        html: r.html,
        htmlLectura: extra,
        pasos: r.pasos,
      };
      if (d.data.tipo === 'tabla') item.tabla = tablaDeMd(pres);
      // El recorrido de un documento tiene un paso por sección y uno final que vuelve a la vista completa.
      if (d.data.tipo === 'documento') item.pasos = ((d.data.datos?.secciones as unknown[] | undefined)?.length ?? 0) + 1;
      // El roadmap por hitos revela un hito por avance, y el ciclo del final como un paso más.
      if (d.data.tipo === 'hitos' && Array.isArray(d.data.datos?.hitos)) {
        item.pasos = d.data.datos.hitos.length + (Array.isArray(d.data.datos.ciclo) && d.data.datos.ciclo.length ? 1 : 0);
      }
      return item;
    });

    if (b.data.apertura) {
      diapos.unshift({
        id: `${b.data.numero}.0`,
        n: 0,
        bloque: b.data.numero,
        fase: b.data.fase,
        tipo: 'apertura',
        titulo: b.data.titulo,
        etiqueta: `Fase ${b.data.fase}`,
        datos: {},
        html: '',
        htmlLectura: '',
        pasos: 0,
      });
    }

    return {
      numero: b.data.numero,
      titulo: b.data.titulo,
      corto: b.data.corto,
      fase: b.data.fase,
      tiempo60: b.data.tiempo60,
      tiempo30: b.data.tiempo30,
      notaHtml: renderizarMd(b.body ?? '').html,
      diapos,
    };
  });
  // Un bloque sin diapositivas no existe para la navegación ni para la lectura.
  return items.filter((b) => b.diapos.length > 0);
}

/** El modelo mínimo que necesita el motor de navegación del cliente. */
export function metaDeck(bloques: ItemBloque[]): Deck {
  return {
    bloques: bloques.map((b) => ({
      numero: b.numero,
      diapos: b.diapos.map((d) => ({ id: d.id, n: d.n, pasos: d.pasos })),
    })),
  };
}
