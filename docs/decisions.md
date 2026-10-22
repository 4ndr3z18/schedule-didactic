# Registro de Decisiones — UsachSchedule

Formato: una entrada por decisión. **Solo se agrega, no se reescribe.** Si una decisión se revierte, se agrega una nueva que la anule indicando cuál sustituye.

Estados: `Aceptada` · `Propuesta` · `Sustituida por ADR-XXX`

---

## ADR-001 — Contexto compartido entre dos desarrolladores y dos agentes

**Fecha:** 2026-10-22 · **Estado:** Aceptada

**Contexto:** El proyecto lo desarrollan dos personas en paralelo, cada una con su propio agente de IA. Un único `MEMORY.md` compartido generaba conflictos de git en todo el archivo (por su límite de 50 palabras) y riesgo de que un agente leyera estado obsoleto de otra rama.

**Decisión:** Separar el contexto en cuatro archivos:
- `AGENTS.md` — contrato técnico, versionado, cambia solo por consenso.
- `MEMORY.md` — estado compartido, ≤50 palabras, solo decisiones cerradas.
- `MEMORY.local.md` — estado personal de cada uno, **ignorado por git**.
- `docs/decisions.md` — este log, donde vive el *por qué* que no cabe en las 50 palabras.

**Consecuencias:** Menos conflictos, y la justificación de cada elección queda auditable. Cada desarrollador debe crear su propio `MEMORY.local.md` a partir de la plantilla.

---

## ADR-002 — `main` es la única fuente autoritativa

**Fecha:** 2026-10-22 · **Estado:** Aceptada

**Contexto:** Si cada agente lee `AGENTS.md` de una rama distinta, las reglas divergen y el código se vuelve incompatible (distintas librerías, distintos nombres de tabla).

**Decisión:** `AGENTS.md`, `MEMORY.md`, el esquema SQL y la configuración solo son válidos en `main`. El trabajo se hace en ramas personales (`sebastian`, `andrez`) y se integra por Pull Request con revisión del compañero.

**Consecuencias:** Antes de empezar una tarea hay que `git pull --rebase origin main`. A cambio, ambos agentes trabajan siempre con las mismas reglas.

---

## ADR-003 — `@dnd-kit` como librería de arrastrar y soltar

**Fecha:** 2026-10-22 · **Estado:** Aceptada (revisable si aparece un bloqueante)

**Contexto:** El Definition of Done exige drag & drop fluido en móvil y escritorio, con papelera activada por pulsación prolongada. La API nativa de HTML5 Drag & Drop no emite eventos táctiles en navegadores móviles.

**Decisión:** Usar `@dnd-kit/core` + `@dnd-kit/sortable`, con `PointerSensor` configurado con `activationConstraint.delay` para el gesto de pulsación prolongada, y `KeyboardSensor` para accesibilidad.

**Consecuencias:** Una dependencia adicional, a cambio de soporte táctil real sin hacks y de accesibilidad por teclado.

---

## ADR-004 — Modelo de datos del horario

**Fecha:** 2026-10-22 · **Estado:** Propuesta (pendiente de confirmar entre ambos antes de la primera migración)

**Propuesta inicial:**

| Tabla | Campos | Notas |
|---|---|---|
| `profiles` | `id` (= `auth.users.id`), `full_name`, `career`, `created_at` | Creada por trigger al registrarse. |
| `subjects` | `id`, `user_id`, `name`, `code`, `level`, `color`, `created_at` | Asignaturas personalizadas por alumno. `unique (user_id, code)`. |
| `schedule_blocks` | `id`, `user_id`, `subject_id`, `day_of_week` (1–7), `module_index` (1–N), `duration` | Bloques del calendario semanal. `unique (user_id, day_of_week, module_index)`. |

**Pendiente de definir:** cuántos módulos tiene la jornada y su duración (USACH usa bloques de 90 minutos), y si un ramo puede ocupar módulos consecutivos como una sola fila visual.

**Regla:** RLS activo en las tres tablas, con política `auth.uid() = user_id` en `SELECT`, `INSERT`, `UPDATE` y `DELETE`. Sin excepciones.

---

## ADR-005 — Nombre del producto

**Fecha:** 2026-10-22 · **Estado:** Aceptada

**Decisión:** El producto se llama **UsachSchedule** en la interfaz, documentación y nombres de componentes. `schedule-didactic` se mantiene solo como nombre del repositorio en GitHub (no se renombra para no romper clones existentes).
