# AGENTS.md

## Contexto
- Spec funcional: docs/01-spec-funcional.md
- Design system: docs/02-design-system.md
- Spec técnica: docs/03-spec-tecnica.md
- Decisiones: docs/decisiones/
- Roadmap: docs/roadmap.md (trabaja solo en el hito activo)

## Stack y versiones
- Usa siempre la última versión estable o LTS. Verifica en la documentación oficial antes de instalar.
- No agregues dependencias sin justificarlas en docs/decisiones/.

## Estándares
- Código limpio, funciones pequeñas, nombres descriptivos.
- Usa solo tokens y componentes del design system. Nunca valores de estilo sueltos.
- Commits convencionales (feat:, fix:, test:, docs:). Una rama por funcionalidad.

## Tests
- Toda función nueva lleva su test unitario. Todo flujo terminado lleva su test E2E.
- Nada se da por terminado con tests en rojo.
- Nunca modifiques ni borres un test existente sin aprobación explícita.

## Seguridad
- Ningún secreto en el código ni en los logs. Usa variables de entorno.
- Valida toda entrada del usuario. Mínimo privilegio en roles y permisos.
- Autenticación, pagos y datos personales requieren revisión humana.

## Definición de terminado
- Criterios de aceptación cumplidos, tests en verde, linter limpio,
  documentación y progreso actualizados en docs/progreso.md.
