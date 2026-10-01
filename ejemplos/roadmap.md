# Roadmap general — Sistema de gestión del hotel

> **Qué es este documento.** La **única fuente de verdad** del estado del proyecto: qué está hecho,
> qué falta, en qué orden, y qué decisiones están tomadas con su motivo. Está escrito para que
> alguien que no leyó ningún chat lo abra y sepa exactamente dónde estamos. Versión **v3**,
> actualizada el 2026-09-14.
>
> **Qué NO es.** No es la evidencia: cada afirmación se apoya en la
> [revisión previa a la apertura](../revision/README.md) (2026-09-01) y en las fichas de cada módulo
> (`docs/modulos/`); acá solo está el plan y las decisiones.
>
> **Historial de versiones.** v1 = plan inicial por capas técnicas (base de datos, después API,
> después pantallas): se abandonó porque nada se podía probar hasta el final. v2 = 2026-09-02,
> reorganizó el plan en **hitos verticales**. **v3 = ésta**: reconciliación documental (2026-09-14), que
> resolvió contradicciones entre planes, recuperó ítems que se caían entre uno y otro y fijó la
> nomenclatura del [Anexo A](#anexo-a--nomenclatura).
>
> **Convención de casillas:** `[ ]` pendiente · `[~]` parcial/en curso · `[x]` cerrado y verificado
> (con fecha) · `[–]` **diferido por decisión** (no es un olvido — el motivo y el disparador están
> en el [Anexo B](#anexo-b--decisiones-tomadas-con-su-disparador)).
>
> **Cómo se citan los ítems:** `R-3.4` = ítem 4 del Hito 3 de este roadmap. Nunca "Hito 3.4" a
> secas ni "Fase 3". Ver [Anexo A](#anexo-a--nomenclatura).

---

## La regla que ordena este roadmap

**Cada hito es una rebanada vertical:** pantalla + lógica + datos + tests, de punta a punta, en un
solo trozo que alguien puede abrir y usar. Nunca hay un hito "solo base de datos" ni "solo
pantallas": un hito que no se puede probar con las manos no está terminado.

**La secuencia es siempre la misma, y no se salta:**

1. Se termina el hito (todos los puntos de su *criterio de terminado*, con tests en verde).
2. Se **publica** a un entorno de prueba (vista previa del PR o entorno de pruebas).
3. **La persona que dirige lo prueba** en el navegador, como lo haría recepción.
4. Recién con su visto bueno se marca `[x]` y **se empieza el hito siguiente**.

**Los hitos son consecutivos por diseño.** Cada uno deja algo que los siguientes usan y ninguno
obliga a tocar lo que uno anterior cerró: quién entra (login), lo que se vende (habitaciones y
tarifas), la reserva que lo consume, la estancia real (check-in/out), el dinero (pagos), los
reportes que leen todo eso y, al final, el endurecimiento para operar.

> **La v2 violaba su propia regla en un punto, y la reconciliación v3 lo corrigió.** El total de la
> estancia estaba en el Hito 5 (pagos), pero el check-out del Hito 4 **no se puede cerrar sin saber
> cuánto se debe**: habría obligado a reabrir el Hito 4. El cálculo de cargos subió a **R-4.2** y el
> Hito 5 solo lo liquida, registrando pagos contra una cuenta que el check-out dejó *por cobrar*.

---

## Estado del proyecto — verificado el 2026-09-14

| # | Dato | Valor |
|---|---|---|
| 1 | Suite (`pnpm test`, base real) · typecheck · lint | ✅ **18 archivos / 142 tests**, ~40 s · ✅ limpio · ✅ 0 errores (4 warnings) |
| 2 | Hitos | **1 cerrado · 1 en curso (Hito 2) · 5 sin empezar** |
| 3 | Tests e2e de los 4 flujos de negocio | **1 de 4** (login); faltan reserva, check-in/out y cancelación |
| 4 | Hallazgos de la revisión previa | **6 corregidos · 3 parciales · 11 abiertos** — 1 solo 🔴: **HZ-07** (cierre de caja sin autor registrado) |
| 5 | Base de datos y entornos | **1 instancia** (desarrollo, 24 habitaciones de prueba); producción desde `main` **sin datos reales** |
| 6 | CI | Verde, pero solo en `pull_request`; el push directo a `main` no corre tests |
| 7 | Tarifas de temporada | **Sin definir** (todas las categorías con tarifa base) |
| 8 | Cobro con tarjeta en línea | **Fuera de v1** (ver DEC-03); los pagos se registran a mano |

**Lectura honesta:** el riesgo ya no es de construcción — es de operación. Para abrir con
recepción real (un hotel, 4-6 usuarios) faltan **~5-6 semanas de trabajo enfocado**.

### Tres restricciones del entorno que este roadmap ahora cuenta *(verificadas el 2026-09-14)*

1. **Una sola base de datos compartida** entre desarrollo, vistas previas y pruebas de recepción.
   → Ningún test destructivo corre contra ella (**R-1.4**); el entorno de pruebas real es **R-7.1**.
2. **Sin copias de seguridad automáticas** en el plan de base de datos actual. → **R-7.4** no es
   "confirmar la retención", es construir el respaldo.
3. **Las PC de recepción usan un navegador de más de tres años**, donde los estilos modernos pueden
   verse rotos. → Se verifica allí al cerrar cada hito con pantallas (**R-2.6**); objetivo en **R-7.3**.

### ⚠️ Tarifas duplicadas — 2026-09-12 (HZ-12)

Al tocar "Guardar" dos veces en el formulario de tarifas, el sistema creaba dos tarifas vigentes
para la misma categoría y el mismo rango de fechas (6 copias en 2 días de pruebas). Informe y
mecanismo en `docs/modulos/habitaciones/ficha.md`. Plan por tandas:

- [x] **Tanda A** *(2026-09-12)* — el botón se deshabilita mientras la petición está en vuelo; el
      servidor rechaza tarifas con rango invertido o precio ≤ 0. Sin migraciones.
- [ ] **Tanda B** — restricción de unicidad en la base (categoría + rango sin solapamiento):
      **requiere migración**, revisada antes de aplicar. Va dentro de **R-2.4**.
- [ ] **Tanda C** — verificar el formulario en el navegador antiguo de recepción (restricción 3).
- [ ] Las 6 tarifas duplicadas se **desactivan** con la lista validada por la dirección (nunca se borran).
> **Por qué importa más allá de las tarifas:** es el patrón de una **doble reserva**. La lección (la
> protección vive en la base de datos, no solo en la pantalla) se aplica de origen en el Hito 3.

---

## Hito 1 — Registro y login de recepcionistas ✅ CERRADO

*Por qué primero: todo lo demás necesita saber quién hace cada cosa (quién reservó, quién hizo el
check-in, quién cobró). Sin identidad no hay auditoría.*

**Rebanada:** pantalla de login y de alta de usuario · sesión y roles en el servidor · tabla de
usuarios y roles · tests de acceso.

- [x] **R-1.1** *(2026-08-21)* Alta de recepcionistas por el administrador, con invitación por
      correo (la persona define su contraseña). Login y logout con sesión en cookie segura.
- [x] **R-1.2** *(2026-08-24)* Dos roles: **Administrador** (todo) y **Recepción** (huéspedes,
      reservas, check-in/out, cobros; sin tarifas ni reportes). Se aplican en el servidor, no solo
      ocultando el menú.
- [x] **R-1.3** *(2026-08-25)* Límite de intentos de login (5 por 15 minutos por correo) y mensaje
      que no revela si el correo existe.
- [x] **R-1.4** *(2026-08-26)* Regla del repositorio: **ningún test destructivo corre contra la base
      compartida**; los de integración usan un esquema aislado que se crea y se destruye.

**Criterio de terminado:** ✅ cumplido el 2026-08-27 — una recepcionista invitada entra y sale; un
usuario de Recepción que abre a mano la URL de tarifas recibe 403; tests de login, roles y límite
de intentos en verde; la dirección dio el visto bueno.

## Hito 2 — Alta de habitaciones y tarifas 🔄 EN CURSO

*Por qué acá: las reservas (Hito 3) no tienen nada que reservar sin habitaciones, y no pueden
calcular el precio sin tarifas. Es el catálogo del hotel.*

**Rebanada:** listado y formularios de categorías, habitaciones y tarifas · reglas de precio por
fecha · tablas con sus restricciones · tests de las reglas.

- [x] **R-2.1** *(2026-09-03)* Categorías (Sencilla, Doble, Suite) con capacidad máxima de huéspedes.
- [x] **R-2.2** *(2026-09-07)* Alta, edición y baja lógica de habitaciones: número único, piso,
      categoría y estado (`disponible`, `en mantenimiento`). Una habitación con reservas futuras
      **no se puede dar de baja**: se bloquea y se listan esas reservas.
- [x] **R-2.3** *(2026-09-12)* Tarifa base por categoría y por noche, con moneda y vigencia
      (desde–hasta). Tanda A de HZ-12 incluida.
- [ ] **R-2.4** **Sin solapamiento de tarifas vigentes** por categoría: validación en el servidor
      **y** restricción de unicidad en la base (Tanda B de HZ-12). Requiere migración revisada.
- [ ] **R-2.5** Tarifas de temporada (alta/baja) con prioridad sobre la tarifa base cuando el rango
      cubre las fechas. Depende de **DP-02** (qué temporadas existen y qué porcentaje).
- [ ] **R-2.6** Pantalla de tarifas verificada en el navegador antiguo de recepción y en móvil.
      Tests del precio de una noche: base, temporada y sin tarifa vigente (error, nunca precio 0).

**Criterio de terminado:** la dirección carga las 24 habitaciones reales y las tarifas de la
próxima temporada desde la pantalla; no se pueden crear dos tarifas vigentes solapadas ni con doble
clic ni con dos pestañas; el precio de cualquier noche futura se calcula y se muestra; tests y
revisión en navegador antiguo hechos; visto bueno de la dirección.

## Hito 3 — Reservas con validación de disponibilidad

*Por qué acá: es la razón de ser del sistema y consume los dos hitos anteriores. Es también el
punto donde el hotel pierde plata si falla: dos huéspedes con la misma habitación la misma noche.*

**Rebanada:** búsqueda de disponibilidad + formulario de reserva + ficha del huésped · regla de
disponibilidad en el servidor y en la base · tablas de huéspedes y reservas · tests de
concurrencia.

- [ ] **R-3.1** Alta y búsqueda de huéspedes. El documento es único: si ya existe, se
      **reutiliza** la ficha en vez de duplicar.
- [ ] **R-3.2** 🔀 **Anti doble reserva — la regla central.** Una habitación no puede tener dos
      reservas activas que se solapen en noches. Se protege en **tres capas**:

      1. La pantalla solo ofrece habitaciones libres para el rango.
      2. El servidor vuelve a validar al confirmar (la disponibilidad puede haber cambiado).
      3. La base de datos lo **impide** con una restricción de exclusión sobre
         (habitación, rango de noches) para reservas no canceladas. Si dos recepcionistas
         confirman a la vez, una gana y la otra recibe "esa habitación ya no está disponible".

      > Convención de fechas: una reserva ocupa las **noches** `[entrada, salida)`. Salir el día 10
      > y entrar otro huésped el día 10 **no** es un solapamiento.
- [ ] **R-3.3** Cálculo del precio de la reserva (suma de noches con la tarifa vigente de cada una,
      R-2.5) y desglose visible antes de confirmar.
- [ ] **R-3.4** Estados de la reserva: `confirmada` → `cancelada` | `no_show` | (siguen en el
      Hito 4). Transiciones validadas en el servidor; una reserva cancelada **libera** la habitación.
- [ ] **R-3.5** Modificar fechas o habitación reutilizando la misma validación (nunca un camino
      aparte que se salte R-3.2). El alta es idempotente: un segundo envío con la misma clave de
      intento se ignora (aprendizaje de HZ-12).
- [ ] **R-3.6** Tests, incluyendo uno de **concurrencia** (dos confirmaciones simultáneas de la
      misma habitación y noches: exactamente una pasa) y un e2e del flujo "buscar → reservar".

**Criterio de terminado:** la dirección intenta reservar la misma habitación para noches
solapadas desde dos navegadores a la vez y solo una reserva queda; el borde entrada/salida del mismo
día funciona; la cancelación libera la habitación; el test de concurrencia está en CI; visto bueno
de la dirección.

## Hito 4 — Check-in y check-out

*Por qué acá: convierte una reserva en una estancia real. Necesita la reserva (Hito 3) y, al
cerrar, deja la cuenta calculada para que el Hito 5 la cobre.*

**Rebanada:** pantallas de llegadas/salidas del día · máquina de estados de la estancia · registro
de cargos · tests del flujo completo.

- [ ] **R-4.1** Pantalla "Llegadas de hoy" y check-in: verifica documento, asigna la habitación
      confirmada (o una libre de igual o mayor categoría, con motivo) y pasa la reserva a `en_casa`.
      Acompañantes hasta la capacidad máxima de la categoría; se bloquea al excederla.
- [ ] **R-4.2** **Cargos de la estancia** *(subió desde el Hito 5 en la reconciliación v3)*: noches
      consumidas + cargos extra (minibar, lavandería) registrados por recepción. Total derivado,
      nunca editable a mano.
- [ ] **R-4.3** Pantalla "Salidas de hoy" y check-out: muestra el total de la cuenta, cierra la
      estancia, pasa la habitación a `por limpiar` y deja la cuenta en estado **`por_cobrar`** o
      **`saldada`** (según haya o no pagos; ver Hito 5).
- [ ] **R-4.4** Casos borde: salida anticipada (se cobra lo consumido), llegada tardía (la reserva
      se mantiene hasta las 23:59 de la primera noche y luego pasa a `no_show`) y extensión de
      estancia (revalida disponibilidad con R-3.2).
- [ ] **R-4.5** Tests del flujo completo y e2e "reserva → check-in → cargo → check-out".

**Criterio de terminado:** la dirección recorre una estancia de 3 noches con un cargo extra y una
salida anticipada en otra; la habitación cambia de estado en cada paso; el total coincide con el
cálculo a mano; una persona de Recepción no puede editar el total; e2e en CI; visto bueno.

## Hito 5 — Pagos, anticipos y cancelación

*Por qué acá: el dinero se registra sobre cosas que ya existen (reservas y cuentas). Hacerlo antes
habría obligado a inventar datos de prueba.*

**Rebanada:** pantalla de cobros y de política de cancelación · registro de pagos y reembolsos ·
tabla de pagos append-only · tests de montos.

- [ ] **R-5.1** Registro de pagos sobre una reserva o una cuenta: monto, medio (efectivo, tarjeta en
      terminal físico, transferencia), fecha y quién cobró. **Un pago no se edita ni se borra**: se
      corrige con un contrapago (reverso) visible.
- [ ] **R-5.2** Anticipo al reservar: porcentaje configurable (decisión **DP-01**); queda como
      pago asociado y se descuenta de la cuenta en el check-out.
- [ ] **R-5.3** 🔀 **Política de cancelación.** Más de 24 h antes de la entrada: sin cargo y se
      devuelve el anticipo. **Dentro de las 24 h previas o `no_show`: se cobra una noche** (la de
      tarifa más alta del rango) y el resto se devuelve. Los cálculos viven en una sola función
      probada, no repartidos por las pantallas.
- [ ] **R-5.4** Validaciones de montos en el servidor (pago mayor al saldo, reembolso mayor a lo
      cobrado, negativos) y liquidación: una cuenta `por_cobrar` pasa a `saldada` al llegar a cero,
      sin reabrir la lógica del Hito 4.
- [ ] **R-5.5** Tests de la política con el borde exacto (23 h 59 min vs. 24 h 01 min) y e2e
      "reserva con anticipo → cancelación tardía".

**Criterio de terminado:** la dirección cancela una reserva a 30 h (devolución total) y otra a 10 h
(se cobra una noche); un pago mal cargado se corrige con reverso y ambos quedan en el historial;
una cuenta con saldo no se marca `saldada`; los importes cuadran con su planilla; visto bueno.

## Hito 6 — Reportes de ocupación

*Por qué acá: los reportes solo leen datos que los hitos anteriores ya dejaron correctos. Hacerlos
antes es medir basura.*

**Rebanada:** tablero de reportes · consultas agregadas · tests con datos conocidos.

- [ ] **R-6.1** Ocupación diaria y mensual (% ocupadas sobre las disponibles, sin las `en
      mantenimiento`), ingresos por periodo y categoría, ADR y RevPAR. La fórmula de cada uno está
      escrita en la propia pantalla.
- [ ] **R-6.2** Filtro por rango de fechas que **todas** las tarjetas respetan; si alguna no puede,
      lo avisa en pantalla (no aparenta un dato que no usó).
- [ ] **R-6.3** Reporte de cancelaciones y `no_show` con el monto retenido (consume R-5.3).
- [ ] **R-6.4** Exportación a CSV, solo Administrador. *(Si nadie la pide el primer mes: `[–]`,
      ver DEC-04.)*
- [ ] **R-6.5** Tests con un conjunto de datos fijo cuyos resultados se calcularon a mano; el
      Administrador ve el tablero y Recepción recibe 403.

**Criterio de terminado:** los números del tablero coinciden con un cálculo manual de un mes de
datos de ejemplo; ningún monto sin moneda; el filtro afecta a todas las tarjetas; visto bueno.

## Hito 7 — Hardening y despliegue

*Por qué acá: se endurece lo que el uso real prioriza, con todo lo funcional ya adentro y los
tests e2e protegiendo el despliegue.*

**Rebanada:** entorno de producción y de pruebas separados · respaldo · monitoreo · pruebas de
punta a punta en CI.

- [ ] **R-7.1** 🔀 **Ensayar el arranque en un entorno descartable y recién después crear
      producción.** Son **dos actos, no uno**. Se ejecuta el runbook de arranque tal cual está
      escrito: lo que se prueba no es que el sistema arranque, sino que **el runbook alcanza**.
      Si hace falta tocar algo que no está en la lista, eso es el hallazgo. Se corrige el runbook
      y recién entonces se crea producción.
- [ ] **R-7.2** CI también en `push` a `main`, con los 4 flujos e2e (login, reserva, check-in/out,
      cancelación) corriendo sin intervención manual.
- [ ] **R-7.3** Compatibilidad con el navegador antiguo de recepción (Tanda C de HZ-12) fijada como
      objetivo de build y comprobada en él.
- [ ] **R-7.4** **Respaldo y restauración — decisión de plata, no solo de trabajo.** Elegir una y
      anotarla en el Anexo B: (a) subir al plan con respaldos diarios y retención de 7 días; o
      (b) quedarse en el plan actual y **construir el reemplazo** (volcado programado con destino
      fuera del proveedor). En cualquiera: **una restauración de prueba, hecha una vez.**
- [ ] **R-7.5** Captura de errores y aviso al equipo; probar que un error forzado llega (hoy: cero).
- [ ] **R-7.6** Carga real: reapuntar producción a la base nueva, rotar la credencial de pruebas
      (**DEC-02**), pasar el repositorio a privado (**DEC-01**) y cargar habitaciones y tarifas reales.
- [ ] **R-7.7** Semana de acompañamiento: recepción opera en paralelo con su método actual y se
      anotan las diferencias; lo que griten los usuarios ordena el backlog.

**Criterio de terminado:** un push a `main` no puede desplegar sin tests; el ensayo de arranque se
hizo y el runbook quedó corregido; existe una restauración probada; un error forzado llega al
equipo; una semana de operación en paralelo sin diferencias bloqueantes; visto bueno de la dirección.

---

## Cómo se actualiza este documento

- Marcar casillas **al cerrar cada ítem, con fecha** — no al final del hito.
- Si un ítem cambia de hito o aparece uno nuevo, anotarlo con una línea de motivo (nunca borrar
  en silencio), como se hizo con el cálculo de cargos.
- Al cerrar cada ítem, actualizar **en el mismo cambio** su rastro en `docs/revision/hallazgos.md` y
  en la ficha del módulo. **Ésta es la lección cara de la reconciliación v3:** los registros que
  corren detrás del código hacen re-trabajar lo cerrado y sobreestimar lo abierto.
- Un ítem que se decide **no hacer** se marca `[–]` con su entrada en el Anexo B. **Una casilla
  vacía se lee como olvido.**

---

## Anexo A — Nomenclatura

### Por qué existe y qué colisionaba

Tres cosas distintas se llamaron **"D-1"** al mismo tiempo: la política de anticipos, la decisión de
qué base usan los tests y el formato de los reportes. Ya había pasado con la palabra **"fase"**, que
llegó a significar tres cosas (etapas del plan v1, hitos de v2 y tandas de correcciones) y costó
tiempo real. El barrido de la reconciliación v3 sobre `docs/` completo encontró más casos:

| Sigla | Significados que convivían |
|---|---|
| **D-1** | (a) anticipo al reservar · (b) base de datos para los tests · (c) formato de los reportes |
| **D-2** | (a) temporadas y su porcentaje · (b) segundo hotel/sede · (c) los 4 flujos e2e |
| **Fase** | (a) etapas del plan v1 · (b) hitos del plan v2 · (c) tandas de HZ-12 |

### El esquema

**Un prefijo por familia. Los números no cambian** — así `grep "R-3.2"` o `grep "DP-03"` siguen
encontrando el rastro en fichas, tests y comentarios de código.

| Familia | Prefijo | Ejemplo | Dónde se define |
|---|---|---|---|
| Ítem de este roadmap | **`R-`** | `R-3.2` | este archivo |
| **Decisión de producto** (de la dirección) | **`DP-`** | `DP-03` | [Anexo B](#anexo-b--decisiones-tomadas-con-su-disparador) |
| **Decisión de proceso/entorno** | **`DEC-`** | `DEC-02` | [Anexo B](#anexo-b--decisiones-tomadas-con-su-disparador) |
| Hallazgo de la revisión | `HZ-` | `HZ-07` | `docs/revision/hallazgos.md` |
| Deuda aplazada | `DA-` | `DA-06` | `docs/deuda-aplazada.md` |

**Reglas de escritura:**

1. **"Hito" y "tanda" nunca se usan solos.** O llevan el prefijo (`R-3.2`) o van calificados
   ("la Tanda B **de HZ-12**").
2. **Los identificadores de los planes v1 y v2 están retirados.** No se cita más `A1`…`E5`: se
   citan los `R-N.M` de acá.

### Tabla de equivalencia con los nombres viejos

**Decisiones de producto** *(estaban en `docs/plan/v2.md` §0)*

| Nuevo | Era | Qué decide |
|---|---|---|
| `DP-01` | `D-1` | Política de anticipo (¿se exige? ¿qué porcentaje?) — ✅ resuelta 2026-09-02 |
| `DP-02` | `D-2` | Temporadas y su porcentaje sobre la tarifa base |
| `DP-03` | `D-3` | Roles por defecto de Recepción y Administrador |
| `DP-04` | `D-4` | Cancelación: una noche dentro de las 24 h — ✅ **decidida**, ver Anexo B |

---

## Anexo B — Decisiones tomadas, con su disparador

> **Por qué este anexo.** Una decisión sin su motivo se relee como un descuido, y una casilla vacía
> se lee como un olvido. Cada entrada dice **qué se decidió**, **por qué**, y **qué tiene que pasar
> para revisarla**. Las que todavía no se tomaron están marcadas *(pendiente)*.

### DEC-01 — El repositorio sigue **público**, a propósito

**Decisión:** no se pasa a privado por ahora.
**Por qué:** todo lo que hay detrás es un entorno de prueba y no queda ningún secreto vigente
commiteado (la credencial que hubo apunta a un usuario que ya no existe).
**Disparador:** **antes de que exista producción con datos reales de huéspedes** (**R-7.6**): desde
ahí el código público describe una superficie viva con datos de terceros.

### DEC-02 — La credencial del administrador de pruebas es deliberadamente de pruebas

**Decisión:** existe un Administrador de pruebas cuya contraseña se comparte por canal directo.
**Por qué:** sin un administrador no se pueden crear recepcionistas, el camino más crítico y el
menos cubierto por tests.
**Regla dura:** **no vuelve a ningún documento del repo, nunca** — ni en una ficha, ni en un doc de
revisión, ni en un comentario. Fue el crítico №1 de la revisión previa.
**Disparador:** **se rota al crear producción** (**R-7.6**).

### DEC-03 — El cobro en línea con tarjeta queda **fuera de v1**

**Decisión:** v1 registra los pagos que recepción cobra en el hotel (efectivo, terminal físico,
transferencia); no hay pasarela de pago en la web.
**Por qué:** un cobro en línea multiplica el trabajo de seguridad y conciliación, y el hotel hoy
recibe las reservas por teléfono y mostrador.
**Disparador:** al cerrar el Hito 7, si la semana de acompañamiento muestra que más del 30 % de las
reservas llegan a distancia.

### DEC-04 — La exportación de reportes (R-6.4) es **opcional** *(pendiente de demanda)*

**Decisión:** se construye solo si la dirección la pide el primer mes de operación; si no, `[–]`.
**Por qué:** nadie la ha reclamado y el tablero cubre las preguntas actuales.
**Disparador:** pedido explícito de la dirección o de contabilidad.

### DP-04 — Cancelación: **se cobra una noche dentro de las 24 h** *(decidida el 2026-09-10)*

**Qué se decidió:** si la cancelación ocurre con menos de 24 h de anticipación a la entrada (o la
persona no se presenta), se cobra **una noche**, la de tarifa más alta del rango reservado; el resto
del anticipo se devuelve. Con más de 24 h, no hay cargo.
**Por qué:** cubre una habitación que ya no se alcanza a revender y es lo que espera cualquier huésped.
**Estado:** decidida, **pendiente de implementar** (R-5.3). Coordinar con R-3.4: la transición a
`cancelada` y el cálculo del cargo ocurren en la misma operación.
**Qué la revisaría:** que la dirección pida una política escalonada (p. ej., por temporada).

### DP-02 — *(pendiente)* Temporadas y su porcentaje

**Se decide antes de R-2.5:** temporadas (alta, baja, feriados) y porcentaje sobre la tarifa
base. **Anotar acá el resultado**: R-2.5, R-3.3 y los reportes de ingresos dependen de él.

### Riesgo aceptado (no es una decisión pendiente): la tarifa se congela en la reserva

Una reserva guarda el precio de cada noche **al confirmarse**; si la tarifa cambia después, las
reservas existentes **no** se recalculan. Es deliberado: se le prometió ese precio al huésped. Solo
cambia con una modificación explícita (**R-3.5**), con registro de quién y por qué.
