# ADR-006 — Tema de tres estados con restauración previa al primer pintado

**Estado:** aceptada
**Fecha:** 2026-10-01
**Fase del roadmap:** 1

---

## Contexto

El sistema de diseño (§3) pide un control de tres estados —sistema · claro · oscuro— y un script en línea que restaure la elección antes del primer pintado. La sala puede tener cualquier luz, y la tecla `T` tiene que alternar en vivo, con transición animada.

## Opciones consideradas

**A — Interruptor de dos estados (claro/oscuro).** Se pierde "seguir al sistema" en cuanto alguien lo toca.

**B — Tres estados, guardados en `localStorage`, aplicados como `data-modo` en `<html>`.** `sistema` quita el atributo y deja que `light-dark()` y `prefers-color-scheme` decidan.

**C — Cambio instantáneo sin transición.** Es lo más simple, pero en una sala el cambio se siente brusco.

## Decisión

**Opción B**, con dos mecanismos de transición según soporte: **View Transitions** (el tema nuevo se revela en círculo desde el botón o desde arriba al usar la tecla `T`) y, si no hay soporte o hay `prefers-reduced-motion`, un fundido corto de color por clase `cambiando-tema`.

- El script de restauración (`src/lib/restaurar.inline.js`) es JavaScript plano en línea en el `<head>`. Un test unitario lo ejecuta y comprueba que decide lo mismo que `tema.ts` y `modo.ts`.
- `T` cicla sistema → claro → oscuro → sistema. Con el sistema en oscuro, el paso a "sistema" no cambia nada visible: es el costo de conservar los tres estados en una sola tecla.
- Si el almacenamiento está bloqueado (navegación privada), el tema sigue valiendo en memoria durante la sesión.

## Consecuencias

**A favor.** Sin parpadeo; cumple el contrato del sistema de diseño; los gráficos del canvas releen los colores por token al cambiar.

**En contra.** Duplicación mínima y vigilada por test entre el script en línea y los módulos TypeScript.

## Cómo se revierte

Una hora: el estado vive en un atributo y una clave.
