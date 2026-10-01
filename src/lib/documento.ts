import { Marked, type Token, type Tokens } from 'marked';

/** Un paso del recorrido: el `##` a recorrer y para qué sirve. */
export interface PasoTour {
  titulo: string;
  etiqueta: string;
}

export interface SeccionDoc {
  /** Texto exacto del `##`. */
  titulo: string;
  /** Posición de la sección entre todos los `##` del documento (0-based). */
  indice: number;
  /** Paso del recorrido (1-based) si la sección está en el recorrido. */
  paso: number | null;
  /** Cuerpo de la sección, sin el encabezado. */
  html: string;
}

export interface DocumentoRenderizado {
  /** Todo lo que va antes del primer `##`: título y presentación. */
  cabecera: string;
  secciones: SeccionDoc[];
}

const escapar = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Marked para la hoja del documento. Diferencias con md.ts: los enlaces no
 * navegan (la hoja es una ilustración, sus rutas relativas no existen en el
 * sitio), los bloques de código no llevan botón ni tecleo, y los niveles de
 * título bajan tres escalones para no competir con los de la diapositiva.
 */
function crearMarked(): Marked {
  const marked = new Marked({ gfm: true, breaks: false });
  marked.use({
    renderer: {
      heading(this: any, { tokens, depth }: Tokens.Heading) {
        const nivel = Math.min(depth + 3, 6);
        return `<h${nivel} class="doc-h doc-h${depth}">${this.parser.parseInline(tokens)}</h${nivel}>\n`;
      },
      checkbox({ checked }: Tokens.Checkbox) {
        return `<span class="casilla${checked ? ' casilla--hecha' : ''}" role="img" aria-label="${checked ? 'hecho' : 'pendiente'}"></span> `;
      },
      html({ text }: Tokens.HTML | Tokens.Tag) {
        return escapar(text);
      },
      link(this: any, { tokens }: Tokens.Link) {
        return `<span class="doc-enlace">${this.parser.parseInline(tokens)}</span>`;
      },
      code({ text }: Tokens.Code) {
        return `<pre class="doc-codigo"><code>${escapar(text)}</code></pre>\n`;
      },
      table(this: any, token: Tokens.Table) {
        const cel = (c: Tokens.TableCell, tag: string) => {
          const al = c.align ? ` style="text-align:${c.align}"` : '';
          return `<${tag}${al}>${this.parser.parseInline(c.tokens)}</${tag}>`;
        };
        const cab = `<tr>${token.header.map((c) => cel(c, 'th')).join('')}</tr>`;
        const filas = token.rows.map((r) => `<tr>${r.map((c) => cel(c, 'td')).join('')}</tr>`).join('');
        return `<div class="doc-tabla" role="region" aria-label="Tabla del documento"><table><thead>${cab}</thead><tbody>${filas}</tbody></table></div>\n`;
      },
    },
  });
  return marked;
}

/**
 * Los ítems con casilla (`- [ ] texto`) se escriben con la continuación
 * sangrada al texto (6 espacios), pero Markdown mide la sangría desde el guion
 * (2): lo que sigue quedaría como bloque de código. Se quitan 4 espacios solo
 * para dibujar la hoja; el archivo que se copia y se descarga no se toca.
 */
export function normalizarCasillas(fuente: string): string {
  let dentro = false;
  return fuente
    .split('\n')
    .map((linea) => {
      if (/^- \[.\] /.test(linea)) {
        dentro = true;
        return linea;
      }
      if (!dentro || linea.trim() === '') return linea;
      if (/^ {6}/.test(linea)) return linea.slice(4);
      dentro = false;
      return linea;
    })
    .join('\n');
}

/**
 * Renderiza el documento como hoja, dividido en secciones `##`. Cada paso del
 * recorrido debe nombrar un `##` real y respetar el orden del documento: si no
 * coincide, falla (así el desfase se ve al construir, no en la sala).
 */
export function renderizarDocumento(fuente: string, tour: PasoTour[]): DocumentoRenderizado {
  const marked = crearMarked();
  const tokens = marked.lexer(normalizarCasillas(fuente.replace(/\r\n/g, '\n')));
  const links = (tokens as any).links ?? {};

  const grupos: { titulo: string | null; tokens: Token[] }[] = [{ titulo: null, tokens: [] }];
  for (const t of tokens) {
    if (t.type === 'heading' && (t as Tokens.Heading).depth === 2) grupos.push({ titulo: (t as Tokens.Heading).text.trim(), tokens: [] });
    else grupos[grupos.length - 1]!.tokens.push(t);
  }

  const aHtml = (ts: Token[]) => {
    const lista = Object.assign([...ts], { links });
    return marked.parser(lista as any);
  };

  const [cabecera, ...resto] = grupos;
  const titulos = resto.map((g) => g.titulo as string);

  let previo = -1;
  const pasoDe = new Map<number, number>();
  tour.forEach((p, i) => {
    const pos = titulos.indexOf(p.titulo.trim());
    if (pos < 0) throw new Error(`Recorrido: "${p.titulo}" no es un "##" del documento. Títulos reales:\n  - ${titulos.join('\n  - ')}`);
    if (pos <= previo) throw new Error(`Recorrido: "${p.titulo}" está fuera del orden del documento.`);
    previo = pos;
    pasoDe.set(pos, i + 1);
  });

  return {
    cabecera: aHtml(cabecera!.tokens),
    secciones: resto.map((g, indice) => ({
      titulo: g.titulo as string,
      indice,
      paso: pasoDe.get(indice) ?? null,
      html: aHtml(g.tokens),
    })),
  };
}
