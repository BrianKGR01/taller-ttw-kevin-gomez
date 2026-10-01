/** Las seis fases del ciclo. El color de cada una vive en los tokens --fase-1 … --fase-6. */
export const FASES = [
  { n: 1, nombre: 'Spec funcional', corto: 'Funcional' },
  { n: 2, nombre: 'Spec técnica', corto: 'Técnica' },
  { n: 3, nombre: 'Reglas del juego', corto: 'Reglas' },
  { n: 4, nombre: 'Roadmap por hitos', corto: 'Roadmap' },
  { n: 5, nombre: 'Ejecución', corto: 'Ejecución' },
  { n: 6, nombre: 'Dónde vive', corto: 'Dónde vive' },
] as const;

export function nombreFase(n: number): string {
  return FASES.find((f) => f.n === n)?.nombre ?? '';
}
