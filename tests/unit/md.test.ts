import { describe, expect, it } from 'vitest';
import { htmlBloqueCodigo, renderizarMd, separarLectura } from '../../src/lib/md';

describe('renderizado de Markdown de las diapositivas', () => {
  it('marca como pasos solo los elementos de primer nivel de las listas', () => {
    const r = renderizarMd('- uno\n  - sub\n- dos\n- tres', { pasosEnListas: true });
    expect(r.pasos).toBe(3);
    expect(r.html).toContain('data-paso="1"');
    expect(r.html).toContain('data-paso="3"');
    expect(r.html).not.toContain('data-paso="4"');
  });

  it('no marca pasos si no se pide', () => {
    const r = renderizarMd('- uno\n- dos');
    expect(r.pasos).toBe(0);
    expect(r.html).not.toContain('data-paso');
  });

  it('los bloques de código llevan botón Copiar y el texto completo', () => {
    const r = renderizarMd('```prompt titulo="La entrevista"\nNo escribas código.\n```');
    expect(r.html).toContain('data-copiar');
    expect(r.html).toContain('La entrevista');
    expect(r.html).toContain('data-texto="No escribas código."');
  });

  it('escapa HTML dentro del código', () => {
    expect(htmlBloqueCodigo('<script>alert(1)</script>')).not.toContain('<script>');
  });

  it('los enlaces externos abren en pestaña nueva sin referrer', () => {
    const r = renderizarMd('[sitio](https://ejemplo.com)');
    expect(r.html).toContain('target="_blank"');
    expect(r.html).toContain('rel="noopener noreferrer"');
  });

  it('separa lo que va en la diapositiva de lo que solo va en lectura', () => {
    const { pres, lectura } = separarLectura('Visible\n\n<!-- lectura -->\n\nSolo lectura');
    expect(pres).toBe('Visible');
    expect(lectura).toBe('Solo lectura');
    expect(separarLectura('Solo esto').lectura).toBe('');
  });
});
