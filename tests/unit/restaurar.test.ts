import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { resolverModo } from '../../src/lib/modo';

/**
 * El script en línea del <head> restaura tema y modo ANTES del primer pintado
 * (sin él hay parpadeo). Aquí se ejecuta tal cual y se comprueba que decide lo
 * mismo que src/lib/tema.ts y src/lib/modo.ts.
 */
const fuente = readFileSync(join(process.cwd(), 'src/lib/restaurar.inline.js'), 'utf8');

function ejecutar(opts: { tema?: string; modo?: string; busqueda?: string; ancho?: number }) {
  const html = document.documentElement;
  delete html.dataset.modo;
  delete html.dataset.uso;
  delete html.dataset.temaEstado;
  delete html.dataset.embebido;
  localStorage.clear();
  if (opts.tema) localStorage.setItem('gdg-taller-tema', opts.tema);
  if (opts.modo) localStorage.setItem('gdg-taller-modo', opts.modo);
  const loc = { search: opts.busqueda ?? '' };
  const fn = new Function('location', 'innerWidth', fuente);
  fn(loc, opts.ancho ?? 1366);
  return { modo: html.dataset.modo, uso: html.dataset.uso, estado: html.dataset.temaEstado, embebido: html.dataset.embebido };
}

describe('restauración antes del primer pintado', () => {
  beforeEach(() => localStorage.clear());

  it('sin nada guardado sigue al sistema (no fija data-modo)', () => {
    const r = ejecutar({});
    expect(r.modo).toBeUndefined();
    expect(r.estado).toBe('sistema');
  });

  it('restaura claro y oscuro', () => {
    expect(ejecutar({ tema: 'claro' })).toMatchObject({ modo: 'claro', estado: 'claro' });
    expect(ejecutar({ tema: 'oscuro' })).toMatchObject({ modo: 'oscuro', estado: 'oscuro' });
  });

  it('ignora un tema guardado inválido', () => {
    expect(ejecutar({ tema: 'sepia' })).toMatchObject({ modo: undefined, estado: 'sistema' });
  });

  it('decide el modo de uso igual que resolverModo', () => {
    const casos = [
      { busqueda: '', modo: undefined, ancho: 1366 },
      { busqueda: '', modo: undefined, ancho: 360 },
      { busqueda: '', modo: 'presentacion', ancho: 360 },
      { busqueda: '', modo: 'lectura', ancho: 1366 },
      { busqueda: '?modo=lectura', modo: 'presentacion', ancho: 1366 },
      { busqueda: '?modo=presentacion', modo: 'lectura', ancho: 360 },
      { busqueda: '?modo=cine', modo: undefined, ancho: 360 },
      { busqueda: '?modo=cine', modo: undefined, ancho: 1366 },
      { busqueda: '', modo: undefined, ancho: 820 },
      { busqueda: '', modo: undefined, ancho: 821 },
    ];
    for (const c of casos) {
      const param = new URLSearchParams(c.busqueda).get('modo');
      const esperado = resolverModo({ param, guardado: c.modo ?? null, ancho: c.ancho });
      expect(ejecutar(c).uso, JSON.stringify(c)).toBe(esperado);
    }
  });

  it('marca las ventanas incrustadas (miniaturas del presentador)', () => {
    expect(ejecutar({ busqueda: '?embebido' }).embebido).toBe('');
    expect(ejecutar({}).embebido).toBeUndefined();
  });
});
