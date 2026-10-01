import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Bloques del taller (0 a 11). El cuerpo del archivo es la nota del expositor
 * para la vista de presentador. Ver ADR-010.
 */
const bloques = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/bloques' }),
  schema: z.object({
    numero: z.number().int().min(0).max(11),
    titulo: z.string(),
    /** Nombre corto para chips y vista general. */
    corto: z.string(),
    /** 1 a 6 = fase del ciclo; 0 = bloque sin fase. */
    fase: z.number().int().min(0).max(6),
    tiempo60: z.number(),
    tiempo30: z.number(),
    /** Si es true, el bloque abre con una diapositiva de apertura de fase (n = 0). */
    apertura: z.boolean().default(false),
  }),
});

const TIPOS = [
  'portada',
  'perfil',
  'cita',
  'prompt',
  'lista',
  'pasos',
  'tabla',
  'remate',
  'libros',
  'cita-x',
  'documento',
  'ciclo',
  'hitos',
  'carpetas',
  'ci',
  'ejecucion',
  'tarjetas',
  'cierre',
  'texto',
] as const;

/**
 * Una diapositiva. El cuerpo es Markdown; lo que va después de
 * `<!-- lectura -->` solo se muestra en modo lectura.
 */
const diapositivas = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/diapositivas' }),
  schema: z.object({
    bloque: z.number().int().min(0).max(11),
    /** Número dentro del bloque (la "2" de 3.2). Único por bloque. */
    n: z.number().int().min(1),
    tipo: z.enum(TIPOS),
    titulo: z.string().optional(),
    subtitulo: z.string().optional(),
    /** Etiqueta pequeña sobre el título. */
    etiqueta: z.string().optional(),
    /** Revela las listas del cuerpo de a un elemento por avance. */
    pasos: z.boolean().default(false),
    /** Nota "Si no eres dev". */
    sinDev: z.string().optional(),
    /** Notas específicas de esta diapositiva para el presentador. */
    notas: z.string().optional(),
    /** Datos propios de cada tipo. */
    datos: z.record(z.string(), z.any()).optional(),
  }),
});

export const collections = { bloques, diapositivas };
