import { beforeEach, describe, expect, it } from 'vitest';
import {
  CLAVE_TEMA,
  aplicarTema,
  esEstadoTema,
  guardarTema,
  leerTema,
  siguienteTema,
  temaEfectivo,
} from '../../src/lib/tema';
import { ANCHO_MAX_LECTURA, alternarModo, resolverModo } from '../../src/lib/modo';

class AlmacenFalso {
  datos = new Map<string, string>();
  getItem(k: string) {
    return this.datos.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.datos.set(k, v);
  }
}

describe('tema: tres estados', () => {
  it('cicla sistema → claro → oscuro → sistema', () => {
    expect(siguienteTema('sistema')).toBe('claro');
    expect(siguienteTema('claro')).toBe('oscuro');
    expect(siguienteTema('oscuro')).toBe('sistema');
  });

  it('valida los estados', () => {
    expect(esEstadoTema('claro')).toBe(true);
    expect(esEstadoTema('sepia')).toBe(false);
    expect(esEstadoTema(null)).toBe(false);
  });

  it('guarda y recupera la elección', () => {
    const a = new AlmacenFalso();
    expect(leerTema(a)).toBe('sistema');
    guardarTema(a, 'oscuro');
    expect(a.datos.get(CLAVE_TEMA)).toBe('oscuro');
    expect(leerTema(a)).toBe('oscuro');
  });

  it('ignora un valor guardado inválido', () => {
    const a = new AlmacenFalso();
    a.setItem(CLAVE_TEMA, 'neon');
    expect(leerTema(a)).toBe('sistema');
  });

  it('no falla si el almacenamiento está bloqueado o no existe', () => {
    const bloqueado = {
      getItem() {
        throw new Error('SecurityError');
      },
      setItem() {
        throw new Error('SecurityError');
      },
    };
    expect(leerTema(bloqueado)).toBe('sistema');
    expect(() => guardarTema(bloqueado, 'claro')).not.toThrow();
    expect(leerTema(null)).toBe('sistema');
  });

  it('calcula el tema efectivo', () => {
    expect(temaEfectivo('sistema', true)).toBe('oscuro');
    expect(temaEfectivo('sistema', false)).toBe('claro');
    expect(temaEfectivo('claro', true)).toBe('claro');
    expect(temaEfectivo('oscuro', false)).toBe('oscuro');
  });
});

describe('tema: aplicación al documento', () => {
  let raiz: HTMLElement;
  beforeEach(() => {
    raiz = document.createElement('html');
  });

  it('claro y oscuro fijan data-modo; sistema lo quita', () => {
    aplicarTema(raiz, 'claro');
    expect(raiz.dataset.modo).toBe('claro');
    expect(raiz.dataset.temaEstado).toBe('claro');
    aplicarTema(raiz, 'oscuro');
    expect(raiz.dataset.modo).toBe('oscuro');
    aplicarTema(raiz, 'sistema');
    expect(raiz.dataset.modo).toBeUndefined();
    expect(raiz.dataset.temaEstado).toBe('sistema');
  });
});

describe('modo de uso: presentación o lectura', () => {
  const ancho = { grande: 1366, chico: 360 };

  it('en pantallas chicas el modo por defecto es lectura', () => {
    expect(resolverModo({ param: null, guardado: null, ancho: ancho.chico })).toBe('lectura');
    expect(resolverModo({ param: null, guardado: null, ancho: ANCHO_MAX_LECTURA })).toBe('lectura');
  });

  it('en pantallas grandes el modo por defecto es presentación', () => {
    expect(resolverModo({ param: null, guardado: null, ancho: ancho.grande })).toBe('presentacion');
    expect(resolverModo({ param: null, guardado: null, ancho: ANCHO_MAX_LECTURA + 1 })).toBe('presentacion');
  });

  it('el parámetro de URL manda sobre todo', () => {
    expect(resolverModo({ param: 'presentacion', guardado: 'lectura', ancho: ancho.chico })).toBe('presentacion');
    expect(resolverModo({ param: 'lectura', guardado: 'presentacion', ancho: ancho.grande })).toBe('lectura');
  });

  it('la elección guardada manda sobre el tamaño de pantalla', () => {
    expect(resolverModo({ param: null, guardado: 'presentacion', ancho: ancho.chico })).toBe('presentacion');
    expect(resolverModo({ param: null, guardado: 'lectura', ancho: ancho.grande })).toBe('lectura');
  });

  it('ignora valores inválidos', () => {
    expect(resolverModo({ param: 'cine', guardado: 'otro', ancho: ancho.grande })).toBe('presentacion');
  });

  it('alterna', () => {
    expect(alternarModo('presentacion')).toBe('lectura');
    expect(alternarModo('lectura')).toBe('presentacion');
  });
});
