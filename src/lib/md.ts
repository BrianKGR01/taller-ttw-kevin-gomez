import { Marked, type Tokens } from 'marked';

export interface OpcionesMd {
  /** Marca cada elemento de lista de primer nivel como paso de revelado. */
  pasosEnListas?: boolean;
}

export interface ResultadoMd {
  html: string;
  pasos: number;
}

const escapar = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Bloque de código con botón "Copiar". El texto completo viaja en `data-texto`
 * para el portapapeles; `<code>` se puede teclear en pantalla (efecto agente).
 * Mismo marcado que usa src/components/CodigoBloque.astro.
 */
export function htmlBloqueCodigo(texto: string, opts: { titulo?: string; lang?: string; teclear?: boolean } = {}): string {
  const { titulo = '', lang = '', teclear = true } = opts;
  const limpio = texto.replace(/\n+$/, '');
  return (
    `<figure class="codigo" data-copiable${teclear ? ' data-teclear' : ''}>` +
    `<figcaption class="codigo__barra"><span class="codigo__titulo">${escapar(titulo || lang || 'texto')}</span>` +
    `<button type="button" class="accion accion--secundaria codigo__copiar" data-copiar aria-label="Copiar ${escapar(titulo || 'el texto')}">` +
    `<span class="copiar__texto" data-copiar-texto>Copiar</span></button></figcaption>` +
    `<pre class="codigo__pre" tabindex="0" data-scroll><code data-texto="${escapar(limpio)}">${escapar(limpio)}</code></pre>` +
    `</figure>`
  );
}

export function renderizarMd(fuente: string, opciones: OpcionesMd = {}): ResultadoMd {
  const marked = new Marked({ gfm: true, breaks: false });
  marked.use({
    renderer: {
      code({ text, lang }: Tokens.Code) {
        const info = (lang ?? '').trim();
        const m = /^(\S+)?(?:\s+titulo="([^"]*)")?/.exec(info);
        const l = m?.[1] ?? '';
        const titulo = m?.[2] ?? '';
        return htmlBloqueCodigo(text, { lang: l, titulo, teclear: !/^(sin-teclear)$/.test(l) });
      },
      listitem(this: any, item: Tokens.ListItem) {
        const cuerpo = this.parser.parse(item.tokens, !!item.loose);
        const paso = (item as any).paso as number | undefined;
        if (paso) return `<li data-paso="${paso}" class="paso">${cuerpo}</li>\n`;
        return `<li>${cuerpo}</li>\n`;
      },
      link({ href, title, tokens }: Tokens.Link) {
        const texto = (this as any).parser.parseInline(tokens);
        const externo = /^https?:\/\//.test(href);
        const t = title ? ` title="${escapar(title)}"` : '';
        return `<a href="${escapar(href)}"${t}${externo ? ' target="_blank" rel="noopener noreferrer"' : ''}>${texto}</a>`;
      },
    },
  });
  const tokens = marked.lexer(fuente);
  let pasos = 0;
  if (opciones.pasosEnListas) {
    // Solo los elementos de primer nivel de cada lista son pasos de revelado.
    for (const t of tokens) {
      if (t.type === 'list') for (const item of (t as Tokens.List).items) (item as any).paso = ++pasos;
    }
  }
  return { html: marked.parser(tokens), pasos };
}

/** Separa el cuerpo en lo que va en la diapositiva y lo que solo va en modo lectura. */
export function separarLectura(cuerpo: string): { pres: string; lectura: string } {
  const partes = cuerpo.split(/^\s*<!--\s*lectura\s*-->\s*$/m);
  return { pres: (partes[0] ?? '').trim(), lectura: partes.slice(1).join('\n').trim() };
}
