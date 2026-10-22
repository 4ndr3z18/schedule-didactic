# Contratos — Frontend / Backend

Documento puente entre las dos mitades del proyecto. **Lo mantiene el backend (Andrés)**; el frontend lo consume. Cualquier cambio se avisa en el PR antes de aplicarlo, porque rompe tipos en ambos lados.

Estado: **cerrado para la Fase 2** (2026-10-22), alineado con ADR-004 de `main`. Implementado en `supabase/migrations/`, `src/lib/validation/` y `src/server/actions/`; aplicado al proyecto remoto `ceibrnyeznqqsnkslmpw`.

---

## 1. Constantes de la jornada

Fuente única: `src/lib/schedule/constants.ts` (frontend, ADR-004). El backend las reexporta y calcula helpers en `src/lib/constants/schedule.ts`; no las duplica.

| Constante | Valor | Nota |
|---|---|---|
| `TOTAL_MODULES` | `9` | Módulos por día. |
| `MODULE_MINUTES` | `80` | Duración de cada módulo. |
| `FIRST_MODULE_START` | `'08:15'` | Inicio del módulo 1. |
| `INCLUDE_SATURDAY` | `true` | El sábado (día 6) se dibuja. |
| `DAYS` | lunes a sábado | `{ value, label, shortLabel }`, `value` 1–6. |

Horarios exactos: 08:15–09:35, 09:50–11:10, 11:25–12:45, 13:45–15:05, 15:20–16:40, 16:55–18:15, 18:45–20:05, 20:05–21:25, 21:25–22:45. Los recreos están incorporados en esos rangos. Para el encabezado de la grilla usa `getModuleTimeRange(moduleIndex)`; también existen `getModuleStartMinutes`, `getModuleEndMinutes` y `formatMinutes`.

`VISIBLE_DAYS` ya aplica `INCLUDE_SATURDAY`.

## 2. Tipos de dominio

Viven en `src/lib/types/domain.ts` y coinciden con la base de datos.

```ts
type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6;
type Level = 1 | 2 | 3 | 4 | 5 | 6; // nivel o semestre

interface StudentProfile {
  id: string;
  fullName: string;
  career: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string;      // normalizado en MAYÚSCULAS
  level: Level;
  color: string;     // clave de paleta: clay | teal | amber | olive | green | rose | blue | violet
  createdAt: string;
  updatedAt: string;
}

interface ScheduleBlock {
  id: string;
  userId: string;
  subjectId: string;
  dayOfWeek: DayOfWeek; // 1 lunes … 6 sábado
  moduleIndex: number;  // 1..9
  duration: number;     // módulos consecutivos que ocupa, 1..9
  createdAt: string;
  updatedAt: string;
}

interface Schedule {
  subjects: Subject[];
  blocks: ScheduleBlock[];
}
```

`ActionResult<T>` se define en `src/lib/types/action-result.ts` y se reexporta desde `domain.ts` para que el frontend lo importe desde un solo lugar.

## 3. Validación compartida (Zod)

Viven en `src/lib/validation/` y se reexportan desde `@/lib/validation`. El formulario y la Server Action usan el mismo esquema; no se duplican reglas.

| Esquema | Campos y reglas |
|---|---|
| `loginSchema` | `email` (trim, minúsculas, máx. 254), `password` (mín. 1). |
| `registerSchema` | `fullName` (2–80), `email`, `password` (8–72), `career` opcional (2–120). |
| `createSubjectSchema` | `name` (2–80), `code` (2–16, `[A-Za-z0-9-]`, se guarda en mayúsculas), `level` (1–6), `color` (clave de paleta, por defecto `clay`). |
| `updateSubjectSchema` | `id` + al menos uno de los campos anteriores. |
| `deleteSubjectSchema` | `id` UUID. |
| `placeBlockSchema` | `subjectId`, `dayOfWeek` (1–6), `moduleIndex` (1–9), `duration` (1–9, por defecto 1); el bloque debe caber en la jornada. |
| `moveBlockSchema` | `id`, `dayOfWeek`, `moduleIndex`. Conserva la duración actual. |
| `removeBlockSchema` | `id` UUID. |

Límites de negocio: `MAX_SUBJECTS_PER_STUDENT = 24`, `SUBJECT_COLOR_KEYS` y `DEFAULT_SUBJECT_COLOR = 'clay'` en `src/lib/constants/limits.ts`. La paleta visual (hex de fondo, borde y contraste) vive en `src/lib/schedule/palette.ts`; ambas listas de claves deben coincidir.

## 4. Server Actions

Todas viven en `src/server/actions/` y devuelven el mismo formato:

```ts
type ActionErrors = Record<string, string[]>; // campo -> mensajes en español

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: ActionErrors };
```

La clave `_form` agrupa errores generales (sesión expirada, credenciales inválidas, límite alcanzado). Las acciones reciben `input: unknown` y validan con Zod; el frontend puede pasar el objeto de React Hook Form tal cual.

| Acción | Archivo | Firma | Errores esperados (claves) |
|---|---|---|---|
| `login` | `auth.ts` | `login(input): Promise<ActionResult<void>>` | `_form`, `email`, `password` |
| `register` | `auth.ts` | `register(input): Promise<ActionResult<void>>` | `fullName`, `email`, `password`, `career`, `_form` |
| `logout` | `auth.ts` | `logout(): Promise<ActionResult<void>>` | `_form` |
| `createSubject` | `subjects.ts` | `createSubject(input): Promise<ActionResult<Subject>>` | `name`, `code` (duplicado), `level`, `color`, `_form` (límite 24) |
| `updateSubject` | `subjects.ts` | `updateSubject(input): Promise<ActionResult<Subject>>` | los anteriores + `id`, `_form` (no existe) |
| `deleteSubject` | `subjects.ts` | `deleteSubject(input): Promise<ActionResult<void>>` | `id`, `_form` (no existe) |
| `placeBlock` | `blocks.ts` | `placeBlock(input): Promise<ActionResult<ScheduleBlock>>` | `subjectId`, `dayOfWeek`, `moduleIndex` (ocupado), `duration`, `_form` |
| `moveBlock` | `blocks.ts` | `moveBlock(input): Promise<ActionResult<ScheduleBlock>>` | `id`, `dayOfWeek`, `moduleIndex` (ocupado o fuera de jornada), `_form` |
| `removeBlock` | `blocks.ts` | `removeBlock(input): Promise<ActionResult<void>>` | `id`, `_form` |
| `getSchedule` | `schedule.ts` | `getSchedule(): Promise<ActionResult<Schedule>>` | `_form` (sin sesión) |

`placeBlock` acepta `duration` opcional (por defecto 1). Un ramo de varios módulos se guarda como **un solo bloque con `duration`**, no como varios bloques independientes.

## 5. Estructura del backend

| Ruta | Contenido |
|---|---|
| `supabase/migrations/` | Esquema, RLS, triggers, restricciones y alineación con ADR-004. |
| `supabase/tests/rls.test.sql` | Pruebas pgTAP de aislamiento entre dos alumnos. |
| `src/lib/supabase/database.types.ts` | Tipos generados de la base (compartidos, solo tipos). |
| `src/lib/supabase/client.ts` | Cliente para Client Components (clave anónima). |
| `src/server/supabase/server.ts` | Cliente SSR para Server Components y acciones. |
| `src/server/supabase/middleware.ts` | Refresco de sesión y reglas de protección, listo para la Fase 5. |
| `src/server/actions/` | Server Actions de auth y CRUD. |

**Middleware:** la Fase 5 agrega el `middleware.ts` de la raíz, cuando existan `/login` y `/registro`. Hoy no se activa para no redirigir `/horario` a una ruta inexistente. Las Server Actions ya validan la sesión.

## 6. Reglas que el frontend puede asumir

- Toda acción valida la sesión en el servidor. La UI no decide permisos.
- La UI nunca ve mensajes de Postgres: solo el mapa `campo -> mensajes` en español.
- Un bloque ocupado se rechaza en el servidor **y** en la base (restricción de exclusión), no solo en el drag & drop.
- Después de cada mutación, el servidor revalida `/horario`; el frontend no manipula el estado global como fuente de verdad.
- Borrar una asignatura borra sus bloques (cascade).
- El código de asignatura es único por alumno, sin distinguir mayúsculas (se normaliza).
- El color es una clave de la paleta, no un hex libre.
- Ningún cliente anónimo puede leer las tablas.

## 7. Pendiente de definir

- Confirmación de correo en producción (en local está desactivada en `supabase/config.toml`).
- Páginas `/login` y `/registro`, y activación del middleware raíz en la Fase 5.
- Decidir si mover una tarjeta de un bloque con `duration > 1` divide el bloque o lo reagrupa (ADR-007).
