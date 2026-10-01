import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizarCasillas, renderizarDocumento } from '../../src/lib/documento';

const MD = `# Título del documento

Presentación con un [enlace](../otro.md) relativo.

## Primera
Texto con \`codigo\`.

- [x] **R-1** hecho
      con continuación
- [ ] **R-2** pendiente

      1. uno
      2. dos

## Segunda

| a | b |
|---|---|
| 1 | 2 |

## Tercera
Fin.
`;

describe('renderizarDocumento', () => {
  const tour = [
    { titulo: 'Primera', etiqueta: 'a' },
    { titulo: 'Tercera', etiqueta: 'c' },
  ];

  it('separa la cabecera de las secciones "##"', () => {
    const d = renderizarDocumento(MD, tour);
    expect(d.cabecera).toContain('Título del documento');
    expect(d.secciones.map((s) => s.titulo)).toEqual(['Primera', 'Segunda', 'Tercera']);
    expect(d.secciones.map((s) => s.indice)).toEqual([0, 1, 2]);
  });

  it('numera solo las secciones del recorrido, en orden', () => {
    const d = renderizarDocumento(MD, tour);
    expect(d.secciones.map((s) => s.paso)).toEqual([1, null, 2]);
  });

  it('el cuerpo de la sección no repite su encabezado', () => {
    const d = renderizarDocumento(MD, tour);
    expect(d.secciones[0]!.html).not.toContain('Primera');
  });

  it('los títulos bajan tres niveles para no competir con los de la diapositiva', () => {
    const d = renderizarDocumento(MD, tour);
    expect(d.cabecera).toContain('<h4 class="doc-h doc-h1">');
  });

  it('los enlaces no navegan', () => {
    const d = renderizarDocumento(MD, tour);
    expect(d.cabecera).not.toContain('<a ');
    expect(d.cabecera).toContain('<span class="doc-enlace">enlace</span>');
  });

  it('las tablas van envueltas en una región desplazable', () => {
    const d = renderizarDocumento(MD, tour);
    expect(d.secciones[1]!.html).toContain('class="doc-tabla"');
    expect(d.secciones[1]!.html).toContain('<th>a</th>');
  });

  it('el HTML crudo del documento se escapa', () => {
    const d = renderizarDocumento('# t\n\n## S\n<script>x</script>\n', []);
    expect(d.secciones[0]!.html).not.toContain('<script>');
  });

  it('falla si un paso nombra un título que no existe', () => {
    expect(() => renderizarDocumento(MD, [{ titulo: 'Inexistente', etiqueta: '' }])).toThrow(/no es un "##"/);
  });

  it('falla si el recorrido no sigue el orden del documento', () => {
    const al_reves = [
      { titulo: 'Tercera', etiqueta: '' },
      { titulo: 'Primera', etiqueta: '' },
    ];
    expect(() => renderizarDocumento(MD, al_reves)).toThrow(/fuera del orden/);
  });

  it('acepta archivos con saltos de línea de Windows', () => {
    const d = renderizarDocumento(MD.replace(/\n/g, '\r\n'), tour);
    expect(d.secciones).toHaveLength(3);
  });
});

describe('normalizarCasillas', () => {
  it('quita la sangría extra de la continuación de un ítem con casilla', () => {
    const salida = normalizarCasillas('- [ ] **R-1** texto\n      sigue\n\n      1. uno\n\notra cosa');
    expect(salida).toBe('- [ ] **R-1** texto\n  sigue\n\n  1. uno\n\notra cosa');
  });

  it('no toca las listas sin casilla ni el texto que no está sangrado', () => {
    const md = '- normal\n      raro\n\ntexto';
    expect(normalizarCasillas(md)).toBe(md);
  });

  it('la continuación sangrada se dibuja como lista, no como bloque de código', () => {
    const d = renderizarDocumento('# t\n\n## S\n- [ ] **R-1** x\n\n      1. uno\n      2. dos\n', []);
    expect(d.secciones[0]!.html).toContain('<ol>');
    expect(d.secciones[0]!.html).not.toContain('doc-codigo');
  });
});

describe('documentos de ejemplo y su recorrido', () => {
  const raiz = process.cwd();
  const leer = (f: string) => readFileSync(join(raiz, f), 'utf8');

  /** Lee los pasos del frontmatter sin depender de un parser de YAML. */
  function pasos(archivo: string): string[] {
    const fm = leer(`src/content/diapositivas/${archivo}`).split('---')[1]!;
    return [...fm.matchAll(/^\s+- titulo: "(.+)"$/gm)].map((m) => m[1]!);
  }

  it.each([
    ['5-9.md', 'ejemplos/AGENTS.md', 13],
    ['6-3.md', 'ejemplos/roadmap.md', 12],
  ])('%s recorre los "##" reales de %s', (diapo, doc, cantidad) => {
    const titulos = pasos(diapo);
    expect(titulos).toHaveLength(cantidad);
    const etiquetas = [...leer(`src/content/diapositivas/${diapo}`).matchAll(/etiqueta: "(.+)"$/gm)].length;
    expect(etiquetas).toBe(cantidad);
    const d = renderizarDocumento(leer(doc), titulos.map((titulo) => ({ titulo, etiqueta: '' })));
    expect(d.secciones.filter((s) => s.paso !== null)).toHaveLength(cantidad);
  });
});
