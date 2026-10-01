import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const RAIZ = process.cwd();
const dirDiapos = join(RAIZ, 'src/content/diapositivas');
const dirBloques = join(RAIZ, 'src/content/bloques');

function frontmatter(texto: string): Record<string, string> {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(texto.replace(/\r\n/g, '\n'));
  if (!m) throw new Error('sin frontmatter');
  const out: Record<string, string> = {};
  for (const linea of m[1]!.split('\n')) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(linea);
    if (kv) out[kv[1]!] = kv[2]!.replace(/^"|"$/g, '');
  }
  out.__cuerpo = m[2] ?? '';
  return out;
}

type Ficha = Record<string, string> & { archivo: string };
const leer = (dir: string): Ficha[] =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ ...frontmatter(readFileSync(join(dir, f), 'utf8')), archivo: f }) as Ficha);
const diapos = leer(dirDiapos);
const bloques = leer(dirBloques);

const TIPOS = ['portada', 'perfil', 'cita', 'prompt', 'lista', 'pasos', 'tabla', 'remate', 'libros', 'cita-x', 'documento', 'ciclo', 'hitos', 'carpetas', 'ci', 'ejecucion', 'tarjetas', 'cierre', 'texto'];

describe('contenido de las diapositivas', () => {
  it('cada diapositiva tiene bloque, número y un tipo conocido', () => {
    for (const d of diapos) {
      expect(Number.isInteger(Number(d.bloque)), d.archivo).toBe(true);
      expect(Number(d.n), d.archivo).toBeGreaterThanOrEqual(1);
      expect(TIPOS, `${d.archivo}: tipo ${d.tipo}`).toContain(d.tipo);
    }
  });

  it('no hay dos diapositivas con el mismo número dentro de un bloque (las URLs son únicas)', () => {
    const vistos = new Map<string, string>();
    for (const d of diapos) {
      const id = `${d.bloque}.${d.n}`;
      expect(vistos.has(id), `${id} repetida en ${d.archivo} y ${vistos.get(id)}`).toBe(false);
      vistos.set(id, d.archivo);
    }
  });

  it('toda diapositiva pertenece a un bloque que existe', () => {
    const numeros = new Set(bloques.map((b) => b.numero));
    for (const d of diapos) expect(numeros.has(d.bloque), `${d.archivo}: bloque ${d.bloque}`).toBe(true);
  });

  it('los bloques 3 a 8 son las seis fases, en orden, con apertura', () => {
    for (const n of [3, 4, 5, 6, 7, 8]) {
      const b = bloques.find((x) => x.numero === String(n))!;
      expect(b.fase).toBe(String(n - 2));
      expect(b.apertura).toBe('true');
    }
  });

  it('los tiempos suman 60 y 30 minutos (tabla "Tiempos" del taller)', () => {
    const suma = (k: 'tiempo60' | 'tiempo30') => bloques.reduce((s, b) => s + Number(b[k]), 0);
    expect(suma('tiempo60')).toBe(60);
    expect(suma('tiempo30')).toBe(30);
  });
});

describe('plantilla AGENTS.md descargable', () => {
  it('lo que se ve en las diapositivas es exactamente lo que se descarga', () => {
    const archivos = diapos.filter((d) => d.archivo.startsWith('5-plantilla-')).sort((a, b) => a.archivo.localeCompare(b.archivo));
    expect(archivos).toHaveLength(3);
    const partes = archivos.map((d) => {
      const m = /```markdown[^\n]*\n([\s\S]*?)\n```/.exec(d.__cuerpo ?? '');
      return m![1]!;
    });
    const descarga = readFileSync(join(RAIZ, 'contenido-descargas/AGENTS.md'), 'utf8').trim();
    expect(partes.join('\n\n')).toBe(descarga);
  });
});

describe('documentos de ejemplo anonimizados', () => {
  // Nombres y rastros del proyecto original que no pueden aparecer en lo que se publica.
  const PROHIBIDOS = [/ceom/i, /drizzle/i, /supabase/i, /traefik/i, /backblaze/i, /\btenant/i, /institu/i, /nicho/i, /riertv/i, /devbro/i, /gateway de consentimiento/i, /\bANCLA\b/, /gru1/i, /\bH-\d+/, /vercel/i, /https?:\/\//i];
  for (const archivo of ['ejemplos/AGENTS.md', 'ejemplos/roadmap.md', 'public/descargas/ejemplo-AGENTS-hotel.md', 'public/descargas/ejemplo-roadmap-hotel.md']) {
    it(`${archivo} no contiene rastros del proyecto original`, () => {
      let texto: string;
      try {
        texto = readFileSync(join(RAIZ, archivo), 'utf8');
      } catch {
        return; // public/descargas se genera en el build
      }
      for (const re of PROHIBIDOS) expect(texto, `${archivo} coincide con ${re}`).not.toMatch(re);
    });
  }

  it('trata del sistema de gestión del hotel', () => {
    for (const archivo of ['ejemplos/AGENTS.md', 'ejemplos/roadmap.md']) {
      const texto = readFileSync(join(RAIZ, archivo), 'utf8');
      expect(texto).toMatch(/hotel/i);
      expect(texto).toMatch(/reserva/i);
    }
  });
});
