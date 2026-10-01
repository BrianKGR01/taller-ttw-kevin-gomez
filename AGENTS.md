# AGENTS.md — Presentación "IA aplicada al desarrollo de software"

Presentación web del taller de Kevin Brayan Gómez Rocha (Tarija Tech Week 2026, GDG Santa Cruz). Se proyecta en sala y se comparte por QR para leer en celular. Sitio estático.

## Fuentes de verdad (en este orden)

1. `design-system/` — sistema de diseño obligatorio. Manda sobre cualquier otra indicación visual.
2. `instrucciones-claude-code.md` — qué construir y cómo.
3. `taller-ia-desarrollo-software.md` — todo el contenido de las diapositivas. **No inventes contenido nuevo.**
4. `assets/` — recursos del expositor (retrato, logos, fuentes, videos, `contacto.md`).

Las decisiones técnicas y de diseño se registran como ADR en `design-system/decisiones/` con `ADR-000-plantilla.md`. Una ADR aceptada no se edita: se escribe otra que la reemplaza.

## Stack y versiones

- Astro (sitio estático) + TypeScript + Tailwind CSS v4 (solo como puente de tokens) · pnpm · Node ≥ 22.12.
- Tests: Vitest (unitarios) y Playwright (E2E, escritorio y celular emulados).
- Última versión estable de cada dependencia, verificada en la documentación oficial antes de instalar. Versiones fijadas en `pnpm-lock.yaml`. Una dependencia nueva exige justificarla en una ADR.

## Comandos

- `pnpm dev` · `pnpm build` · `pnpm preview`
- `pnpm test` (unitarios) · `pnpm test:e2e` (E2E) · `pnpm typecheck`
- `pnpm datos:og` (metadatos de enlaces) (el QR se genera en el build a partir de `site`)

## Reglas del sistema de diseño

- Tres capas de tokens: primitivos → semánticos → componente. **Un componente solo lee la capa 2** (`var(--superficie)`, `var(--fase-actual)`…).
- Valores literales de color **solo** en `design-system/estilos/primitivos.css`; longitudes y tiempos estructurales **solo** en `layout.css`. `scripts/verificar-tokens.mjs` lo comprueba y hace fallar el build.
- Color por fase: `--fase-1` … `--fase-6`, constante en todo el taller. Se activa con `data-fase="N"`.
- Gradientes solo en bordes, titulares y atmósfera de fondo. En modo claro no hay degradados de relleno.
- `Accion` es lo único con forma de píldora. Una tarjeta con flecha es un enlace.
- Un momento fuerte de movimiento por diapositiva. `prefers-reduced-motion` desactiva todo movimiento decorativo.
- Texto grande para proyección. **Si algo no entra, se divide la diapositiva; nunca se achica la letra.**
- Logos: solo los SVG oficiales de `assets/`. No se dibujan ni recrean logos de Google, GDG ni de terceros.

## Contenido

- Las diapositivas viven en `src/content/diapositivas/` (Markdown con frontmatter) y los bloques en `src/content/bloques/`. Los componentes no contienen texto del taller.
- Corregir un texto = editar un `.md`. Lo que va después de `<!-- lectura -->` solo aparece en modo lectura.
- Las secciones "Tiempos", "Nota del expositor" y "Si vas corto de tiempo" no van en la diapositiva: van a la vista de presentador.
- Los documentos de ejemplo (`ejemplos/AGENTS.md`, `ejemplos/roadmap.md`) están **anonimizados**. Los originales (`assets/ejemplo-*.md`) están en `.gitignore` y no se publican. Si se vuelven a tocar, repetir la búsqueda de nombres del proyecto original.

## Tests

- Todo módulo de `src/lib/` lleva su test unitario en `tests/unit/`.
- Todo flujo terminado lleva su E2E en `tests/e2e/`: recorrido por teclado, cambio de tema, cambio de modo y botón copiar, en escritorio y celular.
- **Nunca modifiques ni borres un test existente sin aprobación explícita.** Un test en rojo se arregla en el código.
- Cada defecto encontrado mirando la pantalla cierra con la verificación que lo habría atrapado.

## Git

- Commits convencionales (`feat:`, `fix:`, `test:`, `docs:`, `chore:`). Rama principal `main`; un push a `main` despliega.
- Sin secretos en el repositorio. Los `.ttf` originales de las fuentes no entran.

## Definición de terminado (por hito)

1. `pnpm test` y `pnpm test:e2e` en verde, `pnpm typecheck` limpio, `pnpm build` sin errores.
2. Revisado a ojo en claro y oscuro, en 1366×768 y en 360 px, en modo presentación y modo lectura.
3. Desplegado en Vercel y verificada la URL de producción.
4. ADR escrita por cada decisión técnica o de diseño nueva.
