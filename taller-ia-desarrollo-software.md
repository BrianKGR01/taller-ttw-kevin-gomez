# IA aplicada al desarrollo de software
## El proceso de desarrollo en la era agéntica

**Tarija Tech Week 2026 · Sala IA · Jueves 1 de octubre · 14:00**
**Expositor:** Kevin Brayan Gómez Rocha · Organizer, GDG Santa Cruz
**Formato:** taller · 30 min reales (guion pensado para 60, con versión recortada)

---

## Idea central (la frase que todos deben llevarse)

> **La IA amplifica lo que le das. Si le das claridad, multiplica claridad. Si le das ambigüedad, multiplica deuda técnica.**

El taller no enseña "a pedirle código a la IA". Enseña **el proceso**: planificar como ingeniero para que la IA pueda construir como un equipo.

**Ciclo completo (se repite como ancla visual en todo el taller):**

```
Spec funcional → Spec técnica → Reglas del juego → Roadmap por hitos → Ejecución → Dónde vive
```

**Dos públicos, un mismo proceso:**
- **Developers / estudiantes:** técnicas duras, arquitectura, tests, CI/CD.
- **No-developers que quieren construir software:** cómo pensar, qué pedir, qué no saltarse.

En cada bloque hay una nota de "si no eres dev" para que nadie se quede afuera.

---

## Tiempos

| # | Bloque | 60′ | 30′ |
|---|---|---|---|
| 0 | Portada y presentación | 2 | 1 |
| 1 | Gancho: el sistema del hotel | 4 | 3 |
| 2 | La era agéntica: vibe coding vs. ingeniería | 3 | 1 |
| 3 | Fase 1 · Spec funcional + design system | 9 | 5 |
| 4 | Fase 2 · Spec técnica + seguridad + decisiones | 9 | 4 |
| 5 | Fase 3 · Reglas del juego: AGENTS.md y tests | 10 | 6 |
| 6 | Fase 4 · Roadmap por hitos | 4 | 2 |
| 7 | Fase 5 · Ejecución y orquestación | 7 | 3 |
| 8 | Fase 6 · Dónde vive el software | 5 | 2 |
| 9 | Herramientas y ¿vale la pena pagar? | 2 | 1 |
| 10 | Caso real + cierre | 3 | 1 |
| 11 | Preguntas y contacto | 2 | 1 |
| | **Total** | **60** | **30** |

**Si vas corto de tiempo, recorta en este orden:** bloque 9 → detalle de orquestación (7) → ejemplos de prompts en vivo (3 y 4). **Nunca recortes** el bloque 5 (tests): es lo que te diferencia de YouTube.

---

## Bloque 0 · Portada y presentación (2′)

**Diapositiva 0.1 — Portada**
- Título: *IA aplicada al desarrollo de software*
- Subtítulo: *El proceso de desarrollo en la era agéntica*
- Tarija Tech Week 2026 · GDG Santa Cruz

**Diapositiva 0.2 — Quién soy**
- Kevin Brayan Gómez Rocha
- Software developer · más de 10 años construyendo software · DevSecOps, arquitectura, nube, blockchain
- Founder de **Drinks on Chain**: trazabilidad de vinos y singanis de Tarija y Cinti, de la parcela a la copa · https://www.drinksonchain.com
- Founder de **DevBro Solutions**: software factory para startups y fundadores sin equipo técnico · https://www.devbro.xyz
- Organizer de **Google Developer Group Santa Cruz** · Google Innovator
- Comunidades: Angular Bolivia, Ethereum Bolivia, Builders Bolivia

**Nota del expositor:** no leas la lista. Di una frase: *"Hago software hace más de diez años y hoy construyo casi todo con agentes de IA. Les voy a mostrar el proceso que uso de verdad, el que me permite dejar a la IA trabajando sola."*

---

## Bloque 1 · Gancho: el sistema del hotel (4′)

**Diapositiva 1.1 — La escena**
> "Llegué a Tarija y estoy esperando en un hotel. Imaginemos que es de mi familia y necesita un sistema: huéspedes, reservas, registros, check-in."

**Diapositiva 1.2 — El prompt mágico**
> *"Hazme un sistema para administrar mi hotel."*
→ En minutos tienes algo que funciona. Aplausos.

**Diapositiva 1.3 — Las preguntas incómodas** (que aparezcan una por una)
- ¿Qué pasa si dos personas reservan la misma habitación al mismo tiempo?
- ¿Quién puede ver los datos personales de los huéspedes?
- ¿Qué pasa con una reserva cancelada? ¿Y con un pago a medias?
- ¿Dónde vive el sistema? ¿Quién lo arregla cuando falle a las 3 a. m.?
- ¿Lo entiende alguien más que la IA que lo escribió?

**Diapositiva 1.4 — El remate**
> **La IA no falló. Falló la especificación.**

**Nota del expositor:** el hotel es transversal. Aclara que vale igual para una tienda, una clínica, un SaaS grande o un sistema contable. Vuelve a este ejemplo en cada fase.

---

## Bloque 2 · La era agéntica (3′)

**Diapositiva 2.1 — Vibe coding vs. ingeniería con agentes**

| Vibe coding | Ingeniería con agentes |
|---|---|
| Un prompt y a ver qué sale | Spec primero, código después |
| La IA decide todo | Tú decides, la IA ejecuta |
| Funciona hoy | Funciona y se mantiene |
| Tú vigilas cada minuto | La IA trabaja horas o días con reglas claras |

**Diapositiva 2.2 — El nombre de la industria**
- Esto se llama **spec-driven development**: la especificación es la fuente de verdad.
- Las herramientas cambian cada mes. **El proceso no.**

**Nota del expositor:** guiño a la sala. A las 15:00 hay una charla sobre construir con IA sin saber programar, y a las 16:30 una sobre AWS Kiro (spec-driven). Posiciónate como la base rigurosa que conecta con ambas.

---

## Bloque 3 · Fase 1: Spec funcional + design system (9′)

**Diapositiva 3.1 — Los clásicos no murieron**
- Tapas de libros:
  - **El Lenguaje Unificado de Modelado (UML 2.0). Guía del usuario** — Booch, Rumbaugh y Jacobson.
  - **El Proceso Unificado de Desarrollo de Software** — Jacobson, Booch y Rumbaugh.
- Los mismos tres autores: UML para modelar, el Proceso Unificado para planificar. Las bases que la IA necesita de ti.
- *"Si estudiaste desarrollo de software, conoces esto. Si no, deberías. Esto es lo que la IA necesita de ti."*

**Diapositiva 3.2 — Olvida lo técnico. Describe el negocio.**
La spec funcional responde, sin hablar de tecnología:
- **Actores:** huésped, recepcionista, administrador.
- **Casos de uso:** reservar, hacer check-in, cancelar, facturar.
- **Flujos:** *"el huésped se registra → recibe un correo de bienvenida → elige fechas → paga anticipo → recibe confirmación"*.
- **Reglas de negocio:** *"no se puede reservar una habitación ocupada"*, *"la cancelación con menos de 24 h cobra una noche"*.
- **Criterios de aceptación:** cómo sabemos que cada cosa está terminada.

**Diapositiva 3.3 — Por qué aquí fallan la mayoría de los ingenieros**
- Tú quizás tienes claro el proceso en tu cabeza. Tu equipo no. La IA tampoco.
- La IA sabe tanto que va a **rellenar los huecos con sus propias suposiciones**. Eso cuesta tokens, tiempo y rehacer trabajo.
- **Lo transversal es lo más caro de corregir:** autenticación, manejo de estados, roles y permisos, auditoría. Si un módulo aislado sale mal, lo rehaces. Si sale mal el manejo de estados, tocas todo el sistema.

**Diapositiva 3.4 — ¿Y el PRD?**
> Un PRD de una página que dice "quiero un sistema para mi hotel" no sirve. Una spec con actores, flujos, reglas y criterios de aceptación, sí.

- Bonus: la IA te genera los diagramas UML en **Mermaid**: casos de uso, estados, secuencia.

**Diapositiva 3.5 — Design system: también se planifica**
- **Tokens:** colores, tipografía, espaciados, radios, sombras.
- **Layout:** grilla, breakpoints, estructura de pantallas.
- **Componentes:** botones, formularios, tablas, modales, estados vacíos y de error.
- Un solo archivo o estructura global. **Un rebranding = cambiar tokens, no rehacer pantallas.**
- Sin esto, cada pantalla que genera la IA "inventa" su propio estilo.

**Diapositiva 3.6 — Prompt para copiar: la entrevista**
```
No escribas código. Vamos a hacer solo la especificación funcional.
Entrevístame una pregunta a la vez sobre el sistema que quiero construir:
actores, casos de uso, flujos, reglas de negocio, casos límite y criterios
de aceptación. Señálame lo que estoy dejando ambiguo.
Cuando esté completa, genérame:
1. docs/01-spec-funcional.md
2. Diagramas de casos de uso y de estados en Mermaid
3. Una lista de lo que es transversal (auth, estados, roles, auditoría)
```

**Si no eres dev:** esta fase es 100% tuya. Nadie conoce tu negocio mejor que tú.

---

## Bloque 4 · Fase 2: Spec técnica + seguridad + decisiones (9′)

**Diapositiva 4.1 — Primero: sincérate con la IA**
Dile quién eres. Cambia todo lo que te va a proponer.

**Prompt para devs con experiencia:**
```
Tengo [X] años haciendo software. Manejo [stack, nube, arquitectura].
Te voy a proponer decisiones técnicas para este sistema. Quiero que me retes:
dime si son correctas a corto y largo plazo en arquitectura, seguridad,
accesibilidad, escalabilidad y costo. No me des la razón por darla.
```

**Prompt para no-devs:**
```
No sé programar. Guíame en las decisiones técnicas de este sistema:
en qué se desarrolla, dónde vive, qué tan seguro es, cuántos usuarios
aguanta sin problemas y cuánto me va a costar por mes según el alcance
de docs/01-spec-funcional.md. Explícame cada decisión en lenguaje simple.
```

**Diapositiva 4.2 — Las preguntas obligatorias**
- ¿En qué se desarrolla? (stack)
- ¿Dónde vive? (hosting)
- ¿Qué tan seguro es?
- ¿Cuántos usuarios aguanta?
- **¿Cuánto cuesta por mes con mi alcance real?**

**Diapositiva 4.3 — Regla de oro del stack**
- La IA tiene stacks favoritos (Next, Python, a veces Rust). **No significa que sean los tuyos.**
- **Si dominas una tecnología, no la cambies.** Lo que la IA hace en Next lo puede hacer en Angular. Y tú necesitas poder **verificar** lo que hace.
- **Si no tienes stack:** elige uno popular y aburrido. La IA rinde mejor donde hay más documentación y ejemplos.
- *"Ya no estamos en los 90 cuidando cada byte de memoria."* El rendimiento importa cuando escalas y te cuesta plata, pero para el 95% de los casos, gana el stack que controlas.

**Diapositiva 4.4 — Versiones: lo último estable**
- Los modelos tienen fecha de corte de conocimiento. Por eso te proponen librerías **deprecadas**.
- Pide: *"investiga y usa la última versión estable o LTS, el estándar actual de la industria"*.
- Dale acceso a documentación actual (búsqueda web o un MCP de documentación).
- Fija versiones en el lockfile.
- Esto parece menor hasta que te toca una **migración de versiones**. Ahí ya es tarde.

**Diapositiva 4.5 — Seguridad desde el día uno, no al final**
- **Datos sensibles:** ¿qué datos guardamos? En el hotel: documentos de identidad, pagos.
- **Roles y permisos:** quién ve qué.
- **Secretos:** nunca en el repositorio ni en el chat con la IA.
- **Mini modelo de amenazas:** *"¿cómo atacaría alguien este sistema?"*
- **Si no eres dev:** basta con pedirlo. *"Aplica las mejores prácticas de seguridad desde el diseño y explícame los riesgos."*

**Diapositiva 4.6 — Cada decisión, por escrito**
- Un archivo de decisiones por módulo (ADR, *Architecture Decision Record*): qué se decidió, por qué, qué alternativas se descartaron.
- La IA lo lee en cada sesión y **no vuelve a discutir lo ya decidido**.

```
docs/decisiones/auth.md
## Decisión: sesiones con cookie httpOnly, no JWT en localStorage
## Por qué: ...
## Alternativas descartadas: ...
## Fecha y estado: aceptada
```

**Nota del expositor:** recuerda a la audiencia que esto sigue siendo planificación. *"No se me exalten. Todavía no hay una línea de código."*

---

## Bloque 5 · Fase 3: Reglas del juego (10′)

**Diapositiva 5.1 — AGENTS.md: el contrato con tus agentes**
Un archivo en la raíz del proyecto que todos los agentes leen antes de trabajar.
- **AGENTS.md** es el estándar abierto: lo leen Codex, OpenCode y otros.
- Claude Code usa **CLAUDE.md**, que puede importar tu AGENTS.md. Una sola fuente de verdad.

**Diapositiva 5.2 — Qué va dentro**
- Estándares de código y buenas prácticas.
- Git: ramas, commits convencionales, versionamiento semántico, colaboración.
- **Definición de "terminado".**
- Reglas de tests (siguiente diapositiva).
- Reglas de seguridad.
- Referencias a la spec, al design system y a las decisiones.

**Si no eres dev:** pídele a la IA que lo cree. *"Crea un AGENTS.md con las mejores prácticas y estándares actuales de desarrollo, colaboración, versionamiento, testing y seguridad para este proyecto."*

**Diapositiva 5.3 — Los tests: tu red de seguridad**
- **Tests unitarios:** cada función terminada tiene su test. Pase de datos correcto, cambios de estado correctos. En verde o no se avanza. Un proyecto grande pasa tranquilamente los 300.
- **Tests E2E (de extremo a extremo):** prueban una funcionalidad completa. Terminas el módulo de autenticación → el E2E prueba registro, encriptación de la contraseña, sesión, cierre de sesión. Todo el flujo.
- Hay más tipos de tests. Cada uno cuesta tokens y cómputo. **Más vale prevenir que lamentar.**

**Diapositiva 5.4 — Uncle Bob ya no lee código**
- Robert C. Martin, autor de *Clean Code*, publicó en X en 2026: *"I don't review code written by agents."*
- Mide en su lugar: **cobertura de tests, estructura de dependencias, complejidad ciclomática, tamaño de módulos, mutation testing.**
- El trabajo humano se movió a **la especificación inicial y las pruebas finales.**
- Generó debate: la comunidad quedó dividida.

> Captura del post: https://x.com/unclebobmartin/status/2044114698451476492

**Diapositiva 5.5 — Pero ojo: la IA puede hacer trampa**
Si la misma IA escribe el código **y** los tests, puede "arreglar" un test para que pase.
- **Los criterios de aceptación y los E2E salen de la spec, antes del código.** Tú los revisas.
- **Regla en AGENTS.md:** *"Nunca modifiques ni borres un test existente sin pedir aprobación."*
- **Automatiza lo barato:** linter, tipado estricto, análisis estático de seguridad, escaneo de dependencias.
- **Zonas de revisión humana obligatoria:** autenticación, pagos, permisos, datos personales.

> Los tests son el contrato. **La spec escribe el contrato, no la IA.**

**Diapositiva 5.6 — Plantilla mínima de AGENTS.md (para copiar)**
```markdown
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
```

---

## Bloque 6 · Fase 4: Roadmap por hitos (4′)

**Diapositiva 6.1 — Con la spec, el roadmap lo hace la IA**
- La IA coteja spec funcional, técnica y decisiones, y propone el orden.
- Puedes separarlo: frontend, backend, infraestructura, o un roadmap general para el agente principal.
- **Lo que yo hago:** un híbrido. Roadmap de frontend, roadmap de backend y uno general para el agente que orquesta.

**Diapositiva 6.2 — Hitos, no maratones**
- Cada hito es una **rebanada vertical**: una funcionalidad completa (pantalla + lógica + datos + tests) con su criterio de terminado.
- **Termina el hito → se publica → la persona que dirige el proyecto lo prueba → recién se pasa al siguiente.**
- Ventaja extra: obliga a un proyecto **modular y desacoplado**.

```
Hito 1 · Registro y login de recepcionistas      ✅ probado
Hito 2 · Alta de habitaciones y tarifas          🔄 en curso
Hito 3 · Reservas con validación de disponibilidad
Hito 4 · Check-in / check-out
Hito 5 · Reportes de ocupación
```

**Nota del expositor:** cuenta tu caso con honestidad. *"Yo dejo la IA corriendo días, pero porque tardo días o semanas en planificar. Si recién empiezas, trabaja hito por hito."*

---

## Bloque 7 · Fase 5: Ejecución y orquestación (7′)

**Diapositiva 7.1 — Ahora sí: a construir**
- **Agente principal:** lee el roadmap y coordina.
- **Subagentes:** tareas puntuales (tests, revisión de seguridad, documentación).
- **Una rama o worktree por funcionalidad:** los agentes no se pisan.
- **Archivo de progreso:** el agente anota qué hizo y qué sigue. Si se corta la sesión, retoma.
- **Presupuesto:** define cuánto estás dispuesto a gastar en tokens.

**Diapositiva 7.2 — Lo que yo uso**
- **Claude Code** y **Antigravity** (Google). Sin mezclar en un mismo proyecto.
- He probado Grok y otras. Las uso poco.

**Diapositiva 7.3 — Categoría: orquestación multi-modelo**
*"Antigravity hace las interfaces, Codex el backend, Claude orquesta."* Hoy se puede, de tres formas:

| Enfoque | Cómo funciona | Ejemplo |
|---|---|---|
| **Harness multi-modelo** | Un solo agente, eliges modelo por subagente | OpenCode (open source, 75+ proveedores) |
| **Líder que delega** | Un agente orquesta y llama a las CLIs de otros | Claude Code delegando a Codex o Gemini |
| **Corredores en paralelo** | Cada agente en su worktree, luego merge | Varios orquestadores comunitarios |

**Advertencias honestas:**
- Desde enero de 2026, la suscripción de consumidor de Claude no se puede usar en herramientas de terceros. En OpenCode, Claude va por API (pago por token).
- Muchos orquestadores son proyectos comunitarios jóvenes. Pruébalos, no los vendas como estándar.
- Revisa los términos de cada proveedor antes de automatizar suscripciones.
- Con modelos de otros países por API, piensa a dónde va el código de tu cliente.

**Diapositiva 7.4 — El remate**
> Lo que hace posible mezclar agentes de distintas empresas es la planificación. Una spec y un AGENTS.md hacen que todos trabajen con las mismas reglas.
> **Sin spec, multi-agente es multi-caos.**

---

## Bloque 8 · Fase 6: Dónde vive el software (5′)

**Diapositiva 8.1 — MCP: la IA conectada a tus servicios**
- **MCP (Model Context Protocol):** el estándar que conecta la IA con servicios externos. Después de la IA, lo mejor que nos pasó.
- La IA puede crear el proyecto en tu hosting, la base de datos, configurar variables, desplegar.

**Diapositiva 8.2 — Dos caminos**

| Camino rápido | Camino controlado |
|---|---|
| Vercel + Supabase vía MCP | Servidores propios (VPS) + CI/CD |
| Ideal para validar y para no-devs | Ideal para producto serio y control total |
| Lo usan indie hackers y founders rápidos | Más trabajo, más control, sin amarrarte a un proveedor |

**Diapositiva 8.3 — CI/CD: cada versión, al celular**
- **CI/CD:** integración continua y despliegue continuo.
- Cada hito terminado → tests → despliegue a un entorno de prueba → **notificación al celular con el enlace.**
- Pruebas el módulo nuevo. Si algo está mal, dejas tus observaciones para el siguiente ciclo.

**Diapositiva 8.4 — Mi setup (para devs, opcional)**
- **Servidor de desarrollo:** todo dockerizado, varios entornos, la IA tiene acceso aquí. Respaldos aparte, versionamiento de código y de imágenes.
- **Servidor de producción:** **ningún agente conectado.** A producción solo se llega por el pipeline.
- Regla de oro: **la IA trabaja en desarrollo. Producción no se toca a mano, ni humana ni artificial.**

**Si no eres dev:** quédate con el camino rápido, pero exige respaldos automáticos y que alguien pueda mantenerlo.

---

## Bloque 9 · Herramientas y ¿vale la pena pagar? (2′)

**Diapositiva 9.1 — El mapa de herramientas**
- **Agentes de código:** Claude Code (Anthropic), Antigravity (Google), Codex (OpenAI), Grok y modelos de otros proveedores.
- **Orquestación multi-modelo:** OpenCode y similares.
- **Despliegue:** Vercel, Supabase, VPS propios.

**Diapositiva 9.2 — ¿Vale la pena pagar?**
> Alerta de spoiler: **sí.**
- No lo pienses como gasto: **si te ahorra X horas al mes, se paga solo.**
- Los precios cambian seguido. Revisa las páginas oficiales antes de decidir.

---

## Bloque 10 · Caso real + cierre (3′)

**Diapositiva 10.1 — Esto no es teoría: Drinks on Chain**
- Plataforma de trazabilidad para vinos y singanis de **Tarija y el Valle de Cinti**.
- Cada botella con su historia verificable: parcela, bodega, vendimia, reposo. Un código en la etiqueta lo muestra.
- Construida con este proceso: spec, decisiones, AGENTS.md, tests, hitos, CI/CD.
- En pre-lanzamiento.
- Tarjetas de vista previa de enlace: https://www.drinksonchain.com · https://bodegas.drinksonchain.com

**Diapositiva 10.2 — El ciclo completo**
```
Spec funcional → Spec técnica → Reglas del juego → Roadmap por hitos → Ejecución → Dónde vive
```
> **El que planifica bien puede dejar la IA trabajando días. El que no, la tiene que vigilar minuto a minuto.**

---

## Bloque 11 · Preguntas y contacto (2′)

**Diapositiva 11.1 — Llévatelo**
- QR a esta presentación (con todas las plantillas y prompts para copiar).
- Contacto: Instagram, WhatsApp y LinkedIn (datos en `assets/contacto.md`).
- GDG Santa Cruz: únete a la comunidad.
- Tarjetas de vista previa de enlace: https://www.devbro.xyz · https://www.drinksonchain.com

---

## Estructura de carpetas recomendada (para mostrar o regalar)

```
mi-proyecto/
├── AGENTS.md                 # reglas para todos los agentes
├── CLAUDE.md                 # importa AGENTS.md
├── docs/
│   ├── 01-spec-funcional.md
│   ├── 02-design-system.md
│   ├── 03-spec-tecnica.md
│   ├── roadmap.md            # hitos con criterio de terminado
│   ├── progreso.md           # el agente anota qué hizo y qué sigue
│   └── decisiones/           # un archivo por módulo (ADR)
│       ├── auth.md
│       └── reservas.md
├── src/
└── tests/
    ├── unit/
    └── e2e/
```

