import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { datosDeEnlace, dominioDe, nombreLegible, type EntradaEnlace } from '../../src/lib/enlaces';

const lista = JSON.parse(readFileSync(join(process.cwd(), 'src', 'data', 'enlaces.json'), 'utf8')) as EntradaEnlace[];

describe('datosDeEnlace', () => {
  it('resuelve los tres sitios del taller con título, descripción e imagen local', () => {
    for (const url of ['https://www.drinksonchain.com', 'https://bodegas.drinksonchain.com', 'https://www.devbro.xyz']) {
      const d = datosDeEnlace(url, lista);
      expect(d.completo, url).toBe(true);
      expect(d.titulo).toBeTruthy();
      expect(d.descripcion).toBeTruthy();
      expect(d.imagen).toMatch(/^assets\/enlaces\/[\w-]+\.webp$/);
      expect(d.url).toBe(url);
    }
  });

  it('encuentra la entrada aunque la URL lleve barra final o mayúsculas en el host', () => {
    expect(datosDeEnlace('https://WWW.devbro.xyz/', lista).completo).toBe(true);
  });

  it('respaldo: URL sin entrada da nombre y dominio, sin imagen', () => {
    const d = datosDeEnlace('https://www.ejemplo.dev', lista);
    expect(d).toMatchObject({ completo: false, dominio: 'ejemplo.dev', sitio: 'Ejemplo', titulo: 'Ejemplo', descripcion: '', imagen: null });
  });

  it('respaldo: ok:false ignora título e imagen guardados', () => {
    const d = datosDeEnlace('https://x.test', [{ url: 'https://x.test', titulo: 'T', descripcion: 'D', imagen: 'assets/enlaces/x.webp', sitio: 'Sitio X', ok: false }]);
    expect(d).toMatchObject({ completo: false, titulo: 'Sitio X', descripcion: '', imagen: null });
  });

  it('rechaza esquemas que no son http(s)', () => {
    expect(() => datosDeEnlace('javascript:alert(1)', lista)).toThrow();
    expect(() => dominioDe('ftp://x.test')).toThrow();
  });

  it('nombreLegible', () => {
    expect(nombreLegible('https://www.devbro.xyz')).toBe('Devbro');
    expect(nombreLegible('https://bodegas.drinksonchain.com')).toBe('Bodegas.drinksonchain');
  });
});
