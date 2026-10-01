# IA aplicada al desarrollo de software — presentación del taller

Presentación web del taller *«El proceso de desarrollo en la era agéntica»* de Kevin Brayan Gómez Rocha, en **Tarija Tech Week 2026**, en representación de **Google Developer Group Santa Cruz**.

Se usa de dos maneras: **proyectada** en la sala (modo presentación) y **compartida por QR** para leer en el celular, copiar prompts y plantillas y contactar al expositor (modo lectura).

## Usarla

| Tecla | Acción |
|---|---|
| `←` `→` | entre bloques |
| `↑` `↓` | entre diapositivas del bloque (y pasos de revelado) |
| `Espacio` · `Re Pág` · `Av Pág` | avanzar o retroceder paso a paso (compatible con clickers) |
| `Inicio` · `Fin` | primera o última diapositiva |
| `Esc` · `O` | vista general |
| `T` | tema: sistema · claro · oscuro |
| `L` | modo presentación · modo lectura |
| `F` | pantalla completa |
| `S` | vista de presentador (notas, siguiente, tiempos y cronómetro) |
| `?` | ayuda de atajos |

- Una diapositiva puntual se comparte con su URL: `#/5/3` es la diapositiva 5.3.
- `?modo=presentacion` y `?modo=lectura` fuerzan el modo (en pantallas de 820 px o menos el predeterminado es lectura).

## Desarrollar

Requisitos: Node ≥ 22.12 y pnpm.

```bash
pnpm install
pnpm dev            # http://localhost:4321
pnpm test           # unitarios (Vitest)
pnpm test:e2e       # E2E (Playwright, escritorio y celular emulados)
pnpm typecheck
pnpm build          # verifica la regla de tokens y deja el sitio estático en dist/
```

## Editar el contenido

Todo el texto vive en Markdown, separado de los componentes:

- `src/content/diapositivas/*.md` — una diapositiva por archivo (frontmatter: `bloque`, `n`, `tipo`, `titulo`…). Lo que va después de `<!-- lectura -->` solo aparece en modo lectura.
- `src/content/bloques/*.md` — los 12 bloques: tiempos y **nota del expositor** (cuerpo del archivo).
- `ejemplos/` — el `AGENTS.md` y el roadmap del caso del hotel (anonimizados) que se muestran en las diapositivas 5.x y 6.x.
- `contenido-descargas/` — la plantilla `AGENTS.md` y la estructura de carpetas que se descargan.

## Reglas del proyecto

Léelas en [`AGENTS.md`](AGENTS.md). El sistema de diseño de GDG Santa Cruz está en [`design-system/`](design-system/) y manda sobre cualquier otra decisión visual; las decisiones técnicas están registradas como ADR en [`design-system/decisiones/`](design-system/decisiones/).

## Créditos

- Google Sans y Google Sans Mono: ver [`assets/fuentes/LICENCIA.md`](assets/fuentes/LICENCIA.md) y la ADR-002.
- Logos e isotipo de GDG: archivos oficiales del capítulo en `assets/`. No se redibujan.
- Portadas de libros y captura de la cita: ver [`recursos-origen/README.md`](recursos-origen/README.md).
