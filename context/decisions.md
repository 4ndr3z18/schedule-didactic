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

**Fecha:** 2026-10-22 · **Estado:** Propuesta (la define el backend; ver ADR-006)

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

## ADR-007 — Separar el contexto del código en `context/`

**Fecha:** 2026-10-22 · **Estado:** Aceptada

**Contexto:** El contrato, la memoria compartida y la documentación vivían sueltos en la raíz, mezclados con la configuración y, más adelante, con el código de la aplicación. Un agente que entraba al repositorio tenía que descubrir archivos dispersos (`AGENTS.md`, `MEMORY.md`, `docs/*.md`) y la raíz se volvía un índice de documentos en vez de un índice de proyecto. Además, cuando llegue el scaffold de Next.js, esos archivos competirían visualmente con `package.json`, `src/` y la configuración.

**Decisión:** Concentrar todo el contexto en `context/`:

- `context/AGENTS.md` (contrato técnico), `context/roadmap.md`, `context/contracts.md`, `context/decisions.md`, `context/MEMORY.md` y `context/MEMORY.local.example.md`.
- `context/MEMORY.local.md` sigue siendo personal y sigue ignorado por `.gitignore`.
- La raíz conserva solo `AGENTS.md`, `README.md`, `.env.example`, `.gitignore` y, próximamente, el código.
- El `AGENTS.md` de la raíz queda reducido a un **puntero**: OpenCode solo auto-carga el de la raíz, así que ese archivo lista el orden de lectura y las reglas que no se negocian, y delega el resto en `context/AGENTS.md`. Se mantiene deliberadamente corto.

**Consecuencias:** Una única carpeta que un agente puede leer de principio a fin, y una raíz que se lee como un proyecto. Todos los enlaces internos cambian de `docs/x.md` a `context/x.md`; las referencias `docs/` que quedan escritas en ADR-001 a ADR-006 son históricas y describen el estado anterior. Cada vez que se agregue documentación nueva, va en `context/`, no en la raíz.

---

## ADR-008 — Modelo de datos definitivo y jornada (cierra ADR-004)

**Fecha:** 2026-10-22 · **Estado:** Aceptada · **Sustituye a:** ADR-004 (Propuesta)

**Contexto:** ADR-004 dejó abierto el modelo y la jornada. El diagrama inicial del producto proponía un catálogo global de asignaturas, una tabla `niveles` 1–6 y una matrícula estudiante↔asignatura. Se consultó al responsable del producto: se mantiene el modelo de **asignaturas por alumno** de ADR-004, sin catálogo global ni matrícula, y se fija la jornada en **10 módulos de 90 minutos desde las 08:15, lunes a sábado**.

**Decisión:**

- Tablas: `profiles`, `subjects` (con `user_id`) y `schedule_blocks` (con `user_id` y `subject_id`). No se crean `levels` ni `student_subjects`: el nivel es un entero 1–6 validado por `check`.
- Un ramo de varios módulos se guarda como **un bloque con `duration`**, no como filas independientes.
- `subjects` tiene `unique (user_id, code)` y el código se normaliza a mayúsculas antes de guardar.
- `schedule_blocks` referencia `(subject_id, user_id)` contra `unique (id, user_id)` de `subjects`: la base impide usar la asignatura de otro alumno, además de RLS.
- Los solapamientos se impiden con una restricción de exclusión GiST sobre `int4range(module_index, module_index + duration)`, no solo con un `unique` de módulo inicial. Requiere `btree_gist`.
- Jornada: `TOTAL_MODULES = 10`, `MODULE_MINUTES = 90`, `FIRST_MODULE_START = '08:15'`, `INCLUDE_SATURDAY = true`, días 1–6. Módulos consecutivos, sin recreos modelados.
- RLS activo en las tres tablas, con `auth.uid() = user_id` (o `= id` en `profiles`) en `SELECT`, `INSERT`, `UPDATE` y `DELETE`. El rol `anon` no tiene privilegios.
- No se usa `FORCE ROW LEVEL SECURITY`: el trigger `handle_new_user` es `security definer` y necesita insertar el perfil como dueño de la tabla. El acceso por API usa `authenticated`, que sí queda sujeto a RLS.
- El límite de 24 asignaturas por alumno se aplica en la Server Action; no se impone con trigger.

**Consecuencias:** El modelo queda cerrado y las reglas críticas viven en la base, no solo en la aplicación. Si más adelante se quiere catálogo compartido de asignaturas, hace falta un ADR nuevo que migre `subjects` y agregue la matrícula. Los recreos entre módulos no están representados; si se necesitan, se cambia la constante y el cálculo de horarios en `src/lib/constants/schedule.ts`.

---

## ADR-009 — Ubicación de clientes y tipos de Supabase

**Fecha:** 2026-10-22 · **Estado:** Aceptada

**Contexto:** `roadmap.md` pedía `src/server/supabase/` con «clientes SSR y `database.types.ts` generado», pero `AGENTS.md` prohíbe que el frontend importe `src/server/supabase/*`. El cliente de navegador y los tipos los necesita el frontend, así que dejarlos en `src/server/` habría contradicho la frontera.

**Decisión:**

- `src/lib/supabase/database.types.ts`: solo tipos, importable por ambos lados.
- `src/lib/supabase/client.ts`: cliente de navegador con la clave anónima, para Client Components.
- `src/server/supabase/server.ts`, `src/server/supabase/middleware.ts` y `src/server/actions/`: backend puro.
- Mientras no exista el scaffold de Next.js ni la CLI, `database.types.ts` se mantiene escrito a mano con el formato de `supabase gen types`. Cuando el proyecto real esté conectado se regenera y se reemplaza el archivo.

**Consecuencias:** La frontera se respeta sin duplicar tipos. El riesgo de que los tipos escritos a mano se desvíen del esquema se cubre regenerándolos en cuanto la Fase 1 esté lista y el proyecto de Supabase exista.
