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

## ADR-004 — Modelo de datos y estructura de la jornada

**Fecha:** 2026-10-22 · **Estado:** Aceptada (confirmada por Sebastián; ver ADR-006)

**Jornada confirmada:**

- **9 módulos de 80 minutos**, lunes a sábado.
- Horarios: 08:15–09:35, 09:50–11:10, 11:25–12:45, 13:45–15:05, 15:20–16:40, 16:55–18:15, 18:45–20:05, 20:05–21:25, 21:25–22:45.
- Recreos: 15, 15, 60 (almuerzo), 15, 15, 30, 0 y 0 minutos. Los módulos 7, 8 y 9 van pegados.
- Un ramo puede ocupar **módulos consecutivos**: se guarda como un bloque con `duration` mayor a 1 y se dibuja como una sola tarjeta.

**Tablas:**

| Tabla | Campos | Notas |
|---|---|---|
| `profiles` | `id` (= `auth.users.id`), `full_name`, `career`, `created_at` | Creada por trigger al registrarse. |
| `subjects` | `id`, `user_id`, `name`, `code`, `level`, `color`, `created_at` | Asignaturas personalizadas por alumno. `unique (user_id, code)`. |
| `schedule_blocks` | `id`, `user_id`, `subject_id`, `day_of_week` (1–6), `module_index` (1–9), `duration` (1–9) | Bloques del calendario semanal. `unique (user_id, day_of_week, module_index)`. |

**Restricción de colisión:** el servidor debe rechazar un bloque que se solape con otro del mismo usuario y día, incluyendo los módulos que abarca `duration`. Una restricción `unique` sola no alcanza; se implementa con una función o un `EXCLUDE` sobre rangos.

**Regla:** RLS activo en las tres tablas, con política `auth.uid() = user_id` en `SELECT`, `INSERT`, `UPDATE` y `DELETE`. Sin excepciones.

---

## ADR-005 — Nombre del producto

**Fecha:** 2026-10-22 · **Estado:** Aceptada

**Decisión:** El producto se llama **UsachSchedule** en la interfaz, documentación y nombres de componentes. `schedule-didactic` se mantiene solo como nombre del repositorio en GitHub (no se renombra para no romper clones existentes).

---

## ADR-006 — Reparto frontend / backend entre los dos desarrolladores

**Fecha:** 2026-10-22 · **Estado:** Aceptada

**Contexto:** El reparto inicial era por pantallas (uno tomaba auth y base de datos, el otro el calendario), lo que dejaba a cada persona editando archivos del otro: el formulario de login es frontend, pero la acción que crea la sesión es backend; el drag & drop es frontend, pero la mutación que persiste el bloque es backend.

**Decisión:** El reparto pasa a ser por capa, con una frontera verificable por carpeta:

- **Frontend (Sebastián):** `src/app/`, `src/components/`, scaffold, Tailwind, shadcn/ui, CI.
- **Backend (Andrés):** `supabase/`, `src/server/`, `src/lib/validation/`, `middleware.ts`.
- **Compartido:** `src/lib/types/domain.ts`, `AGENTS.md`, `MEMORY.md`, `README.md` y `docs/`.

Reglas de la frontera:

1. El frontend nunca importa `src/server/supabase/*`; consume Server Actions y tipos.
2. Las Server Actions devuelven `{ ok: true, data }` o `{ ok: false, errors }`; la UI no conoce errores de Postgres.
3. Los esquemas Zod viven en `src/lib/validation/` y se usan en ambos lados, sin duplicar reglas.
4. `docs/contracts.md`, mantenido por el backend, es el puente: tipos, constantes de la jornada y firmas de las acciones.

**Consecuencias:** Cada quien puede trabajar sin esperar al otro: el backend escribe migraciones y RLS sin el scaffold de Next.js, y el frontend construye la grilla con datos mock. A cambio, el contrato (`docs/contracts.md`) se vuelve crítico: si diverge, la Fase 5 se convierte en arqueología. ADR-004 queda bajo responsabilidad del backend.

---

## ADR-007 — Una tarjeta por módulo en la grilla

**Fecha:** 2026-10-22 · **Estado:** Aceptada

**Contexto:** `schedule_blocks.duration` permite que un ramo ocupe varios módulos consecutivos. La grilla de referencia muestra cada módulo como una casilla independiente y las tarjetas que abarcaban dos módulos se leían como una sola caja, difícil de arrastrar y de ubicar.

**Decisión:** La UI expande cada bloque en una tarjeta por módulo antes de dibujar (`normalizeBlocks` en `src/lib/schedule/blocks.ts`). El backend conserva `duration`; el frontend la recibe y la representa como tarjetas consecutivas.

**Consecuencias:** Mover una tarjeta mueve un solo módulo. Si un ramo dura dos o más, sus tarjetas se mueven por separado. La Fase 5 debe decidir si un movimiento de ese tipo divide el bloque original o si se vuelve a agrupar.
