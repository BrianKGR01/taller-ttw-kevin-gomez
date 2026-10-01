# AGENTS.md — Sistema de gestión del hotel

## Contexto y fuentes de verdad
Sistema web para operar uno o varios hoteles: huéspedes, habitaciones, reservas,
check-in/check-out, pagos y reportes. Un núcleo común y agnóstico al canal de venta, más
integraciones conmutables (una activa por hotel). Estas son las fuentes de verdad, en este orden:

1. Spec funcional: `docs/01-spec-funcional.md` — qué hace cada módulo y sus reglas de negocio.
2. Design system: `docs/02-design-system.md` — tokens y componentes permitidos.
3. Spec técnica: `docs/03-spec-tecnica.md` — arquitectura, patrones y matriz de dependencias.
4. Decisiones (ADR): `docs/decisiones/` — el porqué de cada elección técnica.
5. Roadmap: `docs/roadmap.md` y avance en `docs/progreso.md`.

**Lee el módulo y la spec técnica antes de tocar código por primera vez. No reconstruyas el
diseño por inferencia: si falta información, pregunta.** Si el código y la spec se contradicen,
gana la spec; avisa de la discrepancia en vez de elegir en silencio.

## Stack y versiones
- Next.js (App Router) + TypeScript en modo estricto, Server Actions / Route Handlers.
- Base de datos: PostgreSQL. Capa de acceso a datos única y tipada (ver `docs/decisiones/`).
  Nunca queries de negocio fuera de esa capa.
- Gestor de paquetes: **pnpm** — nunca `npm` ni `yarn`.
- Testing: **Vitest** + Testing Library (unitarios/integración), **Playwright** (E2E).
- CI: GitHub Actions. Contenedores en producción detrás de un proxy inverso.
- Usa siempre la última versión estable o LTS. Verifica en la documentación oficial antes de
  instalar o actualizar; no asumas versiones de memoria.
- Fija versiones con lockfile (`pnpm-lock.yaml`) y runtime con `.nvmrc`. Nunca borres el lockfile.
- **No añadas dependencias sin un ADR** en `docs/decisiones/` que justifique el cambio.
- No cambies el stack sin decirlo explícitamente y sin aprobación.

## Comandos
- Instalar: `pnpm install`
- Dev: `pnpm dev`
- Tests unitarios: `pnpm test` — deben pasar antes de dar una tarea por terminada
- Tests E2E: `pnpm test:e2e`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Generar migración: `pnpm db:generate`
- Aplicar migración (local/dev): `pnpm db:migrate`
- Explorador de datos (debug visual): `pnpm db:studio`
- Verificación completa antes de commit: `pnpm lint && pnpm typecheck && pnpm test`

*(Si el repo aún no tiene alguno de estos scripts en `package.json`, créalo con este nombre —
no inventes otros.)*

## Reglas de arquitectura
No negociables. Justificación completa en `docs/03-spec-tecnica.md`.

1. **El núcleo nunca contiene lógica de un canal de venta o proveedor externo.** Esa lógica
   vive solo en `src/modules/integraciones/<canal>/`. Si tocas el núcleo (huéspedes,
   habitaciones, reservas, pagos) y la tarea pide algo específico de un canal, detente y
   pregunta: probablemente pertenece a una integración.
2. **Cada módulo es una caja negra.** Solo se comunica con otros a través de las funciones
   listadas como "salidas que expone" en su spec y en su `README.md` local. Nunca importes el
   repositorio ni las tablas de otro módulo; siempre su capa pública. Porqué: sin esto, un
   cambio de esquema rompe módulos ajenos.
3. **Pagos append-only.** Cobros, reembolsos y cargos nunca editan un saldo con `UPDATE`:
   insertan un movimiento nuevo y el saldo se deriva. Corregir un valor es un registro nuevo
   con motivo, nunca una edición directa. Porqué: auditoría y cuadre de caja reproducibles.
4. **Tarifa congelada en la reserva.** Toda reserva guarda `tarifa_noche_snapshot`,
   `impuestos_snapshot` y la política de cancelación vigente al reservar. No recalcules
   reservas pasadas cuando cambie la tarifa del catálogo.
5. **Soft delete siempre** (`eliminado_en`). Nunca `DELETE` físico salvo petición explícita.
6. **Multi-hotel por RLS + `hotel_id`.** Toda tabla de negocio lleva `hotel_id` y toda query lo
   filtra, reforzado con políticas RLS declaradas junto al esquema. Nunca confíes solo en el
   filtro de la aplicación.
7. **Sin doble reserva.** La disponibilidad se garantiza en la base de datos (restricción de
   exclusión sobre habitación + rango de fechas), no solo en código. Crear una reserva y
   asignar habitación ocurren en una transacción. Porqué: dos recepcionistas pueden reservar
   la misma habitación a la vez.
8. **Un único punto de autorización.** Ningún módulo implementa su propia lógica de "¿tengo
   permiso?": todos preguntan al servicio de permisos, que autoriza por acción expuesta y por
   rol (recepción, gerencia, contabilidad), no por módulo completo.
9. **Todo número de un reporte viaja con sus marcadores de completitud.** Si la gerencia ve
   un aviso que cambia cómo se lee una cifra (`habitacionesFueraDeServicio`, un hotel con
   datos incompletos, un módulo no activo), el reporte exportado y el panel lo muestran con la
   misma prominencia. Ninguna capa de presentación descarta un marcador ni re-proyecta a mano
   el resultado de una función del núcleo eligiendo campos. Marcar el hueco, nunca estimarlo.
10. **La capa de reportes no deriva indicadores** cuya validez dependa de la completitud de
    los datos. Ocupación, tarifa promedio y RevPAR vienen de la acción pública del módulo
    dueño de la regla (la que sabe cuándo devolver `null`), nunca se calculan a partir de los
    escalares que esa acción devolvió.
11. **Dentro de una transacción la base se toca solo por el `tx`.** Nada de consultas de
    permisos, ni llamadas a otro módulo, ni conexión cruda, ni otra transacción dentro del
    callback: cada una pide otra conexión del pool mientras la transacción retiene la suya, y
    con suficientes requests simultáneas todo se cuelga sin error. Permisos por id: resuélvelos
    **antes** de abrir la transacción. Llamadas a otros módulos: **después** del commit. Un
    listado no pide una ficha por fila: agrega en una consulta. Lo hace cumplir
    `src/db/sin-acceso-directo-en-transaccion.test.ts` — no se exceptúa, se reordena.
12. **Antes de escribir código en un módulo**, lee su spec y su `README.md` local si existe.

## Estándares de código
- Código limpio: funciones pequeñas, una responsabilidad, nombres descriptivos en español de
  dominio (`reserva`, `huesped`, `checkIn`), identificadores técnicos en inglés.
- TypeScript estricto: prohibido `any` y `@ts-ignore` sin comentario que justifique el caso.
- Valida con un esquema (p. ej. Zod) en cada frontera: formularios, Server Actions, APIs.
- Dinero siempre en enteros (centavos) y fechas en UTC; la zona horaria del hotel se aplica
  solo al mostrar. Nunca `number` decimal para montos.
- Errores explícitos: devuelve resultados tipados, no tragues excepciones ni uses `catch` vacío.
- Sin código muerto, sin `console.log` ni comentarios de depuración. Comenta el porqué, no el qué.
- Una carpeta por módulo en `src/modules/<módulo>/` con su capa pública, lógica y repositorio.

## Git y versionamiento
- Una rama por funcionalidad: `feat/<hito>-<tema>`, `fix/<tema>`, `docs/<tema>`.
  Nunca commits directos a `main`.
- Commits convencionales: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`.
  Descripción breve con el porqué; un cambio lógico por commit.
- Versionamiento semántico (`MAJOR.MINOR.PATCH`): el contrato público roto sube MAJOR, una
  funcionalidad nueva sube MINOR, una corrección sube PATCH. Mantén `CHANGELOG.md` al día.
- Todo cambio entra por pull request con descripción, hito y tests. No fuerces pushes
  (`--force`) ni reescribas historia publicada. No omitas hooks (`--no-verify`).
- No hagas commit ni push sin que te lo pidan.

## Tests
- Toda función nueva lleva su test unitario. Todo flujo terminado lleva su test E2E
  (p. ej. reservar, check-in, cobrar, check-out).
- Cubre los casos límite del dominio: reservas solapadas, cancelación tardía, cambio de
  tarifa tras reservar, pago parcial y reembolso, hotel sin habitaciones disponibles.
- Nada se da por terminado con tests en rojo.
- **Nunca modifiques ni borres un test existente sin aprobación explícita.** Si un test falla,
  corrige el código; si crees que el test está mal, detente y explica por qué. Los tests son
  el contrato y la spec lo escribe, no la IA.
- No uses `skip`, `only` ni cambies aserciones para "poner en verde".
- Los datos de prueba son ficticios y se crean con fábricas; nunca datos reales de huéspedes.

## Seguridad
- Ningún secreto en el código, en commits ni en logs. Usa variables de entorno y mantén
  `.env.example` sin valores reales. Nunca imprimas tokens ni datos personales.
- Valida toda entrada del usuario en servidor, aunque el cliente ya la valide.
- Mínimo privilegio en roles, permisos y credenciales de base de datos.
- Datos personales (documento de identidad, contacto, tarjeta) solo los mínimos, nunca en
  logs, nunca en URLs. Los datos de tarjeta no se almacenan: delega en el procesador de pagos.
- **Zonas de revisión humana obligatoria:** autenticación, pagos, permisos y datos
  personales. Prepara el cambio, explica el riesgo y espera aprobación; no lo fusiones solo.
- Corre el escaneo de dependencias y el análisis estático de seguridad antes de cerrar un hito.

## Design system
- Usa solo tokens (color, tipografía, espaciado, radios, sombras) y componentes de
  `docs/02-design-system.md`. Nunca valores de estilo sueltos: ni hex, ni `px` arbitrarios.
- Si falta un componente o token, propónlo y espera aprobación; no lo improvises en la página.
- Accesibilidad mínima: contraste suficiente, foco visible, etiquetas en formularios y
  navegación por teclado en los flujos de recepción.

## Flujo por hitos
- Trabaja **solo en el hito activo** de `docs/roadmap.md`. No adelantes trabajo de hitos
  futuros ni hagas refactors fuera del alcance.
- Cada hito es una rebanada vertical (interfaz, lógica, datos y tests) con criterio de
  terminado propio.
- Al empezar: lee el hito, la spec del módulo y `docs/progreso.md`.
- Al terminar: actualiza `docs/progreso.md` (qué se hizo, qué queda, decisiones, fecha) y
  resume los cambios, los contratos tocados y los riesgos pendientes.
- Ante una ambigüedad de la spec, pregunta antes de implementar.

## Qué NO hacer nunca
- No tocar migraciones ya aplicadas en `db/migrations/` — solo generar nuevas.
- No introducir una librería nueva sin ADR ni sin decirlo antes de instalarla.
- No modificar el contrato de un módulo (entradas/salidas documentadas) sin actualizar su
  `README.md` y avisarlo explícitamente en el resumen de la tarea.
- No escribir una política de RLS "para después": si la tabla maneja datos de un hotel, la
  política se escribe en el mismo cambio que crea la tabla.
- No editar un saldo ni un movimiento de pago existente: se compensa con otro registro.
- No modificar ni borrar tests existentes para que pasen.
- No dejar secretos, datos reales de huéspedes ni credenciales en el repositorio.
- No dar una tarea por terminada con tests en rojo, linter con errores o typecheck roto.

## Definición de terminado
- Criterios de aceptación del hito cumplidos, según la spec funcional.
- Tests en verde (`pnpm test`, y `pnpm test:e2e` si hay flujo completo), linter y typecheck limpios.
- `README.md` local del módulo actualizado (estado, dónde está cada cosa, última fecha).
- Si se tocó el contrato de un módulo, se revisó su impacto contra la matriz de dependencias
  en `docs/03-spec-tecnica.md`.
- Documentación y progreso actualizados en `docs/progreso.md`; ADR creado si hubo decisión nueva.
- Cambios revisados por una persona si tocan autenticación, pagos, permisos o datos personales.

## Mapa de documentación
| Necesitas                                                 | Vas a                              |
| --------------------------------------------------------- | ---------------------------------- |
| Qué hace un módulo, sus reglas de negocio                 | `docs/01-spec-funcional.md`        |
| Tokens y componentes visuales                             | `docs/02-design-system.md`         |
| Por qué está diseñado así, patrones, dependencias         | `docs/03-spec-tecnica.md`          |
| Por qué se eligió una tecnología o librería               | `docs/decisiones/`                 |
| Hito activo y orden de construcción                       | `docs/roadmap.md`                  |
| Qué se hizo y qué sigue                                   | `docs/progreso.md`                 |
| Estado y contrato resumido de un módulo en desarrollo     | `src/modules/<módulo>/README.md`   |
